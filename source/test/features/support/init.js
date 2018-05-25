/* eslint new-cap: "off", no-invalid-this: "off" */

'use strict';

const apickli = require('../../../apickli/apickli.js');
const { Before, setDefaultTimeout } = require('cucumber');

setDefaultTimeout(60 * 1000);

Before(function() {
    this.apickli = new apickli.Apickli('http', 'httpbin.org');
    this.apickli.addRequestHeader('Cache-Control', 'no-cache');
    this.apickli.clientTLSConfig = {
        valid: {
            key: './test/mock_target/certs/client-key.pem',
            cert: './test/mock_target/certs/client-crt.pem',
            ca: './test/mock_target/certs/ca-crt.pem',
        },
    };
});