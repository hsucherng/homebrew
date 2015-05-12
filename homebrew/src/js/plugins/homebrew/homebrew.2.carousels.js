    /**---- Carouselify ----**\
     *  Turn an element containing items into a carousel.
     */
    _homebrew.Carousel = function(el, args) {
        if(!el) return;
        this.init(el, args);
    };

    $.extend(_homebrew.Carousel.prototype, {
        name: 'carouselify',


        /*--- Arguments ----*/


        /*
         * See MARKUPS - PRE-EXISTING FIRST, DYNAMIC LATER.
         *
         * Functions of switchers and pagers are explained further down.
         */
        markups: {
            switchers: {
                next: '<button type="button" class="carousel__switcher carousel__switcher--next"></button>',
                prev: '<button type="button" class="carousel__switcher carousel__switcher--prev"></button>'
            },
            pagers: {
                pager: '<a href="#/" class="carousel__pager"></a>',
                holder: '<div class="carousel__pagers"></div>'
            }
        },

        /*
         * (A) `active` is the class that's added to the current active item. 
         * (B) `disabled` is the class that's added to the switch buttons when
         *     the carousel isn't allowed to loop. When on the first item, the
         *     `Previous` button will receive this class, while on the last
         *     item, the `Next` button will receive this class.
         *
         * Transition classes are used to apply the necessary CSS transitions.
         *
         * (C) `transition` is the class used to enable transitions
         *     on the item. They are added when the carousel is about to
         *     switch items.
         * (D) `transitionIn` is the class used to make the item transition
         *     IN to being the current active item.
         * (E) `transitionOut` is the class used to make the item transition
         *     OUT of being the current active item.
         * (F) `reverse` is the class used to alternate the transition effects
         *     when the carousel is switching from CURRENT to PREVIOUS item
         *     instead.
         */
        classes: {
            /* A */ active: _homebrew.classes.active,
            /* B */ disabled: _homebrew.classes.disabled,
            /* C */ transition: _homebrew.classes.transition,
            /* D */ transitionIn: _homebrew.classes.transitionIn,
            /* E */ transitionOut: _homebrew.classes.transitionOut,
            /* F */ reverse: 'is-reverse'
        },

        /*
         * Provide the selector for the plugin to target the desired carousel
         * items. Selection will always be scoped within the element that
         * the plugin is initialised on.
         */
        items: '.carousel__item',

        /*
         * Specify an index to have a specific item be active upon
         * initialisation of the plugin.
         */
        activeItem: 0,

        /* Enable/disable use of CSS transitions. */
        transitions: true,

        /*
         * Enable/disable use of switch buttons. Switch buttons are elements
         * that will rotate the carousel to the next/previous item.
         */
        switchers: true,

        /*
         * Allow/prevent the carousel from looping back to the first item
         * from the last item, and vice versa.
         */
        loop: true,

        /*
         * Enable/disable use of page buttons. Page buttons are elements that
         * will rotate the carousel directly to a specific item, e.g. clicking
         * the 2nd page button will switch the carousel to its 2nd item.
         */
        pagers: true,

        /* Enable/disable use of timer. `false` to disable. */
        timer: {
            duration: 10000
        },

        /*
         * A callback function to run when the carousel switches items.
         * If transitions are enabled, then this callback runs BEFORE
         * the transition starts.
         *
         * We can also attach the callback to the element as a 'switch'
         * event handler, e.g. $('#carousel').on('switch').
         *
         * The function will receive two arguments: (A) the new active
         * item of the carousel, and (B) the previous active item of
         * the carousel.
         */
        onSwitch: undefined,


        /*--- Methods ----*/


        init: function(el, args) {
            var instance = this;

            $.extend(instance, {
                $el: $(el),
                uniqueId: _homebrew.generateUniqueId(),
                destroyables: []
            });

            instance.update(args);

            $.data(el, instance.name, instance);

            return instance;
        },

        update: function(args) {
            args = args || {};

            var instance = this;

            $.extend(true, instance, args);

            instance
                .initItems()
                .initSwitchers()
                .initPagers()
                .initTimer()
                .initCallback()
                .enable();

            return instance;
        },

        initItems: function() {
            var instance = this,
                activeClass = instance.classes.active;

            if(instance.$items) {
                instance.$items.removeClass(activeClass);
            }

            instance.$items = instance.$el.find(instance.items)
                .removeClass(activeClass)
                .eq(instance.activeItem)
                    .addClass(activeClass)
                    .end();

            instance.totalItems = instance.$items.length;

            return instance;
        },

        initSwitchers: function() {
            var instance = this;

            if(instance.switchers) {
                var $prevSwitcher = instance.$el.find(
                        _homebrew.getSelectorsFrom(instance.markups.switchers.prev).class.join('')
                    ),
                    $nextSwitcher = instance.$el.find(
                        _homebrew.getSelectorsFrom(instance.markups.switchers.next).class.join('')
                    );

                if(!$prevSwitcher.length) {
                    $prevSwitcher = $(instance.markups.switchers.prev).prependTo(instance.$el);
                    instance.destroyables.push('$prevSwitcher');
                }

                instance.$prevSwitcher = $prevSwitcher;

                if(!$nextSwitcher.length) {
                    $nextSwitcher = $(instance.markups.switchers.next).appendTo(instance.$el);
                    instance.destroyables.push('$nextSwitcher');
                }
            
                instance.$nextSwitcher = $nextSwitcher;

                instance.reflectSwitchersState();
            } else {
                instance.destroy(['$nextSwitcher', '$prevSwitcher']);
            }

            return instance;
        },

        reflectSwitchersState: function() {
            var instance = this;

            /*
             * Two situations where there's no need to check the state of
             * switches:
             *      A. If switchers are disabled,
             *      B. If carousel is loopable.
             */
            if(!instance.switchers
            || instance.loop) {
                return instance;
            }

            var disabledClass = instance.classes.disabled;
            instance.$prevSwitcher.toggleClass(disabledClass, (instance.activeItem < 1));
            instance.$nextSwitcher.toggleClass(disabledClass, (instance.activeItem >= instance.totalItems-1));

            return instance;
        },

        initPagers: function() {
            var instance = this;

            if(instance.pagers) {
                var $pagersHolder = instance.$el.find(
                        _homebrew.getSelectorsFrom(instance.markups.pagers.holder).class.join('')
                    ),
                    $pagers = instance.$el.find(
                        _homebrew.getSelectorsFrom(instance.markups.pagers.pager).class.join('')
                    );

                if(!$pagersHolder.length) {
                    $pagersHolder = $(instance.markups.pagers.holder).appendTo(instance.$el);
                    instance.destroyables.push('$pagersHolder');
                }

                instance.$pagersHolder = $pagersHolder;

                if(!$pagers.length) {
                    var finalPagersStr = [];

                    for(var i = instance.totalItems-1; i > -1; i--) {
                        finalPagersStr.push(instance.markups.pagers.pager);
                    }

                    $pagers = $(finalPagersStr.join('')).appendTo($pagersHolder);
                    instance.destroyables.push('$pagers');
                } else if($pagers.length !== instance.$items.length) {
                    console.error('homebrew.Carousels.initPagers(): Warning! Pre-existing pager elements found, but they are not equal to the number of items found.');
                }

                instance.$pagers = $pagers;

                $pagers
                    .removeClass(instance.classes.active)
                    .eq(instance.activeItem)
                        .addClass(instance.classes.active);
            } else {
                instance.destroy(['$pagers', '$pagersHolder']);
            }

            return instance;
        },

        initTimer: function() {
            var instance = this;

            if(!instance.timer) {
                if(typeof instance.timerId === 'number') {
                    clearTimeout(instance.timerId);
                    instance.timerId = undefined;
                }
            } else {
                /*
                 * If the timer is implicitively a truthy value but is not
                 * an Object, then revert it to the default settings object.
                 * $.extend is used so that what's saved is not a reference,
                 * but an actual copy of the prototype object.
                 */
                if(typeof instance.timer !== 'object') {
                    instance.timer = $.extend({}, _homebrew.Carousel.prototype.timer);
                }
            }

            return instance;
        },

        initCallback: function() {
            var instance = this;

            if(typeof instance.onSwitchId === 'number') {
                instance.$el.off(
                    ['switch', instance.name, instance.onSwitchId].join('.')
                );

                if(typeof instance.onSwitch === 'function') {
                    instance.onSwitchId = _homebrew.generateUniqueId();

                    instance.$el.on(
                        ['switch', instance.name, instance.onSwitchId].join('.'),
                        instance.onSwitch
                    );
                }
            } else if(typeof instance.onSwitch === 'function') {
                instance.onSwitchId = _homebrew.generateUniqueId();

                instance.$el.on(
                    ['switch', instance.name, instance.onSwitchId].join('.'),
                    instance.onSwitch
                );
            }

            return instance;
        },

        enable: function() {
            var instance = this,
                namespace = '.' + [
                    instance.name
                ].join('.');

            instance.disable();

            if(instance.switchers) {
                instance.$nextSwitcher.on('click' + namespace, function(e) {
                    e.preventDefault();

                    if($(this).hasClass(instance.classes.disabled)) {
                        return;
                    }

                    instance.switchTo('next');
                });

                instance.$prevSwitcher.on('click.' + namespace, function(e) {
                    e.preventDefault();

                    if($(this).hasClass(instance.classes.disabled)) {
                        return;
                    }

                    instance.switchTo('prev');
                });
            }

            if(instance.pagers) {
                instance.$pagers.each(function(index) {
                    $(this).on('click' + namespace, function(e) {
                        e.preventDefault();
                        instance.switchTo(index);
                    });
                });
            }

            if(instance.timer) {
                instance.runTimer();

                $(window)
                    .on('focus' + namespace, function() {
                        instance.runTimer();
                    })
                    .on('blur' + namespace, function() {
                        clearTimeout(instance.timerId);
                    });
            }

            return instance;
        },

        disable: function() {
            var instance = this,
                namespace = '.' + [
                    instance.name
                ].join('.');

            if(_homebrew.jQueryObjectExists(instance.$nextSwitcher)) {
                instance.$nextSwitcher.off('click' + namespace);
            }

            if(_homebrew.jQueryObjectExists(instance.$prevSwitcher)) {
                instance.$prevSwitcher.off('click' + namespace);
            }

            if(_homebrew.jQueryObjectExists(instance.$pagers)) {
                instance.$pagers.off('click' + namespace);
            }

            if(typeof instance.timerId === 'number') {
                clearTimeout(instance.timerId);
                instance.timerId = undefined;
                $(window).off(namespace);
            }

            return instance;
        },

        switchTo: function(target, methodArgs) {
            methodArgs = methodArgs || {};
            var instance = this;

            if(instance.transitions
            && instance.isTransitioning === true) {
                return instance;
            }

            var newActiveItem = instance.activeItem;

            switch(typeof target) {
                case 'string':
                    switch(target) {
                        case 'next':
                            if(newActiveItem >= instance.totalItems-1) {
                                if(instance.loop) {
                                    newActiveItem = 0;
                                }
                            } else {
                                newActiveItem++;
                            }
                        break;

                        case 'prev':
                            if(newActiveItem <= 0) {
                                if(instance.loop) {
                                    newActiveItem = instance.totalItems-1;
                                }
                            } else {
                                newActiveItem--;
                            }
                        break;

                        default:
                            console.error('Homebrew.Carousel.switchTo(): Invalid string argument `' + target + '`. The only accepted strings are `next` and `prev`.');
                        break;
                    }
                break;

                case 'number':
                    newActiveItem = target;
                break;

                default:
                    console.error('Homebrew.Carousel.switchTo(): First argument should either be a string or a number. Current argument is ' + typeof target + ':');
                    console.error(target);
                break;
            }

            if(newActiveItem === instance.activeItem) {
                return instance;
            }

            var $activeItem = instance.$items.eq(instance.activeItem),
                $newActiveItem = instance.$items.eq(newActiveItem),
                activeClass = instance.classes.active;

            instance.$el.trigger('switch.' + instance.name, [$newActiveItem, $activeItem]);

            if(!instance.transitions
            || methodArgs.transitions === false) {
                instance.$items.removeClass(activeClass);
                $newActiveItem.addClass(activeClass);
            } else {
                var transitionEvent = _homebrew.events.transitionend,
                    transitionClass = instance.classes.transition,
                    transitionInClass = instance.classes.transitionIn,
                    transitionOutClass = instance.classes.transitionOut,
                    reverseClass = instance.classes.reverse;

                instance.$items
                    .removeClass(transitionClass)
                    .not($activeItem)
                        .removeClass(activeClass);

                $newActiveItem
                    .off(transitionEvent)
                    .one(transitionEvent, function() {
                        $newActiveItem
                            .off(transitionEvent)
                            .add($activeItem)
                                .removeClass([
                                    transitionInClass,
                                    transitionOutClass,
                                    reverseClass,
                                    transitionClass,
                                    activeClass
                                ].join(' '))
                                .end()
                            .addClass(activeClass);

                        instance.isTransitioning = false;
                    });

                if(target === 'prev' && instance.activeItem === 0 && newActiveItem === instance.totalItems-1
                || target !== 'next' && instance.activeItem > newActiveItem) {
                    $activeItem
                        .add($newActiveItem)
                            .addClass(reverseClass);
                }

                setTimeout(function() {
                    $activeItem
                        .add($newActiveItem)
                            .addClass(transitionClass)
                            .end()
                        .addClass(transitionOutClass);

                    $newActiveItem.addClass(transitionInClass);
                    instance.isTransitioning = true;
                }, 10);
            }

            if(instance.pagers) {
                instance.$pagers
                    .removeClass(activeClass)
                    .eq(newActiveItem)
                        .addClass(activeClass);
            }

            instance.activeItem = newActiveItem;

            instance.reflectSwitchersState();
            instance.runTimer();

            return instance;
        },

        runTimer: function() {
            var instance = this;

            if(!instance.timer) {
                return instance;
            }

            clearTimeout(instance.timerId);

            if(instance.loop
            || instance.activeItem < instance.totalItems-1) {
                instance.timerId = setTimeout(function() {
                    instance.switchTo('next');
                }, instance.timer.duration);
            }

            return instance;
        },

        destroy: function(targets) {
            var instance = this;

            if(typeof targets === 'object'
            && targets instanceof Array) {
                while(targets.length) {
                    if(instance.destroyables.indexOf(targets[0]) > -1) {
                        instance[targets[0]].off().remove();
                        instance[targets[0]] = undefined;

                        instance.destroyables.splice(
                            instance.destroyables.indexOf(targets[0]),
                            1
                        );
                    }

                    targets.shift();
                }

                return instance;
            } else {
                instance.disable();

                while(instance.destroyables.length) {
                    instance[instance.destroyables.shift()].remove();
                }

                $.removeData(instance.$el[0], instance.name);
            }
        }
    });

    _homebrew.makePlugin(_homebrew.Carousel);