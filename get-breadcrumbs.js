"use strict";

var fs = require("fs"),
    memoize = require("memoizee");

function getBreadcrumbs(file){
  //console.log(file.history, file.path);
  var path = file.history[0].replace(/[/\\]readme\.md/i, "").substring(file.base.length);

  return _getBreadCrumbs(file.base, path.replace(/[^/\\]*$/, "")); //.then(br => console.log(br));

  //return "";
}

function _getBreadCrumbs(base, path){
  var tempPath = path,
    indexLinks = [];
  while (tempPath.length > 0){
    indexLinks.push( getIndexLink(base, tempPath));
    tempPath = tempPath.replace(/[^/\\]*[/\\]$/, "");
  }
  indexLinks.push( getIndexLink(base, ""));
  return Promise.all(indexLinks).then(function ( breadCrumbs ) {
    var listItems = breadCrumbs.reverse().join("");
    return `<ul class="breadcrumbs">${listItems}</ul>`;
  })
 /* return new Promise(function(resolve, reject){

  });*/
}

var getIndexLink = memoize(function(base, path){
  return new Promise(function(resolve, reject){
    var dirPath = path.replace(/[^/\\]*$/, "");

    var dirName = path.length > 0 ?  /([^/\\]+)[/\\]$/.exec(dirPath)[1] : "Home";
    getHasFile(base + dirPath + "readme.md" ).then(function( hasReadme){
      if(hasReadme) {
        path = path.replace(/\\/g, "/");
        resolve ( `<li><a href="/${path}index.html">${dirName}</a></li>` );
      }else if(dirName == "docs"){
        resolve("");
      }else{
        //resolve( `<li>${dirName}</li>` );
        resolve ( `<li><a href="/${path}">${dirName}</a></li>` );
      }
    });

  });
});


var getHasFile = memoize(function ( path ) {
  return new Promise(function(resolve, reject){
    fs.lstat(path, function(err){
      if(err){
        resolve(false);
      }else{
        resolve(true);
      }
    });
  });
});

module.exports = getBreadcrumbs;