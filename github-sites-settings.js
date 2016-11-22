'use strict';

let scssDir = "../waterfall/app-www/client/www/style/utils/";

module.exports = {
    sources: [
        scssDir + "**/*.md",
        scssDir + "**/docs/images/*.jpg"
    ],
    siteRoot: "/bh-marked-docs/",
    dest: "docs/"
};