
const gulp = require('gulp');
const gulpMarked = require("gulp-marked");
const gulpIf = require("gulp-if");
const gulpRename = require("gulp-rename");
const gulpAddSrc = require('gulp-add-src');
const gulpSass = require("gulp-sass");
const sequence = require("run-sequence");
const rimraf = require("rimraf");
const fs = require("fs");

let settingsFile = process.env.SETTINGS_FILE || "settings";

const settings = require("./" + settingsFile);


const helpers = require("./helpers");
const gulpPlugins = require("./gulp-plugins");
const markedRenderer = require("./marked-renderer");

let sources = settings.sources;
let dest = settings.dest;
let siteRoot = settings.siteRoot;

const isMarkDown = "*.md";




gulp.task("default", function(cb){
    sequence("clean",
        [ "docs", "sass"]
    , cb);
} );

let fileIndexes = {};
gulp.task("docs", function(){
    fileIndexes = {};
    let titles = {};
    return gulp.src(sources)
    .pipe(gulpIf(isMarkDown, gulpPlugins.indexFiles(fileIndexes, titles)))
    .pipe(gulpIf(isMarkDown, gulpPlugins.htmlLinks() ))
    .pipe(gulpIf(isMarkDown, gulpMarked({
      highlight: helpers.hilightCode,
      renderer: markedRenderer
    })))
    .pipe( gulpIf("*.html", gulpPlugins.addBreadCrumbs()))
    .pipe( gulpIf("*.html", gulpPlugins.wrapHtml(titles, siteRoot)))
    .pipe( gulpIf("**/readme.*", gulpRename( function (path) {
        path.basename  = "index";
        return path;
    } )))
    .pipe( gulpAddSrc.append( helpers.hilightCode.stylePath ) )
    .pipe( gulp.dest(dest) )
    .on("end", function(){
        var strIndex;
        try{
            strIndex = JSON.stringify(fileIndexes);
            fs.writeFile(`${dest}searchIndex.json`, strIndex);
        }catch (e){
            if(strIndex){
                console.error("Couldn't  save Index! " , e);
            }else{
                console.error("Couldn't stringify  Index! " , e)
            }
        }
    });
});

gulp.task("clean", function(cb){
    return rimraf(dest, cb);
});

gulp.task("sass", function(){
    return gulp.src( "./scss/index.scss" )
        .pipe( gulpSass({
            includePaths: [ "node_modules/foundation-sites/scss" ]
        }) )
        .pipe( gulp.dest(`${dest}css`) );
});

module.exports = function(){
    return gulp.start("default");
}