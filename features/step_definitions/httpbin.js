/* jslint node: true */
'use strict';

var apickli = require('../support/apickli.js');

module.exports = function() {

	// cleanup before every scenario
	this.Before(function(callback) {
		this.apickli = new apickli.apickli('http', 'httpbin.org');
		callback();
	});

};
