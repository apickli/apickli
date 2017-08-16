/* eslint new-cap: "off", no-invalid-this: "off" */

'use strict';

const apickli = require('../../../apickli/apickli.js');
const {defineSupportCode} = require('cucumber');

defineSupportCode(function({Before}) {
    Before(function() {
        this.apickli = new apickli.Apickli('http', 'httpbin.org');
        this.apickli.addRequestHeader('Cache-Control', 'no-cache');
    });
});

defineSupportCode(function({setDefaultTimeout}) {
    setDefaultTimeout(60 * 1000);
});
