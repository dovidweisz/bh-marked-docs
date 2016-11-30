'use strict';

let scssDir = "../waterfall/app-www/client/www/style/";

module.exports = {
    sources: [
        scssDir + "**/*.md",
        scssDir + "**/docs/images/*.jpg"
    ],
    siteRoot: "/bh-marked-docs/",
    dest: "docs/"
};