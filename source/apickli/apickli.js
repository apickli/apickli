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

Apickli.prototype.addRequestHeaderFromScenarioVariable = function(name, variable) {
	this.headers[name] = this.scenarioVariables(variable);
};

Apickli.prototype.addRequestHeaderFromGlobalVariable = function(name, variable) {
	this.headers[name] = globalVariables(variable);
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
	resource = replaceVariables(resource, this.scenarioVariables);
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
	resource = replaceVariables(resource, this.scenarioVariables);
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
	resource = replaceVariables(resource, this.scenarioVariables);
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
	resource = replaceVariables(resource, this.scenarioVariables);
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

Apickli.prototype.patch = function(resource, callback) { // callback(error, response)
	resource = replaceVariables(resource, this.scenarioVariables);
	var self = this;
	request({
		url: this.domain + resource,
		headers: this.headers,
		body: this.requestBody,
		method: 'PATCH'
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

Apickli.prototype.assertResponseBodyIsExpression = function(expression) {
	var real = JSON.parse(this.getResponseObject().body).json;
	var result = areEqual(real, JSON.parse(expression));
	return result;
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

Apickli.prototype.assertGlobalVariableValue = function(variable, value) {
	return (String(globalVariables[variable]) === value);
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


/**
 * Replaces variable identifiers in the resource string
 * with their value in scenario variables if it exists.
 * Otherwise looks for the value in global variables.
 * Returns the modified string
 * The variable identifiers must be delimited with backticks
 */
var replaceVariables = function(resource, scenarioVariables) {
	resource = replaceScopeVariables(resource, scenarioVariables);
	resource = replaceScopeVariables(resource, globalVariables);
	return resource;
};

/**
 * Replaces variable identifiers in the resource string
 * with their value in scope if it exists
 * Returns the modified string
 * The variable identifiers must be delimited with backticks
 * offset defines the index of the char from which the varaibles are to be searched
 * It's optional.
 */
var replaceScopeVariables = function(resource, scope, offset) {
  if (offset === undefined) {
    offset = 0;
  }
  var startIndex = resource.indexOf("`", offset);
  if (startIndex >= 0) {
    var endIndex = resource.indexOf("`", startIndex + 1);
    if (endIndex >= startIndex) {
      var variableName = resource.substr(startIndex + 1, endIndex - startIndex - 1);
      if (scope.hasOwnProperty(variableName)) {
        var variableValue = scope[variableName];
        resource = resource.substr(0, startIndex) + variableValue + resource.substr(endIndex + 1);
      }
      resource = replaceScopeVariables(resource, scope, endIndex + 1);
    }
  }
  return resource;
};

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

/**
 * Makes a deep comparison of two objects
 * Returns true when they are equal, false otherwise
 * This function is intended to compare objects created from JSON string only
 * So it may not handle properly comparison of other types of objects
 */
var areEqual = function(real, expected) {
	  for ( var property in expected ) {
	    if ( ! real.hasOwnProperty( property ) ) return false;
	      // allows to compare expected[ property ] and real[ property ] when set to undefined
	    if ( expected[ property ] === real[ property ] ) continue;
	      // if they have the same strict value or identity then they are equal

	    if ( typeof( expected[ property ] ) !== "object" ) return false;
	      // Numbers, Strings, Functions, Booleans must be strictly equal

	    if ( !areEqual( expected[ property ],  real[ property ] ) ) return false;
	      // Objects and Arrays must be tested recursively
	  }
		return true;
}
