/*
 * Only run the callback if the declared flags meet the specified requirement.
 *
 * Can pass in `when` or `unless` or both, depending on requirements.
 *
 * run({
 *     when: '--serve', // Run if argv is truthy.
 *     unless: '--dist', // Ignore if argv is truthy.
 *     callback: serve() // The callback to run
 * });
 * 
 * run({
 *     when: ['--serve', '--localhost'], // Run if any of the argv is truthy
 *     unless: ['--dist', '--prod'], // Ignore if any of the argv is truthy.
 *     callback: serve() // The callback to run
 * });
 * 
 * run({
 *     when: [
 *         ['--serve', '--localhost'], // Run if both argv are truthy
 *         '--development' // Run if argv is truthy
 *     ],
 *     unless: [
 *         ['--dist', '--prod'], // Ignore if both argv are truthy
 *         '--source' // Ignore if argv is truthy
 *     ],
 *     callback: serve() // The callback to run
 * });
 * 
 */
var debug = require('debug')('run'),
    argv = require('./argv.js');

module.exports = function(options) {
    var when = options.when,
        unless = options.unless,
        callback = options.callback;

    return function(files, metalsmith, done) {
        if(typeof callback !== 'function') {
            debug('Missing callback function.');
        } else if(when || unless) {
            var whenBool = (when) ? processFlag(when) : true,
                unlessBool = (unless) ? processFlag(unless) : false;

            if(whenBool && !unlessBool) {
                callback.call(null, files, metalsmith, done);
            }
        } else {
            debug('Unrecognised or missing when/unless parameter. Ignoring callback.');
        }

        done();
    };

    function processFlag(condition) {
        if(typeof condition === 'string') {
            return (argv(condition)) ? true : false;
        } else if(condition instanceof Array) {
            var i, j, nestedConditionBool;

            for(i = 0; i < condition.length; i++) {
                if(typeof condition[i] === 'string') {
                    if(argv(condition[i])) {
                        return true;
                    }
                } else if(condition[i] instanceof Array) {
                    nestedConditionBool = true;

                    for(j = 0; j < condition[i].length; j++) {
                        if(!argv(condition[i][j])) {
                            nestedConditionBool = false;
                            break;
                        }
                    }

                    if(nestedConditionBool) {
                        return true;
                    }
                }
            }

            return false;
        }
    }
};