/* jslint node: true */
'use strict';

var request = require('request');
var jsonPath = require('JSONPath');
var libxmljs = require('libxmljs');
var fs = require('fs');

var domain;
var headers = {};
var httpResponse = {};
var requestBody = '';
var scenarioVariables = {};

function apickli(scheme, domain) {
	this.domain = scheme + '://' + domain;
	this.headers = {};
	httpResponse = {};
	requestBody = '';
	scenarioVariables = {};
}

apickli.prototype.addRequestHeader = function(name, value) {
	headers[name] = value;
};

apickli.prototype.getResponseObject = function() {
	return httpResponse;
};

apickli.prototype.setRequestBody = function(body) {
	requestBody = body;
};

apickli.prototype.pipeFileContentsToRequestBody = function(file, callback) {
	var me = this;
	fs.readFile(file, 'utf8', function(err, data) {
		if (err) {
			callback(err);
		}

		me.setRequestBody(data);
		callback();
	});
};

apickli.prototype.get = function(resource, callback) { // callback(error, response)
	request.get({
		url: this.domain + resource,
		headers: headers
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}

		httpResponse = response;
		callback(null, response);
	});
};

apickli.prototype.post = function(resource, callback) { // callback(error, response)
	request({
		url: this.domain + resource,
		headers: headers,
		body: requestBody,
		method: 'POST'
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}

		httpResponse = response;
		callback(null, response);
	});
};

apickli.prototype.put = function(resource, callback) { // callback(error, response)
	request({
		url: this.domain + resource,
		headers: headers,
		body: requestBody,
		method: 'PUT'
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}

		httpResponse = response;
		callback(null, response);
	});
};

apickli.prototype.delete = function(resource, callback) { // callback(error, response)
	request({
		url: this.domain + resource,
		headers: headers,
		body: requestBody,
		method: 'DELETE'
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}

		httpResponse = response;
		callback(null, response);
	});
};

apickli.prototype.addHttpBasicAuthenticationHeader = function(username, password) {
	var b64EncodedValue = base64Encode(username + ':' + password);
	this.addRequestHeader('Authentication', b64EncodedValue);
};

apickli.prototype.assertResponseCode = function(responseCode) {
	var realResponseCode = this.getResponseObject().statusCode;
	return (realResponseCode == responseCode);
};

apickli.prototype.assertResponseContainsHeader = function(header, callback) {
	if (this.getResponseObject().headers[header.toLowerCase()]) {
		return true;
	} else {
		return false;
	}
};

apickli.prototype.assertHeaderValue = function (header, expression) {
	var realHeaderValue = this.getResponseObject().headers[header.toLowerCase()];
	var regex = new RegExp(expression);
	return (regex.test(realHeaderValue));
};

apickli.prototype.evaluatePathInResponseBody = function(path, regexp) {
	var regExpObject = new RegExp(regexp);
	var evalValue = evaluatePath(path, this.getResponseObject().body);
	return (regExpObject.test(evalValue));
};

apickli.prototype.assertResponseBodyContainsExpression = function(expression) {
	var regex = new RegExp(expression);
	return (regex.test(this.getResponseObject().body));
};

apickli.prototype.assertResponseBodyContentType = function(contentType) {
	var realContentType = getContentType(this.getResponseObject().body);
	return (realContentType === contentType);
};

apickli.prototype.storeValueOfHeaderInScenarioScope = function(header, variableName) {
	var value = this.getResponseObject().headers[header.toLowerCase()];
	scenarioVariables[variableName] = value;
};

apickli.prototype.storeValueOfResponseBodyPathInScenarioScope = function(path, variableName) {
	var value = evaluatePath(path, this.getResponseObject().body);
	scenarioVariables[variableName] = value;
};

apickli.prototype.assertScenarioVariableValue = function(variable, value) {
	return (String(scenarioVariables[variable]) === value);
};

exports.apickli = apickli;

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
