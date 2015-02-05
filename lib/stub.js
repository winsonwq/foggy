var _ = require('lodash');
var co = require('co');

const ON_CALL = Symbol('ON_CALL');
const WITH_ARGS = Symbol('WITH_ARGS');

function stub(context, generatorName) {
  var sourceGenerator = context ? context[generatorName] : undefined;
  if (sourceGenerator && !isGenerator(sourceGenerator)) throw new Error('invalid generator.');

  return createStub.call(context, generatorName, sourceGenerator);
}

function isGenerator(gen) {
  try {
    return gen.constructor.name === 'GeneratorFunction';
  } catch(ex) {
    return false;
  }
}

function createStub(generatorName, sourceGenerator, returnValue, throws) {

  var context = this;

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

    if (typeof retValue === 'function') {
      retValue = retValue.apply(context, args);
    }

    return retValue;
  };

  Object.defineProperties(stubProxyGenerator, {

    context: {
      value: context
    },

    sourceGenerator: {
      value: sourceGenerator
    },

    conditions: {
      value: []
    },

    calledCount: {
      writable: true,
      value: 0
    },

    callList: {
      value: function (idx) {

        var call = this.conditions.filter(function(cond) { return cond.type === ON_CALL; })[idx];

        if (!call) {
          call = this.createCondition(ON_CALL, function(calledCount) { return calledCount == idx + 1; });
          this.conditions.push(call);
        }

        return call;
      }
    },

    onCall: {
      value: function(idx) { return this.callList(idx); }
    },

    onFirstCall: {
      get: function() { return this.callList(0); }
    },

    onSecondCall: {
      get: function() { return this.callList(1); }
    },

    onThirdCall: {
      get: function() { return this.callList(2); }
    },

    withArgs: {
      value: function () {
        var args = _.toArray(arguments);
        var condition = this.createCondition(WITH_ARGS, function(calledCount, argsFromGenerator) {
          return _.isEqual(args, argsFromGenerator);
        });
        this.conditions.push(condition);

        return condition;
      }
    },

    returns: {
      value: function (returnValue) {
        return createStub.call(this.context, generatorName, sourceGenerator, returnValue);
      }
    },

    returnsThis: {
      value: function() {
        return createStub.call(this.context, generatorName, sourceGenerator, context);
      }
    },

    calls: {
      value: function(replaceGen) {
        return createStub.call(this.context, generatorName, sourceGenerator, co.wrap(replaceGen));
      }
    },

    throws: {
      value: function (throws) {
        return createStub.call(this.context, generatorName, sourceGenerator, undefined, throws || new Error);
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
          },
          calls: function(replaceGen) {
            this.returns(co.wrap(replaceGen));
          },
          returnsThis: function() {
            this.returns(context);
          }
        };
      }
    },

    findMatchedCondition: {
      value: function (calledCount, args) {
        var matchedConditions = this.conditions.filter(function(condition) { 
          return condition.predicate(calledCount, args); 
        });
        return matchedConditions[matchedConditions.length - 1];
      }
    },

    setProxyOn: {
      value: function () {
        if (this.sourceGenerator) {
          this.context[generatorName] = this;
          return true;
        } else {
          return false;
        }
      }
    },

    reset: {
      value: function() {
        if (this.sourceGenerator) {
          this.context[generatorName] = this.sourceGenerator;
          return true;
        } else {
          return false;
        }
      }
    }
  });

  stubProxyGenerator.setProxyOn();

  return stubProxyGenerator;
}

module.exports = stub;
