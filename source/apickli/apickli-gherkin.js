/* jslint node: true */
'use strict';

module.exports = function() {

	this.Given(/^I set (.*) header to (.*)$/, function(headerName, headerValue, callback) {
		this.apickli.addRequestHeader(headerName, headerValue);
		callback();
	});

	this.Given(/^I set body to (.*)$/, function(bodyValue, callback) {
		this.apickli.setRequestBody(bodyValue);
		callback();
	});

	this.Given(/^I pipe contents of file (.*) to body$/, function(file, callback) {
		this.apickli.pipeFileContentsToRequestBody(file, function(error) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.Given(/^I have basic authentication credentials (.*) and (.*)$/, function(username, password, callback) {
		this.apickli.addHttpBasicAuthorizationHeader(username, password);
		callback();
	});

	this.When(/^I GET (.*)$/, function(resource, callback) {
		this.apickli.get(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I POST to $resource', function(resource, callback) {
		this.apickli.post(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I PUT $resource', function(resource, callback) {
		this.apickli.put(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I DELETE $resource', function(resource, callback) {
		this.apickli.delete(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I PATCH $resource', function(resource, callback) {
		this.apickli.patch(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.Then(/^response header (.*) should exist$/, function(header, callback) {
		var assertionResult = this.apickli.assertResponseContainsHeader(header);
		if (assertionResult.success) {
			callback();
		} else {
			callback.fail('response header ' + header + ' does not exists in response');
		}
	});

	this.Then(/^response header (.*) should not exist$/, function(header, callback) {
		var assertionResult = this.apickli.assertResponseContainsHeader(header);
		if (assertionResult.success) {
			callback.fail('response header ' + header + ' exists in response');
		} else {
			callback();
		}
	});

	this.Then(/^response body should be valid (xml|json)$/, function(contentType, callback) {
		var assertionResult = this.apickli.assertResponseBodyContentType(contentType);
		if (assertionResult.success) {
			callback();
		} else {
			callback.fail('Content Type Expected: ' + assertionResult.expected + ' Actual:' + assertionResult.actual);
		}
	});

	this.Then(/^response code should be (\d+)$/, function(responseCode, callback) {
		var assertionResult = this.apickli.assertResponseCode(responseCode);
		if (assertionResult.success) {
			callback();
		} else {
			callback.fail('Response code Expected: ' + assertionResult.expected + " Actual:" + assertionResult.actual);
		}
	});

	this.Then(/^response code should not be (\d+)$/, function(responseCode, callback) {
		var assertionResult = this.apickli.assertResponseCode(responseCode);
		if (assertionResult.success) {
			callback.fail('response code is ' + responseCode);
		} else {
			callback();
		}
	});

	this.Then(/^response header (.*) should be (.*)$/, function(header, expression, callback) {
		var assertionResult = this.apickli.assertHeaderValue(header, expression);
		if (assertionResult.success) {
			callback();
		} else {
			callback.fail('Response header Expected: ' + assertionResult.expected + ' Actual:' + assertionResult.actual);
		}
	});

	this.Then(/^response header (.*) should not be (.*)$/, function(header, expression, callback) {
		var assertionResult = this.apickli.assertHeaderValue(header, expression);
		if (assertionResult.success) {
			callback.fail('response header ' + header + ' is ' + expression);
		} else {
			callback();
		}
	});

	this.Then(/^response body should contain (.*)$/, function(expression, callback) {
		var assertionResult = this.apickli.assertResponseBodyContainsExpression(expression)
		if (assertionResult.success) {
			callback();
		} else {
			callback.fail('Response body ' + assertionResult.data + ' doesn\'t contain ' + assertionResult.expected);
		}
	});

	this.Then(/^response body should not contain (.*)$/, function(expression, callback) {
		var assertionResult = this.apickli.assertResponseBodyContainsExpression(expression);
		if (assertionResult.success) {
			callback.fail('response body contains ' + expression);
		} else {
			callback();
		}
	});

	this.Then(/^response body path (.*) should be (.*)$/, function(path, value, callback) {
		var assertionResult = this.apickli.assertPathInResponseBodyMatchesExpression(path, value);
		if (assertionResult.success) {
			callback();
		} else {
			callback.fail('Response body value Expected: ' + assertionResult.expected + ' Actual:' + assertionResult.actual);
		}
	});

	this.Then(/^response body path (.*) should not be (.*)$/, function(path, value, callback) {
		if (this.apickli.assertPathInResponseBodyMatchesExpression(path, value)) {
			callback.fail('response body path ' + path + ' matches ' + value);
		} else {
			callback();
		}
	});

	this.Then(/^I store the value of body path (.*) as access token$/, function(path, callback) {
		this.apickli.setAccessTokenFromResponseBodyPath(path);
		callback();
	});

	this.When(/^I set bearer token$/, function(callback) {
		this.apickli.setBearerToken();
		callback();
	});

	this.Then(/^I store the value of response header(.*) as (.*) in global scope$/, function(headerName, variableName, callback) {
		this.apickli.storeValueOfHeaderInGlobalScope(headerName, variableName);
		callback();
	});

	this.Then(/^I store the value of body path (.*) as (.*) in global scope$/, function(path, variableName, callback) {
		this.apickli.storeValueOfResponseBodyPathInGlobalScope(path, variableName);
		callback();
	});

	this.When(/^I store the value of response header (.*) as (.*) in scenario scope$/, function(name, variable, callback) {
		this.apickli.storeValueOfHeaderInScenarioScope(name, variable);
		callback();
	});

	this.When(/^I store the value of body path (.*) as (.*) in scenario scope$/, function(path, variable, callback) {
		this.apickli.storeValueOfResponseBodyPathInScenarioScope(path, variable);
		callback();
	});

	this.Then(/^value of scenario variable (.*) should be (.*)$/, function(variableName, variableValue, callback) {
		var assertionResult = this.apickli.assertScenarioVariableValue(variableName, variableValue)
		if (assertionResult.success) {
			callback();
		} else {
			callback.fail('Variable value Expected:' + assertionResult.expected + ' Actual:' + assertionResult.actual);
		}
	});
};
