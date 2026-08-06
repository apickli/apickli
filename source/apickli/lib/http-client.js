'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const {CookieJar, Cookie} = require('tough-cookie');

const loadPem = function(val) {
  if (!val) return val;
  if (Buffer.isBuffer(val)) return val;
  if (typeof val === 'string') {
    if (val.includes('-----BEGIN')) return val;
    try {
      if (fs.existsSync(val)) {
        return fs.readFileSync(val);
      }
    } catch (e) {
      return val;
    }
  }
  return val;
};

const sendRequest = function(apickliInstance, method, path, callback) {
  try {
    const targetDomain = apickliInstance.domain || 'http://127.0.0.1:3000';
    let fullUrl = targetDomain;
    if (!fullUrl.endsWith('/') && !path.startsWith('/')) {
      fullUrl += '/' + path;
    } else if (fullUrl.endsWith('/') && path.startsWith('/')) {
      fullUrl += path.substring(1);
    } else {
      fullUrl += path;
    }

    const urlObj = new URL(fullUrl);
    const headers = Object.assign({}, apickliInstance.headers || {});

    let bodyData = apickliInstance.requestBody || '';
    if (typeof bodyData !== 'string' && !Buffer.isBuffer(bodyData)) {
      bodyData = JSON.stringify(bodyData);
    }

    // Form parameters processing
    if (apickliInstance.formParameters && Object.keys(apickliInstance.formParameters).length > 0) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(apickliInstance.formParameters)) {
        params.append(k, v);
      }
      bodyData = params.toString();
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }

    // Query parameters processing
    if (apickliInstance.queryParameters && Object.keys(apickliInstance.queryParameters).length > 0) {
      for (const [k, v] of Object.entries(apickliInstance.queryParameters)) {
        urlObj.searchParams.append(k, v);
      }
    }

    if (bodyData && bodyData.length > 0 && !headers['Content-Length'] && !headers['content-length']) {
      headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    // Cookie handling
    if (apickliInstance.cookies && apickliInstance.cookies.length > 0) {
      const cookieJar = new CookieJar();
      apickliInstance.cookies.forEach(function(cookieStr) {
        try {
          const cookie = Cookie.parse(cookieStr);
          if (cookie) {
            cookieJar.setCookieSync(cookie, urlObj.href);
          }
        } catch (e) {
          // ignore invalid cookie format
        }
      });
      const cookieHeader = cookieJar.getCookieStringSync(urlObj.href);
      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
      }
    }

    const isHttps = urlObj.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const requestOptions = Object.assign({}, apickliInstance.httpRequestOptions || {}, {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: (method || 'GET').toUpperCase(),
      headers: headers,
    });

    if (isHttps) {
      requestOptions.rejectUnauthorized = false; // Allow self-signed and test fixture certs
    }

    // Mutual TLS Client Configuration
    if (apickliInstance.selectedClientTLSConfig && apickliInstance.clientTLSConfig[apickliInstance.selectedClientTLSConfig]) {
      const tlsConf = apickliInstance.clientTLSConfig[apickliInstance.selectedClientTLSConfig];
      if (tlsConf.key) {
        requestOptions.key = loadPem(tlsConf.key);
      }
      if (tlsConf.cert) {
        requestOptions.cert = loadPem(tlsConf.cert);
      }
      if (tlsConf.ca) {
        requestOptions.ca = loadPem(tlsConf.ca);
      }
      requestOptions.rejectUnauthorized = false;
    }

    const req = requestModule.request(requestOptions, function(res) {
      const chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk);
      });
      res.on('end', function() {
        const bodyBuffer = Buffer.concat(chunks);
        const responseBody = bodyBuffer.toString('utf8');

        // Normalizing header keys to lowercase for standard lookup
        const normalizedHeaders = {};
        for (const [k, v] of Object.entries(res.headers)) {
          normalizedHeaders[k.toLowerCase()] = v;
        }

        const httpResponse = {
          statusCode: res.statusCode,
          headers: normalizedHeaders,
          body: responseBody,
          rawHeaders: res.headers,
        };

        apickliInstance.httpResponse = httpResponse;
        callback(null, httpResponse);
      });
    });

    req.on('error', function(err) {
      callback(err);
    });

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  } catch (err) {
    callback(err);
  }
};

module.exports = {
  sendRequest,
};
