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