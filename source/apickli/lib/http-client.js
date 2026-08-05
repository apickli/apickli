'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const {URL} = require('url');
const {CookieJar, Cookie} = require('tough-cookie');

const parseQueryString = function(qs) {
  if (!qs || Object.keys(qs).length === 0) {
    return '';
  }
  const params = new URLSearchParams();
  Object.keys(qs).forEach(function(key) {
    params.append(key, qs[key]);
  });
  return params.toString();
};

const sendRequest = function(apickliInstance, method, resource, callback) {
  try {
    const rawUrl = apickliInstance.domain + resource;
    const urlObj = new URL(rawUrl);

    const queryString = parseQueryString(apickliInstance.queryParameters);
    if (queryString) {
      urlObj.search = (urlObj.search ? urlObj.search + '&' : '?') + queryString;
    }

    const headers = Object.assign({}, apickliInstance.headers);

    // Form parameter handling
    let bodyData = null;
    if (apickliInstance.requestBody && apickliInstance.requestBody.length > 0) {
      bodyData = Buffer.from(apickliInstance.requestBody, 'utf8');
    } else if (apickliInstance.formParameters && Object.keys(apickliInstance.formParameters).length > 0) {
      const formParams = new URLSearchParams();
      Object.keys(apickliInstance.formParameters).forEach(function(key) {
        formParams.append(key, apickliInstance.formParameters[key]);
      });
      bodyData = Buffer.from(formParams.toString(), 'utf8');
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }

    if (bodyData && !headers['Content-Length'] && !headers['content-length']) {
      headers['Content-Length'] = bodyData.length;
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
      method: method.toUpperCase(),
      headers: headers,
    });

    if (isHttps) {
      requestOptions.rejectUnauthorized = false; // Allow self-signed and test fixture certs
    }

    // Mutual TLS Client Configuration
    if (apickliInstance.selectedClientTLSConfig && apickliInstance.clientTLSConfig[apickliInstance.selectedClientTLSConfig]) {
      const tlsConf = apickliInstance.clientTLSConfig[apickliInstance.selectedClientTLSConfig];
      if (tlsConf.key) {
        requestOptions.key = fs.readFileSync(tlsConf.key);
      }
      if (tlsConf.cert) {
        requestOptions.cert = fs.readFileSync(tlsConf.cert);
      }
      if (tlsConf.ca) {
        requestOptions.ca = fs.readFileSync(tlsConf.ca);
      }
      requestOptions.rejectUnauthorized = false; // Allow fixture certs
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
        Object.keys(res.headers).forEach(function(k) {
          normalizedHeaders[k.toLowerCase()] = res.headers[k];
        });

        const httpResponse = {
          statusCode: res.statusCode,
          headers: normalizedHeaders,
          body: responseBody,
          rawHeaders: res.rawHeaders,
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
