
module.exports = {
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
};

function getRootPath(filepath) {
    var splitFilepath = filepath.split('\\');
    var rootPath = '';

    for(var i = 0; i < splitFilepath.length-1; i++) {
        rootPath += '../';
    }

    return rootPath;
}