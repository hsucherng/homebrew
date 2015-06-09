var Metalsmith      = require('metalsmith'),
    autoprefixer    = require('metalsmith-autoprefixer'),
    fs              = require('fs-extra'),
    minimatch       = require('minimatch'),
    sass            = require('metalsmith-sass'),
    serve           = require('metalsmith-serve'),
    swig            = require('swig'),
    uglify          = require('metalsmith-uglify'),
    watch           = require('metalsmith-watch'),

    /* Custom modules */
    argv            = require('./custom-modules/argv.js'),
    run             = require('./custom-modules/metalsmith-run.js'),
    templates       = require('./custom-modules/metalsmith-swig-templates.js'),
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
    .use(uglify({
        filter: function(filepath) {
            return minimatch(filepath, '**/*.js') && !minimatch(filepath, '**/*.min.js');
        }
    }))

    /* HTML */
    .use(templates({
        pattern: '*.html'
    }))

    .use(run({
        unless: '--dist',
        callback: watch({
            paths: {
                "${source}/**/*": true,
                "${source}/**/*.scss": "scss/style.scss",
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