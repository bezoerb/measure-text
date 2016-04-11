/* eslint-env es6, browser */
import '../node_modules/babel-core/register';
import test from 'ava';
import {width, maxFontSize} from '../src/index';

test('Compute width for h1', t => {
    let el = document.querySelector('h1');
    t.is(Math.floor(width('TEST', el)), 92);
});

test('Compute width for h2', t => {
    let el = document.querySelector('h2');
    t.is(Math.floor(width('TEST', el)), 48);
});

test('Compute width for h3', t => {
    let el = document.querySelector('h3');
    t.is(Math.floor(width('test', el)), 38);
});

test('Computes width', t => {
    let el = document.querySelector('h1');
    let v1 = width('-', el);
    let v2 = width('--', el);
    let v3 = width('---', el);

    t.truthy(v1 < v2 < v3);
});

test('Computes maxFontSize', t => {
    let el = document.querySelector('#max-font-size');

    t.is(maxFontSize('unicorn', {element: el, width: '600px'}), '183px');
});
