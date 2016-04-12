# measure-text
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![Download][dlcounter-image]][dlcounter-url]

> In-memory text measurement using canvas

## Features

* Compute text width
* Compute max font-size to fit into element

## Installation

If you're using node, you can run `npm install bezoerb-measure-text`.

measure-text is also available via [Bower](https://github.com/bower/bower) (`bower install measure-text`)

Alternatively if you just want to grab the file yourself, you can download either the current stable [production version][min] or the [development version][max] directly.

[min]: https://raw.github.com/bezoerb/measure-text/master/dist/measure-text.min.js
[max]: https://raw.github.com/bezoerb/measure-text/master/dist/measure-text.js

## Setting it up

measure-text supports AMD (e.g. RequireJS), CommonJS (e.g. Node.js) and direct usage (e.g. loading globally with a &lt;script&gt; tag) loading methods.
You should be able to do nearly anything, and then skip to the next section anyway and have it work. Just in case though, here's some specific examples that definitely do the right thing:

### CommonsJS (e.g. Node)

measure-text needs some browser environment to run.
```javascript
import import * as measureText from 'bezoerb-measure-text';

measureText.width('unicorns',document.querySelector('h1'));
```

### AMD (e.g. RequireJS)

```javascript
define(['measure-text'], function(measureText) {
   measureText.width('unicorns',document.querySelector('h1'));
});
```

### Directly in your web page:

```html
<script src="measure-text.min.js"></script>
<script>
measureText.width('unicorns',document.querySelector('h1'));
</script>
```


## API

#### measureText.width(text, [element | options])
Compute text width.

#### measureText.maxFontSize(text, [element | options])
Compute max fontsize to fit element.

### text

Type: `string`<br>
Default: ''

Some text to measure

### options

##### element

Type: `Element`<br>
Default: `undefined`

The element used to fetch styles from.

##### font-weight

Type: `string`<br>
Default: `400`<br>
Allowed: `normal`, `bold`, `bolder`, `lighter`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`

Takes precedence over computed element style. Default value is set when no element is available.

##### font-style

Type: `string`<br>
Default: `normal`
Allowed: `normal`, `italic`, `oblique`

Takes precedence over computed element style. Default value is set when no element is available.

##### font-variant

Type: `string`<br>
Default: `normal`
Allowed: `normal`, `small-caps`

Takes precedence over computed element style. Default value is set when no element is available.

##### font-size

Type: `string`<br>
Default: `16px`

Takes precedence over computed element style. Default value is set when no element is available.

##### font-family

Type: `string`<br>
Default: `Helvetica, Arial, sans-serif`

Takes precedence over computed element style. Default value is set when no element is available.

##### width

Type: `string`<br>
Default: `undefined`

Used for `getMaxFontSize`
Takes precedence over element offsetWidth.

## License
Copyright (c) 2016 Ben Zörb
Licensed under the [MIT license](http://bezoerb.mit-license.org/).

[npm-url]: https://npmjs.org/package/bezoerb-measure-text
[npm-image]: https://badge.fury.io/js/bezoerb-measure-text.svg

[travis-url]: https://travis-ci.org/bezoerb/measure-text
[travis-image]: https://secure.travis-ci.org/bezoerb/measure-text.svg?branch=master

[depstat-url]: https://david-dm.org/bezoerb/measure-text
[depstat-image]: https://david-dm.org/bezoerb/measure-text.svg

[dlcounter-url]: https://www.npmjs.com/package/measure-text
[dlcounter-image]: https://img.shields.io/npm/dm/measure-text.svg






## Usage


```html
<h1></h1>
<script src="measure-text.js"></script>
<script>
var h1 = document.querySelector('h1');
measureText.width('unicorns',h1);
// -> 37.7978515625
</script>
```


## License

MIT © [Ben Zörb](http://sommerlaune.com)
