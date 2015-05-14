var Metalsmith   = require('metalsmith'),
    autoprefixer = require('metalsmith-autoprefixer'),
    fs           = require('fs'),
    handlebars   = require('handlebars'),
    sass         = require('metalsmith-sass'),
    serve        = require('metalsmith-serve'),
    templates    = require('metalsmith-templates'),
    uglify       = require('metalsmith-uglify'),
    watch        = require('metalsmith-watch'),

    /*
     * Conditional Function. Only run the callback if the desired flag is
     * passed in while running this script.
     *
     * node build --serve
     *
     * condFn({
     *     flag: '--serve',
     *     callback: (function() {
     *         return serve();
     *     })()
     * })
     */
    condFn = function(config) {
        return function(files, metalsmith, done) {
            if(process.argv.indexOf(config.flag) > -1) {
                config.callback.call(null, files, metalsmith, done);
            } else {
                done();
            }
        }
    };

handlebars.registerPartial('samplePartial', fs.readFileSync(__dirname + '/templates/partials/sample-partial.html').toString());

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
            if(filepath.substr(filepath.length-3) == '.js') {
                return (filepath.substr(filepath.length-7) != '.min.js');
            } else {
                return false;
            }
        }
    }))

    /* HTML */
    .use(templates('handlebars'))

    /* --serve */
    .use(condFn({
        flag: '--serve',
        callback: (function() {
            return watch({
                paths: {
                    "${source}/**/*": true,
                    "${source}/**/*.scss": "scss/style.scss",
                    "templates/**/*": "**/*.html"
                }
            });
        })()
    }))
    .use(condFn({
        flag: '--serve',
        callback: (function() {
            return serve();
        })()
    }))

    /* END! */
    .build(function(err, files) {
        if(err) {
            console.log(err);
        } else {
            console.log('Build complete!');
        }
    });