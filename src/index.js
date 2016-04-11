/* eslint-env es6, browser */
import {prop, isElement, getStyle, getStyledText, getFont} from './utils';
import debugFn from 'debug';

let ctx;
try {
    ctx = document.createElement('canvas').getContext('2d');
} catch (error) {
    debugFn('measure-text:init')(error.message || error);
    throw new Error('Canvas support required');
}

function parseOptions(options) {
    if (options && isElement(options)) {
        return {element: options};
    } else if (options && isElement(options.element)) {
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
export function width(text, options) {
    let debug = debugFn('measure-text:width');
    options = parseOptions(options);

    let style = getStyle(options);
    let styledText = getStyledText(text, style);

    ctx.font = prop(options, 'font', null) || getFont(style, options);

    let metrics = ctx.measureText(styledText);
    debug(styledText, metrics.width + 'px', 'Font declaration:', ctx.font);

    return metrics.width;
}

/**
 * Compute Text Metrics based for given text

 * @returns {function}
 */

export function maxFontSize(text, options) {
    let debug = debugFn('measure-text:max-font-size');
    options = parseOptions(options);

    // add computed style to options to prevent multiple expensive getComputedStyle calls
    options.style = getStyle(options);

    // simple compute function which adds the size and computes the with
    let compute = size => {
        options['font-size'] = size + 'px';
        return width(text, options);
    };

    // get max width
    let max = parseInt(prop(options, 'width') || prop(options.element, 'offsetWidth', 0), 10);
    debug('Computing maxFontSize for width: ' + max);

    // start with half the max size
    let size = Math.floor(max / 2);
    let cur = compute(size);
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
    }

    while (cur < max) {
        cur = compute(size++);
        debug('following round:', size + 'px', cur);
    }
    size--;
    debug('Computed: ' + size + 'px');
    return size + 'px';
}

