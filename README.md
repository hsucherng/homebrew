# Homebrew

**Variation:** Metalsmith.

A personal boilerplate for myself. Has a couple of variations, e.g. vanilla CSS version and SCSS version. Check the branches to see what's available.

This particular branch uses [Metalsmith](http://metalsmith.io) with the following plugins setup:

- [Autoprefixer](https://github.com/postcss/autoprefixer)
- [Swig](http://paularmstrong.github.io/swig/)
- [SASS](http://sass-lang.com/)
- [Uglify](https://github.com/ksmithut/metalsmith-uglify)

## Setup

1. Install [node](http://nodejs.org).
2. Make a copy of the *homebrew* folder.
3. Open up the CLI (command-line interface, e.g. cmd.exe) and `cd` into the fresh copy of the *homebrew* folder.
4. Run `npm install`. This should install all the required dependencies.
5. Run `node build` to build the site, which should compile into a new *build* folder, and then serve it up on localhost (http://localhost:8080 by default). Use the `node build --dist` to just build without serving the localhost.

No LiveReload / BrowserSync, so make sure Metalsmith is properly watching & rebuilding the changes before reloading the page.

## Known Issues

This is still a rather new, immature workflow, so there are a couple of hiccups while working with it. We'll need to workaround it until an optimal solution is found.

**After running `node build`, copying images to the *src* folder does not trigger a rebuild.**

Current workaround is to re-run the `node build` command. On Windows, you can press *CTRL + C* to shutdown the currently running localhost, so that you can re-run the `node build` command.

**SASS errors don't seem to be properly logged when making changes while localhost is up.**

Current workaround is to re-run the `node build` so that a more detailed error log is shown in the CLI, then fix the issue from there. On Windows, you can press *CTRL + C* to shutdown the currently running localhost, so that you can re-run the `node build` command.

## Debugging

Some of the console log is enabled through the `DEBUG` environment variable, based on space or comma-delimited names.

On Windows, this can be done using the `set` command.

	set DEBUG=*,-not_this