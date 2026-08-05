'use strict';

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const app = express();

const normalizeHeaders = (headers) => {
  const result = {};
  for (const [k, v] of Object.entries(headers)) {
    result[k] = v;
    const titleCase = k.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('-');
    result[titleCase] = v;
  }
  return result;
};

app.use((req, res, next) => {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', () => {
    req.rawBody = data;
    try {
      req.parsedJson = JSON.parse(data);
    } catch (e) {
      req.parsedJson = null;
    }
    next();
  });
});

app.use((req, res, next) => {
  res.setHeader('Server', 'apickli-mock-server');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.get('/', (req, res) => {
  res.send('OK');
});

app.options('*', (req, res) => {
  res.setHeader('Allow', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.status(200).send();
});

app.get('/xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.send('<?xml version="1.0" encoding="UTF-8"?><slideshow><slide><title>Wake up to WonderWidgets!</title></slide><slide><title>Overview</title></slide></slideshow>');
});

app.get('/get', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    headers: normalizeHeaders(req.headers),
    args: req.query,
    origin: req.ip || '127.0.0.1',
    url: req.url,
  }));
});

const handleWrite = (req, res) => {
  let form = {};
  if (req.rawBody && req.rawBody.includes('=')) {
    try {
      form = querystring.parse(req.rawBody);
    } catch (e) {
      form = {};
    }
  }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    headers: normalizeHeaders(req.headers),
    args: req.query,
    form: form,
    data: req.rawBody,
    json: req.parsedJson,
    origin: req.ip || '127.0.0.1',
    url: req.url,
  }));
};

app.post('/post', handleWrite);
app.put('/put', handleWrite);
app.patch('/patch', handleWrite);
app.delete('/delete', handleWrite);

app.get('/gzip', (req, res) => {
  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    gzipped: true,
    headers: normalizeHeaders(req.headers),
    method: 'GET',
  }));
});

const certPath = path.join(__dirname, 'certs');
const options = {
  key: fs.readFileSync(path.join(certPath, 'server-key.pem')),
  cert: fs.readFileSync(path.join(certPath, 'server-crt.pem')),
};

const httpServer = http.createServer(app).listen(3000);
const httpsServer = https.createServer(options, app).listen(3001);

const close = function(callback) {
  httpServer.close(() => {
    httpsServer.close(callback || (() => {}));
  });
};

module.exports = {
  app,
  httpServer,
  httpsServer,
  close,
};
