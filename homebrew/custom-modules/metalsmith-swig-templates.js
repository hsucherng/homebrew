/*
 * Apply swig templates to selected files.
 */
var minimatch = require('minimatch'),
    swig = require('swig');

module.exports = function(options) {
    var pattern = options.pattern;

    return function(files, metalsmith, done) {
        var targetFiles = Object.keys(files);

        if(pattern) {
            targetFiles = targetFiles.filter(function(filepath) {
                return minimatch(filepath, pattern);
            });
        }

        targetFiles.forEach(function(filepath) {
            var file = files[filepath];
            file.contents = swig.renderFile(metalsmith.source() + '\\' + filepath, file);
        });

        done();
    }
};