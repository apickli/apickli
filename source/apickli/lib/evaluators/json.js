'use strict';

const {JSONPath: jsonPath} = require('jsonpath-plus');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({allErrors: true, strict: false});
addFormats(ajv);

const evaluateJsonPath = function(path, content) {
  try {
    const contentJson = (typeof content === 'string') ? JSON.parse(content) : content;
    const evalResult = jsonPath({path, json: contentJson});
    return (evalResult && evalResult.length > 0) ? evalResult[0] : null;
  } catch (e) {
    return null;
  }
};

const validateJsonSchema = function(schema, data) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return {
      valid,
      errors: validate.errors || null,
    };
  } catch (e) {
    return {
      valid: false,
      errors: [{message: e.message}],
    };
  }
};

module.exports = {
  evaluateJsonPath,
  validateJsonSchema,
};
