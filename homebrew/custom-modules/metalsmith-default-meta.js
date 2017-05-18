/*
 * Set default metadata for plugins to consume.
 *
 *  .use(defaultMeta({
 *      'your-pattern-here': {
 *          prop: 'value'
 *      }
 *  }));
 */
var minimatch = require('minimatch');

module.exports = function(options) {
    var patterns = Object.keys(options);

    return function(files, metalsmith, done) {
        var fileKeys = Object.keys(files);

        patterns.forEach(function(patternStr) {
            var metaObj = options[patternStr],
                metaKeys = Object.keys(metaObj);

            fileKeys
                .filter(function(keystr) {
                    return minimatch(keystr, patternStr);
                })
                .forEach(function(keystr) {
                    var file = files[keystr];

                    for(var i = 0; i < metaKeys.length; i++) {
                        if(typeof file[metaKeys[i]] === 'undefined') {
                            if(typeof metaObj[metaKeys[i]] === 'function') {
                                file[metaKeys[i]] = metaObj[metaKeys[i]](keystr, file, files, metalsmith);
                            } else {
                                file[metaKeys[i]] = metaObj[metaKeys[i]];
                            }
                        }
                    }
                });
        });

        done();
    }
};