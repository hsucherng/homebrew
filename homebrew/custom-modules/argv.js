/*
 * Pass arguments while running command.
 *
 * e.g. node build host=127.0.0.0
 *
 * argv({
 *     key: 'host',
 *     defaultVal: 'localhost'
 * })
 *
 * Returns '127.0.0.0'. If no argument for `host` then it returns 'localhost'.
 *
 */
module.exports = function(options) {
    var key = options.key;

    for(var i = 0; i < process.argv.length; i++) {
        if(process.argv[i].indexOf(key) === 0) {
            var splitKeyStr = process.argv[i].split('=');

            if(splitKeyStr.length === 2) {
                return splitKeyStr[1];
            }
        }
    }

    return options.defaultVal;
};