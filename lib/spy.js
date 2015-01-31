var co = require('co');
var _ = require('lodash');

function arguments2array(_arguments) {
  return [].slice.call(_arguments);
}

function createSpyProxy(gen, calledEventHandler) {
  return function* () {
    var args = [].slice.call(arguments);
    var returnValue = yield co.wrap(gen).apply(this, args);
    calledEventHandler && calledEventHandler(args, returnValue, this);

    return returnValue;
  }
}

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
  }
}

function getContext(context) {
  return isGenerator(context) ? undefined : context;
}

function Spy(context, generatorName) {
  this.calls = [];
  this.sourceGenerator = getSourceGenerator(context, generatorName);
  if (!this.sourceGenerator) throw new Error('invalid generator.');

  this.context = getContext(context);
  this.generatorName = generatorName;

  this.proxy = createSpyProxy(this.sourceGenerator, this.calledEventHandler.bind(this)).bind(this.context);
  // set proxy to context
  this.setProxyOn();
}

Spy.prototype = {
  constructor: Spy,
  calledEventHandler: function (args, returnValue, thisValue) {
    this.calls.push(new Call(args, returnValue, thisValue));
  },
  get calledCount() {
    return this.calls.length;
  },
  get called() {
    return this.calledCount > 0;
  },
  get calledOnce() {
    return this.calledCount === 1;
  },
  get calledTwice() {
    return this.calledCount === 2;
  },
  get calledThrice() {
    return this.calledCount === 3;
  },
  get firstCall() {
    return this.getCall(0);
  },
  get secondCall() {
    return this.getCall(1);
  },
  get thirdCall() {
    return this.getCall(2);
  },
  get contextIsNotGenerator() {
    return !!this.context && !isGenerator(this.context);
  },
  getCall: function (idx) {
    return this.calls[idx];
  },
  reset: function() {
    this.calls.length = 0;
    if (this.contextIsNotGenerator) {
      this.context[this.generatorName] = this.sourceGenerator;
    }
  },
  setProxyOn: function () {
    if (this.contextIsNotGenerator) {
      this.context[this.generatorName] = this.proxy;
    }
  }
};

function Call(args, returnValue, thisValue) {
  this.args = args;
  this.returnValue = returnValue;
  this.thisValue = thisValue;
}

Call.prototype = {
  constructor: Call,
  calledWith: function () {
    var args = arguments2array(arguments);
    return _.isEqual(this.args, args);
  }
};

module.exports = (context, generatorName) => { return new Spy(context, generatorName); };
