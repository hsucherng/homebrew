# Metalsmith EDM boilerplate

This is a [Metalsmith](http://metalsmith.io) EDM boilerplate that has been setup to provide a modern workflow for EDM tasks. Using this workflow, we will no longer have to set styles directly inline, and we get to leverage some of the key utilities that have already been setup in the regular Metalsmith boilerplate.

This boilerplate has been setup with the following:

- [Express](https://github.com/chiefy/metalsmith-express)
- [Inline CSS](https://github.com/borisovg/metalsmith-inline-css)
- [SCSS](http://sass-lang.com/)
- [Stylelint](https://stylelint.io/)

## Setup

1. Install [node](http://nodejs.org). Currently tested with v6.9.3.
2. Make a copy of the *metalsmith-edm* boilerplate folder.
3. Open up the CLI (command-line interface, e.g. cmd.exe) and `cd` into the fresh copy of the boilerplate folder.
4. Run `npm install`. This boilerplate has also been setup with Yarn, so if you have that, you can use `yarn install` instead of `npm install`. Either way, this should install all the required dependencies.
5. Run `node build` to build the EDM, which should compile into a new *build* folder, and then serve it up on localhost (`http://localhost:8080/edm/` by default).

## Configurations

Check the files in the `configs` folder for the configurations that affect the build and its output.

### Virtual Folder

The build has a "virtual folder" setup by default --- basically, the build sends all the output files into the `virtualFolder` path that is set inside `configs/misc.js`. This is to allow for better browser URL history, since most sites using this workflow would be served over `localhost:8080` by default.

To disable it, set the `virtualFolder` value to `''`.

## Debugging notes

For certain plugins, we can get the build to log information in the console by setting the `DEBUG` environment variable. Currently, in this build, it seems that `metalsmith-inline-css` has been setup for this behaviour.

On Windows, use the `set` command to set a value for the `DEBUG` environment variable. Setting it to `*` would turn on debugging for all configured plugins:

    set DEBUG=*

To turn on debugging for only one plugin, set its name as the value:

    set DEBUG=metalsmith-in-place

To turn off debugging, set the value to nothing:

    set DEBUG=