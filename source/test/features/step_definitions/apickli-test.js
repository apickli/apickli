/* jslint node: true */
'use strict';

console.log('Using local apickli for testing');
var apickli = require('../../../apickli/apickli.js');

var subtractionResult;

module.exports = function() {
	// cleanup before every scenario
	this.Before(function(scenario, callback) {
		this.apickli = new apickli.Apickli('http', 'httpbin.org');
		callback();
	});
    
    this.Given(/^I store the raw value (.*) as (.*) in scenario scope$/, function (value, variable, callback) {
        this.apickli.storeValueInScenarioScope(variable, value);
        callback();
    });

	this.When(/^I subtract (.*) from (.*)$/, function(variable1, variable2, callback) {
		var value1 = this.apickli.getGlobalVariable(variable1); 
		var value2 = this.apickli.getGlobalVariable(variable2);
		subtractionResult = value2 - value1;

		callback();
	});

	this.Then(/^result should be (\d+)$/, function(result, callback) {
		if (subtractionResult == result) {
			callback();
		} else {
			callback.fail(subtractionResult + ' is not equal to ' + result);
		}
	});
};
