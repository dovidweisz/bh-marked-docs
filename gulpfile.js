
const gulp = require('gulp');
const gulpMarked = require("gulp-marked");
const gulpIf = require("gulp-if");
const gulpRename = require("gulp-rename");
const gulpAddSrc = require('gulp-add-src');
const sequence = require("run-sequence");
const rimraf = require("rimraf");

const sources = require("./md-sources");
const helpers = require("./helpers");
const gulpPlugins = require("./gulp-plugins");

const isMarkDown = "*.md";

gulp.task("default", function(cb){
    sequence("docs:clean", "docs", cb);
} );

gulp.task("docs", function(){
    let fileIndexes = {};
    let titles = {};
    return gulp.src(sources)
    .pipe(gulpIf(isMarkDown, gulpPlugins.indexFiles(fileIndexes, titles)))
    .pipe(gulpIf(isMarkDown, gulpPlugins.htmlLinks() ))
    .pipe(gulpIf(isMarkDown, gulpMarked({
      highlight: helpers.hilightCode,
    })))
    .pipe( gulpIf("*.html", gulpPlugins.addBreadCrumbs()))
    .pipe( gulpIf("*.html", gulpPlugins.wrapHtml(titles)))
    .pipe( gulpIf("**/readme.*", gulpRename( function (path) {
        path.basename  = "index";
        return path;
    } )))
    .pipe( gulp.dest("dist/") );
});

gulp.task("docs:clean", function(cb){
    return rimraf("dist/", cb);
})