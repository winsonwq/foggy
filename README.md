# foggy

> spy, stub library for generators running on [co](https://github.com/tj/co). You may know [sinon](http://sinonjs.org/)

## Installation

Foggy require Generator Feature enabled environment, which could run `co` library. **Node** in harmony mode (>= 0.11) and **[iojs](https://iojs.org/)** are ok for foggy.

```bash
$ npm install foggy
```

----------

## Spy

### Quike Start

```js
var foggy = require('foggy');

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

One spy object contains properties / methods listed as below:

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
var spy = exports.spy(gen);

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
  console.log(spy.firstCall.calledWith(arg1, arg0)); // true
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
var spy = exports.spy(gen);

co.wrap(spy)(1, 2).then(function () {
  console.log(spy.firstCall.returnValue); // 3
});
```

## Stub

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
