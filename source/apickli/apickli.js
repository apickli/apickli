/* jslint node: true */
'use strict';

var request = require('request');
var jsonPath = require('JSONPath');
var select = require('xpath.js');
var dom = require('xmldom').DOMParser;
var fs = require('fs');
var path = require('path');
var jsonSchemaValidator = require('is-my-json-valid');
var spec = require('swagger-tools').specs.v2;

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
    name = this.replaceVariables(name);
    value = this.replaceVariables(value);

    var valuesArray = [];
    if (this.headers[name]) {
        valuesArray = this.headers[name].split(',');
    }
    valuesArray.push(value);

    this.headers[name] = valuesArray.join(',');
};

Apickli.prototype.removeRequestHeader = function(name) {
    name = this.replaceVariables(name);
    delete this.headers[name];
};

Apickli.prototype.setRequestHeader = function(name, value) {
    this.removeRequestHeader(name);

    name = this.replaceVariables(name);
    value = this.replaceVariables(value);
    this.addRequestHeader(name, value);
};

Apickli.prototype.getResponseObject = function() {
    return this.httpResponse;
};

Apickli.prototype.setRequestBody = function(body) {
    body = this.replaceVariables(body);
    this.requestBody = body;
};

Apickli.prototype.setQueryParameters = function(queryParameters) {
    var self = this;
    var paramsObject = {};

    queryParameters.forEach(function(q){
        var queryParameterName = self.replaceVariables(q.parameter);
        var queryParameterValue = self.replaceVariables(q.value);
        paramsObject[queryParameterName] = queryParameterValue;
    });

    this.queryParameters = paramsObject;
};

Apickli.prototype.setHeaders = function(headersTable) {
    var self = this;

    headersTable.forEach(function(h) {
        var headerName = self.replaceVariables(h.name);
        var headerValue = self.replaceVariables(h.value);
        self.addRequestHeader(headerName, headerValue);
    });
};

Apickli.prototype.pipeFileContentsToRequestBody = function(file, callback) {
    var self = this;
    file = this.replaceVariables(file);
    fs.readFile(path.join(this.fixturesDirectory, file), 'utf8', function(err, data) {
        if (err) {
            callback(err);
        }

        self.setRequestBody(data);
        callback();
    });
};

Apickli.prototype.get = function(resource, callback) { // callback(error, response)
    var self = this;
    resource = this.replaceVariables(resource);
    this.sendRequest('GET', resource, callback);
};

Apickli.prototype.post = function(resource, callback) { // callback(error, response)
    var self = this;
    resource = this.replaceVariables(resource);
    this.sendRequest('POST', resource, callback);
};

Apickli.prototype.put = function(resource, callback) { // callback(error, response)
    var self = this;
    resource = this.replaceVariables(resource);
    this.sendRequest('PUT', resource, callback);
};

Apickli.prototype.delete = function(resource, callback) { // callback(error, response)
    var self = this;
    resource = this.replaceVariables(resource);
    this.sendRequest('DELETE', resource, callback);
};

Apickli.prototype.patch = function(resource, callback) { // callback(error, response)
    var self = this;
    resource = this.replaceVariables(resource);
    this.sendRequest('PATCH', resource, callback);
};

Apickli.prototype.options = function(resource, callback) { // callback(error, response)
    var self = this;
    resource = this.replaceVariables(resource);
    this.sendRequest('OPTIONS', resource, callback);
};

Apickli.prototype.addHttpBasicAuthorizationHeader = function(username, password) {
    username = this.replaceVariables(username);
    password = this.replaceVariables(password);
    var b64EncodedValue = base64Encode(username + ':' + password);
    this.addRequestHeader('Authorization', 'Basic ' + b64EncodedValue);
};

Apickli.prototype.assertResponseCode = function(responseCode) {
    responseCode = this.replaceVariables(responseCode);
    var realResponseCode = this.getResponseObject().statusCode;
    var success = (realResponseCode == responseCode);
    return getAssertionResult(success, responseCode, realResponseCode, this);
};

Apickli.prototype.assertResponseDoesNotContainHeader = function(header, callback) {
    header = this.replaceVariables(header);
    var success = typeof this.getResponseObject().headers[header.toLowerCase()] == 'undefined';
    return getAssertionResult(success, true, false, this);
};

Apickli.prototype.assertResponseContainsHeader = function(header, callback) {
    header = this.replaceVariables(header);
    var success = typeof this.getResponseObject().headers[header.toLowerCase()] != 'undefined';
    return getAssertionResult(success, true, false, this);
};

Apickli.prototype.assertHeaderValue = function(header, expression) {
    header = this.replaceVariables(header);
    expression = this.replaceVariables(expression);
    var realHeaderValue = this.getResponseObject().headers[header.toLowerCase()];
    var regex = new RegExp(expression);
    var success = (regex.test(realHeaderValue));
    return getAssertionResult(success, expression, realHeaderValue, this);
};

Apickli.prototype.assertPathInResponseBodyMatchesExpression = function(path, regexp) {
    path = this.replaceVariables(path);
    regexp = this.replaceVariables(regexp);
    var regExpObject = new RegExp(regexp);
    var evalValue = evaluatePath(path, this.getResponseObject().body);
    var success = regExpObject.test(evalValue);
    return getAssertionResult(success, regexp, evalValue, this);
};

Apickli.prototype.assertResponseBodyContainsExpression = function(expression) {
    expression = this.replaceVariables(expression);
    var regex = new RegExp(expression);
    var success = regex.test(this.getResponseObject().body);
    return getAssertionResult(success, expression, null, this);
};

