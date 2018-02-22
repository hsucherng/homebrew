/* Initial dependency */
var argv           = require('./custom-modules/argv.js');

/* Metalsmith START */
var Metalsmith     = require('metalsmith');
var express        = require('metalsmith-express');
var inlineCss      = require('inline-css');
var multimatch     = require('multimatch');
var postcss        = require('metalsmith-with-postcss');
var postcssScss    = require('postcss-scss');
var sass           = require('metalsmith-sass');
var watch          = require('metalsmith-watch');

/* Custom modules */
var run            = require('./custom-modules/metalsmith-run.js');

/* Configs */
var configs = {
        express:     require('./configs/express.js'),
        misc:        require('./configs/misc.js'),
        stylelint:   require('./configs/stylelint.js'),
        watch:       require('./configs/watch.js')
    };

/* Starting the entire build process */

console.log('Building...');

/* Starting Metalsmith */

Metalsmith(__dirname)
    .source('src')
    .destination('build')

    /* CSS */
    .use(postcss({
        pattern: ['**/*.scss'],
        syntax: postcssScss,
        plugins: {
            "stylelint": {
                config: configs.stylelint
            },
            "autoprefixer": {},
            "postcss-reporter": {}
        }
    }))
    .use(sass({
        outputStyle: "expanded",
        outputDir: function(originalPath) {
            return originalPath.replace('scss', 'css');
        }
    }))

    /* CSS Inliner */
    .use(function(files, metalsmith, done) {
        var targetFiles = multimatch(Object.keys(files), ['**/*.html']);
        var total = targetFiles.length;
        var count = 0;
        var stepFn = function() {
                count++;

                if(count >= total) {
                    done();
                    stepFn = function() {};
                }
            };

        if(!targetFiles.length) {
            done();
            return;
        }

        targetFiles.forEach(function(filepath, index) {
            var splitFilepath = filepath.split('\\');
            var folderPath = (splitFilepath.length > 1)
                                ? splitFilepath.slice(0, splitFilepath.length-1).join('\\')
                                : '';
            var file = files[filepath];
            var fileContents = file.contents.toString();
            var cssFilename = file.inlineCss;
            var cssFilepath = (folderPath)
                                ? folderPath + '\\' + cssFilename
                                : cssFilename;

            if(!files[cssFilepath]) {
                console.error(`Unable to find CSS file ${cssFilepath}.`);
                stepFn();
                return;
            }

            var cssContents = files[cssFilepath].contents.toString();

            inlineCss(fileContents, {
                extraCss: cssContents,
                removeHtmlSelectors: false,
                url: ' '
            }).then(function(html) {
                file.contents = html;
                delete files[cssFilepath];
                stepFn();
            });
        });
    })

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
