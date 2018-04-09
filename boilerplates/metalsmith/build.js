/* Initial dependency */
var argv           = require('./custom-modules/argv.js');

/* Metalsmith START */
var Metalsmith     = require('metalsmith');
var cleanCss       = require('metalsmith-clean-css');
var copy           = require('metalsmith-copy');
var express        = require('metalsmith-express');
var filenames      = require('metalsmith-filenames'); // Not absolutely necessary, but it's useful metadata, especially for navigation
var inPlace        = require('metalsmith-in-place');
var minimatch      = require('minimatch');
var nunjucks       = require('nunjucks');
var postcss        = require('metalsmith-with-postcss');
var postcssSCSS    = require('postcss-scss');
var sass           = require('metalsmith-sass');
var uglify         = require('metalsmith-uglify');
var watch          = require('metalsmith-watch');

/* Custom modules */
var jsPartials     = require('./custom-modules/metalsmith-js-partial.js');
var run            = require('./custom-modules/metalsmith-run.js');
var defaultMeta    = require('./custom-modules/metalsmith-default-meta.js');

/* Configs */
var configs = {
        defaultMeta: require('./configs/default-meta.js'),
        express:     require('./configs/express.js'),
        misc:        require('./configs/misc.js'),
        stylelint:   require('./configs/stylelint.js'),
        watch:       require('./configs/watch.js')
    };

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
    .use(postcss({
        map: false,
        pattern: ['**/*.scss'],
        plugins: {
            "stylelint": {
                config: configs.stylelint
            },
            "autoprefixer": {},
            "postcss-reporter": {}
        },
        syntax: postcssSCSS,
    }))
    .use(sass({
        outputStyle: "expanded",
        outputDir: function(originalPath) {
            return originalPath.replace('scss', 'css');
        },
        sourceMap: true,
        sourceMapContents: true
    }))
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
    .use(defaultMeta(configs.defaultMeta))
    .use(inPlace({
        engine: 'nunjucks',
        pattern: '**/*.html'
    }))

    /* Virtual folder */
    .use(function(files, metalsmith, done) {
        if(configs.misc.virtualFolder) {
            Object.keys(files).forEach(function(filepath, index) {
                files[configs.misc.virtualFolder + filepath] = files[filepath];
                delete files[filepath]
            });
        }

        done();
    })

    /* Watch and serve */
    .use(express(configs.express))
    .use(run({
        unless: '--dist',
        callback: watch(configs.watch)
    }))

    /* END! */
    .build(function(err, files) {
        var message = err ? err : 'Build complete!';
        console.log(message);
    });
