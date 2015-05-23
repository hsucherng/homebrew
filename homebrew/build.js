var Metalsmith      = require('metalsmith'),
    autoprefixer    = require('metalsmith-autoprefixer'),
    fs              = require('fs'),
    handlebars      = require('handlebars'),
    minimatch       = require('minimatch'),
    sass            = require('metalsmith-sass'),
    serve           = require('metalsmith-serve'),
    templates       = require('metalsmith-templates'),
    uglify          = require('metalsmith-uglify'),
    watch           = require('metalsmith-watch'),

    /* Custom modules */
    argv            = require('./custom-modules/argv.js'),
    run             = require('./custom-modules/run.js'),
    defaultTemplate = require('./custom-modules/default-template.js');

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
    .use(defaultTemplate({
        pattern: '*/*.html',
        template: 'default.hbt'
    }))
    .use(templates('handlebars'))

    /* --serve */
    .use(run({
        when: '--serve',
        callback: watch({
            paths: {
                "${source}/**/*": true,
                "${source}/**/*.scss": "scss/style.scss",
                "templates/**/*": "**/*.html"
            }
        })
    }))
    .use(run({
        when: '--serve',
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