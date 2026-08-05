'use strict';

const {JSONPath: jsonPath} = require('jsonpath-plus');
const Ajv = require('ajv');
const AjvDraft04 = require('ajv-draft-04');
const addFormats = require('ajv-formats');

const ajv = new Ajv({allErrors: true, strict: false});
addFormats(ajv);

const ajvDraft4 = new AjvDraft04({allErrors: true, strict: false});
addFormats(ajvDraft4);

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
    const isDraft4 = schema && schema.$schema && schema.$schema.includes('draft-04');
    const validator = isDraft4 ? ajvDraft4 : ajv;
    const validate = validator.compile(schema);
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
