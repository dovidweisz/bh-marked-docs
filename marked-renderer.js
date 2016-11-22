'use strict';

const marked = require("marked");
let renderer = new marked.Renderer();

let externalTest = /^(?:https?:)?\/\//i;

renderer.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  let isExternal = externalTest.exec(href);
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  if( isExternal ){
      out += ' target="_BLANK"';
  }
  out += '>' + text + '</a>';
  return out;
};

module.exports = renderer;