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