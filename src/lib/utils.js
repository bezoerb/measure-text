/**
 * Created by ben on 08.04.16.
 */
import isPlainObject from 'lodash/isPlainObject';
import capitalize from 'lodash/capitalize';

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
export function getFont(style, options) {
    let font = [];

    let fontStyle = prop(options,'font-style',style.getPropertyValue('font-style'));
    if (['normal', 'italic', 'oblique'].indexOf(fontStyle) !== -1) {
        font.push(fontStyle);
    }

    let fontVariant = prop(options,'font-variant',style.getPropertyValue('font-variant'));
    if (['normal', 'small-caps'].indexOf(fontVariant) !== -1) {
        font.push(fontVariant);
    }

    let fontWeight = prop(options,'font-weight',style.getPropertyValue('font-weight'));
    if (['normal', 'bold', 'bolder', 'lighter', 100, 200, 300, 400, 500, 600, 700, 800, 900].indexOf(fontWeight) !== -1) {
        font.push(fontWeight);
    }

    let fontSize = prop(options,'font-size',style.getPropertyValue('font-size'));
    if (/r?em/.test(fontSize)) {
        fontSize = parseInt(fontSize,10) * 16 + 'px';
    }
    font.push(fontSize);

    let fontFamily = prop(options,'font-family',style.getPropertyValue('font-family'));
    font.push(fontFamily);

    return font.join(' ');
}

export function isCSSStyleDeclaration(val) {
    return val && typeof val.getPropertyValue === 'function';
}

export function canGetComputedStyle(el) {
    return el && el.style && typeof window !== 'undefined' && typeof window.getComputedStyle === 'function';
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

    let el = isPlainObject(options) ? options.element : options;
    if (canGetComputedStyle(el)) {
        return window.getComputedStyle(el, prop(options, 'pseudoElt', null));
    }

    return {getPropertyValue: function() { return ''}};
}

/**
 * get styled text
 *
 * @param {string} text
 * @param {CSSStyleDeclaration} style
 * @returns {string}
 */
export function getStyledText(text,style) {
    switch (style.getPropertyValue('text-transform')) {
        case 'uppercase':
            return text.toUpperCase();
        case 'lowercase':
            return text.toLowerCase();
        case 'capitalize':
            return capitalize(text);
        default:
            return text;
    }
}

export function prop(src, attr, defaultValue) {
    return src && typeof src[attr] !== 'undefined' && src[attr] || defaultValue;
}
