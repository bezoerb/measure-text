import test from 'ava';
import {jsdom} from 'jsdom';
import 'babel-core/register';
import {width} from './src/index';

global.document = jsdom('<h1></h1>');
global.window = document.defaultView;


test('Exception on missing element', t => {
    let el = document.querySelector('.not-available');
    t.is(Math.floor( width('unicorns',el) ), 37);
});

test('width', t => {
    let el = document.querySelector('h1');
    t.is(Math.floor( width('unicorns',el) ), 37);
});
