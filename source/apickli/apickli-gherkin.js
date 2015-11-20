/* jslint node: true */
'use strict';
module.exports = function() {

	this.Given(/^I set (.*) header to (.*)$/, function(headerName, headerValue, callback) {
		this.apickli.addRequestHeader(headerName, headerValue);
		callback();
	});

	this.Given(/^I set (.*) header to scenario variable (.*)$/, function(headerName, variableName, callback) {
		this.apickli.addRequestHeaderFromScenarioVariable(headerName, variableName);
		callback();
	});

	this.Given(/^I set (.*) header to global variable (.*)$/, function(headerName, variableName, callback) {
		this.apickli.addRequestHeaderFromGlobalVariable(headerName, variableName);
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
		if (this.apickli.assertResponseContainsHeader(header)) {
			callback();
		} else {
			callback.fail('response header ' + header + ' does not exists in response');
			console.log('      response header are ' + JSON.stringify(this.apickli.getRealValue()))
		}
	});

	this.Then(/^response header (.*) should not exist$/, function(header, callback) {
		if (this.apickli.assertResponseContainsHeader(header)) {
			callback.fail('response header ' + header + ' exists in response');
			console.log('      response headers are ' + JSON.stringify(this.apickli.getRealValue()))
		} else {
			callback();
		}
	});

	this.Then(/^response body should be valid (xml|json)$/, function(contentType, callback) {
		if (this.apickli.assertResponseBodyContentType(contentType)) {
			callback();
		} else {
			callback.fail('response body is not valid ' + contentType);
			console.log('      response body is \n' + this.apickli.getRealValue())
		}
	});

	this.Then(/^response code should be (\d+)$/, function(responseCode, callback) {
		if (this.apickli.assertResponseCode(responseCode)) {
			callback();
		} else {
			callback.fail('response code is not ' + responseCode);
			console.log('      response is \n' + JSON.stringify(this.apickli.getRealValue()))
		}
	});

	this.Then(/^response code should not be (\d+)$/, function(responseCode, callback) {
		if (this.apickli.assertResponseCode(responseCode)) {
			callback.fail('response code should not be ' + responseCode);
			console.log('      response code is \n' + JSON.stringify(this.apickli.getRealValue()))
		} else {
			callback();
		}
	});

	this.Then(/^response header (.*) should be (.*)$/, function(header, expression, callback) {
		if (this.apickli.assertHeaderValue(header, expression)) {
			callback();
		} else {
			callback.fail('response header ' + header +' should be ' + expression);
			console.log('      response header ' + header + ' is ' + this.apickli.getRealValue())
		}
	});

	this.Then(/^response header (.*) should not be (.*)$/, function(header, expression, callback) {
		if (this.apickli.assertHeaderValue(header, expression)) {
			callback.fail('response header ' + header + ' should be ' + expression);
			console.log('      response header ' + header + ' is ' + this.apickli.getRealValue())
		} else {
			callback();
		}
	});

	this.Then(/^response body should contain (.*)$/, function(expression, callback) {
		if (this.apickli.assertResponseBodyContainsExpression(expression)){
			callback();
		}
		else {
			callback.fail('reponse body should contain ' + expression);
			console.log('      response body is\n' + this.apickli.getRealValue())
		}
	});

	this.Then(/^response body should not contain (.*)$/, function(expression, callback) {
		if(!this.apickli.assertResponseBodyContainsExpression(expression)) {
			callback();
		}
		else {
			var realValue = this.apickli.getRealValue();
			callback.fail('reponse body should not contain ' + expression);
			console.log('      response body is\n' + realValue);
		}
	});

	this.Then(/^the JSON should be$/, function(expression, callback) {
		if(this.apickli.assertResponseBodyIsJSON(expression)) {
			callback();
		}
		else {
			callback.fail('response body should be \n' + expression);
		  console.log('      response body is\n' + this.apickli.getRealValue());
		}
	});

	this.Then(/^response body path (.*) should be (.*)$/, function(path, value, callback) {
		if (this.apickli.assertPathInResponseBodyMatchesExpression(path, value)) {
			callback();
		} else {
			callback.fail('response body path ' + path + ' should be ' + value);
		  console.log('      response body is\n' + this.apickli.getRealValue());
		}
	});

	this.Then(/^response body path (.*) should not be (.*)$/, function(path, value, callback) {
		if (this.apickli.assertPathInResponseBodyMatchesExpression(path, value)) {
			callback.fail('response body path ' + path + ' should not be ' + value);
		  console.log('      response body is\n' + this.apickli.getRealValue());
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
		if (this.apickli.assertScenarioVariableValue(variableName, variableValue)) {
			callback();
		} else {
			callback.fail('value of scenario variable ' + variableName + ' should be ' + variableValue);
			console.log('      value of scenario variable ' + variableName + ' is ' + this.apickli.getRealValue());
		}
	});

	this.Then(/^value of global variable (.*) should be (.*)$/, function(variableName, variableValue, callback) {
		if (this.apickli.assertGlobalVariableValue(variableName, variableValue)) {
			callback();
		} else {
			callback.fail('value of global variable ' + variableName + ' should be ' + variableValue);
			console.log('      value of global variable ' + variableName + ' is ' + this.apickli.getRealValue());
		}
	});
};
