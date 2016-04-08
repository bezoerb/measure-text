/**
 * Created by ben on 08.04.16.
 */

import width from './width';
import {getStyle} from './utils';
import debugFn from 'debug';
import isPlainObject from 'lodash/isPlainObject';
let debug = debugFn('measure-text:max-font-size');

/**
 * Compute Text Metrics based for given text

 * @returns {function}
 */

export default function maxFontSize(text, options) {
    let el = prop(options,'element');
    if (!isPlainObject(options)) {
        el = options;
        options = { element: el };
    }
    options.style = getStyle(options);

    let max = prop(el,'offsetWidth') || prop(options,'width',0);
    debug('Computing maxFontSize for width: ' + max + 'px');

    let size = Math.floor(parseInt(max,10)/3);
    options['font-size'] = size + 'px';

    let cur = width(text, options);
    if (cur > max && size > 0) {
        while (cur > max) {
            options['font-size'] = size-- + 'px';
            cur = width(text, options);
        }
        debug('Computed: ' + size + 'px');
        return size + 'px';
    } else {
        while (cur < max) {
            options['font-size'] = size++ + 'px';
            cur = width(text, options);
        }
        size--;
        debug('Computed: ' + size + 'px');
        return size + 'px';
    }

}
