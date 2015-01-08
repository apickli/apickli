'use strict';

var request = require('request');
var libxmljs = require('libxmljs');

var headers = {};
var lastResponse = null;

var get = function(url, headers, callback) {
    request.get(
        {
            url: url,
            headers: headers
        },
        function(error, response) {
            if (error) {
                return callback.fail(new Error('Error on GET request to ' + url +
                    ': ' + error.message))
            }

            callback(response);
        }
    );
};

var post = function(url, headers, body, callback) {
    request({
            url: url,
            headers: headers,
            body: body,
            method: 'POST'
        },
        function(error, response) {
            if (error) {
                return callback(new Error('Error on POST request to ' + url + ': ' +
                    error.message));
            }

            callback();
        })
};

var getResponseBodyContentType = function(body) {
    try{
        JSON.parse(body);
        return 'json';
    } catch(e) {
        try{
            libxmljs.parseXml(body);
            return 'xml';
        } catch(e) {
            console.log(e);
            return null;
        }
    }
};

// var put = function(path, requestBody, callback) {

//     var uri = path;
//     var headers = headers;

//     // if requester provided empty headers we set default
//     if (!headers) {
//         headers = {
//             'User-Agent': 'apickli'
//         }
//     }

//     request({
//             url: uri,
//             headers: headers,
//             body: requestBody,
//             method: 'PUT'
//         },
//         function(error, response) {
//             if (error) {
//                 return callback(new Error('Error on PUT request to ' + uri + ': ' +
//                     error.message))
//             }

//             callback();
//         })
// };

// DELETE ///////////
// var delete = function(path, callback) {

//   var uri = path;
//   var headers = headers;

//   // if requester provided empty headers we set default
//   if (!headers){headers = {'User-Agent': 'apickli'}}    

//   request({url: uri, headers: headers, method: 'DELETE'},
//       function(error, response) {
//     if (error) {
//       return callback(new Error('Error on DELETE request to ' + uri + ': ' +
//           error.message))
//     }
//     self.lastResponse = response
//     callback();
//   })
// };

// OPTIONS /////////
var options = function(path, callback) {

    var uri = path;
    var headers = headers;

    // if requester provided empty headers we set default
    if (!headers) {
        headers = {
            'User-Agent': 'apickli'
        }
    }

    request({
            url: uri,
            headers: headers,
            method: 'OPTIONS'
        },
        function(error, response) {
            if (error) {
                return callback.fail(new Error('Error on OPTIONS request to ' + uri +
                    ': ' + error.message))
            }
            self.lastResponse = response
            callback();
        })
};


////////////////////////
//* HELPER FUNCTIONS *//
////////////////////////

// These functions are created to be generic and
// reused across multiple step definitions while building
// API endpoint test harnesses.
// Please propose your funcionality here and create a pull
// request if you want to add core funcionality


// Validate that response exists
var assertResponse = function(lastResponse, callback) {
    if (!lastResponse) {
        callback.fail('No requests are made yet!')
    }
    return true
}

// Validate that response has body and return its value
var assertBody = function(lastResponse, callback) {
    if (!assertResponse(lastResponse, callback)) {
        return false
    }
    if (!lastResponse.body) {
        callback.fail('The response to the last request had no body.')
    }
    return lastResponse.body
}

// Validate that response has headers and return their value
var assertHeaders = function(lastResponse, callback) {
    if (!assertResponse(lastResponse, callback)) {
        return false
    }
    if (!lastResponse.headers) {
        callback.fail('The response to the last request had no headers.')
    }
    return lastResponse.headers
}

// Validate that response is ValidJson
var assertValidJson = function(lastResponse, callback) {
    var body = assertBody(lastResponse, callback)
    if (!body) {
        return false
    }
    try {
        // we use JSON.parse to validate JSON format
        return JSON.parse(body)
    } catch (e) {
        callback.fail('The body of the last response was not valid JSON.')
        return false
    }
}

// Validate that response has expected string in it
var assertStringInResponse = function(lastResponse, string, callback) {
    var body = assertBody(lastResponse, callback)
    if (!body) {
        return false
    }
    try {
        if (body.indexOf(string) == -1) {
            return false
        }
        return true

    } catch (e) {
        callback.fail('JavaScript error: ' + e)
        return false
    }
}

// Validate that response has expected header in it
var assertHeaderInResponse = function(lastResponse, string, callback) {
    var headers = assertHeaders(lastResponse, callback)
    if (!headers) {
        return false
    }
    try {
        if (!headers.hasOwnProperty(string)) {
            return false
        }
        return true

    } catch (e) {
        callback.fail('JavaScript error: ' + e)
        return false
    }
};

exports.get = get;
exports.getResponseBodyContentType = getResponseBodyContentType;