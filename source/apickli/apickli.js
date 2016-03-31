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

function Apickli(scheme, domain, fixturesDirectory, variableChar) {
    this.domain = scheme + '://' + domain;
    this.headers = {};
    this.httpResponse = {};
    this.requestBody = '';
    this.scenarioVariables = {};
    this.fixturesDirectory = (fixturesDirectory ? fixturesDirectory : '');
    this.queryParameters = {};
    this.variableChar = (variableChar ? variableChar : '`');
}

Apickli.prototype.addRequestHeader = function(name, value) {
    name = replaceVariables(name, this.scenarioVariables, this.variableChar);
    value = replaceVariables(value, this.scenarioVariables, this.variableChar);

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
    body = replaceVariables(body, this.scenarioVariables, this.variableChar);
    this.requestBody = body;
};

Apickli.prototype.setQueryParameters = function(queryParameters) {
    var paramsObject = {};

    for (var i = 0; i < queryParameters.length; i++) {
        var q = queryParameters[i];
        var queryParameterName = replaceVariables(q.parameter, this.scenarioVariables, this.variableChar);
        var queryParameterValue = replaceVariables(q.value, this.scenarioVariables, this.variableChar);
        paramsObject[queryParameterName] = queryParameterValue;
    };

    this.queryParameters = paramsObject;
};

Apickli.prototype.setHeaders = function(headersTable) {
    var self = this;
    for (var i = 0; i < headersTable.length; i++) {
        var h = headersTable[i];
        var headerName = replaceVariables(h.name, self.scenarioVariables, self.variableChar);
        var headerValue = replaceVariables(h.value, self.scenarioVariables, self.variableChar);
        self.addRequestHeader(headerName, headerValue);
    };
};

Apickli.prototype.pipeFileContentsToRequestBody = function(file, callback) {
    var self = this;
    file = replaceVariables(file, self.scenarioVariables, self.variableChar);
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
    resource = replaceVariables(resource, self.scenarioVariables, self.variableChar);
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
    resource = replaceVariables(resource, self.scenarioVariables, self.variableChar);
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
    resource = replaceVariables(resource, self.scenarioVariables, self.variableChar);
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
    resource = replaceVariables(resource, self.scenarioVariables, self.variableChar);
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
    resource = replaceVariables(resource, self.scenarioVariables, self.variableChar);
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
    resource = replaceVariables(resource, self.scenarioVariables, self.variableChar);
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
    username = replaceVariables(username, this.scenarioVariables, this.variableChar);
    password = replaceVariables(password, this.scenarioVariables, this.variableChar);
    var b64EncodedValue = base64Encode(username + ':' + password);
    this.addRequestHeader('Authorization', 'Basic ' + b64EncodedValue);
};

Apickli.prototype.assertResponseCode = function(responseCode) {
    responseCode = replaceVariables(responseCode, this.scenarioVariables, this.variableChar);
    var realResponseCode = this.getResponseObject().statusCode;
    var success = (realResponseCode == responseCode);
    return getAssertionResult(success, responseCode, realResponseCode, this);
};

Apickli.prototype.assertResponseContainsHeader = function(header, callback) {
    header = replaceVariables(header, this.scenarioVariables, this.variableChar);
    var success = typeof this.getResponseObject().headers[header.toLowerCase()] != 'undefined';
    return getAssertionResult(success, true, false, this);
};

Apickli.prototype.assertHeaderValue = function(header, expression) {
    header = replaceVariables(header, this.scenarioVariables, this.variableChar);
    expression = replaceVariables(expression, this.scenarioVariables, this.variableChar);
    var realHeaderValue = this.getResponseObject().headers[header.toLowerCase()];
    var regex = new RegExp(expression);
    var success = (regex.test(realHeaderValue));
    return getAssertionResult(success, expression, realHeaderValue, this);
};

Apickli.prototype.assertPathInResponseBodyMatchesExpression = function(path, regexp) {
    path = replaceVariables(path, this.scenarioVariables, this.variableChar);
    regexp = replaceVariables(regexp, this.scenarioVariables, this.variableChar);
    var regExpObject = new RegExp(regexp);
    var evalValue = evaluatePath(path, this.getResponseObject().body);
    var success = regExpObject.test(evalValue);
    return getAssertionResult(success, regexp, evalValue, this);
};

Apickli.prototype.assertResponseBodyContainsExpression = function(expression) {
    expression = replaceVariables(expression, this.scenarioVariables, this.variableChar);
    var regex = new RegExp(expression);
    var success = regex.test(this.getResponseObject().body);
    return getAssertionResult(success, expression, null, this);
};

Apickli.prototype.assertResponseBodyContentType = function(contentType) {
    contentType = replaceVariables(contentType, this.scenarioVariables, this.variableChar);
    var realContentType = getContentType(this.getResponseObject().body);
    var success = (realContentType === contentType);
    return getAssertionResult(success, contentType, realContentType, this);
};

