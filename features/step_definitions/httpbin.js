/* jslint node: true */
'use strict';

var apickli = require('../support/apickli.js');

module.exports = function() {
	// cleanup before every scenario
	this.Before(function(callback) {
		this.httpClient = new apickli.HttpClient('http', 'httpbin.org');
		callback();
	});
};
