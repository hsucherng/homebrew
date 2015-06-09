/*
 * Set default metadata for plugins to consume.
 *
 * defaultMeta({
 *     pattern: '**\/*.html',
 *     meta: {
 *         layout: 'default.html'
 *     }
 * });
 * 
 */
var minimatch = require('minimatch');

module.exports = function(options) {
    var pattern = options.pattern,
        meta = options.meta || {},
        metaKeys = Object.keys(meta);

    return function(files, metalsmith, done) {
        Object.keys(files)
            .filter(function(keystr) {
                return minimatch(keystr, pattern);
            })
            .forEach(function(keystr) {
                var file = files[keystr];

                for(var i = 0; i < metaKeys.length; i++) {
                    if(typeof file[metaKeys[i]] === 'undefined') {
                        file[metaKeys[i]] = meta[metaKeys[i]];
                    }
                }
            });

        done();
    }
};