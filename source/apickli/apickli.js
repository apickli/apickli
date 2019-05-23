'use strict';

const request = require('request');
const jsonPath = require('JSONPath');
const select = require('xpath.js');
const Dom = require('xmldom').DOMParser;
const fs = require('fs');
const path = require('path');
const jsonSchemaValidator = require('is-my-json-valid');
const spec = require('swagger-tools').specs.v2;

let accessToken;
const globalVariables = {};
const _xmlAttributeNodeType = 2;

const base64Encode = function(str) {
  return Buffer.from(str).toString('base64');
};

const getContentType = function(content) {
  try {
    JSON.parse(content);
    return 'json';
  } catch (e) {
    try {
      new Dom().parseFromString(content);
      return 'xml';
    } catch (e) {
      return null;
    }
  }
};

const evaluateJsonPath = function(path, content) {
  const contentJson = JSON.parse(content);
  const evalResult = jsonPath({resultType: 'all'}, path, contentJson);
  return (evalResult.length > 0) ? evalResult[0].value : null;
};

const evaluateXPath = function(path, content) {
  const xmlDocument = new Dom().parseFromString(content);
  const node = select(xmlDocument, path)[0];
  if (node.nodeType === _xmlAttributeNodeType) {
    return node.value;
  }

  return node.firstChild.data; // element or comment
};

const evaluatePath = function(path, content) {
  const contentType = getContentType(content);

  switch (contentType) {
    case 'json':
      return evaluateJsonPath(path, content);
    case 'xml':
      return evaluateXPath(path, content);
    default:
      return null;
  }
};

