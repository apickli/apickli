'use strict';

const fs = require('fs');
const path = require('path');

const httpClient = require('./lib/http-client');
const jsonEvaluator = require('./lib/evaluators/json');
const xmlEvaluator = require('./lib/evaluators/xml');
const openapiEvaluator = require('./lib/evaluators/openapi');

let accessToken;
const globalVariables = {};

const base64Encode = function(str) {
  return Buffer.from(str).toString('base64');
};

const getContentType = function(content) {
  if (!content) return null;
  try {
    JSON.parse(content);
    return 'json';
  } catch (e) {
    const xmlDoc = xmlEvaluator.parseXml(content);
    if (xmlDoc) {
      return 'xml';
    }
    return null;
  }
};

const evaluatePath = function(pathStr, content) {
  const contentType = getContentType(content);
  switch (contentType) {
    case 'json':
      return jsonEvaluator.evaluateJsonPath(pathStr, content);
    case 'xml':
      return xmlEvaluator.evaluateXPath(pathStr, content);
    default:
      return null;
  }
};

const getAssertionResult = function(success, expected, actual, apickliInstance) {
  const resp = apickliInstance.getResponseObject() || {};
  return {
    success,
    expected,
    actual,
    response: {
      statusCode: resp.statusCode,
      headers: resp.headers,
      body: resp.body,
    },
  };
};

function Apickli(scheme, domain, fixturesDirectory, variableChar) {
  this.domain = scheme + '://' + domain;
  this.headers = {};
  this.cookies = [];
  this.httpResponse = {};
  this.requestBody = '';
  this.scenarioVariables = {};
  this.fixturesDirectory = (fixturesDirectory ? fixturesDirectory : '');
  this.queryParameters = {};
  this.formParameters = {};
  this.httpRequestOptions = {};
  this.clientTLSConfig = {};
  this.selectedClientTLSConfig = '';
  this.variableChar = (variableChar ? variableChar : '`');
}

