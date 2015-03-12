'use strict';

var fs = require('fs');

var apickli = require('../support/apickli.js');
var util = new apickli.Util();

module.exports = function() {
	
	this.Given(/^I set (.*) header to (.*)$/, function(headerName, headerValue, callback) {
		this.httpClient.addHeader(headerName, headerValue);
		callback();
	});

	this.Given(/^I set body to (.*)$/, function(bodyValue, callback) {
		this.httpClient.setRequestBody(bodyValue);
		callback();
	});

	this.Given(/^I pipe contents of file (.*) to body$/, function(file, callback) {
		var t = this;
		fs.readFile(file, 'utf8', function(err, data) {
			if (err) {
				callback.fail(err);
			}

			t.httpClient.setRequestBody(data);
			callback();
		});
	});

	this.Given(/^I have basic authentication credentials (.*) and (.*)$/, function(username, password, callback) {
		var base64String = new Buffer(username + ':' + password).toString('base64');
		this.httpClient.addHeader('Authorization', base64String);
		callback();
	});

	this.When(/^I GET (.*)$/, function(resource, callback) {
		this.httpClient.get(resource, function(error, response) {
			if (error) {
				return callback.fail(error);
			}

			callback();
		});
	});

	this.When('I POST $resource', function(resource, callback) {
		this.httpClient.post(resource, function(error, response) {
			if (error) {
				return callback.fail(error);
			}

			callback();
		});
	});

	this.When('I PUT $resource', function(resource, callback) {
		this.httpClient.put(resource, function(error, response) {
			if (error) {
				return callback.fail(error);
			}

			callback();
		});
	});

	this.When('I DELETE $resource', function(resource, callback) {
		this.httpClient.delete(resource, function(error, response) {
			if (error) {
				return callback.fail(error);
			}

			callback();
		});
	});

	this.Then(/^response header (.*) should exist$/, function(header, callback) {
		if (this.httpClient.getResponse().headers[header]) {
			callback();
		} else {
			callback.fail('response header ' + header + ' doesn\'t exist in response');
		}
	});

	this.Then(/^response header (.*) should not exist$/, function(header, callback) {
		if (this.httpClient.getResponse().headers[header]) {
			callback.fail('response header ' + header + ' exists in response');
		} else {
			callback();
		}
	});

	this.Then(/^response body should be valid (xml|json)$/, function(contentType, callback) {
		if (util.getContentType(this.httpClient.getResponse().body)) {
			callback();
		} else {
			callback.fail('response body is not valid ' + contentType);
		}
	});

	this.Then(/^response code should be (\d+)$/, function(responseCode, callback) {
		var realStatusCode = this.httpClient.getResponse().statusCode;
		if (realStatusCode == responseCode) {
			callback();
		} else {
			callback.fail('response code isn\'t ' + responseCode + ', it\'s ' + realStatusCode);
		}
	});

	this.Then(/^response code should not be (\d+)$/, function(responseCode, callback) {
		if (this.httpClient.getResponse().statusCode != responseCode) {
			callback();
		} else {
			callback.fail('response code is ' + responseCode);
		}
	});

	this.Then(/^response header (.*) should be (.*)$/, function(name, value, callback) {
		var realValue = this.httpClient.getResponse().headers[name.toLowerCase()];
		var regex = new RegExp(value);
		if (regex.test(realValue)) {
			callback();
		} else {
			callback.fail('response header ' + name + ' isn\'t ' + value + ', it\'s ' + realValue);
		}
	});

	this.Then(/^response header (.*) should not be (.*)$/, function(name, value, callback) {
		var realValue = this.httpClient.getResponse().headers[name.toLowerCase()];
		var regex = new RegExp(value);
		if (!regex.test(realValue)) {
			callback();
		} else {
			callback.fail('response header ' + name + ' is ' + value);
		}
	});

	this.Then(/^response body should contain (.*)$/, function(value, callback) {
		var regex = new RegExp(value);
		if (regex.test(this.httpClient.getResponse().body)) {
			callback();
		} else {
			callback.fail('response body doesn\'t contain ' + value);
		}
	});

	this.Then(/^response body should not contain (.*)$/, function(value, callback) {
		var regex = new RegExp(value);
		if (!regex.test(this.httpClient.getResponse().body)) {
			callback();
		} else {
			callback.fail('response body contains ' + value);
		}
	});

	this.Then(/^response body path (.*) should be (.*)$/, function(path, value, callback) {
		var regex = new RegExp(value);
		var evalValue = util.evalPath(path, this.httpClient.getResponse().body);

		if (regex.test(evalValue)) {
			callback();
		} else {
			callback.fail('response body path ' + evalValue + ' doesn\'t match ' + value);
		}
	});

	this.Then(/^response body path (.*) should not be (.*)$/, function(path, value, callback) {
		var regex = new RegExp(value);
		var evalValue = util.evalPath(path, this.httpClient.getResponse().body);

		if (!regex.test(evalValue)) {
			callback();
		} else {
			callback.fail('response body path value ' + evalValue + ' matches ' + value);
		}
	});

	this.Then(/^I store the value of (.*) response header as (.*)$/, function(name, variable, callback) {
		var value = this.httpClient.getResponse().headers[name.toLowerCase()];
		this.savedVariables[variable] = value;
		callback();
	});

	this.Then(/^I store the value of body path (.*) as (.*)$/, function(path, variable, callback) {
		var value = util.evalPath(path, this.httpClient.getResponse().body);
		this.savedVariables[variable] = value;
		callback();
	});
};
