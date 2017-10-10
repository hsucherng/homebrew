/* Initial dependency */
var argv = require('./custom-modules/argv.js');
var settings = require('./settings.js');

/* Metalsmith START */
var Metalsmith   = require('metalsmith');
var autoprefixer = require('metalsmith-autoprefixer');
var cleanCss     = require('metalsmith-clean-css');
var copy         = require('metalsmith-copy');
var express      = require('metalsmith-express');
var filenames    = require('metalsmith-filenames'); // Not absolutely necessary, but it's useful metadata, especially for navigation
var ignore       = require('metalsmith-ignore');
var inPlace      = require('metalsmith-in-place');
var layouts      = require('metalsmith-layouts');
var minimatch    = require('minimatch');
var nunjucks     = require('nunjucks');
var sass         = require('metalsmith-sass');
var serve        = require('metalsmith-serve');
var uglify       = require('metalsmith-uglify');
var watch        = require('metalsmith-watch');

/* Custom modules */
var jsPartials       = require('./custom-modules/metalsmith-js-partial.js');
var run              = require('./custom-modules/metalsmith-run.js');
var defaultMeta      = require('./custom-modules/metalsmith-default-meta.js');

/* Starting the entire build process */

console.log('Building...');

/* Nunjucks configuration */

nunjucks
    .configure(__dirname + '/templates', {
        noCache: true
    })
    .addFilter('indexOf', function(baseString, comparisonString) {
        return baseString.indexOf(comparisonString);
    });

/* Starting Metalsmith */

Metalsmith(__dirname)
    .source('src')
    .destination('build')

    /* CSS */
    .use(sass({
        outputStyle: "expanded",
        outputDir: function(originalPath) {
            return originalPath.replace('scss', 'css');
        }
    }))
    .use(autoprefixer())
    .use(copy({ // Making a copy...
        pattern: '**/*.css',
        extension: '.min.css'
    }))
    .use(cleanCss({ // ... so that we can minify it.
        files: '**/*.min.css',
        cleanCSS: {
            rebase: false
        }
    }))

    /* JS */
    .use(jsPartials())
    .use(uglify({
        filter: function(filepath) {
            return minimatch(filepath, '**/*.js')
                && !minimatch(filepath, '**/*.min.js')
                && !minimatch(filepath, '**/partials/**/*.js');
        }
    }))

    /* HTML */
    .use(filenames()) // Not absolutely necessary, but it's useful metadata, especially for navigation
    .use(defaultMeta(settings.defaultMeta))
    .use(inPlace({
        engine: 'nunjucks',
        pattern: '**/*.html'
    }))
    .use(layouts({
        engine: 'nunjucks',
        pattern: '**/*.html'
    }))

    .use(express({
        host: (argv('host') ? argv('host') : settings.host),
        port: (argv('port') ? argv('port') : settings.port)
    }))
    .use(run({
        unless: '--dist',
        callback: watch({
            paths: settings.watchPaths,
            livereload: true
        })
    }))

    /* END! */
    .build(function(err, files) {
        if(err) {
            console.log(err);
        } else {
            console.log('Build complete!');
        }
    });