# foggy

> spy, stub for ES6 generator based on [co](https://github.com/tj/co)

## Installation

```bash
$ npm install foggy
```

## Spy

### Quike Start

```js
var foggy = require('foggy');

var context = {
  generator: function* () {
    return yeild Promise.resolve(true);
  }
};

var spyGen = foggy.spy(context, 'generator');
co(context.generator).then(function (value) {
  console.log(value); // true
  console.log(spyGen.called); // true
});
```

### Create a spy

```js
var spyGen = foggy.spy(_context_, _generatorName_);
```

