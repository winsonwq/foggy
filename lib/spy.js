var co = require('co');
var _ = require('lodash');

function isGenerator(generator) {
  return generator && generator.constructor.name === 'GeneratorFunction';
}

function getSourceGenerator(context, generatorName) {
  if (context) {
    if (isGenerator(context)) {
      return context;
    } else if (isGenerator(context[generatorName])) {
      return context[generatorName];
    }
  } else if (context === undefined && generatorName === undefined) {
    return function* () {};
  }
}

function getContext(context) {
  return isGenerator(context) ? undefined : context;
}

function setProxyExtentions(proxyGenerator, context, generatorName, gen) {

  Object.defineProperties(proxyGenerator, {

    calls: {
      value: []
    },

    context: {
      value: context
    },

    sourceGenerator: {
      value: gen
    },

    generatorName: {
      value: generatorName
    },

    calledCount: {
      get: function() { return this.calls.length }
    },

    called: {
      get: function() { return this.calls.length > 0; }
    },

    calledOnce: {
      get: function() { return this.calledCount === 1; }
    },

    calledTwice: {
      get: function() { return this.calledCount === 2; }
    },

    calledThrice: {
      get: function() { return this.calledCount === 3; }
    },

    firstCall: {
      get: function() { return this.getCall(0); }
    },

    secondCall: {
      get: function() { return this.getCall(1); }
    },

    thirdCall: {
      get: function() { return this.getCall(2); }
    },

    contextIsNotGenerator: {
      get: function() { return !!this.context && !isGenerator(this.context); }
    },

    getCall: {
      value: function (idx) { return this.calls[idx]; }
    },

    calledEventHandler: {
      value: function (args, returnValue, thisValue) {
        this.calls.push(createCall(args, returnValue, thisValue));
      }
    },

    setProxyOn: {
      value: function () {
        if (this.contextIsNotGenerator) {
          this.context[this.generatorName] = this;
        }
      }
    },

    reset: {
      value: function () {
        this.calls.length = 0;
        if (this.contextIsNotGenerator) {
          this.context[this.generatorName] = this.sourceGenerator;
        }
      }
    }

  });
}

function createSpyProxy(context, generatorName, gen) {

  function* proxyGenerator() {
    var args = [].slice.call(arguments);
    var returnValue = yield co.wrap(gen).apply(context, args);
    proxyGenerator.calledEventHandler(args, returnValue, context);

    return returnValue;
  }

  setProxyExtentions(proxyGenerator, context, generatorName, gen);
  proxyGenerator.setProxyOn();

  return proxyGenerator;
}

function createCall(args, returnValue, thisValue) {
  return {
    args: args,
    returnValue: returnValue,
    thisValue: thisValue,
    calledWith: function() { return _.isEqual(this.args, _.toArray(arguments)); }
  };
}

function spy(context, generatorName) {
  var calls = [];
  var sourceGenerator = getSourceGenerator(context, generatorName);
  if (!sourceGenerator) throw new Error('invalid generator.');

  return createSpyProxy(getContext(context), generatorName, sourceGenerator);
}

module.exports = spy;
