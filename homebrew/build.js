var Metalsmith   = require('metalsmith'),
    autoprefixer = require('metalsmith-autoprefixer'),
    fs           = require('fs'),
    handlebars   = require('handlebars'),
    minimatch    = require('minimatch'),
    sass         = require('metalsmith-sass'),
    serve        = require('metalsmith-serve'),
    templates    = require('metalsmith-templates'),
    uglify       = require('metalsmith-uglify'),
    watch        = require('metalsmith-watch'),

    /* Custom modules */
    runWhen      = require('./custom-modules/run-when.js');

handlebars.registerPartial('samplePartial', fs.readFileSync(__dirname + '/templates/partials/sample-partial.html').toString());

console.log('Building...');

Metalsmith(__dirname)
    .source('src')
    .destination('build')

    /* CSS */
    .use(sass({
        outputStyle: "compressed",
        outputDir: "css/"
    }))
    .use(autoprefixer())

    /* JS */
    .use(uglify({
        filter: function(filepath) {
            return minimatch(filepath, '**/*.js') && !minimatch(filepath, '**/*.min.js');
        }
    }))

    /* HTML */
    .use(templates('handlebars'))

    /* --serve */
    .use(runWhen({
        flag: '--serve',
        callback: watch({
            paths: {
                "${source}/**/*": true,
                "${source}/**/*.scss": "scss/style.scss",
                "templates/**/*": "**/*.html"
            }
        })
    }))
    .use(runWhen({
        flag: '--serve',
        callback: serve()
    }))

    /* END! */
    .build(function(err, files) {
        if(err) {
            console.log(err);
        } else {
            console.log('Build complete!');
        }
    });