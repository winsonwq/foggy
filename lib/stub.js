var _ = require('lodash');

const ON_CALL = Symbol('ON_CALL');
const WITH_ARGS = Symbol('WITH_ARGS');

function stub() {
  return createStub();
}

function createStub(returnValue, throws) {

  function* stubProxyGenerator() {
    stubProxyGenerator.calledCount++;
    if (throws) { throw throws; }

    var args = _.toArray(arguments);
    var condition = stubProxyGenerator.findMatchedCondition(stubProxyGenerator.calledCount, args);
    var retValue = returnValue;

    if (condition) {
      if (condition.throwsValue) {
        throw condition.throwsValue; 
      }
      retValue = condition.returnValue;
    }

    return retValue;
  };

  Object.defineProperties(stubProxyGenerator, {

    conditions: {
      value: []
    },

    calledCount: {
      writable: true,
      value: 0
    },

    calls: {
      value: function (idx) {
        var call = this.conditions.filter((cond) => cond.type === ON_CALL)[idx];
        if (!call) {
          call = this.createCondition(ON_CALL, (calledCount) => { return calledCount == idx + 1; });
          this.conditions.push(call);
        }

        return call;
      }
    },

    onCall: {
      value: (idx) => { return this.calls(idx); }
    },

    onFirstCall: {
      get: () => { return this.calls(0); }
    },

    onSecondCall: {
      get: () => { return this.calls(1); }
    },

    onThirdCall: {
      get: () => { return this.calls(2); }
    },

    withArgs: {
      value: function () {
        var args = _.toArray(arguments);
        var condition = this.createCondition(WITH_ARGS, (calledCount, argsFromGenerator) => { return _.isEqual(args, argsFromGenerator); });
        this.conditions.push(condition);

        return condition;
      }
    },

    returns: {
      value: function (returnValue) {
        return createStub(returnValue);
      }
    },

    throws: {
      value: function (throws) {
        return createStub(undefined, throws || new Error);
      }
    },

    createCondition: {
      value: function (conditionType, predicate) {
        return {
          type: conditionType,
          predicate: predicate,
          returnValue: undefined,
          throwsValue: undefined,
          returns: function (returnValue) {
            this.returnValue = returnValue;
          },
          throws: function (throwsValue) {
            this.throwsValue = throwsValue;
          }
        };
      }
    },

    findMatchedCondition: {
      value: function (calledCount, args) {
        var matchedConditions = this.conditions.filter((condition) => { return condition.predicate(calledCount, args); });
        return matchedConditions[matchedConditions.length - 1];
      }
    }
  });

  return stubProxyGenerator;
}

module.exports = stub;
