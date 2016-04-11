# measure-text [![Build Status](https://travis-ci.org/bezoerb/measure-text.svg?branch=master)](https://travis-ci.org/bezoerb/measure-text)

> In-Memory text measurement using canvas *alpha*


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



## API

### measureText.width(text, element, [options])

#### text

Type: `string`

The text to measure

#### element

Type: `HTMLElement`

The HTML element which ashould be checked

#### options

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.



## License

MIT © [Ben Zörb](http://sommerlaune.com)
