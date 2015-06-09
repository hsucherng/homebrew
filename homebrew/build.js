var Metalsmith      = require('metalsmith'),
    autoprefixer    = require('metalsmith-autoprefixer'),
    fs              = require('fs-extra'),
    handlebars      = require('handlebars'),
    minimatch       = require('minimatch'),
    sass            = require('metalsmith-sass'),
    serve           = require('metalsmith-serve'),
    templates       = require('metalsmith-templates'),
    uglify          = require('metalsmith-uglify'),
    watch           = require('metalsmith-watch'),

    /* Custom modules */
    argv            = require('./custom-modules/argv.js'),
    run             = require('./custom-modules/metalsmith-run.js'),
    defaultMeta     = require('./custom-modules/metalsmith-default-meta.js');

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
    .use(defaultMeta({
        pattern: '*.html',
        meta: {
            template: 'default.hbt'
        }
    }))
    .use(templates('handlebars'))

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