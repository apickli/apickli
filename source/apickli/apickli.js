/* jslint node: true */
'use strict';

var request = require('request');
var jsonPath = require('JSONPath');
var select = require('xpath.js');
var dom = require('xmldom').DOMParser;
var fs = require('fs');

var accessToken;
var globalVariables = {};

var ATTRIBUTE = 2;

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

Apickli.prototype.addHttpBasicAuthorizationHeader = function(username, password) {
	var b64EncodedValue = base64Encode(username + ':' + password);
	this.addRequestHeader('Authorization', 'Basic ' + b64EncodedValue);
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

Apickli.prototype.assertPathInResponseBodyMatchesExpression = function(path, regexp) {
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

Apickli.prototype.evaluatePathInResponseBody = function(path) {
	return evaluatePath(path, this.getResponseObject().body);
};

Apickli.prototype.setAccessTokenFromResponseBodyPath = function(path) {
	accessToken = evaluatePath(path, this.getResponseObject().body);
};

Apickli.prototype.setBearerToken = function() {
	this.addRequestHeader('Authorization', 'Bearer ' + accessToken);
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

Apickli.prototype.storeValueOfHeaderInGlobalScope = function(headerName, variableName) {
	var value = this.getResponseObject().headers[headerName.toLowerCase()];
	this.setGlobalVariable(variableName, value);
};

Apickli.prototype.storeValueOfResponseBodyPathInGlobalScope = function(path, variableName) {
	var value = evaluatePath(path, this.getResponseObject().body);
	this.setGlobalVariable(variableName, value);
};

Apickli.prototype.setGlobalVariable = function(name, value) {
	globalVariables[name] = value;
};

Apickli.prototype.getGlobalVariable = function(name) {
	return globalVariables[name];
};

exports.Apickli = Apickli;

var getContentType = function(content) {
	try{
		JSON.parse(content);
		return 'json';
	} catch(e) {
		try{
			new dom().parseFromString(content);	
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
			var xmlDocument = new dom().parseFromString(content);
			var node = select(xmlDocument, path)[0];
			if (node.nodeType === ATTRIBUTE) {
				return node.value;
			}

			return node.firstChild.data; // element or comment
		default:
			return null;
	}
};

var base64Encode = function(str) {
	return new Buffer(str).toString('base64');
};
