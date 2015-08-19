var homebrew = {};

(function($, window, document) {
    /* Setup homebrew object */
    var _homebrew = homebrew;

    $.extend(_homebrew, {
        events : {
            transitionend: 'oTransitionEnd otransitionend webkitTransitionEnd transitionend'
        },

        classes : {
            hidden:           'is-hidden',
            active:           'is-active',
            disabled:         'is-disabled',
            transition:       'can-transition',
            transitionIn:     'is-transitioning-in',
            transitionOut:    'is-transitioning-out'
        }
    });




    /*
     *  Homebrew Utility Functions
     *      - makePlugin
     *      - makeGroupPlugin
     *      - generateUniqueId
     *      - getAttributesFrom
     *      - getSelectorsFrom
     *      - getKeyValuePairsFrom
     *      - jQueryObjectExists
     *      - throttle
     *      - debounce
     */
    $.extend(_homebrew, {
        makePlugin : function(plugin) {
            var pluginName = plugin.prototype.name;

            $.fn[pluginName] = function(options) {
                var args = $.makeArray(arguments),
                    after = args.slice(1);

                return this.each(function() {
                    var instance = $.data(this, pluginName);

                    if(instance) {
                        if(typeof options === 'string') {
                            instance[options].apply(instance, after);
                        } else if(instance.update) {
                            instance.update.apply(instance, args);
                        }
                    } else {
                        new plugin(this, options);
                    }
                });
            };
        },

        makeGroupPlugin : function(plugin) {
            var pluginName = plugin.prototype.name;

            $.fn[pluginName] = function(options) {
                var args = $.makeArray(arguments),
                    after = args.slice(1),
                    $group = this;

                args.unshift($group, 0);

                return $group.each(function(groupIndex) {
                    var instance = $.data(this, pluginName);

                    if(instance) {
                        if(typeof options === 'string') {
                            instance[options].apply(instance, after);
                        } else if(instance.update) {
                            args[1] = groupIndex;
                            instance.update.apply(instance, args);
                        }
                    } else {
                        new plugin($group, groupIndex, options);
                    }
                });
            };
        },

        generateUniqueId: function() {
            return Math.round(new Date().getTime() + Math.random()*1000000, 10);
        },

        getAttributesFrom: function(src, args) {
            args = args || {};

            if(typeof src === 'undefined') {
                console.error('homebrew.getAttributesFrom(): First argument `src` is mandatory.');
                return false;
            }

            if(typeof src !== 'string'
            && typeof src !== 'object'
            && src instanceof jQuery
            && src instanceof Node) {
                console.error('homebrew.getAttributesFrom(): First argument `src` should either be a string, a Node or a jQuery object.');
                return false;
            }

            var $el = $(src),
                el = $el[0],
                attrs = {};

            $.each(el.attributes, function() {
                if(this.specified) {
                    attrs[this.name] = this.value;

                    if(args.camelCase !== false) {
                        var splitHyphens = this.name.split('-');

                        if(splitHyphens.length > 1) {
                            for(var i = splitHyphens.length-1; i > 0; i--) {
                                splitHyphens[i] = splitHyphens[i].charAt(0).toUpperCase()
                                    + splitHyphens[i].slice(1);
                            }

                            attrs[splitHyphens.join('')] = this.value;
                        }
                    }
                }
            });

            return attrs;
        },

        getSelectorsFrom: function(src) {
            if(typeof src === 'undefined') {
                console.error('homebrew.getSelectorsFrom(): First argument `src` is mandatory.');
                return false;
            }

            if(typeof src !== 'string'
            && typeof src !== 'object'
            && src instanceof jQuery
            && src instanceof Node) {
                console.error('homebrew.getSelectorsFrom(): First argument `src` should either be a string, a Node or a jQuery object.');
                return false;
            }

            var $el = $(src),
                el = $el[0],
                attrs = this.getAttributesFrom(src, { camelCase: false }),
                selectors = {
                    class: [],
                    attributes: {}
                };

            $.each(attrs, function(key, value) {
                switch(key) {
                    case 'class':
                        selectors.class = value.split(' ').filter(function(arrayVal) {
                            return arrayVal;
                        });

                        selectors.class.forEach(function(arrVal, arrIndex, arr) {
                            arr[arrIndex] = '.' + arrVal;
                        });
                    break;

                    case 'id':
                        selectors.id = '#' + value;
                    break;

                    default:
                        selectors.attributes[key] = value;
                    break;
                }
            });

            selectors.tag = el.tagName.toLowerCase();

            return selectors;
        },

        getKeyValuePairsFrom : function(str, pairSeparator, keyValueSeparator) {
            if(typeof str !== 'string') {
                console.error('homebrew.getKeyValuePairsFrom(): Expecting a string as the first argument. Please check:');
                console.log(str);
                return {};
            }

            pairSeparator = pairSeparator || ';';
            keyValueSeparator = keyValueSeparator || ':';

            var splitArray = str.split(pairSeparator),
                keyValuePairs = {},
                currentPair;

            while(splitArray.length) {
                currentPair = splitArray.shift();
                if(!currentPair) continue;

                currentPair = currentPair.split(keyValueSeparator);
                keyValuePairs[$.trim(currentPair[0])] = $.trim(currentPair[1]);
            }

            return keyValuePairs;
        },

        jQueryObjectExists: function($obj) {
            return typeof $obj === 'object'
                && $obj instanceof jQuery
                && $obj.length;
        },

        /*
         * Executes a function a max of once every n milliseconds 
         * 
         * Arguments:
         *    Func (Function): Function to be throttled.
         *    Delay (Integer): Function execution threshold in milliseconds.
         * 
         * Returns:
         *    Lazy_function (Function): Function with throttling applied.
         */
        throttle : function(func, delay) {
            var timer = null;

            return function () {
                var context = this,
                    args = arguments;

                clearTimeout(timer);

                timer = setTimeout(function () {
                    func.apply(context, args);
                }, delay);
            };
        },
        /* End throttle */

        /*
         * Executes a function when it stops being invoked for n seconds
         * Modified version of _.debounce() http://underscorejs.org
         *
         * Arguments:
         *    Func (Function): Function to be debounced.
         *    Delay (Integer): Function execution threshold in milliseconds.
         *    Immediate (Bool): Whether the function should be called at the beginning 
         *    of the delay instead of the end. Default is false.
         *
         * Returns:
         *    Lazy_function (Function): Function with debouncing applied.
         */
        debounce : function(func, delay, immediate) {
            var timeout, result;

            return function() {
                var context = this,
                    args = arguments,
                    later = function() {
                      timeout = null;
                      if (!immediate) result = func.apply(context, args);
                    };

                var callNow = immediate && !timeout;

                clearTimeout(timeout);
                timeout = setTimeout(later, delay);
                if (callNow) result = func.apply(context, args);

                return result;
            };
        }
        /* End debounce */
    });




    /**---- Homebrew Plugins ----**\
     * Most functions should be built and structured the same way. Using the
     * carousels function as the main example, we can initialise the plugin
     * using its `name` property, which in this case is `carouselify`:
     *
     *      $('#carousel').carouselify();
     *
     * When running the above for the first time, it will run the `init`
     * method set in the plugin's prototype.
     *
     * Specifying arguments involves passing in an Object of properties:
     *
     *      $('#carousel').carouselify({
     *          transitions: false,
     *          timer: false
     *      });
     *
     * After initialising the plugin on the element, running the above again
     * will cause the plugin to update the instance's properties according to
     * the new Object. This allows us to adjust the plugin's behaviour even
     * after initialising it. Of course, the plugin itself must be coded to
     * handle such live updates.
     *
     * If it feels confusing to use the init method to update the properties,
     * we can explicitly specify the method name:
     *
     *      $('#carousel').carouselify('update', {
     *          transitions: true,
     *          timer: true
     *      });
     *
     * Similarly, we can use the above way to run any other methods available
     * on the plugin's prototype, with optional arguments too, depending on
     * how we code the method:
     *
     *      $('#carousel').carouselify('enable');
     *      $('#carousel').carouselify('switch', 'next');
     *
     * After initialising the plugin on the element, it is also possible to
     * access the plugin's instance using jQuery's data method.
     *
     *      $('#carousel').data('carouselify').enable();
     *      $('#carousel').data('carouselify').switch('next');
     *
     * That should be the low down on how to use any of the homebrew plugins.
     *
     * $$ MARKUPS - PRE-EXISTING FIRST, DYNAMIC LATER
     *
     * Plugins whose markups are linked to the above statement have the
     * following behaviour for its markup codes:
     *  (A) The plugin will infer the class/ID from it, and use it to select
     *      existing versions of the markup if available. This means it is
     *      possible to manually create these elements directly in the HTML,
     *      and the plugin will use those instead of dynamically creating
     *      its own.
     *  (B) Only when no pre-existing matching element is found, will the
     *      plugin dynamically create the required element using the supplied
     *      markup.
     */

    //@js-partial "homebrew/_homebrew.dropdown.js"

    //@js-partial "homebrew/_homebrew.height-sync.js"

    //@js-partial "homebrew/_homebrew.popup.js"

    //@js-partial "homebrew/_homebrew.tooltip.js"

    //@js-partial "homebrew/_homebrew.validation.js"
})(jQuery, this, this.document);