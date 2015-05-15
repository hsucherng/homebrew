var debug = require('debug')('runWhen');

module.exports = function(options) {
    var flag = options.flag,
        callback = options.callback;

    return function(files, metalsmith, done) {
        if(typeof callback !== 'function') {
            debug('runWhen: Missing callback function.');
        } else if(typeof flag === 'string') {
            if(process.argv.indexOf(flag) > -1) {
                callback.call(null, files, metalsmith, done);
            }
        } else if(flag instanceof Array) {
            if(flag.length) {
                for(var i = 0; i < flag.length; i++) {
                    if(process.argv.indexOf(flag[i]) > -1) {
                        callback.call(null, files, metalsmith, done);
                        break;
                    }
                }
            } else {
                debug('Received empty array as flag parameter. Ignoring callback.');
            }
        } else {
            debug('Unrecognised or missing flag parameter. Ignoring callback.');
        }

        done();
    }
};