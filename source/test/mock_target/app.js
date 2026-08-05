'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const {URL} = require('url');

const handleHttpRequest = function(req, res) {
  const reqUrl = new URL(req.url, 'http://' + req.headers.host);
  const pathName = reqUrl.pathname;

  const chunks = [];
  req.on('data', function(chunk) {
    chunks.push(chunk);
  });

  req.on('end', function() {
    const rawBody = Buffer.concat(chunks).toString('utf8');

    // Reflection of headers with exact and case-insensitive matching
    const reflectedHeaders = {};
    Object.keys(req.headers).forEach(function(k) {
      const parts = k.split('-').map(function(p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
      });
      const canonicalKey = parts.join('-');
      reflectedHeaders[canonicalKey] = req.headers[k];
      reflectedHeaders[k] = req.headers[k];
    });

    // Parse URL query arguments into args object
    const argsObject = {};
    reqUrl.searchParams.forEach(function(val, key) {
      argsObject[key] = val;
    });

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Allow': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Content-Length': '0',
      });
      res.end('');
      return;
    }

    if (pathName === '/gzip') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({gzipped: true}));
      return;
    }

    if (pathName === '/xml') {
      res.writeHead(200, {
        'Content-Type': 'application/xml',
        'Server': 'apickli-mock-server',
        'Connection': 'keep-alive',
      });
      res.end('<?xml version="1.0" encoding="UTF-8"?><slideshow><slide><title>Wake up to WonderWidgets!</title></slide><slide><title>Overview</title></slide></slideshow>\n');
      return;
    }

    if (pathName === '/get' || pathName === '/post' || pathName === '/put' || pathName === '/delete' || pathName === '/patch') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Server': 'apickli-mock-server',
      });

      let jsonBody = null;
      try {
        jsonBody = JSON.parse(rawBody);
      } catch (e) {
        jsonBody = null;
      }

      // Parse form parameters if application/x-www-form-urlencoded or raw form
      const formObject = {};
      if (rawBody && (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded') || rawBody.includes('='))) {
        const bodyParams = new URLSearchParams(rawBody);
        bodyParams.forEach(function(val, key) {
          formObject[key] = val;
        });
      }

      const responsePayload = {
        headers: reflectedHeaders,
        args: argsObject,
        form: formObject,
        data: rawBody,
        json: jsonBody,
        origin: '127.0.0.1',
        url: req.url,
      };

      res.end(JSON.stringify(responsePayload));
      return;
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      headers: reflectedHeaders,
      args: argsObject,
      data: rawBody,
    }));
  });
};

// Local HTTP mock target for httpbin tests
const httpServer = http.createServer(handleHttpRequest);
httpServer.listen(3000, function() {
  // HTTP server ready on port 3000
});

// Mutual TLS HTTPS mock target
const options = {
  key: fs.readFileSync('test/mock_target/certs/server-key.pem'),
  cert: fs.readFileSync('test/mock_target/certs/server-crt.pem'),
  ca: fs.readFileSync('test/mock_target/certs/ca-crt.pem'),
  requestCert: true,
  rejectUnauthorized: false,
};

const httpsServer = https.createServer(options, function(req, res) {
  res.writeHead(200);
  res.end('hello world\n');
});

httpsServer.listen(5000, function() {
  // HTTPS server ready on port 5000
});
