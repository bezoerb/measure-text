import '../node_modules/babel-core/register';
import test from 'ava';
import measure from '../src/index';

test('Computes width', t => {
    let el = document.querySelector('h1');
    t.is(Math.floor(measure('unicorns', {element: el}).width()), 136);
});

test('Computes width', t => {
    let el = document.querySelector('h1');
    let v1 = measure('-', {element: el}).width();
    let v2 = measure('--', {element: el}).width();
    let v3 = measure('---', {element: el}).width();

    t.truthy(v1 < v2 < v3);
});

