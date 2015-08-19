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




    /**---- Dropdownify ----**\
     *  Create custom visuals for a <select> element.
     */
    _homebrew.Dropdown = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    $.extend(_homebrew.Dropdown.prototype, {
        name: 'dropdownify',


        /*--- Arguments ----*/


        /* See MARKUPS - PRE-EXISTING FIRST, DYNAMIC LATER. */
        markups: {
            holder : '<div class="dropdownify"></div>',
            button : '<div class="dropdownify__btn"></div>',
            label : '<span class="dropdownify__label"></span>',
            arrow : '<i class="dropdownify__arrow"></i>'
        },


        /*--- Methods ----*/


        init: function(el, args) {
            var instance = this;

            $.extend(instance, {
                $el: $(el),
                uniqueId: _homebrew.generateUniqueId(),
                destroyables: []
            });

            instance
                .update(args)
                .enable();

            $.data(el, instance.name, instance);
            $.data(instance.$holder[0], instance.name, instance);

            return instance;
        },

        update: function(args) {
            args = args || {};

            var instance = this;

            $.extend(true, instance, args);

            return instance.initMarkups();
        },

        initMarkups: function() {
            var instance = this,
                $holder = instance.$holder,
                $button = instance.$button,
                $label = instance.$label,
                $arrow = instance.$arrow;

            if(!_homebrew.jQueryObjectExists($holder)) {
                $holder = instance.$el.parent(_homebrew.getSelectorsFrom(instance.markups.holder).class.join(''));

                if(!$holder.length) {
                    $holder = $(instance.markups.holder).insertBefore(instance.$el).append(instance.$el);
                    instance.destroyables['$holder'] = $holder;
                }

                instance.$holder = $holder;
            } else {
                $.each(
                    _homebrew.getAttributesFrom(instance.markups.holder),
                    function(key, value) {
                        $holder.attr(key, value);
                    }
                );
            }

            if(!_homebrew.jQueryObjectExists($button)) {
                $button = $holder.find(_homebrew.getSelectorsFrom(instance.markups.button).class.join(''));

                if(!$button.length) {
                    $button = $(instance.markups.button).appendTo($holder);
                    instance.destroyables['$button'] = $button;
                }

                instance.$button = $button;
            } else {
                $.each(
                    _homebrew.getAttributesFrom(instance.markups.button),
                    function(key, value) {
                        $button.attr(key, value);
                    }
                );
            }

            if(!_homebrew.jQueryObjectExists($label)) {
                $label = $button.find(_homebrew.getSelectorsFrom(instance.markups.label).class.join(''));

                if(!$label.length) {
                    $label = $(instance.markups.label).appendTo($button);
                    instance.destroyables['$label'] = $label;
                }

                instance.$label = $label;
            } else {
                $.each(
                    _homebrew.getAttributesFrom(instance.markups.label),
                    function(key, value) {
                        $label.attr(key, value);
                    }
                );
            }

            if(!_homebrew.jQueryObjectExists($arrow)) {
                $arrow = $button.find(_homebrew.getSelectorsFrom(instance.markups.arrow).class.join(''));

                if(!$arrow.length) {
                    $arrow = $(instance.markups.arrow).appendTo($button);
                    instance.destroyables['$arrow'] = $arrow;
                }

                instance.$arrow = $arrow;
            } else {
                $.each(
                    _homebrew.getAttributesFrom(instance.markups.arrow),
                    function(key, value) {
                        $arrow.attr(key, value);
                    }
                );
            }

            return instance;
        },

        enable: function() {
            var instance = this;

            instance
                .disable()
                .$el
                    .on('change.' + instance.name, function() {
                        instance.refresh();
                    });

            return instance.refresh();
        },

        disable: function() {
            this.$el.off('change.' + this.name);
            return this;
        },

        refresh: function() {
            var instance = this;

            instance.$label.text(
                instance
                    .$el
                        .find('option')
                            .eq(instance.$el[0].selectedIndex)
                                .text()
            );

            return instance;
        },

        destroy: function() {
            var instance = this;

            instance.disable();

            $.removeData(instance.$holder[0], instance.name);

            while(instance.destroyables.length) {
                switch(instance.destroyables[0]) {
                    case '$holder':
                        instance.$el.insertAfter(instance.$holder);
                        instance[instance.destroyables.shift()].remove();
                    break;

                    default:
                        instance[instance.destroyables.shift()].remove();
                    break;
                }
            }

            $.removeData(instance.$el[0], instance.name);
        }
    });

    _homebrew.makePlugin(_homebrew.Dropdown);




    /**---- Height Syncer ----**\
     *  Sync the height of a collection of items.
     *
     *  NOTE: Be careful when dealing with float elements. If your floats are
     *  not cleared properly, the plugin will not be able to correctly sync
     *  the elements.
     */
    _homebrew.HeightSyncer = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    $.extend(_homebrew.HeightSyncer.prototype, {
        name: 'heightSyncify',


        /*---- Arguments ----*/

        /*
         * Pass in an array containing the items that you want to sync. The
         * plugin will loop through the array and then sync the items in the
         * sequence provided. This means the order of the array determines
         * what elements have their height sync'ed first.
         *
         * You can pass in anything that can be targeted using jQuery, meaning
         * selector strings, Node objects and even jQuery objects will work.
         * During selection, the plugin will scope down to the children
         * of the element that this plugin is initialised on.
         */
        items: [],


        /*---- Methods ----*/


        init: function(el, args) {
            var instance = this;

            $.extend(instance, {
                $el: $(el),
                uniqueId: _homebrew.generateUniqueId(),
                items: []
            });

            instance.update(args)
                    .enable();

            $.data(el, instance.name, instance);

            return instance;
        },

        update: function(args) {
            args = args || {};

            var instance = this,
                i;

            $.extend(instance, args, {
                $items: args.items.map(function(arrVal) {
                    return instance.$el.find(arrVal);
                }).filter(function(arrVal) {
                    return _homebrew.jQueryObjectExists(arrVal);
                })
            });

            for(i = instance.$items.length-1; i > -1; i--) {
                instance.$items[i].find('img').each(function() {
                    if(this.complete) return;

                    $(this).one('load', function() {
                        clearTimeout(instance.timer);

                        instance.timer = setTimeout(function() {
                            instance.sync();
                        }, 100);
                    });
                });
            }

            instance.sync();

            return instance;
        },

        enable: function() {
            var instance = this;

            instance.disable();

            $(window).on('resize.' + instance.uniqueId, _homebrew.throttle(function() {
                instance.sync();
            }, 50));

            return instance;
        },

        disable: function() {
            $(window).off('resize.' + this.uniqueId);
            return this;
        },

        sync : function() {
            var instance = this,
                $row,
                leftOffset,
                currentLeftThreshold,
                totalItems;

            for(var i = 0, ii = instance.$items.length; i < ii; i++) {
                $row = $();
                totalItems = instance.$items[i].length;
                currentLeftThreshold = -9999;

                instance.$items[i].each(function(index) {
                    var $thisItem = $(this);

                    if(!$thisItem.is(':visible')) {
                        return;
                    }

                    leftOffset = $thisItem.offset().left;

                    if(leftOffset > currentLeftThreshold) {
                        $row = $row.add($thisItem);
                    } else {
                        instance.syncItems($row);
                        $row = $thisItem;
                    }

                    if(index >= totalItems-1) {
                        instance.syncItems($row);
                    } else {
                        currentLeftThreshold = leftOffset;
                    }
                });
            }

            return instance;
        },

        syncItems: function($targetItems) {
            $targetItems.height('');

            if($targetItems.length <= 1) {
                return this;
            }

            var tallestHeight = 0;

            $targetItems.each(function() {
                tallestHeight = Math.max(tallestHeight, $(this).outerHeight());
            });

            $targetItems.outerHeight(tallestHeight);

            return this;
        },

        destroy: function() {
            var instance = this;

            while(instance.$items.length) {
                instance.$items.shift().height('');
            }

            instance.disable();
            $.removeData(instance.$el[0], instance.name);
        }
    });

    _homebrew.makePlugin(_homebrew.HeightSyncer);



    /**---- Popupify ----**\
     *  Instantiate the target element into a popup.
     *
     *  When the target element is instantiated as a popup, it is moved to a
     *  global popup container in order to maintain consistent z-index layering
     *  between all popups and the site contents. This can make a difference
     *  in how you style/select the popup elements.
     *
     *  This only instantiates the target element into a popup. You will
     *  need to instantiate the togglers separately, using a different method.
     */
    _homebrew.Popup = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    $.extend(_homebrew.Popup.prototype, {
        name: 'popupify',
        $allPopups: $(),


        /*--- Arguments ----*/


        /*
         * See MARKUPS - PRE-EXISTING FIRST, DYNAMIC LATER.
         *
         * The markups are as follows:
         *  (A) Main Popup Holder. This is the main wrapper that holds all the
         *      popups.
         *  (B) Individual Popup Holder. This is the wrapper that holds each
         *      individual popup content.
         *  (C) Popup Closers. This is the element that the plugin will
         *      dynamically prepend to the individual popup holder at (B).
         *      It is mainly a convenience method to dynamically add a close
         *      button to all popups through the plugin itself.
         */
        markups: {
            /* A */ holder: '<div class="popups-holder" id="popupsHolder" />',
            /* B */ popup: '<div class="popup" />',
            /* C */ closer: '<button type="button" class="popup-closer">×</button>'
        },

        classes: {
            active: _homebrew.classes.active,
            transition: _homebrew.classes.transition,
            transitionIn: _homebrew.classes.transitionIn,
            transitionOut: _homebrew.classes.transitionOut
        },


        /* Determines where the Main Popup Holder will be appended to if
         * the script needs to create one for its own use. */
        holderDest: 'body',

        /* Enable or disable transitions. */
        transitions: true,

        /* Specify whether or not to dynamically instantiate a popup closer */
        closer: true,

        /* Enable/disable closing of popup by clicking outside the content area. */
        closeOnOverlay: true,

        /* Callbacks */
        onOpen: undefined,
        onClose: undefined,


        /*--- Methods ----*/


        init: function(el, args) {
            var instance = this,
                proto = _homebrew.Popup.prototype,
                $holder = proto.$holder;

            $.extend(true, instance, args);

            /* Check to see if the main holder exists. If no, set it up. */

            if(!_homebrew.jQueryObjectExists($holder)) {
                var holderSelectorsObj = _homebrew.getSelectorsFrom(proto.markups.holder),
                    holderSelectors = '';

                if(holderSelectorsObj.id) {
                    holderSelectors += holderSelectorsObj.id;
                } else if(holderSelectorsObj.class.length) {
                    holderSelectors += holderSelectorsObj.classes.join('');
                }

                if(holderSelectors) {
                    $holder = $(holderSelectors);
                }

                if(!_homebrew.jQueryObjectExists($holder)) {
                    $holder = $(proto.markups.holder).appendTo(proto.holderDest);
                }

                proto.$holder = $holder;
            }

            /* Main holder established, proceed to init this popup */

            var $popup = $(instance.markups.popup).appendTo($holder),
                $el = $(el);

            $.extend(instance, {
                uniqueId: _homebrew.generateUniqueId(),
                $el: $el,
                $popup: $popup
            });

            instance.update(args);

            proto.$allPopups = proto.$allPopups.add($popup);

            $el.appendTo($popup)
               .addClass(instance.name);

           /* Init the popup closer if needed */

            if(instance.closer) {
                var $closer = $el.find(_homebrew.getSelectorsFrom(instance.markups.closer).class.join(''));

                if(!$closer.length) {
                    $closer = $(instance.markups.closer).prependTo($popup);
                }

                instance.$closer = $closer;

                $closer.popupTogglerify({
                    method: 'close',
                    $target: instance.$el
                });
            }

            $.data(el, instance.name, instance);
            $popup.data(instance.name, instance);
        },

        update: function(args) {
            args = args || {};

            var instance = this;

            $.extend(true, instance, args);

            if(!instance.isHolderActive()
            && !instance.closeOnOverlay) {
                var $holder = instance.getHolder();

                instance.getHolder()
                    .add(instance.$popup)
                        .off('click.' + instance.name);
            }

            if(typeof instance.onOpen === 'function') {
                if(typeof instance.onOpenId === 'number') {
                    instance.$popup.off('open.' + [instance.name, instance.onOpenId].join('.'));
                } else {
                    var onOpenId = _homebrew.generateUniqueId();

                    instance.$popup.on(
                        'open.' + [instance.name, instance.onOpenId].join('.'),
                        instance.onOpen
                    );

                    instance.onOpenId = onOpenId;
                }
            }

            if(typeof instance.onClose === 'function') {
                if(typeof instance.onCloseId === 'number') {
                    instance.$popup.off('close.' + [instance.name, instance.onCloseId].join('.'));
                } else {
                    var onCloseId = _homebrew.generateUniqueId();

                    instance.$popup.on(
                        'close.' + [instance.name, instance.onCloseId].join('.'),
                        instance.onClose
                    );

                    instance.onCloseId = onCloseId;
                }
            }

            return instance;
        },

        open: function(args) {
            args = (args) ? args : {};

            var instance = this,
                $allPopups = instance.getAllPopups(),
                $popup = instance.$popup,
                $holder = instance.getHolder(),
                activeClass = instance.classes.active;

            /* Show the corresponding popup */

            if(!$popup.hasClass(activeClass)) {
                $allPopups.filter('.' + activeClass).each(function() {
                    $(this)
                        .removeClass(activeClass)
                        .trigger('close.' + instance.name, [instance]);
                });

                $popup
                    .addClass(activeClass)
                    .trigger('open.' + instance.name, [instance]);
            }

            /* Toggle the event handler on the overlay if needed */

            $holder.off('click.' + instance.name);

            if(instance.closeOnOverlay) {
                $holder.on('click.' + instance.name, function(e) {
                    if($popup.has(e.target).length === 0
                    && !$popup.is(e.target)) {
                        instance.close();
                    }
                });
            }

            /* Show the holder */

            if(!instance.isHolderActive()) {
                instance.toggleHolder(true);
            }

            return instance;
        },

        close: function(args) {
            args = (args) ? args : {};

            var instance = this;

            if(instance.isHolderActive()) {
                instance.toggleHolder(false);
                instance.getHolder().off('click.' + instance.name);
                instance.$popup.trigger('close.' + instance.name, [instance]);
            }

            return instance;
        },

        toggleHolder: function(bool) {
            var instance = this;

            if(typeof bool === 'undefined') {
                bool = !instance.isHolderActive();
            }

            var $holder = instance.getHolder(),
                activeClass = instance.classes.active;

            if(instance.transitions) {
                var transitionEvent = _homebrew.events.transitionend,
                    transitionClass = instance.classes.transition,
                    transitionToClass = (bool)
                        ? instance.classes.transitionIn
                        : instance.classes.transitionOut;

                $holder
                    .on(transitionEvent, function() {
                        $holder
                            .off(transitionEvent)
                            .removeClass([
                                transitionClass,
                                transitionToClass
                            ].join(' '))
                            .toggleClass(activeClass, bool);

                        if(!bool) {
                            instance.getAllPopups().removeClass(instance.classes.active);
                        }
                    })
                    .addClass(transitionClass);

                setTimeout(function() {
                    $holder.addClass(transitionToClass);
                }, 25);
            } else {
                $holder.toggleClass(activeClass, bool);
            }

            $('body').css('overflow', (bool) ? 'hidden' : '');

            return instance;
        },

        getHolder: function() {
            return _homebrew.Popup.prototype.$holder;
        },

        getAllPopups: function() {
            return _homebrew.Popup.prototype.$allPopups;
        },

        isHolderActive: function() {
            var proto = _homebrew.Popup.prototype;

            return proto.$holder.hasClass(
                proto.classes.active
            );
        }
    });

    _homebrew.makePlugin(_homebrew.Popup);




    /**---- Popup Toggler ----**\
     *  Instantiate the target element into a popup toggler.
     */
    _homebrew.PopupToggler = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    $.extend(_homebrew.PopupToggler.prototype, {
        name: 'popupTogglerify',


        /*---- Arguments ----*/


        /* Specify whether to `open` or `close` the popup when this
         * toggle is executed. */
        method: 'open',

        /* Specify the target popup for this toggle. */
        $target: undefined,


        /*---- Methods ----*/


        init: function(el, args) {
            var instance = this;

            $.extend(instance, {
                $el: $(el)
            });

            instance.update(args);
        },

        update: function(args) {
            args = args || {};

            var instance = this;

            $.extend(instance, args);

            instance.deactivate();

            if(_homebrew.jQueryObjectExists(instance.$target)) {
                instance.activate();
            }

            return instance;
        },

        activate: function() {
            var instance = this;

            instance.$el.on('click.' + instance.name, function(e) {
                e.preventDefault();
                e.stopPropagation();
                instance.$target.popupify(instance.method);
            });

            return instance;
        },

        deactivate: function() {
            this.$el.off('click.' + this.name);
            return this;
        }
    });

    _homebrew.makePlugin(_homebrew.PopupToggler);




    /**---- Tooltipify ---**\
     *  Initialise a custom tooltip on the element.
     *
     *  The plugin's behaviour is slightly different depending on how we set
     *  the contents for the tooltip. See the `src` argument below.
     *
     *  Tooltips are created on demand; only when we trigger event on the
     *  element does the plugin create the tooltip in the DOM.
     */
    _homebrew.Tooltip = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    $.extend(_homebrew.Tooltip.prototype, {
        name: 'tooltipify',


        /*---- Arguments ----*/


        markups: {
            tooltip : '<div class="tooltip" />',
            closer : '<a href="#/" class="tooltip__closer" />'
        },

        classes: {
            active: _homebrew.classes.active,
            transition: _homebrew.classes.transition,
            transitionIn: _homebrew.classes.transitionIn,
            transitionOut: _homebrew.classes.transitionOut
        },


        /* Determine where will the tooltip be appended to when it is
         * dynamically created. */
        appendDest: 'body',

        /*
         * The source to be used as the content for the tooltip. Can pass
         * in either a string or anything that jQuery can select.
         *
         * When a string is passed in, the plugin will first check if it's
         * an attribute on the element. If it is, it will use the value of
         * said attribute. Otherwise, it will assume that the string is a
         * selector to be used for jQuery.
         *
         * If we set the tooltip's contents to one of the attributes of the
         * element, the plugin will copy the contents for its own use and leave
         * the original attribute untouched. The exception to this is the `title`
         * attribute, which the plugin will remove whenever the mouse hovers over
         * the element. This is to prevent the browser's default tooltip from
         * being shown.
         *
         * If we set the tooltip's contents to an existing element on the DOM,
         * the plugin will clone the element and REMOVE the original from the
         * DOM.
         */
        src: 'title',

        /* Sets a delay before creating/hiding the tooltip. */
        hover: 400,

        /* Enable/disable transitions. */
        transitions: true,


        /*---- Methods ----*/


        init: function(el, args) {
            var instance = this;

            $.extend(instance, {
                $el: $(el).addClass(instance.name),
                uniqueId: _homebrew.generateUniqueId()
            });

            instance
                .update(args)
                .enable();

            instance.enable();

            $.data(el, instance.name, instance);
        },

        update: function(args) {
            args = args || {};

            var instance = this;

            $.extend(instance, args);

            instance.$appendDest = $(instance.appendDest).eq(0);

            if(!_homebrew.jQueryObjectExists(instance.$appendDest)) {
                instance.$appendDest = $('body');
            }

            if(instance.$el.attr(instance.src)) {
                instance.contents = instance.$el.attr(instance.src);
            } else if(_homebrew.jQueryObjectExists($(instance.src))) {
                instance.contents = $(instance.src).eq(0).remove();
            }

            return instance;
        },

        enable: function() {
            var instance = this,
                $el = instance.$el,
                namespace = '.' + instance.name;

            $el.on('click' + namespace, function(e) {
                e.preventDefault();
                clearTimeout(instance.timerId);
                instance.open();
            });

            $el.on('mouseenter' + namespace, function(e) {
                if(instance.src === 'title') {
                    $el.removeAttr('title');
                }

                clearTimeout(instance.timerId);

                instance.timerId = setTimeout(function() {
                    instance.open();
                }, instance.hover);
            });

            $el.on('mouseleave' + namespace, function(e) {
                if(instance.src === 'title') {
                    instance.$el.attr('title', instance.contents);
                }

                clearTimeout(instance.timerId);

                instance.timerId = setTimeout(function() {
                    instance.close();
                }, instance.hover);
            });

            return instance;
        },

        disable: function() {
            this.$el.off('.' + instance.name);
            return this;
        },

        open: function() {
            var instance = this;

            if(instance.$tooltip) {
                return;
            }

            var $el = instance.$el,
                $tooltip = $(instance.markups.tooltip).appendTo(instance.$appendDest).append(instance.contents),
                activeClass = instance.classes.active;

            instance.$tooltip = $tooltip;

            if($el.offset().left + $tooltip.outerWidth()*0.5 > $(window).width()) {
                $tooltip.css('right', '0px');
            } else {
                $tooltip.css('left', $el.offset().left + $el.outerWidth()*0.5 - $tooltip.outerWidth()*0.5 + 'px');
            }

            $tooltip.css('top', $el.offset().top - $tooltip.outerHeight() + 'px');

            if(instance.transitions) {
                var transitionend = _homebrew.events.transitionend,
                    transitionClass = instance.classes.transition,
                    namespace = '.' + instance.uniqueId;

                $tooltip
                    .off(transitionend)
                    .on(transitionend, function() {
                        $tooltip
                            .off(transitionend)
                            .removeClass([
                                transitionClass
                            ].join(' '));

                        $(document).on(
                            'click' + namespace + ' touchstart' + namespace,
                            function(e) {
                                if(!$tooltip.is(e.target)
                                && $tooltip.has(e.target).length === 0) {
                                    instance.close();
                                }
                            }
                        );
                    })
                    .on({
                        mouseenter: function() {
                            clearTimeout(instance.timerId);
                        },

                        mouseleave: function() {
                            clearTimeout(instance.timerId);

                            instance.timerId = setTimeout(function() {
                                instance.close();
                            }, instance.hover);
                        }
                    })
                    .addClass(transitionClass);

                setTimeout(function() {
                    $tooltip.addClass([
                        activeClass
                    ].join(' '));
                }, 10);
            } else {
                $tooltip.addClass(activeClass);
            }

            return instance;
        },

        close : function() {
            var instance = this,
                $tooltip = instance.$tooltip;

            if(!$tooltip) {
                return;
            }

            var activeClass = instance.classes.active;

            $(document).off('.' + instance.uniqueId);

            if(instance.transitions) {
                var transitionend = _homebrew.events.transitionend,
                    transitionClass = instance.classes.transition,
                    transitionOutClass = instance.classes.transitionOut;

                $tooltip
                    .off()
                    .on(transitionend, function() {
                        $tooltip
                            .off(transitionend)
                            .remove();

                        instance.$tooltip = undefined;
                    })
                    .addClass(transitionClass);

                setTimeout(function() {
                    $tooltip.addClass(transitionOutClass);
                }, 10);
            } else {
                $tooltip.removeClass(activeClass);
                instance.$tooltip = undefined;
            }

            return instance;
        },

        destroy : function() {
            var instance = this,
                el = instance.$el[0];

            instance.disable().close();

            if(instance.src === 'title') {
                instance.$el.attr('title', instance.contents);
            }

            $.removeData(el, instance.name);
        }
    });

    _homebrew.makePlugin(_homebrew.Tooltip);




    /**---- Validify ---**\
     *  Initialises validation on a container of form inputs.
     *
     *  There are no arguments that you can pass in... for now.
     *
     *  To customise the validation process, you'll need to set
     *  the data attribute on the input node, as follows:
     *
     *      <input data-validify="required: true; minlength: 6; pattern: ^601\d{8,9}$;"
     *             data-validify-response="#test"
     *             type="text" />
     *
     *  The data attributes to use are `data-validify` and 
     *  `data-validify-response`.
     *
     *  `data-validify` serves two purposes:
     *  (1) To include the node into the validation.
     *      If the input does not have this attribute at all, the plugin
     *      will NOT initialise it.
     *  (2) To set the validation criteria on the input node.
     *
     *  You can set any custom criteria, but for it to take effect, you
     *  need to add your own validators that will run when the keyword of the
     *  criteria is matched.
     *
     *  There are some basic criteria built-in to the function, which are
     *  as follows:
     *      - Text fields (<textarea>, input[type="text"], input[type="email"], input[type="password"], input[type="date"], input[type="number"], input[type="tel"])
     *          ` required: true;
     *          ` minlength: 10;
     *          ` pattern: alphanumerical;
     *          ` equal-to: #yourElement;
     *      - Checkboxes (input[type="checkbox"])
     *          ` required: true;
     *          ` minchecked: 3;
     *          ` maxchecked: 3;
     *      - Radios (input[type="radio"])
     *          ` required: true;
     *      - Dropdown (<select>)
     *          ` required: true;
     *
     *  List of default patterns available:
     *      alphanumerical : /^[a-zA-Z0-9]+$/g,
     *      email          : /^[^\s@]+@[^\s@]+\.[^\s@]+$/g,
     *      numbers        : /^\s*\d+\s*$/g,
     *      phone          : /^[\+\-0-9 ]*$/g
     *
     *  You can add your own regex pattern by adding it directly into the
     *  prototype, using the following line:
     *
     *      homebrew.Validify.addRegex(
     *          'your-key',
     *          /yourpattern/g
     *      );
     *
     *  `data-validify-response` is used to determine an element that should
     *  react depending on validity of the input node. The basic behaviour is that
     *  this element will receive the `is-valid` class if the input node is valid,
     *  and will receive 'is-invalid' together with 'is-invalid-{{CRITERIA}}'
     *  class if the input node is invalid, where {{CRITERIA}} will be the name
     *  of the criterion that has failed its validation, e.g. if the input has
     *  failed the `required` criteria, then this response element will receive
     *  `is-invalid-required` class.
     *
     *  For checkboxes and radio buttons, the validify properties are based on
     *  the first occurence of the attribute in the group. For example, given
     *  the following group of checkboxes:
     *
     *      <input name="checkboxGroup" type="checkbox" data-validify="required: true; minchecked: 3; maxchecked: 5;" />
     *      <input name="checkboxGroup" type="checkbox" data-validify="required: false;" data-validify-response="#foobar" />
     *      <input name="checkboxGroup" type="checkbox" data-validify="required: true; minchecked: 5; maxchecked: 10;" data-validify-response="#herpderp" />
     *
     *  The plugin will use the validify criteria of the first checkbox and the
     *  validify response of the second checkbox in the group, which are
     *  `data-validify="required: true; minchecked: 3; maxchecked: 5;"` and
     *  `data-validify-response="#foobar"` respectively.
     *
     *  Checkboxes and radio buttons are grouped based on their `name` attribute.
     *
     *  The `required` validation works a little differently for checkboxes
     *  and radio buttons; it basically checks whether or not there is at least 
     *  a single checked input in the group. If there is, then the entire group
     *  becomes valid.
     *
     *  In that regard, if you want to make all checkboxes in the group
     *  compulsory, you can either:
     *  (1) Use different names for each checkbox so that they're individually
     *      treated as separate groups,
     *      OR
     *  (2) Use the `minchecked: all` criterion.
     *
     *  Form methods:
     *  - init
     *      |-- $('form').validify();
     *      |-- Initialise the plugin. Once the plugin is initialised, you can
     *          pass in a string to trigger a specific method on it.
     *  - validate
     *      |-- $('form').validify('validate');
     *      |-- Run the validation function on all the input nodes of the form.
     *          Returns a truthy/falsey Boolean of the final validation result.
     *  - destroy
     *      |-- $('form').validify('destroy');
     *      |-- Destroys the plugin.
     *
     *  After running the plugin on the form, all relevant input nodes in the form
     *  will have their methods initialised and exposed for your use.
     *
     *  Input methods:
     *  - enable
     *      |-- $('input').validify('enable');
     *      |-- Validate the input whenever there's a change.
     *  - disable
     *      |-- $('input').validify('disable');
     *      |-- Stop the input from validating itself whenever there's a change.
     *  - validate
     *      |-- $('input').validify('validate');
     *      |-- Run the validation function on this input node. Returns a truthy/
     *          falsey Boolean of the final validation result.
     *  - reset
     *      |-- $('input').validify('reset');
     *      |-- Temporarily sets the input node's validation to a neutral state.
     *  - setCriteria
     *      |-- $('input').validify('setCriteria', { required : true });
     *      |-- Adjusts the criteria on the input node. There are two ways to
     *          pass in your argumets:
     *          (1) Pass in an Object with key-value pairs,
     *              OR
     *          (2) Pass in a pair of arguments, with the first one being the
     *              keyword while the second one being the value of the
     *              criterion, e.g.
     *              $('input').validify('setCriteria', 'required', true);
     *  - removeCriteria
     *      |-- $('input').validify('removeCriteria', 'required', 'pattern');
     *      |-- Removes the criteria from the input node. There are three ways to
     *          pass in your arguments:
     *          (1) Pass in an Array of keyword strings, e.g.
     *              $('input').validify('removeCriteria', ['required', 'pattern']);
     *              OR
     *          (2) Pass in any number of individual keyword strings, as shown in
     *              the default example above,
     *              OR
     *          (3) Pass in nothing, which will cause all criteria to be removed.
     */
    _homebrew.Validify__Input = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    $.extend(_homebrew.Validify__Input.prototype, {
        name : 'validify',
        delay : 250,
        errors : [],
        response : [],

        validators : [
            {
                key : 'required',
                func : function(criterionValue) {
                    return (this.$el.val() !== '');
                }
            }
        ],

        init : function(el, args, responseSelector) {
            args = args || {};

            var instance = this;

            instance.$el = $(el);
            instance.criteria = $.extend({}, instance.criteria, args);

            /* Pattern inference for the `type` attribute, but only if there
             * isn't already a specified pattern */
            if(!instance.criteria.pattern) {
                var type = this.$el.attr('type');

                switch(type) {
                    case 'number':
                    case 'email':
                    case 'tel':
                        instance.criteria.pattern = type;
                    break;
                }
            }
            instance.enable().attachResponse(responseSelector);
        },

        attachResponse : function(responseSelector) {
            var instance = this,
                $response = (responseSelector) ? $(responseSelector) : $(instance.$el.data('validify-response'));

            instance.response = [];

            if(!$response.length) {
                $response = $({});
            }

            $response.each(function() {
                var responseInstance = $.data(this, instance.name);

                if(responseInstance) {
                    responseInstance.update({ inputs : instance });
                } else {
                    responseInstance = new _homebrew.Validify__Response($response, { inputs : instance });
                    $.data($response[0], instance.name, responseInstance);
                }

                instance.response.push(responseInstance);
            });

            return instance;
        },

        disable : function() {
            this.$el.off('.' + this.name);
            return this;
        },

        validate : function(args) {
            args = args || {};
            var instance = this;

            instance.validity = true;
            instance.errors = [];

            var validity;

            for(var i = 0, ii = instance.validators.length; i < ii; i++) {
                if(typeof instance.validators[i] === 'function') {
                    validity = instance.validators[i].call(instance);

                    if(instance.validity !== false) {
                        instance.validity = validity;    
                    }
                } else if(instance.criteria[instance.validators[i].key]) {
                    validity = instance.validators[i].func.call(instance, instance.criteria[instance.validators[i].key]);

                    if(validity === false) {
                        instance.errors.push(instance.validators[i].key);
                    }

                    if(instance.validity !== false) {
                        instance.validity = validity;    
                    }
                }
            }

            if(args.noEvent !== true) {
                instance.$el.trigger('validate', [instance]);
            }

            return instance.validity;
        },

        reset : function() {
            var instance = this;

            instance.validate({ noEvent: true });
            clearTimeout(instance.timer);
            instance.validity = 'neutral';
            instance.errors = [];
            instance.$el.trigger('validate', [instance]);

            return instance;
        },

        setValidity : function(bool) {
            var instance = this;

            instance.validity = bool;
            instance.errors = [];

            if(!bool) {
                var after = $.makeArray(arguments).slice(1);

                if(typeof after[0] === 'object' && after[0] instanceof Array) {
                    instance.errors = after[0];
                } else if(after.length) {
                    instance.errors.concat(after);
                }
            }

            instance.$el.trigger('validate', [instance]);

            return instance;
        },

        setCriteria : function() {
            var instance = this;
            if(!arguments.length) return instance;

            if($.isPlainObject(arguments[0])) {
                $.extend(instance.criteria, arguments[0]);
            } else if(arguments.length === 2) {
                instance.criteria[arguments[0]] = arguments[1];
            }

            return instance;
        },

        removeCriteria : function() {
            var instance = this;
            if(!arguments.length) return instance;

            if(arguments[0] instanceof Array) {
                while(arguments[0].length) {
                    delete instance.criteria[arguments[0].shift()];
                }
            } else if(arguments.length) {
                for(var i = arguments.length-1; i > -1; i--) {
                    delete instance.criteria[arguments[i]];
                }
            } else {
                instance.criteria = {};
            }

            return instance;
        },

        destroy : function() {
            var instance = this;

            instance.disable();

            while(instance.response.length) {
                instance.response.shift().destroy();
            }

            if(typeof instance.teardown === 'function') {
                instance.teardown();
            }

            instance.$el.each(function() {
                $.removeData(this, instance.name);
            });
        }
    });

    /*----*/

    _homebrew.Validify__TextField = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    _homebrew.Validify__TextField.prototype = new _homebrew.Validify__Input();

    $.extend(_homebrew.Validify__TextField.prototype, {
        validators: _homebrew.Validify__Input.prototype.validators.slice(0),

        regexes: {
            alphanumerical: /^[a-zA-Z0-9]+$/m,
            email:          /^[^\s@]+@[^\s@]+\.[^\s@]+$/m,
            number:         /^[\d.]+$/m,
            tel:            /^[\+\-0-9 ]*$/m
        },

        enable: function() {
            var instance = this;

            instance.$el.on([
                'input.', instance.name,
                ' blur.', instance.name
            ].join(''), function() {
                clearTimeout(instance.timer);

                instance.timer = setTimeout(function() {
                    instance.validate();
                }, instance.delay);
            });

            if(instance.criteria['equal-to']) {
                var $comparee = $(instance.criteria['equal-to']);

                if($comparee.length) {
                    $comparee.on('validate', function(e, compareeValidify) {
                        instance.validate();
                        console.log('asdas');
                    });
                }
            }

            return instance;
        }
    });

    _homebrew.Validify__TextField.prototype.validators.push(
        {
            key : 'minlength',
            func : function(criterionValue) {
                var minlength = parseInt(criterionValue, 10);
                if(isNaN(minlength)) return true;

                return this.$el.val().length >= minlength;
            }
        }, {
            key : 'pattern',
            func : function(criterionValue) {
                var regexer = this.regexes[criterionValue];

                if(!regexer) {
                    regexer = new RegExp(criterionValue, 'm');
                }

                return regexer.test(this.$el.val());
            }
        }, {
            key : 'equal-to',
            func : function(criterionValue) {
                if(!criterionValue) return true;

                var $target = $(criterionValue);
                if(!$target.length) return true;

                if($target.data(this.name).validity !== true) {
                    return 'neutral';
                }

                return this.$el.val() === $target.val();
            }
        }
    );

    /*----*/

    _homebrew.Validify__Checkboxes = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    _homebrew.Validify__Checkboxes.prototype = new _homebrew.Validify__Input();

    $.extend(_homebrew.Validify__Checkboxes.prototype, {
        validators: [
            {
                key : 'required',
                func : function() {
                    return this.$el.is(':checked');
                }
            }, {
                key : 'minchecked',
                func : function(criterionValue) {
                    if(criterionValue.toLowerCase() === 'all') {
                        criterionValue = this.$el.length;
                    } else {
                        criterionValue = parseInt(criterionValue, 10);
                        if(isNaN(criterionValue)) return true;
                    }

                    return this.$el.filter(':checked').length >= criterionValue;
                }
            }, {
                key : 'maxchecked',
                func : function(criterionValue) {
                    criterionValue = parseInt(criterionValue, 10);
                    if(isNaN(criterionValue)) return true;

                    var checkedCount = this.$el.filter(':checked').length;

                    if(checkedCount >= criterionValue) {
                        this.$el
                            .not(':checked')
                                .prop('disabled', true)
                                .each(function() {
                                    if(!this.labels.length) return;
                                    $(this.labels).addClass(_homebrew.classes.disabled);
                                });
                    } else {
                        this.$el
                            .filter(':disabled')
                                .prop('disabled', false)
                                .each(function() {
                                    if(!this.labels.length) return;
                                    $(this.labels).removeClass(_homebrew.classes.disabled);
                                });
                    }

                    return this.$el.filter(':checked').length <= criterionValue;
                }
            }
        ],

        enable : function() {
            var instance = this;

            instance.$el.on('change.' + instance.name, function() {
                instance.validate();
            });

            return instance;
        }
    });

    /*----*/

    _homebrew.Validify__Radios = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    _homebrew.Validify__Radios.prototype = new _homebrew.Validify__Input();

    $.extend(_homebrew.Validify__Radios.prototype, {
        validators: [
            {
                key : 'required',
                func : function() {
                    return this.$el.is(':checked');
                }
            }
        ],

        enable : function() {
            var instance = this;

            instance.$el.on('change.' + instance.name, function() {
                instance.validate();
            });

            return instance;
        }
    });

    /*----*/

    _homebrew.Validify__Dropdown = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    _homebrew.Validify__Dropdown.prototype = new _homebrew.Validify__Input();

    $.extend(_homebrew.Validify__Dropdown.prototype, {
        enable : function() {
            var instance = this;

            instance.$el.on('change.' + instance.name, function() {
                instance.validate();
            });

            return instance;
        }
    });

    /*----*/

    /*
     * The Response Construct is reponsible for adding the `is-valid` and
     * `is-invalid` classes on the input element. If the input element has
     * its `data-validify-response` attribute specified, then this construct
     * will apply those classes onto the given element as well. On top of that,
     * the given element will also receive additional invalid classes, based
     * on the criteria that it has failed.
     */
    _homebrew.Validify__Response = function(el, args) {
        this.init(el, args);
    };

    $.extend(_homebrew.Validify__Response.prototype, {
        name : 'validify',

        multipleErrors : false,

        init : function(el, args) {
            var instance = this,
                $el = $(el);

            instance.$el = $el;
            instance.inputs = [];

            return instance.update(args);
        },

        update : function(args) {
            args = args || {};
            var instance = this;

            if(args.inputs) {
                if(args.inputs instanceof Array) {
                    instance.inputs.concat(args.inputs);
                } else if(typeof args.inputs === 'object') {
                    instance.inputs.push(args.inputs);
                }

                instance.enable(args.inputs);
            }

            return instance.filterDuplicateInputs();
        },

        filterDuplicateInputs : function() {
            var instance = this,
                i, ii, j, jj;

            for(i = instance.inputs.length-1; i > -1; i--) {
                for(j = instance.inputs.length-1; j > -1; j--) {
                    if(i === j) continue;

                    if(instance.inputs[i] === instance.inputs[j]) {
                        instance.inputs.splice(i, 1);
                        break;
                    }
                }
            }

            return instance;
        },

        enable : function(targets) {
            var instance = this;
            targets = targets || instance.inputs;

            if(targets instanceof Array) {
                for(var i = targets.length-1; i > -1; i--) {
                    targets[i].$el.on('validate.Validify__Response', function(e, inputInstance) {
                        instance.refresh(inputInstance);
                    });
                }
            } else if(typeof targets === 'object') {
                targets.$el.on('validate.Validify__Response', function(e, inputInstance) {
                    instance.refresh(inputInstance);
                });
            }

            return instance;
        },

        disable : function(targets) {
            var instance = this;
            targets = targets || instance.inputs;

            if(targets instanceof Array) {
                for(i = instance.inputs.length-1; i > -1; i--) {
                    instance.inputs[i].$el.off('.Validify__Response');
                }
            } else if(typeof targets === 'object') {
                targets.$el.off('.Validify__Response');
            }

            return instance;
        },

        refresh : function(inputInstance) {
            var instance = this,
                theInputs = instance.inputs.slice(0),
                allValid = true,
                errors = [],
                errorClasses = [],
                i, ii;

            if(inputInstance) {
                inputInstance.$el
                    .toggleClass('is-valid', inputInstance.validity === true)
                    .toggleClass('is-invalid', inputInstance.validity === false);

                if(inputInstance.validity !== true) {
                    allValid = false;
                    errors = errors.concat(inputInstance.errors);
                }

                theInputs.splice(
                    theInputs.indexOf(inputInstance),
                    1
                );
            }

            for(i = 0, ii = theInputs.length; i < ii; i++) {
                theInputs[i].$el
                    .toggleClass('is-valid', theInputs[i].validity === true)
                    .toggleClass('is-invalid', theInputs[i].validity === false);

                if(theInputs[i].validity !== true) {
                    allValid = false;
                    errors = errors.concat(theInputs[i].errors);
                }
            }

            if(errors.length) {
                if(instance.multipleErrors) {
                    for(var i = errors.length-1; i > -1; i--) {
                        errorClasses.push('is-invalid-' + errors[i]);
                    }
                } else {
                    errorClasses[0] = 'is-invalid-' + errors[0];
                }
            }

            instance
                .clearFailedClasses()
                .$el
                    .toggleClass('is-valid', allValid)
                    .toggleClass('is-invalid', !allValid)
                    .addClass(errorClasses.join(' '));

            return instance;
        },

        clearFailedClasses : function() {
            var instance = this,
                elClasses = instance.$el.attr('class') || '';

            if(elClasses) {
                elClasses = elClasses.split(' ').filter(function(c) {
                    return c.lastIndexOf('is-invalid', 0) !== 0 && c !== '';
                });
            } else {
                elClasses = [];
            }

            instance.$el.attr('class', elClasses.join(' '));

            return instance;
        },

        destroy : function() {
            var instance = this;

            instance.disable().clearFailedClasses();
            $.removeData(this.$el[0], this.name);
        }
    });

    /*----*/

    _homebrew.Validify = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    $.extend(_homebrew.Validify.prototype, {
        name : 'validify',

        selectors : {
            all: '[data-validify]',
            textFields: [
                'input[type="text"]',
                'input[type="email"]',
                'input[type="password"]',
                'input[type="date"]',
                'input[type="number"]',
                'input[type="tel"]',
                'textarea'
            ].join(', '),
            checkboxes: 'input[type="checkbox"]',
            radios: 'input[type="radio"]',
            dropdowns: 'select'
        },

        constructors: {
            textFields: _homebrew.Validify__TextField,
            checkboxes: _homebrew.Validify__Checkboxes,
            radios: _homebrew.Validify__Radios,
            dropdowns: _homebrew.Validify__Dropdown
        },

        init : function(el, args) {
            args = args || {};

            var instance = this,
                $el = $(el),
                $inputs = {
                    all : $el.find(instance.selectors.all)
                },
                inputs = [];

            instance.$el = $el;

            $.extend($inputs, {
                textFields : $inputs.all.filter(instance.selectors.textFields),
                checkboxes : $inputs.all.filter(instance.selectors.checkboxes),
                radios : $inputs.all.filter(instance.selectors.radios),
                dropdowns : $inputs.all.filter(instance.selectors.dropdowns)
            });

            $.each($inputs, function(key, value) {
                if(!value.length) return;

                switch(key) {
                    case 'textFields' :
                    case 'dropdowns'  :
                        value.each(function() {
                            var inlineData = homebrew.getKeyValuePairsFrom($(this).attr('data-' + instance.name));
                            inputs.push(new instance.constructors[key](this, inlineData));
                            $.data(this, instance.name, inputs[inputs.length-1]);
                        });
                    break;

                    case 'checkboxes' :
                    case 'radios'     :
                        processGroup(value, instance.constructors[key]);
                    break;
                }
            });

            instance.inputs = inputs;

            $.data(this.$el[0], instance.name, this);

            if($(el).is('form')) {
                $(el).on('reset', function() {
                    setTimeout(function() {
                        instance.reset();
                    }, 25);
                });
            }

            function processGroup($els, constructor) {
                var group = [],
                    i;

                $els.each(function() {
                    if(!this.name) {
                        group.push($(this));
                        return;
                    }

                    if(group.length) {
                        for(i = group.length-1; i > -1; i--) {
                            if(typeof group[i] === 'string' && this.name === group[i]) {
                                return;
                            }
                        }
                    }

                    group.push(this.name);
                });

                var inlineData, inputResponse;

                for(i = group.length-1; i > -1; i--) {
                    inlineData = inputResponse = undefined;

                    if(typeof group[i] === 'string') {
                        group[i] = $els.filter('[name="' + group[i] + '"]');
                    }

                    group[i].each(function() {
                        if(!inlineData && $(this).attr('data-' + instance.name)) {
                            inlineData = homebrew.getKeyValuePairsFrom($(this).attr('data-' + instance.name));
                        }

                        if(!inputResponse && $(this).attr('data-' + instance.name + '-response')) {
                            inputResponse = $(this).data(instance.name + '-response');
                        }

                        if(inlineData && inputResponse) return false;
                    });

                    inputs.push(new constructor(group[i], inlineData, inputResponse));

                    group[i].each(function() {
                        $.data(this, instance.name, inputs[inputs.length-1]);
                    });
                }
            }
        },

        validate : function() {
            var instance = this,
                i;

            instance.validity = true;

            for(i = instance.inputs.length-1; i > -1; i--) {
                instance.inputs[i].validate();
            }

            for(i = instance.inputs.length-1; i > -1; i--) {
                if(instance.inputs[i].validity !== true) {
                    instance.validity = false;
                    break;
                }
            }

            return instance.validity;
        },

        reset : function() {
            var instance = this,
                i;

            for(i = instance.inputs.length-1; i > -1; i--) {
                instance.inputs[i].reset();
            }

            return instance;
        },

        destroy : function() {
            var instance = this;

            while(instance.inputs.length) {
                instance.inputs.shift().destroy();
            }

            $.removeData(this.$el[0], this.name);
        }
    });

    $.extend(_homebrew.Validify, {
        addValidator : function(constructor) {
            var instance = this.prototype,
                args = $.makeArray(arguments),
                after = args.slice(1);

            if(typeof constructor !== 'string') {
                console.error('homebrew.Validify.addValidator(): Expecting a String as the first argument.');
                console.error('First argument provided:');
                console.log(constructor);
                return instance;
            }

            if(!instance.constructors[constructor]) {
                console.error('homebrew.Validify.addValidator(): Cannot find "' + constructor + '" from collection of constructors.');

                var constuctorsStrArray = [];

                $.each(instance.constructors, function(key, value) {
                    constuctorsStrArray.push(key);
                });

                console.info([
                    'List of constructors as follows: ',
                    constuctorsStrArray.join(', ')
                ].join(''));

                return instance;
            }

            if(after.length === 1 && after[0] instanceof Array) {
                after = after[0];
            }

            if(after.length) {
                var validators = instance.constructors[constructor].prototype.validators,
                    i, ii, j;

                checkA:
                for(i = 0, ii = after.length; i < ii; i++) {
                    if(typeof after[i] !== 'object'
                    && typeof after[i] !== 'function') {
                        console.error('homebrew.Validify.addValidator(): Expecting an Object or a Function as the validator.');
                        console.error('Validator provided:');
                        console.log(after[i]);
                        continue;
                    }

                    if(typeof after[i] === 'object') {
                        for(j = validators.length-1; j > -1; j--) {
                            if(validators[j].key === after[i].key) {
                                validators[j] = after[i];
                                continue checkA;
                            }
                        }
                    }

                    validators.push(after[i]);
                }
            } else {
                console.error('homebrew.Validify.addValidator(): Missing second argument, which is the validator object/function.');
                return instance;
            }

            return instance;
        },

        addRegex : function(regexKey, regexer) {
            var __proto = this.prototype.constructors.textFields.prototype,
                regexes = __proto.regexes;

            if(typeof regexKey !== 'string') {
                console.error('homebrew.Validify.addRegex(): First argument must be a string.');
            } else if(typeof regexer === 'undefined') {
                console.error('homebrew.Validify.addRegex(): Missing second argument, which is the regex pattern.');
            }

            if(typeof regexer === 'string') {
                regexer = new RegExp(regexer, 'm');
            } else if(typeof regexer === 'object'
                   && !regexer instanceof RegExp) {
                console.error('homebrew.Validify.addRegex(): Second argument is not a RegExp object.');
            }

            regexes[regexKey] = regexer;
        }
    });

    _homebrew.makePlugin(_homebrew.Validify);
})(jQuery, this, this.document);