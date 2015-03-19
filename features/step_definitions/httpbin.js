'use strict';

var apickli = require('../support/apickli.js');

module.exports = function() {

	// cleanup before every scenario
	this.Before(function(callback) {
		this.httpClient = new apickli.HttpClient('http', 'httpbin.org');
		callback();
	});

	//this.Then(/^value of (feature|scenario) variable (.*) should be (.*)$/, function(scope, variableName, variableValue, callback) {
	//	if ((scope === 'feature') && (this.featureVariables[variableName] !== variableValue)) {
	//		callback.fail('value of ' + scope + ' variable ' + variableName + ' isn\'t equal to ' + variableValue + ', it\'s ' + this.featureVariables[variableName]);
	//	} else if ((scope === 'scenario') && (this.scenarioVariables[variableName] !== variableValue)) {
	//		callback.fail('value of ' + scope + ' variable ' + variableName + ' isn\'t equal to ' + variableValue + ', it\'s ' + this.scenarioVariables[variableName]);
	//	}

	//	callback();
	//});

};
