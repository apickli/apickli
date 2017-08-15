/* eslint new-cap: "off", no-invalid-this: "off" */

'use strict';

const apickli = require('../../../apickli/apickli.js');

module.exports = function() {
    // cleanup before every scenario
    this.Before(function(scenario, callback) {
        this.apickli = new apickli.Apickli('http', 'httpbin.org');
        this.apickli.addRequestHeader('Cache-Control', 'no-cache');
        callback();
    });
};
