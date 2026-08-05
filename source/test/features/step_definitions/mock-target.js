/* eslint new-cap: "off", no-invalid-this: "off" */

'use strict';

const {Given} = require('@cucumber/cucumber');

Given(/^I use the mock target$/, function(callback) {
  this.apickli.domain = 'https://127.0.0.1:5000';
  callback();
});
