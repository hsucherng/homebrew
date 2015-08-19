/*
 * Concatenate partial javascript files inline.
 *
 * Only applying it to Javascript files, because both Swig and SASS already
 * have ways to import partials.
 *  
 * In the JavaScript file, use the following line:
 *
 *     //@js-partial "link/from/current/file/folder/file.ext"
 * 
 * The entire partial file's contents will be receive indentation based on the
 * @z-concat line's indentation. To ignore that, add a - infront of the @:
 * 
 *     //@-js-partial "link/from/current/file/folder/file.ext"
 * 
 * Simlar to SASS, putting an underscore at the start of the partial file name
 * would remove it from the build output. 
 * 
 * Does NOT support nested concatenation.
 */
var minimatch = require('minimatch');

module.exports = function(options) {
    var regexp = /^( +)\/\/(-?)@js-partial(.+)$/gm;

    return function(files, metalsmith, done) {
        var jsFiles = Object.keys(files).filter(function(filepath) {
                return minimatch(filepath, '**/*.js') && !minimatch(filepath, '**/*.min.js');
            });

        jsFiles.forEach(function(filepath) {
            var file = files[filepath],
                fileContents = file.contents.toString(),
                splitFilepath = filepath.split('\\'),
                currentFolder = splitFilepath.slice(0, splitFilepath.length-1).join('\\');

            file.contents = fileContents.replace(regexp, function(matchStr, indentStr, ignoreIndent, argStr) {
                var targetFilepath;

                argStr = argStr.trim();

                var argStr__firstChar = argStr.substr(0,1),
                    argStr__lastChar = argStr.substr(argStr.length-1,1);

                if(argStr__firstChar === '"' && argStr__lastChar === '"'
                || argStr__firstChar === "'" && argStr__lastChar === "'") {
                    targetFilepath = argStr.substr(1, argStr.length-2);
                }

                if(targetFilepath) {
                    var splitTargetFilepath = targetFilepath.split('/'),
                        reverseSlashTargetFilepath = splitTargetFilepath.join('\\'),
                        targetFile = files[currentFolder + '\\' + reverseSlashTargetFilepath];

                    if(targetFile) {
                        var targetFileContents = targetFile.contents.toString();

                        if(ignoreIndent !== '-') {
                            targetFileContents = targetFileContents
                                .split('\n')
                                .map(function(contentStr) {
                                    return indentStr + contentStr;
                                })
                                .join('\n');
                        }

                        return targetFileContents;
                    }
                }
            });
        });

        jsFiles
            .filter(function(filepath) {
                var splitFilepath = filepath.split('\\'),
                    filename = splitFilepath[splitFilepath.length-1];

                return filename.substr(0,1) === '_';
            })
            .forEach(function(filepath) {
                delete files[filepath];
            });

        done();
    }
};