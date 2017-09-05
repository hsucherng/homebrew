
module.exports = {
    "${source}/*": true,
    "${source}/!(assets)/**/*": true,
    "${source}/**/assets/!(js|scss)/**/*": true,
    "${source}/**/assets/js/**/*.js": "**/assets/js/**/*.js",
    "${source}/**/assets/scss/**/*.scss": "**/assets/scss/**/*.scss",
    "templates/**/*": "**/*.html"
};