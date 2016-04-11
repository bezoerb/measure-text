(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.measureText = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":2}],2:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":3}],3:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],4:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './utils', 'debug'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./utils'), require('debug'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.utils, global.debug);
        global.index = mod.exports;
    }
})(this, function (exports, _utils, _debug) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.width = width;
    exports.maxFontSize = maxFontSize;

    var _debug2 = _interopRequireDefault(_debug);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    try {
        var ctx = document.createElement('canvas').getContext('2d');
    } catch (error) {
        (0, _debug2.default)('measure-text:init')(error.message || error);
        throw new Error('Canvas support required');
    }

    function parseOptions(options) {
        if (options && (0, _utils.isElement)(options)) {
            return { element: options };
        } else if (options && (0, _utils.isElement)(options.element)) {
            return options;
        }

        throw new Error('Missing element');
    }

    /**
     * Compute Text Metrics based for given text
     *
     * @param {string} text
     * @param {object|Element} options
     * @returns {function}
     */
    function width(text, options) {
        var debug = (0, _debug2.default)('measure-text:width');
        options = parseOptions(options);

        var style = (0, _utils.getStyle)(options);
        var styledText = (0, _utils.getStyledText)(text, style);

        ctx.font = (0, _utils.prop)(options, 'font', null) || (0, _utils.getFont)(style, options);

        var metrics = ctx.measureText(styledText);
        debug(styledText, metrics.width + 'px', 'Font declaration:', ctx.font);

        return metrics.width;
    }

    /**
     * Compute Text Metrics based for given text
    
     * @returns {function}
     */

    function maxFontSize(text, options) {
        var debug = (0, _debug2.default)('measure-text:max-font-size');
        options = parseOptions(options);

        // add computed style to options to prevent multiple expensive getComputedStyle calls
        options.style = (0, _utils.getStyle)(options);

        // simple compute function which adds the size and computes the with
        var compute = function compute(size) {
            options['font-size'] = size + 'px';
            return width(text, options);
        };

        // get max width
        var max = parseInt((0, _utils.prop)(options, 'width') || (0, _utils.prop)(options.element, 'offsetWidth', 0), 10);
        debug('Computing maxFontSize for width: ' + max);

        // start with half the max size
        var size = Math.floor(max / 2);
        var cur = compute(size);
        debug('1st round:', size + 'px', cur);

        // compute next result based on first result
        size = Math.floor(size / cur * max);
        cur = compute(size);
        debug('2nd round:', size + 'px', cur);

        // happy cause we got it already
        if (Math.ceil(cur) === max) {
            debug('Computed: ' + size + 'px');
            return size + 'px';
        }

        // go on by increase/decrease pixels
        if (cur > max && size > 0) {
            while (cur > max && size > 0) {
                cur = compute(size--);
                debug('following round:', size + 'px', cur);
            }
            debug('Computed: ' + size + 'px');
            return size + 'px';
        } else {
            while (cur < max) {
                cur = compute(size++);
                debug('following round:', size + 'px', cur);
            }
            size--;
            debug('Computed: ' + size + 'px');
            return size + 'px';
        }
    }
});

},{"./utils":5,"debug":1}],5:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'debug'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('debug'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.debug);
        global.utils = mod.exports;
    }
})(this, function (exports, _debug) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getFont = getFont;
    exports.isCSSStyleDeclaration = isCSSStyleDeclaration;
    exports.canGetComputedStyle = canGetComputedStyle;
    exports.isElement = isElement;
    exports.getStyle = getStyle;
    exports.getStyledText = getStyledText;
    exports.prop = prop;

    var _debug2 = _interopRequireDefault(_debug);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    /**
     * Map css styles to canvas font property
     *
     * font: font-style font-variant font-weight font-size/line-height font-family;
     * http://www.w3schools.com/tags/canvas_font.asp
     *
     * @param {CSSStyleDeclaration} style
     * @param {object} options
     * @returns {string}
     */
    function getFont(style, options) {
        var debug = (0, _debug2.default)('measure-text:getFont');
        var font = [];

        var fontWeight = prop(options, 'font-weight', style.getPropertyValue('font-weight'));
        debug(fontWeight);
        if (['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'].indexOf(fontWeight) !== -1) {
            font.push(fontWeight);
        }

        var fontStyle = prop(options, 'font-style', style.getPropertyValue('font-style'));
        if (['normal', 'italic', 'oblique'].indexOf(fontStyle) !== -1) {
            font.push(fontStyle);
        }

        var fontVariant = prop(options, 'font-variant', style.getPropertyValue('font-variant'));
        if (['normal', 'small-caps'].indexOf(fontVariant) !== -1) {
            font.push(fontVariant);
        }

        var fontSize = prop(options, 'font-size', style.getPropertyValue('font-size'));
        var fontSizeValue = parseFloat(fontSize);
        var fontSizeUnit = fontSize.replace(fontSizeValue, '');
        switch (fontSizeUnit) {
            case 'rem':
            case 'em':
                fontSizeValue *= 16;
                break;
            case 'pt':
                fontSizeValue /= .75;
                break;
        }

        font.push(fontSizeValue + 'px');

        var fontFamily = prop(options, 'font-family', style.getPropertyValue('font-family'));
        font.push(fontFamily);

        return font.join(' ');
    }

    function isCSSStyleDeclaration(val) {
        return val && typeof val.getPropertyValue === 'function';
    }

    function canGetComputedStyle(el) {
        return el && el.style && typeof window !== 'undefined' && typeof window.getComputedStyle === 'function';
    }

    /**
     * Returns true if it is a DOM element
     *
     * @param o
     * @retutns {bool}
     */

    function isElement(o) {
        return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === "object" ? o instanceof HTMLElement : //DOM2
        o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
    }

    /**
     * Get style declaration if available
     *
     * @returns {CSSStyleDeclaration}
     */
    function getStyle(options) {
        if (isCSSStyleDeclaration(options.style)) {
            return options.style;
        }

        var el = options && isElement(options.element) && options.element;
        if (canGetComputedStyle(el)) {
            return window.getComputedStyle(el, prop(options, 'pseudoElt', null));
        }

        return { getPropertyValue: function getPropertyValue() {
                return '';
            } };
    }

    /**
     * get styled text
     *
     * @param {string} text
     * @param {CSSStyleDeclaration} style
     * @returns {string}
     */
    function getStyledText(text, style) {
        switch (style.getPropertyValue('text-transform')) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            default:
                return text;
        }
    }

    function prop(src, attr, defaultValue) {
        return src && typeof src[attr] !== 'undefined' && src[attr] || defaultValue;
    }
});

},{"debug":1}]},{},[4])(4)
});