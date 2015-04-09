/* jslint node: true */
'use strict';

var apickli = require('apickli');

module.exports = function() {
	// cleanup before every scenario
	this.Before(function(callback) {
		this.apickli = new apickli.Apickli('http', 'httpbin.org');
		callback();
	});
};
