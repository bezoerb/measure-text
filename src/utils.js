/**
 * Created by ben on 08.04.16.
 */
import debugFn from 'debug';
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
    let debug = debugFn('measure-text:getFont');
    let font = [];

    let fontWeight = prop(options,'font-weight',style.getPropertyValue('font-weight'));
    debug(fontWeight);
    if (['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'].indexOf(fontWeight) !== -1) {
        font.push(fontWeight);
    }

    let fontStyle = prop(options,'font-style',style.getPropertyValue('font-style'));
    if (['normal', 'italic', 'oblique'].indexOf(fontStyle) !== -1) {
        font.push(fontStyle);
    }

    let fontVariant = prop(options,'font-variant',style.getPropertyValue('font-variant'));
    if (['normal', 'small-caps'].indexOf(fontVariant) !== -1) {
        font.push(fontVariant);
    }



    let fontSize = prop(options,'font-size',style.getPropertyValue('font-size'));
    let fontSizeValue = parseFloat(fontSize);
    let fontSizeUnit =fontSize.replace(fontSizeValue,'');
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
 * Returns true if it is a DOM element
 *
 * @param o
 * @retutns {bool}
 */

export function isElement(o){
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
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
        default:
            return text;
    }
}

export function prop(src, attr, defaultValue) {
    return src && typeof src[attr] !== 'undefined' && src[attr] || defaultValue;
}
