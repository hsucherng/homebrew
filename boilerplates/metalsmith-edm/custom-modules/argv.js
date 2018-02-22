/*
 * Get arguments that are declared while running the script.
 *
 * Example:
 *
 * node build host=127.0.0.0 --serve
 *
 * argv('host') // returns '127.0.0.0'
 * argv('--serve') // returns true
 * argv('foo') // returns false
 *
 */
module.exports = function(key) {
    for(var i = 0; i < process.argv.length; i++) {
        if(key.substr(0,2) === '--') {
            if(process.argv[i] === key) {
                return true;
            }
        } else if(process.argv[i].indexOf(key) === 0) {
            var splitKeyStr = process.argv[i].split('=');

            if(splitKeyStr.length === 2) {
                return splitKeyStr[1];
            }
        }
    }

    return false;
};