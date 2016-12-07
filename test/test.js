/* eslint-env es6, browser */
// eslint-disable-next-line import/no-unassigned-import
import '../node_modules/babel-core/register';
import test from 'ava';
import {width, height, computeLinebreaks, maxFontSize} from '../src/index';

test('Compute with without element', t => {
    let w = width('test', {
        'font-size': '30px',
        'font-weight': '400',
        'font-family': 'Helvetica, Arial, sans-serif'
    });

    t.is(Math.floor(w), 48);
});

test('Compute width for h1', t => {
    let el = document.querySelector('h1');
    t.is(Math.floor(width('TEST', el)), 92);
});

test('Compute width for h2', t => {
    let el = document.querySelector('h2');
    t.is(Math.floor(width('TEST', el)), 48);
});

test('Computes width', t => {
    let el = document.querySelector('h1');
    let v1 = width('-', el);
    let v2 = width('--', el);
    let v3 = width('---', el);

    t.true(v1 < v2 < v3);
});

test('Computes maxFontSize', t => {
    let el = document.querySelector('#max-font-size');

    t.is(maxFontSize('unicorn', el), '183px');
});

test('Computes lines', t => {
    let el = document.querySelector('#height');

    const text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam atque cum dolor explicabo incidunt.';
    const expected = [
        'Lorem ipsum',
        'dolor sit amet,',
        'consectetur',
        'adipisicing elit.',
        'Aliquam atque',
        'cum dolor',
        'explicabo',
        'incidunt.'
    ];

    const value = computeLinebreaks(text, el);

    t.is(value.length, expected.length);

    for (let i = 0; i < value.length; i++) {
        t.is(value[i], expected[i]);
    }
});

test('Computes height', t => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam atque cum dolor explicabo incidunt.';
    const val = height(text, {
        'font-size': '14px',
        'line-height': '20px',
        'font-family': 'Helvetica, Arial, sans-serif',
        'font-weight': '400',
        width: 100
    });

    t.is(val, 160);
});
