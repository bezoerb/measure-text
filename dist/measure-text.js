(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.measureText = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './utility'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./utility'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.utility);
        global.measureText = mod.exports;
    }
})(this, function (exports, _utility) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.width = width;
    exports.maxFontSize = maxFontSize;


    var ctx = void 0; /* eslint-env es6, browser */

    try {
        ctx = document.createElement('canvas').getContext('2d');
    } catch (error) {
        throw new Error('Canvas support required');
    }

    function parseOptions(options) {
        if (options && (0, _utility.isElement)(options)) {
            return { element: options };
        } else if (options && (0, _utility.isElement)(options.element)) {
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
        options = parseOptions(options);

        var style = (0, _utility.getStyle)(options);
        var styledText = (0, _utility.getStyledText)(text, style);

        ctx.font = (0, _utility.prop)(options, 'font', null) || (0, _utility.getFont)(style, options);

        var metrics = ctx.measureText(styledText);

        return metrics.width;
    }

    /**
     * Compute Text Metrics based for given text
    
     * @returns {function}
     */

    function maxFontSize(text, options) {
        options = parseOptions(options);

        // add computed style to options to prevent multiple expensive getComputedStyle calls
        options.style = (0, _utility.getStyle)(options);

        // simple compute function which adds the size and computes the with
        var compute = function compute(size) {
            options['font-size'] = size + 'px';
            return width(text, options);
        };

        // get max width
        var max = parseInt((0, _utility.prop)(options, 'width') || (0, _utility.prop)(options.element, 'offsetWidth', 0), 10);

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
});

},{"./utility":2}],2:[function(require,module,exports){
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
        global.utility = mod.exports;
    }
})(this, function (exports) {
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

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    /* eslint-env es6, browser */
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
     * @param o
     * @retutns {bool}
     */
    function isElement(el) {
        return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === "object" ? el instanceof HTMLElement : el && (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === "object" && el !== null && el.nodeType === 1 && typeof el.nodeName === "string";
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
            getPropertyValue: function getPropertyValue() {
                return '';
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
});

},{}]},{},[1])(1)
});