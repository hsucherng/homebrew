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