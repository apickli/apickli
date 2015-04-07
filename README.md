# apickli - API integration testing framework

**Apickli** is a Node.js package and REST API integration testing framework based on cucumber.js and Gherkin.

It provides a gherkin framework and a collection of utility functions to make API testing easy and less time consuming.

**Apickli** is available as an *npm* package via [Node Package Manager repository](https://www.npmjs.com/package/apickli)

[Cucumber.js](https://github.com/cucumber/cucumber-js) is JavaScript & Node.js implementation of Behaviour Driven Development test framework - [Cucumber](http://cukes.info/). Cucumber.js is using [Gherkin](http://cukes.info/gherkin.html) language for describing the test scenarios in [BDD](http://en.wikipedia.org/wiki/Behavior-driven_development) manner.  

## How to start - a simple tutorial

**Apickli** depends on cucumber.js being installed on your system. You can do this by installing cucumber.js globaly:

    $: npm install -g cucumber

Let's start a new integration testing folder for an API called *myapi*. The folder structure will need to match the structure expected by cucumber-js:

    test/
    ---- features/
    --------- myapi.feature
    --------- step_definitions/
    -------------- myapi.js
    ---- package.json
    
Features directory contains Cucumber feature files written in Gherkin. Step_definitions contains the JavaScript implementation of Gherkin test cases. Check out the GitHub repository for example implementations covering most used testing scenarios.

This can be an example package.json file:

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

Now we can get all project dependencies installed: 

    $ npm install
    
We can now start defining our scenarios for the test. For this tutorial, we will be borrowing sections from the example scenario in apickli source. 

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
    
You can use [Grunt](http://gruntjs.com/) task runner to run the tests. In order to do that, you will need to add two more dependencies to our project:

Add a Gruntfile.js to the project root:

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
        
### Contributing

If you have any comments or suggestions, feel free to raise [an issue](https://github.com/apickli/apickli/issues) or fork the project and issue a pull request with suggested improvements.