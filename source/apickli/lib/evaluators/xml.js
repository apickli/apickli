'use strict';

const Dom = require('@xmldom/xmldom').DOMParser;
const xpath = require('xpath');

const _xmlAttributeNodeType = 2;

const evaluateXPath = function(path, content) {
  try {
    const xmlDocument = new Dom({
      errorHandler: {
        warning: function() {},
        error: function() {},
        fatalError: function() {},
      },
    }).parseFromString(content, 'text/xml');

    const nodes = xpath.select(path, xmlDocument);
    if (!nodes || nodes.length === 0) {
      return null;
    }

    const node = nodes[0];
    if (node.nodeType === _xmlAttributeNodeType) {
      return node.value;
    }

    if (node.firstChild) {
      return node.firstChild.data;
    }

    return node.nodeValue || '';
  } catch (e) {
    return null;
  }
};

const parseXml = function(content) {
  try {
    const xmlDocument = new Dom({
      errorHandler: {
        warning: function() {},
        error: function(err) {
          throw new Error(err);
        },
        fatalError: function(err) {
          throw new Error(err);
        },
      },
    }).parseFromString(content, 'text/xml');
    return xmlDocument;
  } catch (e) {
    return null;
  }
};

module.exports = {
  evaluateXPath,
  parseXml,
};
