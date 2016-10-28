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

function Apickli(options) {
    if (!options.domain) {
        throw new Error('domain name is not provided');
    }

    var scheme = options.scheme || 'https';
    this.domain = scheme + '://' + options.domain;
    this.fixturesDirectory = options.fixturesDirectory || '';
    this.variableChar = options.variableChar || '`';
    this.scenarioVariables = options.scenarioVariables || {};

    this.queryParameters = {};
    this.headers = {};
    this.requestBody = '';
    this.httpResponse = {};
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
    resource = this.replaceVariables(resource);
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
    resource = this.replaceVariables(resource);
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
    resource = this.replaceVariables(resource);
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
    resource = this.replaceVariables(resource);
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
    resource = this.replaceVariables(resource);
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
    resource = this.replaceVariables(resource);
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
    username = this.replaceVariables(username);
    password = this.replaceVariables(password);
    var b64EncodedValue = base64Encode(username + ':' + password);
    this.addRequestHeader('Authorization', 'Basic ' + b64EncodedValue);
};

Apickli.prototype.assertResponseCode = function(responseCode) {
    responseCode = this.replaceVariables(responseCode);
    var realResponseCode = this.getResponseObject().statusCode;
    var success = (realResponseCode == responseCode);
    return this.getAssertionResult({
        success: success,
        expected: responseCode,
        actual: realResponseCode
    });
};

Apickli.prototype.assertResponseContainsHeader = function(header, callback) {
    header = this.replaceVariables(header);
    var success = typeof this.getResponseObject().headers[header.toLowerCase()] != 'undefined';
    return this.getAssertionResult({
        success: success,
        expected: true,
        actual: false
    });
};

Apickli.prototype.assertHeaderValue = function(header, expression) {
    header = this.replaceVariables(header);
    expression = this.replaceVariables(expression);
    var realHeaderValue = this.getResponseObject().headers[header.toLowerCase()];
    var regex = new RegExp(expression);
    var success = (regex.test(realHeaderValue));
    return this.getAssertionResult({
        success: success,
        expected: expression,
        actual: realHeaderValue
    });
};

Apickli.prototype.assertPathInResponseBodyMatchesExpression = function(path, regexp) {
    path = this.replaceVariables(path);
    regexp = this.replaceVariables(regexp);
    var regExpObject = new RegExp(regexp);
    var evalValue = evaluatePath(path, this.getResponseObject().body);
    var success = regExpObject.test(evalValue);
    return this.getAssertionResult({
        success: success,
        expected: regexp,
        actual: evalValue
    });
};

Apickli.prototype.assertResponseBodyContainsExpression = function(expression) {
    expression = this.replaceVariables(expression);
    var regex = new RegExp(expression);
    var success = regex.test(this.getResponseObject().body);
    return this.getAssertionResult({
        success: success,
        expected: expression,
        actual: null
    });
};

Apickli.prototype.assertResponseBodyContentType = function(contentType) {
    contentType = this.replaceVariables(contentType);
    var realContentType = getContentType(this.getResponseObject().body);
    var success = (realContentType === contentType);
    return this.getAssertionResult({
        success: success,
        expected: contentType,
        actual: realContentType
    });
};

Apickli.prototype.assertPathIsArray = function(path) {
    path = this.replaceVariables(path);
    var value = evaluatePath(path, this.getResponseObject().body);
    var success = Array.isArray(value);
    return this.getAssertionResult({
        success: success,
        expected: 'array',
        actual: typeof value
    });
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

    return this.getAssertionResult({
        success: success,
        expected: length,
        actual: actual
    });
};

Apickli.prototype.evaluatePathInResponseBody = function(path) {
    path = this.replaceVariables(path);
    return evaluatePath(path, this.getResponseObject().body);
};

Apickli.prototype.setAccessTokenFromResponseBodyPath = function(path) {
    path = this.replaceVariables(path);
    accessToken = evaluatePath(path, this.getResponseObject().body);
};

Apickli.prototype.setBearerToken = function() {
    this.addRequestHeader('Authorization', 'Bearer ' + accessToken);
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

    fs.readFile(this.fixturesDirectory + schemaFile, 'utf8', function(err, jsonSchemaString) {
        if (err) {
            callback(err);
        }

        var jsonSchema = JSON.parse(jsonSchemaString);
        var responseBody = JSON.parse(self.getResponseObject().body);

        var validate = jsonSchemaValidator(jsonSchema, { verbose: true });
        var success = validate(responseBody);
        callback(null, self.getAssertionResult({
            success: success,
            expected: validate.errors,
            actual: null
        }, self));
    });
};

Apickli.prototype.getAssertionResult = function(assertionResult, apickliInstance) {
    if (!apickliInstance) {
        apickliInstance = this;
    }

    return {
        success: assertionResult.success,
        expected: assertionResult.expected,
        actual: assertionResult.actual,
        response: {
            statusCode: apickliInstance.getResponseObject().statusCode,
            headers: apickliInstance.getResponseObject().headers,
            body: apickliInstance.getResponseObject().body
        }
    };
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
