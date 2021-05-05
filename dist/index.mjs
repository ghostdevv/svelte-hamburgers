function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : options.context || []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['', ''], ['', '']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class TemplateTag
 * @classdesc Consumes a pipeline of composable transformer plugins and produces a template tag.
 */
var TemplateTag = function () {
  /**
   * constructs a template tag
   * @constructs TemplateTag
   * @param  {...Object} [...transformers] - an array or arguments list of transformers
   * @return {Function}                    - a template tag
   */
  function TemplateTag() {
    var _this = this;

    for (var _len = arguments.length, transformers = Array(_len), _key = 0; _key < _len; _key++) {
      transformers[_key] = arguments[_key];
    }

    _classCallCheck(this, TemplateTag);

    this.tag = function (strings) {
      for (var _len2 = arguments.length, expressions = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        expressions[_key2 - 1] = arguments[_key2];
      }

      if (typeof strings === 'function') {
        // if the first argument passed is a function, assume it is a template tag and return
        // an intermediary tag that processes the template using the aforementioned tag, passing the
        // result to our tag
        return _this.interimTag.bind(_this, strings);
      }

      if (typeof strings === 'string') {
        // if the first argument passed is a string, just transform it
        return _this.transformEndResult(strings);
      }

      // else, return a transformed end result of processing the template with our tag
      strings = strings.map(_this.transformString.bind(_this));
      return _this.transformEndResult(strings.reduce(_this.processSubstitutions.bind(_this, expressions)));
    };

    // if first argument is an array, extrude it as a list of transformers
    if (transformers.length > 0 && Array.isArray(transformers[0])) {
      transformers = transformers[0];
    }

    // if any transformers are functions, this means they are not initiated - automatically initiate them
    this.transformers = transformers.map(function (transformer) {
      return typeof transformer === 'function' ? transformer() : transformer;
    });

    // return an ES2015 template tag
    return this.tag;
  }

  /**
   * Applies all transformers to a template literal tagged with this method.
   * If a function is passed as the first argument, assumes the function is a template tag
   * and applies it to the template, returning a template tag.
   * @param  {(Function|String|Array<String>)} strings        - Either a template tag or an array containing template strings separated by identifier
   * @param  {...*}                            ...expressions - Optional list of substitution values.
   * @return {(String|Function)}                              - Either an intermediary tag function or the results of processing the template.
   */


  _createClass(TemplateTag, [{
    key: 'interimTag',


    /**
     * An intermediary template tag that receives a template tag and passes the result of calling the template with the received
     * template tag to our own template tag.
     * @param  {Function}        nextTag          - the received template tag
     * @param  {Array<String>}   template         - the template to process
     * @param  {...*}            ...substitutions - `substitutions` is an array of all substitutions in the template
     * @return {*}                                - the final processed value
     */
    value: function interimTag(previousTag, template) {
      for (var _len3 = arguments.length, substitutions = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        substitutions[_key3 - 2] = arguments[_key3];
      }

      return this.tag(_templateObject, previousTag.apply(undefined, [template].concat(substitutions)));
    }

    /**
     * Performs bulk processing on the tagged template, transforming each substitution and then
     * concatenating the resulting values into a string.
     * @param  {Array<*>} substitutions - an array of all remaining substitutions present in this template
     * @param  {String}   resultSoFar   - this iteration's result string so far
     * @param  {String}   remainingPart - the template chunk after the current substitution
     * @return {String}                 - the result of joining this iteration's processed substitution with the result
     */

  }, {
    key: 'processSubstitutions',
    value: function processSubstitutions(substitutions, resultSoFar, remainingPart) {
      var substitution = this.transformSubstitution(substitutions.shift(), resultSoFar);
      return ''.concat(resultSoFar, substitution, remainingPart);
    }

    /**
     * Iterate through each transformer, applying the transformer's `onString` method to the template
     * strings before all substitutions are processed.
     * @param {String}  str - The input string
     * @return {String}     - The final results of processing each transformer
     */

  }, {
    key: 'transformString',
    value: function transformString(str) {
      var cb = function cb(res, transform) {
        return transform.onString ? transform.onString(res) : res;
      };
      return this.transformers.reduce(cb, str);
    }

    /**
     * When a substitution is encountered, iterates through each transformer and applies the transformer's
     * `onSubstitution` method to the substitution.
     * @param  {*}      substitution - The current substitution
     * @param  {String} resultSoFar  - The result up to and excluding this substitution.
     * @return {*}                   - The final result of applying all substitution transformations.
     */

  }, {
    key: 'transformSubstitution',
    value: function transformSubstitution(substitution, resultSoFar) {
      var cb = function cb(res, transform) {
        return transform.onSubstitution ? transform.onSubstitution(res, resultSoFar) : res;
      };
      return this.transformers.reduce(cb, substitution);
    }

    /**
     * Iterates through each transformer, applying the transformer's `onEndResult` method to the
     * template literal after all substitutions have finished processing.
     * @param  {String} endResult - The processed template, just before it is returned from the tag
     * @return {String}           - The final results of processing each transformer
     */

  }, {
    key: 'transformEndResult',
    value: function transformEndResult(endResult) {
      var cb = function cb(res, transform) {
        return transform.onEndResult ? transform.onEndResult(res) : res;
      };
      return this.transformers.reduce(cb, endResult);
    }
  }]);

  return TemplateTag;
}();

