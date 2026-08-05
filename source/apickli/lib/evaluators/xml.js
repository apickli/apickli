'use strict';

const Dom = require('@xmldom/xmldom').DOMParser;
const select = require('xpath').select;

const _xmlAttributeNodeType = 2;

const parseXml = function(content) {
  if (!content) return null;
  try {
    const xmlDocument = new Dom().parseFromString(content, 'text/xml');
    if (xmlDocument && xmlDocument.documentElement && xmlDocument.documentElement.nodeName !== 'parsererror') {
      return xmlDocument;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const getNodeText = function(node) {
  if (!node) return null;
  if (node.nodeType === _xmlAttributeNodeType) {
    return node.value || node.nodeValue;
  }
  if (typeof node.textContent === 'string') {
    return node.textContent;
  }
  if (node.firstChild) {
    return node.firstChild.nodeValue || node.firstChild.data || '';
  }
  return node.nodeValue || '';
};

const evaluateXPath = function(pathStr, content) {
  try {
    const xmlDocument = parseXml(content);
    if (!xmlDocument) {
      return null;
    }

    const nodes = select(pathStr, xmlDocument);
    if (!nodes || nodes.length === 0) {
      return null;
    }

    return getNodeText(nodes[0]);
  } catch (e) {
    return null;
  }
};

module.exports = {
  evaluateXPath,
  parseXml,
};
