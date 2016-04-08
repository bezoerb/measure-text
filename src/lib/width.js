/**
 * Created by ben on 05.04.16.
 */
/*eslint-env node, browser */
'use strict';
import {prop, getStyle, getStyledText, getFont} from './utils';
import isPlainObject from 'lodash/isPlainObject';
import debugFn from 'debug';
let debug = debugFn('measure-text:width');

try {
    var ctx = document.createElement('canvas').getContext('2d');
} catch (error) {
    debug(error.message || error);
    throw new Error('Canvas support required');
}

/**
 * Compute Text Metrics based for given text
 *
 * @param {string} text
 * @param {object} options
 * @returns {function}
 */


export default function width(text, options) {
    let el = prop(options, 'element');
    if (!isPlainObject(options)) {
        el = options;
        options = {element: el};
    }

    let style = getStyle(options);
    let styledText = getStyledText(text, style);

    ctx.font = prop(options, 'font', null) || getFont(style, options);
    debug('Font declaration:', ctx.font);

    let metrics = ctx.measureText(styledText);
    debug(text, metrics.width + 'px');

    return metrics.width;
}
