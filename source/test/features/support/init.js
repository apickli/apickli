/* eslint new-cap: "off", no-invalid-this: "off" */

'use strict';

const {Before, AfterAll, setDefaultTimeout} = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const apickli = require('../../../apickli/apickli.js');
const mockServer = require('../../mock_target/app.js');

setDefaultTimeout(60 * 1000);

Before(function() {
  this.apickli = new apickli.Apickli('http', '127.0.0.1:3000');
  this.apickli.addRequestHeader('Cache-Control', 'no-cache');

  const certsPath = path.join(__dirname, '../../mock_target/certs');
  this.apickli.addClientTLSConfiguration('valid', {
    key: fs.readFileSync(path.join(certsPath, 'client-key.pem')),
    cert: fs.readFileSync(path.join(certsPath, 'client-crt.pem')),
    ca: fs.readFileSync(path.join(certsPath, 'ca-crt.pem')),
  });
});

AfterAll(function(done) {
  if (mockServer && typeof mockServer.close === 'function') {
    mockServer.close(done);
  } else {
    done();
  }
});
