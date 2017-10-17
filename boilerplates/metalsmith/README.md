# Metalsmith boilerplate

The [Metalsmith](http://metalsmith.io) boilerplate has been setup with the following:

- Third party plugins:
    - [Autoprefixer](https://github.com/postcss/autoprefixer)
    - [Express](https://github.com/chiefy/metalsmith-express)
    - [Nunjucks](https://mozilla.github.io/nunjucks/)
    - [SCSS](http://sass-lang.com/)
    - [Uglify](https://github.com/ksmithut/metalsmith-uglify)

- Custom-written functions:
    - A slightly more elaborate setup to allow for the addition of default metadata to all the source files.
    - A concatenation function to allow for the splitting of JavaScript files into smaller partial files. This is mainly for organisation, though it can be prove to be useful in a few other situations as well.

## Setup

1. Install [node](http://nodejs.org). Currently tested with v4.4.4.
2. Make a copy of the *metalsmith* boilerplate folder.
3. Open up the CLI (command-line interface, e.g. cmd.exe) and `cd` into the fresh copy of the boilerplate folder.
4. Run `npm install`. This boilerplate has also been setup with Yarn, so if you have that, you can use `yarn install` instead of `npm install`. Either way, this should install all the required dependencies.
5. Run `node build` to build the site, which should compile into a new *build* folder, and then serve it up on localhost (`http://localhost:8080` by default).

## Configurations

Check the files in the `configs` folder for the configurations that affect the build and its output.

### Default Meta

Just a note: metadata set in the page's YAML always take precedence over those set in `configs/default-meta.js`.

## Build arguments and flags

When running the build command, you may use any of the following to tweak the result:

- `host=0.0.0.0` — Adjust the host. Note that this is temporary; if you want a permanent change, tweak the value in `config/express.js` instead.
- `port=3000` — Adjust the port. Note that this is temporary; if you want a permanent change, tweak the value in `config/express.js` instead.

## Debugging

Rarely needed, but a more elaborate manner of debugging is accessible through the `DEBUG` environment variable, based on space or comma-delimited names.

On Windows, this can be done using the `set` command.

    set DEBUG=*,-not_this