#!/usr/bin/env node
'use strict';
var meow = require('meow');
var test = require('./');

var cli = meow([
	'Usage',
	'  $ test [input]',
	'',
	'Options',
	'  --foo  Lorem ipsum. [Default: false]',
	'',
	'Examples',
	'  $ test',
	'  unicorns & rainbows',
	'  $ test ponies',
	'  ponies & rainbows'
]);

console.log(test(cli.input[0] || 'unicorns'));
