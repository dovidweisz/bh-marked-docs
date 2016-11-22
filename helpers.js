'use strict';

let nsh = require("node-syntaxhighlighter");

function hilightCode(code, lang, callback) {
  var nshLang = lang ? nsh.getLanguage(lang) : null;
  if(nshLang){
    callback( null, nsh.highlight(code, nshLang) );
  }else{
    if(lang){
      callback(new Error(`Language ${lang} is not supported by Syntax Highlighter`));
    }else{
      callback(null, code);
    }

  }
}


function mdToHTMLLink(match, filePath){
  if(/\.md$/i.test(filePath)){
    if(/readme\.md$/i.test(filePath)){
      return match.replace(/readme\.md(\)?)$/i, "index.html$1");
    }
    return match.replace(/\.md(\)?)$/i, ".html$1");
  }else{
    return match;
  }
}





function getPath(file) {
  return file.history[0].substring(file.base.length).replace(/\\/g, "/");
}

function saveTitle(titles, path, data){
  var result = /(.+)\r?\n\s?=+/.exec(data);
  if(result){
    titles[path] = result[1];
  }else{
    result = (/.*(.*)\.md$/i).exec(path);
    if(result){
      titles[path] = result[1];
    }else{
      throw new Error(`Could not get title for ${path}`);
    }

  }
}

function gulpMarkDownLint(){
  return through.obj(function(file, encoding, next) {
    markdownlint({
      "files": [ "client/" + file.relative ]
    }, function callback(err, result) {
        var resultString = (result || "").toString();
        if (resultString) {
          console.log(resultString);
        }
        next(err, file);
      });
  });
}

function test(  ) {
  /*fileIndexes.forEach(function ( index ) {
    console.log ( index.path );
  });*/
  console.log("init");
  return through.obj(function(file, encoding, callback){
    console.log(file.path);
    callback(null, file);
  });
}

module.exports = {
  hilightCode: hilightCode,
  mdToHTMLLink: mdToHTMLLink,
  getBreadcrumbs: require("./get-breadcrumbs"),
  getPath: getPath,
  saveTitle: saveTitle
};
