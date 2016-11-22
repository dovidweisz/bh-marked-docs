'use strict';

var _ = require("lodash");

var inlineCodeExpr = /`([^`\n]+)`/g;
var blockCodeExpr = new RegExp("`{3}(\\w*)?.*([^]+?)`{3}", "g");



var cssClassIndexSetter = indexSetter(/(?:^|\s)\.([a-zA\-]+)/g, 1, "cssClass", [kabobLookup]),
    scssMixinIndexSetter = indexSetter(/@(?:include|mixin)\s+([a-z-]+)/g, 1, "scssMixin", [kabobLookup]),
  h1IndexSetter = indexSetter(/(.*)\r?\n\s?=+/g, 1, "heading", [kabobLookup, h1HeaderType]),
  h2IndexSetter = indexSetter(/(.*)\r?\n\s?-+/g, 1, "heading", [kabobLookup, h2HeaderType]),
  atxHeaderSetter = indexSetter(/^#+\s+([a-z- ]+[a-z])/gmi, 1, "heading", [kabobLookup, atxHeaderType]);

var nonHeadingKeys = [
  "cssClass",
  "scssMixin"
];

function indexFile(index, data, linkData ){
  var indexList = [],
      indexObj;
  try {
    indexList = h1IndexSetter(indexList, ["",data], linkData);
    indexList = h2IndexSetter(indexList, ["",data], linkData);
    indexList = atxHeaderSetter(indexList, ["",data], linkData);

    indexList = parseInline ( indexList, linkData, data );
    indexList = parseBlocks ( indexList, linkData, data );

    indexObj = indexList.reduce(addKey, {});
    indexObj = idWrap(indexObj, linkData);

    return _.reduce(indexObj , mergeFileKey, index );

  }catch(e){
    console.error("Error:", e);
  }
}

function mergeFileKey(index, key, keyName){
  var instances;
  if( index[keyName] ){
    instances = index[keyName];
    instances.push(key);
    instances.sort(prioritizeKey);
  } else {
    instances = [key];
  }
  index[keyName] = instances;

  return index;
}
var prioritizers = [
  prioritizeByHeadings,
  prioritizeByNonHeadings
]

function prioritizeKey( a, b  ) {
  var rv = 0;
  prioritizers.every( function(prioritizer){
    rv = prioritizer(b,a);
    return rv === 0;
  });
  return rv;
}
function prioritizeByHeadings( a, b ) {
  return headingKeyCount(a.results) - headingKeyCount(b.results);
}
function prioritizeByNonHeadings( a, b ) {
  return nonHeadingKeyCount(a.results) - nonHeadingKeyCount(b.results);
}

function headingKeyCount(key){
  return key.heading ? key.heading.count : 0;
}

function nonHeadingKeyCount(key){
  return nonHeadingKeys.reduce(function(count, type){
    return count + getKeyCount(type, key);
  }, 0);
}

function getKeyCount(type, key){
  return key[type] ? key[type].count : 0;
}

function addKey(obj, key){
  var lookupIndex =  obj[key.lookupIndex] || {},
      matchType = lookupIndex[key.type] || {
        count: 0,
        matches: []
      };
  matchType.matches.push(key);
  matchType.count ++;
  lookupIndex[key.type] = matchType;
  obj[key.lookupIndex] = lookupIndex;
  return obj;
}

function idWrap(indexObj, linkData){
  return _.reduce(indexObj, function(newObj, obj, key ) {
    newObj[key] = {
      linkData: linkData,
      lookup: key,
      results: obj
    }
    return newObj;
  }, {});
}



function parseInline(  index, linkData, data ) {
  resetLast(inlineCodeExpr);
  var inlineCodeMatch, cssClassMatch;
  while(inlineCodeMatch = inlineCodeExpr.exec(data)){

    index = cssClassIndexSetter(index, inlineCodeMatch, linkData);
  }
  return index;
}

function parseBlocks( index, linkData, data ){
  resetLast(blockCodeExpr);
  var blockCodeMatch;
  while (blockCodeMatch = blockCodeExpr.exec(data)){
    //console.log(blockCodeMatch[1])
    if(/^scss/.test(blockCodeMatch[1])){

      var setterMatch = [blockCodeMatch[0], blockCodeMatch[2]];
      index = scssMixinIndexSetter(index, setterMatch, linkData);
      index = cssClassIndexSetter(index, setterMatch, linkData);
    }
  }
  return index;
}

function kabob( str ) {
  //str = str.replace(/([a-z])([A-Z])/g, "$1-$2");
  return str.replace(/[^\w-]/g, "-")
    .replace(/(?:^-+)|(?:-+$)/g, "")
    .replace(/--+/g, "-")
    .toLowerCase();
}
function kabobLookup(obj){
  obj.lookupIndex = kabob(obj.lookupIndex);
  return obj;
}

function h1HeaderType(obj){
  obj.headerType = "h1";
  return obj;
}
function h2HeaderType(obj){
  obj.headerType = "h2";
  return obj;
}
function atxHeaderType(obj) {
  obj.headerType = "h" + /^#+/.exec(obj.rawSource)[0].length;
  return obj;
}

function indexSetter(expression, targetExprIndex, type, finalizers){
  return function(index, match, linkData){

    resetLast( expression );
    var myMatch, props;
    while (myMatch = expression.exec(match[1])){
      props = {
        type: type,
        linkData: linkData,
        context: match[0],
        source: myMatch[targetExprIndex],
        rawSource: myMatch[0],
        lookupIndex: myMatch[targetExprIndex]
      };
      if( finalizers ){
        props = finalizers.reduce((props, func) => func(props), props);
      }
      index.push(props);
    }
    return index;
  }
}



function resetLast( regexp ) {
  regexp.lastIndex = 0;
}


module.exports = indexFile;