/**
 * TemplateTag transformer that trims whitespace on the end result of a tagged template
 * @param  {String} side = '' - The side of the string to trim. Can be 'start' or 'end' (alternatively 'left' or 'right')
 * @return {Object}           - a TemplateTag transformer
 */
var trimResultTransformer = function trimResultTransformer() {
  var side = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return {
    onEndResult: function onEndResult(endResult) {
      if (side === '') {
        return endResult.trim();
      }

      side = side.toLowerCase();

      if (side === 'start' || side === 'left') {
        return endResult.replace(/^\s*/, '');
      }

      if (side === 'end' || side === 'right') {
        return endResult.replace(/\s*$/, '');
      }

      throw new Error('Side not supported: ' + side);
    }
  };
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * strips indentation from a template literal
 * @param  {String} type = 'initial' - whether to remove all indentation or just leading indentation. can be 'all' or 'initial'
 * @return {Object}                  - a TemplateTag transformer
 */
var stripIndentTransformer = function stripIndentTransformer() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'initial';
  return {
    onEndResult: function onEndResult(endResult) {
      if (type === 'initial') {
        // remove the shortest leading indentation from each line
        var match = endResult.match(/^[^\S\n]*(?=\S)/gm);
        var indent = match && Math.min.apply(Math, _toConsumableArray(match.map(function (el) {
          return el.length;
        })));
        if (indent) {
          var regexp = new RegExp('^.{' + indent + '}', 'gm');
          return endResult.replace(regexp, '');
        }
        return endResult;
      }
      if (type === 'all') {
        // remove all indentation from each line
        return endResult.replace(/^[^\S\n]+/gm, '');
      }
      throw new Error('Unknown type: ' + type);
    }
  };
};

/**
 * Replaces tabs, newlines and spaces with the chosen value when they occur in sequences
 * @param  {(String|RegExp)} replaceWhat - the value or pattern that should be replaced
 * @param  {*}               replaceWith - the replacement value
 * @return {Object}                      - a TemplateTag transformer
 */
var replaceResultTransformer = function replaceResultTransformer(replaceWhat, replaceWith) {
  return {
    onEndResult: function onEndResult(endResult) {
      if (replaceWhat == null || replaceWith == null) {
        throw new Error('replaceResultTransformer requires at least 2 arguments.');
      }
      return endResult.replace(replaceWhat, replaceWith);
    }
  };
};

var replaceSubstitutionTransformer = function replaceSubstitutionTransformer(replaceWhat, replaceWith) {
  return {
    onSubstitution: function onSubstitution(substitution, resultSoFar) {
      if (replaceWhat == null || replaceWith == null) {
        throw new Error('replaceSubstitutionTransformer requires at least 2 arguments.');
      }

      // Do not touch if null or undefined
      if (substitution == null) {
        return substitution;
      } else {
        return substitution.toString().replace(replaceWhat, replaceWith);
      }
    }
  };
};

var defaults = {
  separator: '',
  conjunction: '',
  serial: false
};

/**
 * Converts an array substitution to a string containing a list
 * @param  {String} [opts.separator = ''] - the character that separates each item
 * @param  {String} [opts.conjunction = '']  - replace the last separator with this
 * @param  {Boolean} [opts.serial = false] - include the separator before the conjunction? (Oxford comma use-case)
 *
 * @return {Object}                     - a TemplateTag transformer
 */
var inlineArrayTransformer = function inlineArrayTransformer() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults;
  return {
    onSubstitution: function onSubstitution(substitution, resultSoFar) {
      // only operate on arrays
      if (Array.isArray(substitution)) {
        var arrayLength = substitution.length;
        var separator = opts.separator;
        var conjunction = opts.conjunction;
        var serial = opts.serial;
        // join each item in the array into a string where each item is separated by separator
        // be sure to maintain indentation
        var indent = resultSoFar.match(/(\n?[^\S\n]+)$/);
        if (indent) {
          substitution = substitution.join(separator + indent[1]);
        } else {
          substitution = substitution.join(separator + ' ');
        }
        // if conjunction is set, replace the last separator with conjunction, but only if there is more than one substitution
        if (conjunction && arrayLength > 1) {
          var separatorIndex = substitution.lastIndexOf(separator);
          substitution = substitution.slice(0, separatorIndex) + (serial ? separator : '') + ' ' + conjunction + substitution.slice(separatorIndex + 1);
        }
      }
      return substitution;
    }
  };
};

var splitStringTransformer = function splitStringTransformer(splitBy) {
  return {
    onSubstitution: function onSubstitution(substitution, resultSoFar) {
      if (splitBy != null && typeof splitBy === 'string') {
        if (typeof substitution === 'string' && substitution.includes(splitBy)) {
          substitution = substitution.split(splitBy);
        }
      } else {
        throw new Error('You need to specify a string character to split by.');
      }
      return substitution;
    }
  };
};

var isValidValue = function isValidValue(x) {
  return x != null && !Number.isNaN(x) && typeof x !== 'boolean';
};

var removeNonPrintingValuesTransformer = function removeNonPrintingValuesTransformer() {
  return {
    onSubstitution: function onSubstitution(substitution) {
      if (Array.isArray(substitution)) {
        return substitution.filter(isValidValue);
      }
      if (isValidValue(substitution)) {
        return substitution;
      }
      return '';
    }
  };
};

