"use strict";

const through = require("through2");

const helpers = require("./helpers");


function htmlLinks(){
  return through.obj(function(file, encoding, callback) {
    var data = String(file.contents);

    file.contents = new Buffer(data.replace(/\[.+?]\((.*?)\)/g, helpers.mdToHTMLLink).replace(/^\[.+\]\s*:\s*(.*)$/gm, helpers.mdToHTMLLink ));
    callback(null, file);
  });
}
function addBreadCrumbs(){
  return through.obj(function(file, encoding, callback){
    helpers.getBreadcrumbs(file).then(function(breadCrumbs){
      file.contents = Buffer.concat([
        new Buffer(breadCrumbs, encoding),
        file.contents
      ]);
      callback(null, file);
    });
  });
}
function wrapHtml(titles) {
  var styles = `<link rel="stylesheet" href="/docs-css/docs-app.css" />
                <link rel="stylesheet" href="/docs-css/shCoreRDark.css" />`;
  return through.obj(function(file, encoding, callback) {
    var path = helpers.getPath(file),
        title = titles[path] || "Docs",
        head = new Buffer(`<!DOCTYPE html>
                  <html>
                  <head>
                    ${styles}
                    <title>${title}</title>
                  </head>
                  <body>
                    <div class="page-width "><div class="container">`,encoding),
        footer = new Buffer(`</div></div></body></html>`, encoding);
    file.contents = Buffer.concat([head, file.contents, footer]);
    callback(null, file);
    // callback(null, file);
  });
}


function indexFiles(fileIndexes, titles) {
  var indexFile = require("./index-file");
  return through.obj(function(file, encoding, callback) {
    //console.log(file.history[0].substring(file.base.length).replace(/\\/g, "/"), file.history[0]);

    var data = String(file.contents),
        path = helpers.getPath(file);

    helpers.saveTitle(titles, path, data);
    fileIndexes = indexFile(fileIndexes, data , {
      path: helpers.mdToHTMLLink(path, path),
      title: titles[path]
    })
    callback(null, file);
  });
};

module.exports = {
    htmlLinks: htmlLinks,
    addBreadCrumbs: addBreadCrumbs,
    wrapHtml: wrapHtml,
    indexFiles: indexFiles
};