/* jslint node: true */
'use strict';

var request = require('request');
var jsonPath = require('JSONPath');
var libxmljs = require('libxmljs');
var fs = require('fs');

function Apickli(scheme, domain) {
	this.domain = scheme + '://' + domain;
	this.headers = {};
	this.httpResponse = {};
	this.requestBody = '';
	this.scenarioVariables = {};
}

Apickli.prototype.addRequestHeader = function(name, value) {
	this.headers[name] = value;
};

Apickli.prototype.getResponseObject = function() {
	return this.httpResponse;
};

Apickli.prototype.setRequestBody = function(body) {
	this.requestBody = body;
};

Apickli.prototype.pipeFileContentsToRequestBody = function(file, callback) {
	var self = this;
	fs.readFile(file, 'utf8', function(err, data) {
		if (err) {
			callback(err);
		}

		self.setRequestBody(data);
		callback();
	});
};

Apickli.prototype.get = function(resource, callback) { // callback(error, response)
	var self = this;
	request.get({
		url: this.domain + resource,
		headers: this.headers
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}
		
		self.httpResponse = response;
		callback(null, response);
	});
};

Apickli.prototype.post = function(resource, callback) { // callback(error, response)
	var self = this;
	request({
		url: this.domain + resource,
		headers: this.headers,
		body: this.requestBody,
		method: 'POST'
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}

		self.httpResponse = response;
		callback(null, response);
	});
};

Apickli.prototype.put = function(resource, callback) { // callback(error, response)
	var self = this;
	request({
		url: this.domain + resource,
		headers: this.headers,
		body: this.requestBody,
		method: 'PUT'
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}

		self.httpResponse = response;
		callback(null, response);
	});
};

Apickli.prototype.delete = function(resource, callback) { // callback(error, response)
	var self = this;
	request({
		url: this.domain + resource,
		headers: this.headers,
		body: this.requestBody,
		method: 'DELETE'
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}

		self.httpResponse = response;
		callback(null, response);
	});
};

Apickli.prototype.addHttpBasicAuthenticationHeader = function(username, password) {
	var b64EncodedValue = base64Encode(username + ':' + password);
	this.addRequestHeader('Authentication', b64EncodedValue);
};

Apickli.prototype.assertResponseCode = function(responseCode) {
	var realResponseCode = this.getResponseObject().statusCode;
	return (realResponseCode == responseCode);
};

Apickli.prototype.assertResponseContainsHeader = function(header, callback) {
	if (this.getResponseObject().headers[header.toLowerCase()]) {
		return true;
	} else {
		return false;
	}
};

Apickli.prototype.assertHeaderValue = function (header, expression) {
	var realHeaderValue = this.getResponseObject().headers[header.toLowerCase()];
	var regex = new RegExp(expression);
	return (regex.test(realHeaderValue));
};

Apickli.prototype.evaluatePathInResponseBody = function(path, regexp) {
	var regExpObject = new RegExp(regexp);
	var evalValue = evaluatePath(path, this.getResponseObject().body);
	return (regExpObject.test(evalValue));
};

Apickli.prototype.assertResponseBodyContainsExpression = function(expression) {
	var regex = new RegExp(expression);
	return (regex.test(this.getResponseObject().body));
};

Apickli.prototype.assertResponseBodyContentType = function(contentType) {
	var realContentType = getContentType(this.getResponseObject().body);
	return (realContentType === contentType);
};

Apickli.prototype.storeValueOfHeaderInScenarioScope = function(header, variableName) {
	var value = this.getResponseObject().headers[header.toLowerCase()];
	this.scenarioVariables[variableName] = value;
};

Apickli.prototype.storeValueOfResponseBodyPathInScenarioScope = function(path, variableName) {
	var value = evaluatePath(path, this.getResponseObject().body);
	this.scenarioVariables[variableName] = value;
};

Apickli.prototype.assertScenarioVariableValue = function(variable, value) {
	return (String(this.scenarioVariables[variable]) === value);
};

exports.Apickli = Apickli;

var getContentType = function(content) {
	try{
		JSON.parse(content);
		return 'json';
	} catch(e) {
		try{
			libxmljs.parseXml(content);
			return 'xml';
		} catch(e) {
			return null;
		}
	}
};

var evaluatePath = function(path, content) {
	var contentType = getContentType(content);

	switch (contentType) {
		case 'json':
			var contentJson = JSON.parse(content);
			return jsonPath.eval(contentJson, path);
		case 'xml':
			var xml = libxmljs.parseXml(content);
			return xml.get(path).text();
		default:
			return null;
	}
};

var base64Encode = function(str) {
	return new Buffer(str).toString('base64');
};
