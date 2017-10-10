module.exports = {
    host: 'localhost', // Can be overwritten with arguments during build, e.g. `node build host=127.0.0.1`
    port: '8080', // Can be overwritten with arguments during build, e.g. `node build port=3000`

    defaultMeta: (function() {
        function getRootPath(filepath) {
            var splitFilepath = filepath.split('\\');
            var rootPath = '';

            for(var i = 0; i < splitFilepath.length-1; i++) {
                rootPath += '../';
            }

            return rootPath;
        }

        return {
            /*  FORMAT:
                'minimatch-pattern': {
                    'key': 'value',
                    'key': function(filepath, file, files, metalsmith) {
                        return 'value';
                    }
                }
            */
            '**/*.html': {
                path: function(filepath, file, files, metalsmith) {
                    var root = getRootPath(filepath);

                    return {
                        'root': root,
                        'css': root + 'assets/css/',
                        'images': {
                            /* Set the page's image folder based on its folder path and
                             * file name.
                             *
                             * If folder path & file name: plans/prepaid/ultimate.html,
                             * then {{path.images.page}} = {{path.root}}assets/images/pages/plans/prepaid/ultimate/
                             *
                             * To override this, set the `imagesFolder` variable in the
                             * page's YAML. It will be prefixed with the root path + the
                             * base path to the page images folder.
                             */
                            'page': (file.imagesFolder)
                                  ? root + 'assets/images/pages/' + file.imagesFolder
                                  : root + 'assets/images/pages/' + filepath.replace('index.html', 'landing').replace('.html', '').replace(/\\/g, '/') + '/',
                        },
                        'js': root + 'assets/js/'
                    };
                }
            }
        }
    })(),

    watchPaths: {
        "${source}/*": true,
        "${source}/!(assets)/**/*": true,
        "${source}/**/assets/!(js|scss)/**/*": true,
        "${source}/**/assets/js/**/*.js": "**/assets/js/**/*.js",
        "${source}/**/assets/scss/**/*.scss": "**/assets/scss/**/*.scss",
        "templates/**/*": "**/*.html"
    }
};