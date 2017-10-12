/* eslint new-cap: "off", no-invalid-this: "off" */

'use strict';

const {defineSupportCode} = require('cucumber');

defineSupportCode(function({Given, When, Then}) {
    Given(/^I use the mock target$/, function(callback) {
        this.apickli.domain = 'https://localhost';
        callback();
    });
});
