var Metalsmith   = require('metalsmith'),
    autoprefixer = require('metalsmith-autoprefixer'),
    cleanCSS     = require('metalsmith-clean-css'),
    concat       = require('metalsmith-concat'),
    fs           = require('fs'),
    handlebars   = require('handlebars'),
    sass         = require('metalsmith-sass'),
    templates    = require('metalsmith-templates'),
    uglify       = require('metalsmith-uglify');

handlebars.registerPartial('samplePartial', fs.readFileSync(__dirname + '/templates/partials/sample-partial.html').toString());

Metalsmith(__dirname)
    .source('src')
    .destination('build')
    .use(sass({
        outputStyle: "expanded",
        outputDir: "css/"
    }))
    .use(autoprefixer())
    .use(cleanCSS())
    .use(concat({
        files: 'js/plugins/homebrew/*.js',
        output: 'js/plugins/homebrew.js'
    }))
    .use(uglify({
        filter: function(filepath) {
            if(filepath.substr(filepath.length-3) == '.js') {
                return (filepath.substr(filepath.length-7) != '.min.js');
            } else {
                return false;
            }
        }
    }))
    .use(templates('handlebars'))
    .build(function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('Build complete!');
        }
    });