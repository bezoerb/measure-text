/* eslint-env es6, browser */
const DEFAULTS = {
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
    let font = [];

    let fontWeight = prop(options, 'font-weight', style.getPropertyValue('font-weight'));
    if (['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'].indexOf(fontWeight.toString()) !== -1) {
        font.push(fontWeight);
    }

    let fontStyle = prop(options, 'font-style', style.getPropertyValue('font-style'));
    if (['normal', 'italic', 'oblique'].indexOf(fontStyle) !== -1) {
        font.push(fontStyle);
    }

    let fontVariant = prop(options, 'font-variant', style.getPropertyValue('font-variant'));
    if (['normal', 'small-caps'].indexOf(fontVariant) !== -1) {
        font.push(fontVariant);
    }

    let fontSize = prop(options, 'font-size', style.getPropertyValue('font-size'));
    let fontSizeValue = parseFloat(fontSize);
    let fontSizeUnit = fontSize.replace(fontSizeValue, '');
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

    let fontFamily = prop(options, 'font-family', style.getPropertyValue('font-family'));
    font.push(fontFamily);

    return font.join(' ');
}

/**
 * check for CSSStyleDeclaration
 *
 * @param val
 * @returns {bool}
 */
export function isCSSStyleDeclaration(val) {
    return val && typeof val.getPropertyValue === 'function';
}

/**
 * check wether we can get computed style
 *
 * @param el
 * @returns {bool}
 */
export function canGetComputedStyle(el) {
    return el && el.style && typeof window !== 'undefined' && typeof window.getComputedStyle === 'function';
}

/**
 * check for DOM element
 *
 * @param el
 * @retutns {bool}
 */
export function isElement(el) {
    return (
        typeof HTMLElement === 'object' ? el instanceof HTMLElement :
        el && typeof el === 'object' && el !== null && el.nodeType === 1 && typeof el.nodeName === 'string'
    );
}

/**
 * Get style declaration if available
 *
 * @returns {CSSStyleDeclaration}
 */
export function getStyle(options) {
    if (isCSSStyleDeclaration(options.style)) {
        return options.style;
    }
    let el = options && isElement(options.element) && options.element;
    if (canGetComputedStyle(el)) {
        return window.getComputedStyle(el, prop(options, 'pseudoElt', null));
    }
    return {
        getPropertyValue: key => prop(options, key)
    };
}

/**
 * get styled text
 *
 * @param {string} text
 * @param {CSSStyleDeclaration} style
 * @returns {string}
 */
export function getStyledText(text, style) {
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
    return (src && typeof src[attr] !== 'undefined' && src[attr]) || defaultValue;
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
        return {element: options};
    }

    // normalize keys (fontSize => font-size)
    if (typeof options === 'object') {
        Object.keys(options).forEach(key => {
            const dashedKey = key.replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`);
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
export function width(text, options) {
    options = parseOptions(options);

    let style = getStyle(options);
    let styledText = getStyledText(text, style);

    let ctx;
    try {
        ctx = document.createElement('canvas').getContext('2d');
        ctx.font = prop(options, 'font', null) || getFont(style, options);
    } catch (err) {
        throw new Error('Canvas support required');
    }

    if (options.multiline) {
        return computeLinebreaks(styledText, {...options, style}).reduce((res, text) => {
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
export function computeLinebreaks(text, options) {
    options = parseOptions(options);

    const style = getStyle(options);
    // get max width
    const max = parseInt(
        prop(options, 'width') ||
        prop(options.element, 'offsetWidth', 0) ||
        style.getPropertyValue('width')
    , 10);
    const delimiter = prop(options, 'delimiter', ' ');

    const styledText = getStyledText(text, style);
    const words = styledText.split(delimiter);

    if (words.length === 0) {
        return 0;
    }

    let ctx;
    try {
        ctx = document.createElement('canvas').getContext('2d');
        ctx.font = prop(options, 'font', null) || getFont(style, options);
    } catch (err) {
        throw new Error('Canvas support required');
    }

    let lines = [];
    let line = words.shift();

    words.forEach((word, index) => {
        const {width} = ctx.measureText(line + delimiter + word);

        if (width <= max) {
            line += (delimiter + word);
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
export function height(text, options) {
    options = parseOptions(options);
    const style = getStyle(options);
    const lineHeight = parseInt(prop(options, 'line-height') || style.getPropertyValue('line-height'), 10);

    return computeLinebreaks(text, {...options, style}).length * lineHeight;
}

/**
 * Compute Text Metrics based for given text

 * @returns {function}
 */

export function maxFontSize(text, options) {
    options = parseOptions(options);

    // add computed style to options to prevent multiple expensive getComputedStyle calls
    options.style = getStyle(options);

    // simple compute function which adds the size and computes the with
    let compute = size => {
        options['font-size'] = size + 'px';
        return width(text, options);
    };

    // get max width
    // get max width
    const max = parseInt(
        prop(options, 'width') ||
        prop(options.element, 'offsetWidth', 0) ||
        options.style.getPropertyValue('width')
    , 10);

    // start with half the max size
    let size = Math.floor(max / 2);
    let cur = compute(size);

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

