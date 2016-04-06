/**
 * Created by ben on 06.04.16.
 */
var fs = require('fs');
var path = require('path');
var css = fs.readFileSync(path.join(__dirname,'../fixtures/bootstrap.css'),'utf8');

global.document = require('jsdom').jsdom('<h1>Test</h1><p>Test2</p>');
global.window = document.defaultView;

var h1 = document.querySelector('h1');



var head = global.document.getElementsByTagName('head')[0];
style = global.document.createElement("style");
style.type = 'text/css';
style.innerHTML = css;
head.appendChild(style);

var styles = window.getComputedStyle(h1);

console.log(styles);
console.log(styles.getPropertyValue('font-size'));
