/*
 * Sets a default template for Handlebars to use.
 *
 * defaultTemplate({
 *     pattern: '**\/*.html',
 *     template: 'default.hbt'
 * })
 * 
 */
var minimatch = require('minimatch');

module.exports = function(options) {
    var pattern = options.pattern,
        template = options.template;

    return function(files, metalsmith, done) {
        Object.keys(files)
            .filter(function(keystr) {
                return minimatch(keystr, pattern);
            })
            .forEach(function(keystr) {
                var file = files[keystr];

                if(!file.template) {
                    file.template = template;
                }
            });

        done();
    }
};