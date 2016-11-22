
const gulp = require('gulp');
const gulpMarked = require("gulp-marked");
const gulpIf = require("gulp-if");
const gulpRename = require("gulp-rename");
const gulpAddSrc = require('gulp-add-src');
const gulpSass = require("gulp-sass");
const sequence = require("run-sequence");
const rimraf = require("rimraf");

const sources = require("./md-sources");
const helpers = require("./helpers");
const gulpPlugins = require("./gulp-plugins");

const isMarkDown = "*.md";

gulp.task("default", function(cb){
    sequence("clean",
        [ "docs", "sass"]
    , cb);
} );

gulp.task("docs", function(){
    let fileIndexes = {};
    let titles = {};
    return gulp.src(sources)
    .pipe(gulpIf(isMarkDown, gulpPlugins.indexFiles(fileIndexes, titles)))
    .pipe(gulpIf(isMarkDown, gulpPlugins.htmlLinks() ))
    .pipe(gulpIf(isMarkDown, gulpMarked({
      highlight: helpers.hilightCode
    })))
    .pipe( gulpIf("*.html", gulpPlugins.addBreadCrumbs()))
    .pipe( gulpIf("*.html", gulpPlugins.wrapHtml(titles)))
    .pipe( gulpIf("**/readme.*", gulpRename( function (path) {
        path.basename  = "index";
        return path;
    } )))
    .pipe( gulpAddSrc.append( helpers.hilightCode.stylePath ) )
    .pipe( gulp.dest("dist/") );
});

gulp.task("clean", function(cb){
    return rimraf("dist/", cb);
});

gulp.task("sass", function(){
    return gulp.src( "./scss/index.scss" )
        .pipe( gulpSass({
            includePaths: [ "node_modules/foundation-sites/scss" ]
        }) )
        .pipe( gulp.dest("dist/css") );
});