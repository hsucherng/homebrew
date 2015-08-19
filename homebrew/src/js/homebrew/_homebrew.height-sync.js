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