Apickli.prototype.assertResponseBodyContentType = function(contentType) {
    contentType = this.replaceVariables(contentType);
    var realContentType = getContentType(this.getResponseObject().body);
    var success = (realContentType === contentType);
    return getAssertionResult(success, contentType, realContentType, this);
};

Apickli.prototype.assertPathIsArray = function(path) {
    path = this.replaceVariables(path);
    var value = evaluatePath(path, this.getResponseObject().body);
    var success = Array.isArray(value);
    return getAssertionResult(success, 'array', typeof value, this);
};

Apickli.prototype.assertPathIsArrayWithLength = function(path, length) {
    path = this.replaceVariables(path);
    length = this.replaceVariables(length);
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
    path = this.replaceVariables(path);
    return evaluatePath(path, this.getResponseObject().body);
};

Apickli.prototype.setAccessToken = function(token) {
    accessToken = token;
};

Apickli.prototype.unsetAccessToken = function() {
    accessToken = undefined;
};

Apickli.prototype.getAccessTokenFromResponseBodyPath = function(path) {
    path = this.replaceVariables(path);
    return evaluatePath(path, this.getResponseObject().body);
};

Apickli.prototype.setAccessTokenFromResponseBodyPath = function(path) {
    this.setAccessToken(this.getAccessTokenFromResponseBodyPath(path));
};

Apickli.prototype.setBearerToken = function() {
    if (accessToken)
      return this.addRequestHeader('Authorization', 'Bearer ' + accessToken);
    else
      return false;
};

Apickli.prototype.storeValueInScenarioScope = function(variableName, value) {
    this.scenarioVariables[variableName] = value;
};

Apickli.prototype.storeValueOfHeaderInScenarioScope = function(header, variableName) {
    header = this.replaceVariables(header);  //only replace header. replacing variable name wouldn't make sense
    var value = this.getResponseObject().headers[header.toLowerCase()];
    this.scenarioVariables[variableName] = value;
};

Apickli.prototype.storeValueOfResponseBodyPathInScenarioScope = function(path, variableName) {
    path = this.replaceVariables(path);  //only replace path. replacing variable name wouldn't make sense
    var value = evaluatePath(path, this.getResponseObject().body);
    this.scenarioVariables[variableName] = value;
};

Apickli.prototype.assertScenarioVariableValue = function(variable, value) {
    value = this.replaceVariables(value);    //only replace value. replacing variable name wouldn't make sense
    return (String(this.scenarioVariables[variable]) === value);
};

Apickli.prototype.storeValueOfHeaderInGlobalScope = function(headerName, variableName) {
    headerName = this.replaceVariables(headerName);    //only replace headerName. replacing variable name wouldn't make sense
    var value = this.getResponseObject().headers[headerName.toLowerCase()];
    this.setGlobalVariable(variableName, value);
};

Apickli.prototype.storeValueOfResponseBodyPathInGlobalScope = function(path, variableName) {
    path = this.replaceVariables(path);    //only replace path. replacing variable name wouldn't make sense
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
    schemaFile = this.replaceVariables(schemaFile, self.scenarioVariables, self.variableChar);

    fs.readFile(path.join(this.fixturesDirectory, schemaFile), 'utf8', function(err, jsonSchemaString) {
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

Apickli.prototype.validateResponseWithSwaggerSpecDefinition = function(definitionName, swaggerSpecFile, callback) {
    var self = this;
    swaggerSpecFile = this.replaceVariables(swaggerSpecFile, self.scenarioVariables, self.variableChar);

    fs.readFile(path.join(this.fixturesDirectory, swaggerSpecFile), 'utf8', function(err, swaggerSpecString) {
        if (err) {
            callback(err);
        }

        var swaggerObject = JSON.parse(swaggerSpecString);
        var responseBody = JSON.parse(self.getResponseObject().body);

        spec.validateModel(swaggerObject, '#/definitions/' + definitionName, responseBody, function (err, result) {
            if(err) {
                callback(getAssertionResult(false, null, err, self));
            } else if (result && result.errors) {
                callback(getAssertionResult(false, null, result.errors, self));
            } else {
                callback(getAssertionResult(true, null, null, self));
            }
        });

    });
};

exports.Apickli = Apickli;

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
Apickli.prototype.replaceVariables = function(resource, scope, variableChar, offset) {
    scope = scope || this.scenarioVariables;
    variableChar = variableChar || this.variableChar;
    offset = offset || 0;

    var startIndex = resource.indexOf(variableChar, offset);
    if (startIndex >= 0) {
        var endIndex = resource.indexOf(variableChar, startIndex + 1);
        if (endIndex > startIndex) {
            var variableName = resource.substr(startIndex + 1, endIndex - startIndex - 1);
            var variableValue = scope && scope.hasOwnProperty(variableName) ? scope[variableName] : globalVariables[variableName];

            resource = resource.substr(0, startIndex) + variableValue + resource.substr(endIndex + 1);
            resource = this.replaceVariables(resource, scope, variableChar, endIndex + 1);
        }
    }
    return resource;
};

Apickli.prototype.sendRequest = function(method, resource, callback) {
    var self = this;
    var options = {};
    options.url = this.domain + resource;
    options.method = method;
    options.headers = this.headers;
    options.qs = this.queryParameters;
    options.body = this.requestBody;
    if(method !== 'OPTIONS') {
        options.followRedirect = false;
    }
    resource = this.replaceVariables(resource);
    request(options, function(error, response) {
        if (error) {
            return callback(error);
        }

        self.httpResponse = response;
        callback(null, response);
    });
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
