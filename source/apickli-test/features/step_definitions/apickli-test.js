/* jslint node: true */
'use strict';

console.log('Using apickli from NPM');
var apickli = require('apickli');

if ((!apickli) || (process.env.TARGET == 'local')) {
	console.log('Using local apickli for testing');
	apickli = require('../../../apickli/apickli.js');
}

module.exports = function() {
	// cleanup before every scenario
	this.Before(function(callback) {
		this.apickli = new apickli.Apickli('http', 'httpbin.org');
		callback();
	});
};
