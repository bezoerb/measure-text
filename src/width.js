/**
 * Created by ben on 05.04.16.
 */
'use strict';
import debugFn from 'debug';
import capitalize from '../node_modules/lodash/capitalize';
import get from '../node_modules/lodash/get';
let debug = debugFn('measureText:width');

/**
 * Map css styles to canvas font property
 *
 * font: font-style font-variant font-weight font-size/line-height font-family;
 * http://www.w3schools.com/tags/canvas_font.asp
 *
 * @param style
 * @returns {string}
 */
function getFont(style) {
    let font = [];

    let fontStyle = style.getPropertyValue('font-style');
    if (['normal', 'italic', 'oblique'].indexOf(fontStyle) !== -1) {
        font.push(fontStyle);
    }

    let fontVariant = style.getPropertyValue('font-variant');
    if (['normal', 'small-caps'].indexOf(fontVariant) !== -1) {
        font.push(fontVariant);
    }

    let fontWeight = style.getPropertyValue('font-weight');
    if (['normal', 'bold', 'bolder', 'lighter', 100, 200, 300, 400, 500, 600, 700, 800, 900].indexOf(fontWeight) !== -1) {
        font.push(fontWeight);
    }

    let fontSize = style.getPropertyValue('font-size');
    if (/r?em/.test(fontSize)) {
        fontSize = parseInt(fontSize,10) * 16 + 'px';
    }
    font.push(fontSize);

    let fontFamily = style.getPropertyValue('font-family');
    font.push(fontFamily);

    return font.join(' ');
}

/**
 * Compute Text Metrics based for given text
 *
 * @param {string} text Text to measure
 * @param {HTMLElement} element The Element for which to get the font definition style.
 * @param {object} options (optional)
 *     - pseudo: A string specifying the pseudo-element to match. Must be omitted (or null) for regular elements
 *     - font: canvas 2d context font declaration
 * @returns {float}
 */
module.exports = function (text, element, options = {}) {
    if (!window.getComputedStyle) {
        throw new Error('Your Browser is not supported');
    }

    if (!element) {
        throw new Error('Missing required element');
    }



    let style = window.getComputedStyle(element, get(options, 'pseudo', null));
    let font = get(options, 'font', null) || getFont(style);
    debug('Font declaration:', font);

    var textTransform = style.getPropertyValue('text-transform');
    switch (textTransform) {
        case 'uppercase':
            text = text.toUpperCase();
            break;
        case 'lowercase':
            text = text.toLowerCase();
            break;
        case 'capitalize':
            text = capitalize(text);
            break;
    }

    let ctx = document.createElement('canvas').getContext('2d');
    ctx.font = font;

    let metrics = ctx.measureText(text);
    debug(text, metrics.width + 'px');

    return metrics.width;
};

