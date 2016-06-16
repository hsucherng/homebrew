/* Initial dependency */
var argv = require('./custom-modules/argv.js');

/* Default build settings */
var host = argv('host') ? argv('host') : 'localhost',
    port = argv('port') ? argv('port') : '8080';

/* Metalsmith START */
var Metalsmith      = require('metalsmith'),
    autoprefixer    = require('metalsmith-autoprefixer'),
    cleanCss        = require('metalsmith-clean-css'),
    copy            = require('metalsmith-copy'),
    filenames       = require('metalsmith-filenames'),
    inPlace         = require('metalsmith-in-place'),
    layouts         = require('metalsmith-layouts'),
    minimatch       = require('minimatch'),
    rootPath        = require('metalsmith-rootpath'),
    sass            = require('metalsmith-sass'),
    serve           = require('metalsmith-serve'),
    swig            = require('swig'),
    uglify          = require('metalsmith-uglify'),
    watch           = require('metalsmith-watch'),

    /* Custom modules */
    jsPartials      = require('./custom-modules/metalsmith-js-partial.js'),
    run             = require('./custom-modules/metalsmith-run.js'),
    defaultMeta     = require('./custom-modules/metalsmith-default-meta.js');

console.log('Building...');

swig.setDefaults({
    cache: argv('--dist') ? true : false,
    loader: swig.loaders.fs(__dirname + '/templates')
});

Metalsmith(__dirname)
    .source('src')
    .destination('build')

    /* CSS */
    .use(sass({
        outputStyle: "expanded",
        outputDir: "assets/css/"
    }))
    .use(autoprefixer())
    .use(copy({
        pattern: 'assets/css/style.css',
        extension: '.min.css'
    }))
    .use(cleanCss({
        files: 'assets/css/style.min.css',
        cleanCSS: {
            advanced: false
        }
    }))

    /* JS */
    .use(jsPartials())
    .use(uglify({
        filter: function(filepath) {
            return minimatch(filepath, '**/js/**/*.js')
                && !minimatch(filepath, '**/*.min.js')
                && !minimatch(filepath, '**/partials/**/*.js');
        }
    }))

    /* HTML */
    .use(filenames())
    .use(rootPath())
    .use(inPlace({
        engine: 'swig'
    }))
    .use(layouts({
        engine: 'swig'
    }))

    .use(run({
        unless: '--dist',
        callback: watch({
            paths: {
                "${source}/*": true,
                "${source}/!(assets)/**/*": true,
                "${source}/assets/!(js|scss)/**/*": true,
                "${source}/assets/js/**/*.js": "assets/js/**/*.js",
                "${source}/assets/scss/**/*.scss": "assets/scss/style.scss",
                "templates/**/*": "**/*.html"
            }
        })
    }))
    .use(run({
        unless: '--dist',
        callback: serve({
            host: host,
            port: port
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