'use strict';

var apickli = require('../support/apickli.js');
var httpClient;
var util = new apickli.Util();

var apickliStepDefinitionsWrapper = function() {

	// cleanup before every scenario
	this.Before(function(callback) {
		httpClient = new apickli.HttpClient();
		callback();
	});

	this.Given(/^I set (.*) header to (.*)$/, function(headerName, headerValue, callback) {
		httpClient.addHeader(headerName, headerValue);
    	callback();
	});

	this.Given(/^I set body to (.*)$/, function(bodyValue, callback) {
		httpClient.setRequestBody(bodyValue);
		callback();
	});

    this.Given(/^I have basic authentication credentials (.*) and (.*)$/, function(username, password, callback) {
        var base64String = new Buffer(username + ':' + password).toString('base64');
		httpClient.addHeader('Authorization', base64String);
        callback();
    });

    this.When(/^I GET (.*)$/, function(resource, callback) {
		httpClient.get(resource, function(error, response) {
			if (error) {
				return callback.fail(error);
			}

			callback();
		});
    });

	this.When('I POST $resource', function(resource, callback) {
		httpClient.post(resource, function(error, response) {
			if (error) {
				return callback.fail(error);
			}

			callback();
		});
	});

	this.Then(/^response body path (.*) should be (.*)$/, function(path, value, callback) {
		var evalValue = util.evalPath(path, httpClient.getResponse().body);

		if (evalValue == value) {
			callback();
		} else {
			callback.fail('response body path ' + path + ' isn\t ' + value);
		}
	});

	this.Then(/^response body should contain (.*)$/, function(value, callback) {
		if (util.assertStringContains(httpClient.getResponse().body, value)) {
			callback();
		} else {
			callback.fail('response body doesn\'t contain: ' + value);
		}
	});

	this.Then(/^response header (.*) should exist$/, function(header, callback) {
		if (httpClient.getResponse().headers[header]) {
			callback();
		} else {
			callback.fail('response header ' + header + ' doesn\'t exist in response');
		}
	});

	this.Then(/^response header (.*) should not exist$/, function(header, callback) {
		if (httpClient.getResponse().headers[header]) {
			callback.fail('response header ' + header + ' exists in response');
		} else {
			callback();
		}
	});

	this.Then(/^response code should be (\d+)$/, function(responseCode, callback) {
		if (httpClient.getResponse().statusCode == responseCode) {
			callback();
		} else {
			callback.fail('response code isn\'t ' + responseCode + ', it\'s ' + httpClient.getResponse().statusCode);
		}
	});

	this.Then(/^response code should not be (\d+)$/, function(responseCode, callback) {
		if (httpClient.getResponse().statusCode != responseCode) {
			callback();
		} else {
			callback.fail('response code is ' + responseCode);
		}
	});

	this.Then(/^response header (.*) should be (.*)$/, function(name, value, callback) {
		var realValue = httpClient.getResponse().headers[name.toLowerCase()];
		var regex = new RegExp(value);
		if (regex.test(realValue)) {
			callback();
		} else {
			callback.fail('response header ' + name + ' isn\'t ' + value + ', it\'s ' + realValue);
		}
	});

	this.Then(/^response header (.*) should not be (.*)$/, function(name, value, callback) {
		var realValue = httpClient.getResponse().headers[name.toLowerCase()];
		var regex = new RegExp(value);
		if (!regex.test(realValue)) {
			callback();
		} else {
			callback.fail('response header ' + name + ' is ' + value);
		}
	});

	this.Then(/^response body should contain (.*)$/, function(value, callback) {
		var regex = new RegExp(value);
		if (regex.test(httpClient.getResponse().body)) {
			callback();
		} else {
			callback.fail('response body doesn\'t contain ' + value);
		}
	});

	this.Then(/^response body should not contain (.*)$/, function(value, callback) {
		var regex = new RegExp(value);
		if (!regex.test(httpClient.getResponse().body)) {
			callback();
		} else {
			callback.fail('response body contains ' + value);
		}
	});
};

module.exports = apickliStepDefinitionsWrapper;

////////////////////////////////////////////// 
// Setup variables and data related         //
// to this specific feature implementation  //
//////////////////////////////////////////////
// var url;
// var headers;


// // Step definitions
// var apickliWraper = function () {

//   // overwrite default World constructor
//   this.World = require('../functions/world.js').World;

//   /* GIVEN */


//   /* WHEN */

//   this.When('I GET a $resourcepath resource', function(path,callback) {

//     url = 'http://httpbin.org';
//     url = url+'/'+path;
//     this.get(url,headers,callback)

//   })


//   /* THEN */

//   // Generic definition to validate http response code
//   this.Then('the http response status should be $status', function(status, callback) {
//     if (!this.assertResponse(this.lastResponse, callback)) { return }
//     if (this.lastResponse.statusCode != status) {
//       callback.fail('The http response did not have the expected ' +
//         'response code, expected ' + status + ' but got ' +
//         this.lastResponse.statusCode)
//     } else {
//       callback()
//     }
//   });

//   // Generic definition to test if response body contains a string
//   this.Then('the response message should contain "$string"', function(string, callback) {

//     // this function also checks for valid response body
//     // and valid JSON
//     if (!this.assertStringInResponse(this.lastResponse, string, callback)){
//       callback.fail('Response body has no string: '+string+' present. Response body: '+this.lastResponse.body)
//     } else {
//       callback()
//     }
//   });

//   // Generic definition for testing http response header contents
//   this.Then('the response header should have "$string" element', function(string, callback) {
//     if (!this.assertHeaderInResponse(this.lastResponse, string, callback)){
//       callback.fail('Response header has no element: '+string+' present. Response headers: '+this.lastResponse.headers)
//     } else {
//       callback()
//     }
//   });

// }

// module.exports = apickliWraper;
