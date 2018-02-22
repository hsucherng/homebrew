module.exports = {
    "ignoreFiles": [
        "**/_vars.scss",
        "**/_mixins.scss",
        "**/_functions.scss",
        "**/_utilities.scss",
        "**/imports/*.scss"
    ],

    "rules": {
        /*======================================================================
         * Sorted as per https://stylelint.io/user-guide/rules/, on 10 Oct 2017.
         *====================================================================*/

        //---- Possible errors ----//

        // Color
        "color-no-invalid-hex": true,

        // Font family
        "font-family-no-duplicate-names": true,

        // Function
        "function-calc-no-unspaced-operator": true,
        "function-linear-gradient-no-nonstandard-direction": true,

        // String
        "string-no-newline": true,

        // Unit
        "unit-no-unknown": true,

        // Shorthand property
        "shorthand-property-no-redundant-values": true,

        // Property
        "property-no-unknown": true,

        // Keyframe declaration
        "keyframe-declaration-no-important": true,

        // Declaration block
        "declaration-block-no-duplicate-properties": true,
        "declaration-block-no-redundant-longhand-properties": true,
        "declaration-block-no-shorthand-property-overrides": true,

        // Block
        "block-no-empty": true,

        // Selector
        "selector-pseudo-class-no-unknown": true,
        "selector-pseudo-element-no-unknown": [true, {
            "ignorePseudoElements": ["ms-clear", "ms-reveal"]
        }],
        "selector-type-no-unknown": true,

        // Media
        "media-feature-name-no-unknown": true,

        // At-rule
        "at-rule-no-unknown": [true, {
            "ignoreAtRules": ["content", "elif", "else", "each", "extend", "for", "function", "if", "include", "mixin"]
        }],

        // Comment
        "comment-no-empty": true,

        // General / Sheet
        "no-descending-specificity": null,
        "no-duplicate-selectors": null,
        "no-empty-source": true,
        "no-extra-semicolons": true,
        "no-invalid-double-slash-comments": null,
        "no-unknown-animations": true,

        //---- Limit language features ----//

        // Color
        "color-named": null,
        "color-no-hex": null,

        // Function
        "function-blacklist": null,
        "function-url-no-scheme-relative": null,
        "function-url-scheme-blacklist": null,
        "function-url-scheme-whitelist": null,
        "function-whitelist": null,

        // Number
        "number-max-precision": null,

        // Time
        "time-min-milliseconds": null,

        // Unit
        "unit-blacklist": null,
        "unit-whitelist": null,

        // Value
        "value-no-vendor-prefix": null,

        // Custom property
        "custom-property-pattern": null,

        // Property
        "property-blacklist": null,
        "property-no-vendor-prefix": null,
        "property-whitelist": null,

        // Declaration
        "declaration-no-important": true,
        "declaration-property-unit-blacklist": null,
        "declaration-property-unit-whitelist": null,
        "declaration-property-value-blacklist": null,
        "declaration-property-value-whitelist": null,

        // Declaration block
        "declaration-block-single-line-max-declarations": 1,

        // Selector
        "selector-attribute-operator-blacklist": null,
        "selector-attribute-operator-whitelist": null,
        "selector-class-pattern": null,
        "selector-id-pattern": null,
        "selector-max-attribute": null,
        "selector-max-class": null,
        "selector-max-combinators": null,
        "selector-max-compound-selectors": null,
        "selector-max-empty-lines": 0,
        "selector-max-id": null,
        "selector-max-specificity": null,
        "selector-max-type": null,
        "selector-max-type": null,
        "selector-max-universal": null,
        "selector-nested-pattern": null,
        "selector-no-qualifying-type": null,
        "selector-no-vendor-prefix": null,
        "selector-pseudo-class-whitelist": null,
        "selector-pseudo-class-blacklist": null,

        // Media feature
        "media-feature-name-blacklist": null,
        "media-feature-name-no-vendor-prefix": null,
        "media-feature-name-whitelist": null,

        // Custom media
        "custom-media-pattern": null,

        // At-rule
        "at-rule-blacklist": null,
        "at-rule-no-vendor-prefix": null,
        "at-rule-whitelist": null,

        // Comment
        "comment-word-blacklist": null,

        // General / Sheet
        "max-nesting-depth": [4, {
            "ignore": ["blockless-at-rules"]
        }],

        //---- Stylistic issues ----//

        // Color
        "color-hex-case": "lower",
        "color-hex-length": "short",

        // Font family
        "font-family-name-quotes": "always-unless-keyword",

        // Font weight
        "font-weight-notation": null,

        // Function
        "function-comma-newline-after": null,
        "function-comma-newline-before": null,
        "function-comma-space-after": "always-single-line",
        "function-comma-space-before": null,
        "function-max-empty-lines": null,
        "function-name-case": "lower",
        "function-parentheses-newline-inside": null,
        "function-parentheses-space-inside": "never-single-line",
        "function-url-quotes": null,
        "function-whitespace-after": "always",

        // Numbers
        "number-leading-zero": null,
        "number-no-trailing-zeros": true,

        // String
        "string-quotes": null,

        // Length
        "length-zero-no-unit": true,

        // Unit
        "unit-case": "lower",

        // Value
        "value-keyword-case": "lower",

        // Value list
        "value-list-comma-newline-after": null,
        "value-list-comma-newline-before": null,
        "value-list-comma-space-after": "always-single-line",
        "value-list-comma-space-before": null,
        "value-list-max-empty-lines": null,

        // Property
        "property-case": "lower",

        // Declaration
        "declaration-bang-space-after": null,
        "declaration-bang-space-before": "always",
        "declaration-colon-newline-after": null,
        "declaration-colon-space-after": "always",
        "declaration-colon-space-before": "never",
        "declaration-empty-line-before": null,

        // Declaration block
        "declaration-block-semicolon-newline-after": "always-multi-line",
        "declaration-block-semicolon-newline-before": "never-multi-line",
        "declaration-block-semicolon-space-after": "always-single-line",
        "declaration-block-semicolon-space-before": "never",
        "declaration-block-trailing-semicolon": "always",

        // Block
        "block-closing-brace-empty-line-before": "never",
        "block-closing-brace-newline-after": ["always", {
            "ignoreAtRules": ["if", "else"]
        }],
        "block-closing-brace-newline-before": "always-multi-line",
        "block-closing-brace-space-after": null,
        "block-closing-brace-space-before": "always-single-line",
        "block-opening-brace-newline-after": "always-multi-line",
        "block-opening-brace-newline-before": null,
        "block-opening-brace-space-after": "always-single-line",
        "block-opening-brace-space-before": "always",

        // Selector
        "selector-attribute-brackets-space-inside": "never",
        "selector-attribute-operator-space-after": "never",
        "selector-attribute-operator-space-before": "never",
        "selector-attribute-quotes": "always",
        "selector-combinator-space-after": "always",
        "selector-combinator-space-before": "always",
        "selector-descendant-combinator-no-non-space": true,
        "selector-pseudo-class-case": "lower",
        "selector-pseudo-class-parentheses-space-inside": "never",
        "selector-pseudo-element-case": "lower",
        "selector-pseudo-element-colon-notation": null,
        "selector-type-case": "lower",

        // Selector list
        "selector-list-comma-newline-after": "always-multi-line",
        "selector-list-comma-newline-before": "never-multi-line",
        "selector-list-comma-space-after": "always-single-line",
        "selector-list-comma-space-before": "never",

        // Rule
        "rule-empty-line-before": null,

        // Media feature
        "media-feature-colon-space-after": "always",
        "media-feature-colon-space-before": "never",
        "media-feature-name-case": "lower",
        "media-feature-parentheses-space-inside": "never",
        "media-feature-range-operator-space-after": "always",
        "media-feature-range-operator-space-before": "always",

        // Media query list
        "media-query-list-comma-newline-after": null,
        "media-query-list-comma-newline-before": null,
        "media-query-list-comma-space-after": "always-single-line",
        "media-query-list-comma-space-before": null,

        // At-rule
        "at-rule-empty-line-before": ["always", {
            "ignore": ["after-comment", "inside-block", "blockless-after-blockless"],
            "ignoreAtRules": ["for"]
        }],
        "at-rule-name-case": "lower",
        "at-rule-name-newline-after": null,
        "at-rule-name-space-after": "always",
        "at-rule-semicolon-newline-after": null,
        "at-rule-semicolon-space-before": "never",

        // Comment
        "comment-empty-line-before": null,
        "comment-whitespace-inside": null,

        // General / Sheet
        "indentation": null,
        "max-empty-lines": 4,
        "max-line-length": 120,
        "no-eol-whitespace": true,
        "no-missing-end-of-source-newline": null
    }
};