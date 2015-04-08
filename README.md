# apickli - API integration testing framework

**Apickli** is a REST API integration testing framework based on cucumber.js.

It provides a gherkin framework and a collection of utility functions to make API testing easy and less time consuming.

**Apickli** is also available as an [NPM package](https://www.npmjs.com/package/apickli).

[Cucumber.js](https://github.com/cucumber/cucumber-js) is JavaScript & Node.js implementation of Behaviour Driven Development test framework - [Cucumber](http://cukes.info/). Cucumber.js is using [Gherkin](http://cukes.info/gherkin.html) language for describing the test scenarios in [BDD](http://en.wikipedia.org/wiki/Behavior-driven_development) manner.  

## How to start - a simple tutorial

**Apickli** depends on cucumber.js being installed on your system. You can do this by installing cucumber.js globally:

    $: npm install -g cucumber

### Copy example project

You can copy existing `example-project` directory in this code repositary which has scelethon test project created with tests against `httpbin.org`

### Start new project

Below steps will help you to begin with API end 2 end integration tests.

Let's start a new integration testing project for an API called *myapi*. The folder structure will need to match the structure expected by cucumber.js:

    test/
    ---- features/
    --------- myapi.feature
    --------- step_definitions/
    -------------- myapi.js
    ---- package.json
    
Features directory contains cucumber feature files written in gherkin syntax. step_definitions contains the JavaScript implementation of gherkin test cases. Check out the GitHub repository for example implementations covering most used testing scenarios.

This can be an example package.json file for our project:

```
{
	"name": "myapi-test",
	"version": "1.0.0",
	"description": "Integration testing for myapi v1",
	"dependencies": {
		"apickli": "latest"
	}
}
```

Now we can get the project dependencies installed: 

    $ npm install
    
We can now start defining our scenarios for the test. For this tutorial, we will be borrowing sections from the example scenarios in apickli source code. 

Let's start with the scenario file called *myapi.feature*. Full scenario definition with various other functions can be found here: https://github.com/apickli/apickli/blob/master/features/httpbin.feature

```
Feature:
	Httpbin.org exposes various resources for HTTP request testing
	As Httpbin client I want to verify that all API resources are working as they should

	Scenario: Setting headers in GET request
		Given I set User-Agent header to apickli
		When I GET /get
		Then response body path $.headers.User-Agent should be apickli
```
We now need the corresponding step definition file, called *myapi.js*. We will be borrowing the relevant sections from apickli source code again. Full functionality can be found here: https://github.com/apickli/apickli/blob/master/features/step_definitions/httpbin.js

```
/* jslint node: true */
'use strict';

var apickli = require('apickli');

module.exports = function() {

	// cleanup before every scenario
	this.Before(function(callback) {
		this.apickli = new apickli.Apickli('http', 'httpbin.org');
		callback();
	});

	this.Given(/^I set (.*) header to (.*)$/, function(headerName, headerValue, callback) {
		this.apickli.addRequestHeader(headerName, headerValue);
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

	this.Then(/^response body path (.*) should be (.*)$/, function(path, value, callback) {
		if (this.apickli.evaluatePathInResponseBody(path, value)) {
			callback();
		} else {
			callback.fail('response body path ' + path + ' doesn\'t match ' + value);
		}
	});
};
```


The following will run our scenario (in the project directory):

    $ cucumber-js features/httpbin.feature
    ....

	1 scenario (1 passed)
	3 steps (3 passed)
	
## Grunt integration
    
You can also use [Grunt](http://gruntjs.com/) task runner to run the tests. 

Start by adding a Gruntfile.js to the project root:

```
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		cucumberjs: {
			src: 'features',
			options: {
				format: 'pretty',
				steps: 'features/step_definitions'
			}
		}
	});

	grunt.loadNpmTasks('grunt-cucumber');
	grunt.registerTask('tests', ['cucumberjs']);
}
```

Add grunt and grunt-cucumber dependencies to package.json:

```
	...
	"dependencies": {
		"apickli": "latest",
		"grunt": "latest",
		"grunt-cucumber": "latest"
	}
	...
```

Install the new dependencies:

```
npm install
```
Now you can run the same tests using grunt:

```
$ grunt tests
Running "cucumberjs:src" (cucumberjs) task

Feature:
  Httpbin.org exposes various resources for HTTP request testing
  As Httpbin client I want to verify that all API resources are working as they should


  Scenario: Setting headers in GET request                         # features/httpbin.feature:5
    Given I set User-Agent header to apickli                       # features/httpbin.feature:6
    When I GET /get                                                # features/httpbin.feature:7
    Then response body path $.headers.User-Agent should be apickli # features/httpbin.feature:8


1 scenario (1 passed)
3 steps (3 passed)

Done, without errors.
``` 
## Gherkin Expressions
The following gherkin expressions are implemented in httpbin.feature and httpbin.js example scenario definitions in apickli source code:

```
GIVEN:
	I set (.*) header to (.*)
	I set body to (.*)
	I pipe contents of file (.*) to body
	I have basic authentication credentials (.*) and (.*)
	
WHEN:
	I GET $resource
	I POST $resource
	I PUT $resource
	I DELETE $resource
	
THEN:
	response header (.*) should exist
	response header (.*) should not exist
	response body should be valid (xml|json)
	response code should be (\d+)
	response code should not be (\d+)
	response header (.*) should be (.*)
	response header (.*) should not be (.*)
	response body should contain (.*)
	response body should not contain (.*)
	response body path (.*) should be (.*)
	response body path (.*) should not be (.*)
	I store the value of response header (.*) as (.*) in scenario scope
	I store the value of body path (.*) as (.*) in scenario scope
	value of scenario variable (.*) should be (.*)
```

The simplest way to adopt these expressions is to copy https://github.com/apickli/apickli/blob/master/features/step_definitions/httpbin.js into your own project folder (step_definitions folder) and change the file name to something like apickli.js.
        
## Contributing

If you have any comments or suggestions, feel free to raise [an issue](https://github.com/apickli/apickli/issues) or fork the project and issue a pull request with suggested improvements.