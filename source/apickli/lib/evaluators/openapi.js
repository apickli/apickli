'use strict';

const SwaggerParser = require('@apidevtools/swagger-parser');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({allErrors: true, strict: false});
addFormats(ajv);

const validateSwaggerSpecDefinition = function(swaggerObject, definitionName, responseBody, callback) {
  SwaggerParser.dereference(JSON.parse(JSON.stringify(swaggerObject)), function(err, api) {
    if (err) {
      return callback(err);
    }

    let schema = null;
    if (api.definitions && api.definitions[definitionName]) {
      schema = api.definitions[definitionName];
    } else if (api.components && api.components.schemas && api.components.schemas[definitionName]) {
      schema = api.components.schemas[definitionName];
    }

    if (!schema) {
      return callback(new Error('Definition ' + definitionName + ' not found in OpenAPI/Swagger spec.'));
    }

    try {
      const validate = ajv.compile(schema);
      const valid = validate(responseBody);
      if (valid) {
        callback(null, {success: true});
      } else {
        callback(null, {success: false, errors: validate.errors});
      }
    } catch (validationErr) {
      callback(validationErr);
    }
  });
};

module.exports = {
  validateSwaggerSpecDefinition,
};