new TemplateTag(inlineArrayTransformer({ separator: ',' }), stripIndentTransformer, trimResultTransformer);

new TemplateTag(inlineArrayTransformer({ separator: ',', conjunction: 'and' }), stripIndentTransformer, trimResultTransformer);

new TemplateTag(inlineArrayTransformer({ separator: ',', conjunction: 'or' }), stripIndentTransformer, trimResultTransformer);

new TemplateTag(splitStringTransformer('\n'), removeNonPrintingValuesTransformer, inlineArrayTransformer, stripIndentTransformer, trimResultTransformer);

new TemplateTag(splitStringTransformer('\n'), inlineArrayTransformer, stripIndentTransformer, trimResultTransformer, replaceSubstitutionTransformer(/&/g, '&amp;'), replaceSubstitutionTransformer(/</g, '&lt;'), replaceSubstitutionTransformer(/>/g, '&gt;'), replaceSubstitutionTransformer(/"/g, '&quot;'), replaceSubstitutionTransformer(/'/g, '&#x27;'), replaceSubstitutionTransformer(/`/g, '&#x60;'));

var oneLine = new TemplateTag(replaceResultTransformer(/(?:\n(?:\s*))+/g, ' '), trimResultTransformer);

new TemplateTag(replaceResultTransformer(/(?:\n\s*)/g, ''), trimResultTransformer);

new TemplateTag(inlineArrayTransformer({ separator: ',' }), replaceResultTransformer(/(?:\s+)/g, ' '), trimResultTransformer);

new TemplateTag(inlineArrayTransformer({ separator: ',', conjunction: 'or' }), replaceResultTransformer(/(?:\s+)/g, ' '), trimResultTransformer);

new TemplateTag(inlineArrayTransformer({ separator: ',', conjunction: 'and' }), replaceResultTransformer(/(?:\s+)/g, ' '), trimResultTransformer);

new TemplateTag(inlineArrayTransformer, stripIndentTransformer, trimResultTransformer);

new TemplateTag(inlineArrayTransformer, replaceResultTransformer(/(?:\s+)/g, ' '), trimResultTransformer);

new TemplateTag(stripIndentTransformer, trimResultTransformer);

new TemplateTag(stripIndentTransformer('all'), trimResultTransformer);

/* src\Hamburger.svelte generated by Svelte v3.38.2 */

function add_css() {
	var style = element("style");
	style.id = "svelte-14survb-style";
	style.textContent = ".hamburger.svelte-14survb.svelte-14survb{padding:15px 15px;display:inline-block;cursor:pointer;transition-property:opacity, filter;transition-duration:0.15s;transition-timing-function:linear;font:inherit;color:inherit;text-transform:none;background-color:transparent;border:0;margin:0;overflow:visible}.hamburger.svelte-14survb.svelte-14survb:hover{opacity:0.7}.hamburger.is-active.svelte-14survb.svelte-14survb:hover{opacity:0.7}.hamburger.is-active.svelte-14survb .hamburger-inner.svelte-14survb,.hamburger.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{background-color:#000}.hamburger-box.svelte-14survb.svelte-14survb{width:40px;height:24px;display:inline-block;position:relative}.hamburger-inner.svelte-14survb.svelte-14survb{display:block;top:50%;margin-top:-2px}.hamburger-inner.svelte-14survb.svelte-14survb,.hamburger-inner.svelte-14survb.svelte-14survb::before,.hamburger-inner.svelte-14survb.svelte-14survb::after{width:40px;height:4px;background-color:#000;border-radius:4px;position:absolute;transition-property:transform;transition-duration:0.15s;transition-timing-function:ease}.hamburger-inner.svelte-14survb.svelte-14survb::before,.hamburger-inner.svelte-14survb.svelte-14survb::after{content:\"\";display:block}.hamburger-inner.svelte-14survb.svelte-14survb::before{top:-10px}.hamburger-inner.svelte-14survb.svelte-14survb::after{bottom:-10px}.hamburger--3dx.svelte-14survb .hamburger-box.svelte-14survb{perspective:80px}.hamburger--3dx.svelte-14survb .hamburger-inner.svelte-14survb{transition:transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1), background-color 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dx.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--3dx.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:transform 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dx.is-active.svelte-14survb .hamburger-inner.svelte-14survb{background-color:transparent !important;transform:rotateY(180deg)}.hamburger--3dx.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(0, 10px, 0) rotate(45deg)}.hamburger--3dx.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -10px, 0) rotate(-45deg)}.hamburger--3dx-r.svelte-14survb .hamburger-box.svelte-14survb{perspective:80px}.hamburger--3dx-r.svelte-14survb .hamburger-inner.svelte-14survb{transition:transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1), background-color 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dx-r.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--3dx-r.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:transform 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dx-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{background-color:transparent !important;transform:rotateY(-180deg)}.hamburger--3dx-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(0, 10px, 0) rotate(45deg)}.hamburger--3dx-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -10px, 0) rotate(-45deg)}.hamburger--3dy.svelte-14survb .hamburger-box.svelte-14survb{perspective:80px}.hamburger--3dy.svelte-14survb .hamburger-inner.svelte-14survb{transition:transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1), background-color 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dy.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--3dy.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:transform 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dy.is-active.svelte-14survb .hamburger-inner.svelte-14survb{background-color:transparent !important;transform:rotateX(-180deg)}.hamburger--3dy.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(0, 10px, 0) rotate(45deg)}.hamburger--3dy.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -10px, 0) rotate(-45deg)}.hamburger--3dy-r.svelte-14survb .hamburger-box.svelte-14survb{perspective:80px}.hamburger--3dy-r.svelte-14survb .hamburger-inner.svelte-14survb{transition:transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1), background-color 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dy-r.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--3dy-r.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:transform 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dy-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{background-color:transparent !important;transform:rotateX(180deg)}.hamburger--3dy-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(0, 10px, 0) rotate(45deg)}.hamburger--3dy-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -10px, 0) rotate(-45deg)}.hamburger--3dxy.svelte-14survb .hamburger-box.svelte-14survb{perspective:80px}.hamburger--3dxy.svelte-14survb .hamburger-inner.svelte-14survb{transition:transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1), background-color 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dxy.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--3dxy.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:transform 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dxy.is-active.svelte-14survb .hamburger-inner.svelte-14survb{background-color:transparent !important;transform:rotateX(180deg) rotateY(180deg)}.hamburger--3dxy.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(0, 10px, 0) rotate(45deg)}.hamburger--3dxy.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -10px, 0) rotate(-45deg)}.hamburger--3dxy-r.svelte-14survb .hamburger-box.svelte-14survb{perspective:80px}.hamburger--3dxy-r.svelte-14survb .hamburger-inner.svelte-14survb{transition:transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1), background-color 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dxy-r.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--3dxy-r.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:transform 0s 0.1s cubic-bezier(0.645, 0.045, 0.355, 1)}.hamburger--3dxy-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{background-color:transparent !important;transform:rotateX(180deg) rotateY(180deg) rotateZ(-180deg)}.hamburger--3dxy-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(0, 10px, 0) rotate(45deg)}.hamburger--3dxy-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -10px, 0) rotate(-45deg)}.hamburger--arrow.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(-8px, 0, 0) rotate(-45deg) scale(0.7, 1)}.hamburger--arrow.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(-8px, 0, 0) rotate(45deg) scale(0.7, 1)}.hamburger--arrow-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(8px, 0, 0) rotate(45deg) scale(0.7, 1)}.hamburger--arrow-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(8px, 0, 0) rotate(-45deg) scale(0.7, 1)}.hamburger--arrowalt.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.1s 0.1s ease, transform 0.1s cubic-bezier(0.165, 0.84, 0.44, 1)}.hamburger--arrowalt.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:bottom 0.1s 0.1s ease, transform 0.1s cubic-bezier(0.165, 0.84, 0.44, 1)}.hamburger--arrowalt.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;transform:translate3d(-8px, -10px, 0) rotate(-45deg) scale(0.7, 1);transition:top 0.1s ease, transform 0.1s 0.1s cubic-bezier(0.895, 0.03, 0.685, 0.22)}.hamburger--arrowalt.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:translate3d(-8px, 10px, 0) rotate(45deg) scale(0.7, 1);transition:bottom 0.1s ease, transform 0.1s 0.1s cubic-bezier(0.895, 0.03, 0.685, 0.22)}.hamburger--arrowalt-r.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.1s 0.1s ease, transform 0.1s cubic-bezier(0.165, 0.84, 0.44, 1)}.hamburger--arrowalt-r.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:bottom 0.1s 0.1s ease, transform 0.1s cubic-bezier(0.165, 0.84, 0.44, 1)}.hamburger--arrowalt-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;transform:translate3d(8px, -10px, 0) rotate(45deg) scale(0.7, 1);transition:top 0.1s ease, transform 0.1s 0.1s cubic-bezier(0.895, 0.03, 0.685, 0.22)}.hamburger--arrowalt-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:translate3d(8px, 10px, 0) rotate(-45deg) scale(0.7, 1);transition:bottom 0.1s ease, transform 0.1s 0.1s cubic-bezier(0.895, 0.03, 0.685, 0.22)}.hamburger--arrowturn.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(-180deg)}.hamburger--arrowturn.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(8px, 0, 0) rotate(45deg) scale(0.7, 1)}.hamburger--arrowturn.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(8px, 0, 0) rotate(-45deg) scale(0.7, 1)}.hamburger--arrowturn-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(-180deg)}.hamburger--arrowturn-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:translate3d(-8px, 0, 0) rotate(-45deg) scale(0.7, 1)}.hamburger--arrowturn-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(-8px, 0, 0) rotate(45deg) scale(0.7, 1)}.hamburger--boring.svelte-14survb .hamburger-inner.svelte-14survb,.hamburger--boring.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--boring.svelte-14survb .hamburger-inner.svelte-14survb::after{transition-property:none}.hamburger--boring.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(45deg)}.hamburger--boring.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;opacity:0}.hamburger--boring.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:rotate(-90deg)}.hamburger--collapse.svelte-14survb .hamburger-inner.svelte-14survb{top:auto;bottom:0;transition-duration:0.13s;transition-delay:0.13s;transition-timing-function:cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--collapse.svelte-14survb .hamburger-inner.svelte-14survb::after{top:-20px;transition:top 0.2s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1), opacity 0.1s linear}.hamburger--collapse.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.12s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1), transform 0.13s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--collapse.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:translate3d(0, -10px, 0) rotate(-45deg);transition-delay:0.22s;transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--collapse.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{top:0;opacity:0;transition:top 0.2s cubic-bezier(0.33333, 0, 0.66667, 0.33333), opacity 0.1s 0.22s linear}.hamburger--collapse.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;transform:rotate(-90deg);transition:top 0.1s 0.16s cubic-bezier(0.33333, 0, 0.66667, 0.33333), transform 0.13s 0.25s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--collapse-r.svelte-14survb .hamburger-inner.svelte-14survb{top:auto;bottom:0;transition-duration:0.13s;transition-delay:0.13s;transition-timing-function:cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--collapse-r.svelte-14survb .hamburger-inner.svelte-14survb::after{top:-20px;transition:top 0.2s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1), opacity 0.1s linear}.hamburger--collapse-r.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.12s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1), transform 0.13s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--collapse-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:translate3d(0, -10px, 0) rotate(45deg);transition-delay:0.22s;transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--collapse-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{top:0;opacity:0;transition:top 0.2s cubic-bezier(0.33333, 0, 0.66667, 0.33333), opacity 0.1s 0.22s linear}.hamburger--collapse-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;transform:rotate(90deg);transition:top 0.1s 0.16s cubic-bezier(0.33333, 0, 0.66667, 0.33333), transform 0.13s 0.25s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--elastic.svelte-14survb .hamburger-inner.svelte-14survb{top:2px;transition-duration:0.275s;transition-timing-function:cubic-bezier(0.68, -0.55, 0.265, 1.55)}.hamburger--elastic.svelte-14survb .hamburger-inner.svelte-14survb::before{top:10px;transition:opacity 0.125s 0.275s ease}.hamburger--elastic.svelte-14survb .hamburger-inner.svelte-14survb::after{top:20px;transition:transform 0.275s cubic-bezier(0.68, -0.55, 0.265, 1.55)}.hamburger--elastic.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:translate3d(0, 10px, 0) rotate(135deg);transition-delay:0.075s}.hamburger--elastic.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transition-delay:0s;opacity:0}.hamburger--elastic.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -20px, 0) rotate(-270deg);transition-delay:0.075s}.hamburger--elastic-r.svelte-14survb .hamburger-inner.svelte-14survb{top:2px;transition-duration:0.275s;transition-timing-function:cubic-bezier(0.68, -0.55, 0.265, 1.55)}.hamburger--elastic-r.svelte-14survb .hamburger-inner.svelte-14survb::before{top:10px;transition:opacity 0.125s 0.275s ease}.hamburger--elastic-r.svelte-14survb .hamburger-inner.svelte-14survb::after{top:20px;transition:transform 0.275s cubic-bezier(0.68, -0.55, 0.265, 1.55)}.hamburger--elastic-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:translate3d(0, 10px, 0) rotate(-135deg);transition-delay:0.075s}.hamburger--elastic-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transition-delay:0s;opacity:0}.hamburger--elastic-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -20px, 0) rotate(270deg);transition-delay:0.075s}.hamburger--emphatic.svelte-14survb.svelte-14survb{overflow:hidden}.hamburger--emphatic.svelte-14survb .hamburger-inner.svelte-14survb{transition:background-color 0.125s 0.175s ease-in}.hamburger--emphatic.svelte-14survb .hamburger-inner.svelte-14survb::before{left:0;transition:transform 0.125s cubic-bezier(0.6, 0.04, 0.98, 0.335), top 0.05s 0.125s linear, left 0.125s 0.175s ease-in}.hamburger--emphatic.svelte-14survb .hamburger-inner.svelte-14survb::after{top:10px;right:0;transition:transform 0.125s cubic-bezier(0.6, 0.04, 0.98, 0.335), top 0.05s 0.125s linear, right 0.125s 0.175s ease-in}.hamburger--emphatic.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transition-delay:0s;transition-timing-function:ease-out;background-color:transparent !important}.hamburger--emphatic.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{left:-80px;top:-80px;transform:translate3d(80px, 80px, 0) rotate(45deg);transition:left 0.125s ease-out, top 0.05s 0.125s linear, transform 0.125s 0.175s cubic-bezier(0.075, 0.82, 0.165, 1)}.hamburger--emphatic.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{right:-80px;top:-80px;transform:translate3d(-80px, 80px, 0) rotate(-45deg);transition:right 0.125s ease-out, top 0.05s 0.125s linear, transform 0.125s 0.175s cubic-bezier(0.075, 0.82, 0.165, 1)}.hamburger--emphatic-r.svelte-14survb.svelte-14survb{overflow:hidden}.hamburger--emphatic-r.svelte-14survb .hamburger-inner.svelte-14survb{transition:background-color 0.125s 0.175s ease-in}.hamburger--emphatic-r.svelte-14survb .hamburger-inner.svelte-14survb::before{left:0;transition:transform 0.125s cubic-bezier(0.6, 0.04, 0.98, 0.335), top 0.05s 0.125s linear, left 0.125s 0.175s ease-in}.hamburger--emphatic-r.svelte-14survb .hamburger-inner.svelte-14survb::after{top:10px;right:0;transition:transform 0.125s cubic-bezier(0.6, 0.04, 0.98, 0.335), top 0.05s 0.125s linear, right 0.125s 0.175s ease-in}.hamburger--emphatic-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transition-delay:0s;transition-timing-function:ease-out;background-color:transparent !important}.hamburger--emphatic-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{left:-80px;top:80px;transform:translate3d(80px, -80px, 0) rotate(-45deg);transition:left 0.125s ease-out, top 0.05s 0.125s linear, transform 0.125s 0.175s cubic-bezier(0.075, 0.82, 0.165, 1)}.hamburger--emphatic-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{right:-80px;top:80px;transform:translate3d(-80px, -80px, 0) rotate(45deg);transition:right 0.125s ease-out, top 0.05s 0.125s linear, transform 0.125s 0.175s cubic-bezier(0.075, 0.82, 0.165, 1)}.hamburger--minus.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--minus.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:bottom 0.08s 0s ease-out, top 0.08s 0s ease-out, opacity 0s linear}.hamburger--minus.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--minus.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{opacity:0;transition:bottom 0.08s ease-out, top 0.08s ease-out, opacity 0s 0.08s linear}.hamburger--minus.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0}.hamburger--minus.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0}.hamburger--slider.svelte-14survb .hamburger-inner.svelte-14survb{top:2px}.hamburger--slider.svelte-14survb .hamburger-inner.svelte-14survb::before{top:10px;transition-property:transform, opacity;transition-timing-function:ease;transition-duration:0.15s}.hamburger--slider.svelte-14survb .hamburger-inner.svelte-14survb::after{top:20px}.hamburger--slider.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:translate3d(0, 10px, 0) rotate(45deg)}.hamburger--slider.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:rotate(-45deg) translate3d(-5.7142857143px, -6px, 0);opacity:0}.hamburger--slider.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -20px, 0) rotate(-90deg)}.hamburger--slider-r.svelte-14survb .hamburger-inner.svelte-14survb{top:2px}.hamburger--slider-r.svelte-14survb .hamburger-inner.svelte-14survb::before{top:10px;transition-property:transform, opacity;transition-timing-function:ease;transition-duration:0.15s}.hamburger--slider-r.svelte-14survb .hamburger-inner.svelte-14survb::after{top:20px}.hamburger--slider-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:translate3d(0, 10px, 0) rotate(-45deg)}.hamburger--slider-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{transform:rotate(45deg) translate3d(5.7142857143px, -6px, 0);opacity:0}.hamburger--slider-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transform:translate3d(0, -20px, 0) rotate(90deg)}.hamburger--spin.svelte-14survb .hamburger-inner.svelte-14survb{transition-duration:0.22s;transition-timing-function:cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--spin.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.1s 0.25s ease-in, opacity 0.1s ease-in}.hamburger--spin.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:bottom 0.1s 0.25s ease-in, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--spin.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(225deg);transition-delay:0.12s;transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--spin.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;opacity:0;transition:top 0.1s ease-out, opacity 0.1s 0.12s ease-out}.hamburger--spin.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:rotate(-90deg);transition:bottom 0.1s ease-out, transform 0.22s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--spin-r.svelte-14survb .hamburger-inner.svelte-14survb{transition-duration:0.22s;transition-timing-function:cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--spin-r.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.1s 0.25s ease-in, opacity 0.1s ease-in}.hamburger--spin-r.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:bottom 0.1s 0.25s ease-in, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--spin-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(-225deg);transition-delay:0.12s;transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--spin-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;opacity:0;transition:top 0.1s ease-out, opacity 0.1s 0.12s ease-out}.hamburger--spin-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:rotate(90deg);transition:bottom 0.1s ease-out, transform 0.22s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--spring.svelte-14survb .hamburger-inner.svelte-14survb{top:2px;transition:background-color 0s 0.13s linear}.hamburger--spring.svelte-14survb .hamburger-inner.svelte-14survb::before{top:10px;transition:top 0.1s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1), transform 0.13s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--spring.svelte-14survb .hamburger-inner.svelte-14survb::after{top:20px;transition:top 0.2s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1), transform 0.13s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--spring.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transition-delay:0.22s;background-color:transparent !important}.hamburger--spring.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;transition:top 0.1s 0.15s cubic-bezier(0.33333, 0, 0.66667, 0.33333), transform 0.13s 0.22s cubic-bezier(0.215, 0.61, 0.355, 1);transform:translate3d(0, 10px, 0) rotate(45deg)}.hamburger--spring.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{top:0;transition:top 0.2s cubic-bezier(0.33333, 0, 0.66667, 0.33333), transform 0.13s 0.22s cubic-bezier(0.215, 0.61, 0.355, 1);transform:translate3d(0, 10px, 0) rotate(-45deg)}.hamburger--spring-r.svelte-14survb .hamburger-inner.svelte-14survb{top:auto;bottom:0;transition-duration:0.13s;transition-delay:0s;transition-timing-function:cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--spring-r.svelte-14survb .hamburger-inner.svelte-14survb::after{top:-20px;transition:top 0.2s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1), opacity 0s linear}.hamburger--spring-r.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.1s 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1), transform 0.13s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--spring-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:translate3d(0, -10px, 0) rotate(-45deg);transition-delay:0.22s;transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--spring-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{top:0;opacity:0;transition:top 0.2s cubic-bezier(0.33333, 0, 0.66667, 0.33333), opacity 0s 0.22s linear}.hamburger--spring-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;transform:rotate(90deg);transition:top 0.1s 0.15s cubic-bezier(0.33333, 0, 0.66667, 0.33333), transform 0.13s 0.22s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--stand.svelte-14survb .hamburger-inner.svelte-14survb{transition:transform 0.075s 0.15s cubic-bezier(0.55, 0.055, 0.675, 0.19), background-color 0s 0.075s linear}.hamburger--stand.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.075s 0.075s ease-in, transform 0.075s 0s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--stand.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:bottom 0.075s 0.075s ease-in, transform 0.075s 0s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--stand.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(90deg);background-color:transparent !important;transition:transform 0.075s 0s cubic-bezier(0.215, 0.61, 0.355, 1), background-color 0s 0.15s linear}.hamburger--stand.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;transform:rotate(-45deg);transition:top 0.075s 0.1s ease-out, transform 0.075s 0.15s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--stand.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:rotate(45deg);transition:bottom 0.075s 0.1s ease-out, transform 0.075s 0.15s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--stand-r.svelte-14survb .hamburger-inner.svelte-14survb{transition:transform 0.075s 0.15s cubic-bezier(0.55, 0.055, 0.675, 0.19), background-color 0s 0.075s linear}.hamburger--stand-r.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.075s 0.075s ease-in, transform 0.075s 0s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--stand-r.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:bottom 0.075s 0.075s ease-in, transform 0.075s 0s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--stand-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(-90deg);background-color:transparent !important;transition:transform 0.075s 0s cubic-bezier(0.215, 0.61, 0.355, 1), background-color 0s 0.15s linear}.hamburger--stand-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;transform:rotate(-45deg);transition:top 0.075s 0.1s ease-out, transform 0.075s 0.15s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--stand-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:rotate(45deg);transition:bottom 0.075s 0.1s ease-out, transform 0.075s 0.15s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--squeeze.svelte-14survb .hamburger-inner.svelte-14survb{transition-duration:0.075s;transition-timing-function:cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--squeeze.svelte-14survb .hamburger-inner.svelte-14survb::before{transition:top 0.075s 0.12s ease, opacity 0.075s ease}.hamburger--squeeze.svelte-14survb .hamburger-inner.svelte-14survb::after{transition:bottom 0.075s 0.12s ease, transform 0.075s cubic-bezier(0.55, 0.055, 0.675, 0.19)}.hamburger--squeeze.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(45deg);transition-delay:0.12s;transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--squeeze.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;opacity:0;transition:top 0.075s ease, opacity 0.075s 0.12s ease}.hamburger--squeeze.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:rotate(-90deg);transition:bottom 0.075s ease, transform 0.075s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1)}.hamburger--vortex.svelte-14survb .hamburger-inner.svelte-14survb{transition-duration:0.2s;transition-timing-function:cubic-bezier(0.19, 1, 0.22, 1)}.hamburger--vortex.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--vortex.svelte-14survb .hamburger-inner.svelte-14survb::after{transition-duration:0s;transition-delay:0.1s;transition-timing-function:linear}.hamburger--vortex.svelte-14survb .hamburger-inner.svelte-14survb::before{transition-property:top, opacity}.hamburger--vortex.svelte-14survb .hamburger-inner.svelte-14survb::after{transition-property:bottom, transform}.hamburger--vortex.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(765deg);transition-timing-function:cubic-bezier(0.19, 1, 0.22, 1)}.hamburger--vortex.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--vortex.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transition-delay:0s}.hamburger--vortex.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;opacity:0}.hamburger--vortex.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:rotate(90deg)}.hamburger--vortex-r.svelte-14survb .hamburger-inner.svelte-14survb{transition-duration:0.2s;transition-timing-function:cubic-bezier(0.19, 1, 0.22, 1)}.hamburger--vortex-r.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--vortex-r.svelte-14survb .hamburger-inner.svelte-14survb::after{transition-duration:0s;transition-delay:0.1s;transition-timing-function:linear}.hamburger--vortex-r.svelte-14survb .hamburger-inner.svelte-14survb::before{transition-property:top, opacity}.hamburger--vortex-r.svelte-14survb .hamburger-inner.svelte-14survb::after{transition-property:bottom, transform}.hamburger--vortex-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb{transform:rotate(-765deg);transition-timing-function:cubic-bezier(0.19, 1, 0.22, 1)}.hamburger--vortex-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger--vortex-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{transition-delay:0s}.hamburger--vortex-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before{top:0;opacity:0}.hamburger--vortex-r.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:0;transform:rotate(-90deg)}.hamburger.svelte-14survb.svelte-14survb{padding:var(--paddingY) var(--paddingX)}.hamburger.svelte-14survb .hamburger-box.svelte-14survb{width:var(--layer-width);height:calc(var(--layer-height) * 3 + var(--layer-spacing) * 2)}.hamburger.svelte-14survb .hamburger-inner.svelte-14survb{margin-top:calc(var(--layer-height) / -2)}.hamburger.svelte-14survb .hamburger-inner.svelte-14survb,.hamburger.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger.svelte-14survb .hamburger-inner.svelte-14survb::after{width:var(--layer-width);height:var(--layer-height);background-color:var(--color);border-radius:var(--border-radius)}.hamburger.svelte-14survb .hamburger-inner.svelte-14survb::before{top:calc( calc(var(--layer-spacing) + var(--layer-height)) * -1 )}.hamburger.svelte-14survb .hamburger-inner.svelte-14survb::after{bottom:calc( calc(var(--layer-spacing) + var(--layer-height)) * -1 )}.hamburger.svelte-14survb.svelte-14survb:hover{opacity:var(--opacity)}.hamburger.is-active.svelte-14survb.svelte-14survb:hover{opacity:var(--opacity-active)}.hamburger.is-active.svelte-14survb .hamburger-inner.svelte-14survb,.hamburger.is-active.svelte-14survb .hamburger-inner.svelte-14survb::before,.hamburger.is-active.svelte-14survb .hamburger-inner.svelte-14survb::after{background-color:var(--color-active)}";
	append(document.head, style);
}

function create_fragment(ctx) {
	let button;
	let span1;
	let button_class_value;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			span1 = element("span");
			span1.innerHTML = `<span class="hamburger-inner svelte-14survb"></span>`;
			attr(span1, "class", "hamburger-box svelte-14survb");
			attr(button, "class", button_class_value = "hamburger hamburger--" + /*type*/ ctx[1] + " " + (/*open*/ ctx[0] && "is-active") + " svelte-14survb");
			attr(button, "style", /*style*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, span1);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[13]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*type, open*/ 3 && button_class_value !== (button_class_value = "hamburger hamburger--" + /*type*/ ctx[1] + " " + (/*open*/ ctx[0] && "is-active") + " svelte-14survb")) {
				attr(button, "class", button_class_value);
			}

			if (dirty & /*style*/ 4) {
				attr(button, "style", /*style*/ ctx[2]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let style;
	let { open } = $$props;
	let { type = "spin" } = $$props;
	let { color = "white" } = $$props;
	let { activeColor = "white" } = $$props;
	let { paddingX = "15px" } = $$props;
	let { paddingY = "15px" } = $$props;
	let { layerWidth = "40px" } = $$props;
	let { layerHeight = "4px" } = $$props;
	let { layerSpacing = "6px" } = $$props;
	let { borderRadius = "4px" } = $$props;
	let { hoverOpacity = 0.7 } = $$props;
	let { activeHoverOpacity = 0.7 } = $$props;
	const click_handler = () => $$invalidate(0, open = !open);

	$$self.$$set = $$props => {
		if ("open" in $$props) $$invalidate(0, open = $$props.open);
		if ("type" in $$props) $$invalidate(1, type = $$props.type);
		if ("color" in $$props) $$invalidate(3, color = $$props.color);
		if ("activeColor" in $$props) $$invalidate(4, activeColor = $$props.activeColor);
		if ("paddingX" in $$props) $$invalidate(5, paddingX = $$props.paddingX);
		if ("paddingY" in $$props) $$invalidate(6, paddingY = $$props.paddingY);
		if ("layerWidth" in $$props) $$invalidate(7, layerWidth = $$props.layerWidth);
		if ("layerHeight" in $$props) $$invalidate(8, layerHeight = $$props.layerHeight);
		if ("layerSpacing" in $$props) $$invalidate(9, layerSpacing = $$props.layerSpacing);
		if ("borderRadius" in $$props) $$invalidate(10, borderRadius = $$props.borderRadius);
		if ("hoverOpacity" in $$props) $$invalidate(11, hoverOpacity = $$props.hoverOpacity);
		if ("activeHoverOpacity" in $$props) $$invalidate(12, activeHoverOpacity = $$props.activeHoverOpacity);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*color, activeColor, paddingX, paddingY, layerWidth, layerHeight, layerSpacing, borderRadius, hoverOpacity, activeHoverOpacity*/ 8184) {
			// Map inputs to css variables
			$$invalidate(2, style = oneLine`
        --color: ${color};
        --color-active: ${activeColor};
        
        --paddingX: ${paddingX};
        --paddingY: ${paddingY};

        --layer-width: ${layerWidth};
        --layer-height: ${layerHeight};
        --layer-spacing: ${layerSpacing};
        --border-radius: ${borderRadius};

        --opacity: ${hoverOpacity};
        --opacity-active: ${activeHoverOpacity};

        background-color: red;
    `);
		}
	};

	return [
		open,
		type,
		style,
		color,
		activeColor,
		paddingX,
		paddingY,
		layerWidth,
		layerHeight,
		layerSpacing,
		borderRadius,
		hoverOpacity,
		activeHoverOpacity,
		click_handler
	];
}

class Hamburger extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-14survb-style")) add_css();

		init(this, options, instance, create_fragment, safe_not_equal, {
			open: 0,
			type: 1,
			color: 3,
			activeColor: 4,
			paddingX: 5,
			paddingY: 6,
			layerWidth: 7,
			layerHeight: 8,
			layerSpacing: 9,
			borderRadius: 10,
			hoverOpacity: 11,
			activeHoverOpacity: 12
		});
	}
}

export default Hamburger;