Apickli.prototype.assertPathIsArray = function(path) {
    path = replaceVariables(path, this.scenarioVariables, this.variableChar);
    var value = evaluatePath(path, this.getResponseObject().body);
    var success = Array.isArray(value);
    return getAssertionResult(success, 'array', typeof value, this);
};

Apickli.prototype.assertPathIsArrayWithLength = function(path, length) {
    path = replaceVariables(path, this.scenarioVariables, this.variableChar);
    length = replaceVariables(length, this.scenarioVariables, this.variableChar);
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
    path = replaceVariables(path, this.scenarioVariables, this.variableChar);
    return evaluatePath(path, this.getResponseObject().body);
};

Apickli.prototype.setAccessTokenFromResponseBodyPath = function(path) {
    path = replaceVariables(path, this.scenarioVariables, this.variableChar);
    accessToken = evaluatePath(path, this.getResponseObject().body);
};

Apickli.prototype.setBearerToken = function() {
    this.addRequestHeader('Authorization', 'Bearer ' + accessToken);
};

Apickli.prototype.storeValueInScenarioScope = function(value, variableName) {
    this.scenarioVariables[variableName] = value;
};

Apickli.prototype.storeValueOfHeaderInScenarioScope = function(header, variableName) {
    header = replaceVariables(header, this.scenarioVariables, this.variableChar);  //only replace header. replacing variable name wouldn't make sense
    var value = this.getResponseObject().headers[header.toLowerCase()];
    this.scenarioVariables[variableName] = value;
};

Apickli.prototype.storeValueOfResponseBodyPathInScenarioScope = function(path, variableName) {
    path = replaceVariables(path, this.scenarioVariables, this.variableChar);  //only replace path. replacing variable name wouldn't make sense
    var value = evaluatePath(path, this.getResponseObject().body);
    this.scenarioVariables[variableName] = value;
};

Apickli.prototype.assertScenarioVariableValue = function(variable, value) {
    value = replaceVariables(value, this.scenarioVariables, this.variableChar);    //only replace value. replacing variable name wouldn't make sense
    return (String(this.scenarioVariables[variable]) === value);
};

Apickli.prototype.storeValueOfHeaderInGlobalScope = function(headerName, variableName) {
    headerName = replaceVariables(headerName, this.scenarioVariables, this.variableChar);    //only replace headerName. replacing variable name wouldn't make sense
    var value = this.getResponseObject().headers[headerName.toLowerCase()];
    this.setGlobalVariable(variableName, value);
};

Apickli.prototype.storeValueOfResponseBodyPathInGlobalScope = function(path, variableName) {
    path = replaceVariables(path, this.scenarioVariables, this.variableChar);    //only replace path. replacing variable name wouldn't make sense
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
    schemaFile = replaceVariables(schemaFile, self.scenarioVariables, self.variableChar);

    fs.readFile(this.fixturesDirectory + schemaFile, 'utf8', function(err, jsonSchemaString) {
        if (err) {
            callback(err);
        }

        var jsonSchema = JSON.parse(jsonSchemaString);
        var responseBody = JSON.parse(self.getResponseObject().body);

        var validate = jsonSchemaValidator(jsonSchema, { verbose: true });
        var success = validate(responseBody);
        callback(getAssertionResult(success, validate.errors, null, self));
    });
};

exports.Apickli = Apickli;

/**
 * Replaces variable identifiers in the resource string
 * with their value in scenario variables if it exists.
 * Returns the modified string or empty string.
 * The variable identifiers must be delimited with backticks or variableChar character
 */
var replaceVariables = function(resource, scenarioVariables, variableChar) {
    resource = replaceScopeVariables(resource, scenarioVariables, 0, variableChar);
    return resource;
};

/**
 * Replaces variable identifiers in the resource string
 * with their value in scope if it exists
 * Returns the modified string
 * The variable identifiers must be delimited with backticks or variableChar character
 * offset defines the index of the char from which the varaibles are to be searched
 * It's optional.
 * 
 * Credits: Based on contribution by PascalLeMerrer
 */
var replaceScopeVariables = function(resource, scope, offset, variableChar) {
      
    var startIndex = resource.indexOf(variableChar, offset);
    if (startIndex >= 0) {
        var endIndex = resource.indexOf(variableChar, startIndex + 1);
        if (endIndex >= startIndex) {
            var variableName = resource.substr(startIndex + 1, endIndex - startIndex - 1);
            var variableValue = "";
            if (scope.hasOwnProperty(variableName)) {
                variableValue = scope[variableName];
            }
            resource = resource.substr(0, startIndex) + variableValue + resource.substr(endIndex + 1);
            resource = replaceScopeVariables(resource, scope, endIndex + 1);
        }
    }
    return resource;
};

var getContentType = function(content) {
    try {
        JSON.parse(content);
        return 'json';
    } catch (e) {
        try {
            new dom().parseFromString(content);
            return 'xml';
        } catch (e) {
            return null;
        }
    }
};

var evaluatePath = function(path, content) {
    var contentType = getContentType(content);

    switch (contentType) {
        case 'json':
            var contentJson = JSON.parse(content);
            var evalResult = jsonPath({ resultType: 'all' }, path, contentJson);
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