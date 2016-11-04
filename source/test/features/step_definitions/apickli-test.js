/* jslint node: true */
'use strict';

console.log('Using local apickli for testing');
var apickli = require('../../../apickli/apickli.js');

module.exports = function() {
	// cleanup before every scenario
	this.Before(function(scenario, callback) {
		this.apickli = new apickli.Apickli({
            domain: 'httpbin.org'
        });
		callback();
	});
};
