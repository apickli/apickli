/* jslint node: true */
'use strict';

var request = require('request');
var jsonPath = require('JSONPath');
var select = require('xpath.js');
var dom = require('xmldom').DOMParser;
var fs = require('fs');
var jsonSchemaValidator = require('is-my-json-valid');

var accessToken;
var globalVariables = {};

var ATTRIBUTE = 2;

var getAssertionResult = function(success, expected, actual, apickliInstance) {
    return {
        success: success,
        expected: expected,
        actual: actual,
        response: {
            statusCode: apickliInstance.getResponseObject().statusCode,
            headers: apickliInstance.getResponseObject().headers,
            body: apickliInstance.getResponseObject().body
        }
    };
};

function Apickli(scheme, domain, fixturesDirectory) {
	this.domain = scheme + '://' + domain;
	this.headers = {};
	this.httpResponse = {};
	this.requestBody = '';
	this.scenarioVariables = {};
	this.fixturesDirectory = (fixturesDirectory ? fixturesDirectory : '');
	this.queryParameters = {};
}

Apickli.prototype.addRequestHeader = function(name, value) {
    var valuesArray = [];
    if (this.headers[name]) {
        valuesArray = this.headers[name].split(',');
    } 
    valuesArray.push(value);
    
	this.headers[name] = valuesArray.join(',');
};

Apickli.prototype.getResponseObject = function() {
	return this.httpResponse;
};

Apickli.prototype.setRequestBody = function(body) {
	this.requestBody = body;
};

Apickli.prototype.setQueryParameters = function(queryParameters) {
    var paramsObject = {};
    queryParameters.forEach(function(q) {
        paramsObject[q.parameter] = q.value;
    });
    
	this.queryParameters = paramsObject;
};

Apickli.prototype.setHeaders = function(headersTable) {
    var self = this;
    headersTable.forEach(function(h) {
        self.addRequestHeader(h.name, h.value);
    });
};

Apickli.prototype.pipeFileContentsToRequestBody = function(file, callback) {
	var self = this;
	fs.readFile(this.fixturesDirectory + file, 'utf8', function(err, data) {
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
		headers: this.headers,
		followRedirect: false,
        qs: this.queryParameters
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
		method: 'POST',
		followRedirect: false,
        qs: this.queryParameters
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
		method: 'PUT',
		followRedirect: false,
        qs: this.queryParameters
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
		method: 'DELETE',
		followRedirect: false,
        qs: this.queryParameters
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
	var self = this;

	request({
		url: this.domain + resource,
		headers: this.headers,
		body: this.requestBody,
		method: 'PATCH',
		followRedirect: false,
        qs: this.queryParameters
	},
	function(error, response) {
		if (error) {
			return callback(error);
		}

		self.httpResponse = response;
		callback(null, response);
	});
};

Apickli.prototype.options = function(resource, callback) { // callback(error, response)
    var self = this;
    
    request({
        url: this.domain + resource,
        headers: this.headers,
        method: 'OPTIONS',
        qs: this.queryParameters
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
	var success = (realResponseCode == responseCode);
    return getAssertionResult(success, responseCode, realResponseCode, this);
};

Apickli.prototype.assertResponseContainsHeader = function(header, callback) {
	var success = typeof this.getResponseObject().headers[header.toLowerCase()] != 'undefined';
    return getAssertionResult(success, true, false, this);
};

Apickli.prototype.assertHeaderValue = function (header, expression) {
	var realHeaderValue = this.getResponseObject().headers[header.toLowerCase()];
	var regex = new RegExp(expression);
	var success = (regex.test(realHeaderValue));
    return getAssertionResult(success, expression, realHeaderValue, this);
};

Apickli.prototype.assertPathInResponseBodyMatchesExpression = function(path, regexp) {
	var regExpObject = new RegExp(regexp);
	var evalValue = evaluatePath(path, this.getResponseObject().body);
	var success = regExpObject.test(evalValue);
    return getAssertionResult(success, regexp, evalValue, this);
};

Apickli.prototype.assertResponseBodyContainsExpression = function(expression) {
	var regex = new RegExp(expression);
	var success = regex.test(this.getResponseObject().body);
    return getAssertionResult(success, expression, null, this);
};

Apickli.prototype.assertResponseBodyContentType = function(contentType) {
	var realContentType = getContentType(this.getResponseObject().body);
	var success = (realContentType === contentType);
    return getAssertionResult(success, contentType, realContentType, this);
};

Apickli.prototype.assertPathIsArray = function(path) {
	var value = evaluatePath(path, this.getResponseObject().body);
	var success = Array.isArray(value);
	return getAssertionResult(success, 'array', typeof value, this);
};

Apickli.prototype.assertPathIsArrayWithLength = function(path, length) {
	var success = false;
	var actual = '?';
	var value = evaluatePath(path, this.getResponseObject().body);
	if (Array.isArray(value)) {
		success = value.length == length;
		actual = value.length;
	}
	
	return getAssertionResult(success, length, actual, this);
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

Apickli.prototype.validateResponseWithSchema = function(schemaFile, callback) {
	var self = this;
    
	fs.readFile(this.fixturesDirectory + schemaFile, 'utf8', function(err, jsonSchemaString) {
		if (err) {
			callback(err);
		}
        
        var jsonSchema = JSON.parse(jsonSchemaString);
        var responseBody = JSON.parse(self.getResponseObject().body);

		var validate = jsonSchemaValidator(jsonSchema, {verbose: true});
        var success = validate(responseBody);
        callback(getAssertionResult(success, validate.errors, null, self));
	});
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
			var evalResult = jsonPath({resultType: 'all'}, path, contentJson);
            return (evalResult.length > 0) ? evalResult[0].value : undefined;
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