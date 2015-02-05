# foggy

> spy, stub library for generators running on [co](https://github.com/tj/co).

## Installation

Foggy require Generator Feature enabled environment, which could run `co` library. **Node(>=0.11.13)** and **[iojs](https://iojs.org/)**  are ok for foggy. So please remember enable harmony features.

__Install__

```bash
$ npm install foggy
```

## Spy

### Quike Start

```js
var foggy = require('foggy');
var co = require('co');

var context = {
  generator: function* () {
    return yeild Promise.resolve(true);
  }
};

var spy = foggy.spy(context, 'generator');
co(context.generator).then(function (value) {
  console.log(value); // true
  console.log(spy.called); // true
});
```

### Create a spy

Create a spy by `foggy.spy()` method:

#### Anonymous spy

Create a anonymous spy.

```js
var spy = foggy.spy();
```

#### Spy on provided generator

Simply pass the generator in first argument.

```js
var spy = foggy.spy(generator);
```

#### Spy on object's generator

Create a proxy generator to replace `object.generator` with same return value. `spy.reset()` method could replace the original generator back.

```js
var object = { 
  generator: function* () { 
    /* yields and return */ 
  } 
};

var spy = foggy.spy(object, 'generator');
```

### Spy API

One spy that contains properties / methods listed as below:

#### calledCount

The number of recorded calls.

#### called

return true if the spy was called at least once.

#### calledOnce

return true if the spy was called exactly once.

#### calledTwice

return true if the spy was called exactly twice.

#### calledThrice

return true if the spy was called exactly thrice.

#### getCall(idx)

return the nth call object, which combines the informations of that generator call.

```js
var gen = function* (obj) { return obj; };
var spy = foggy.spy(gen);

co.wrap(spy)({ test: 1 }).then(function () {
  console.log(spy.getCall(0) === spy.firstCall); // true
  console.log(spy.getCall(0).calledWith({ test: 1 })); // true
});
```

#### firstCall

return the first call.

#### secondCall

return the second call

#### thirdCall

return the third call

#### calledWith

*TODO*

### Call API

one call object's properties / methods:

#### calledWith(arg1[, arg2, ...])

Returns true if the call was called with the provided arguments.

```js
var gen = function* (obj) { return obj; };
var spy = foggy.spy(gen);
var arg0 = {}, arg1 = [];

co.wrap(spy)(arg0, arg1).then(function () {
  console.log(spy.firstCall.calledWith(arg0, arg1)); // true
  console.log(spy.firstCall.calledWith(arg1, arg0)); // false
});
```

#### thisValue

Returns the `this` value for this generator call.

```js
var context = { gen: function* (obj) { return obj; } };
var spy = foggy.spy(context, 'gen');

co(spy).then(function () {
  console.log(spy.firstCall.thisValue === context); // true
});
```

#### returnValue

returns the "return value" for the generator's result.

```js
var gen = function* (a, b) { return a + b; };
var spy = foggy.spy(gen);

co.wrap(spy)(1, 2).then(function () {
  console.log(spy.firstCall.returnValue); // 3
});
```

## Stub

### Quick Start

```js
var foggy = require('foggy');
var co = require('co');

var context = {
  generator: function* () {
    return yield Promise.resolve(true);
  }
};

var stub = foggy.stub(context, 'generator').returns(1);
co(context.generator).then(function(val) {
  console.log(val); // 1
});
```

### Create a stub

Create a stub by `foggy.stub()` method:

#### Anonymous stub

Create an anonymous stub.

```js
var stub = foggy.stub();
```

#### Stub on object's generator

Create a stub generator to replace `object.generator`. `stub.reset()` method could replace the original generator back.

```js
var object = { 
  generator: function* () { 
    /* yields and return */ 
  } 
};

var stub = foggy.stub(object, 'generator');
```

### Stub API

One stub generator contains properties / methods listed as below:

#### returns(value)

make stub return a provided `value` which could be any object. If empty, it would return `undefined` by default.

```js
var stub = foggy.stub().returns(100);
co(stub).then(console.log); // 100
```

#### throws(err)

make stub throw a provided `err` which could be any object. If empty, it would throws an `Error` object.

```js
var stub = foggy.stub().throws(100);
co(stub).catch(console.error); // 100
```

#### calls(anotherGenerator)

make stub return value from another generator.

```js
var context = { 
  gen: function* () { 
    return 0; 
  }
};

var replacement = function* () { 
  return 1; 
};

var stub = foggy.stub(context, 'gen').calls(replacement);
co(stub).then(console.log); // 1;
```

#### onCall(index)

configure stub for a specific call.

```js
var context = { 
  gen: function* () { 
    return 0; 
  }
};

var stub = foggy.stub(context, 'gen');
stub.onCall(0).returns(1);
stub.onCall(1).returns(2);

co(stub).then(console.log); // 1
co(stub).then(console.log); // 2
co(stub).then(console.log); // undefined
```

#### onFirstCall

configure stub for first call.

#### onSecondCall

configure stub for second call

#### onThirdCall

configure stub for third call

#### withArgs(arg1[, arg2 ... ])

configure stub for a specific arguments.

```js
var stub = foggy.stub().returns(10);
stub.withArgs(1, 2).returns(100);

co.wrap(stub)(2, 1).then(console.log); // 10
co.wrap(stub)(1, 2).then(console.log); // 100
```

#### reset()

reset a stub which would replace the original generator back on the object.

```js
var obj = {
  generator: function* () {
    return 0;
  }
};

var stub = foggy.stub(obj, 'generator').returns(1);
co(obj.generator).then(function(val) {
  console.log(val); // 1
  stub.reset();

  co(obj.generator).then(function(resetedReturnValue) {
    console.log(resetedReturnValue); // 0
  });
});
```

## Mock

*TODO*

## License

> The MIT License (MIT)
>
> Copyright (c) 2015 Wang Qiu
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
