# apickli - REST API integration testing framework with cucumber.js

![NPM version](https://badge.fury.io/js/apickli.svg)
[![Build Status](https://travis-ci.org/apickli/apickli.svg?branch=master)](https://travis-ci.org/apickli/apickli)
[![NPM](https://nodei.co/npm/apickli.png)](https://nodei.co/npm/apickli/)


**Apickli** is a REST API integration testing framework based on cucumber.js.

It provides a gherkin framework and a collection of utility functions to make API testing easy and less time consuming.

**Apickli** is also available as an [NPM package](https://www.npmjs.com/package/apickli).

[Cucumber.js](https://github.com/cucumber/cucumber-js) is JavaScript & Node.js implementation of Behaviour Driven Development test framework - [Cucumber](http://cukes.info/). Cucumber.js is using [Gherkin](http://cukes.info/gherkin.html) language for describing the test scenarios in [BDD](http://en.wikipedia.org/wiki/Behavior-driven_development) manner.

## How to start - a simple tutorial

### Start new project

Below steps will help you start a new test project from scratch.

#### 1. Folder structure
Let's start a new integration testing project for an API called *myapi*. The folder structure will need to match the structure expected by cucumber.js:

    test/
    ---- features/
    --------- step_definitions/
    -------------- apickli-gherkin.js
    --------- support/
    -------------- init.js
    --------- myapi.feature
    ---- package.json

Features directory contains cucumber feature files written in gherkin syntax. step_definitions contains the JavaScript implementation of gherkin test cases. Check out the GitHub repository for example implementations covering most used testing scenarios.

#### 2. Package.json
This can be an example package.json file for our project:

```json
{
	"name": "myapi-test",
	"version": "1.0.0",
	"description": "Integration testing for myapi v1",
	"dependencies": {
		"apickli": "latest"
	}
}
```

#### 3. Install dependencies
Now we can get the project dependencies installed:

```sh
$ npm install
```

#### 4. Scenario definitions

Let's start with the scenario file called *myapi.feature*. For more examples of
feature and scenario definitions, check out [test folder](source/test).

```
Feature:
	Httpbin.org exposes various resources for HTTP request testing
	As Httpbin client I want to verify that all API resources are working as they should

	Scenario: Setting headers in GET request
		Given I set User-Agent header to apickli
		When I GET /get
		Then response body path $.headers.User-Agent should be apickli
```

#### 5. Get apickli-gherkin steps
We now need the corresponding step definitions that implement the steps in our scenario. Apickli has a collection of steps already implemented - ready to be included in your project - see [gherkin expressions](#gherkin-expressions).

The simplest way to adopt these expressions is to create a file named apickli-gherkin.js in features/step_definitions and import the apickli/gherkin.js module.

Add the following to test/features/step_definitions/apickli-gherkin.js
```javascript
module.exports = require('apickli/apickli-gherkin');
```

#### 6. Support code
Now we need a support code to implement cucumber hooks and initialize apickli. Add the following in features/support/init.js:

```js
'use strict';

const apickli = require('apickli');
const {defineSupportCode} = require('cucumber');

defineSupportCode(function({Before}) {
    Before(function() {
        this.apickli = new apickli.Apickli('http', 'httpbin.org');
        this.apickli.addRequestHeader('Cache-Control', 'no-cache');
    });
});
```

#### 7. Run tests with cucumber.js
The following will run our scenario (in the project directory):

```sh
$ cucumber-js features/myapi.feature
....

1 scenario (1 passed)
3 steps (3 passed)
```

## Step timeout
Cucumber.js default step timeout is 5000ms. Add the following to features/support/init.js in order to change it:

```javascript
defineSupportCode(function({setDefaultTimeout}) {
    setDefaultTimeout(60 * 1000); // this is in ms
});
```

## Grunt integration

You can also use [Grunt](http://gruntjs.com/) task runner to run the tests.

### 1. Start by adding a Gruntfile.js to the project root:

```js
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

### 2. Add grunt and grunt-cucumber dependencies to package.json:

```json
	...
	"dependencies": {
		"apickli": "latest",
		"grunt": "latest",
		"grunt-cucumber": "latest"
	}
	...
```

### 3. Install the new dependencies:

```sh
npm install
```

### 4. Now you can run the same tests using grunt:

```sh
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
## Gulp Integration
You can also use [Gulp](http://gulpjs.com/) to run the tests.

### 1. Start by adding a Gulpfile.js to the project root:

```js
var gulp = require('gulp');
var cucumber = require('gulp-cucumber');

gulp.task('test', function() {
    return gulp.src('features/*')
			.pipe(cucumber({
				'steps': 'features/step_definitions/*.js',
				'format': 'pretty'
			}));
});
```
### 2. Add gulp and gulp-cucumber dependencies to package.json:

```json
...
	"gulp": "latest",
	"gulp-cucumber": "latest"
...
```
### 3. Install local dependencies

```sh
$ npm install
```

### 4. Install gulp globally

```sh
$ npm install -g gulp
```

See [https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md).

### 5. Run tests using gulp
```sh
$ gulp test
```

## Gherkin Expressions
The following gherkin expressions are implemented in apickli source code [source/apickli/apickli-gherkin.js](source/apickli/apickli-gherkin.js):

```
GIVEN:
	I set (.*) header to (.*)
    	I set cookie to (.*)
	I set body to (.*)
	I pipe contents of file (.*) to body
	I have basic authentication credentials (.*) and (.*)
	I set bearer token
	I have (.+) client TLS configuration
	I set query parameters to (data table with headers |parameter|value|)
	I set headers to (data table with headers |name|value|)
    	I set form parameters to (data table with headers |parameter|value|)

WHEN:
	I GET $resource
	I POST to $resource
	I PUT $resource
	I DELETE $resource
	I PATCH $resource
	I request OPTIONS for $resource

THEN:
	response code should be (\d+)
	response code should not be (\d+)
	response header (.*) should exist
	response header (.*) should not exist
	response header (.*) should be (.*)
	response header (.*) should not be (.*)
	response body should be valid (xml|json)
	response body should contain (.*)
	response body should not contain (.*)
	response body path (.*) should be (.*)
	response body path (.*) should not be (.*)
   	response body path (.*) should be of type array
   	response body path (.*) should be of type array with length (\d+)
   	response body should be valid according to schema file (.*)
   	response body should be valid according to openapi description (.*) in file (.*)
	I store the value of body path (.*) as access token
	I store the value of response header (.*) as (.*) in scenario scope
	I store the value of body path (.*) as (.*) in scenario scope
	value of scenario variable (.*) should be (.*)
	I store the value of response header (.*) as (.*) in global scope
	I store the value of body path (.*) as (.*) in global scope
```

## Setting Proxy Server
apickli uses node.js request module for HTTP communications which supports setting proxy servers via the following environment variables:
* HTTP_PROXY / http_proxy
* HTTPS_PROXY / https_proxy
* NO_PROXY / no_proxy

For more information, see https://github.com/request/request#controlling-proxy-behaviour-using-environment-variables

## Variable Injection

It is possible to use Scenario Variables in a Feature file, that will have values injected when the tests are run. Whilst defining values explicitly provides better clarity to those reading a feature file, there are some configuration values such as Client Id which it is easier to externalise.

By default, backticks are use to indicate a variable in a feature file. When instantiating Apickli, a different character can be passed as a parameter. In order to follow BDD best practices, global variables should not be used in the way. Each Scenario should be independent, and as such if you would like to define configurable variables it should be done using the Before hook:

See [source/test/features/injecting-variables.feature](source/test/features/injecting-variables.feature) for examples.

## Client Authentication

In order to make a request to a server that is protected by Mutual TLS, you must specify your client TLS configuration. This can be done when initializing Apickli as shown below.

``` shell
defineSupportCode(function({Before}) {
    Before(function() {
        this.apickli = new apickli.Apickli('http', 'httpbin.org');
        this.apickli.clientTLSConfig = {
            valid: {
                key: './fixtures/client-key.pem',
                cert: './fixtures/client-crt.pem',
                ca: './fixtures/ca-crt.pem',
            },
        };
    });
});
```

This configuration can then be referenced using the following step definitions.

``` shell
Given I have valid client TLS configuration
```

## Contributing

If you have any comments or suggestions, feel free to raise [an issue](https://github.com/apickli/apickli/issues) or fork the project and issue a pull request with suggested improvements.
