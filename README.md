# Homebrew

**Variation:** Metalsmith.

A personal boilerplate for myself. Has a couple of variations, e.g. vanilla CSS version and SCSS version. Check the branches to see what's available.

This particular branch uses [Metalsmith](http://metalsmith.io) with the following plugins setup:

- [Autoprefixer](https://github.com/postcss/autoprefixer)
- [Handlebars](http://handlebarsjs.com/)
- [SASS](http://sass-lang.com/)
- [Uglify](https://github.com/ksmithut/metalsmith-uglify)

## Setup

1. Install [node](http://nodejs.org).
2. Make a copy of the *homebrew* folder.
3. Open up the CLI (command-line interface, e.g. cmd.exe) and `cd` into the fresh copy of the *homebrew* folder.
4. Run `npm install`. This should install all the required dependencies.
5. Run `node build` to build the site, which should compile into a new *build* folder. Alternatively, run `node build --serve` to build the site *and* serve it up on localhost (port 8080 by default).

No LiveReload / BrowserSync, so make sure Metalsmith is properly watching & rebuilding the changes before reloading the page.

## Known Issues

This is still a rather new, immature workflow, so there are a couple of hiccups while working with it. We'll need to workaround it until an optimal solution is found.

**After running `node serve`, copying images to the *src* folder does not trigger a rebuild.**

Current workaround is to re-run the `node serve` command again. On Windows, you can press *CTRL + C* to shutdown the currently running localhost, so that you can re-run the `node serve` command again.

**No detailed error logging while running `node serve`.**

Current workaround is to run `node build` so that a more detailed error log is shown in the CLI, then fix the issue from there.

**Template partials are not automatically updated while running `node serve`.**

Current work around is to re-run the `node serve` command again. On Windows, you can press *CTRL + C* to shutdown the currently running localhost, so that you can re-run the `node serve` command again.

**Template partials need to be manually registered inside `build.js`.**

Not sure how to automate it yet. Might need a plugin like metalsmith-partial, although I'm not sure how that works yet.

## Assets

As with the other branches, this also contains a small collection of commonly used assets that can be plug-and-played. Their CSS styles are located in `scss/assets/homebrew/` while their JavaScript functions are located in `js/plugins/homebrew.js`. So far, the list of assets covered are as follows:

- Carousels
- Dropdowns
- Height Syncing
- Popups
- Tooltips
- Validation

The JavaScript functions are documented in its uncompressed file. Alternatively, you can visit the [documentation](http://hsucherng.github.io/homebrew) for more elaborately-formatted details.