const getAssertionResult = function(success, expected, actual, apickliInstance) {
  return {
    success,
    expected,
    actual,
    response: {
      statusCode: apickliInstance.getResponseObject().statusCode,
      headers: apickliInstance.getResponseObject().headers,
      body: apickliInstance.getResponseObject().body,
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
  if (!this.clientTLSConfig.hasOwnProperty(configurationName)) {
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

Apickli.prototype.get = function(resource, callback) { // callback(error, response)
  resource = this.replaceVariables(resource);
  this.sendRequest('GET', resource, callback);
};

Apickli.prototype.post = function(resource, callback) { // callback(error, response)
  resource = this.replaceVariables(resource);
  this.sendRequest('POST', resource, callback);
};

Apickli.prototype.put = function(resource, callback) { // callback(error, response)
  resource = this.replaceVariables(resource);
  this.sendRequest('PUT', resource, callback);
};

Apickli.prototype.delete = function(resource, callback) { // callback(error, response)
  resource = this.replaceVariables(resource);
  this.sendRequest('DELETE', resource, callback);
};

Apickli.prototype.patch = function(resource, callback) { // callback(error, response)
  resource = this.replaceVariables(resource);
  this.sendRequest('PATCH', resource, callback);
};

Apickli.prototype.options = function(resource, callback) { // callback(error, response)
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

Apickli.prototype.assertResponseDoesNotContainHeader = function(header, callback) {
  header = this.replaceVariables(header);
  const success = typeof this.getResponseObject().headers[header.toLowerCase()] == 'undefined';
  return getAssertionResult(success, true, false, this);
};

Apickli.prototype.assertResponseContainsHeader = function(header, callback) {
  header = this.replaceVariables(header);
  const success = typeof this.getResponseObject().headers[header.toLowerCase()] != 'undefined';
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

Apickli.prototype.assertPathInResponseBodyMatchesExpression = function(path, regexp) {
  path = this.replaceVariables(path);
  regexp = this.replaceVariables(regexp);
  const regExpObject = new RegExp(regexp);
  const evalValue = evaluatePath(path, this.getResponseObject().body);
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

Apickli.prototype.assertPathIsArray = function(path) {
  path = this.replaceVariables(path);
  const value = evaluatePath(path, this.getResponseObject().body);
  const success = Array.isArray(value);
  return getAssertionResult(success, 'array', typeof value, this);
};

Apickli.prototype.assertPathIsArrayWithLength = function(path, length) {
  path = this.replaceVariables(path);
  length = this.replaceVariables(length);
  let success = false;
  let actual = '?';
  const value = evaluatePath(path, this.getResponseObject().body);
  if (Array.isArray(value)) {
    success = value.length.toString() === length;
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
  header = this.replaceVariables(header); // only replace header. replacing variable name wouldn't make sense
  const value = this.getResponseObject().headers[header.toLowerCase()];
  this.scenarioVariables[variableName] = value;
};

Apickli.prototype.storeValueOfResponseBodyPathInScenarioScope = function(path, variableName) {
  path = this.replaceVariables(path); // only replace path. replacing variable name wouldn't make sense
  const value = evaluatePath(path, this.getResponseObject().body);
  this.scenarioVariables[variableName] = value;
};

Apickli.prototype.assertScenarioVariableValue = function(variable, value) {
  value = this.replaceVariables(value); // only replace value. replacing variable name wouldn't make sense
  return (String(this.scenarioVariables[variable]) === value);
};

Apickli.prototype.storeValueOfHeaderInGlobalScope = function(headerName, variableName) {
  headerName = this.replaceVariables(headerName); // only replace headerName. replacing variable name wouldn't make sense
  const value = this.getResponseObject().headers[headerName.toLowerCase()];
  this.setGlobalVariable(variableName, value);
};

Apickli.prototype.storeValueOfResponseBodyPathInGlobalScope = function(path, variableName) {
  path = this.replaceVariables(path); // only replace path. replacing variable name wouldn't make sense
  const value = evaluatePath(path, this.getResponseObject().body);
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
      callback(err);
    } else {
      const jsonSchema = JSON.parse(jsonSchemaString);
      const responseBody = JSON.parse(self.getResponseObject().body);

      const validate = jsonSchemaValidator(jsonSchema, {verbose: true});
      const success = validate(responseBody);
      callback(getAssertionResult(success, validate.errors, null, self));
    }
  });
};

Apickli.prototype.validateResponseWithSwaggerSpecDefinition = function(definitionName, swaggerSpecFile, callback) {
  const self = this;
  swaggerSpecFile = this.replaceVariables(swaggerSpecFile, self.scenarioVariables, self.variableChar);

  fs.readFile(path.join(this.fixturesDirectory, swaggerSpecFile), 'utf8', function(err, swaggerSpecString) {
    if (err) {
      callback(err);
    } else {
      const swaggerObject = JSON.parse(swaggerSpecString);
      const responseBody = JSON.parse(self.getResponseObject().body);

      spec.validateModel(swaggerObject, '#/definitions/' + definitionName, responseBody, function(err, result) {
        if (err) {
          callback(getAssertionResult(false, null, err, self));
        } else if (result && result.errors) {
          callback(getAssertionResult(false, null, result.errors, self));
        } else {
          callback(getAssertionResult(true, null, null, self));
        }
      });
    }
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

  const startIndex = resource.indexOf(variableChar, offset);
  if (startIndex >= 0) {
    const endIndex = resource.indexOf(variableChar, startIndex + 1);
    if (endIndex > startIndex) {
      const variableName = resource.substr(startIndex + 1, endIndex - startIndex - 1);
      const variableValue = scope && scope.hasOwnProperty(variableName) ? scope[variableName] : globalVariables[variableName];

      resource = resource.substr(0, startIndex) + variableValue + resource.substr(endIndex + 1);
      resource = this.replaceVariables(resource, scope, variableChar);
    }
  }
  return resource;
};

Apickli.prototype.sendRequest = function(method, resource, callback) {
  const self = this;
  const options = this.httpRequestOptions || {};
  options.url = this.domain + resource;
  options.method = method;
  options.headers = this.headers;
  options.qs = this.queryParameters;

  if (this.requestBody.length > 0) {
    options.body = this.requestBody;
  } else if (Object.keys(this.formParameters).length > 0) {
    options.form = this.formParameters;
  }

  const cookieJar = request.jar();
  this.cookies.forEach(function(cookie) {
    cookieJar.setCookie(request.cookie(cookie), self.domain);
  });

  options.jar = cookieJar;

  if (this.selectedClientTLSConfig.length > 0) {
    options.key = fs.readFileSync(this.clientTLSConfig[this.selectedClientTLSConfig].key);
    options.cert = fs.readFileSync(this.clientTLSConfig[this.selectedClientTLSConfig].cert);
    if (this.clientTLSConfig[this.selectedClientTLSConfig].ca) {
      options.ca = fs.readFileSync(this.clientTLSConfig[this.selectedClientTLSConfig].ca);
    }
  }

  if (method !== 'OPTIONS') {
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
