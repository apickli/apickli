'use strict';

var jsonPath = require('JSONPath');
var libxmljs = require('libxmljs');
var apickliFunctions = require('../functions/apickli-functions.js');

var headers = {};
var lastResponse = null;

var apickliStepDefinitionsWrapper = function() {

	this.Before(function(callback) {
		headers = {};
		lastResponse = null;
		callback();
	});

    this.Given('I set $headerName header to $headerValue', function(headerName, headerValue, callback) {
    	headers[headerName] = headerValue;
    	callback();
    });

    this.When('I GET $resource', function(resource, callback) {
        var url = 'http://httpbin.org';
        url = url + '/' + resource;
        apickliFunctions.get(url, headers, function(response) {
        	lastResponse = response;
        	callback();
        });
    });

    this.Then('response body path $path should be $value', function(path, value, callback) {
    	var contentType = apickliFunctions.getResponseBodyContentType(lastResponse.body);

    	if (contentType === 'json') {
    		var bodyJsonObject = JSON.parse(lastResponse.body);
    		var realValue = jsonPath.eval(bodyJsonObject, path);
    		if (realValue == value) {
    			callback();
    		} else {
    			callback.fail('response body path ' + path + ' isn\'t ' + value);
    		}
    	} else if (contentType === 'xml') {
    		var xml = libxmljs.parseXml(lastResponse.body);
    		var realValue = xml.get(path).text();
    		console.log(realValue);
    		if (realValue == value) {
    			callback();
    		} else {
    			callback.fail('response body path ' + path + ' isn\'t ' + value);
    		}
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

// module.exports = apickliWraper
