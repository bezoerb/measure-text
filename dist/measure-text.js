(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.measureText = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.index = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    Object.defineProperty(exports, '__esModule', { value: true });

    /* eslint-env es6, browser */
    var DEFAULTS = {
        'font-size': '16px',
        'font-weight': '400',
        'font-family': 'Helvetica, Arial, sans-serif'
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
        var font = [];

        var fontWeight = prop(options, 'font-weight', style.getPropertyValue('font-weight'));
        if (['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'].indexOf(fontWeight.toString()) !== -1) {
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
        // eslint-disable-next-line default-case
        switch (fontSizeUnit) {
            case 'rem':
            case 'em':
                fontSizeValue *= 16;
                break;
            case 'pt':
                fontSizeValue /= 0.75;
                break;

        }

        font.push(fontSizeValue + 'px');

        var fontFamily = prop(options, 'font-family', style.getPropertyValue('font-family'));
        font.push(fontFamily);

        return font.join(' ');
    }

    /**
     * check for CSSStyleDeclaration
     *
     * @param val
     * @returns {bool}
     */
    function isCSSStyleDeclaration(val) {
        return val && typeof val.getPropertyValue === 'function';
    }

    /**
     * check wether we can get computed style
     *
     * @param el
     * @returns {bool}
     */
    function canGetComputedStyle(el) {
        return el && el.style && typeof window !== 'undefined' && typeof window.getComputedStyle === 'function';
    }

    /**
     * check for DOM element
     *
     * @param el
     * @retutns {bool}
     */
    function isElement(el) {
        return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object' ? el instanceof HTMLElement : el && (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' && el !== null && el.nodeType === 1 && typeof el.nodeName === 'string';
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
        return {
            getPropertyValue: function getPropertyValue(key) {
                return prop(options, key);
            }
        };
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

    /**
     * Get property from src
     *
     * @param src
     * @param attr
     * @param defaultValue
     * @returns {*}
     */
    function prop(src, attr, defaultValue) {
        return src && typeof src[attr] !== 'undefined' && src[attr] || defaultValue;
    }

    /**
     * Normalize options
     *
     * @param options
     * @returns {*}
     */
    function parseOptions(options) {
        // no option set
        if (isElement(options)) {
            return { element: options };
        }

        // normalize keys (fontSize => font-size)
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
            Object.keys(options).forEach(function (key) {
                var dashedKey = key.replace(/([A-Z])/g, function ($1) {
                    return '-' + $1.toLowerCase();
                });
                options[dashedKey] = options[key];
            });
        }

        // don't set defaults if we got an element
        if (options && isElement(options.element)) {
            return options;
        }

        return Object.assign({}, DEFAULTS, options || {});
    }

    /**
     * Compute Text Metrics based for given text
     *
     * @param {string} text
     * @param {object|Element} options
     * @returns {function}
     */
    function width(text, options) {
        options = parseOptions(options);

        var style = getStyle(options);
        var styledText = getStyledText(text, style);

        var ctx = void 0;
        try {
            ctx = document.createElement('canvas').getContext('2d');
            ctx.font = prop(options, 'font', null) || getFont(style, options);
        } catch (err) {
            throw new Error('Canvas support required');
        }

        if (options.multiline) {
            return computeLinebreaks(styledText, Object.assign({}, options, { style: style })).reduce(function (res, text) {
                return Math.max(res, ctx.measureText(text).width);
            }, 0);
        }

        return ctx.measureText(styledText).width;
    }

    /**
     * compute lines of text with automatic word wraparound
     * element styles
     *
     * @param text
     * @param options
     * @returns {*}
     */
    function computeLinebreaks(text, options) {
        options = parseOptions(options);

        var style = getStyle(options);
        // get max width
        var max = parseInt(prop(options, 'width') || prop(options.element, 'offsetWidth', 0) || style.getPropertyValue('width'), 10);
        var delimiter = prop(options, 'delimiter', ' ');

        var styledText = getStyledText(text, style);
        var words = styledText.split(delimiter);

        if (words.length === 0) {
            return 0;
        }

        var ctx = void 0;
        try {
            ctx = document.createElement('canvas').getContext('2d');
            ctx.font = prop(options, 'font', null) || getFont(style, options);
        } catch (err) {
            throw new Error('Canvas support required');
        }

        var lines = [];
        var line = words.shift();

        words.forEach(function (word, index) {
            var _ctx$measureText = ctx.measureText(line + delimiter + word),
                width = _ctx$measureText.width;

            if (width <= max) {
                line += delimiter + word;
            } else {
                lines.push(line);
                line = word;
            }

            if (index === words.length - 1) {
                lines.push(line);
            }
        });

        if (words.length === 0) {
            lines.push(line);
        }

        return lines;
    }

    /**
     * Compute height from textbox
     *
     * @param text
     * @param options
     * @returns {number}
     */
    function height(text, options) {
        options = parseOptions(options);
        var style = getStyle(options);
        var lineHeight = parseInt(prop(options, 'line-height') || style.getPropertyValue('line-height'), 10);

        return computeLinebreaks(text, Object.assign({}, options, { style: style })).length * lineHeight;
    }

    /**
     * Compute Text Metrics based for given text
    
     * @returns {function}
     */

    function maxFontSize(text, options) {
        options = parseOptions(options);

        // add computed style to options to prevent multiple expensive getComputedStyle calls
        options.style = getStyle(options);

        // simple compute function which adds the size and computes the with
        var compute = function compute(size) {
            options['font-size'] = size + 'px';
            return width(text, options);
        };

        // get max width
        // get max width
        var max = parseInt(prop(options, 'width') || prop(options.element, 'offsetWidth', 0) || options.style.getPropertyValue('width'), 10);

        // start with half the max size
        var size = Math.floor(max / 2);
        var cur = compute(size);

        // compute next result based on first result
        size = Math.floor(size / cur * max);
        cur = compute(size);

        // happy cause we got it already
        if (Math.ceil(cur) === max) {
            return size + 'px';
        }

        // go on by increase/decrease pixels
        if (cur > max && size > 0) {
            while (cur > max && size > 0) {
                cur = compute(size--);
            }
            return size + 'px';
        }

        while (cur < max) {
            cur = compute(size++);
        }
        size--;
        return size + 'px';
    }

    exports.isCSSStyleDeclaration = isCSSStyleDeclaration;
    exports.canGetComputedStyle = canGetComputedStyle;
    exports.isElement = isElement;
    exports.getStyle = getStyle;
    exports.getStyledText = getStyledText;
    exports.width = width;
    exports.computeLinebreaks = computeLinebreaks;
    exports.height = height;
    exports.maxFontSize = maxFontSize;
});

},{}]},{},[1])(1)
});