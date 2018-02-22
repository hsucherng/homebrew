# Metalsmith boilerplate

The [Metalsmith](http://metalsmith.io) boilerplate has been setup with the following:

- Third party plugins:
    - [Autoprefixer](https://github.com/postcss/autoprefixer)
    - [Express](https://github.com/chiefy/metalsmith-express)
    - [Nunjucks](https://mozilla.github.io/nunjucks/)
    - [SCSS](http://sass-lang.com/)
    - [Stylelint](https://stylelint.io/)
    - [Uglify](https://github.com/ksmithut/metalsmith-uglify)

- Custom-written functions:
    - A slightly more elaborate setup to allow for the addition of default metadata to all the source files.
    - A concatenation function to allow for the splitting of JavaScript files into smaller partial files. This is mainly for organisation, though it can be prove to be useful in a few other situations as well.

## Setup

1. Install [node](http://nodejs.org). Currently tested with v6.9.3.
2. Make a copy of the *metalsmith* boilerplate folder.
3. Open up the CLI (command-line interface, e.g. cmd.exe) and `cd` into the fresh copy of the boilerplate folder.
4. Run `npm install`. This boilerplate has also been setup with Yarn, so if we have that, we can use `yarn install` instead of `npm install`. Either way, this should install all the required dependencies.
5. Run `node build` to build the site, which should compile into a new *build* folder, and then serve it up on localhost (`http://localhost:8080/site/` by default).

## Configurations

Check the files in the `configs` folder for the configurations that affect the build and its output.

### Default Meta

Just a note: metadata set in the page's YAML always take precedence over those set in `configs/default-meta.js`.

### Virtual Folder

The build has a "virtual folder" setup by default --- basically, the build sends all the output files into the `virtualFolder` path that is set inside `configs/misc.js`. This is to allow for better browser URL history, since most sites using this workflow would be served over `localhost:8080` by default.

To disable it, set the `virtualFolder` value to `''`.

## Debugging notes

For certain plugins, we can get the build to log information in the console by setting the `DEBUG` environment variable. Currently, in this build, it seems that `metalsmith-in-place` and `metalsmith-copy` have been setup for this behaviour.

On Windows, use the `set` command to set a value for the `DEBUG` environment variable. Setting it to `*` would turn on debugging for all configured plugins:

    set DEBUG=*

To turn on debugging for only one plugin, set its name as the value:

    set DEBUG=metalsmith-in-place

To turn off debugging, set the value to nothing:

    set DEBUG=