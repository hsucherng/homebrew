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