Apickli.prototype.addRequestHeader = function(name, value) {
  name = this.replaceVariables(name);
  value = this.replaceVariables(value);

  let valuesArray = [];
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

Apickli.prototype.setClientTLSConfiguration = function(configurationName, callback) {
  if (!Object.prototype.hasOwnProperty.call(this.clientTLSConfig, configurationName)) {
    callback('Client TLS Configuration ' + configurationName + ' does not exist.');
  } else {
    this.selectedClientTLSConfig = configurationName;
    callback();
  }
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

Apickli.prototype.addCookie = function(cookie) {
  cookie = this.replaceVariables(cookie);
  this.cookies.push(cookie);
};

Apickli.prototype.setRequestBody = function(body) {
  body = this.replaceVariables(body);
  this.requestBody = body;
};

Apickli.prototype.setQueryParameters = function(queryParameters) {
  const self = this;
  const paramsObject = {};

  queryParameters.forEach(function(q) {
    const queryParameterName = self.replaceVariables(q.parameter);
    const queryParameterValue = self.replaceVariables(q.value);
    paramsObject[queryParameterName] = queryParameterValue;
  });

  this.queryParameters = paramsObject;
};

Apickli.prototype.setFormParameters = function(formParameters) {
  const self = this;
  const paramsObject = {};

  formParameters.forEach(function(f) {
    const formParameterName = self.replaceVariables(f.parameter);
    const formParameterValue = self.replaceVariables(f.value);
    paramsObject[formParameterName] = formParameterValue;
  });

  this.formParameters = paramsObject;
};

Apickli.prototype.setHeaders = function(headersTable) {
  const self = this;

  headersTable.forEach(function(h) {
    const headerName = self.replaceVariables(h.name);
    const headerValue = self.replaceVariables(h.value);
    self.addRequestHeader(headerName, headerValue);
  });
};

Apickli.prototype.pipeFileContentsToRequestBody = function(file, callback) {
  const self = this;
  file = this.replaceVariables(file);
  fs.readFile(path.join(this.fixturesDirectory, file), 'utf8', function(err, data) {
    if (err) {
      callback(err);
    } else {
      self.setRequestBody(data);
      callback();
    }
  });
};

Apickli.prototype.get = function(resource, callback) {
  resource = this.replaceVariables(resource);
  this.sendRequest('GET', resource, callback);
};

Apickli.prototype.post = function(resource, callback) {
  resource = this.replaceVariables(resource);
  this.sendRequest('POST', resource, callback);
};

Apickli.prototype.put = function(resource, callback) {
  resource = this.replaceVariables(resource);
  this.sendRequest('PUT', resource, callback);
};

Apickli.prototype.delete = function(resource, callback) {
  resource = this.replaceVariables(resource);
  this.sendRequest('DELETE', resource, callback);
};

Apickli.prototype.patch = function(resource, callback) {
  resource = this.replaceVariables(resource);
  this.sendRequest('PATCH', resource, callback);
};

Apickli.prototype.options = function(resource, callback) {
  resource = this.replaceVariables(resource);
  this.sendRequest('OPTIONS', resource, callback);
};

Apickli.prototype.addHttpBasicAuthorizationHeader = function(username, password) {
  username = this.replaceVariables(username);
  password = this.replaceVariables(password);
  const b64EncodedValue = base64Encode(username + ':' + password);
  this.removeRequestHeader('Authorization');
  this.addRequestHeader('Authorization', 'Basic ' + b64EncodedValue);
};

Apickli.prototype.assertResponseCode = function(responseCode) {
  responseCode = this.replaceVariables(responseCode);
  const realResponseCode = this.getResponseObject().statusCode.toString();
  const success = (realResponseCode === responseCode);
  return getAssertionResult(success, responseCode, realResponseCode, this);
};

Apickli.prototype.assertResponseDoesNotContainHeader = function(header) {
  header = this.replaceVariables(header);
  const success = typeof this.getResponseObject().headers[header.toLowerCase()] === 'undefined';
  return getAssertionResult(success, true, false, this);
};

Apickli.prototype.assertResponseContainsHeader = function(header) {
  header = this.replaceVariables(header);
  const success = typeof this.getResponseObject().headers[header.toLowerCase()] !== 'undefined';
  return getAssertionResult(success, true, false, this);
};

Apickli.prototype.assertHeaderValue = function(header, expression) {
  header = this.replaceVariables(header);
  expression = this.replaceVariables(expression);
  const realHeaderValue = this.getResponseObject().headers[header.toLowerCase()];
  const regex = new RegExp(expression);
  const success = (regex.test(realHeaderValue));
  return getAssertionResult(success, expression, realHeaderValue, this);
};

Apickli.prototype.assertPathInResponseBodyMatchesExpression = function(pathStr, regexp) {
  pathStr = this.replaceVariables(pathStr);
  regexp = this.replaceVariables(regexp);
  const regExpObject = new RegExp(regexp);
  const evalValue = evaluatePath(pathStr, this.getResponseObject().body);
  const success = regExpObject.test(evalValue);
  return getAssertionResult(success, regexp, evalValue, this);
};

Apickli.prototype.assertResponseBodyContainsExpression = function(expression) {
  expression = this.replaceVariables(expression);
  const regex = new RegExp(expression);
  const success = regex.test(this.getResponseObject().body);
  return getAssertionResult(success, expression, null, this);
};

Apickli.prototype.assertResponseBodyContentType = function(contentType) {
  contentType = this.replaceVariables(contentType);
  const realContentType = getContentType(this.getResponseObject().body);
  const success = (realContentType === contentType);
  return getAssertionResult(success, contentType, realContentType, this);
};

Apickli.prototype.assertPathIsArray = function(pathStr) {
  pathStr = this.replaceVariables(pathStr);
  const value = evaluatePath(pathStr, this.getResponseObject().body);
  const success = Array.isArray(value);
  return getAssertionResult(success, 'array', typeof value, this);
};

Apickli.prototype.assertPathIsArrayWithLength = function(pathStr, length) {
  pathStr = this.replaceVariables(pathStr);
  length = this.replaceVariables(length);
  let success = false;
  let actual = '?';
  const value = evaluatePath(pathStr, this.getResponseObject().body);
  if (Array.isArray(value)) {
    success = value.length.toString() === length;
    actual = value.length;
  }

  return getAssertionResult(success, length, actual, this);
};

Apickli.prototype.evaluatePathInResponseBody = function(pathStr) {
  pathStr = this.replaceVariables(pathStr);
  return evaluatePath(pathStr, this.getResponseObject().body);
};

Apickli.prototype.setAccessToken = function(token) {
  accessToken = token;
};

Apickli.prototype.unsetAccessToken = function() {
  accessToken = undefined;
};

Apickli.prototype.getAccessTokenFromResponseBodyPath = function(pathStr) {
  pathStr = this.replaceVariables(pathStr);
  return evaluatePath(pathStr, this.getResponseObject().body);
};

Apickli.prototype.setAccessTokenFromResponseBodyPath = function(pathStr) {
  this.setAccessToken(this.getAccessTokenFromResponseBodyPath(pathStr));
};

Apickli.prototype.setBearerToken = function() {
  if (accessToken) {
    this.removeRequestHeader('Authorization');
    return this.addRequestHeader('Authorization', 'Bearer ' + accessToken);
  } else {
    return false;
  }
};

Apickli.prototype.storeValueInScenarioScope = function(variableName, value) {
  this.scenarioVariables[variableName] = value;
};

Apickli.prototype.storeValueOfHeaderInScenarioScope = function(header, variableName) {
  header = this.replaceVariables(header);
  const value = this.getResponseObject().headers[header.toLowerCase()];
  this.scenarioVariables[variableName] = value;
};

Apickli.prototype.storeValueOfResponseBodyPathInScenarioScope = function(pathStr, variableName) {
  pathStr = this.replaceVariables(pathStr);
  const value = evaluatePath(pathStr, this.getResponseObject().body);
  this.scenarioVariables[variableName] = value;
};

Apickli.prototype.assertScenarioVariableValue = function(variable, value) {
  value = this.replaceVariables(value);
  return (String(this.scenarioVariables[variable]) === value);
};

Apickli.prototype.storeValueOfHeaderInGlobalScope = function(headerName, variableName) {
  headerName = this.replaceVariables(headerName);
  const value = this.getResponseObject().headers[headerName.toLowerCase()];
  this.setGlobalVariable(variableName, value);
};

Apickli.prototype.storeValueOfResponseBodyPathInGlobalScope = function(pathStr, variableName) {
  pathStr = this.replaceVariables(pathStr);
  const value = evaluatePath(pathStr, this.getResponseObject().body);
  this.setGlobalVariable(variableName, value);
};

Apickli.prototype.setGlobalVariable = function(name, value) {
  globalVariables[name] = value;
};

Apickli.prototype.getGlobalVariable = function(name) {
  return globalVariables[name];
};

Apickli.prototype.validateResponseWithSchema = function(schemaFile, callback) {
  const self = this;
  schemaFile = this.replaceVariables(schemaFile, self.scenarioVariables, self.variableChar);

  fs.readFile(path.join(this.fixturesDirectory, schemaFile), 'utf8', function(err, jsonSchemaString) {
    if (err) {
      return callback(err);
    }
    try {
      const jsonSchema = JSON.parse(jsonSchemaString);
      const responseBody = JSON.parse(self.getResponseObject().body);
      const result = jsonEvaluator.validateJsonSchema(jsonSchema, responseBody);
      callback(getAssertionResult(result.valid, null, result.errors, self));
    } catch (e) {
      callback(getAssertionResult(false, null, e.message, self));
    }
  });
};

Apickli.prototype.validateResponseWithSwaggerSpecDefinition = function(definitionName, swaggerSpecFile, callback) {
  const self = this;
  swaggerSpecFile = this.replaceVariables(swaggerSpecFile, self.scenarioVariables, self.variableChar);

  fs.readFile(path.join(this.fixturesDirectory, swaggerSpecFile), 'utf8', function(err, swaggerSpecString) {
    if (err) {
      return callback(getAssertionResult(false, null, err, self));
    }
    try {
      const swaggerObject = JSON.parse(swaggerSpecString);
      const responseBody = JSON.parse(self.getResponseObject().body);

      openapiEvaluator.validateSwaggerSpecDefinition(swaggerObject, definitionName, responseBody, function(validationErr, res) {
        if (validationErr) {
          callback(getAssertionResult(false, null, validationErr.message, self));
        } else if (res && !res.success) {
          callback(getAssertionResult(false, null, res.errors, self));
        } else {
          callback(getAssertionResult(true, null, null, self));
        }
      });
    } catch (e) {
      callback(getAssertionResult(false, null, e.message, self));
    }
  });
};

Apickli.prototype.replaceVariables = function(resource, scope, variableChar, offset) {
  if (!resource) return resource;

  scope = scope || this.scenarioVariables;
  variableChar = variableChar || this.variableChar;
  offset = offset || 0;

  const startIndex = resource.indexOf(variableChar, offset);
  if (startIndex >= 0) {
    const endIndex = resource.indexOf(variableChar, startIndex + 1);
    if (endIndex > startIndex) {
      const variableName = resource.substr(startIndex + 1, endIndex - startIndex - 1);
      const variableValue = scope && Object.prototype.hasOwnProperty.call(scope, variableName) ? scope[variableName] : globalVariables[variableName];

      resource = resource.substr(0, startIndex) + variableValue + resource.substr(endIndex + 1);
      resource = this.replaceVariables(resource, scope, variableChar);
    }
  }
  return resource;
};

Apickli.prototype.sendRequest = function(method, resource, callback) {
  httpClient.sendRequest(this, method, resource, callback);
};

exports.Apickli = Apickli;
