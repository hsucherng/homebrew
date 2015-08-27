var Metalsmith      = require('metalsmith'),
    autoprefixer    = require('metalsmith-autoprefixer'),
    filenames       = require('metalsmith-filenames'),
    inPlace         = require('metalsmith-in-place'),
    layouts         = require('metalsmith-layouts'),
    minimatch       = require('minimatch'),
    sass            = require('metalsmith-sass'),
    serve           = require('metalsmith-serve'),
    swig            = require('swig'),
    uglify          = require('metalsmith-uglify'),
    watch           = require('metalsmith-watch'),

    /* Custom modules */
    argv            = require('./custom-modules/argv.js'),
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
        outputStyle: "compressed",
        outputDir: "css/"
    }))
    .use(autoprefixer())

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
                "${source}/!(js|scss)/**/*": true,
                "${source}/js/**/*.js": "js/**/*.js",
                "${source}/scss/**/*.scss": "scss/style.scss",
                "templates/**/*": "**/*.html"
            }
        })
    }))
    .use(run({
        unless: '--dist',
        callback: serve({
            host: (argv('host')) ? argv('host') : 'localhost',
            port: (argv('port')) ? argv('port') : '8080'
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