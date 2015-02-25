var request = require('request');
var jsonPath = require('JSONPath');
var libxmljs = require('libxmljs');

var headers = {};
var httpResponse = {};
var requestBody = '';
var variableStorage = {};

function HttpClient(scheme, domain) {
	this.domain = scheme + '://' + domain;
};

function Util() {};

HttpClient.prototype.addHeader = function(name, value) {
	headers[name] = value;
};

HttpClient.prototype.getResponse = function() {
	return httpResponse;
};

HttpClient.prototype.setRequestBody = function(body) {
	requestBody = body;
};

HttpClient.prototype.get = function(resource, callback) {
    request.get(
        {
            url: this.domain + resource,
            headers: headers
        },
        function(error, response) {
            if (error) {
                return callback(error);
            }

			httpResponse = response;
            callback(null, response);
        }
	);
};

HttpClient.prototype.post = function(resource, callback) {
    request({
            url: this.domain + resource,
            headers: headers,
            body: requestBody,
            method: 'POST'
        },
        function(error, response) {
            if (error) {
                return callback(error);
            }

			httpResponse = response;
            callback(null, response);
        }
	);
};

Util.prototype.getContentType = function(content) {
    try{
        JSON.parse(content);
        return 'json';
    } catch(e) {
        try{
            libxmljs.parseXml(content);
            return 'xml';
        } catch(e) {
            return null;
        }
    }
};

Util.prototype.evalPath = function(path, content) {
	var contentType = this.getContentType(content);

	switch (contentType) {
		case 'json':
			var contentJson = JSON.parse(content);
			var value = jsonPath.eval(contentJson, path);
			return value;
		case 'xml':
			var xml = libxmljs.parseXml(content);
			var value = xml.get(path).text();
			return value;
		default:
			return null;
	}
};

Util.prototype.assertStringContains = function(content, string) {
    if (content){
		if (content.indexOf(string) == -1) {
			return false
		}
		return true
    } 	
	return false;
}

exports.Util = Util;
exports.HttpClient = HttpClient;
