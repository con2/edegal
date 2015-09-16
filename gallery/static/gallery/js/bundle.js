(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _viewmodelsMainViewModel = require('./viewmodels/MainViewModel');

var _viewmodelsMainViewModel2 = _interopRequireDefault(_viewmodelsMainViewModel);

_knockout2['default'].applyBindings(new _viewmodelsMainViewModel2['default']());
(0, _page2['default'])();

},{"./viewmodels/MainViewModel":2,"knockout":4,"page":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MainViewModel = function MainViewModel() {
  _classCallCheck(this, MainViewModel);
};

exports["default"] = MainViewModel;
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
/*!
 * Knockout JavaScript library v3.3.0
 * (c) Steven Sanderson - http://knockoutjs.com/
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function(){
var DEBUG=true;
(function(undefined){
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    var window = this || (0, eval)('this'),
        document = window['document'],
        navigator = window['navigator'],
        jQueryInstance = window["jQuery"],
        JSON = window["JSON"];
(function(factory) {
    // Support three module loading scenarios
    if (typeof define === 'function' && define['amd']) {
        // [1] AMD anonymous module
        define(['exports', 'require'], factory);
    } else if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [2] CommonJS/Node.js
        factory(module['exports'] || exports);  // module.exports is for Node.js
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['ko'] = {});
    }
}(function(koExports, amdRequire){
// Internally, all KO objects are attached to koExports (even the non-exported ones whose names will be minified by the closure compiler).
// In the future, the following "ko" variable may be made distinct from "koExports" so that private objects are not externally reachable.
var ko = typeof koExports !== 'undefined' ? koExports : {};
// Google Closure Compiler helpers (used only to make the minified file smaller)
ko.exportSymbol = function(koPath, object) {
    var tokens = koPath.split(".");

    // In the future, "ko" may become distinct from "koExports" (so that non-exported objects are not reachable)
    // At that point, "target" would be set to: (typeof koExports !== "undefined" ? koExports : ko)
    var target = ko;

    for (var i = 0; i < tokens.length - 1; i++)
        target = target[tokens[i]];
    target[tokens[tokens.length - 1]] = object;
};
ko.exportProperty = function(owner, publicName, object) {
    owner[publicName] = object;
};
ko.version = "3.3.0";

ko.exportSymbol('version', ko.version);
ko.utils = (function () {
    function objectForEach(obj, action) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                action(prop, obj[prop]);
            }
        }
    }

    function extend(target, source) {
        if (source) {
            for(var prop in source) {
                if(source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }

    function setPrototypeOf(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }

    var canSetPrototype = ({ __proto__: [] } instanceof Array);

    // Represent the known event types in a compact way, then at runtime transform it into a hash with event name as key (for fast lookup)
    var knownEvents = {}, knownEventTypesByEventName = {};
    var keyEventTypeName = (navigator && /Firefox\/2/i.test(navigator.userAgent)) ? 'KeyboardEvent' : 'UIEvents';
    knownEvents[keyEventTypeName] = ['keyup', 'keydown', 'keypress'];
    knownEvents['MouseEvents'] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
    objectForEach(knownEvents, function(eventType, knownEventsForType) {
        if (knownEventsForType.length) {
            for (var i = 0, j = knownEventsForType.length; i < j; i++)
                knownEventTypesByEventName[knownEventsForType[i]] = eventType;
        }
    });
    var eventsThatMustBeRegisteredUsingAttachEvent = { 'propertychange': true }; // Workaround for an IE9 issue - https://github.com/SteveSanderson/knockout/issues/406

    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
    // Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
    // Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
    // If there is a future need to detect specific versions of IE10+, we will amend this.
    var ieVersion = document && (function() {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        ) {}
        return version > 4 ? version : undefined;
    }());
    var isIe6 = ieVersion === 6,
        isIe7 = ieVersion === 7;

    function isClickOnCheckableElement(element, eventType) {
        if ((ko.utils.tagNameLower(element) !== "input") || !element.type) return false;
        if (eventType.toLowerCase() != "click") return false;
        var inputType = element.type;
        return (inputType == "checkbox") || (inputType == "radio");
    }

    // For details on the pattern for changing node classes
    // see: https://github.com/knockout/knockout/issues/1597
    var cssClassNameRegex = /\S+/g;

    function toggleDomNodeCssClass(node, classNames, shouldHaveClass) {
        var addOrRemoveFn;
        if (classNames) {
            if (typeof node.classList === 'object') {
                addOrRemoveFn = node.classList[shouldHaveClass ? 'add' : 'remove'];
                ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
                    addOrRemoveFn.call(node.classList, className);
                });
            } else if (typeof node.className['baseVal'] === 'string') {
                // SVG tag .classNames is an SVGAnimatedString instance
                toggleObjectClassPropertyString(node.className, 'baseVal', classNames, shouldHaveClass);
            } else {
                // node.className ought to be a string.
                toggleObjectClassPropertyString(node, 'className', classNames, shouldHaveClass);
            }
        }
    }

    function toggleObjectClassPropertyString(obj, prop, classNames, shouldHaveClass) {
        // obj/prop is either a node/'className' or a SVGAnimatedString/'baseVal'.
        var currentClassNames = obj[prop].match(cssClassNameRegex) || [];
        ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
            ko.utils.addOrRemoveItem(currentClassNames, className, shouldHaveClass);
        });
        obj[prop] = currentClassNames.join(" ");
    }

    return {
        fieldsIncludedWithJsonPost: ['authenticity_token', /^__RequestVerificationToken(_.*)?$/],

        arrayForEach: function (array, action) {
            for (var i = 0, j = array.length; i < j; i++)
                action(array[i], i);
        },

        arrayIndexOf: function (array, item) {
            if (typeof Array.prototype.indexOf == "function")
                return Array.prototype.indexOf.call(array, item);
            for (var i = 0, j = array.length; i < j; i++)
                if (array[i] === item)
                    return i;
            return -1;
        },

        arrayFirst: function (array, predicate, predicateOwner) {
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate.call(predicateOwner, array[i], i))
                    return array[i];
            return null;
        },

        arrayRemoveItem: function (array, itemToRemove) {
            var index = ko.utils.arrayIndexOf(array, itemToRemove);
            if (index > 0) {
                array.splice(index, 1);
            }
            else if (index === 0) {
                array.shift();
            }
        },

        arrayGetDistinctValues: function (array) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++) {
                if (ko.utils.arrayIndexOf(result, array[i]) < 0)
                    result.push(array[i]);
            }
            return result;
        },

        arrayMap: function (array, mapping) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                result.push(mapping(array[i], i));
            return result;
        },

        arrayFilter: function (array, predicate) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate(array[i], i))
                    result.push(array[i]);
            return result;
        },

        arrayPushAll: function (array, valuesToPush) {
            if (valuesToPush instanceof Array)
                array.push.apply(array, valuesToPush);
            else
                for (var i = 0, j = valuesToPush.length; i < j; i++)
                    array.push(valuesToPush[i]);
            return array;
        },

        addOrRemoveItem: function(array, value, included) {
            var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.peekObservable(array), value);
            if (existingEntryIndex < 0) {
                if (included)
                    array.push(value);
            } else {
                if (!included)
                    array.splice(existingEntryIndex, 1);
            }
        },

        canSetPrototype: canSetPrototype,

        extend: extend,

        setPrototypeOf: setPrototypeOf,

        setPrototypeOfOrExtend: canSetPrototype ? setPrototypeOf : extend,

        objectForEach: objectForEach,

        objectMap: function(source, mapping) {
            if (!source)
                return source;
            var target = {};
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = mapping(source[prop], prop, source);
                }
            }
            return target;
        },

        emptyDomNode: function (domNode) {
            while (domNode.firstChild) {
                ko.removeNode(domNode.firstChild);
            }
        },

        moveCleanedNodesToContainerElement: function(nodes) {
            // Ensure it's a real array, as we're about to reparent the nodes and
            // we don't want the underlying collection to change while we're doing that.
            var nodesArray = ko.utils.makeArray(nodes);
            var templateDocument = (nodesArray[0] && nodesArray[0].ownerDocument) || document;

            var container = templateDocument.createElement('div');
            for (var i = 0, j = nodesArray.length; i < j; i++) {
                container.appendChild(ko.cleanNode(nodesArray[i]));
            }
            return container;
        },

        cloneNodes: function (nodesArray, shouldCleanNodes) {
            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
                var clonedNode = nodesArray[i].cloneNode(true);
                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
            }
            return newNodesArray;
        },

        setDomNodeChildren: function (domNode, childNodes) {
            ko.utils.emptyDomNode(domNode);
            if (childNodes) {
                for (var i = 0, j = childNodes.length; i < j; i++)
                    domNode.appendChild(childNodes[i]);
            }
        },

        replaceDomNodes: function (nodeToReplaceOrNodeArray, newNodesArray) {
            var nodesToReplaceArray = nodeToReplaceOrNodeArray.nodeType ? [nodeToReplaceOrNodeArray] : nodeToReplaceOrNodeArray;
            if (nodesToReplaceArray.length > 0) {
                var insertionPoint = nodesToReplaceArray[0];
                var parent = insertionPoint.parentNode;
                for (var i = 0, j = newNodesArray.length; i < j; i++)
                    parent.insertBefore(newNodesArray[i], insertionPoint);
                for (var i = 0, j = nodesToReplaceArray.length; i < j; i++) {
                    ko.removeNode(nodesToReplaceArray[i]);
                }
            }
        },

        fixUpContinuousNodeArray: function(continuousNodeArray, parentNode) {
            // Before acting on a set of nodes that were previously outputted by a template function, we have to reconcile
            // them against what is in the DOM right now. It may be that some of the nodes have already been removed, or that
            // new nodes might have been inserted in the middle, for example by a binding. Also, there may previously have been
            // leading comment nodes (created by rewritten string-based templates) that have since been removed during binding.
            // So, this function translates the old "map" output array into its best guess of the set of current DOM nodes.
            //
            // Rules:
            //   [A] Any leading nodes that have been removed should be ignored
            //       These most likely correspond to memoization nodes that were already removed during binding
            //       See https://github.com/SteveSanderson/knockout/pull/440
            //   [B] We want to output a continuous series of nodes. So, ignore any nodes that have already been removed,
            //       and include any nodes that have been inserted among the previous collection

            if (continuousNodeArray.length) {
                // The parent node can be a virtual element; so get the real parent node
                parentNode = (parentNode.nodeType === 8 && parentNode.parentNode) || parentNode;

                // Rule [A]
                while (continuousNodeArray.length && continuousNodeArray[0].parentNode !== parentNode)
                    continuousNodeArray.splice(0, 1);

                // Rule [B]
                if (continuousNodeArray.length > 1) {
                    var current = continuousNodeArray[0], last = continuousNodeArray[continuousNodeArray.length - 1];
                    // Replace with the actual new continuous node set
                    continuousNodeArray.length = 0;
                    while (current !== last) {
                        continuousNodeArray.push(current);
                        current = current.nextSibling;
                        if (!current) // Won't happen, except if the developer has manually removed some DOM elements (then we're in an undefined scenario)
                            return;
                    }
                    continuousNodeArray.push(last);
                }
            }
            return continuousNodeArray;
        },

        setOptionNodeSelectionState: function (optionNode, isSelected) {
            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
            if (ieVersion < 7)
                optionNode.setAttribute("selected", isSelected);
            else
                optionNode.selected = isSelected;
        },

        stringTrim: function (string) {
            return string === null || string === undefined ? '' :
                string.trim ?
                    string.trim() :
                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
        },

        stringStartsWith: function (string, startsWith) {
            string = string || "";
            if (startsWith.length > string.length)
                return false;
            return string.substring(0, startsWith.length) === startsWith;
        },

        domNodeIsContainedBy: function (node, containedByNode) {
            if (node === containedByNode)
                return true;
            if (node.nodeType === 11)
                return false; // Fixes issue #1162 - can't use node.contains for document fragments on IE8
            if (containedByNode.contains)
                return containedByNode.contains(node.nodeType === 3 ? node.parentNode : node);
            if (containedByNode.compareDocumentPosition)
                return (containedByNode.compareDocumentPosition(node) & 16) == 16;
            while (node && node != containedByNode) {
                node = node.parentNode;
            }
            return !!node;
        },

        domNodeIsAttachedToDocument: function (node) {
            return ko.utils.domNodeIsContainedBy(node, node.ownerDocument.documentElement);
        },

        anyDomNodeIsAttachedToDocument: function(nodes) {
            return !!ko.utils.arrayFirst(nodes, ko.utils.domNodeIsAttachedToDocument);
        },

        tagNameLower: function(element) {
            // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
            // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
            // we don't need to do the .toLowerCase() as it will always be lower case anyway.
            return element && element.tagName && element.tagName.toLowerCase();
        },

        registerEventHandler: function (element, eventType, handler) {
            var mustUseAttachEvent = ieVersion && eventsThatMustBeRegisteredUsingAttachEvent[eventType];
            if (!mustUseAttachEvent && jQueryInstance) {
                jQueryInstance(element)['bind'](eventType, handler);
            } else if (!mustUseAttachEvent && typeof element.addEventListener == "function")
                element.addEventListener(eventType, handler, false);
            else if (typeof element.attachEvent != "undefined") {
                var attachEventHandler = function (event) { handler.call(element, event); },
                    attachEventName = "on" + eventType;
                element.attachEvent(attachEventName, attachEventHandler);

                // IE does not dispose attachEvent handlers automatically (unlike with addEventListener)
                // so to avoid leaks, we have to remove them manually. See bug #856
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    element.detachEvent(attachEventName, attachEventHandler);
                });
            } else
                throw new Error("Browser doesn't support addEventListener or attachEvent");
        },

        triggerEvent: function (element, eventType) {
            if (!(element && element.nodeType))
                throw new Error("element must be a DOM node when calling triggerEvent");

            // For click events on checkboxes and radio buttons, jQuery toggles the element checked state *after* the
            // event handler runs instead of *before*. (This was fixed in 1.9 for checkboxes but not for radio buttons.)
            // IE doesn't change the checked state when you trigger the click event using "fireEvent".
            // In both cases, we'll use the click method instead.
            var useClickWorkaround = isClickOnCheckableElement(element, eventType);

            if (jQueryInstance && !useClickWorkaround) {
                jQueryInstance(element)['trigger'](eventType);
            } else if (typeof document.createEvent == "function") {
                if (typeof element.dispatchEvent == "function") {
                    var eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
                    var event = document.createEvent(eventCategory);
                    event.initEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
                    element.dispatchEvent(event);
                }
                else
                    throw new Error("The supplied element doesn't support dispatchEvent");
            } else if (useClickWorkaround && element.click) {
                element.click();
            } else if (typeof element.fireEvent != "undefined") {
                element.fireEvent("on" + eventType);
            } else {
                throw new Error("Browser doesn't support triggering events");
            }
        },

        unwrapObservable: function (value) {
            return ko.isObservable(value) ? value() : value;
        },

        peekObservable: function (value) {
            return ko.isObservable(value) ? value.peek() : value;
        },

        toggleDomNodeCssClass: toggleDomNodeCssClass,

        setTextContent: function(element, textContent) {
            var value = ko.utils.unwrapObservable(textContent);
            if ((value === null) || (value === undefined))
                value = "";

            // We need there to be exactly one child: a text node.
            // If there are no children, more than one, or if it's not a text node,
            // we'll clear everything and create a single text node.
            var innerTextNode = ko.virtualElements.firstChild(element);
            if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
                ko.virtualElements.setDomNodeChildren(element, [element.ownerDocument.createTextNode(value)]);
            } else {
                innerTextNode.data = value;
            }

            ko.utils.forceRefresh(element);
        },

        setElementName: function(element, name) {
            element.name = name;

            // Workaround IE 6/7 issue
            // - https://github.com/SteveSanderson/knockout/issues/197
            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
            if (ieVersion <= 7) {
                try {
                    element.mergeAttributes(document.createElement("<input name='" + element.name + "'/>"), false);
                }
                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
            }
        },

        forceRefresh: function(node) {
            // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
            if (ieVersion >= 9) {
                // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
                var elem = node.nodeType == 1 ? node : node.parentNode;
                if (elem.style)
                    elem.style.zoom = elem.style.zoom;
            }
        },

        ensureSelectElementIsRenderedCorrectly: function(selectElement) {
            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
            // Also fixes IE7 and IE8 bug that causes selects to be zero width if enclosed by 'if' or 'with'. (See issue #839)
            if (ieVersion) {
                var originalWidth = selectElement.style.width;
                selectElement.style.width = 0;
                selectElement.style.width = originalWidth;
            }
        },

        range: function (min, max) {
            min = ko.utils.unwrapObservable(min);
            max = ko.utils.unwrapObservable(max);
            var result = [];
            for (var i = min; i <= max; i++)
                result.push(i);
            return result;
        },

        makeArray: function(arrayLikeObject) {
            var result = [];
            for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
                result.push(arrayLikeObject[i]);
            };
            return result;
        },

        isIe6 : isIe6,
        isIe7 : isIe7,
        ieVersion : ieVersion,

        getFormFields: function(form, fieldName) {
            var fields = ko.utils.makeArray(form.getElementsByTagName("input")).concat(ko.utils.makeArray(form.getElementsByTagName("textarea")));
            var isMatchingField = (typeof fieldName == 'string')
                ? function(field) { return field.name === fieldName }
                : function(field) { return fieldName.test(field.name) }; // Treat fieldName as regex or object containing predicate
            var matches = [];
            for (var i = fields.length - 1; i >= 0; i--) {
                if (isMatchingField(fields[i]))
                    matches.push(fields[i]);
            };
            return matches;
        },

        parseJson: function (jsonString) {
            if (typeof jsonString == "string") {
                jsonString = ko.utils.stringTrim(jsonString);
                if (jsonString) {
                    if (JSON && JSON.parse) // Use native parsing where available
                        return JSON.parse(jsonString);
                    return (new Function("return " + jsonString))(); // Fallback on less safe parsing for older browsers
                }
            }
            return null;
        },

        stringifyJson: function (data, replacer, space) {   // replacer and space are optional
            if (!JSON || !JSON.stringify)
                throw new Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
            return JSON.stringify(ko.utils.unwrapObservable(data), replacer, space);
        },

        postJson: function (urlOrForm, data, options) {
            options = options || {};
            var params = options['params'] || {};
            var includeFields = options['includeFields'] || this.fieldsIncludedWithJsonPost;
            var url = urlOrForm;

            // If we were given a form, use its 'action' URL and pick out any requested field values
            if((typeof urlOrForm == 'object') && (ko.utils.tagNameLower(urlOrForm) === "form")) {
                var originalForm = urlOrForm;
                url = originalForm.action;
                for (var i = includeFields.length - 1; i >= 0; i--) {
                    var fields = ko.utils.getFormFields(originalForm, includeFields[i]);
                    for (var j = fields.length - 1; j >= 0; j--)
                        params[fields[j].name] = fields[j].value;
                }
            }

            data = ko.utils.unwrapObservable(data);
            var form = document.createElement("form");
            form.style.display = "none";
            form.action = url;
            form.method = "post";
            for (var key in data) {
                // Since 'data' this is a model object, we include all properties including those inherited from its prototype
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = ko.utils.stringifyJson(ko.utils.unwrapObservable(data[key]));
                form.appendChild(input);
            }
            objectForEach(params, function(key, value) {
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            options['submitter'] ? options['submitter'](form) : form.submit();
            setTimeout(function () { form.parentNode.removeChild(form); }, 0);
        }
    }
}());

ko.exportSymbol('utils', ko.utils);
ko.exportSymbol('utils.arrayForEach', ko.utils.arrayForEach);
ko.exportSymbol('utils.arrayFirst', ko.utils.arrayFirst);
ko.exportSymbol('utils.arrayFilter', ko.utils.arrayFilter);
ko.exportSymbol('utils.arrayGetDistinctValues', ko.utils.arrayGetDistinctValues);
ko.exportSymbol('utils.arrayIndexOf', ko.utils.arrayIndexOf);
ko.exportSymbol('utils.arrayMap', ko.utils.arrayMap);
ko.exportSymbol('utils.arrayPushAll', ko.utils.arrayPushAll);
ko.exportSymbol('utils.arrayRemoveItem', ko.utils.arrayRemoveItem);
ko.exportSymbol('utils.extend', ko.utils.extend);
ko.exportSymbol('utils.fieldsIncludedWithJsonPost', ko.utils.fieldsIncludedWithJsonPost);
ko.exportSymbol('utils.getFormFields', ko.utils.getFormFields);
ko.exportSymbol('utils.peekObservable', ko.utils.peekObservable);
ko.exportSymbol('utils.postJson', ko.utils.postJson);
ko.exportSymbol('utils.parseJson', ko.utils.parseJson);
ko.exportSymbol('utils.registerEventHandler', ko.utils.registerEventHandler);
ko.exportSymbol('utils.stringifyJson', ko.utils.stringifyJson);
ko.exportSymbol('utils.range', ko.utils.range);
ko.exportSymbol('utils.toggleDomNodeCssClass', ko.utils.toggleDomNodeCssClass);
ko.exportSymbol('utils.triggerEvent', ko.utils.triggerEvent);
ko.exportSymbol('utils.unwrapObservable', ko.utils.unwrapObservable);
ko.exportSymbol('utils.objectForEach', ko.utils.objectForEach);
ko.exportSymbol('utils.addOrRemoveItem', ko.utils.addOrRemoveItem);
ko.exportSymbol('utils.setTextContent', ko.utils.setTextContent);
ko.exportSymbol('unwrap', ko.utils.unwrapObservable); // Convenient shorthand, because this is used so commonly

if (!Function.prototype['bind']) {
    // Function.prototype.bind is a standard part of ECMAScript 5th Edition (December 2009, http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)
    // In case the browser doesn't implement it natively, provide a JavaScript implementation. This implementation is based on the one in prototype.js
    Function.prototype['bind'] = function (object) {
        var originalFunction = this;
        if (arguments.length === 1) {
            return function () {
                return originalFunction.apply(object, arguments);
            };
        } else {
            var partialArgs = Array.prototype.slice.call(arguments, 1);
            return function () {
                var args = partialArgs.slice(0);
                args.push.apply(args, arguments);
                return originalFunction.apply(object, args);
            };
        }
    };
}

ko.utils.domData = new (function () {
    var uniqueId = 0;
    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
    var dataStore = {};

    function getAll(node, createIfNotFound) {
        var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
        var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
        if (!hasExistingDataStore) {
            if (!createIfNotFound)
                return undefined;
            dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
            dataStore[dataStoreKey] = {};
        }
        return dataStore[dataStoreKey];
    }

    return {
        get: function (node, key) {
            var allDataForNode = getAll(node, false);
            return allDataForNode === undefined ? undefined : allDataForNode[key];
        },
        set: function (node, key, value) {
            if (value === undefined) {
                // Make sure we don't actually create a new domData key if we are actually deleting a value
                if (getAll(node, false) === undefined)
                    return;
            }
            var allDataForNode = getAll(node, true);
            allDataForNode[key] = value;
        },
        clear: function (node) {
            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
            if (dataStoreKey) {
                delete dataStore[dataStoreKey];
                node[dataStoreKeyExpandoPropertyName] = null;
                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
            }
            return false;
        },

        nextKey: function () {
            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
        }
    };
})();

ko.exportSymbol('utils.domData', ko.utils.domData);
ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully

ko.utils.domNodeDisposal = new (function () {
    var domDataKey = ko.utils.domData.nextKey();
    var cleanableNodeTypes = { 1: true, 8: true, 9: true };       // Element, Comment, Document
    var cleanableNodeTypesWithDescendants = { 1: true, 9: true }; // Element, Document

    function getDisposeCallbacksCollection(node, createIfNotFound) {
        var allDisposeCallbacks = ko.utils.domData.get(node, domDataKey);
        if ((allDisposeCallbacks === undefined) && createIfNotFound) {
            allDisposeCallbacks = [];
            ko.utils.domData.set(node, domDataKey, allDisposeCallbacks);
        }
        return allDisposeCallbacks;
    }
    function destroyCallbacksCollection(node) {
        ko.utils.domData.set(node, domDataKey, undefined);
    }

    function cleanSingleNode(node) {
        // Run all the dispose callbacks
        var callbacks = getDisposeCallbacksCollection(node, false);
        if (callbacks) {
            callbacks = callbacks.slice(0); // Clone, as the array may be modified during iteration (typically, callbacks will remove themselves)
            for (var i = 0; i < callbacks.length; i++)
                callbacks[i](node);
        }

        // Erase the DOM data
        ko.utils.domData.clear(node);

        // Perform cleanup needed by external libraries (currently only jQuery, but can be extended)
        ko.utils.domNodeDisposal["cleanExternalData"](node);

        // Clear any immediate-child comment nodes, as these wouldn't have been found by
        // node.getElementsByTagName("*") in cleanNode() (comment nodes aren't elements)
        if (cleanableNodeTypesWithDescendants[node.nodeType])
            cleanImmediateCommentTypeChildren(node);
    }

    function cleanImmediateCommentTypeChildren(nodeWithChildren) {
        var child, nextChild = nodeWithChildren.firstChild;
        while (child = nextChild) {
            nextChild = child.nextSibling;
            if (child.nodeType === 8)
                cleanSingleNode(child);
        }
    }

    return {
        addDisposeCallback : function(node, callback) {
            if (typeof callback != "function")
                throw new Error("Callback must be a function");
            getDisposeCallbacksCollection(node, true).push(callback);
        },

        removeDisposeCallback : function(node, callback) {
            var callbacksCollection = getDisposeCallbacksCollection(node, false);
            if (callbacksCollection) {
                ko.utils.arrayRemoveItem(callbacksCollection, callback);
                if (callbacksCollection.length == 0)
                    destroyCallbacksCollection(node);
            }
        },

        cleanNode : function(node) {
            // First clean this node, where applicable
            if (cleanableNodeTypes[node.nodeType]) {
                cleanSingleNode(node);

                // ... then its descendants, where applicable
                if (cleanableNodeTypesWithDescendants[node.nodeType]) {
                    // Clone the descendants list in case it changes during iteration
                    var descendants = [];
                    ko.utils.arrayPushAll(descendants, node.getElementsByTagName("*"));
                    for (var i = 0, j = descendants.length; i < j; i++)
                        cleanSingleNode(descendants[i]);
                }
            }
            return node;
        },

        removeNode : function(node) {
            ko.cleanNode(node);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        },

        "cleanExternalData" : function (node) {
            // Special support for jQuery here because it's so commonly used.
            // Many jQuery plugins (including jquery.tmpl) store data using jQuery's equivalent of domData
            // so notify it to tear down any resources associated with the node & descendants here.
            if (jQueryInstance && (typeof jQueryInstance['cleanData'] == "function"))
                jQueryInstance['cleanData']([node]);
        }
    };
})();
ko.cleanNode = ko.utils.domNodeDisposal.cleanNode; // Shorthand name for convenience
ko.removeNode = ko.utils.domNodeDisposal.removeNode; // Shorthand name for convenience
ko.exportSymbol('cleanNode', ko.cleanNode);
ko.exportSymbol('removeNode', ko.removeNode);
ko.exportSymbol('utils.domNodeDisposal', ko.utils.domNodeDisposal);
ko.exportSymbol('utils.domNodeDisposal.addDisposeCallback', ko.utils.domNodeDisposal.addDisposeCallback);
ko.exportSymbol('utils.domNodeDisposal.removeDisposeCallback', ko.utils.domNodeDisposal.removeDisposeCallback);
(function () {
    var leadingCommentRegex = /^(\s*)<!--(.*?)-->/;

    function simpleHtmlParse(html, documentContext) {
        documentContext || (documentContext = document);
        var windowContext = documentContext['parentWindow'] || documentContext['defaultView'] || window;

        // Based on jQuery's "clean" function, but only accounting for table-related elements.
        // If you have referenced jQuery, this won't be used anyway - KO will use jQuery's "clean" function directly

        // Note that there's still an issue in IE < 9 whereby it will discard comment nodes that are the first child of
        // a descendant node. For example: "<div><!-- mycomment -->abc</div>" will get parsed as "<div>abc</div>"
        // This won't affect anyone who has referenced jQuery, and there's always the workaround of inserting a dummy node
        // (possibly a text node) in front of the comment. So, KO does not attempt to workaround this IE issue automatically at present.

        // Trim whitespace, otherwise indexOf won't work as expected
        var tags = ko.utils.stringTrim(html).toLowerCase(), div = documentContext.createElement("div");

        // Finds the first match from the left column, and returns the corresponding "wrap" data from the right column
        var wrap = tags.match(/^<(thead|tbody|tfoot)/)              && [1, "<table>", "</table>"] ||
                   !tags.indexOf("<tr")                             && [2, "<table><tbody>", "</tbody></table>"] ||
                   (!tags.indexOf("<td") || !tags.indexOf("<th"))   && [3, "<table><tbody><tr>", "</tr></tbody></table>"] ||
                   /* anything else */                                 [0, "", ""];

        // Go to html and back, then peel off extra wrappers
        // Note that we always prefix with some dummy text, because otherwise, IE<9 will strip out leading comment nodes in descendants. Total madness.
        var markup = "ignored<div>" + wrap[1] + html + wrap[2] + "</div>";
        if (typeof windowContext['innerShiv'] == "function") {
            div.appendChild(windowContext['innerShiv'](markup));
        } else {
            div.innerHTML = markup;
        }

        // Move to the right depth
        while (wrap[0]--)
            div = div.lastChild;

        return ko.utils.makeArray(div.lastChild.childNodes);
    }

    function jQueryHtmlParse(html, documentContext) {
        // jQuery's "parseHTML" function was introduced in jQuery 1.8.0 and is a documented public API.
        if (jQueryInstance['parseHTML']) {
            return jQueryInstance['parseHTML'](html, documentContext) || []; // Ensure we always return an array and never null
        } else {
            // For jQuery < 1.8.0, we fall back on the undocumented internal "clean" function.
            var elems = jQueryInstance['clean']([html], documentContext);

            // As of jQuery 1.7.1, jQuery parses the HTML by appending it to some dummy parent nodes held in an in-memory document fragment.
            // Unfortunately, it never clears the dummy parent nodes from the document fragment, so it leaks memory over time.
            // Fix this by finding the top-most dummy parent element, and detaching it from its owner fragment.
            if (elems && elems[0]) {
                // Find the top-most parent element that's a direct child of a document fragment
                var elem = elems[0];
                while (elem.parentNode && elem.parentNode.nodeType !== 11 /* i.e., DocumentFragment */)
                    elem = elem.parentNode;
                // ... then detach it
                if (elem.parentNode)
                    elem.parentNode.removeChild(elem);
            }

            return elems;
        }
    }

    ko.utils.parseHtmlFragment = function(html, documentContext) {
        return jQueryInstance ? jQueryHtmlParse(html, documentContext)   // As below, benefit from jQuery's optimisations where possible
                              : simpleHtmlParse(html, documentContext);  // ... otherwise, this simple logic will do in most common cases.
    };

    ko.utils.setHtml = function(node, html) {
        ko.utils.emptyDomNode(node);

        // There's no legitimate reason to display a stringified observable without unwrapping it, so we'll unwrap it
        html = ko.utils.unwrapObservable(html);

        if ((html !== null) && (html !== undefined)) {
            if (typeof html != 'string')
                html = html.toString();

            // jQuery contains a lot of sophisticated code to parse arbitrary HTML fragments,
            // for example <tr> elements which are not normally allowed to exist on their own.
            // If you've referenced jQuery we'll use that rather than duplicating its code.
            if (jQueryInstance) {
                jQueryInstance(node)['html'](html);
            } else {
                // ... otherwise, use KO's own parsing logic.
                var parsedNodes = ko.utils.parseHtmlFragment(html, node.ownerDocument);
                for (var i = 0; i < parsedNodes.length; i++)
                    node.appendChild(parsedNodes[i]);
            }
        }
    };
})();

ko.exportSymbol('utils.parseHtmlFragment', ko.utils.parseHtmlFragment);
ko.exportSymbol('utils.setHtml', ko.utils.setHtml);

ko.memoization = (function () {
    var memos = {};

    function randomMax8HexChars() {
        return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
    }
    function generateRandomId() {
        return randomMax8HexChars() + randomMax8HexChars();
    }
    function findMemoNodes(rootNode, appendToArray) {
        if (!rootNode)
            return;
        if (rootNode.nodeType == 8) {
            var memoId = ko.memoization.parseMemoText(rootNode.nodeValue);
            if (memoId != null)
                appendToArray.push({ domNode: rootNode, memoId: memoId });
        } else if (rootNode.nodeType == 1) {
            for (var i = 0, childNodes = rootNode.childNodes, j = childNodes.length; i < j; i++)
                findMemoNodes(childNodes[i], appendToArray);
        }
    }

    return {
        memoize: function (callback) {
            if (typeof callback != "function")
                throw new Error("You can only pass a function to ko.memoization.memoize()");
            var memoId = generateRandomId();
            memos[memoId] = callback;
            return "<!--[ko_memo:" + memoId + "]-->";
        },

        unmemoize: function (memoId, callbackParams) {
            var callback = memos[memoId];
            if (callback === undefined)
                throw new Error("Couldn't find any memo with ID " + memoId + ". Perhaps it's already been unmemoized.");
            try {
                callback.apply(null, callbackParams || []);
                return true;
            }
            finally { delete memos[memoId]; }
        },

        unmemoizeDomNodeAndDescendants: function (domNode, extraCallbackParamsArray) {
            var memos = [];
            findMemoNodes(domNode, memos);
            for (var i = 0, j = memos.length; i < j; i++) {
                var node = memos[i].domNode;
                var combinedParams = [node];
                if (extraCallbackParamsArray)
                    ko.utils.arrayPushAll(combinedParams, extraCallbackParamsArray);
                ko.memoization.unmemoize(memos[i].memoId, combinedParams);
                node.nodeValue = ""; // Neuter this node so we don't try to unmemoize it again
                if (node.parentNode)
                    node.parentNode.removeChild(node); // If possible, erase it totally (not always possible - someone else might just hold a reference to it then call unmemoizeDomNodeAndDescendants again)
            }
        },

        parseMemoText: function (memoText) {
            var match = memoText.match(/^\[ko_memo\:(.*?)\]$/);
            return match ? match[1] : null;
        }
    };
})();

ko.exportSymbol('memoization', ko.memoization);
ko.exportSymbol('memoization.memoize', ko.memoization.memoize);
ko.exportSymbol('memoization.unmemoize', ko.memoization.unmemoize);
ko.exportSymbol('memoization.parseMemoText', ko.memoization.parseMemoText);
ko.exportSymbol('memoization.unmemoizeDomNodeAndDescendants', ko.memoization.unmemoizeDomNodeAndDescendants);
ko.extenders = {
    'throttle': function(target, timeout) {
        // Throttling means two things:

        // (1) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
        //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
        target['throttleEvaluation'] = timeout;

        // (2) For writable targets (observables, or writable dependent observables), we throttle *writes*
        //     so the target cannot change value synchronously or faster than a certain rate
        var writeTimeoutInstance = null;
        return ko.dependentObservable({
            'read': target,
            'write': function(value) {
                clearTimeout(writeTimeoutInstance);
                writeTimeoutInstance = setTimeout(function() {
                    target(value);
                }, timeout);
            }
        });
    },

    'rateLimit': function(target, options) {
        var timeout, method, limitFunction;

        if (typeof options == 'number') {
            timeout = options;
        } else {
            timeout = options['timeout'];
            method = options['method'];
        }

        limitFunction = method == 'notifyWhenChangesStop' ?  debounce : throttle;
        target.limit(function(callback) {
            return limitFunction(callback, timeout);
        });
    },

    'notify': function(target, notifyWhen) {
        target["equalityComparer"] = notifyWhen == "always" ?
            null :  // null equalityComparer means to always notify
            valuesArePrimitiveAndEqual;
    }
};

var primitiveTypes = { 'undefined':1, 'boolean':1, 'number':1, 'string':1 };
function valuesArePrimitiveAndEqual(a, b) {
    var oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
    return oldValueIsPrimitive ? (a === b) : false;
}

function throttle(callback, timeout) {
    var timeoutInstance;
    return function () {
        if (!timeoutInstance) {
            timeoutInstance = setTimeout(function() {
                timeoutInstance = undefined;
                callback();
            }, timeout);
        }
    };
}

function debounce(callback, timeout) {
    var timeoutInstance;
    return function () {
        clearTimeout(timeoutInstance);
        timeoutInstance = setTimeout(callback, timeout);
    };
}

function applyExtenders(requestedExtenders) {
    var target = this;
    if (requestedExtenders) {
        ko.utils.objectForEach(requestedExtenders, function(key, value) {
            var extenderHandler = ko.extenders[key];
            if (typeof extenderHandler == 'function') {
                target = extenderHandler(target, value) || target;
            }
        });
    }
    return target;
}

ko.exportSymbol('extenders', ko.extenders);

ko.subscription = function (target, callback, disposeCallback) {
    this._target = target;
    this.callback = callback;
    this.disposeCallback = disposeCallback;
    this.isDisposed = false;
    ko.exportProperty(this, 'dispose', this.dispose);
};
ko.subscription.prototype.dispose = function () {
    this.isDisposed = true;
    this.disposeCallback();
};

ko.subscribable = function () {
    ko.utils.setPrototypeOfOrExtend(this, ko.subscribable['fn']);
    this._subscriptions = {};
    this._versionNumber = 1;
}

var defaultEvent = "change";

var ko_subscribable_fn = {
    subscribe: function (callback, callbackTarget, event) {
        var self = this;

        event = event || defaultEvent;
        var boundCallback = callbackTarget ? callback.bind(callbackTarget) : callback;

        var subscription = new ko.subscription(self, boundCallback, function () {
            ko.utils.arrayRemoveItem(self._subscriptions[event], subscription);
            if (self.afterSubscriptionRemove)
                self.afterSubscriptionRemove(event);
        });

        if (self.beforeSubscriptionAdd)
            self.beforeSubscriptionAdd(event);

        if (!self._subscriptions[event])
            self._subscriptions[event] = [];
        self._subscriptions[event].push(subscription);

        return subscription;
    },

    "notifySubscribers": function (valueToNotify, event) {
        event = event || defaultEvent;
        if (event === defaultEvent) {
            this.updateVersion();
        }
        if (this.hasSubscriptionsForEvent(event)) {
            try {
                ko.dependencyDetection.begin(); // Begin suppressing dependency detection (by setting the top frame to undefined)
                for (var a = this._subscriptions[event].slice(0), i = 0, subscription; subscription = a[i]; ++i) {
                    // In case a subscription was disposed during the arrayForEach cycle, check
                    // for isDisposed on each subscription before invoking its callback
                    if (!subscription.isDisposed)
                        subscription.callback(valueToNotify);
                }
            } finally {
                ko.dependencyDetection.end(); // End suppressing dependency detection
            }
        }
    },

    getVersion: function () {
        return this._versionNumber;
    },

    hasChanged: function (versionToCheck) {
        return this.getVersion() !== versionToCheck;
    },

    updateVersion: function () {
        ++this._versionNumber;
    },

    limit: function(limitFunction) {
        var self = this, selfIsObservable = ko.isObservable(self),
            isPending, previousValue, pendingValue, beforeChange = 'beforeChange';

        if (!self._origNotifySubscribers) {
            self._origNotifySubscribers = self["notifySubscribers"];
            self["notifySubscribers"] = function(value, event) {
                if (!event || event === defaultEvent) {
                    self._rateLimitedChange(value);
                } else if (event === beforeChange) {
                    self._rateLimitedBeforeChange(value);
                } else {
                    self._origNotifySubscribers(value, event);
                }
            };
        }

        var finish = limitFunction(function() {
            // If an observable provided a reference to itself, access it to get the latest value.
            // This allows computed observables to delay calculating their value until needed.
            if (selfIsObservable && pendingValue === self) {
                pendingValue = self();
            }
            isPending = false;
            if (self.isDifferent(previousValue, pendingValue)) {
                self._origNotifySubscribers(previousValue = pendingValue);
            }
        });

        self._rateLimitedChange = function(value) {
            isPending = true;
            pendingValue = value;
            finish();
        };
        self._rateLimitedBeforeChange = function(value) {
            if (!isPending) {
                previousValue = value;
                self._origNotifySubscribers(value, beforeChange);
            }
        };
    },

    hasSubscriptionsForEvent: function(event) {
        return this._subscriptions[event] && this._subscriptions[event].length;
    },

    getSubscriptionsCount: function (event) {
        if (event) {
            return this._subscriptions[event] && this._subscriptions[event].length || 0;
        } else {
            var total = 0;
            ko.utils.objectForEach(this._subscriptions, function(eventName, subscriptions) {
                total += subscriptions.length;
            });
            return total;
        }
    },

    isDifferent: function(oldValue, newValue) {
        return !this['equalityComparer'] || !this['equalityComparer'](oldValue, newValue);
    },

    extend: applyExtenders
};

ko.exportProperty(ko_subscribable_fn, 'subscribe', ko_subscribable_fn.subscribe);
ko.exportProperty(ko_subscribable_fn, 'extend', ko_subscribable_fn.extend);
ko.exportProperty(ko_subscribable_fn, 'getSubscriptionsCount', ko_subscribable_fn.getSubscriptionsCount);

// For browsers that support proto assignment, we overwrite the prototype of each
// observable instance. Since observables are functions, we need Function.prototype
// to still be in the prototype chain.
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko_subscribable_fn, Function.prototype);
}

ko.subscribable['fn'] = ko_subscribable_fn;


ko.isSubscribable = function (instance) {
    return instance != null && typeof instance.subscribe == "function" && typeof instance["notifySubscribers"] == "function";
};

ko.exportSymbol('subscribable', ko.subscribable);
ko.exportSymbol('isSubscribable', ko.isSubscribable);

ko.computedContext = ko.dependencyDetection = (function () {
    var outerFrames = [],
        currentFrame,
        lastId = 0;

    // Return a unique ID that can be assigned to an observable for dependency tracking.
    // Theoretically, you could eventually overflow the number storage size, resulting
    // in duplicate IDs. But in JavaScript, the largest exact integral value is 2^53
    // or 9,007,199,254,740,992. If you created 1,000,000 IDs per second, it would
    // take over 285 years to reach that number.
    // Reference http://blog.vjeux.com/2010/javascript/javascript-max_int-number-limits.html
    function getId() {
        return ++lastId;
    }

    function begin(options) {
        outerFrames.push(currentFrame);
        currentFrame = options;
    }

    function end() {
        currentFrame = outerFrames.pop();
    }

    return {
        begin: begin,

        end: end,

        registerDependency: function (subscribable) {
            if (currentFrame) {
                if (!ko.isSubscribable(subscribable))
                    throw new Error("Only subscribable things can act as dependencies");
                currentFrame.callback(subscribable, subscribable._id || (subscribable._id = getId()));
            }
        },

        ignore: function (callback, callbackTarget, callbackArgs) {
            try {
                begin();
                return callback.apply(callbackTarget, callbackArgs || []);
            } finally {
                end();
            }
        },

        getDependenciesCount: function () {
            if (currentFrame)
                return currentFrame.computed.getDependenciesCount();
        },

        isInitial: function() {
            if (currentFrame)
                return currentFrame.isInitial;
        }
    };
})();

ko.exportSymbol('computedContext', ko.computedContext);
ko.exportSymbol('computedContext.getDependenciesCount', ko.computedContext.getDependenciesCount);
ko.exportSymbol('computedContext.isInitial', ko.computedContext.isInitial);
ko.exportSymbol('computedContext.isSleeping', ko.computedContext.isSleeping);

ko.exportSymbol('ignoreDependencies', ko.ignoreDependencies = ko.dependencyDetection.ignore);
ko.observable = function (initialValue) {
    var _latestValue = initialValue;

    function observable() {
        if (arguments.length > 0) {
            // Write

            // Ignore writes if the value hasn't changed
            if (observable.isDifferent(_latestValue, arguments[0])) {
                observable.valueWillMutate();
                _latestValue = arguments[0];
                if (DEBUG) observable._latestValue = _latestValue;
                observable.valueHasMutated();
            }
            return this; // Permits chained assignments
        }
        else {
            // Read
            ko.dependencyDetection.registerDependency(observable); // The caller only needs to be notified of changes if they did a "read" operation
            return _latestValue;
        }
    }
    ko.subscribable.call(observable);
    ko.utils.setPrototypeOfOrExtend(observable, ko.observable['fn']);

    if (DEBUG) observable._latestValue = _latestValue;
    observable.peek = function() { return _latestValue };
    observable.valueHasMutated = function () { observable["notifySubscribers"](_latestValue); }
    observable.valueWillMutate = function () { observable["notifySubscribers"](_latestValue, "beforeChange"); }

    ko.exportProperty(observable, 'peek', observable.peek);
    ko.exportProperty(observable, "valueHasMutated", observable.valueHasMutated);
    ko.exportProperty(observable, "valueWillMutate", observable.valueWillMutate);

    return observable;
}

ko.observable['fn'] = {
    "equalityComparer": valuesArePrimitiveAndEqual
};

var protoProperty = ko.observable.protoProperty = "__ko_proto__";
ko.observable['fn'][protoProperty] = ko.observable;

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.observable constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko.observable['fn'], ko.subscribable['fn']);
}

ko.hasPrototype = function(instance, prototype) {
    if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
    if (instance[protoProperty] === prototype) return true;
    return ko.hasPrototype(instance[protoProperty], prototype); // Walk the prototype chain
};

ko.isObservable = function (instance) {
    return ko.hasPrototype(instance, ko.observable);
}
ko.isWriteableObservable = function (instance) {
    // Observable
    if ((typeof instance == "function") && instance[protoProperty] === ko.observable)
        return true;
    // Writeable dependent observable
    if ((typeof instance == "function") && (instance[protoProperty] === ko.dependentObservable) && (instance.hasWriteFunction))
        return true;
    // Anything else
    return false;
}


ko.exportSymbol('observable', ko.observable);
ko.exportSymbol('isObservable', ko.isObservable);
ko.exportSymbol('isWriteableObservable', ko.isWriteableObservable);
ko.exportSymbol('isWritableObservable', ko.isWriteableObservable);
ko.observableArray = function (initialValues) {
    initialValues = initialValues || [];

    if (typeof initialValues != 'object' || !('length' in initialValues))
        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

    var result = ko.observable(initialValues);
    ko.utils.setPrototypeOfOrExtend(result, ko.observableArray['fn']);
    return result.extend({'trackArrayChanges':true});
};

ko.observableArray['fn'] = {
    'remove': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var removedValues = [];
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        for (var i = 0; i < underlyingArray.length; i++) {
            var value = underlyingArray[i];
            if (predicate(value)) {
                if (removedValues.length === 0) {
                    this.valueWillMutate();
                }
                removedValues.push(value);
                underlyingArray.splice(i, 1);
                i--;
            }
        }
        if (removedValues.length) {
            this.valueHasMutated();
        }
        return removedValues;
    },

    'removeAll': function (arrayOfValues) {
        // If you passed zero args, we remove everything
        if (arrayOfValues === undefined) {
            var underlyingArray = this.peek();
            var allValues = underlyingArray.slice(0);
            this.valueWillMutate();
            underlyingArray.splice(0, underlyingArray.length);
            this.valueHasMutated();
            return allValues;
        }
        // If you passed an arg, we interpret it as an array of entries to remove
        if (!arrayOfValues)
            return [];
        return this['remove'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'destroy': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        this.valueWillMutate();
        for (var i = underlyingArray.length - 1; i >= 0; i--) {
            var value = underlyingArray[i];
            if (predicate(value))
                underlyingArray[i]["_destroy"] = true;
        }
        this.valueHasMutated();
    },

    'destroyAll': function (arrayOfValues) {
        // If you passed zero args, we destroy everything
        if (arrayOfValues === undefined)
            return this['destroy'](function() { return true });

        // If you passed an arg, we interpret it as an array of entries to destroy
        if (!arrayOfValues)
            return [];
        return this['destroy'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'indexOf': function (item) {
        var underlyingArray = this();
        return ko.utils.arrayIndexOf(underlyingArray, item);
    },

    'replace': function(oldItem, newItem) {
        var index = this['indexOf'](oldItem);
        if (index >= 0) {
            this.valueWillMutate();
            this.peek()[index] = newItem;
            this.valueHasMutated();
        }
    }
};

// Populate ko.observableArray.fn with read/write functions from native arrays
// Important: Do not add any additional functions here that may reasonably be used to *read* data from the array
// because we'll eval them without causing subscriptions, so ko.computed output could end up getting stale
ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
        // (for consistency with mutating regular observables)
        var underlyingArray = this.peek();
        this.valueWillMutate();
        this.cacheDiffForKnownOperation(underlyingArray, methodName, arguments);
        var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
        this.valueHasMutated();
        return methodCallResult;
    };
});

// Populate ko.observableArray.fn with read-only functions from native arrays
ko.utils.arrayForEach(["slice"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        var underlyingArray = this();
        return underlyingArray[methodName].apply(underlyingArray, arguments);
    };
});

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.observableArray constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko.observableArray['fn'], ko.observable['fn']);
}

ko.exportSymbol('observableArray', ko.observableArray);
var arrayChangeEventName = 'arrayChange';
ko.extenders['trackArrayChanges'] = function(target) {
    // Only modify the target observable once
    if (target.cacheDiffForKnownOperation) {
        return;
    }
    var trackingChanges = false,
        cachedDiff = null,
        arrayChangeSubscription,
        pendingNotifications = 0,
        underlyingBeforeSubscriptionAddFunction = target.beforeSubscriptionAdd,
        underlyingAfterSubscriptionRemoveFunction = target.afterSubscriptionRemove;

    // Watch "subscribe" calls, and for array change events, ensure change tracking is enabled
    target.beforeSubscriptionAdd = function (event) {
        if (underlyingBeforeSubscriptionAddFunction)
            underlyingBeforeSubscriptionAddFunction.call(target, event);
        if (event === arrayChangeEventName) {
            trackChanges();
        }
    };
    // Watch "dispose" calls, and for array change events, ensure change tracking is disabled when all are disposed
    target.afterSubscriptionRemove = function (event) {
        if (underlyingAfterSubscriptionRemoveFunction)
            underlyingAfterSubscriptionRemoveFunction.call(target, event);
        if (event === arrayChangeEventName && !target.hasSubscriptionsForEvent(arrayChangeEventName)) {
            arrayChangeSubscription.dispose();
            trackingChanges = false;
        }
    };

    function trackChanges() {
        // Calling 'trackChanges' multiple times is the same as calling it once
        if (trackingChanges) {
            return;
        }

        trackingChanges = true;

        // Intercept "notifySubscribers" to track how many times it was called.
        var underlyingNotifySubscribersFunction = target['notifySubscribers'];
        target['notifySubscribers'] = function(valueToNotify, event) {
            if (!event || event === defaultEvent) {
                ++pendingNotifications;
            }
            return underlyingNotifySubscribersFunction.apply(this, arguments);
        };

        // Each time the array changes value, capture a clone so that on the next
        // change it's possible to produce a diff
        var previousContents = [].concat(target.peek() || []);
        cachedDiff = null;
        arrayChangeSubscription = target.subscribe(function(currentContents) {
            // Make a copy of the current contents and ensure it's an array
            currentContents = [].concat(currentContents || []);

            // Compute the diff and issue notifications, but only if someone is listening
            if (target.hasSubscriptionsForEvent(arrayChangeEventName)) {
                var changes = getChanges(previousContents, currentContents);
            }

            // Eliminate references to the old, removed items, so they can be GCed
            previousContents = currentContents;
            cachedDiff = null;
            pendingNotifications = 0;

            if (changes && changes.length) {
                target['notifySubscribers'](changes, arrayChangeEventName);
            }
        });
    }

    function getChanges(previousContents, currentContents) {
        // We try to re-use cached diffs.
        // The scenarios where pendingNotifications > 1 are when using rate-limiting or the Deferred Updates
        // plugin, which without this check would not be compatible with arrayChange notifications. Normally,
        // notifications are issued immediately so we wouldn't be queueing up more than one.
        if (!cachedDiff || pendingNotifications > 1) {
            cachedDiff = ko.utils.compareArrays(previousContents, currentContents, { 'sparse': true });
        }

        return cachedDiff;
    }

    target.cacheDiffForKnownOperation = function(rawArray, operationName, args) {
        // Only run if we're currently tracking changes for this observable array
        // and there aren't any pending deferred notifications.
        if (!trackingChanges || pendingNotifications) {
            return;
        }
        var diff = [],
            arrayLength = rawArray.length,
            argsLength = args.length,
            offset = 0;

        function pushDiff(status, value, index) {
            return diff[diff.length] = { 'status': status, 'value': value, 'index': index };
        }
        switch (operationName) {
            case 'push':
                offset = arrayLength;
            case 'unshift':
                for (var index = 0; index < argsLength; index++) {
                    pushDiff('added', args[index], offset + index);
                }
                break;

            case 'pop':
                offset = arrayLength - 1;
            case 'shift':
                if (arrayLength) {
                    pushDiff('deleted', rawArray[offset], offset);
                }
                break;

            case 'splice':
                // Negative start index means 'from end of array'. After that we clamp to [0...arrayLength].
                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                var startIndex = Math.min(Math.max(0, args[0] < 0 ? arrayLength + args[0] : args[0]), arrayLength),
                    endDeleteIndex = argsLength === 1 ? arrayLength : Math.min(startIndex + (args[1] || 0), arrayLength),
                    endAddIndex = startIndex + argsLength - 2,
                    endIndex = Math.max(endDeleteIndex, endAddIndex),
                    additions = [], deletions = [];
                for (var index = startIndex, argsIndex = 2; index < endIndex; ++index, ++argsIndex) {
                    if (index < endDeleteIndex)
                        deletions.push(pushDiff('deleted', rawArray[index], index));
                    if (index < endAddIndex)
                        additions.push(pushDiff('added', args[argsIndex], index));
                }
                ko.utils.findMovesInArrayComparison(deletions, additions);
                break;

            default:
                return;
        }
        cachedDiff = diff;
    };
};
ko.computed = ko.dependentObservable = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
    var _latestValue,
        _needsEvaluation = true,
        _isBeingEvaluated = false,
        _suppressDisposalUntilDisposeWhenReturnsFalse = false,
        _isDisposed = false,
        readFunction = evaluatorFunctionOrOptions,
        pure = false,
        isSleeping = false;

    if (readFunction && typeof readFunction == "object") {
        // Single-parameter syntax - everything is on this "options" param
        options = readFunction;
        readFunction = options["read"];
    } else {
        // Multi-parameter syntax - construct the options according to the params passed
        options = options || {};
        if (!readFunction)
            readFunction = options["read"];
    }
    if (typeof readFunction != "function")
        throw new Error("Pass a function that returns the value of the ko.computed");

    function addDependencyTracking(id, target, trackingObj) {
        if (pure && target === dependentObservable) {
            throw Error("A 'pure' computed must not be called recursively");
        }

        dependencyTracking[id] = trackingObj;
        trackingObj._order = _dependenciesCount++;
        trackingObj._version = target.getVersion();
    }

    function haveDependenciesChanged() {
        var id, dependency;
        for (id in dependencyTracking) {
            if (dependencyTracking.hasOwnProperty(id)) {
                dependency = dependencyTracking[id];
                if (dependency._target.hasChanged(dependency._version)) {
                    return true;
                }
            }
        }
    }

    function disposeComputed() {
        if (!isSleeping && dependencyTracking) {
            ko.utils.objectForEach(dependencyTracking, function (id, dependency) {
                if (dependency.dispose)
                    dependency.dispose();
            });
        }
        dependencyTracking = null;
        _dependenciesCount = 0;
        _isDisposed = true;
        _needsEvaluation = false;
        isSleeping = false;
    }

    function evaluatePossiblyAsync() {
        var throttleEvaluationTimeout = dependentObservable['throttleEvaluation'];
        if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
            clearTimeout(evaluationTimeoutInstance);
            evaluationTimeoutInstance = setTimeout(function () {
                evaluateImmediate(true /*notifyChange*/);
            }, throttleEvaluationTimeout);
        } else if (dependentObservable._evalRateLimited) {
            dependentObservable._evalRateLimited();
        } else {
            evaluateImmediate(true /*notifyChange*/);
        }
    }

    function evaluateImmediate(notifyChange) {
        if (_isBeingEvaluated) {
            // If the evaluation of a ko.computed causes side effects, it's possible that it will trigger its own re-evaluation.
            // This is not desirable (it's hard for a developer to realise a chain of dependencies might cause this, and they almost
            // certainly didn't intend infinite re-evaluations). So, for predictability, we simply prevent ko.computeds from causing
            // their own re-evaluation. Further discussion at https://github.com/SteveSanderson/knockout/pull/387
            return;
        }

        // Do not evaluate (and possibly capture new dependencies) if disposed
        if (_isDisposed) {
            return;
        }

        if (disposeWhen && disposeWhen()) {
            // See comment below about _suppressDisposalUntilDisposeWhenReturnsFalse
            if (!_suppressDisposalUntilDisposeWhenReturnsFalse) {
                dispose();
                return;
            }
        } else {
            // It just did return false, so we can stop suppressing now
            _suppressDisposalUntilDisposeWhenReturnsFalse = false;
        }

        _isBeingEvaluated = true;

        try {
            // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
            // Then, during evaluation, we cross off any that are in fact still being used.
            var disposalCandidates = dependencyTracking,
                disposalCount = _dependenciesCount,
                isInitial = pure ? undefined : !_dependenciesCount;   // If we're evaluating when there are no previous dependencies, it must be the first time

            ko.dependencyDetection.begin({
                callback: function(subscribable, id) {
                    if (!_isDisposed) {
                        if (disposalCount && disposalCandidates[id]) {
                            // Don't want to dispose this subscription, as it's still being used
                            addDependencyTracking(id, subscribable, disposalCandidates[id]);
                            delete disposalCandidates[id];
                            --disposalCount;
                        } else if (!dependencyTracking[id]) {
                            // Brand new subscription - add it
                            addDependencyTracking(id, subscribable, isSleeping ? { _target: subscribable } : subscribable.subscribe(evaluatePossiblyAsync));
                        }
                    }
                },
                computed: dependentObservable,
                isInitial: isInitial
            });

            dependencyTracking = {};
            _dependenciesCount = 0;

            try {
                var newValue = evaluatorFunctionTarget ? readFunction.call(evaluatorFunctionTarget) : readFunction();

            } finally {
                ko.dependencyDetection.end();

                // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
                if (disposalCount && !isSleeping) {
                    ko.utils.objectForEach(disposalCandidates, function(id, toDispose) {
                        if (toDispose.dispose)
                            toDispose.dispose();
                    });
                }

                _needsEvaluation = false;
            }

            if (dependentObservable.isDifferent(_latestValue, newValue)) {
                if (!isSleeping) {
                    notify(_latestValue, "beforeChange");
                }

                _latestValue = newValue;
                if (DEBUG) dependentObservable._latestValue = _latestValue;

                if (isSleeping) {
                    dependentObservable.updateVersion();
                } else if (notifyChange) {
                    notify(_latestValue);
                }
            }

            if (isInitial) {
                notify(_latestValue, "awake");
            }
        } finally {
            _isBeingEvaluated = false;
        }

        if (!_dependenciesCount)
            dispose();
    }

    function dependentObservable() {
        if (arguments.length > 0) {
            if (typeof writeFunction === "function") {
                // Writing a value
                writeFunction.apply(evaluatorFunctionTarget, arguments);
            } else {
                throw new Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
            }
            return this; // Permits chained assignments
        } else {
            // Reading the value
            ko.dependencyDetection.registerDependency(dependentObservable);
            if (_needsEvaluation || (isSleeping && haveDependenciesChanged())) {
                evaluateImmediate();
            }
            return _latestValue;
        }
    }

    function peek() {
        // Peek won't re-evaluate, except while the computed is sleeping or to get the initial value when "deferEvaluation" is set.
        if ((_needsEvaluation && !_dependenciesCount) || (isSleeping && haveDependenciesChanged())) {
            evaluateImmediate();
        }
        return _latestValue;
    }

    function isActive() {
        return _needsEvaluation || _dependenciesCount > 0;
    }

    function notify(value, event) {
        dependentObservable["notifySubscribers"](value, event);
    }

    // By here, "options" is always non-null
    var writeFunction = options["write"],
        disposeWhenNodeIsRemoved = options["disposeWhenNodeIsRemoved"] || options.disposeWhenNodeIsRemoved || null,
        disposeWhenOption = options["disposeWhen"] || options.disposeWhen,
        disposeWhen = disposeWhenOption,
        dispose = disposeComputed,
        dependencyTracking = {},
        _dependenciesCount = 0,
        evaluationTimeoutInstance = null;

    if (!evaluatorFunctionTarget)
        evaluatorFunctionTarget = options["owner"];

    ko.subscribable.call(dependentObservable);
    ko.utils.setPrototypeOfOrExtend(dependentObservable, ko.dependentObservable['fn']);

    dependentObservable.peek = peek;
    dependentObservable.getDependenciesCount = function () { return _dependenciesCount; };
    dependentObservable.hasWriteFunction = typeof writeFunction === "function";
    dependentObservable.dispose = function () { dispose(); };
    dependentObservable.isActive = isActive;

    // Replace the limit function with one that delays evaluation as well.
    var originalLimit = dependentObservable.limit;
    dependentObservable.limit = function(limitFunction) {
        originalLimit.call(dependentObservable, limitFunction);
        dependentObservable._evalRateLimited = function() {
            dependentObservable._rateLimitedBeforeChange(_latestValue);

            _needsEvaluation = true;    // Mark as dirty

            // Pass the observable to the rate-limit code, which will access it when
            // it's time to do the notification.
            dependentObservable._rateLimitedChange(dependentObservable);
        }
    };

    if (options['pure']) {
        pure = true;
        isSleeping = true;     // Starts off sleeping; will awake on the first subscription
        dependentObservable.beforeSubscriptionAdd = function (event) {
            // If asleep, wake up the computed by subscribing to any dependencies.
            if (!_isDisposed && isSleeping && event == 'change') {
                isSleeping = false;
                if (_needsEvaluation || haveDependenciesChanged()) {
                    dependencyTracking = null;
                    _dependenciesCount = 0;
                    _needsEvaluation = true;
                    evaluateImmediate();
                } else {
                    // First put the dependencies in order
                    var dependeciesOrder = [];
                    ko.utils.objectForEach(dependencyTracking, function (id, dependency) {
                        dependeciesOrder[dependency._order] = id;
                    });
                    // Next, subscribe to each one
                    ko.utils.arrayForEach(dependeciesOrder, function(id, order) {
                        var dependency = dependencyTracking[id],
                            subscription = dependency._target.subscribe(evaluatePossiblyAsync);
                        subscription._order = order;
                        subscription._version = dependency._version;
                        dependencyTracking[id] = subscription;
                    });
                }
                if (!_isDisposed) {     // test since evaluating could trigger disposal
                    notify(_latestValue, "awake");
                }
            }
        };

        dependentObservable.afterSubscriptionRemove = function (event) {
            if (!_isDisposed && event == 'change' && !dependentObservable.hasSubscriptionsForEvent('change')) {
                ko.utils.objectForEach(dependencyTracking, function (id, dependency) {
                    if (dependency.dispose) {
                        dependencyTracking[id] = {
                            _target: dependency._target,
                            _order: dependency._order,
                            _version: dependency._version
                        };
                        dependency.dispose();
                    }
                });
                isSleeping = true;
                notify(undefined, "asleep");
            }
        };

        // Because a pure computed is not automatically updated while it is sleeping, we can't
        // simply return the version number. Instead, we check if any of the dependencies have
        // changed and conditionally re-evaluate the computed observable.
        dependentObservable._originalGetVersion = dependentObservable.getVersion;
        dependentObservable.getVersion = function () {
            if (isSleeping && (_needsEvaluation || haveDependenciesChanged())) {
                evaluateImmediate();
            }
            return dependentObservable._originalGetVersion();
        };
    } else if (options['deferEvaluation']) {
        // This will force a computed with deferEvaluation to evaluate when the first subscriptions is registered.
        dependentObservable.beforeSubscriptionAdd = function (event) {
            if (event == 'change' || event == 'beforeChange') {
                peek();
            }
        }
    }

    ko.exportProperty(dependentObservable, 'peek', dependentObservable.peek);
    ko.exportProperty(dependentObservable, 'dispose', dependentObservable.dispose);
    ko.exportProperty(dependentObservable, 'isActive', dependentObservable.isActive);
    ko.exportProperty(dependentObservable, 'getDependenciesCount', dependentObservable.getDependenciesCount);

    // Add a "disposeWhen" callback that, on each evaluation, disposes if the node was removed without using ko.removeNode.
    if (disposeWhenNodeIsRemoved) {
        // Since this computed is associated with a DOM node, and we don't want to dispose the computed
        // until the DOM node is *removed* from the document (as opposed to never having been in the document),
        // we'll prevent disposal until "disposeWhen" first returns false.
        _suppressDisposalUntilDisposeWhenReturnsFalse = true;

        // Only watch for the node's disposal if the value really is a node. It might not be,
        // e.g., { disposeWhenNodeIsRemoved: true } can be used to opt into the "only dispose
        // after first false result" behaviour even if there's no specific node to watch. This
        // technique is intended for KO's internal use only and shouldn't be documented or used
        // by application code, as it's likely to change in a future version of KO.
        if (disposeWhenNodeIsRemoved.nodeType) {
            disposeWhen = function () {
                return !ko.utils.domNodeIsAttachedToDocument(disposeWhenNodeIsRemoved) || (disposeWhenOption && disposeWhenOption());
            };
        }
    }

    // Evaluate, unless sleeping or deferEvaluation is true
    if (!isSleeping && !options['deferEvaluation'])
        evaluateImmediate();

    // Attach a DOM node disposal callback so that the computed will be proactively disposed as soon as the node is
    // removed using ko.removeNode. But skip if isActive is false (there will never be any dependencies to dispose).
    if (disposeWhenNodeIsRemoved && isActive() && disposeWhenNodeIsRemoved.nodeType) {
        dispose = function() {
            ko.utils.domNodeDisposal.removeDisposeCallback(disposeWhenNodeIsRemoved, dispose);
            disposeComputed();
        };
        ko.utils.domNodeDisposal.addDisposeCallback(disposeWhenNodeIsRemoved, dispose);
    }

    return dependentObservable;
};

ko.isComputed = function(instance) {
    return ko.hasPrototype(instance, ko.dependentObservable);
};

var protoProp = ko.observable.protoProperty; // == "__ko_proto__"
ko.dependentObservable[protoProp] = ko.observable;

ko.dependentObservable['fn'] = {
    "equalityComparer": valuesArePrimitiveAndEqual
};
ko.dependentObservable['fn'][protoProp] = ko.dependentObservable;

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.dependentObservable constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko.dependentObservable['fn'], ko.subscribable['fn']);
}

ko.exportSymbol('dependentObservable', ko.dependentObservable);
ko.exportSymbol('computed', ko.dependentObservable); // Make "ko.computed" an alias for "ko.dependentObservable"
ko.exportSymbol('isComputed', ko.isComputed);

ko.pureComputed = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget) {
    if (typeof evaluatorFunctionOrOptions === 'function') {
        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget, {'pure':true});
    } else {
        evaluatorFunctionOrOptions = ko.utils.extend({}, evaluatorFunctionOrOptions);   // make a copy of the parameter object
        evaluatorFunctionOrOptions['pure'] = true;
        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget);
    }
}
ko.exportSymbol('pureComputed', ko.pureComputed);

(function() {
    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)

    ko.toJS = function(rootObject) {
        if (arguments.length == 0)
            throw new Error("When calling ko.toJS, pass the object you want to convert.");

        // We just unwrap everything at every level in the object graph
        return mapJsObjectGraph(rootObject, function(valueToMap) {
            // Loop because an observable's value might in turn be another observable wrapper
            for (var i = 0; ko.isObservable(valueToMap) && (i < maxNestedObservableDepth); i++)
                valueToMap = valueToMap();
            return valueToMap;
        });
    };

    ko.toJSON = function(rootObject, replacer, space) {     // replacer and space are optional
        var plainJavaScriptObject = ko.toJS(rootObject);
        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
    };

    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
        visitedObjects = visitedObjects || new objectLookup();

        rootObject = mapInputCallback(rootObject);
        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
        if (!canHaveProperties)
            return rootObject;

        var outputProperties = rootObject instanceof Array ? [] : {};
        visitedObjects.save(rootObject, outputProperties);

        visitPropertiesOrArrayEntries(rootObject, function(indexer) {
            var propertyValue = mapInputCallback(rootObject[indexer]);

            switch (typeof propertyValue) {
                case "boolean":
                case "number":
                case "string":
                case "function":
                    outputProperties[indexer] = propertyValue;
                    break;
                case "object":
                case "undefined":
                    var previouslyMappedValue = visitedObjects.get(propertyValue);
                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
                        ? previouslyMappedValue
                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
                    break;
            }
        });

        return outputProperties;
    }

    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
        if (rootObject instanceof Array) {
            for (var i = 0; i < rootObject.length; i++)
                visitorCallback(i);

            // For arrays, also respect toJSON property for custom mappings (fixes #278)
            if (typeof rootObject['toJSON'] == 'function')
                visitorCallback('toJSON');
        } else {
            for (var propertyName in rootObject) {
                visitorCallback(propertyName);
            }
        }
    };

    function objectLookup() {
        this.keys = [];
        this.values = [];
    };

    objectLookup.prototype = {
        constructor: objectLookup,
        save: function(key, value) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            if (existingIndex >= 0)
                this.values[existingIndex] = value;
            else {
                this.keys.push(key);
                this.values.push(value);
            }
        },
        get: function(key) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
        }
    };
})();

ko.exportSymbol('toJS', ko.toJS);
ko.exportSymbol('toJSON', ko.toJSON);
(function () {
    var hasDomDataExpandoProperty = '__ko__hasDomDataOptionValue__';

    // Normally, SELECT elements and their OPTIONs can only take value of type 'string' (because the values
    // are stored on DOM attributes). ko.selectExtensions provides a way for SELECTs/OPTIONs to have values
    // that are arbitrary objects. This is very convenient when implementing things like cascading dropdowns.
    ko.selectExtensions = {
        readValue : function(element) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    if (element[hasDomDataExpandoProperty] === true)
                        return ko.utils.domData.get(element, ko.bindingHandlers.options.optionValueDomDataKey);
                    return ko.utils.ieVersion <= 7
                        ? (element.getAttributeNode('value') && element.getAttributeNode('value').specified ? element.value : element.text)
                        : element.value;
                case 'select':
                    return element.selectedIndex >= 0 ? ko.selectExtensions.readValue(element.options[element.selectedIndex]) : undefined;
                default:
                    return element.value;
            }
        },

        writeValue: function(element, value, allowUnset) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    switch(typeof value) {
                        case "string":
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, undefined);
                            if (hasDomDataExpandoProperty in element) { // IE <= 8 throws errors if you delete non-existent properties from a DOM node
                                delete element[hasDomDataExpandoProperty];
                            }
                            element.value = value;
                            break;
                        default:
                            // Store arbitrary object using DomData
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, value);
                            element[hasDomDataExpandoProperty] = true;

                            // Special treatment of numbers is just for backward compatibility. KO 1.2.1 wrote numerical values to element.value.
                            element.value = typeof value === "number" ? value : "";
                            break;
                    }
                    break;
                case 'select':
                    if (value === "" || value === null)       // A blank string or null value will select the caption
                        value = undefined;
                    var selection = -1;
                    for (var i = 0, n = element.options.length, optionValue; i < n; ++i) {
                        optionValue = ko.selectExtensions.readValue(element.options[i]);
                        // Include special check to handle selecting a caption with a blank string value
                        if (optionValue == value || (optionValue == "" && value === undefined)) {
                            selection = i;
                            break;
                        }
                    }
                    if (allowUnset || selection >= 0 || (value === undefined && element.size > 1)) {
                        element.selectedIndex = selection;
                    }
                    break;
                default:
                    if ((value === null) || (value === undefined))
                        value = "";
                    element.value = value;
                    break;
            }
        }
    };
})();

ko.exportSymbol('selectExtensions', ko.selectExtensions);
ko.exportSymbol('selectExtensions.readValue', ko.selectExtensions.readValue);
ko.exportSymbol('selectExtensions.writeValue', ko.selectExtensions.writeValue);
ko.expressionRewriting = (function () {
    var javaScriptReservedWords = ["true", "false", "null", "undefined"];

    // Matches something that can be assigned to--either an isolated identifier or something ending with a property accessor
    // This is designed to be simple and avoid false negatives, but could produce false positives (e.g., a+b.c).
    // This also will not properly handle nested brackets (e.g., obj1[obj2['prop']]; see #911).
    var javaScriptAssignmentTarget = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;

    function getWriteableValue(expression) {
        if (ko.utils.arrayIndexOf(javaScriptReservedWords, expression) >= 0)
            return false;
        var match = expression.match(javaScriptAssignmentTarget);
        return match === null ? false : match[1] ? ('Object(' + match[1] + ')' + match[2]) : expression;
    }

    // The following regular expressions will be used to split an object-literal string into tokens

        // These two match strings, either with double quotes or single quotes
    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
        // as a regular expression (this is handled by the parsing loop below).
        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
        // These characters have special meaning to the parser and must not appear in the middle of a
        // token, except as part of a string.
        specials = ',"\'{}()/:[\\]',
        // Match text (at least two characters) that does not contain any of the above special characters,
        // although some of the special characters are allowed to start it (all but the colon and comma).
        // The text can contain spaces, but leading or trailing spaces are skipped.
        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
        // Match any non-space character not matched already. This will match colons and commas, since they're
        // not matched by "everyThingElse", but will also match any other single character that wasn't already
        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
        oneNotSpace = '[^\\s]',

        // Create the actual regular expression by or-ing the above strings. The order is important.
        bindingToken = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),

        // Match end of previous token to determine whether a slash is a division or regex.
        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};

    function parseObjectLiteral(objectLiteralString) {
        // Trim leading and trailing spaces from the string
        var str = ko.utils.stringTrim(objectLiteralString);

        // Trim braces '{' surrounding the whole object literal
        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

        // Split into tokens
        var result = [], toks = str.match(bindingToken), key, values = [], depth = 0;

        if (toks) {
            // Append a comma so that we don't need a separate code block to deal with the last item
            toks.push(',');

            for (var i = 0, tok; tok = toks[i]; ++i) {
                var c = tok.charCodeAt(0);
                // A comma signals the end of a key/value pair if depth is zero
                if (c === 44) { // ","
                    if (depth <= 0) {
                        result.push((key && values.length) ? {key: key, value: values.join('')} : {'unknown': key || values.join('')});
                        key = depth = 0;
                        values = [];
                        continue;
                    }
                // Simply skip the colon that separates the name and value
                } else if (c === 58) { // ":"
                    if (!depth && !key && values.length === 1) {
                        key = values.pop();
                        continue;
                    }
                // A set of slashes is initially matched as a regular expression, but could be division
                } else if (c === 47 && i && tok.length > 1) {  // "/"
                    // Look at the end of the previous token to determine if the slash is actually division
                    var match = toks[i-1].match(divisionLookBehind);
                    if (match && !keywordRegexLookBehind[match[0]]) {
                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                        str = str.substr(str.indexOf(tok) + 1);
                        toks = str.match(bindingToken);
                        toks.push(',');
                        i = -1;
                        // Continue with just the slash
                        tok = '/';
                    }
                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
                    ++depth;
                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
                    --depth;
                // The key will be the first token; if it's a string, trim the quotes
                } else if (!key && !values.length && (c === 34 || c === 39)) { // '"', "'"
                    tok = tok.slice(1, -1);
                }
                values.push(tok);
            }
        }
        return result;
    }

    // Two-way bindings include a write function that allow the handler to update the value even if it's not an observable.
    var twoWayBindings = {};

    function preProcessBindings(bindingsStringOrKeyValueArray, bindingOptions) {
        bindingOptions = bindingOptions || {};

        function processKeyValue(key, val) {
            var writableVal;
            function callPreprocessHook(obj) {
                return (obj && obj['preprocess']) ? (val = obj['preprocess'](val, key, processKeyValue)) : true;
            }
            if (!bindingParams) {
                if (!callPreprocessHook(ko['getBindingHandler'](key)))
                    return;

                if (twoWayBindings[key] && (writableVal = getWriteableValue(val))) {
                    // For two-way bindings, provide a write method in case the value
                    // isn't a writable observable.
                    propertyAccessorResultStrings.push("'" + key + "':function(_z){" + writableVal + "=_z}");
                }
            }
            // Values are wrapped in a function so that each value can be accessed independently
            if (makeValueAccessors) {
                val = 'function(){return ' + val + ' }';
            }
            resultStrings.push("'" + key + "':" + val);
        }

        var resultStrings = [],
            propertyAccessorResultStrings = [],
            makeValueAccessors = bindingOptions['valueAccessors'],
            bindingParams = bindingOptions['bindingParams'],
            keyValueArray = typeof bindingsStringOrKeyValueArray === "string" ?
                parseObjectLiteral(bindingsStringOrKeyValueArray) : bindingsStringOrKeyValueArray;

        ko.utils.arrayForEach(keyValueArray, function(keyValue) {
            processKeyValue(keyValue.key || keyValue['unknown'], keyValue.value);
        });

        if (propertyAccessorResultStrings.length)
            processKeyValue('_ko_property_writers', "{" + propertyAccessorResultStrings.join(",") + " }");

        return resultStrings.join(",");
    }

    return {
        bindingRewriteValidators: [],

        twoWayBindings: twoWayBindings,

        parseObjectLiteral: parseObjectLiteral,

        preProcessBindings: preProcessBindings,

        keyValueArrayContainsKey: function(keyValueArray, key) {
            for (var i = 0; i < keyValueArray.length; i++)
                if (keyValueArray[i]['key'] == key)
                    return true;
            return false;
        },

        // Internal, private KO utility for updating model properties from within bindings
        // property:            If the property being updated is (or might be) an observable, pass it here
        //                      If it turns out to be a writable observable, it will be written to directly
        // allBindings:         An object with a get method to retrieve bindings in the current execution context.
        //                      This will be searched for a '_ko_property_writers' property in case you're writing to a non-observable
        // key:                 The key identifying the property to be written. Example: for { hasFocus: myValue }, write to 'myValue' by specifying the key 'hasFocus'
        // value:               The value to be written
        // checkIfDifferent:    If true, and if the property being written is a writable observable, the value will only be written if
        //                      it is !== existing value on that writable observable
        writeValueToProperty: function(property, allBindings, key, value, checkIfDifferent) {
            if (!property || !ko.isObservable(property)) {
                var propWriters = allBindings.get('_ko_property_writers');
                if (propWriters && propWriters[key])
                    propWriters[key](value);
            } else if (ko.isWriteableObservable(property) && (!checkIfDifferent || property.peek() !== value)) {
                property(value);
            }
        }
    };
})();

ko.exportSymbol('expressionRewriting', ko.expressionRewriting);
ko.exportSymbol('expressionRewriting.bindingRewriteValidators', ko.expressionRewriting.bindingRewriteValidators);
ko.exportSymbol('expressionRewriting.parseObjectLiteral', ko.expressionRewriting.parseObjectLiteral);
ko.exportSymbol('expressionRewriting.preProcessBindings', ko.expressionRewriting.preProcessBindings);

// Making bindings explicitly declare themselves as "two way" isn't ideal in the long term (it would be better if
// all bindings could use an official 'property writer' API without needing to declare that they might). However,
// since this is not, and has never been, a public API (_ko_property_writers was never documented), it's acceptable
// as an internal implementation detail in the short term.
// For those developers who rely on _ko_property_writers in their custom bindings, we expose _twoWayBindings as an
// undocumented feature that makes it relatively easy to upgrade to KO 3.0. However, this is still not an official
// public API, and we reserve the right to remove it at any time if we create a real public property writers API.
ko.exportSymbol('expressionRewriting._twoWayBindings', ko.expressionRewriting.twoWayBindings);

// For backward compatibility, define the following aliases. (Previously, these function names were misleading because
// they referred to JSON specifically, even though they actually work with arbitrary JavaScript object literal expressions.)
ko.exportSymbol('jsonExpressionRewriting', ko.expressionRewriting);
ko.exportSymbol('jsonExpressionRewriting.insertPropertyAccessorsIntoJson', ko.expressionRewriting.preProcessBindings);
(function() {
    // "Virtual elements" is an abstraction on top of the usual DOM API which understands the notion that comment nodes
    // may be used to represent hierarchy (in addition to the DOM's natural hierarchy).
    // If you call the DOM-manipulating functions on ko.virtualElements, you will be able to read and write the state
    // of that virtual hierarchy
    //
    // The point of all this is to support containerless templates (e.g., <!-- ko foreach:someCollection -->blah<!-- /ko -->)
    // without having to scatter special cases all over the binding and templating code.

    // IE 9 cannot reliably read the "nodeValue" property of a comment node (see https://github.com/SteveSanderson/knockout/issues/186)
    // but it does give them a nonstandard alternative property called "text" that it can read reliably. Other browsers don't have that property.
    // So, use node.text where available, and node.nodeValue elsewhere
    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";

    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
    var htmlTagsWithOptionallyClosingChildren = { 'ul': true, 'ol': true };

    function isStartComment(node) {
        return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function isEndComment(node) {
        return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function getVirtualChildren(startComment, allowUnbalanced) {
        var currentNode = startComment;
        var depth = 1;
        var children = [];
        while (currentNode = currentNode.nextSibling) {
            if (isEndComment(currentNode)) {
                depth--;
                if (depth === 0)
                    return children;
            }

            children.push(currentNode);

            if (isStartComment(currentNode))
                depth++;
        }
        if (!allowUnbalanced)
            throw new Error("Cannot find closing comment tag to match: " + startComment.nodeValue);
        return null;
    }

    function getMatchingEndComment(startComment, allowUnbalanced) {
        var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
        if (allVirtualChildren) {
            if (allVirtualChildren.length > 0)
                return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
            return startComment.nextSibling;
        } else
            return null; // Must have no matching end comment, and allowUnbalanced is true
    }

    function getUnbalancedChildTags(node) {
        // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
        //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
        var childNode = node.firstChild, captureRemaining = null;
        if (childNode) {
            do {
                if (captureRemaining)                   // We already hit an unbalanced node and are now just scooping up all subsequent nodes
                    captureRemaining.push(childNode);
                else if (isStartComment(childNode)) {
                    var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
                    if (matchingEndComment)             // It's a balanced tag, so skip immediately to the end of this virtual set
                        childNode = matchingEndComment;
                    else
                        captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
                } else if (isEndComment(childNode)) {
                    captureRemaining = [childNode];     // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
                }
            } while (childNode = childNode.nextSibling);
        }
        return captureRemaining;
    }

    ko.virtualElements = {
        allowedBindings: {},

        childNodes: function(node) {
            return isStartComment(node) ? getVirtualChildren(node) : node.childNodes;
        },

        emptyNode: function(node) {
            if (!isStartComment(node))
                ko.utils.emptyDomNode(node);
            else {
                var virtualChildren = ko.virtualElements.childNodes(node);
                for (var i = 0, j = virtualChildren.length; i < j; i++)
                    ko.removeNode(virtualChildren[i]);
            }
        },

        setDomNodeChildren: function(node, childNodes) {
            if (!isStartComment(node))
                ko.utils.setDomNodeChildren(node, childNodes);
            else {
                ko.virtualElements.emptyNode(node);
                var endCommentNode = node.nextSibling; // Must be the next sibling, as we just emptied the children
                for (var i = 0, j = childNodes.length; i < j; i++)
                    endCommentNode.parentNode.insertBefore(childNodes[i], endCommentNode);
            }
        },

        prepend: function(containerNode, nodeToPrepend) {
            if (!isStartComment(containerNode)) {
                if (containerNode.firstChild)
                    containerNode.insertBefore(nodeToPrepend, containerNode.firstChild);
                else
                    containerNode.appendChild(nodeToPrepend);
            } else {
                // Start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToPrepend, containerNode.nextSibling);
            }
        },

        insertAfter: function(containerNode, nodeToInsert, insertAfterNode) {
            if (!insertAfterNode) {
                ko.virtualElements.prepend(containerNode, nodeToInsert);
            } else if (!isStartComment(containerNode)) {
                // Insert after insertion point
                if (insertAfterNode.nextSibling)
                    containerNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
                else
                    containerNode.appendChild(nodeToInsert);
            } else {
                // Children of start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
            }
        },

        firstChild: function(node) {
            if (!isStartComment(node))
                return node.firstChild;
            if (!node.nextSibling || isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        nextSibling: function(node) {
            if (isStartComment(node))
                node = getMatchingEndComment(node);
            if (node.nextSibling && isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        hasBindingValue: isStartComment,

        virtualNodeBindingValue: function(node) {
            var regexMatch = (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
            return regexMatch ? regexMatch[1] : null;
        },

        normaliseVirtualElementDomStructure: function(elementVerified) {
            // Workaround for https://github.com/SteveSanderson/knockout/issues/155
            // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
            // that are direct descendants of <ul> into the preceding <li>)
            if (!htmlTagsWithOptionallyClosingChildren[ko.utils.tagNameLower(elementVerified)])
                return;

            // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
            // must be intended to appear *after* that child, so move them there.
            var childNode = elementVerified.firstChild;
            if (childNode) {
                do {
                    if (childNode.nodeType === 1) {
                        var unbalancedTags = getUnbalancedChildTags(childNode);
                        if (unbalancedTags) {
                            // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
                            var nodeToInsertBefore = childNode.nextSibling;
                            for (var i = 0; i < unbalancedTags.length; i++) {
                                if (nodeToInsertBefore)
                                    elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
                                else
                                    elementVerified.appendChild(unbalancedTags[i]);
                            }
                        }
                    }
                } while (childNode = childNode.nextSibling);
            }
        }
    };
})();
ko.exportSymbol('virtualElements', ko.virtualElements);
ko.exportSymbol('virtualElements.allowedBindings', ko.virtualElements.allowedBindings);
ko.exportSymbol('virtualElements.emptyNode', ko.virtualElements.emptyNode);
//ko.exportSymbol('virtualElements.firstChild', ko.virtualElements.firstChild);     // firstChild is not minified
ko.exportSymbol('virtualElements.insertAfter', ko.virtualElements.insertAfter);
//ko.exportSymbol('virtualElements.nextSibling', ko.virtualElements.nextSibling);   // nextSibling is not minified
ko.exportSymbol('virtualElements.prepend', ko.virtualElements.prepend);
ko.exportSymbol('virtualElements.setDomNodeChildren', ko.virtualElements.setDomNodeChildren);
(function() {
    var defaultBindingAttributeName = "data-bind";

    ko.bindingProvider = function() {
        this.bindingCache = {};
    };

    ko.utils.extend(ko.bindingProvider.prototype, {
        'nodeHasBindings': function(node) {
            switch (node.nodeType) {
                case 1: // Element
                    return node.getAttribute(defaultBindingAttributeName) != null
                        || ko.components['getComponentNameForNode'](node);
                case 8: // Comment node
                    return ko.virtualElements.hasBindingValue(node);
                default: return false;
            }
        },

        'getBindings': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext),
                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node) : null;
            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ false);
        },

        'getBindingAccessors': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext),
                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node, { 'valueAccessors': true }) : null;
            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ true);
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'getBindingsString': function(node, bindingContext) {
            switch (node.nodeType) {
                case 1: return node.getAttribute(defaultBindingAttributeName);   // Element
                case 8: return ko.virtualElements.virtualNodeBindingValue(node); // Comment node
                default: return null;
            }
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'parseBindingsString': function(bindingsString, bindingContext, node, options) {
            try {
                var bindingFunction = createBindingsStringEvaluatorViaCache(bindingsString, this.bindingCache, options);
                return bindingFunction(bindingContext, node);
            } catch (ex) {
                ex.message = "Unable to parse bindings.\nBindings value: " + bindingsString + "\nMessage: " + ex.message;
                throw ex;
            }
        }
    });

    ko.bindingProvider['instance'] = new ko.bindingProvider();

    function createBindingsStringEvaluatorViaCache(bindingsString, cache, options) {
        var cacheKey = bindingsString + (options && options['valueAccessors'] || '');
        return cache[cacheKey]
            || (cache[cacheKey] = createBindingsStringEvaluator(bindingsString, options));
    }

    function createBindingsStringEvaluator(bindingsString, options) {
        // Build the source for a function that evaluates "expression"
        // For each scope variable, add an extra level of "with" nesting
        // Example result: with(sc1) { with(sc0) { return (expression) } }
        var rewrittenBindings = ko.expressionRewriting.preProcessBindings(bindingsString, options),
            functionBody = "with($context){with($data||{}){return{" + rewrittenBindings + "}}}";
        return new Function("$context", "$element", functionBody);
    }
})();

ko.exportSymbol('bindingProvider', ko.bindingProvider);
(function () {
    ko.bindingHandlers = {};

    // The following element types will not be recursed into during binding. In the future, we
    // may consider adding <template> to this list, because such elements' contents are always
    // intended to be bound in a different context from where they appear in the document.
    var bindingDoesNotRecurseIntoElementTypes = {
        // Don't want bindings that operate on text nodes to mutate <script> and <textarea> contents,
        // because it's unexpected and a potential XSS issue
        'script': true,
        'textarea': true
    };

    // Use an overridable method for retrieving binding handlers so that a plugins may support dynamically created handlers
    ko['getBindingHandler'] = function(bindingKey) {
        return ko.bindingHandlers[bindingKey];
    };

    // The ko.bindingContext constructor is only called directly to create the root context. For child
    // contexts, use bindingContext.createChildContext or bindingContext.extend.
    ko.bindingContext = function(dataItemOrAccessor, parentContext, dataItemAlias, extendCallback) {

        // The binding context object includes static properties for the current, parent, and root view models.
        // If a view model is actually stored in an observable, the corresponding binding context object, and
        // any child contexts, must be updated when the view model is changed.
        function updateContext() {
            // Most of the time, the context will directly get a view model object, but if a function is given,
            // we call the function to retrieve the view model. If the function accesses any obsevables or returns
            // an observable, the dependency is tracked, and those observables can later cause the binding
            // context to be updated.
            var dataItemOrObservable = isFunc ? dataItemOrAccessor() : dataItemOrAccessor,
                dataItem = ko.utils.unwrapObservable(dataItemOrObservable);

            if (parentContext) {
                // When a "parent" context is given, register a dependency on the parent context. Thus whenever the
                // parent context is updated, this context will also be updated.
                if (parentContext._subscribable)
                    parentContext._subscribable();

                // Copy $root and any custom properties from the parent context
                ko.utils.extend(self, parentContext);

                // Because the above copy overwrites our own properties, we need to reset them.
                // During the first execution, "subscribable" isn't set, so don't bother doing the update then.
                if (subscribable) {
                    self._subscribable = subscribable;
                }
            } else {
                self['$parents'] = [];
                self['$root'] = dataItem;

                // Export 'ko' in the binding context so it will be available in bindings and templates
                // even if 'ko' isn't exported as a global, such as when using an AMD loader.
                // See https://github.com/SteveSanderson/knockout/issues/490
                self['ko'] = ko;
            }
            self['$rawData'] = dataItemOrObservable;
            self['$data'] = dataItem;
            if (dataItemAlias)
                self[dataItemAlias] = dataItem;

            // The extendCallback function is provided when creating a child context or extending a context.
            // It handles the specific actions needed to finish setting up the binding context. Actions in this
            // function could also add dependencies to this binding context.
            if (extendCallback)
                extendCallback(self, parentContext, dataItem);

            return self['$data'];
        }
        function disposeWhen() {
            return nodes && !ko.utils.anyDomNodeIsAttachedToDocument(nodes);
        }

        var self = this,
            isFunc = typeof(dataItemOrAccessor) == "function" && !ko.isObservable(dataItemOrAccessor),
            nodes,
            subscribable = ko.dependentObservable(updateContext, null, { disposeWhen: disposeWhen, disposeWhenNodeIsRemoved: true });

        // At this point, the binding context has been initialized, and the "subscribable" computed observable is
        // subscribed to any observables that were accessed in the process. If there is nothing to track, the
        // computed will be inactive, and we can safely throw it away. If it's active, the computed is stored in
        // the context object.
        if (subscribable.isActive()) {
            self._subscribable = subscribable;

            // Always notify because even if the model ($data) hasn't changed, other context properties might have changed
            subscribable['equalityComparer'] = null;

            // We need to be able to dispose of this computed observable when it's no longer needed. This would be
            // easy if we had a single node to watch, but binding contexts can be used by many different nodes, and
            // we cannot assume that those nodes have any relation to each other. So instead we track any node that
            // the context is attached to, and dispose the computed when all of those nodes have been cleaned.

            // Add properties to *subscribable* instead of *self* because any properties added to *self* may be overwritten on updates
            nodes = [];
            subscribable._addNode = function(node) {
                nodes.push(node);
                ko.utils.domNodeDisposal.addDisposeCallback(node, function(node) {
                    ko.utils.arrayRemoveItem(nodes, node);
                    if (!nodes.length) {
                        subscribable.dispose();
                        self._subscribable = subscribable = undefined;
                    }
                });
            };
        }
    }

    // Extend the binding context hierarchy with a new view model object. If the parent context is watching
    // any obsevables, the new child context will automatically get a dependency on the parent context.
    // But this does not mean that the $data value of the child context will also get updated. If the child
    // view model also depends on the parent view model, you must provide a function that returns the correct
    // view model on each update.
    ko.bindingContext.prototype['createChildContext'] = function (dataItemOrAccessor, dataItemAlias, extendCallback) {
        return new ko.bindingContext(dataItemOrAccessor, this, dataItemAlias, function(self, parentContext) {
            // Extend the context hierarchy by setting the appropriate pointers
            self['$parentContext'] = parentContext;
            self['$parent'] = parentContext['$data'];
            self['$parents'] = (parentContext['$parents'] || []).slice(0);
            self['$parents'].unshift(self['$parent']);
            if (extendCallback)
                extendCallback(self);
        });
    };

    // Extend the binding context with new custom properties. This doesn't change the context hierarchy.
    // Similarly to "child" contexts, provide a function here to make sure that the correct values are set
    // when an observable view model is updated.
    ko.bindingContext.prototype['extend'] = function(properties) {
        // If the parent context references an observable view model, "_subscribable" will always be the
        // latest view model object. If not, "_subscribable" isn't set, and we can use the static "$data" value.
        return new ko.bindingContext(this._subscribable || this['$data'], this, null, function(self, parentContext) {
            // This "child" context doesn't directly track a parent observable view model,
            // so we need to manually set the $rawData value to match the parent.
            self['$rawData'] = parentContext['$rawData'];
            ko.utils.extend(self, typeof(properties) == "function" ? properties() : properties);
        });
    };

    // Returns the valueAccesor function for a binding value
    function makeValueAccessor(value) {
        return function() {
            return value;
        };
    }

    // Returns the value of a valueAccessor function
    function evaluateValueAccessor(valueAccessor) {
        return valueAccessor();
    }

    // Given a function that returns bindings, create and return a new object that contains
    // binding value-accessors functions. Each accessor function calls the original function
    // so that it always gets the latest value and all dependencies are captured. This is used
    // by ko.applyBindingsToNode and getBindingsAndMakeAccessors.
    function makeAccessorsFromFunction(callback) {
        return ko.utils.objectMap(ko.dependencyDetection.ignore(callback), function(value, key) {
            return function() {
                return callback()[key];
            };
        });
    }

    // Given a bindings function or object, create and return a new object that contains
    // binding value-accessors functions. This is used by ko.applyBindingsToNode.
    function makeBindingAccessors(bindings, context, node) {
        if (typeof bindings === 'function') {
            return makeAccessorsFromFunction(bindings.bind(null, context, node));
        } else {
            return ko.utils.objectMap(bindings, makeValueAccessor);
        }
    }

    // This function is used if the binding provider doesn't include a getBindingAccessors function.
    // It must be called with 'this' set to the provider instance.
    function getBindingsAndMakeAccessors(node, context) {
        return makeAccessorsFromFunction(this['getBindings'].bind(this, node, context));
    }

    function validateThatBindingIsAllowedForVirtualElements(bindingName) {
        var validator = ko.virtualElements.allowedBindings[bindingName];
        if (!validator)
            throw new Error("The binding '" + bindingName + "' cannot be used with virtual elements")
    }

    function applyBindingsToDescendantsInternal (bindingContext, elementOrVirtualElement, bindingContextsMayDifferFromDomParentElement) {
        var currentChild,
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement),
            provider = ko.bindingProvider['instance'],
            preprocessNode = provider['preprocessNode'];

        // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
        // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
        // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
        // trigger insertion of <template> contents at that point in the document.
        if (preprocessNode) {
            while (currentChild = nextInQueue) {
                nextInQueue = ko.virtualElements.nextSibling(currentChild);
                preprocessNode.call(provider, currentChild);
            }
            // Reset nextInQueue for the next loop
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement);
        }

        while (currentChild = nextInQueue) {
            // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
            nextInQueue = ko.virtualElements.nextSibling(currentChild);
            applyBindingsToNodeAndDescendantsInternal(bindingContext, currentChild, bindingContextsMayDifferFromDomParentElement);
        }
    }

    function applyBindingsToNodeAndDescendantsInternal (bindingContext, nodeVerified, bindingContextMayDifferFromDomParentElement) {
        var shouldBindDescendants = true;

        // Perf optimisation: Apply bindings only if...
        // (1) We need to store the binding context on this node (because it may differ from the DOM parent node's binding context)
        //     Note that we can't store binding contexts on non-elements (e.g., text nodes), as IE doesn't allow expando properties for those
        // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
        var isElement = (nodeVerified.nodeType === 1);
        if (isElement) // Workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(nodeVerified);

        var shouldApplyBindings = (isElement && bindingContextMayDifferFromDomParentElement)             // Case (1)
                               || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);       // Case (2)
        if (shouldApplyBindings)
            shouldBindDescendants = applyBindingsToNodeInternal(nodeVerified, null, bindingContext, bindingContextMayDifferFromDomParentElement)['shouldBindDescendants'];

        if (shouldBindDescendants && !bindingDoesNotRecurseIntoElementTypes[ko.utils.tagNameLower(nodeVerified)]) {
            // We're recursing automatically into (real or virtual) child nodes without changing binding contexts. So,
            //  * For children of a *real* element, the binding context is certainly the same as on their DOM .parentNode,
            //    hence bindingContextsMayDifferFromDomParentElement is false
            //  * For children of a *virtual* element, we can't be sure. Evaluating .parentNode on those children may
            //    skip over any number of intermediate virtual elements, any of which might define a custom binding context,
            //    hence bindingContextsMayDifferFromDomParentElement is true
            applyBindingsToDescendantsInternal(bindingContext, nodeVerified, /* bindingContextsMayDifferFromDomParentElement: */ !isElement);
        }
    }

    var boundElementDomDataKey = ko.utils.domData.nextKey();


    function topologicalSortBindings(bindings) {
        // Depth-first sort
        var result = [],                // The list of key/handler pairs that we will return
            bindingsConsidered = {},    // A temporary record of which bindings are already in 'result'
            cyclicDependencyStack = []; // Keeps track of a depth-search so that, if there's a cycle, we know which bindings caused it
        ko.utils.objectForEach(bindings, function pushBinding(bindingKey) {
            if (!bindingsConsidered[bindingKey]) {
                var binding = ko['getBindingHandler'](bindingKey);
                if (binding) {
                    // First add dependencies (if any) of the current binding
                    if (binding['after']) {
                        cyclicDependencyStack.push(bindingKey);
                        ko.utils.arrayForEach(binding['after'], function(bindingDependencyKey) {
                            if (bindings[bindingDependencyKey]) {
                                if (ko.utils.arrayIndexOf(cyclicDependencyStack, bindingDependencyKey) !== -1) {
                                    throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + cyclicDependencyStack.join(", "));
                                } else {
                                    pushBinding(bindingDependencyKey);
                                }
                            }
                        });
                        cyclicDependencyStack.length--;
                    }
                    // Next add the current binding
                    result.push({ key: bindingKey, handler: binding });
                }
                bindingsConsidered[bindingKey] = true;
            }
        });

        return result;
    }

    function applyBindingsToNodeInternal(node, sourceBindings, bindingContext, bindingContextMayDifferFromDomParentElement) {
        // Prevent multiple applyBindings calls for the same node, except when a binding value is specified
        var alreadyBound = ko.utils.domData.get(node, boundElementDomDataKey);
        if (!sourceBindings) {
            if (alreadyBound) {
                throw Error("You cannot apply bindings multiple times to the same element.");
            }
            ko.utils.domData.set(node, boundElementDomDataKey, true);
        }

        // Optimization: Don't store the binding context on this node if it's definitely the same as on node.parentNode, because
        // we can easily recover it just by scanning up the node's ancestors in the DOM
        // (note: here, parent node means "real DOM parent" not "virtual parent", as there's no O(1) way to find the virtual parent)
        if (!alreadyBound && bindingContextMayDifferFromDomParentElement)
            ko.storedBindingContextForNode(node, bindingContext);

        // Use bindings if given, otherwise fall back on asking the bindings provider to give us some bindings
        var bindings;
        if (sourceBindings && typeof sourceBindings !== 'function') {
            bindings = sourceBindings;
        } else {
            var provider = ko.bindingProvider['instance'],
                getBindings = provider['getBindingAccessors'] || getBindingsAndMakeAccessors;

            // Get the binding from the provider within a computed observable so that we can update the bindings whenever
            // the binding context is updated or if the binding provider accesses observables.
            var bindingsUpdater = ko.dependentObservable(
                function() {
                    bindings = sourceBindings ? sourceBindings(bindingContext, node) : getBindings.call(provider, node, bindingContext);
                    // Register a dependency on the binding context to support obsevable view models.
                    if (bindings && bindingContext._subscribable)
                        bindingContext._subscribable();
                    return bindings;
                },
                null, { disposeWhenNodeIsRemoved: node }
            );

            if (!bindings || !bindingsUpdater.isActive())
                bindingsUpdater = null;
        }

        var bindingHandlerThatControlsDescendantBindings;
        if (bindings) {
            // Return the value accessor for a given binding. When bindings are static (won't be updated because of a binding
            // context update), just return the value accessor from the binding. Otherwise, return a function that always gets
            // the latest binding value and registers a dependency on the binding updater.
            var getValueAccessor = bindingsUpdater
                ? function(bindingKey) {
                    return function() {
                        return evaluateValueAccessor(bindingsUpdater()[bindingKey]);
                    };
                } : function(bindingKey) {
                    return bindings[bindingKey];
                };

            // Use of allBindings as a function is maintained for backwards compatibility, but its use is deprecated
            function allBindings() {
                return ko.utils.objectMap(bindingsUpdater ? bindingsUpdater() : bindings, evaluateValueAccessor);
            }
            // The following is the 3.x allBindings API
            allBindings['get'] = function(key) {
                return bindings[key] && evaluateValueAccessor(getValueAccessor(key));
            };
            allBindings['has'] = function(key) {
                return key in bindings;
            };

            // First put the bindings into the right order
            var orderedBindings = topologicalSortBindings(bindings);

            // Go through the sorted bindings, calling init and update for each
            ko.utils.arrayForEach(orderedBindings, function(bindingKeyAndHandler) {
                // Note that topologicalSortBindings has already filtered out any nonexistent binding handlers,
                // so bindingKeyAndHandler.handler will always be nonnull.
                var handlerInitFn = bindingKeyAndHandler.handler["init"],
                    handlerUpdateFn = bindingKeyAndHandler.handler["update"],
                    bindingKey = bindingKeyAndHandler.key;

                if (node.nodeType === 8) {
                    validateThatBindingIsAllowedForVirtualElements(bindingKey);
                }

                try {
                    // Run init, ignoring any dependencies
                    if (typeof handlerInitFn == "function") {
                        ko.dependencyDetection.ignore(function() {
                            var initResult = handlerInitFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);

                            // If this binding handler claims to control descendant bindings, make a note of this
                            if (initResult && initResult['controlsDescendantBindings']) {
                                if (bindingHandlerThatControlsDescendantBindings !== undefined)
                                    throw new Error("Multiple bindings (" + bindingHandlerThatControlsDescendantBindings + " and " + bindingKey + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
                                bindingHandlerThatControlsDescendantBindings = bindingKey;
                            }
                        });
                    }

                    // Run update in its own computed wrapper
                    if (typeof handlerUpdateFn == "function") {
                        ko.dependentObservable(
                            function() {
                                handlerUpdateFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
                            },
                            null,
                            { disposeWhenNodeIsRemoved: node }
                        );
                    }
                } catch (ex) {
                    ex.message = "Unable to process binding \"" + bindingKey + ": " + bindings[bindingKey] + "\"\nMessage: " + ex.message;
                    throw ex;
                }
            });
        }

        return {
            'shouldBindDescendants': bindingHandlerThatControlsDescendantBindings === undefined
        };
    };

    var storedBindingContextDomDataKey = ko.utils.domData.nextKey();
    ko.storedBindingContextForNode = function (node, bindingContext) {
        if (arguments.length == 2) {
            ko.utils.domData.set(node, storedBindingContextDomDataKey, bindingContext);
            if (bindingContext._subscribable)
                bindingContext._subscribable._addNode(node);
        } else {
            return ko.utils.domData.get(node, storedBindingContextDomDataKey);
        }
    }

    function getBindingContext(viewModelOrBindingContext) {
        return viewModelOrBindingContext && (viewModelOrBindingContext instanceof ko.bindingContext)
            ? viewModelOrBindingContext
            : new ko.bindingContext(viewModelOrBindingContext);
    }

    ko.applyBindingAccessorsToNode = function (node, bindings, viewModelOrBindingContext) {
        if (node.nodeType === 1) // If it's an element, workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(node);
        return applyBindingsToNodeInternal(node, bindings, getBindingContext(viewModelOrBindingContext), true);
    };

    ko.applyBindingsToNode = function (node, bindings, viewModelOrBindingContext) {
        var context = getBindingContext(viewModelOrBindingContext);
        return ko.applyBindingAccessorsToNode(node, makeBindingAccessors(bindings, context, node), context);
    };

    ko.applyBindingsToDescendants = function(viewModelOrBindingContext, rootNode) {
        if (rootNode.nodeType === 1 || rootNode.nodeType === 8)
            applyBindingsToDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    ko.applyBindings = function (viewModelOrBindingContext, rootNode) {
        // If jQuery is loaded after Knockout, we won't initially have access to it. So save it here.
        if (!jQueryInstance && window['jQuery']) {
            jQueryInstance = window['jQuery'];
        }

        if (rootNode && (rootNode.nodeType !== 1) && (rootNode.nodeType !== 8))
            throw new Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
        rootNode = rootNode || window.document.body; // Make "rootNode" parameter optional

        applyBindingsToNodeAndDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    // Retrieving binding context from arbitrary nodes
    ko.contextFor = function(node) {
        // We can only do something meaningful for elements and comment nodes (in particular, not text nodes, as IE can't store domdata for them)
        switch (node.nodeType) {
            case 1:
            case 8:
                var context = ko.storedBindingContextForNode(node);
                if (context) return context;
                if (node.parentNode) return ko.contextFor(node.parentNode);
                break;
        }
        return undefined;
    };
    ko.dataFor = function(node) {
        var context = ko.contextFor(node);
        return context ? context['$data'] : undefined;
    };

    ko.exportSymbol('bindingHandlers', ko.bindingHandlers);
    ko.exportSymbol('applyBindings', ko.applyBindings);
    ko.exportSymbol('applyBindingsToDescendants', ko.applyBindingsToDescendants);
    ko.exportSymbol('applyBindingAccessorsToNode', ko.applyBindingAccessorsToNode);
    ko.exportSymbol('applyBindingsToNode', ko.applyBindingsToNode);
    ko.exportSymbol('contextFor', ko.contextFor);
    ko.exportSymbol('dataFor', ko.dataFor);
})();
(function(undefined) {
    var loadingSubscribablesCache = {}, // Tracks component loads that are currently in flight
        loadedDefinitionsCache = {};    // Tracks component loads that have already completed

    ko.components = {
        get: function(componentName, callback) {
            var cachedDefinition = getObjectOwnProperty(loadedDefinitionsCache, componentName);
            if (cachedDefinition) {
                // It's already loaded and cached. Reuse the same definition object.
                // Note that for API consistency, even cache hits complete asynchronously by default.
                // You can bypass this by putting synchronous:true on your component config.
                if (cachedDefinition.isSynchronousComponent) {
                    ko.dependencyDetection.ignore(function() { // See comment in loaderRegistryBehaviors.js for reasoning
                        callback(cachedDefinition.definition);
                    });
                } else {
                    setTimeout(function() { callback(cachedDefinition.definition); }, 0);
                }
            } else {
                // Join the loading process that is already underway, or start a new one.
                loadComponentAndNotify(componentName, callback);
            }
        },

        clearCachedDefinition: function(componentName) {
            delete loadedDefinitionsCache[componentName];
        },

        _getFirstResultFromLoaders: getFirstResultFromLoaders
    };

    function getObjectOwnProperty(obj, propName) {
        return obj.hasOwnProperty(propName) ? obj[propName] : undefined;
    }

    function loadComponentAndNotify(componentName, callback) {
        var subscribable = getObjectOwnProperty(loadingSubscribablesCache, componentName),
            completedAsync;
        if (!subscribable) {
            // It's not started loading yet. Start loading, and when it's done, move it to loadedDefinitionsCache.
            subscribable = loadingSubscribablesCache[componentName] = new ko.subscribable();
            subscribable.subscribe(callback);

            beginLoadingComponent(componentName, function(definition, config) {
                var isSynchronousComponent = !!(config && config['synchronous']);
                loadedDefinitionsCache[componentName] = { definition: definition, isSynchronousComponent: isSynchronousComponent };
                delete loadingSubscribablesCache[componentName];

                // For API consistency, all loads complete asynchronously. However we want to avoid
                // adding an extra setTimeout if it's unnecessary (i.e., the completion is already
                // async) since setTimeout(..., 0) still takes about 16ms or more on most browsers.
                //
                // You can bypass the 'always synchronous' feature by putting the synchronous:true
                // flag on your component configuration when you register it.
                if (completedAsync || isSynchronousComponent) {
                    // Note that notifySubscribers ignores any dependencies read within the callback.
                    // See comment in loaderRegistryBehaviors.js for reasoning
                    subscribable['notifySubscribers'](definition);
                } else {
                    setTimeout(function() {
                        subscribable['notifySubscribers'](definition);
                    }, 0);
                }
            });
            completedAsync = true;
        } else {
            subscribable.subscribe(callback);
        }
    }

    function beginLoadingComponent(componentName, callback) {
        getFirstResultFromLoaders('getConfig', [componentName], function(config) {
            if (config) {
                // We have a config, so now load its definition
                getFirstResultFromLoaders('loadComponent', [componentName, config], function(definition) {
                    callback(definition, config);
                });
            } else {
                // The component has no config - it's unknown to all the loaders.
                // Note that this is not an error (e.g., a module loading error) - that would abort the
                // process and this callback would not run. For this callback to run, all loaders must
                // have confirmed they don't know about this component.
                callback(null, null);
            }
        });
    }

    function getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders) {
        // On the first call in the stack, start with the full set of loaders
        if (!candidateLoaders) {
            candidateLoaders = ko.components['loaders'].slice(0); // Use a copy, because we'll be mutating this array
        }

        // Try the next candidate
        var currentCandidateLoader = candidateLoaders.shift();
        if (currentCandidateLoader) {
            var methodInstance = currentCandidateLoader[methodName];
            if (methodInstance) {
                var wasAborted = false,
                    synchronousReturnValue = methodInstance.apply(currentCandidateLoader, argsExceptCallback.concat(function(result) {
                        if (wasAborted) {
                            callback(null);
                        } else if (result !== null) {
                            // This candidate returned a value. Use it.
                            callback(result);
                        } else {
                            // Try the next candidate
                            getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
                        }
                    }));

                // Currently, loaders may not return anything synchronously. This leaves open the possibility
                // that we'll extend the API to support synchronous return values in the future. It won't be
                // a breaking change, because currently no loader is allowed to return anything except undefined.
                if (synchronousReturnValue !== undefined) {
                    wasAborted = true;

                    // Method to suppress exceptions will remain undocumented. This is only to keep
                    // KO's specs running tidily, since we can observe the loading got aborted without
                    // having exceptions cluttering up the console too.
                    if (!currentCandidateLoader['suppressLoaderExceptions']) {
                        throw new Error('Component loaders must supply values by invoking the callback, not by returning values synchronously.');
                    }
                }
            } else {
                // This candidate doesn't have the relevant handler. Synchronously move on to the next one.
                getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
            }
        } else {
            // No candidates returned a value
            callback(null);
        }
    }

    // Reference the loaders via string name so it's possible for developers
    // to replace the whole array by assigning to ko.components.loaders
    ko.components['loaders'] = [];

    ko.exportSymbol('components', ko.components);
    ko.exportSymbol('components.get', ko.components.get);
    ko.exportSymbol('components.clearCachedDefinition', ko.components.clearCachedDefinition);
})();
(function(undefined) {

    // The default loader is responsible for two things:
    // 1. Maintaining the default in-memory registry of component configuration objects
    //    (i.e., the thing you're writing to when you call ko.components.register(someName, ...))
    // 2. Answering requests for components by fetching configuration objects
    //    from that default in-memory registry and resolving them into standard
    //    component definition objects (of the form { createViewModel: ..., template: ... })
    // Custom loaders may override either of these facilities, i.e.,
    // 1. To supply configuration objects from some other source (e.g., conventions)
    // 2. Or, to resolve configuration objects by loading viewmodels/templates via arbitrary logic.

    var defaultConfigRegistry = {};

    ko.components.register = function(componentName, config) {
        if (!config) {
            throw new Error('Invalid configuration for ' + componentName);
        }

        if (ko.components.isRegistered(componentName)) {
            throw new Error('Component ' + componentName + ' is already registered');
        }

        defaultConfigRegistry[componentName] = config;
    }

    ko.components.isRegistered = function(componentName) {
        return componentName in defaultConfigRegistry;
    }

    ko.components.unregister = function(componentName) {
        delete defaultConfigRegistry[componentName];
        ko.components.clearCachedDefinition(componentName);
    }

    ko.components.defaultLoader = {
        'getConfig': function(componentName, callback) {
            var result = defaultConfigRegistry.hasOwnProperty(componentName)
                ? defaultConfigRegistry[componentName]
                : null;
            callback(result);
        },

        'loadComponent': function(componentName, config, callback) {
            var errorCallback = makeErrorCallback(componentName);
            possiblyGetConfigFromAmd(errorCallback, config, function(loadedConfig) {
                resolveConfig(componentName, errorCallback, loadedConfig, callback);
            });
        },

        'loadTemplate': function(componentName, templateConfig, callback) {
            resolveTemplate(makeErrorCallback(componentName), templateConfig, callback);
        },

        'loadViewModel': function(componentName, viewModelConfig, callback) {
            resolveViewModel(makeErrorCallback(componentName), viewModelConfig, callback);
        }
    };

    var createViewModelKey = 'createViewModel';

    // Takes a config object of the form { template: ..., viewModel: ... }, and asynchronously convert it
    // into the standard component definition format:
    //    { template: <ArrayOfDomNodes>, createViewModel: function(params, componentInfo) { ... } }.
    // Since both template and viewModel may need to be resolved asynchronously, both tasks are performed
    // in parallel, and the results joined when both are ready. We don't depend on any promises infrastructure,
    // so this is implemented manually below.
    function resolveConfig(componentName, errorCallback, config, callback) {
        var result = {},
            makeCallBackWhenZero = 2,
            tryIssueCallback = function() {
                if (--makeCallBackWhenZero === 0) {
                    callback(result);
                }
            },
            templateConfig = config['template'],
            viewModelConfig = config['viewModel'];

        if (templateConfig) {
            possiblyGetConfigFromAmd(errorCallback, templateConfig, function(loadedConfig) {
                ko.components._getFirstResultFromLoaders('loadTemplate', [componentName, loadedConfig], function(resolvedTemplate) {
                    result['template'] = resolvedTemplate;
                    tryIssueCallback();
                });
            });
        } else {
            tryIssueCallback();
        }

        if (viewModelConfig) {
            possiblyGetConfigFromAmd(errorCallback, viewModelConfig, function(loadedConfig) {
                ko.components._getFirstResultFromLoaders('loadViewModel', [componentName, loadedConfig], function(resolvedViewModel) {
                    result[createViewModelKey] = resolvedViewModel;
                    tryIssueCallback();
                });
            });
        } else {
            tryIssueCallback();
        }
    }

    function resolveTemplate(errorCallback, templateConfig, callback) {
        if (typeof templateConfig === 'string') {
            // Markup - parse it
            callback(ko.utils.parseHtmlFragment(templateConfig));
        } else if (templateConfig instanceof Array) {
            // Assume already an array of DOM nodes - pass through unchanged
            callback(templateConfig);
        } else if (isDocumentFragment(templateConfig)) {
            // Document fragment - use its child nodes
            callback(ko.utils.makeArray(templateConfig.childNodes));
        } else if (templateConfig['element']) {
            var element = templateConfig['element'];
            if (isDomElement(element)) {
                // Element instance - copy its child nodes
                callback(cloneNodesFromTemplateSourceElement(element));
            } else if (typeof element === 'string') {
                // Element ID - find it, then copy its child nodes
                var elemInstance = document.getElementById(element);
                if (elemInstance) {
                    callback(cloneNodesFromTemplateSourceElement(elemInstance));
                } else {
                    errorCallback('Cannot find element with ID ' + element);
                }
            } else {
                errorCallback('Unknown element type: ' + element);
            }
        } else {
            errorCallback('Unknown template value: ' + templateConfig);
        }
    }

    function resolveViewModel(errorCallback, viewModelConfig, callback) {
        if (typeof viewModelConfig === 'function') {
            // Constructor - convert to standard factory function format
            // By design, this does *not* supply componentInfo to the constructor, as the intent is that
            // componentInfo contains non-viewmodel data (e.g., the component's element) that should only
            // be used in factory functions, not viewmodel constructors.
            callback(function (params /*, componentInfo */) {
                return new viewModelConfig(params);
            });
        } else if (typeof viewModelConfig[createViewModelKey] === 'function') {
            // Already a factory function - use it as-is
            callback(viewModelConfig[createViewModelKey]);
        } else if ('instance' in viewModelConfig) {
            // Fixed object instance - promote to createViewModel format for API consistency
            var fixedInstance = viewModelConfig['instance'];
            callback(function (params, componentInfo) {
                return fixedInstance;
            });
        } else if ('viewModel' in viewModelConfig) {
            // Resolved AMD module whose value is of the form { viewModel: ... }
            resolveViewModel(errorCallback, viewModelConfig['viewModel'], callback);
        } else {
            errorCallback('Unknown viewModel value: ' + viewModelConfig);
        }
    }

    function cloneNodesFromTemplateSourceElement(elemInstance) {
        switch (ko.utils.tagNameLower(elemInstance)) {
            case 'script':
                return ko.utils.parseHtmlFragment(elemInstance.text);
            case 'textarea':
                return ko.utils.parseHtmlFragment(elemInstance.value);
            case 'template':
                // For browsers with proper <template> element support (i.e., where the .content property
                // gives a document fragment), use that document fragment.
                if (isDocumentFragment(elemInstance.content)) {
                    return ko.utils.cloneNodes(elemInstance.content.childNodes);
                }
        }

        // Regular elements such as <div>, and <template> elements on old browsers that don't really
        // understand <template> and just treat it as a regular container
        return ko.utils.cloneNodes(elemInstance.childNodes);
    }

    function isDomElement(obj) {
        if (window['HTMLElement']) {
            return obj instanceof HTMLElement;
        } else {
            return obj && obj.tagName && obj.nodeType === 1;
        }
    }

    function isDocumentFragment(obj) {
        if (window['DocumentFragment']) {
            return obj instanceof DocumentFragment;
        } else {
            return obj && obj.nodeType === 11;
        }
    }

    function possiblyGetConfigFromAmd(errorCallback, config, callback) {
        if (typeof config['require'] === 'string') {
            // The config is the value of an AMD module
            if (amdRequire || window['require']) {
                (amdRequire || window['require'])([config['require']], callback);
            } else {
                errorCallback('Uses require, but no AMD loader is present');
            }
        } else {
            callback(config);
        }
    }

    function makeErrorCallback(componentName) {
        return function (message) {
            throw new Error('Component \'' + componentName + '\': ' + message);
        };
    }

    ko.exportSymbol('components.register', ko.components.register);
    ko.exportSymbol('components.isRegistered', ko.components.isRegistered);
    ko.exportSymbol('components.unregister', ko.components.unregister);

    // Expose the default loader so that developers can directly ask it for configuration
    // or to resolve configuration
    ko.exportSymbol('components.defaultLoader', ko.components.defaultLoader);

    // By default, the default loader is the only registered component loader
    ko.components['loaders'].push(ko.components.defaultLoader);

    // Privately expose the underlying config registry for use in old-IE shim
    ko.components._allRegisteredComponents = defaultConfigRegistry;
})();
(function (undefined) {
    // Overridable API for determining which component name applies to a given node. By overriding this,
    // you can for example map specific tagNames to components that are not preregistered.
    ko.components['getComponentNameForNode'] = function(node) {
        var tagNameLower = ko.utils.tagNameLower(node);
        return ko.components.isRegistered(tagNameLower) && tagNameLower;
    };

    ko.components.addBindingsForCustomElement = function(allBindings, node, bindingContext, valueAccessors) {
        // Determine if it's really a custom element matching a component
        if (node.nodeType === 1) {
            var componentName = ko.components['getComponentNameForNode'](node);
            if (componentName) {
                // It does represent a component, so add a component binding for it
                allBindings = allBindings || {};

                if (allBindings['component']) {
                    // Avoid silently overwriting some other 'component' binding that may already be on the element
                    throw new Error('Cannot use the "component" binding on a custom element matching a component');
                }

                var componentBindingValue = { 'name': componentName, 'params': getComponentParamsFromCustomElement(node, bindingContext) };

                allBindings['component'] = valueAccessors
                    ? function() { return componentBindingValue; }
                    : componentBindingValue;
            }
        }

        return allBindings;
    }

    var nativeBindingProviderInstance = new ko.bindingProvider();

    function getComponentParamsFromCustomElement(elem, bindingContext) {
        var paramsAttribute = elem.getAttribute('params');

        if (paramsAttribute) {
            var params = nativeBindingProviderInstance['parseBindingsString'](paramsAttribute, bindingContext, elem, { 'valueAccessors': true, 'bindingParams': true }),
                rawParamComputedValues = ko.utils.objectMap(params, function(paramValue, paramName) {
                    return ko.computed(paramValue, null, { disposeWhenNodeIsRemoved: elem });
                }),
                result = ko.utils.objectMap(rawParamComputedValues, function(paramValueComputed, paramName) {
                    var paramValue = paramValueComputed.peek();
                    // Does the evaluation of the parameter value unwrap any observables?
                    if (!paramValueComputed.isActive()) {
                        // No it doesn't, so there's no need for any computed wrapper. Just pass through the supplied value directly.
                        // Example: "someVal: firstName, age: 123" (whether or not firstName is an observable/computed)
                        return paramValue;
                    } else {
                        // Yes it does. Supply a computed property that unwraps both the outer (binding expression)
                        // level of observability, and any inner (resulting model value) level of observability.
                        // This means the component doesn't have to worry about multiple unwrapping. If the value is a
                        // writable observable, the computed will also be writable and pass the value on to the observable.
                        return ko.computed({
                            'read': function() {
                                return ko.utils.unwrapObservable(paramValueComputed());
                            },
                            'write': ko.isWriteableObservable(paramValue) && function(value) {
                                paramValueComputed()(value);
                            },
                            disposeWhenNodeIsRemoved: elem
                        });
                    }
                });

            // Give access to the raw computeds, as long as that wouldn't overwrite any custom param also called '$raw'
            // This is in case the developer wants to react to outer (binding) observability separately from inner
            // (model value) observability, or in case the model value observable has subobservables.
            if (!result.hasOwnProperty('$raw')) {
                result['$raw'] = rawParamComputedValues;
            }

            return result;
        } else {
            // For consistency, absence of a "params" attribute is treated the same as the presence of
            // any empty one. Otherwise component viewmodels need special code to check whether or not
            // 'params' or 'params.$raw' is null/undefined before reading subproperties, which is annoying.
            return { '$raw': {} };
        }
    }

    // --------------------------------------------------------------------------------
    // Compatibility code for older (pre-HTML5) IE browsers

    if (ko.utils.ieVersion < 9) {
        // Whenever you preregister a component, enable it as a custom element in the current document
        ko.components['register'] = (function(originalFunction) {
            return function(componentName) {
                document.createElement(componentName); // Allows IE<9 to parse markup containing the custom element
                return originalFunction.apply(this, arguments);
            }
        })(ko.components['register']);

        // Whenever you create a document fragment, enable all preregistered component names as custom elements
        // This is needed to make innerShiv/jQuery HTML parsing correctly handle the custom elements
        document.createDocumentFragment = (function(originalFunction) {
            return function() {
                var newDocFrag = originalFunction(),
                    allComponents = ko.components._allRegisteredComponents;
                for (var componentName in allComponents) {
                    if (allComponents.hasOwnProperty(componentName)) {
                        newDocFrag.createElement(componentName);
                    }
                }
                return newDocFrag;
            };
        })(document.createDocumentFragment);
    }
})();(function(undefined) {

    var componentLoadingOperationUniqueId = 0;

    ko.bindingHandlers['component'] = {
        'init': function(element, valueAccessor, ignored1, ignored2, bindingContext) {
            var currentViewModel,
                currentLoadingOperationId,
                disposeAssociatedComponentViewModel = function () {
                    var currentViewModelDispose = currentViewModel && currentViewModel['dispose'];
                    if (typeof currentViewModelDispose === 'function') {
                        currentViewModelDispose.call(currentViewModel);
                    }

                    // Any in-flight loading operation is no longer relevant, so make sure we ignore its completion
                    currentLoadingOperationId = null;
                },
                originalChildNodes = ko.utils.makeArray(ko.virtualElements.childNodes(element));

            ko.utils.domNodeDisposal.addDisposeCallback(element, disposeAssociatedComponentViewModel);

            ko.computed(function () {
                var value = ko.utils.unwrapObservable(valueAccessor()),
                    componentName, componentParams;

                if (typeof value === 'string') {
                    componentName = value;
                } else {
                    componentName = ko.utils.unwrapObservable(value['name']);
                    componentParams = ko.utils.unwrapObservable(value['params']);
                }

                if (!componentName) {
                    throw new Error('No component name specified');
                }

                var loadingOperationId = currentLoadingOperationId = ++componentLoadingOperationUniqueId;
                ko.components.get(componentName, function(componentDefinition) {
                    // If this is not the current load operation for this element, ignore it.
                    if (currentLoadingOperationId !== loadingOperationId) {
                        return;
                    }

                    // Clean up previous state
                    disposeAssociatedComponentViewModel();

                    // Instantiate and bind new component. Implicitly this cleans any old DOM nodes.
                    if (!componentDefinition) {
                        throw new Error('Unknown component \'' + componentName + '\'');
                    }
                    cloneTemplateIntoElement(componentName, componentDefinition, element);
                    var componentViewModel = createViewModel(componentDefinition, element, originalChildNodes, componentParams),
                        childBindingContext = bindingContext['createChildContext'](componentViewModel, /* dataItemAlias */ undefined, function(ctx) {
                            ctx['$component'] = componentViewModel;
                            ctx['$componentTemplateNodes'] = originalChildNodes;
                        });
                    currentViewModel = componentViewModel;
                    ko.applyBindingsToDescendants(childBindingContext, element);
                });
            }, null, { disposeWhenNodeIsRemoved: element });

            return { 'controlsDescendantBindings': true };
        }
    };

    ko.virtualElements.allowedBindings['component'] = true;

    function cloneTemplateIntoElement(componentName, componentDefinition, element) {
        var template = componentDefinition['template'];
        if (!template) {
            throw new Error('Component \'' + componentName + '\' has no template');
        }

        var clonedNodesArray = ko.utils.cloneNodes(template);
        ko.virtualElements.setDomNodeChildren(element, clonedNodesArray);
    }

    function createViewModel(componentDefinition, element, originalChildNodes, componentParams) {
        var componentViewModelFactory = componentDefinition['createViewModel'];
        return componentViewModelFactory
            ? componentViewModelFactory.call(componentDefinition, componentParams, { 'element': element, 'templateNodes': originalChildNodes })
            : componentParams; // Template-only component
    }

})();
var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
ko.bindingHandlers['attr'] = {
    'update': function(element, valueAccessor, allBindings) {
        var value = ko.utils.unwrapObservable(valueAccessor()) || {};
        ko.utils.objectForEach(value, function(attrName, attrValue) {
            attrValue = ko.utils.unwrapObservable(attrValue);

            // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
            // when someProp is a "no value"-like value (strictly null, false, or undefined)
            // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
            var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
            if (toRemove)
                element.removeAttribute(attrName);

            // In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
            // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
            // but instead of figuring out the mode, we'll just set the attribute through the Javascript
            // property for IE <= 8.
            if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
                attrName = attrHtmlToJavascriptMap[attrName];
                if (toRemove)
                    element.removeAttribute(attrName);
                else
                    element[attrName] = attrValue;
            } else if (!toRemove) {
                element.setAttribute(attrName, attrValue.toString());
            }

            // Treat "name" specially - although you can think of it as an attribute, it also needs
            // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
            // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
            // entirely, and there's no strong reason to allow for such casing in HTML.
            if (attrName === "name") {
                ko.utils.setElementName(element, toRemove ? "" : attrValue.toString());
            }
        });
    }
};
(function() {

ko.bindingHandlers['checked'] = {
    'after': ['value', 'attr'],
    'init': function (element, valueAccessor, allBindings) {
        var checkedValue = ko.pureComputed(function() {
            // Treat "value" like "checkedValue" when it is included with "checked" binding
            if (allBindings['has']('checkedValue')) {
                return ko.utils.unwrapObservable(allBindings.get('checkedValue'));
            } else if (allBindings['has']('value')) {
                return ko.utils.unwrapObservable(allBindings.get('value'));
            }

            return element.value;
        });

        function updateModel() {
            // This updates the model value from the view value.
            // It runs in response to DOM events (click) and changes in checkedValue.
            var isChecked = element.checked,
                elemValue = useCheckedValue ? checkedValue() : isChecked;

            // When we're first setting up this computed, don't change any model state.
            if (ko.computedContext.isInitial()) {
                return;
            }

            // We can ignore unchecked radio buttons, because some other radio
            // button will be getting checked, and that one can take care of updating state.
            if (isRadio && !isChecked) {
                return;
            }

            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
            if (isValueArray) {
                if (oldElemValue !== elemValue) {
                    // When we're responding to the checkedValue changing, and the element is
                    // currently checked, replace the old elem value with the new elem value
                    // in the model array.
                    if (isChecked) {
                        ko.utils.addOrRemoveItem(modelValue, elemValue, true);
                        ko.utils.addOrRemoveItem(modelValue, oldElemValue, false);
                    }

                    oldElemValue = elemValue;
                } else {
                    // When we're responding to the user having checked/unchecked a checkbox,
                    // add/remove the element value to the model array.
                    ko.utils.addOrRemoveItem(modelValue, elemValue, isChecked);
                }
            } else {
                ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'checked', elemValue, true);
            }
        };

        function updateView() {
            // This updates the view value from the model value.
            // It runs in response to changes in the bound (checked) value.
            var modelValue = ko.utils.unwrapObservable(valueAccessor());

            if (isValueArray) {
                // When a checkbox is bound to an array, being checked represents its value being present in that array
                element.checked = ko.utils.arrayIndexOf(modelValue, checkedValue()) >= 0;
            } else if (isCheckbox) {
                // When a checkbox is bound to any other value (not an array), being checked represents the value being trueish
                element.checked = modelValue;
            } else {
                // For radio buttons, being checked means that the radio button's value corresponds to the model value
                element.checked = (checkedValue() === modelValue);
            }
        };

        var isCheckbox = element.type == "checkbox",
            isRadio = element.type == "radio";

        // Only bind to check boxes and radio buttons
        if (!isCheckbox && !isRadio) {
            return;
        }

        var isValueArray = isCheckbox && (ko.utils.unwrapObservable(valueAccessor()) instanceof Array),
            oldElemValue = isValueArray ? checkedValue() : undefined,
            useCheckedValue = isRadio || isValueArray;

        // IE 6 won't allow radio buttons to be selected unless they have a name
        if (isRadio && !element.name)
            ko.bindingHandlers['uniqueName']['init'](element, function() { return true });

        // Set up two computeds to update the binding:

        // The first responds to changes in the checkedValue value and to element clicks
        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
        ko.utils.registerEventHandler(element, "click", updateModel);

        // The second responds to changes in the model value (the one associated with the checked binding)
        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
    }
};
ko.expressionRewriting.twoWayBindings['checked'] = true;

ko.bindingHandlers['checkedValue'] = {
    'update': function (element, valueAccessor) {
        element.value = ko.utils.unwrapObservable(valueAccessor());
    }
};

})();var classesWrittenByBindingKey = '__ko__cssValue';
ko.bindingHandlers['css'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value !== null && typeof value == "object") {
            ko.utils.objectForEach(value, function(className, shouldHaveClass) {
                shouldHaveClass = ko.utils.unwrapObservable(shouldHaveClass);
                ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
            });
        } else {
            value = String(value || ''); // Make sure we don't try to store or set a non-string value
            ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
            element[classesWrittenByBindingKey] = value;
            ko.utils.toggleDomNodeCssClass(element, value, true);
        }
    }
};
ko.bindingHandlers['enable'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value && element.disabled)
            element.removeAttribute("disabled");
        else if ((!value) && (!element.disabled))
            element.disabled = true;
    }
};

ko.bindingHandlers['disable'] = {
    'update': function (element, valueAccessor) {
        ko.bindingHandlers['enable']['update'](element, function() { return !ko.utils.unwrapObservable(valueAccessor()) });
    }
};
// For certain common events (currently just 'click'), allow a simplified data-binding syntax
// e.g. click:handler instead of the usual full-length event:{click:handler}
function makeEventHandlerShortcut(eventName) {
    ko.bindingHandlers[eventName] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var newValueAccessor = function () {
                var result = {};
                result[eventName] = valueAccessor();
                return result;
            };
            return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
        }
    }
}

ko.bindingHandlers['event'] = {
    'init' : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var eventsToHandle = valueAccessor() || {};
        ko.utils.objectForEach(eventsToHandle, function(eventName) {
            if (typeof eventName == "string") {
                ko.utils.registerEventHandler(element, eventName, function (event) {
                    var handlerReturnValue;
                    var handlerFunction = valueAccessor()[eventName];
                    if (!handlerFunction)
                        return;

                    try {
                        // Take all the event args, and prefix with the viewmodel
                        var argsForHandler = ko.utils.makeArray(arguments);
                        viewModel = bindingContext['$data'];
                        argsForHandler.unshift(viewModel);
                        handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);
                    } finally {
                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                            if (event.preventDefault)
                                event.preventDefault();
                            else
                                event.returnValue = false;
                        }
                    }

                    var bubble = allBindings.get(eventName + 'Bubble') !== false;
                    if (!bubble) {
                        event.cancelBubble = true;
                        if (event.stopPropagation)
                            event.stopPropagation();
                    }
                });
            }
        });
    }
};
// "foreach: someExpression" is equivalent to "template: { foreach: someExpression }"
// "foreach: { data: someExpression, afterAdd: myfn }" is equivalent to "template: { foreach: someExpression, afterAdd: myfn }"
ko.bindingHandlers['foreach'] = {
    makeTemplateValueAccessor: function(valueAccessor) {
        return function() {
            var modelValue = valueAccessor(),
                unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

            // If unwrappedValue is the array, pass in the wrapped value on its own
            // The value will be unwrapped and tracked within the template binding
            // (See https://github.com/SteveSanderson/knockout/issues/523)
            if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
                return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

            // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
            ko.utils.unwrapObservable(modelValue);
            return {
                'foreach': unwrappedValue['data'],
                'as': unwrappedValue['as'],
                'includeDestroyed': unwrappedValue['includeDestroyed'],
                'afterAdd': unwrappedValue['afterAdd'],
                'beforeRemove': unwrappedValue['beforeRemove'],
                'afterRender': unwrappedValue['afterRender'],
                'beforeMove': unwrappedValue['beforeMove'],
                'afterMove': unwrappedValue['afterMove'],
                'templateEngine': ko.nativeTemplateEngine.instance
            };
        };
    },
    'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['init'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor));
    },
    'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['update'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    }
};
ko.expressionRewriting.bindingRewriteValidators['foreach'] = false; // Can't rewrite control flow bindings
ko.virtualElements.allowedBindings['foreach'] = true;
var hasfocusUpdatingProperty = '__ko_hasfocusUpdating';
var hasfocusLastValue = '__ko_hasfocusLastValue';
ko.bindingHandlers['hasfocus'] = {
    'init': function(element, valueAccessor, allBindings) {
        var handleElementFocusChange = function(isFocused) {
            // Where possible, ignore which event was raised and determine focus state using activeElement,
            // as this avoids phantom focus/blur events raised when changing tabs in modern browsers.
            // However, not all KO-targeted browsers (Firefox 2) support activeElement. For those browsers,
            // prevent a loss of focus when changing tabs/windows by setting a flag that prevents hasfocus
            // from calling 'blur()' on the element when it loses focus.
            // Discussion at https://github.com/SteveSanderson/knockout/pull/352
            element[hasfocusUpdatingProperty] = true;
            var ownerDoc = element.ownerDocument;
            if ("activeElement" in ownerDoc) {
                var active;
                try {
                    active = ownerDoc.activeElement;
                } catch(e) {
                    // IE9 throws if you access activeElement during page load (see issue #703)
                    active = ownerDoc.body;
                }
                isFocused = (active === element);
            }
            var modelValue = valueAccessor();
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'hasfocus', isFocused, true);

            //cache the latest value, so we can avoid unnecessarily calling focus/blur in the update function
            element[hasfocusLastValue] = isFocused;
            element[hasfocusUpdatingProperty] = false;
        };
        var handleElementFocusIn = handleElementFocusChange.bind(null, true);
        var handleElementFocusOut = handleElementFocusChange.bind(null, false);

        ko.utils.registerEventHandler(element, "focus", handleElementFocusIn);
        ko.utils.registerEventHandler(element, "focusin", handleElementFocusIn); // For IE
        ko.utils.registerEventHandler(element, "blur",  handleElementFocusOut);
        ko.utils.registerEventHandler(element, "focusout",  handleElementFocusOut); // For IE
    },
    'update': function(element, valueAccessor) {
        var value = !!ko.utils.unwrapObservable(valueAccessor()); //force boolean to compare with last value
        if (!element[hasfocusUpdatingProperty] && element[hasfocusLastValue] !== value) {
            value ? element.focus() : element.blur();
            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, value ? "focusin" : "focusout"]); // For IE, which doesn't reliably fire "focus" or "blur" events synchronously
        }
    }
};
ko.expressionRewriting.twoWayBindings['hasfocus'] = true;

ko.bindingHandlers['hasFocus'] = ko.bindingHandlers['hasfocus']; // Make "hasFocus" an alias
ko.expressionRewriting.twoWayBindings['hasFocus'] = true;
ko.bindingHandlers['html'] = {
    'init': function() {
        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor) {
        // setHtml will unwrap the value if needed
        ko.utils.setHtml(element, valueAccessor());
    }
};
// Makes a binding like with or if
function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback) {
    ko.bindingHandlers[bindingKey] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var didDisplayOnLastUpdate,
                savedNodes;
            ko.computed(function() {
                var dataValue = ko.utils.unwrapObservable(valueAccessor()),
                    shouldDisplay = !isNot !== !dataValue, // equivalent to isNot ? !dataValue : !!dataValue
                    isFirstRender = !savedNodes,
                    needsRefresh = isFirstRender || isWith || (shouldDisplay !== didDisplayOnLastUpdate);

                if (needsRefresh) {
                    // Save a copy of the inner nodes on the initial update, but only if we have dependencies.
                    if (isFirstRender && ko.computedContext.getDependenciesCount()) {
                        savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
                    }

                    if (shouldDisplay) {
                        if (!isFirstRender) {
                            ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(savedNodes));
                        }
                        ko.applyBindingsToDescendants(makeContextCallback ? makeContextCallback(bindingContext, dataValue) : bindingContext, element);
                    } else {
                        ko.virtualElements.emptyNode(element);
                    }

                    didDisplayOnLastUpdate = shouldDisplay;
                }
            }, null, { disposeWhenNodeIsRemoved: element });
            return { 'controlsDescendantBindings': true };
        }
    };
    ko.expressionRewriting.bindingRewriteValidators[bindingKey] = false; // Can't rewrite control flow bindings
    ko.virtualElements.allowedBindings[bindingKey] = true;
}

// Construct the actual binding handlers
makeWithIfBinding('if');
makeWithIfBinding('ifnot', false /* isWith */, true /* isNot */);
makeWithIfBinding('with', true /* isWith */, false /* isNot */,
    function(bindingContext, dataValue) {
        return bindingContext['createChildContext'](dataValue);
    }
);
var captionPlaceholder = {};
ko.bindingHandlers['options'] = {
    'init': function(element) {
        if (ko.utils.tagNameLower(element) !== "select")
            throw new Error("options binding applies only to SELECT elements");

        // Remove all existing <option>s.
        while (element.length > 0) {
            element.remove(0);
        }

        // Ensures that the binding processor doesn't try to bind the options
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor, allBindings) {
        function selectedOptions() {
            return ko.utils.arrayFilter(element.options, function (node) { return node.selected; });
        }

        var selectWasPreviouslyEmpty = element.length == 0,
            multiple = element.multiple,
            previousScrollTop = (!selectWasPreviouslyEmpty && multiple) ? element.scrollTop : null,
            unwrappedArray = ko.utils.unwrapObservable(valueAccessor()),
            valueAllowUnset = allBindings.get('valueAllowUnset') && allBindings['has']('value'),
            includeDestroyed = allBindings.get('optionsIncludeDestroyed'),
            arrayToDomNodeChildrenOptions = {},
            captionValue,
            filteredArray,
            previousSelectedValues = [];

        if (!valueAllowUnset) {
            if (multiple) {
                previousSelectedValues = ko.utils.arrayMap(selectedOptions(), ko.selectExtensions.readValue);
            } else if (element.selectedIndex >= 0) {
                previousSelectedValues.push(ko.selectExtensions.readValue(element.options[element.selectedIndex]));
            }
        }

        if (unwrappedArray) {
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return includeDestroyed || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // If caption is included, add it to the array
            if (allBindings['has']('optionsCaption')) {
                captionValue = ko.utils.unwrapObservable(allBindings.get('optionsCaption'));
                // If caption value is null or undefined, don't show a caption
                if (captionValue !== null && captionValue !== undefined) {
                    filteredArray.unshift(captionPlaceholder);
                }
            }
        } else {
            // If a falsy value is provided (e.g. null), we'll simply empty the select element
        }

        function applyToObject(object, predicate, defaultValue) {
            var predicateType = typeof predicate;
            if (predicateType == "function")    // Given a function; run it against the data value
                return predicate(object);
            else if (predicateType == "string") // Given a string; treat it as a property name on the data value
                return object[predicate];
            else                                // Given no optionsText arg; use the data value itself
                return defaultValue;
        }

        // The following functions can run at two different times:
        // The first is when the whole array is being updated directly from this binding handler.
        // The second is when an observable value for a specific array entry is updated.
        // oldOptions will be empty in the first case, but will be filled with the previously generated option in the second.
        var itemUpdate = false;
        function optionForArrayItem(arrayEntry, index, oldOptions) {
            if (oldOptions.length) {
                previousSelectedValues = !valueAllowUnset && oldOptions[0].selected ? [ ko.selectExtensions.readValue(oldOptions[0]) ] : [];
                itemUpdate = true;
            }
            var option = element.ownerDocument.createElement("option");
            if (arrayEntry === captionPlaceholder) {
                ko.utils.setTextContent(option, allBindings.get('optionsCaption'));
                ko.selectExtensions.writeValue(option, undefined);
            } else {
                // Apply a value to the option element
                var optionValue = applyToObject(arrayEntry, allBindings.get('optionsValue'), arrayEntry);
                ko.selectExtensions.writeValue(option, ko.utils.unwrapObservable(optionValue));

                // Apply some text to the option element
                var optionText = applyToObject(arrayEntry, allBindings.get('optionsText'), optionValue);
                ko.utils.setTextContent(option, optionText);
            }
            return [option];
        }

        // By using a beforeRemove callback, we delay the removal until after new items are added. This fixes a selection
        // problem in IE<=8 and Firefox. See https://github.com/knockout/knockout/issues/1208
        arrayToDomNodeChildrenOptions['beforeRemove'] =
            function (option) {
                element.removeChild(option);
            };

        function setSelectionCallback(arrayEntry, newOptions) {
            if (itemUpdate && valueAllowUnset) {
                // The model value is authoritative, so make sure its value is the one selected
                // There is no need to use dependencyDetection.ignore since setDomNodeChildrenFromArrayMapping does so already.
                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
            } else if (previousSelectedValues.length) {
                // IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
                // That's why we first added them without selection. Now it's time to set the selection.
                var isSelected = ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[0])) >= 0;
                ko.utils.setOptionNodeSelectionState(newOptions[0], isSelected);

                // If this option was changed from being selected during a single-item update, notify the change
                if (itemUpdate && !isSelected) {
                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
                }
            }
        }

        var callback = setSelectionCallback;
        if (allBindings['has']('optionsAfterRender') && typeof allBindings.get('optionsAfterRender') == "function") {
            callback = function(arrayEntry, newOptions) {
                setSelectionCallback(arrayEntry, newOptions);
                ko.dependencyDetection.ignore(allBindings.get('optionsAfterRender'), null, [newOptions[0], arrayEntry !== captionPlaceholder ? arrayEntry : undefined]);
            }
        }

        ko.utils.setDomNodeChildrenFromArrayMapping(element, filteredArray, optionForArrayItem, arrayToDomNodeChildrenOptions, callback);

        ko.dependencyDetection.ignore(function () {
            if (valueAllowUnset) {
                // The model value is authoritative, so make sure its value is the one selected
                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
            } else {
                // Determine if the selection has changed as a result of updating the options list
                var selectionChanged;
                if (multiple) {
                    // For a multiple-select box, compare the new selection count to the previous one
                    // But if nothing was selected before, the selection can't have changed
                    selectionChanged = previousSelectedValues.length && selectedOptions().length < previousSelectedValues.length;
                } else {
                    // For a single-select box, compare the current value to the previous value
                    // But if nothing was selected before or nothing is selected now, just look for a change in selection
                    selectionChanged = (previousSelectedValues.length && element.selectedIndex >= 0)
                        ? (ko.selectExtensions.readValue(element.options[element.selectedIndex]) !== previousSelectedValues[0])
                        : (previousSelectedValues.length || element.selectedIndex >= 0);
                }

                // Ensure consistency between model value and selected option.
                // If the dropdown was changed so that selection is no longer the same,
                // notify the value or selectedOptions binding.
                if (selectionChanged) {
                    ko.utils.triggerEvent(element, "change");
                }
            }
        });

        // Workaround for IE bug
        ko.utils.ensureSelectElementIsRenderedCorrectly(element);

        if (previousScrollTop && Math.abs(previousScrollTop - element.scrollTop) > 20)
            element.scrollTop = previousScrollTop;
    }
};
ko.bindingHandlers['options'].optionValueDomDataKey = ko.utils.domData.nextKey();
ko.bindingHandlers['selectedOptions'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        ko.utils.registerEventHandler(element, "change", function () {
            var value = valueAccessor(), valueToWrite = [];
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                if (node.selected)
                    valueToWrite.push(ko.selectExtensions.readValue(node));
            });
            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
        });
    },
    'update': function (element, valueAccessor) {
        if (ko.utils.tagNameLower(element) != "select")
            throw new Error("values binding applies only to SELECT elements");

        var newValue = ko.utils.unwrapObservable(valueAccessor());
        if (newValue && typeof newValue.length == "number") {
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
                ko.utils.setOptionNodeSelectionState(node, isSelected);
            });
        }
    }
};
ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
ko.bindingHandlers['style'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor() || {});
        ko.utils.objectForEach(value, function(styleName, styleValue) {
            styleValue = ko.utils.unwrapObservable(styleValue);

            if (styleValue === null || styleValue === undefined || styleValue === false) {
                // Empty string removes the value, whereas null/undefined have no effect
                styleValue = "";
            }

            element.style[styleName] = styleValue;
        });
    }
};
ko.bindingHandlers['submit'] = {
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        if (typeof valueAccessor() != "function")
            throw new Error("The value for a submit binding must be a function");
        ko.utils.registerEventHandler(element, "submit", function (event) {
            var handlerReturnValue;
            var value = valueAccessor();
            try { handlerReturnValue = value.call(bindingContext['$data'], element); }
            finally {
                if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                    if (event.preventDefault)
                        event.preventDefault();
                    else
                        event.returnValue = false;
                }
            }
        });
    }
};
ko.bindingHandlers['text'] = {
    'init': function() {
        // Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
        // It should also make things faster, as we no longer have to consider whether the text node might be bindable.
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor) {
        ko.utils.setTextContent(element, valueAccessor());
    }
};
ko.virtualElements.allowedBindings['text'] = true;
(function () {

if (window && window.navigator) {
    var parseVersion = function (matches) {
        if (matches) {
            return parseFloat(matches[1]);
        }
    };

    // Detect various browser versions because some old versions don't fully support the 'input' event
    var operaVersion = window.opera && window.opera.version && parseInt(window.opera.version()),
        userAgent = window.navigator.userAgent,
        safariVersion = parseVersion(userAgent.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i)),
        firefoxVersion = parseVersion(userAgent.match(/Firefox\/([^ ]*)/));
}

// IE 8 and 9 have bugs that prevent the normal events from firing when the value changes.
// But it does fire the 'selectionchange' event on many of those, presumably because the
// cursor is moving and that counts as the selection changing. The 'selectionchange' event is
// fired at the document level only and doesn't directly indicate which element changed. We
// set up just one event handler for the document and use 'activeElement' to determine which
// element was changed.
if (ko.utils.ieVersion < 10) {
    var selectionChangeRegisteredName = ko.utils.domData.nextKey(),
        selectionChangeHandlerName = ko.utils.domData.nextKey();
    var selectionChangeHandler = function(event) {
        var target = this.activeElement,
            handler = target && ko.utils.domData.get(target, selectionChangeHandlerName);
        if (handler) {
            handler(event);
        }
    };
    var registerForSelectionChangeEvent = function (element, handler) {
        var ownerDoc = element.ownerDocument;
        if (!ko.utils.domData.get(ownerDoc, selectionChangeRegisteredName)) {
            ko.utils.domData.set(ownerDoc, selectionChangeRegisteredName, true);
            ko.utils.registerEventHandler(ownerDoc, 'selectionchange', selectionChangeHandler);
        }
        ko.utils.domData.set(element, selectionChangeHandlerName, handler);
    };
}

ko.bindingHandlers['textInput'] = {
    'init': function (element, valueAccessor, allBindings) {

        var previousElementValue = element.value,
            timeoutHandle,
            elementValueBeforeEvent;

        var updateModel = function (event) {
            clearTimeout(timeoutHandle);
            elementValueBeforeEvent = timeoutHandle = undefined;

            var elementValue = element.value;
            if (previousElementValue !== elementValue) {
                // Provide a way for tests to know exactly which event was processed
                if (DEBUG && event) element['_ko_textInputProcessedEvent'] = event.type;
                previousElementValue = elementValue;
                ko.expressionRewriting.writeValueToProperty(valueAccessor(), allBindings, 'textInput', elementValue);
            }
        };

        var deferUpdateModel = function (event) {
            if (!timeoutHandle) {
                // The elementValueBeforeEvent variable is set *only* during the brief gap between an
                // event firing and the updateModel function running. This allows us to ignore model
                // updates that are from the previous state of the element, usually due to techniques
                // such as rateLimit. Such updates, if not ignored, can cause keystrokes to be lost.
                elementValueBeforeEvent = element.value;
                var handler = DEBUG ? updateModel.bind(element, {type: event.type}) : updateModel;
                timeoutHandle = setTimeout(handler, 4);
            }
        };

        var updateView = function () {
            var modelValue = ko.utils.unwrapObservable(valueAccessor());

            if (modelValue === null || modelValue === undefined) {
                modelValue = '';
            }

            if (elementValueBeforeEvent !== undefined && modelValue === elementValueBeforeEvent) {
                setTimeout(updateView, 4);
                return;
            }

            // Update the element only if the element and model are different. On some browsers, updating the value
            // will move the cursor to the end of the input, which would be bad while the user is typing.
            if (element.value !== modelValue) {
                previousElementValue = modelValue;  // Make sure we ignore events (propertychange) that result from updating the value
                element.value = modelValue;
            }
        };

        var onEvent = function (event, handler) {
            ko.utils.registerEventHandler(element, event, handler);
        };

        if (DEBUG && ko.bindingHandlers['textInput']['_forceUpdateOn']) {
            // Provide a way for tests to specify exactly which events are bound
            ko.utils.arrayForEach(ko.bindingHandlers['textInput']['_forceUpdateOn'], function(eventName) {
                if (eventName.slice(0,5) == 'after') {
                    onEvent(eventName.slice(5), deferUpdateModel);
                } else {
                    onEvent(eventName, updateModel);
                }
            });
        } else {
            if (ko.utils.ieVersion < 10) {
                // Internet Explorer <= 8 doesn't support the 'input' event, but does include 'propertychange' that fires whenever
                // any property of an element changes. Unlike 'input', it also fires if a property is changed from JavaScript code,
                // but that's an acceptable compromise for this binding. IE 9 does support 'input', but since it doesn't fire it
                // when using autocomplete, we'll use 'propertychange' for it also.
                onEvent('propertychange', function(event) {
                    if (event.propertyName === 'value') {
                        updateModel(event);
                    }
                });

                if (ko.utils.ieVersion == 8) {
                    // IE 8 has a bug where it fails to fire 'propertychange' on the first update following a value change from
                    // JavaScript code. It also doesn't fire if you clear the entire value. To fix this, we bind to the following
                    // events too.
                    onEvent('keyup', updateModel);      // A single keystoke
                    onEvent('keydown', updateModel);    // The first character when a key is held down
                }
                if (ko.utils.ieVersion >= 8) {
                    // Internet Explorer 9 doesn't fire the 'input' event when deleting text, including using
                    // the backspace, delete, or ctrl-x keys, clicking the 'x' to clear the input, dragging text
                    // out of the field, and cutting or deleting text using the context menu. 'selectionchange'
                    // can detect all of those except dragging text out of the field, for which we use 'dragend'.
                    // These are also needed in IE8 because of the bug described above.
                    registerForSelectionChangeEvent(element, updateModel);  // 'selectionchange' covers cut, paste, drop, delete, etc.
                    onEvent('dragend', deferUpdateModel);
                }
            } else {
                // All other supported browsers support the 'input' event, which fires whenever the content of the element is changed
                // through the user interface.
                onEvent('input', updateModel);

                if (safariVersion < 5 && ko.utils.tagNameLower(element) === "textarea") {
                    // Safari <5 doesn't fire the 'input' event for <textarea> elements (it does fire 'textInput'
                    // but only when typing). So we'll just catch as much as we can with keydown, cut, and paste.
                    onEvent('keydown', deferUpdateModel);
                    onEvent('paste', deferUpdateModel);
                    onEvent('cut', deferUpdateModel);
                } else if (operaVersion < 11) {
                    // Opera 10 doesn't always fire the 'input' event for cut, paste, undo & drop operations.
                    // We can try to catch some of those using 'keydown'.
                    onEvent('keydown', deferUpdateModel);
                } else if (firefoxVersion < 4.0) {
                    // Firefox <= 3.6 doesn't fire the 'input' event when text is filled in through autocomplete
                    onEvent('DOMAutoComplete', updateModel);

                    // Firefox <=3.5 doesn't fire the 'input' event when text is dropped into the input.
                    onEvent('dragdrop', updateModel);       // <3.5
                    onEvent('drop', updateModel);           // 3.5
                }
            }
        }

        // Bind to the change event so that we can catch programmatic updates of the value that fire this event.
        onEvent('change', updateModel);

        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
    }
};
ko.expressionRewriting.twoWayBindings['textInput'] = true;

// textinput is an alias for textInput
ko.bindingHandlers['textinput'] = {
    // preprocess is the only way to set up a full alias
    'preprocess': function (value, name, addBinding) {
        addBinding('textInput', value);
    }
};

})();ko.bindingHandlers['uniqueName'] = {
    'init': function (element, valueAccessor) {
        if (valueAccessor()) {
            var name = "ko_unique_" + (++ko.bindingHandlers['uniqueName'].currentIndex);
            ko.utils.setElementName(element, name);
        }
    }
};
ko.bindingHandlers['uniqueName'].currentIndex = 0;
ko.bindingHandlers['value'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        // If the value binding is placed on a radio/checkbox, then just pass through to checkedValue and quit
        if (element.tagName.toLowerCase() == "input" && (element.type == "checkbox" || element.type == "radio")) {
            ko.applyBindingAccessorsToNode(element, { 'checkedValue': valueAccessor });
            return;
        }

        // Always catch "change" event; possibly other events too if asked
        var eventsToCatch = ["change"];
        var requestedEventsToCatch = allBindings.get("valueUpdate");
        var propertyChangedFired = false;
        var elementValueBeforeEvent = null;

        if (requestedEventsToCatch) {
            if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
                requestedEventsToCatch = [requestedEventsToCatch];
            ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
            eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
        }

        var valueUpdateHandler = function() {
            elementValueBeforeEvent = null;
            propertyChangedFired = false;
            var modelValue = valueAccessor();
            var elementValue = ko.selectExtensions.readValue(element);
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'value', elementValue);
        }

        // Workaround for https://github.com/SteveSanderson/knockout/issues/122
        // IE doesn't fire "change" events on textboxes if the user selects a value from its autocomplete list
        var ieAutoCompleteHackNeeded = ko.utils.ieVersion && element.tagName.toLowerCase() == "input" && element.type == "text"
                                       && element.autocomplete != "off" && (!element.form || element.form.autocomplete != "off");
        if (ieAutoCompleteHackNeeded && ko.utils.arrayIndexOf(eventsToCatch, "propertychange") == -1) {
            ko.utils.registerEventHandler(element, "propertychange", function () { propertyChangedFired = true });
            ko.utils.registerEventHandler(element, "focus", function () { propertyChangedFired = false });
            ko.utils.registerEventHandler(element, "blur", function() {
                if (propertyChangedFired) {
                    valueUpdateHandler();
                }
            });
        }

        ko.utils.arrayForEach(eventsToCatch, function(eventName) {
            // The syntax "after<eventname>" means "run the handler asynchronously after the event"
            // This is useful, for example, to catch "keydown" events after the browser has updated the control
            // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
            var handler = valueUpdateHandler;
            if (ko.utils.stringStartsWith(eventName, "after")) {
                handler = function() {
                    // The elementValueBeforeEvent variable is non-null *only* during the brief gap between
                    // a keyX event firing and the valueUpdateHandler running, which is scheduled to happen
                    // at the earliest asynchronous opportunity. We store this temporary information so that
                    // if, between keyX and valueUpdateHandler, the underlying model value changes separately,
                    // we can overwrite that model value change with the value the user just typed. Otherwise,
                    // techniques like rateLimit can trigger model changes at critical moments that will
                    // override the user's inputs, causing keystrokes to be lost.
                    elementValueBeforeEvent = ko.selectExtensions.readValue(element);
                    setTimeout(valueUpdateHandler, 0);
                };
                eventName = eventName.substring("after".length);
            }
            ko.utils.registerEventHandler(element, eventName, handler);
        });

        var updateFromModel = function () {
            var newValue = ko.utils.unwrapObservable(valueAccessor());
            var elementValue = ko.selectExtensions.readValue(element);

            if (elementValueBeforeEvent !== null && newValue === elementValueBeforeEvent) {
                setTimeout(updateFromModel, 0);
                return;
            }

            var valueHasChanged = (newValue !== elementValue);

            if (valueHasChanged) {
                if (ko.utils.tagNameLower(element) === "select") {
                    var allowUnset = allBindings.get('valueAllowUnset');
                    var applyValueAction = function () {
                        ko.selectExtensions.writeValue(element, newValue, allowUnset);
                    };
                    applyValueAction();

                    if (!allowUnset && newValue !== ko.selectExtensions.readValue(element)) {
                        // If you try to set a model value that can't be represented in an already-populated dropdown, reject that change,
                        // because you're not allowed to have a model value that disagrees with a visible UI selection.
                        ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
                    } else {
                        // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
                        // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
                        // to apply the value as well.
                        setTimeout(applyValueAction, 0);
                    }
                } else {
                    ko.selectExtensions.writeValue(element, newValue);
                }
            }
        };

        ko.computed(updateFromModel, null, { disposeWhenNodeIsRemoved: element });
    },
    'update': function() {} // Keep for backwards compatibility with code that may have wrapped value binding
};
ko.expressionRewriting.twoWayBindings['value'] = true;
ko.bindingHandlers['visible'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible)
            element.style.display = "";
        else if ((!value) && isCurrentlyVisible)
            element.style.display = "none";
    }
};
// 'click' is just a shorthand for the usual full-length event:{click:handler}
makeEventHandlerShortcut('click');
// If you want to make a custom template engine,
//
// [1] Inherit from this class (like ko.nativeTemplateEngine does)
// [2] Override 'renderTemplateSource', supplying a function with this signature:
//
//        function (templateSource, bindingContext, options) {
//            // - templateSource.text() is the text of the template you should render
//            // - bindingContext.$data is the data you should pass into the template
//            //   - you might also want to make bindingContext.$parent, bindingContext.$parents,
//            //     and bindingContext.$root available in the template too
//            // - options gives you access to any other properties set on "data-bind: { template: options }"
//            // - templateDocument is the document object of the template
//            //
//            // Return value: an array of DOM nodes
//        }
//
// [3] Override 'createJavaScriptEvaluatorBlock', supplying a function with this signature:
//
//        function (script) {
//            // Return value: Whatever syntax means "Evaluate the JavaScript statement 'script' and output the result"
//            //               For example, the jquery.tmpl template engine converts 'someScript' to '${ someScript }'
//        }
//
//     This is only necessary if you want to allow data-bind attributes to reference arbitrary template variables.
//     If you don't want to allow that, you can set the property 'allowTemplateRewriting' to false (like ko.nativeTemplateEngine does)
//     and then you don't need to override 'createJavaScriptEvaluatorBlock'.

ko.templateEngine = function () { };

ko.templateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
    throw new Error("Override renderTemplateSource");
};

ko.templateEngine.prototype['createJavaScriptEvaluatorBlock'] = function (script) {
    throw new Error("Override createJavaScriptEvaluatorBlock");
};

ko.templateEngine.prototype['makeTemplateSource'] = function(template, templateDocument) {
    // Named template
    if (typeof template == "string") {
        templateDocument = templateDocument || document;
        var elem = templateDocument.getElementById(template);
        if (!elem)
            throw new Error("Cannot find template with ID " + template);
        return new ko.templateSources.domElement(elem);
    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
        // Anonymous template
        return new ko.templateSources.anonymousTemplate(template);
    } else
        throw new Error("Unknown template type: " + template);
};

ko.templateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    return this['renderTemplateSource'](templateSource, bindingContext, options, templateDocument);
};

ko.templateEngine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
    // Skip rewriting if requested
    if (this['allowTemplateRewriting'] === false)
        return true;
    return this['makeTemplateSource'](template, templateDocument)['data']("isRewritten");
};

ko.templateEngine.prototype['rewriteTemplate'] = function (template, rewriterCallback, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    var rewritten = rewriterCallback(templateSource['text']());
    templateSource['text'](rewritten);
    templateSource['data']("isRewritten", true);
};

ko.exportSymbol('templateEngine', ko.templateEngine);

ko.templateRewriting = (function () {
    var memoizeDataBindingAttributeSyntaxRegex = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi;
    var memoizeVirtualContainerBindingSyntaxRegex = /<!--\s*ko\b\s*([\s\S]*?)\s*-->/g;

    function validateDataBindValuesForRewriting(keyValueArray) {
        var allValidators = ko.expressionRewriting.bindingRewriteValidators;
        for (var i = 0; i < keyValueArray.length; i++) {
            var key = keyValueArray[i]['key'];
            if (allValidators.hasOwnProperty(key)) {
                var validator = allValidators[key];

                if (typeof validator === "function") {
                    var possibleErrorMessage = validator(keyValueArray[i]['value']);
                    if (possibleErrorMessage)
                        throw new Error(possibleErrorMessage);
                } else if (!validator) {
                    throw new Error("This template engine does not support the '" + key + "' binding within its templates");
                }
            }
        }
    }

    function constructMemoizedTagReplacement(dataBindAttributeValue, tagToRetain, nodeName, templateEngine) {
        var dataBindKeyValueArray = ko.expressionRewriting.parseObjectLiteral(dataBindAttributeValue);
        validateDataBindValuesForRewriting(dataBindKeyValueArray);
        var rewrittenDataBindAttributeValue = ko.expressionRewriting.preProcessBindings(dataBindKeyValueArray, {'valueAccessors':true});

        // For no obvious reason, Opera fails to evaluate rewrittenDataBindAttributeValue unless it's wrapped in an additional
        // anonymous function, even though Opera's built-in debugger can evaluate it anyway. No other browser requires this
        // extra indirection.
        var applyBindingsToNextSiblingScript =
            "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + rewrittenDataBindAttributeValue + " } })()},'" + nodeName.toLowerCase() + "')";
        return templateEngine['createJavaScriptEvaluatorBlock'](applyBindingsToNextSiblingScript) + tagToRetain;
    }

    return {
        ensureTemplateIsRewritten: function (template, templateEngine, templateDocument) {
            if (!templateEngine['isTemplateRewritten'](template, templateDocument))
                templateEngine['rewriteTemplate'](template, function (htmlString) {
                    return ko.templateRewriting.memoizeBindingAttributeSyntax(htmlString, templateEngine);
                }, templateDocument);
        },

        memoizeBindingAttributeSyntax: function (htmlString, templateEngine) {
            return htmlString.replace(memoizeDataBindingAttributeSyntaxRegex, function () {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[4], /* tagToRetain: */ arguments[1], /* nodeName: */ arguments[2], templateEngine);
            }).replace(memoizeVirtualContainerBindingSyntaxRegex, function() {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[1], /* tagToRetain: */ "<!-- ko -->", /* nodeName: */ "#comment", templateEngine);
            });
        },

        applyMemoizedBindingsToNextSibling: function (bindings, nodeName) {
            return ko.memoization.memoize(function (domNode, bindingContext) {
                var nodeToBind = domNode.nextSibling;
                if (nodeToBind && nodeToBind.nodeName.toLowerCase() === nodeName) {
                    ko.applyBindingAccessorsToNode(nodeToBind, bindings, bindingContext);
                }
            });
        }
    }
})();


// Exported only because it has to be referenced by string lookup from within rewritten template
ko.exportSymbol('__tr_ambtns', ko.templateRewriting.applyMemoizedBindingsToNextSibling);
(function() {
    // A template source represents a read/write way of accessing a template. This is to eliminate the need for template loading/saving
    // logic to be duplicated in every template engine (and means they can all work with anonymous templates, etc.)
    //
    // Two are provided by default:
    //  1. ko.templateSources.domElement       - reads/writes the text content of an arbitrary DOM element
    //  2. ko.templateSources.anonymousElement - uses ko.utils.domData to read/write text *associated* with the DOM element, but
    //                                           without reading/writing the actual element text content, since it will be overwritten
    //                                           with the rendered template output.
    // You can implement your own template source if you want to fetch/store templates somewhere other than in DOM elements.
    // Template sources need to have the following functions:
    //   text() 			- returns the template text from your storage location
    //   text(value)		- writes the supplied template text to your storage location
    //   data(key)			- reads values stored using data(key, value) - see below
    //   data(key, value)	- associates "value" with this template and the key "key". Is used to store information like "isRewritten".
    //
    // Optionally, template sources can also have the following functions:
    //   nodes()            - returns a DOM element containing the nodes of this template, where available
    //   nodes(value)       - writes the given DOM element to your storage location
    // If a DOM element is available for a given template source, template engines are encouraged to use it in preference over text()
    // for improved speed. However, all templateSources must supply text() even if they don't supply nodes().
    //
    // Once you've implemented a templateSource, make your template engine use it by subclassing whatever template engine you were
    // using and overriding "makeTemplateSource" to return an instance of your custom template source.

    ko.templateSources = {};

    // ---- ko.templateSources.domElement -----

    ko.templateSources.domElement = function(element) {
        this.domElement = element;
    }

    ko.templateSources.domElement.prototype['text'] = function(/* valueToWrite */) {
        var tagNameLower = ko.utils.tagNameLower(this.domElement),
            elemContentsProperty = tagNameLower === "script" ? "text"
                                 : tagNameLower === "textarea" ? "value"
                                 : "innerHTML";

        if (arguments.length == 0) {
            return this.domElement[elemContentsProperty];
        } else {
            var valueToWrite = arguments[0];
            if (elemContentsProperty === "innerHTML")
                ko.utils.setHtml(this.domElement, valueToWrite);
            else
                this.domElement[elemContentsProperty] = valueToWrite;
        }
    };

    var dataDomDataPrefix = ko.utils.domData.nextKey() + "_";
    ko.templateSources.domElement.prototype['data'] = function(key /*, valueToWrite */) {
        if (arguments.length === 1) {
            return ko.utils.domData.get(this.domElement, dataDomDataPrefix + key);
        } else {
            ko.utils.domData.set(this.domElement, dataDomDataPrefix + key, arguments[1]);
        }
    };

    // ---- ko.templateSources.anonymousTemplate -----
    // Anonymous templates are normally saved/retrieved as DOM nodes through "nodes".
    // For compatibility, you can also read "text"; it will be serialized from the nodes on demand.
    // Writing to "text" is still supported, but then the template data will not be available as DOM nodes.

    var anonymousTemplatesDomDataKey = ko.utils.domData.nextKey();
    ko.templateSources.anonymousTemplate = function(element) {
        this.domElement = element;
    }
    ko.templateSources.anonymousTemplate.prototype = new ko.templateSources.domElement();
    ko.templateSources.anonymousTemplate.prototype.constructor = ko.templateSources.anonymousTemplate;
    ko.templateSources.anonymousTemplate.prototype['text'] = function(/* valueToWrite */) {
        if (arguments.length == 0) {
            var templateData = ko.utils.domData.get(this.domElement, anonymousTemplatesDomDataKey) || {};
            if (templateData.textData === undefined && templateData.containerData)
                templateData.textData = templateData.containerData.innerHTML;
            return templateData.textData;
        } else {
            var valueToWrite = arguments[0];
            ko.utils.domData.set(this.domElement, anonymousTemplatesDomDataKey, {textData: valueToWrite});
        }
    };
    ko.templateSources.domElement.prototype['nodes'] = function(/* valueToWrite */) {
        if (arguments.length == 0) {
            var templateData = ko.utils.domData.get(this.domElement, anonymousTemplatesDomDataKey) || {};
            return templateData.containerData;
        } else {
            var valueToWrite = arguments[0];
            ko.utils.domData.set(this.domElement, anonymousTemplatesDomDataKey, {containerData: valueToWrite});
        }
    };

    ko.exportSymbol('templateSources', ko.templateSources);
    ko.exportSymbol('templateSources.domElement', ko.templateSources.domElement);
    ko.exportSymbol('templateSources.anonymousTemplate', ko.templateSources.anonymousTemplate);
})();
(function () {
    var _templateEngine;
    ko.setTemplateEngine = function (templateEngine) {
        if ((templateEngine != undefined) && !(templateEngine instanceof ko.templateEngine))
            throw new Error("templateEngine must inherit from ko.templateEngine");
        _templateEngine = templateEngine;
    }

    function invokeForEachNodeInContinuousRange(firstNode, lastNode, action) {
        var node, nextInQueue = firstNode, firstOutOfRangeNode = ko.virtualElements.nextSibling(lastNode);
        while (nextInQueue && ((node = nextInQueue) !== firstOutOfRangeNode)) {
            nextInQueue = ko.virtualElements.nextSibling(node);
            action(node, nextInQueue);
        }
    }

    function activateBindingsOnContinuousNodeArray(continuousNodeArray, bindingContext) {
        // To be used on any nodes that have been rendered by a template and have been inserted into some parent element
        // Walks through continuousNodeArray (which *must* be continuous, i.e., an uninterrupted sequence of sibling nodes, because
        // the algorithm for walking them relies on this), and for each top-level item in the virtual-element sense,
        // (1) Does a regular "applyBindings" to associate bindingContext with this node and to activate any non-memoized bindings
        // (2) Unmemoizes any memos in the DOM subtree (e.g., to activate bindings that had been memoized during template rewriting)

        if (continuousNodeArray.length) {
            var firstNode = continuousNodeArray[0],
                lastNode = continuousNodeArray[continuousNodeArray.length - 1],
                parentNode = firstNode.parentNode,
                provider = ko.bindingProvider['instance'],
                preprocessNode = provider['preprocessNode'];

            if (preprocessNode) {
                invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node, nextNodeInRange) {
                    var nodePreviousSibling = node.previousSibling;
                    var newNodes = preprocessNode.call(provider, node);
                    if (newNodes) {
                        if (node === firstNode)
                            firstNode = newNodes[0] || nextNodeInRange;
                        if (node === lastNode)
                            lastNode = newNodes[newNodes.length - 1] || nodePreviousSibling;
                    }
                });

                // Because preprocessNode can change the nodes, including the first and last nodes, update continuousNodeArray to match.
                // We need the full set, including inner nodes, because the unmemoize step might remove the first node (and so the real
                // first node needs to be in the array).
                continuousNodeArray.length = 0;
                if (!firstNode) { // preprocessNode might have removed all the nodes, in which case there's nothing left to do
                    return;
                }
                if (firstNode === lastNode) {
                    continuousNodeArray.push(firstNode);
                } else {
                    continuousNodeArray.push(firstNode, lastNode);
                    ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
                }
            }

            // Need to applyBindings *before* unmemoziation, because unmemoization might introduce extra nodes (that we don't want to re-bind)
            // whereas a regular applyBindings won't introduce new memoized nodes
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.applyBindings(bindingContext, node);
            });
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.memoization.unmemoizeDomNodeAndDescendants(node, [bindingContext]);
            });

            // Make sure any changes done by applyBindings or unmemoize are reflected in the array
            ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
        }
    }

    function getFirstNodeFromPossibleArray(nodeOrNodeArray) {
        return nodeOrNodeArray.nodeType ? nodeOrNodeArray
                                        : nodeOrNodeArray.length > 0 ? nodeOrNodeArray[0]
                                        : null;
    }

    function executeTemplate(targetNodeOrNodeArray, renderMode, template, bindingContext, options) {
        options = options || {};
        var firstTargetNode = targetNodeOrNodeArray && getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
        var templateDocument = (firstTargetNode || template || {}).ownerDocument;
        var templateEngineToUse = (options['templateEngine'] || _templateEngine);
        ko.templateRewriting.ensureTemplateIsRewritten(template, templateEngineToUse, templateDocument);
        var renderedNodesArray = templateEngineToUse['renderTemplate'](template, bindingContext, options, templateDocument);

        // Loosely check result is an array of DOM nodes
        if ((typeof renderedNodesArray.length != "number") || (renderedNodesArray.length > 0 && typeof renderedNodesArray[0].nodeType != "number"))
            throw new Error("Template engine must return an array of DOM nodes");

        var haveAddedNodesToParent = false;
        switch (renderMode) {
            case "replaceChildren":
                ko.virtualElements.setDomNodeChildren(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "replaceNode":
                ko.utils.replaceDomNodes(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "ignoreTargetNode": break;
            default:
                throw new Error("Unknown renderMode: " + renderMode);
        }

        if (haveAddedNodesToParent) {
            activateBindingsOnContinuousNodeArray(renderedNodesArray, bindingContext);
            if (options['afterRender'])
                ko.dependencyDetection.ignore(options['afterRender'], null, [renderedNodesArray, bindingContext['$data']]);
        }

        return renderedNodesArray;
    }

    function resolveTemplateName(template, data, context) {
        // The template can be specified as:
        if (ko.isObservable(template)) {
            // 1. An observable, with string value
            return template();
        } else if (typeof template === 'function') {
            // 2. A function of (data, context) returning a string
            return template(data, context);
        } else {
            // 3. A string
            return template;
        }
    }

    ko.renderTemplate = function (template, dataOrBindingContext, options, targetNodeOrNodeArray, renderMode) {
        options = options || {};
        if ((options['templateEngine'] || _templateEngine) == undefined)
            throw new Error("Set a template engine before calling renderTemplate");
        renderMode = renderMode || "replaceChildren";

        if (targetNodeOrNodeArray) {
            var firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);

            var whenToDispose = function () { return (!firstTargetNode) || !ko.utils.domNodeIsAttachedToDocument(firstTargetNode); }; // Passive disposal (on next evaluation)
            var activelyDisposeWhenNodeIsRemoved = (firstTargetNode && renderMode == "replaceNode") ? firstTargetNode.parentNode : firstTargetNode;

            return ko.dependentObservable( // So the DOM is automatically updated when any dependency changes
                function () {
                    // Ensure we've got a proper binding context to work with
                    var bindingContext = (dataOrBindingContext && (dataOrBindingContext instanceof ko.bindingContext))
                        ? dataOrBindingContext
                        : new ko.bindingContext(ko.utils.unwrapObservable(dataOrBindingContext));

                    var templateName = resolveTemplateName(template, bindingContext['$data'], bindingContext),
                        renderedNodesArray = executeTemplate(targetNodeOrNodeArray, renderMode, templateName, bindingContext, options);

                    if (renderMode == "replaceNode") {
                        targetNodeOrNodeArray = renderedNodesArray;
                        firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
                    }
                },
                null,
                { disposeWhen: whenToDispose, disposeWhenNodeIsRemoved: activelyDisposeWhenNodeIsRemoved }
            );
        } else {
            // We don't yet have a DOM node to evaluate, so use a memo and render the template later when there is a DOM node
            return ko.memoization.memoize(function (domNode) {
                ko.renderTemplate(template, dataOrBindingContext, options, domNode, "replaceNode");
            });
        }
    };

    ko.renderTemplateForEach = function (template, arrayOrObservableArray, options, targetNode, parentBindingContext) {
        // Since setDomNodeChildrenFromArrayMapping always calls executeTemplateForArrayItem and then
        // activateBindingsCallback for added items, we can store the binding context in the former to use in the latter.
        var arrayItemContext;

        // This will be called by setDomNodeChildrenFromArrayMapping to get the nodes to add to targetNode
        var executeTemplateForArrayItem = function (arrayValue, index) {
            // Support selecting template as a function of the data being rendered
            arrayItemContext = parentBindingContext['createChildContext'](arrayValue, options['as'], function(context) {
                context['$index'] = index;
            });

            var templateName = resolveTemplateName(template, arrayValue, arrayItemContext);
            return executeTemplate(null, "ignoreTargetNode", templateName, arrayItemContext, options);
        }

        // This will be called whenever setDomNodeChildrenFromArrayMapping has added nodes to targetNode
        var activateBindingsCallback = function(arrayValue, addedNodesArray, index) {
            activateBindingsOnContinuousNodeArray(addedNodesArray, arrayItemContext);
            if (options['afterRender'])
                options['afterRender'](addedNodesArray, arrayValue);

            // release the "cache" variable, so that it can be collected by
            // the GC when its value isn't used from within the bindings anymore.
            arrayItemContext = null;
        };

        return ko.dependentObservable(function () {
            var unwrappedArray = ko.utils.unwrapObservable(arrayOrObservableArray) || [];
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return options['includeDestroyed'] || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // Call setDomNodeChildrenFromArrayMapping, ignoring any observables unwrapped within (most likely from a callback function).
            // If the array items are observables, though, they will be unwrapped in executeTemplateForArrayItem and managed within setDomNodeChildrenFromArrayMapping.
            ko.dependencyDetection.ignore(ko.utils.setDomNodeChildrenFromArrayMapping, null, [targetNode, filteredArray, executeTemplateForArrayItem, options, activateBindingsCallback]);

        }, null, { disposeWhenNodeIsRemoved: targetNode });
    };

    var templateComputedDomDataKey = ko.utils.domData.nextKey();
    function disposeOldComputedAndStoreNewOne(element, newComputed) {
        var oldComputed = ko.utils.domData.get(element, templateComputedDomDataKey);
        if (oldComputed && (typeof(oldComputed.dispose) == 'function'))
            oldComputed.dispose();
        ko.utils.domData.set(element, templateComputedDomDataKey, (newComputed && newComputed.isActive()) ? newComputed : undefined);
    }

    ko.bindingHandlers['template'] = {
        'init': function(element, valueAccessor) {
            // Support anonymous templates
            var bindingValue = ko.utils.unwrapObservable(valueAccessor());
            if (typeof bindingValue == "string" || bindingValue['name']) {
                // It's a named template - clear the element
                ko.virtualElements.emptyNode(element);
            } else if ('nodes' in bindingValue) {
                // We've been given an array of DOM nodes. Save them as the template source.
                // There is no known use case for the node array being an observable array (if the output
                // varies, put that behavior *into* your template - that's what templates are for), and
                // the implementation would be a mess, so assert that it's not observable.
                var nodes = bindingValue['nodes'] || [];
                if (ko.isObservable(nodes)) {
                    throw new Error('The "nodes" option must be a plain, non-observable array.');
                }
                var container = ko.utils.moveCleanedNodesToContainerElement(nodes); // This also removes the nodes from their current parent
                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
            } else {
                // It's an anonymous template - store the element contents, then clear the element
                var templateNodes = ko.virtualElements.childNodes(element),
                    container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent
                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
            }
            return { 'controlsDescendantBindings': true };
        },
        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor(),
                dataValue,
                options = ko.utils.unwrapObservable(value),
                shouldDisplay = true,
                templateComputed = null,
                templateName;

            if (typeof options == "string") {
                templateName = value;
                options = {};
            } else {
                templateName = options['name'];

                // Support "if"/"ifnot" conditions
                if ('if' in options)
                    shouldDisplay = ko.utils.unwrapObservable(options['if']);
                if (shouldDisplay && 'ifnot' in options)
                    shouldDisplay = !ko.utils.unwrapObservable(options['ifnot']);

                dataValue = ko.utils.unwrapObservable(options['data']);
            }

            if ('foreach' in options) {
                // Render once for each data point (treating data set as empty if shouldDisplay==false)
                var dataArray = (shouldDisplay && options['foreach']) || [];
                templateComputed = ko.renderTemplateForEach(templateName || element, dataArray, options, element, bindingContext);
            } else if (!shouldDisplay) {
                ko.virtualElements.emptyNode(element);
            } else {
                // Render once for this single data point (or use the viewModel if no data was provided)
                var innerBindingContext = ('data' in options) ?
                    bindingContext['createChildContext'](dataValue, options['as']) :  // Given an explitit 'data' value, we create a child binding context for it
                    bindingContext;                                                        // Given no explicit 'data' value, we retain the same binding context
                templateComputed = ko.renderTemplate(templateName || element, innerBindingContext, options, element);
            }

            // It only makes sense to have a single template computed per element (otherwise which one should have its output displayed?)
            disposeOldComputedAndStoreNewOne(element, templateComputed);
        }
    };

    // Anonymous templates can't be rewritten. Give a nice error message if you try to do it.
    ko.expressionRewriting.bindingRewriteValidators['template'] = function(bindingValue) {
        var parsedBindingValue = ko.expressionRewriting.parseObjectLiteral(bindingValue);

        if ((parsedBindingValue.length == 1) && parsedBindingValue[0]['unknown'])
            return null; // It looks like a string literal, not an object literal, so treat it as a named template (which is allowed for rewriting)

        if (ko.expressionRewriting.keyValueArrayContainsKey(parsedBindingValue, "name"))
            return null; // Named templates can be rewritten, so return "no error"
        return "This template engine does not support anonymous templates nested within its templates";
    };

    ko.virtualElements.allowedBindings['template'] = true;
})();

ko.exportSymbol('setTemplateEngine', ko.setTemplateEngine);
ko.exportSymbol('renderTemplate', ko.renderTemplate);
// Go through the items that have been added and deleted and try to find matches between them.
ko.utils.findMovesInArrayComparison = function (left, right, limitFailedCompares) {
    if (left.length && right.length) {
        var failedCompares, l, r, leftItem, rightItem;
        for (failedCompares = l = 0; (!limitFailedCompares || failedCompares < limitFailedCompares) && (leftItem = left[l]); ++l) {
            for (r = 0; rightItem = right[r]; ++r) {
                if (leftItem['value'] === rightItem['value']) {
                    leftItem['moved'] = rightItem['index'];
                    rightItem['moved'] = leftItem['index'];
                    right.splice(r, 1);         // This item is marked as moved; so remove it from right list
                    failedCompares = r = 0;     // Reset failed compares count because we're checking for consecutive failures
                    break;
                }
            }
            failedCompares += r;
        }
    }
};

ko.utils.compareArrays = (function () {
    var statusNotInOld = 'added', statusNotInNew = 'deleted';

    // Simple calculation based on Levenshtein distance.
    function compareArrays(oldArray, newArray, options) {
        // For backward compatibility, if the third arg is actually a bool, interpret
        // it as the old parameter 'dontLimitMoves'. Newer code should use { dontLimitMoves: true }.
        options = (typeof options === 'boolean') ? { 'dontLimitMoves': options } : (options || {});
        oldArray = oldArray || [];
        newArray = newArray || [];

        if (oldArray.length <= newArray.length)
            return compareSmallArrayToBigArray(oldArray, newArray, statusNotInOld, statusNotInNew, options);
        else
            return compareSmallArrayToBigArray(newArray, oldArray, statusNotInNew, statusNotInOld, options);
    }

    function compareSmallArrayToBigArray(smlArray, bigArray, statusNotInSml, statusNotInBig, options) {
        var myMin = Math.min,
            myMax = Math.max,
            editDistanceMatrix = [],
            smlIndex, smlIndexMax = smlArray.length,
            bigIndex, bigIndexMax = bigArray.length,
            compareRange = (bigIndexMax - smlIndexMax) || 1,
            maxDistance = smlIndexMax + bigIndexMax + 1,
            thisRow, lastRow,
            bigIndexMaxForRow, bigIndexMinForRow;

        for (smlIndex = 0; smlIndex <= smlIndexMax; smlIndex++) {
            lastRow = thisRow;
            editDistanceMatrix.push(thisRow = []);
            bigIndexMaxForRow = myMin(bigIndexMax, smlIndex + compareRange);
            bigIndexMinForRow = myMax(0, smlIndex - 1);
            for (bigIndex = bigIndexMinForRow; bigIndex <= bigIndexMaxForRow; bigIndex++) {
                if (!bigIndex)
                    thisRow[bigIndex] = smlIndex + 1;
                else if (!smlIndex)  // Top row - transform empty array into new array via additions
                    thisRow[bigIndex] = bigIndex + 1;
                else if (smlArray[smlIndex - 1] === bigArray[bigIndex - 1])
                    thisRow[bigIndex] = lastRow[bigIndex - 1];                  // copy value (no edit)
                else {
                    var northDistance = lastRow[bigIndex] || maxDistance;       // not in big (deletion)
                    var westDistance = thisRow[bigIndex - 1] || maxDistance;    // not in small (addition)
                    thisRow[bigIndex] = myMin(northDistance, westDistance) + 1;
                }
            }
        }

        var editScript = [], meMinusOne, notInSml = [], notInBig = [];
        for (smlIndex = smlIndexMax, bigIndex = bigIndexMax; smlIndex || bigIndex;) {
            meMinusOne = editDistanceMatrix[smlIndex][bigIndex] - 1;
            if (bigIndex && meMinusOne === editDistanceMatrix[smlIndex][bigIndex-1]) {
                notInSml.push(editScript[editScript.length] = {     // added
                    'status': statusNotInSml,
                    'value': bigArray[--bigIndex],
                    'index': bigIndex });
            } else if (smlIndex && meMinusOne === editDistanceMatrix[smlIndex - 1][bigIndex]) {
                notInBig.push(editScript[editScript.length] = {     // deleted
                    'status': statusNotInBig,
                    'value': smlArray[--smlIndex],
                    'index': smlIndex });
            } else {
                --bigIndex;
                --smlIndex;
                if (!options['sparse']) {
                    editScript.push({
                        'status': "retained",
                        'value': bigArray[bigIndex] });
                }
            }
        }

        // Set a limit on the number of consecutive non-matching comparisons; having it a multiple of
        // smlIndexMax keeps the time complexity of this algorithm linear.
        ko.utils.findMovesInArrayComparison(notInSml, notInBig, smlIndexMax * 10);

        return editScript.reverse();
    }

    return compareArrays;
})();

ko.exportSymbol('utils.compareArrays', ko.utils.compareArrays);
(function () {
    // Objective:
    // * Given an input array, a container DOM node, and a function from array elements to arrays of DOM nodes,
    //   map the array elements to arrays of DOM nodes, concatenate together all these arrays, and use them to populate the container DOM node
    // * Next time we're given the same combination of things (with the array possibly having mutated), update the container DOM node
    //   so that its children is again the concatenation of the mappings of the array elements, but don't re-map any array elements that we
    //   previously mapped - retain those nodes, and just insert/delete other ones

    // "callbackAfterAddingNodes" will be invoked after any "mapping"-generated nodes are inserted into the container node
    // You can use this, for example, to activate bindings on those nodes.

    function mapNodeAndRefreshWhenChanged(containerNode, mapping, valueToMap, callbackAfterAddingNodes, index) {
        // Map this array value inside a dependentObservable so we re-map when any dependency changes
        var mappedNodes = [];
        var dependentObservable = ko.dependentObservable(function() {
            var newMappedNodes = mapping(valueToMap, index, ko.utils.fixUpContinuousNodeArray(mappedNodes, containerNode)) || [];

            // On subsequent evaluations, just replace the previously-inserted DOM nodes
            if (mappedNodes.length > 0) {
                ko.utils.replaceDomNodes(mappedNodes, newMappedNodes);
                if (callbackAfterAddingNodes)
                    ko.dependencyDetection.ignore(callbackAfterAddingNodes, null, [valueToMap, newMappedNodes, index]);
            }

            // Replace the contents of the mappedNodes array, thereby updating the record
            // of which nodes would be deleted if valueToMap was itself later removed
            mappedNodes.length = 0;
            ko.utils.arrayPushAll(mappedNodes, newMappedNodes);
        }, null, { disposeWhenNodeIsRemoved: containerNode, disposeWhen: function() { return !ko.utils.anyDomNodeIsAttachedToDocument(mappedNodes); } });
        return { mappedNodes : mappedNodes, dependentObservable : (dependentObservable.isActive() ? dependentObservable : undefined) };
    }

    var lastMappingResultDomDataKey = ko.utils.domData.nextKey();

    ko.utils.setDomNodeChildrenFromArrayMapping = function (domNode, array, mapping, options, callbackAfterAddingNodes) {
        // Compare the provided array against the previous one
        array = array || [];
        options = options || {};
        var isFirstExecution = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) === undefined;
        var lastMappingResult = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) || [];
        var lastArray = ko.utils.arrayMap(lastMappingResult, function (x) { return x.arrayEntry; });
        var editScript = ko.utils.compareArrays(lastArray, array, options['dontLimitMoves']);

        // Build the new mapping result
        var newMappingResult = [];
        var lastMappingResultIndex = 0;
        var newMappingResultIndex = 0;

        var nodesToDelete = [];
        var itemsToProcess = [];
        var itemsForBeforeRemoveCallbacks = [];
        var itemsForMoveCallbacks = [];
        var itemsForAfterAddCallbacks = [];
        var mapData;

        function itemMovedOrRetained(editScriptIndex, oldPosition) {
            mapData = lastMappingResult[oldPosition];
            if (newMappingResultIndex !== oldPosition)
                itemsForMoveCallbacks[editScriptIndex] = mapData;
            // Since updating the index might change the nodes, do so before calling fixUpContinuousNodeArray
            mapData.indexObservable(newMappingResultIndex++);
            ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode);
            newMappingResult.push(mapData);
            itemsToProcess.push(mapData);
        }

        function callCallback(callback, items) {
            if (callback) {
                for (var i = 0, n = items.length; i < n; i++) {
                    if (items[i]) {
                        ko.utils.arrayForEach(items[i].mappedNodes, function(node) {
                            callback(node, i, items[i].arrayEntry);
                        });
                    }
                }
            }
        }

        for (var i = 0, editScriptItem, movedIndex; editScriptItem = editScript[i]; i++) {
            movedIndex = editScriptItem['moved'];
            switch (editScriptItem['status']) {
                case "deleted":
                    if (movedIndex === undefined) {
                        mapData = lastMappingResult[lastMappingResultIndex];

                        // Stop tracking changes to the mapping for these nodes
                        if (mapData.dependentObservable)
                            mapData.dependentObservable.dispose();

                        // Queue these nodes for later removal
                        nodesToDelete.push.apply(nodesToDelete, ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode));
                        if (options['beforeRemove']) {
                            itemsForBeforeRemoveCallbacks[i] = mapData;
                            itemsToProcess.push(mapData);
                        }
                    }
                    lastMappingResultIndex++;
                    break;

                case "retained":
                    itemMovedOrRetained(i, lastMappingResultIndex++);
                    break;

                case "added":
                    if (movedIndex !== undefined) {
                        itemMovedOrRetained(i, movedIndex);
                    } else {
                        mapData = { arrayEntry: editScriptItem['value'], indexObservable: ko.observable(newMappingResultIndex++) };
                        newMappingResult.push(mapData);
                        itemsToProcess.push(mapData);
                        if (!isFirstExecution)
                            itemsForAfterAddCallbacks[i] = mapData;
                    }
                    break;
            }
        }

        // Call beforeMove first before any changes have been made to the DOM
        callCallback(options['beforeMove'], itemsForMoveCallbacks);

        // Next remove nodes for deleted items (or just clean if there's a beforeRemove callback)
        ko.utils.arrayForEach(nodesToDelete, options['beforeRemove'] ? ko.cleanNode : ko.removeNode);

        // Next add/reorder the remaining items (will include deleted items if there's a beforeRemove callback)
        for (var i = 0, nextNode = ko.virtualElements.firstChild(domNode), lastNode, node; mapData = itemsToProcess[i]; i++) {
            // Get nodes for newly added items
            if (!mapData.mappedNodes)
                ko.utils.extend(mapData, mapNodeAndRefreshWhenChanged(domNode, mapping, mapData.arrayEntry, callbackAfterAddingNodes, mapData.indexObservable));

            // Put nodes in the right place if they aren't there already
            for (var j = 0; node = mapData.mappedNodes[j]; nextNode = node.nextSibling, lastNode = node, j++) {
                if (node !== nextNode)
                    ko.virtualElements.insertAfter(domNode, node, lastNode);
            }

            // Run the callbacks for newly added nodes (for example, to apply bindings, etc.)
            if (!mapData.initialized && callbackAfterAddingNodes) {
                callbackAfterAddingNodes(mapData.arrayEntry, mapData.mappedNodes, mapData.indexObservable);
                mapData.initialized = true;
            }
        }

        // If there's a beforeRemove callback, call it after reordering.
        // Note that we assume that the beforeRemove callback will usually be used to remove the nodes using
        // some sort of animation, which is why we first reorder the nodes that will be removed. If the
        // callback instead removes the nodes right away, it would be more efficient to skip reordering them.
        // Perhaps we'll make that change in the future if this scenario becomes more common.
        callCallback(options['beforeRemove'], itemsForBeforeRemoveCallbacks);

        // Finally call afterMove and afterAdd callbacks
        callCallback(options['afterMove'], itemsForMoveCallbacks);
        callCallback(options['afterAdd'], itemsForAfterAddCallbacks);

        // Store a copy of the array items we just considered so we can difference it next time
        ko.utils.domData.set(domNode, lastMappingResultDomDataKey, newMappingResult);
    }
})();

ko.exportSymbol('utils.setDomNodeChildrenFromArrayMapping', ko.utils.setDomNodeChildrenFromArrayMapping);
ko.nativeTemplateEngine = function () {
    this['allowTemplateRewriting'] = false;
}

ko.nativeTemplateEngine.prototype = new ko.templateEngine();
ko.nativeTemplateEngine.prototype.constructor = ko.nativeTemplateEngine;
ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
    var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
        templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
        templateNodes = templateNodesFunc ? templateSource['nodes']() : null;

    if (templateNodes) {
        return ko.utils.makeArray(templateNodes.cloneNode(true).childNodes);
    } else {
        var templateText = templateSource['text']();
        return ko.utils.parseHtmlFragment(templateText, templateDocument);
    }
};

ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
ko.setTemplateEngine(ko.nativeTemplateEngine.instance);

ko.exportSymbol('nativeTemplateEngine', ko.nativeTemplateEngine);
(function() {
    ko.jqueryTmplTemplateEngine = function () {
        // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl
        // doesn't expose a version number, so we have to infer it.
        // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
        // which KO internally refers to as version "2", so older versions are no longer detected.
        var jQueryTmplVersion = this.jQueryTmplVersion = (function() {
            if (!jQueryInstance || !(jQueryInstance['tmpl']))
                return 0;
            // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
            try {
                if (jQueryInstance['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
                    // Since 1.0.0pre, custom tags should append markup to an array called "__"
                    return 2; // Final version of jquery.tmpl
                }
            } catch(ex) { /* Apparently not the version we were looking for */ }

            return 1; // Any older version that we don't support
        })();

        function ensureHasReferencedJQueryTemplates() {
            if (jQueryTmplVersion < 2)
                throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
        }

        function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
            return jQueryInstance['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
        }

        this['renderTemplateSource'] = function(templateSource, bindingContext, options, templateDocument) {
            templateDocument = templateDocument || document;
            options = options || {};
            ensureHasReferencedJQueryTemplates();

            // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
            var precompiled = templateSource['data']('precompiled');
            if (!precompiled) {
                var templateText = templateSource['text']() || "";
                // Wrap in "with($whatever.koBindingContext) { ... }"
                templateText = "{{ko_with $item.koBindingContext}}" + templateText + "{{/ko_with}}";

                precompiled = jQueryInstance['template'](null, templateText);
                templateSource['data']('precompiled', precompiled);
            }

            var data = [bindingContext['$data']]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
            var jQueryTemplateOptions = jQueryInstance['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);

            var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
            resultNodes['appendTo'](templateDocument.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work

            jQueryInstance['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
            return resultNodes;
        };

        this['createJavaScriptEvaluatorBlock'] = function(script) {
            return "{{ko_code ((function() { return " + script + " })()) }}";
        };

        this['addTemplate'] = function(templateName, templateMarkup) {
            document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
        };

        if (jQueryTmplVersion > 0) {
            jQueryInstance['tmpl']['tag']['ko_code'] = {
                open: "__.push($1 || '');"
            };
            jQueryInstance['tmpl']['tag']['ko_with'] = {
                open: "with($1) {",
                close: "} "
            };
        }
    };

    ko.jqueryTmplTemplateEngine.prototype = new ko.templateEngine();
    ko.jqueryTmplTemplateEngine.prototype.constructor = ko.jqueryTmplTemplateEngine;

    // Use this one by default *only if jquery.tmpl is referenced*
    var jqueryTmplTemplateEngineInstance = new ko.jqueryTmplTemplateEngine();
    if (jqueryTmplTemplateEngineInstance.jQueryTmplVersion > 0)
        ko.setTemplateEngine(jqueryTmplTemplateEngineInstance);

    ko.exportSymbol('jqueryTmplTemplateEngine', ko.jqueryTmplTemplateEngine);
})();
}));
}());
})();

},{}],5:[function(require,module,exports){
(function (process){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {String}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {String} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object} [state]
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {String} from - if param 'to' is undefined redirects to 'from'
   * @param {String} [to]
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(to);
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {str} URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options.sensitive,
      options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Object} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    var el = e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}).call(this,require('_process'))

},{"_process":3,"path-to-regexp":6}],6:[function(require,module,exports){
var isArray = require('isarray');

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that are always escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i';
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name:      i,
        delimiter: null,
        optional:  false,
        repeat:    false
      });
    }
  }

  return attachKeys(path, keys);
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
  return attachKeys(regexp, keys);
}

/**
 * Replace the specific tags with regexp strings.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @return {String}
 */
function replacePath (path, keys) {
  var index = 0;

  function replace (_, escaped, prefix, key, capture, group, suffix, escape) {
    if (escaped) {
      return escaped;
    }

    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push({
      name:      key || index++,
      delimiter: prefix || '/',
      optional:  optional,
      repeat:    repeat
    });

    prefix = prefix ? ('\\' + prefix) : '';
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  }

  return path.replace(PATH_REGEXP, replace);
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || [];

  if (!isArray(keys)) {
    options = keys;
    keys = [];
  } else if (!options) {
    options = {};
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options);
  }

  if (isArray(path)) {
    return arrayToRegexp(path, keys, options);
  }

  var strict = options.strict;
  var end = options.end !== false;
  var route = replacePath(path, keys);
  var endsWithSlash = path.charAt(path.length - 1) === '/';

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys);
}

},{"isarray":7}],7:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamFwc3UvSG9iYnkvZWRlZ2FsMi9nYWxsZXJ5L3N0YXRpY19zcmMvbWFpbi5qcyIsIi9Vc2Vycy9qYXBzdS9Ib2JieS9lZGVnYWwyL2dhbGxlcnkvc3RhdGljX3NyYy92aWV3bW9kZWxzL01haW5WaWV3TW9kZWwuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2tub2Nrb3V0L2J1aWxkL291dHB1dC9rbm9ja291dC1sYXRlc3QuZGVidWcuanMiLCJub2RlX21vZHVsZXMvcGFnZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYWdlL25vZGVfbW9kdWxlcy9wYXRoLXRvLXJlZ2V4cC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYWdlL25vZGVfbW9kdWxlcy9wYXRoLXRvLXJlZ2V4cC9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7Ozt3QkFHRSxVQUFVOzs7O29CQUNSLE1BQU07Ozs7dUNBRUcsNEJBQTRCOzs7O0FBR3RELHNCQUFHLGFBQWEsQ0FBQywwQ0FBbUIsQ0FBQyxDQUFDO0FBQ3RDLHdCQUFNLENBQUE7Ozs7Ozs7Ozs7O0lDVmUsYUFBYSxZQUFiLGFBQWE7d0JBQWIsYUFBYTs7O3FCQUFiLGFBQWE7Ozs7QUNBbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ24yS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbmltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5pbXBvcnQgcGFnZSBmcm9tICdwYWdlJztcblxuaW1wb3J0IE1haW5WaWV3TW9kZWwgZnJvbSAnLi92aWV3bW9kZWxzL01haW5WaWV3TW9kZWwnO1xuXG5cbmtvLmFwcGx5QmluZGluZ3MobmV3IE1haW5WaWV3TW9kZWwoKSk7XG5wYWdlKClcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIE1haW5WaWV3TW9kZWwge31cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyohXG4gKiBLbm9ja291dCBKYXZhU2NyaXB0IGxpYnJhcnkgdjMuMy4wXG4gKiAoYykgU3RldmVuIFNhbmRlcnNvbiAtIGh0dHA6Ly9rbm9ja291dGpzLmNvbS9cbiAqIExpY2Vuc2U6IE1JVCAoaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHApXG4gKi9cblxuKGZ1bmN0aW9uKCl7XG52YXIgREVCVUc9dHJ1ZTtcbihmdW5jdGlvbih1bmRlZmluZWQpe1xuICAgIC8vICgwLCBldmFsKSgndGhpcycpIGlzIGEgcm9idXN0IHdheSBvZiBnZXR0aW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0XG4gICAgLy8gRm9yIGRldGFpbHMsIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE0MTE5OTg4L3JldHVybi10aGlzLTAtZXZhbHRoaXMvMTQxMjAwMjMjMTQxMjAwMjNcbiAgICB2YXIgd2luZG93ID0gdGhpcyB8fCAoMCwgZXZhbCkoJ3RoaXMnKSxcbiAgICAgICAgZG9jdW1lbnQgPSB3aW5kb3dbJ2RvY3VtZW50J10sXG4gICAgICAgIG5hdmlnYXRvciA9IHdpbmRvd1snbmF2aWdhdG9yJ10sXG4gICAgICAgIGpRdWVyeUluc3RhbmNlID0gd2luZG93W1wialF1ZXJ5XCJdLFxuICAgICAgICBKU09OID0gd2luZG93W1wiSlNPTlwiXTtcbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgLy8gU3VwcG9ydCB0aHJlZSBtb2R1bGUgbG9hZGluZyBzY2VuYXJpb3NcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKSB7XG4gICAgICAgIC8vIFsxXSBBTUQgYW5vbnltb3VzIG1vZHVsZVxuICAgICAgICBkZWZpbmUoWydleHBvcnRzJywgJ3JlcXVpcmUnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gWzJdIENvbW1vbkpTL05vZGUuanNcbiAgICAgICAgZmFjdG9yeShtb2R1bGVbJ2V4cG9ydHMnXSB8fCBleHBvcnRzKTsgIC8vIG1vZHVsZS5leHBvcnRzIGlzIGZvciBOb2RlLmpzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gWzNdIE5vIG1vZHVsZSBsb2FkZXIgKHBsYWluIDxzY3JpcHQ+IHRhZykgLSBwdXQgZGlyZWN0bHkgaW4gZ2xvYmFsIG5hbWVzcGFjZVxuICAgICAgICBmYWN0b3J5KHdpbmRvd1sna28nXSA9IHt9KTtcbiAgICB9XG59KGZ1bmN0aW9uKGtvRXhwb3J0cywgYW1kUmVxdWlyZSl7XG4vLyBJbnRlcm5hbGx5LCBhbGwgS08gb2JqZWN0cyBhcmUgYXR0YWNoZWQgdG8ga29FeHBvcnRzIChldmVuIHRoZSBub24tZXhwb3J0ZWQgb25lcyB3aG9zZSBuYW1lcyB3aWxsIGJlIG1pbmlmaWVkIGJ5IHRoZSBjbG9zdXJlIGNvbXBpbGVyKS5cbi8vIEluIHRoZSBmdXR1cmUsIHRoZSBmb2xsb3dpbmcgXCJrb1wiIHZhcmlhYmxlIG1heSBiZSBtYWRlIGRpc3RpbmN0IGZyb20gXCJrb0V4cG9ydHNcIiBzbyB0aGF0IHByaXZhdGUgb2JqZWN0cyBhcmUgbm90IGV4dGVybmFsbHkgcmVhY2hhYmxlLlxudmFyIGtvID0gdHlwZW9mIGtvRXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgPyBrb0V4cG9ydHMgOiB7fTtcbi8vIEdvb2dsZSBDbG9zdXJlIENvbXBpbGVyIGhlbHBlcnMgKHVzZWQgb25seSB0byBtYWtlIHRoZSBtaW5pZmllZCBmaWxlIHNtYWxsZXIpXG5rby5leHBvcnRTeW1ib2wgPSBmdW5jdGlvbihrb1BhdGgsIG9iamVjdCkge1xuICAgIHZhciB0b2tlbnMgPSBrb1BhdGguc3BsaXQoXCIuXCIpO1xuXG4gICAgLy8gSW4gdGhlIGZ1dHVyZSwgXCJrb1wiIG1heSBiZWNvbWUgZGlzdGluY3QgZnJvbSBcImtvRXhwb3J0c1wiIChzbyB0aGF0IG5vbi1leHBvcnRlZCBvYmplY3RzIGFyZSBub3QgcmVhY2hhYmxlKVxuICAgIC8vIEF0IHRoYXQgcG9pbnQsIFwidGFyZ2V0XCIgd291bGQgYmUgc2V0IHRvOiAodHlwZW9mIGtvRXhwb3J0cyAhPT0gXCJ1bmRlZmluZWRcIiA/IGtvRXhwb3J0cyA6IGtvKVxuICAgIHZhciB0YXJnZXQgPSBrbztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aCAtIDE7IGkrKylcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0W3Rva2Vuc1tpXV07XG4gICAgdGFyZ2V0W3Rva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV1dID0gb2JqZWN0O1xufTtcbmtvLmV4cG9ydFByb3BlcnR5ID0gZnVuY3Rpb24ob3duZXIsIHB1YmxpY05hbWUsIG9iamVjdCkge1xuICAgIG93bmVyW3B1YmxpY05hbWVdID0gb2JqZWN0O1xufTtcbmtvLnZlcnNpb24gPSBcIjMuMy4wXCI7XG5cbmtvLmV4cG9ydFN5bWJvbCgndmVyc2lvbicsIGtvLnZlcnNpb24pO1xua28udXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIG9iamVjdEZvckVhY2gob2JqLCBhY3Rpb24pIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb24ocHJvcCwgb2JqW3Byb3BdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQsIHNvdXJjZSkge1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgICBmb3IodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYoc291cmNlLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihvYmosIHByb3RvKSB7XG4gICAgICAgIG9iai5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICB2YXIgY2FuU2V0UHJvdG90eXBlID0gKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkpO1xuXG4gICAgLy8gUmVwcmVzZW50IHRoZSBrbm93biBldmVudCB0eXBlcyBpbiBhIGNvbXBhY3Qgd2F5LCB0aGVuIGF0IHJ1bnRpbWUgdHJhbnNmb3JtIGl0IGludG8gYSBoYXNoIHdpdGggZXZlbnQgbmFtZSBhcyBrZXkgKGZvciBmYXN0IGxvb2t1cClcbiAgICB2YXIga25vd25FdmVudHMgPSB7fSwga25vd25FdmVudFR5cGVzQnlFdmVudE5hbWUgPSB7fTtcbiAgICB2YXIga2V5RXZlbnRUeXBlTmFtZSA9IChuYXZpZ2F0b3IgJiYgL0ZpcmVmb3hcXC8yL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgPyAnS2V5Ym9hcmRFdmVudCcgOiAnVUlFdmVudHMnO1xuICAgIGtub3duRXZlbnRzW2tleUV2ZW50VHlwZU5hbWVdID0gWydrZXl1cCcsICdrZXlkb3duJywgJ2tleXByZXNzJ107XG4gICAga25vd25FdmVudHNbJ01vdXNlRXZlbnRzJ10gPSBbJ2NsaWNrJywgJ2RibGNsaWNrJywgJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlbW92ZScsICdtb3VzZW92ZXInLCAnbW91c2VvdXQnLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ107XG4gICAgb2JqZWN0Rm9yRWFjaChrbm93bkV2ZW50cywgZnVuY3Rpb24oZXZlbnRUeXBlLCBrbm93bkV2ZW50c0ZvclR5cGUpIHtcbiAgICAgICAgaWYgKGtub3duRXZlbnRzRm9yVHlwZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0ga25vd25FdmVudHNGb3JUeXBlLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICBrbm93bkV2ZW50VHlwZXNCeUV2ZW50TmFtZVtrbm93bkV2ZW50c0ZvclR5cGVbaV1dID0gZXZlbnRUeXBlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdmFyIGV2ZW50c1RoYXRNdXN0QmVSZWdpc3RlcmVkVXNpbmdBdHRhY2hFdmVudCA9IHsgJ3Byb3BlcnR5Y2hhbmdlJzogdHJ1ZSB9OyAvLyBXb3JrYXJvdW5kIGZvciBhbiBJRTkgaXNzdWUgLSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzQwNlxuXG4gICAgLy8gRGV0ZWN0IElFIHZlcnNpb25zIGZvciBidWcgd29ya2Fyb3VuZHMgKHVzZXMgSUUgY29uZGl0aW9uYWxzLCBub3QgVUEgc3RyaW5nLCBmb3Igcm9idXN0bmVzcylcbiAgICAvLyBOb3RlIHRoYXQsIHNpbmNlIElFIDEwIGRvZXMgbm90IHN1cHBvcnQgY29uZGl0aW9uYWwgY29tbWVudHMsIHRoZSBmb2xsb3dpbmcgbG9naWMgb25seSBkZXRlY3RzIElFIDwgMTAuXG4gICAgLy8gQ3VycmVudGx5IHRoaXMgaXMgYnkgZGVzaWduLCBzaW5jZSBJRSAxMCsgYmVoYXZlcyBjb3JyZWN0bHkgd2hlbiB0cmVhdGVkIGFzIGEgc3RhbmRhcmQgYnJvd3Nlci5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIGZ1dHVyZSBuZWVkIHRvIGRldGVjdCBzcGVjaWZpYyB2ZXJzaW9ucyBvZiBJRTEwKywgd2Ugd2lsbCBhbWVuZCB0aGlzLlxuICAgIHZhciBpZVZlcnNpb24gPSBkb2N1bWVudCAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2ZXJzaW9uID0gMywgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksIGlFbGVtcyA9IGRpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaScpO1xuXG4gICAgICAgIC8vIEtlZXAgY29uc3RydWN0aW5nIGNvbmRpdGlvbmFsIEhUTUwgYmxvY2tzIHVudGlsIHdlIGhpdCBvbmUgdGhhdCByZXNvbHZlcyB0byBhbiBlbXB0eSBmcmFnbWVudFxuICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gJzwhLS1baWYgZ3QgSUUgJyArICgrK3ZlcnNpb24pICsgJ10+PGk+PC9pPjwhW2VuZGlmXS0tPicsXG4gICAgICAgICAgICBpRWxlbXNbMF1cbiAgICAgICAgKSB7fVxuICAgICAgICByZXR1cm4gdmVyc2lvbiA+IDQgPyB2ZXJzaW9uIDogdW5kZWZpbmVkO1xuICAgIH0oKSk7XG4gICAgdmFyIGlzSWU2ID0gaWVWZXJzaW9uID09PSA2LFxuICAgICAgICBpc0llNyA9IGllVmVyc2lvbiA9PT0gNztcblxuICAgIGZ1bmN0aW9uIGlzQ2xpY2tPbkNoZWNrYWJsZUVsZW1lbnQoZWxlbWVudCwgZXZlbnRUeXBlKSB7XG4gICAgICAgIGlmICgoa28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpICE9PSBcImlucHV0XCIpIHx8ICFlbGVtZW50LnR5cGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpICE9IFwiY2xpY2tcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgaW5wdXRUeXBlID0gZWxlbWVudC50eXBlO1xuICAgICAgICByZXR1cm4gKGlucHV0VHlwZSA9PSBcImNoZWNrYm94XCIpIHx8IChpbnB1dFR5cGUgPT0gXCJyYWRpb1wiKTtcbiAgICB9XG5cbiAgICAvLyBGb3IgZGV0YWlscyBvbiB0aGUgcGF0dGVybiBmb3IgY2hhbmdpbmcgbm9kZSBjbGFzc2VzXG4gICAgLy8gc2VlOiBodHRwczovL2dpdGh1Yi5jb20va25vY2tvdXQva25vY2tvdXQvaXNzdWVzLzE1OTdcbiAgICB2YXIgY3NzQ2xhc3NOYW1lUmVnZXggPSAvXFxTKy9nO1xuXG4gICAgZnVuY3Rpb24gdG9nZ2xlRG9tTm9kZUNzc0NsYXNzKG5vZGUsIGNsYXNzTmFtZXMsIHNob3VsZEhhdmVDbGFzcykge1xuICAgICAgICB2YXIgYWRkT3JSZW1vdmVGbjtcbiAgICAgICAgaWYgKGNsYXNzTmFtZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZS5jbGFzc0xpc3QgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgYWRkT3JSZW1vdmVGbiA9IG5vZGUuY2xhc3NMaXN0W3Nob3VsZEhhdmVDbGFzcyA/ICdhZGQnIDogJ3JlbW92ZSddO1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChjbGFzc05hbWVzLm1hdGNoKGNzc0NsYXNzTmFtZVJlZ2V4KSwgZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZE9yUmVtb3ZlRm4uY2FsbChub2RlLmNsYXNzTGlzdCwgY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5vZGUuY2xhc3NOYW1lWydiYXNlVmFsJ10gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgLy8gU1ZHIHRhZyAuY2xhc3NOYW1lcyBpcyBhbiBTVkdBbmltYXRlZFN0cmluZyBpbnN0YW5jZVxuICAgICAgICAgICAgICAgIHRvZ2dsZU9iamVjdENsYXNzUHJvcGVydHlTdHJpbmcobm9kZS5jbGFzc05hbWUsICdiYXNlVmFsJywgY2xhc3NOYW1lcywgc2hvdWxkSGF2ZUNsYXNzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbm9kZS5jbGFzc05hbWUgb3VnaHQgdG8gYmUgYSBzdHJpbmcuXG4gICAgICAgICAgICAgICAgdG9nZ2xlT2JqZWN0Q2xhc3NQcm9wZXJ0eVN0cmluZyhub2RlLCAnY2xhc3NOYW1lJywgY2xhc3NOYW1lcywgc2hvdWxkSGF2ZUNsYXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZU9iamVjdENsYXNzUHJvcGVydHlTdHJpbmcob2JqLCBwcm9wLCBjbGFzc05hbWVzLCBzaG91bGRIYXZlQ2xhc3MpIHtcbiAgICAgICAgLy8gb2JqL3Byb3AgaXMgZWl0aGVyIGEgbm9kZS8nY2xhc3NOYW1lJyBvciBhIFNWR0FuaW1hdGVkU3RyaW5nLydiYXNlVmFsJy5cbiAgICAgICAgdmFyIGN1cnJlbnRDbGFzc05hbWVzID0gb2JqW3Byb3BdLm1hdGNoKGNzc0NsYXNzTmFtZVJlZ2V4KSB8fCBbXTtcbiAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKGNsYXNzTmFtZXMubWF0Y2goY3NzQ2xhc3NOYW1lUmVnZXgpLCBmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLmFkZE9yUmVtb3ZlSXRlbShjdXJyZW50Q2xhc3NOYW1lcywgY2xhc3NOYW1lLCBzaG91bGRIYXZlQ2xhc3MpO1xuICAgICAgICB9KTtcbiAgICAgICAgb2JqW3Byb3BdID0gY3VycmVudENsYXNzTmFtZXMuam9pbihcIiBcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZmllbGRzSW5jbHVkZWRXaXRoSnNvblBvc3Q6IFsnYXV0aGVudGljaXR5X3Rva2VuJywgL15fX1JlcXVlc3RWZXJpZmljYXRpb25Ub2tlbihfLiopPyQvXSxcblxuICAgICAgICBhcnJheUZvckVhY2g6IGZ1bmN0aW9uIChhcnJheSwgYWN0aW9uKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGFycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICBhY3Rpb24oYXJyYXlbaV0sIGkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFycmF5SW5kZXhPZjogZnVuY3Rpb24gKGFycmF5LCBpdGVtKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChhcnJheSwgaXRlbSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGFycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFycmF5Rmlyc3Q6IGZ1bmN0aW9uIChhcnJheSwgcHJlZGljYXRlLCBwcmVkaWNhdGVPd25lcikge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBhcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHByZWRpY2F0ZU93bmVyLCBhcnJheVtpXSwgaSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheVtpXTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFycmF5UmVtb3ZlSXRlbTogZnVuY3Rpb24gKGFycmF5LCBpdGVtVG9SZW1vdmUpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGtvLnV0aWxzLmFycmF5SW5kZXhPZihhcnJheSwgaXRlbVRvUmVtb3ZlKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICBhcnJheS5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFycmF5R2V0RGlzdGluY3RWYWx1ZXM6IGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICAgICAgYXJyYXkgPSBhcnJheSB8fCBbXTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gYXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtvLnV0aWxzLmFycmF5SW5kZXhPZihyZXN1bHQsIGFycmF5W2ldKSA8IDApXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJyYXlNYXA6IGZ1bmN0aW9uIChhcnJheSwgbWFwcGluZykge1xuICAgICAgICAgICAgYXJyYXkgPSBhcnJheSB8fCBbXTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gYXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1hcHBpbmcoYXJyYXlbaV0sIGkpKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJyYXlGaWx0ZXI6IGZ1bmN0aW9uIChhcnJheSwgcHJlZGljYXRlKSB7XG4gICAgICAgICAgICBhcnJheSA9IGFycmF5IHx8IFtdO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBhcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpXSwgaSkpXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGFycmF5W2ldKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJyYXlQdXNoQWxsOiBmdW5jdGlvbiAoYXJyYXksIHZhbHVlc1RvUHVzaCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlc1RvUHVzaCBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgICAgIGFycmF5LnB1c2guYXBwbHkoYXJyYXksIHZhbHVlc1RvUHVzaCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB2YWx1ZXNUb1B1c2gubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHZhbHVlc1RvUHVzaFtpXSk7XG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkT3JSZW1vdmVJdGVtOiBmdW5jdGlvbihhcnJheSwgdmFsdWUsIGluY2x1ZGVkKSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RpbmdFbnRyeUluZGV4ID0ga28udXRpbHMuYXJyYXlJbmRleE9mKGtvLnV0aWxzLnBlZWtPYnNlcnZhYmxlKGFycmF5KSwgdmFsdWUpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nRW50cnlJbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZWQpXG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWluY2x1ZGVkKVxuICAgICAgICAgICAgICAgICAgICBhcnJheS5zcGxpY2UoZXhpc3RpbmdFbnRyeUluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjYW5TZXRQcm90b3R5cGU6IGNhblNldFByb3RvdHlwZSxcblxuICAgICAgICBleHRlbmQ6IGV4dGVuZCxcblxuICAgICAgICBzZXRQcm90b3R5cGVPZjogc2V0UHJvdG90eXBlT2YsXG5cbiAgICAgICAgc2V0UHJvdG90eXBlT2ZPckV4dGVuZDogY2FuU2V0UHJvdG90eXBlID8gc2V0UHJvdG90eXBlT2YgOiBleHRlbmQsXG5cbiAgICAgICAgb2JqZWN0Rm9yRWFjaDogb2JqZWN0Rm9yRWFjaCxcblxuICAgICAgICBvYmplY3RNYXA6IGZ1bmN0aW9uKHNvdXJjZSwgbWFwcGluZykge1xuICAgICAgICAgICAgaWYgKCFzb3VyY2UpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBtYXBwaW5nKHNvdXJjZVtwcm9wXSwgcHJvcCwgc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGVtcHR5RG9tTm9kZTogZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIHdoaWxlIChkb21Ob2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICBrby5yZW1vdmVOb2RlKGRvbU5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZUNsZWFuZWROb2Rlc1RvQ29udGFpbmVyRWxlbWVudDogZnVuY3Rpb24obm9kZXMpIHtcbiAgICAgICAgICAgIC8vIEVuc3VyZSBpdCdzIGEgcmVhbCBhcnJheSwgYXMgd2UncmUgYWJvdXQgdG8gcmVwYXJlbnQgdGhlIG5vZGVzIGFuZFxuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0aGUgdW5kZXJseWluZyBjb2xsZWN0aW9uIHRvIGNoYW5nZSB3aGlsZSB3ZSdyZSBkb2luZyB0aGF0LlxuICAgICAgICAgICAgdmFyIG5vZGVzQXJyYXkgPSBrby51dGlscy5tYWtlQXJyYXkobm9kZXMpO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlRG9jdW1lbnQgPSAobm9kZXNBcnJheVswXSAmJiBub2Rlc0FycmF5WzBdLm93bmVyRG9jdW1lbnQpIHx8IGRvY3VtZW50O1xuXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyID0gdGVtcGxhdGVEb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gbm9kZXNBcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoa28uY2xlYW5Ob2RlKG5vZGVzQXJyYXlbaV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvbmVOb2RlczogZnVuY3Rpb24gKG5vZGVzQXJyYXksIHNob3VsZENsZWFuTm9kZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gbm9kZXNBcnJheS5sZW5ndGgsIG5ld05vZGVzQXJyYXkgPSBbXTsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjbG9uZWROb2RlID0gbm9kZXNBcnJheVtpXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgbmV3Tm9kZXNBcnJheS5wdXNoKHNob3VsZENsZWFuTm9kZXMgPyBrby5jbGVhbk5vZGUoY2xvbmVkTm9kZSkgOiBjbG9uZWROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdOb2Rlc0FycmF5O1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldERvbU5vZGVDaGlsZHJlbjogZnVuY3Rpb24gKGRvbU5vZGUsIGNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLmVtcHR5RG9tTm9kZShkb21Ob2RlKTtcbiAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBjaGlsZE5vZGVzLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5hcHBlbmRDaGlsZChjaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlRG9tTm9kZXM6IGZ1bmN0aW9uIChub2RlVG9SZXBsYWNlT3JOb2RlQXJyYXksIG5ld05vZGVzQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBub2Rlc1RvUmVwbGFjZUFycmF5ID0gbm9kZVRvUmVwbGFjZU9yTm9kZUFycmF5Lm5vZGVUeXBlID8gW25vZGVUb1JlcGxhY2VPck5vZGVBcnJheV0gOiBub2RlVG9SZXBsYWNlT3JOb2RlQXJyYXk7XG4gICAgICAgICAgICBpZiAobm9kZXNUb1JlcGxhY2VBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluc2VydGlvblBvaW50ID0gbm9kZXNUb1JlcGxhY2VBcnJheVswXTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gaW5zZXJ0aW9uUG9pbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IG5ld05vZGVzQXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5ld05vZGVzQXJyYXlbaV0sIGluc2VydGlvblBvaW50KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IG5vZGVzVG9SZXBsYWNlQXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnJlbW92ZU5vZGUobm9kZXNUb1JlcGxhY2VBcnJheVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpeFVwQ29udGludW91c05vZGVBcnJheTogZnVuY3Rpb24oY29udGludW91c05vZGVBcnJheSwgcGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgLy8gQmVmb3JlIGFjdGluZyBvbiBhIHNldCBvZiBub2RlcyB0aGF0IHdlcmUgcHJldmlvdXNseSBvdXRwdXR0ZWQgYnkgYSB0ZW1wbGF0ZSBmdW5jdGlvbiwgd2UgaGF2ZSB0byByZWNvbmNpbGVcbiAgICAgICAgICAgIC8vIHRoZW0gYWdhaW5zdCB3aGF0IGlzIGluIHRoZSBET00gcmlnaHQgbm93LiBJdCBtYXkgYmUgdGhhdCBzb21lIG9mIHRoZSBub2RlcyBoYXZlIGFscmVhZHkgYmVlbiByZW1vdmVkLCBvciB0aGF0XG4gICAgICAgICAgICAvLyBuZXcgbm9kZXMgbWlnaHQgaGF2ZSBiZWVuIGluc2VydGVkIGluIHRoZSBtaWRkbGUsIGZvciBleGFtcGxlIGJ5IGEgYmluZGluZy4gQWxzbywgdGhlcmUgbWF5IHByZXZpb3VzbHkgaGF2ZSBiZWVuXG4gICAgICAgICAgICAvLyBsZWFkaW5nIGNvbW1lbnQgbm9kZXMgKGNyZWF0ZWQgYnkgcmV3cml0dGVuIHN0cmluZy1iYXNlZCB0ZW1wbGF0ZXMpIHRoYXQgaGF2ZSBzaW5jZSBiZWVuIHJlbW92ZWQgZHVyaW5nIGJpbmRpbmcuXG4gICAgICAgICAgICAvLyBTbywgdGhpcyBmdW5jdGlvbiB0cmFuc2xhdGVzIHRoZSBvbGQgXCJtYXBcIiBvdXRwdXQgYXJyYXkgaW50byBpdHMgYmVzdCBndWVzcyBvZiB0aGUgc2V0IG9mIGN1cnJlbnQgRE9NIG5vZGVzLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFJ1bGVzOlxuICAgICAgICAgICAgLy8gICBbQV0gQW55IGxlYWRpbmcgbm9kZXMgdGhhdCBoYXZlIGJlZW4gcmVtb3ZlZCBzaG91bGQgYmUgaWdub3JlZFxuICAgICAgICAgICAgLy8gICAgICAgVGhlc2UgbW9zdCBsaWtlbHkgY29ycmVzcG9uZCB0byBtZW1vaXphdGlvbiBub2RlcyB0aGF0IHdlcmUgYWxyZWFkeSByZW1vdmVkIGR1cmluZyBiaW5kaW5nXG4gICAgICAgICAgICAvLyAgICAgICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L3B1bGwvNDQwXG4gICAgICAgICAgICAvLyAgIFtCXSBXZSB3YW50IHRvIG91dHB1dCBhIGNvbnRpbnVvdXMgc2VyaWVzIG9mIG5vZGVzLiBTbywgaWdub3JlIGFueSBub2RlcyB0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWQsXG4gICAgICAgICAgICAvLyAgICAgICBhbmQgaW5jbHVkZSBhbnkgbm9kZXMgdGhhdCBoYXZlIGJlZW4gaW5zZXJ0ZWQgYW1vbmcgdGhlIHByZXZpb3VzIGNvbGxlY3Rpb25cblxuICAgICAgICAgICAgaWYgKGNvbnRpbnVvdXNOb2RlQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHBhcmVudCBub2RlIGNhbiBiZSBhIHZpcnR1YWwgZWxlbWVudDsgc28gZ2V0IHRoZSByZWFsIHBhcmVudCBub2RlXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSA9IChwYXJlbnROb2RlLm5vZGVUeXBlID09PSA4ICYmIHBhcmVudE5vZGUucGFyZW50Tm9kZSkgfHwgcGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgIC8vIFJ1bGUgW0FdXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNvbnRpbnVvdXNOb2RlQXJyYXkubGVuZ3RoICYmIGNvbnRpbnVvdXNOb2RlQXJyYXlbMF0ucGFyZW50Tm9kZSAhPT0gcGFyZW50Tm9kZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5zcGxpY2UoMCwgMSk7XG5cbiAgICAgICAgICAgICAgICAvLyBSdWxlIFtCXVxuICAgICAgICAgICAgICAgIGlmIChjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBjb250aW51b3VzTm9kZUFycmF5WzBdLCBsYXN0ID0gY29udGludW91c05vZGVBcnJheVtjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHdpdGggdGhlIGFjdHVhbCBuZXcgY29udGludW91cyBub2RlIHNldFxuICAgICAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBsYXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5LnB1c2goY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudCkgLy8gV29uJ3QgaGFwcGVuLCBleGNlcHQgaWYgdGhlIGRldmVsb3BlciBoYXMgbWFudWFsbHkgcmVtb3ZlZCBzb21lIERPTSBlbGVtZW50cyAodGhlbiB3ZSdyZSBpbiBhbiB1bmRlZmluZWQgc2NlbmFyaW8pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVvdXNOb2RlQXJyYXkucHVzaChsYXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29udGludW91c05vZGVBcnJheTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRPcHRpb25Ob2RlU2VsZWN0aW9uU3RhdGU6IGZ1bmN0aW9uIChvcHRpb25Ob2RlLCBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAvLyBJRTYgc29tZXRpbWVzIHRocm93cyBcInVua25vd24gZXJyb3JcIiBpZiB5b3UgdHJ5IHRvIHdyaXRlIHRvIC5zZWxlY3RlZCBkaXJlY3RseSwgd2hlcmVhcyBGaXJlZm94IHN0cnVnZ2xlcyB3aXRoIHNldEF0dHJpYnV0ZS4gUGljayBvbmUgYmFzZWQgb24gYnJvd3Nlci5cbiAgICAgICAgICAgIGlmIChpZVZlcnNpb24gPCA3KVxuICAgICAgICAgICAgICAgIG9wdGlvbk5vZGUuc2V0QXR0cmlidXRlKFwic2VsZWN0ZWRcIiwgaXNTZWxlY3RlZCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3B0aW9uTm9kZS5zZWxlY3RlZCA9IGlzU2VsZWN0ZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RyaW5nVHJpbTogZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZyA9PT0gbnVsbCB8fCBzdHJpbmcgPT09IHVuZGVmaW5lZCA/ICcnIDpcbiAgICAgICAgICAgICAgICBzdHJpbmcudHJpbSA/XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZy50cmltKCkgOlxuICAgICAgICAgICAgICAgICAgICBzdHJpbmcudG9TdHJpbmcoKS5yZXBsYWNlKC9eW1xcc1xceGEwXSt8W1xcc1xceGEwXSskL2csICcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdHJpbmdTdGFydHNXaXRoOiBmdW5jdGlvbiAoc3RyaW5nLCBzdGFydHNXaXRoKSB7XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcgfHwgXCJcIjtcbiAgICAgICAgICAgIGlmIChzdGFydHNXaXRoLmxlbmd0aCA+IHN0cmluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5zdWJzdHJpbmcoMCwgc3RhcnRzV2l0aC5sZW5ndGgpID09PSBzdGFydHNXaXRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRvbU5vZGVJc0NvbnRhaW5lZEJ5OiBmdW5jdGlvbiAobm9kZSwgY29udGFpbmVkQnlOb2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gY29udGFpbmVkQnlOb2RlKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDExKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gRml4ZXMgaXNzdWUgIzExNjIgLSBjYW4ndCB1c2Ugbm9kZS5jb250YWlucyBmb3IgZG9jdW1lbnQgZnJhZ21lbnRzIG9uIElFOFxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lZEJ5Tm9kZS5jb250YWlucylcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGFpbmVkQnlOb2RlLmNvbnRhaW5zKG5vZGUubm9kZVR5cGUgPT09IDMgPyBub2RlLnBhcmVudE5vZGUgOiBub2RlKTtcbiAgICAgICAgICAgIGlmIChjb250YWluZWRCeU5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24pXG4gICAgICAgICAgICAgICAgcmV0dXJuIChjb250YWluZWRCeU5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24obm9kZSkgJiAxNikgPT0gMTY7XG4gICAgICAgICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9IGNvbnRhaW5lZEJ5Tm9kZSkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gISFub2RlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRvbU5vZGVJc0F0dGFjaGVkVG9Eb2N1bWVudDogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBrby51dGlscy5kb21Ob2RlSXNDb250YWluZWRCeShub2RlLCBub2RlLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhbnlEb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQ6IGZ1bmN0aW9uKG5vZGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gISFrby51dGlscy5hcnJheUZpcnN0KG5vZGVzLCBrby51dGlscy5kb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRhZ05hbWVMb3dlcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgLy8gRm9yIEhUTUwgZWxlbWVudHMsIHRhZ05hbWUgd2lsbCBhbHdheXMgYmUgdXBwZXIgY2FzZTsgZm9yIFhIVE1MIGVsZW1lbnRzLCBpdCdsbCBiZSBsb3dlciBjYXNlLlxuICAgICAgICAgICAgLy8gUG9zc2libGUgZnV0dXJlIG9wdGltaXphdGlvbjogSWYgd2Uga25vdyBpdCdzIGFuIGVsZW1lbnQgZnJvbSBhbiBYSFRNTCBkb2N1bWVudCAobm90IEhUTUwpLFxuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBkbyB0aGUgLnRvTG93ZXJDYXNlKCkgYXMgaXQgd2lsbCBhbHdheXMgYmUgbG93ZXIgY2FzZSBhbnl3YXkuXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudCAmJiBlbGVtZW50LnRhZ05hbWUgJiYgZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaXN0ZXJFdmVudEhhbmRsZXI6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHZhciBtdXN0VXNlQXR0YWNoRXZlbnQgPSBpZVZlcnNpb24gJiYgZXZlbnRzVGhhdE11c3RCZVJlZ2lzdGVyZWRVc2luZ0F0dGFjaEV2ZW50W2V2ZW50VHlwZV07XG4gICAgICAgICAgICBpZiAoIW11c3RVc2VBdHRhY2hFdmVudCAmJiBqUXVlcnlJbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGpRdWVyeUluc3RhbmNlKGVsZW1lbnQpWydiaW5kJ10oZXZlbnRUeXBlLCBoYW5kbGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW11c3RVc2VBdHRhY2hFdmVudCAmJiB0eXBlb2YgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyID09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgZWxlbWVudC5hdHRhY2hFdmVudCAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF0dGFjaEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChldmVudCkgeyBoYW5kbGVyLmNhbGwoZWxlbWVudCwgZXZlbnQpOyB9LFxuICAgICAgICAgICAgICAgICAgICBhdHRhY2hFdmVudE5hbWUgPSBcIm9uXCIgKyBldmVudFR5cGU7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hdHRhY2hFdmVudChhdHRhY2hFdmVudE5hbWUsIGF0dGFjaEV2ZW50SGFuZGxlcik7XG5cbiAgICAgICAgICAgICAgICAvLyBJRSBkb2VzIG5vdCBkaXNwb3NlIGF0dGFjaEV2ZW50IGhhbmRsZXJzIGF1dG9tYXRpY2FsbHkgKHVubGlrZSB3aXRoIGFkZEV2ZW50TGlzdGVuZXIpXG4gICAgICAgICAgICAgICAgLy8gc28gdG8gYXZvaWQgbGVha3MsIHdlIGhhdmUgdG8gcmVtb3ZlIHRoZW0gbWFudWFsbHkuIFNlZSBidWcgIzg1NlxuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5hZGREaXNwb3NlQ2FsbGJhY2soZWxlbWVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZGV0YWNoRXZlbnQoYXR0YWNoRXZlbnROYW1lLCBhdHRhY2hFdmVudEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudFwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2VyRXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudFR5cGUpIHtcbiAgICAgICAgICAgIGlmICghKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlVHlwZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZWxlbWVudCBtdXN0IGJlIGEgRE9NIG5vZGUgd2hlbiBjYWxsaW5nIHRyaWdnZXJFdmVudFwiKTtcblxuICAgICAgICAgICAgLy8gRm9yIGNsaWNrIGV2ZW50cyBvbiBjaGVja2JveGVzIGFuZCByYWRpbyBidXR0b25zLCBqUXVlcnkgdG9nZ2xlcyB0aGUgZWxlbWVudCBjaGVja2VkIHN0YXRlICphZnRlciogdGhlXG4gICAgICAgICAgICAvLyBldmVudCBoYW5kbGVyIHJ1bnMgaW5zdGVhZCBvZiAqYmVmb3JlKi4gKFRoaXMgd2FzIGZpeGVkIGluIDEuOSBmb3IgY2hlY2tib3hlcyBidXQgbm90IGZvciByYWRpbyBidXR0b25zLilcbiAgICAgICAgICAgIC8vIElFIGRvZXNuJ3QgY2hhbmdlIHRoZSBjaGVja2VkIHN0YXRlIHdoZW4geW91IHRyaWdnZXIgdGhlIGNsaWNrIGV2ZW50IHVzaW5nIFwiZmlyZUV2ZW50XCIuXG4gICAgICAgICAgICAvLyBJbiBib3RoIGNhc2VzLCB3ZSdsbCB1c2UgdGhlIGNsaWNrIG1ldGhvZCBpbnN0ZWFkLlxuICAgICAgICAgICAgdmFyIHVzZUNsaWNrV29ya2Fyb3VuZCA9IGlzQ2xpY2tPbkNoZWNrYWJsZUVsZW1lbnQoZWxlbWVudCwgZXZlbnRUeXBlKTtcblxuICAgICAgICAgICAgaWYgKGpRdWVyeUluc3RhbmNlICYmICF1c2VDbGlja1dvcmthcm91bmQpIHtcbiAgICAgICAgICAgICAgICBqUXVlcnlJbnN0YW5jZShlbGVtZW50KVsndHJpZ2dlciddKGV2ZW50VHlwZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQuZGlzcGF0Y2hFdmVudCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50Q2F0ZWdvcnkgPSBrbm93bkV2ZW50VHlwZXNCeUV2ZW50TmFtZVtldmVudFR5cGVdIHx8IFwiSFRNTEV2ZW50c1wiO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChldmVudENhdGVnb3J5KTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuaW5pdEV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAwLCAwLCAwLCAwLCAwLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCwgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN1cHBsaWVkIGVsZW1lbnQgZG9lc24ndCBzdXBwb3J0IGRpc3BhdGNoRXZlbnRcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVzZUNsaWNrV29ya2Fyb3VuZCAmJiBlbGVtZW50LmNsaWNrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGljaygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZWxlbWVudC5maXJlRXZlbnQgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZmlyZUV2ZW50KFwib25cIiArIGV2ZW50VHlwZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHRyaWdnZXJpbmcgZXZlbnRzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVud3JhcE9ic2VydmFibGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLmlzT2JzZXJ2YWJsZSh2YWx1ZSkgPyB2YWx1ZSgpIDogdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGVla09ic2VydmFibGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLmlzT2JzZXJ2YWJsZSh2YWx1ZSkgPyB2YWx1ZS5wZWVrKCkgOiB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b2dnbGVEb21Ob2RlQ3NzQ2xhc3M6IHRvZ2dsZURvbU5vZGVDc3NDbGFzcyxcblxuICAgICAgICBzZXRUZXh0Q29udGVudDogZnVuY3Rpb24oZWxlbWVudCwgdGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgaWYgKCh2YWx1ZSA9PT0gbnVsbCkgfHwgKHZhbHVlID09PSB1bmRlZmluZWQpKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gXCJcIjtcblxuICAgICAgICAgICAgLy8gV2UgbmVlZCB0aGVyZSB0byBiZSBleGFjdGx5IG9uZSBjaGlsZDogYSB0ZXh0IG5vZGUuXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gY2hpbGRyZW4sIG1vcmUgdGhhbiBvbmUsIG9yIGlmIGl0J3Mgbm90IGEgdGV4dCBub2RlLFxuICAgICAgICAgICAgLy8gd2UnbGwgY2xlYXIgZXZlcnl0aGluZyBhbmQgY3JlYXRlIGEgc2luZ2xlIHRleHQgbm9kZS5cbiAgICAgICAgICAgIHZhciBpbm5lclRleHROb2RlID0ga28udmlydHVhbEVsZW1lbnRzLmZpcnN0Q2hpbGQoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAoIWlubmVyVGV4dE5vZGUgfHwgaW5uZXJUZXh0Tm9kZS5ub2RlVHlwZSAhPSAzIHx8IGtvLnZpcnR1YWxFbGVtZW50cy5uZXh0U2libGluZyhpbm5lclRleHROb2RlKSkge1xuICAgICAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5zZXREb21Ob2RlQ2hpbGRyZW4oZWxlbWVudCwgW2VsZW1lbnQub3duZXJEb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5uZXJUZXh0Tm9kZS5kYXRhID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGtvLnV0aWxzLmZvcmNlUmVmcmVzaChlbGVtZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRFbGVtZW50TmFtZTogZnVuY3Rpb24oZWxlbWVudCwgbmFtZSkge1xuICAgICAgICAgICAgZWxlbWVudC5uYW1lID0gbmFtZTtcblxuICAgICAgICAgICAgLy8gV29ya2Fyb3VuZCBJRSA2LzcgaXNzdWVcbiAgICAgICAgICAgIC8vIC0gaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L2lzc3Vlcy8xOTdcbiAgICAgICAgICAgIC8vIC0gaHR0cDovL3d3dy5tYXR0czQxMS5jb20vcG9zdC9zZXR0aW5nX3RoZV9uYW1lX2F0dHJpYnV0ZV9pbl9pZV9kb20vXG4gICAgICAgICAgICBpZiAoaWVWZXJzaW9uIDw9IDcpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm1lcmdlQXR0cmlidXRlcyhkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiPGlucHV0IG5hbWU9J1wiICsgZWxlbWVudC5uYW1lICsgXCInLz5cIiksIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2goZSkge30gLy8gRm9yIElFOSB3aXRoIGRvYyBtb2RlIFwiSUU5IFN0YW5kYXJkc1wiIGFuZCBicm93c2VyIG1vZGUgXCJJRTkgQ29tcGF0aWJpbGl0eSBWaWV3XCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmb3JjZVJlZnJlc2g6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIC8vIFdvcmthcm91bmQgZm9yIGFuIElFOSByZW5kZXJpbmcgYnVnIC0gaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L2lzc3Vlcy8yMDlcbiAgICAgICAgICAgIGlmIChpZVZlcnNpb24gPj0gOSkge1xuICAgICAgICAgICAgICAgIC8vIEZvciB0ZXh0IG5vZGVzIGFuZCBjb21tZW50IG5vZGVzIChtb3N0IGxpa2VseSB2aXJ0dWFsIGVsZW1lbnRzKSwgd2Ugd2lsbCBoYXZlIHRvIHJlZnJlc2ggdGhlIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIHZhciBlbGVtID0gbm9kZS5ub2RlVHlwZSA9PSAxID8gbm9kZSA6IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbS5zdHlsZSlcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5zdHlsZS56b29tID0gZWxlbS5zdHlsZS56b29tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGVuc3VyZVNlbGVjdEVsZW1lbnRJc1JlbmRlcmVkQ29ycmVjdGx5OiBmdW5jdGlvbihzZWxlY3RFbGVtZW50KSB7XG4gICAgICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBJRTkgcmVuZGVyaW5nIGJ1ZyAtIGl0IGRvZXNuJ3QgcmVsaWFibHkgZGlzcGxheSBhbGwgdGhlIHRleHQgaW4gZHluYW1pY2FsbHktYWRkZWQgc2VsZWN0IGJveGVzIHVubGVzcyB5b3UgZm9yY2UgaXQgdG8gcmUtcmVuZGVyIGJ5IHVwZGF0aW5nIHRoZSB3aWR0aC5cbiAgICAgICAgICAgIC8vIChTZWUgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L2lzc3Vlcy8zMTIsIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTkwODQ5NC9zZWxlY3Qtb25seS1zaG93cy1maXJzdC1jaGFyLW9mLXNlbGVjdGVkLW9wdGlvbilcbiAgICAgICAgICAgIC8vIEFsc28gZml4ZXMgSUU3IGFuZCBJRTggYnVnIHRoYXQgY2F1c2VzIHNlbGVjdHMgdG8gYmUgemVybyB3aWR0aCBpZiBlbmNsb3NlZCBieSAnaWYnIG9yICd3aXRoJy4gKFNlZSBpc3N1ZSAjODM5KVxuICAgICAgICAgICAgaWYgKGllVmVyc2lvbikge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnaW5hbFdpZHRoID0gc2VsZWN0RWxlbWVudC5zdHlsZS53aWR0aDtcbiAgICAgICAgICAgICAgICBzZWxlY3RFbGVtZW50LnN0eWxlLndpZHRoID0gMDtcbiAgICAgICAgICAgICAgICBzZWxlY3RFbGVtZW50LnN0eWxlLndpZHRoID0gb3JpZ2luYWxXaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByYW5nZTogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG4gICAgICAgICAgICBtaW4gPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKG1pbik7XG4gICAgICAgICAgICBtYXggPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKG1heCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gbWluOyBpIDw9IG1heDsgaSsrKVxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGkpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBtYWtlQXJyYXk6IGZ1bmN0aW9uKGFycmF5TGlrZU9iamVjdCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBhcnJheUxpa2VPYmplY3QubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYXJyYXlMaWtlT2JqZWN0W2ldKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzSWU2IDogaXNJZTYsXG4gICAgICAgIGlzSWU3IDogaXNJZTcsXG4gICAgICAgIGllVmVyc2lvbiA6IGllVmVyc2lvbixcblxuICAgICAgICBnZXRGb3JtRmllbGRzOiBmdW5jdGlvbihmb3JtLCBmaWVsZE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBmaWVsZHMgPSBrby51dGlscy5tYWtlQXJyYXkoZm9ybS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImlucHV0XCIpKS5jb25jYXQoa28udXRpbHMubWFrZUFycmF5KGZvcm0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZXh0YXJlYVwiKSkpO1xuICAgICAgICAgICAgdmFyIGlzTWF0Y2hpbmdGaWVsZCA9ICh0eXBlb2YgZmllbGROYW1lID09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgID8gZnVuY3Rpb24oZmllbGQpIHsgcmV0dXJuIGZpZWxkLm5hbWUgPT09IGZpZWxkTmFtZSB9XG4gICAgICAgICAgICAgICAgOiBmdW5jdGlvbihmaWVsZCkgeyByZXR1cm4gZmllbGROYW1lLnRlc3QoZmllbGQubmFtZSkgfTsgLy8gVHJlYXQgZmllbGROYW1lIGFzIHJlZ2V4IG9yIG9iamVjdCBjb250YWluaW5nIHByZWRpY2F0ZVxuICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBmaWVsZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNNYXRjaGluZ0ZpZWxkKGZpZWxkc1tpXSkpXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXMucHVzaChmaWVsZHNbaV0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlSnNvbjogZnVuY3Rpb24gKGpzb25TdHJpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YganNvblN0cmluZyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAganNvblN0cmluZyA9IGtvLnV0aWxzLnN0cmluZ1RyaW0oanNvblN0cmluZyk7XG4gICAgICAgICAgICAgICAgaWYgKGpzb25TdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEpTT04gJiYgSlNPTi5wYXJzZSkgLy8gVXNlIG5hdGl2ZSBwYXJzaW5nIHdoZXJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvblN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAobmV3IEZ1bmN0aW9uKFwicmV0dXJuIFwiICsganNvblN0cmluZykpKCk7IC8vIEZhbGxiYWNrIG9uIGxlc3Mgc2FmZSBwYXJzaW5nIGZvciBvbGRlciBicm93c2Vyc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0cmluZ2lmeUpzb246IGZ1bmN0aW9uIChkYXRhLCByZXBsYWNlciwgc3BhY2UpIHsgICAvLyByZXBsYWNlciBhbmQgc3BhY2UgYXJlIG9wdGlvbmFsXG4gICAgICAgICAgICBpZiAoIUpTT04gfHwgIUpTT04uc3RyaW5naWZ5KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIEpTT04uc3RyaW5naWZ5KCkuIFNvbWUgYnJvd3NlcnMgKGUuZy4sIElFIDwgOCkgZG9uJ3Qgc3VwcG9ydCBpdCBuYXRpdmVseSwgYnV0IHlvdSBjYW4gb3ZlcmNvbWUgdGhpcyBieSBhZGRpbmcgYSBzY3JpcHQgcmVmZXJlbmNlIHRvIGpzb24yLmpzLCBkb3dubG9hZGFibGUgZnJvbSBodHRwOi8vd3d3Lmpzb24ub3JnL2pzb24yLmpzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoZGF0YSksIHJlcGxhY2VyLCBzcGFjZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcG9zdEpzb246IGZ1bmN0aW9uICh1cmxPckZvcm0sIGRhdGEsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IG9wdGlvbnNbJ3BhcmFtcyddIHx8IHt9O1xuICAgICAgICAgICAgdmFyIGluY2x1ZGVGaWVsZHMgPSBvcHRpb25zWydpbmNsdWRlRmllbGRzJ10gfHwgdGhpcy5maWVsZHNJbmNsdWRlZFdpdGhKc29uUG9zdDtcbiAgICAgICAgICAgIHZhciB1cmwgPSB1cmxPckZvcm07XG5cbiAgICAgICAgICAgIC8vIElmIHdlIHdlcmUgZ2l2ZW4gYSBmb3JtLCB1c2UgaXRzICdhY3Rpb24nIFVSTCBhbmQgcGljayBvdXQgYW55IHJlcXVlc3RlZCBmaWVsZCB2YWx1ZXNcbiAgICAgICAgICAgIGlmKCh0eXBlb2YgdXJsT3JGb3JtID09ICdvYmplY3QnKSAmJiAoa28udXRpbHMudGFnTmFtZUxvd2VyKHVybE9yRm9ybSkgPT09IFwiZm9ybVwiKSkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnaW5hbEZvcm0gPSB1cmxPckZvcm07XG4gICAgICAgICAgICAgICAgdXJsID0gb3JpZ2luYWxGb3JtLmFjdGlvbjtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gaW5jbHVkZUZpZWxkcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmllbGRzID0ga28udXRpbHMuZ2V0Rm9ybUZpZWxkcyhvcmlnaW5hbEZvcm0sIGluY2x1ZGVGaWVsZHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gZmllbGRzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW2ZpZWxkc1tqXS5uYW1lXSA9IGZpZWxkc1tqXS52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRhdGEgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGRhdGEpO1xuICAgICAgICAgICAgdmFyIGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZm9ybVwiKTtcbiAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgZm9ybS5hY3Rpb24gPSB1cmw7XG4gICAgICAgICAgICBmb3JtLm1ldGhvZCA9IFwicG9zdFwiO1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBTaW5jZSAnZGF0YScgdGhpcyBpcyBhIG1vZGVsIG9iamVjdCwgd2UgaW5jbHVkZSBhbGwgcHJvcGVydGllcyBpbmNsdWRpbmcgdGhvc2UgaW5oZXJpdGVkIGZyb20gaXRzIHByb3RvdHlwZVxuICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgICAgICBpbnB1dC50eXBlID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAgICAgICBpbnB1dC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0ga28udXRpbHMuc3RyaW5naWZ5SnNvbihrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGRhdGFba2V5XSkpO1xuICAgICAgICAgICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqZWN0Rm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICAgICAgaW5wdXQudHlwZSA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgICAgICAgaW5wdXQubmFtZSA9IGtleTtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvcm0pO1xuICAgICAgICAgICAgb3B0aW9uc1snc3VibWl0dGVyJ10gPyBvcHRpb25zWydzdWJtaXR0ZXInXShmb3JtKSA6IGZvcm0uc3VibWl0KCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgZm9ybS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZvcm0pOyB9LCAwKTtcbiAgICAgICAgfVxuICAgIH1cbn0oKSk7XG5cbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMnLCBrby51dGlscyk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFycmF5Rm9yRWFjaCcsIGtvLnV0aWxzLmFycmF5Rm9yRWFjaCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFycmF5Rmlyc3QnLCBrby51dGlscy5hcnJheUZpcnN0KTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYXJyYXlGaWx0ZXInLCBrby51dGlscy5hcnJheUZpbHRlcik7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFycmF5R2V0RGlzdGluY3RWYWx1ZXMnLCBrby51dGlscy5hcnJheUdldERpc3RpbmN0VmFsdWVzKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYXJyYXlJbmRleE9mJywga28udXRpbHMuYXJyYXlJbmRleE9mKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYXJyYXlNYXAnLCBrby51dGlscy5hcnJheU1hcCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFycmF5UHVzaEFsbCcsIGtvLnV0aWxzLmFycmF5UHVzaEFsbCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFycmF5UmVtb3ZlSXRlbScsIGtvLnV0aWxzLmFycmF5UmVtb3ZlSXRlbSk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmV4dGVuZCcsIGtvLnV0aWxzLmV4dGVuZCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmZpZWxkc0luY2x1ZGVkV2l0aEpzb25Qb3N0Jywga28udXRpbHMuZmllbGRzSW5jbHVkZWRXaXRoSnNvblBvc3QpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5nZXRGb3JtRmllbGRzJywga28udXRpbHMuZ2V0Rm9ybUZpZWxkcyk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnBlZWtPYnNlcnZhYmxlJywga28udXRpbHMucGVla09ic2VydmFibGUpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5wb3N0SnNvbicsIGtvLnV0aWxzLnBvc3RKc29uKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMucGFyc2VKc29uJywga28udXRpbHMucGFyc2VKc29uKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXInLCBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcik7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnN0cmluZ2lmeUpzb24nLCBrby51dGlscy5zdHJpbmdpZnlKc29uKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMucmFuZ2UnLCBrby51dGlscy5yYW5nZSk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnRvZ2dsZURvbU5vZGVDc3NDbGFzcycsIGtvLnV0aWxzLnRvZ2dsZURvbU5vZGVDc3NDbGFzcyk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnRyaWdnZXJFdmVudCcsIGtvLnV0aWxzLnRyaWdnZXJFdmVudCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnVud3JhcE9ic2VydmFibGUnLCBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMub2JqZWN0Rm9yRWFjaCcsIGtvLnV0aWxzLm9iamVjdEZvckVhY2gpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hZGRPclJlbW92ZUl0ZW0nLCBrby51dGlscy5hZGRPclJlbW92ZUl0ZW0pO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5zZXRUZXh0Q29udGVudCcsIGtvLnV0aWxzLnNldFRleHRDb250ZW50KTtcbmtvLmV4cG9ydFN5bWJvbCgndW53cmFwJywga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSk7IC8vIENvbnZlbmllbnQgc2hvcnRoYW5kLCBiZWNhdXNlIHRoaXMgaXMgdXNlZCBzbyBjb21tb25seVxuXG5pZiAoIUZ1bmN0aW9uLnByb3RvdHlwZVsnYmluZCddKSB7XG4gICAgLy8gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgaXMgYSBzdGFuZGFyZCBwYXJ0IG9mIEVDTUFTY3JpcHQgNXRoIEVkaXRpb24gKERlY2VtYmVyIDIwMDksIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9wdWJsaWNhdGlvbnMvZmlsZXMvRUNNQS1TVC9FQ01BLTI2Mi5wZGYpXG4gICAgLy8gSW4gY2FzZSB0aGUgYnJvd3NlciBkb2Vzbid0IGltcGxlbWVudCBpdCBuYXRpdmVseSwgcHJvdmlkZSBhIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24uIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgYmFzZWQgb24gdGhlIG9uZSBpbiBwcm90b3R5cGUuanNcbiAgICBGdW5jdGlvbi5wcm90b3R5cGVbJ2JpbmQnXSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsRnVuY3Rpb24gPSB0aGlzO1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxGdW5jdGlvbi5hcHBseShvYmplY3QsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHBhcnRpYWxBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBwYXJ0aWFsQXJncy5zbGljZSgwKTtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxGdW5jdGlvbi5hcHBseShvYmplY3QsIGFyZ3MpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmtvLnV0aWxzLmRvbURhdGEgPSBuZXcgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdW5pcXVlSWQgPSAwO1xuICAgIHZhciBkYXRhU3RvcmVLZXlFeHBhbmRvUHJvcGVydHlOYW1lID0gXCJfX2tvX19cIiArIChuZXcgRGF0ZSkuZ2V0VGltZSgpO1xuICAgIHZhciBkYXRhU3RvcmUgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGdldEFsbChub2RlLCBjcmVhdGVJZk5vdEZvdW5kKSB7XG4gICAgICAgIHZhciBkYXRhU3RvcmVLZXkgPSBub2RlW2RhdGFTdG9yZUtleUV4cGFuZG9Qcm9wZXJ0eU5hbWVdO1xuICAgICAgICB2YXIgaGFzRXhpc3RpbmdEYXRhU3RvcmUgPSBkYXRhU3RvcmVLZXkgJiYgKGRhdGFTdG9yZUtleSAhPT0gXCJudWxsXCIpICYmIGRhdGFTdG9yZVtkYXRhU3RvcmVLZXldO1xuICAgICAgICBpZiAoIWhhc0V4aXN0aW5nRGF0YVN0b3JlKSB7XG4gICAgICAgICAgICBpZiAoIWNyZWF0ZUlmTm90Rm91bmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGRhdGFTdG9yZUtleSA9IG5vZGVbZGF0YVN0b3JlS2V5RXhwYW5kb1Byb3BlcnR5TmFtZV0gPSBcImtvXCIgKyB1bmlxdWVJZCsrO1xuICAgICAgICAgICAgZGF0YVN0b3JlW2RhdGFTdG9yZUtleV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YVN0b3JlW2RhdGFTdG9yZUtleV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAobm9kZSwga2V5KSB7XG4gICAgICAgICAgICB2YXIgYWxsRGF0YUZvck5vZGUgPSBnZXRBbGwobm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuIGFsbERhdGFGb3JOb2RlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBhbGxEYXRhRm9yTm9kZVtrZXldO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChub2RlLCBrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBhY3R1YWxseSBjcmVhdGUgYSBuZXcgZG9tRGF0YSBrZXkgaWYgd2UgYXJlIGFjdHVhbGx5IGRlbGV0aW5nIGEgdmFsdWVcbiAgICAgICAgICAgICAgICBpZiAoZ2V0QWxsKG5vZGUsIGZhbHNlKSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYWxsRGF0YUZvck5vZGUgPSBnZXRBbGwobm9kZSwgdHJ1ZSk7XG4gICAgICAgICAgICBhbGxEYXRhRm9yTm9kZVtrZXldID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgdmFyIGRhdGFTdG9yZUtleSA9IG5vZGVbZGF0YVN0b3JlS2V5RXhwYW5kb1Byb3BlcnR5TmFtZV07XG4gICAgICAgICAgICBpZiAoZGF0YVN0b3JlS2V5KSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGRhdGFTdG9yZVtkYXRhU3RvcmVLZXldO1xuICAgICAgICAgICAgICAgIG5vZGVbZGF0YVN0b3JlS2V5RXhwYW5kb1Byb3BlcnR5TmFtZV0gPSBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBFeHBvc2luZyBcImRpZCBjbGVhblwiIGZsYWcgcHVyZWx5IHNvIHNwZWNzIGNhbiBpbmZlciB3aGV0aGVyIHRoaW5ncyBoYXZlIGJlZW4gY2xlYW5lZCB1cCBhcyBpbnRlbmRlZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5leHRLZXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAodW5pcXVlSWQrKykgKyBkYXRhU3RvcmVLZXlFeHBhbmRvUHJvcGVydHlOYW1lO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuZG9tRGF0YScsIGtvLnV0aWxzLmRvbURhdGEpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5kb21EYXRhLmNsZWFyJywga28udXRpbHMuZG9tRGF0YS5jbGVhcik7IC8vIEV4cG9ydGluZyBvbmx5IHNvIHNwZWNzIGNhbiBjbGVhciB1cCBhZnRlciB0aGVtc2VsdmVzIGZ1bGx5XG5cbmtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbCA9IG5ldyAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBkb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG4gICAgdmFyIGNsZWFuYWJsZU5vZGVUeXBlcyA9IHsgMTogdHJ1ZSwgODogdHJ1ZSwgOTogdHJ1ZSB9OyAgICAgICAvLyBFbGVtZW50LCBDb21tZW50LCBEb2N1bWVudFxuICAgIHZhciBjbGVhbmFibGVOb2RlVHlwZXNXaXRoRGVzY2VuZGFudHMgPSB7IDE6IHRydWUsIDk6IHRydWUgfTsgLy8gRWxlbWVudCwgRG9jdW1lbnRcblxuICAgIGZ1bmN0aW9uIGdldERpc3Bvc2VDYWxsYmFja3NDb2xsZWN0aW9uKG5vZGUsIGNyZWF0ZUlmTm90Rm91bmQpIHtcbiAgICAgICAgdmFyIGFsbERpc3Bvc2VDYWxsYmFja3MgPSBrby51dGlscy5kb21EYXRhLmdldChub2RlLCBkb21EYXRhS2V5KTtcbiAgICAgICAgaWYgKChhbGxEaXNwb3NlQ2FsbGJhY2tzID09PSB1bmRlZmluZWQpICYmIGNyZWF0ZUlmTm90Rm91bmQpIHtcbiAgICAgICAgICAgIGFsbERpc3Bvc2VDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KG5vZGUsIGRvbURhdGFLZXksIGFsbERpc3Bvc2VDYWxsYmFja3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxEaXNwb3NlQ2FsbGJhY2tzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZXN0cm95Q2FsbGJhY2tzQ29sbGVjdGlvbihub2RlKSB7XG4gICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KG5vZGUsIGRvbURhdGFLZXksIHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYW5TaW5nbGVOb2RlKG5vZGUpIHtcbiAgICAgICAgLy8gUnVuIGFsbCB0aGUgZGlzcG9zZSBjYWxsYmFja3NcbiAgICAgICAgdmFyIGNhbGxiYWNrcyA9IGdldERpc3Bvc2VDYWxsYmFja3NDb2xsZWN0aW9uKG5vZGUsIGZhbHNlKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICAgICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApOyAvLyBDbG9uZSwgYXMgdGhlIGFycmF5IG1heSBiZSBtb2RpZmllZCBkdXJpbmcgaXRlcmF0aW9uICh0eXBpY2FsbHksIGNhbGxiYWNrcyB3aWxsIHJlbW92ZSB0aGVtc2VsdmVzKVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzW2ldKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXJhc2UgdGhlIERPTSBkYXRhXG4gICAgICAgIGtvLnV0aWxzLmRvbURhdGEuY2xlYXIobm9kZSk7XG5cbiAgICAgICAgLy8gUGVyZm9ybSBjbGVhbnVwIG5lZWRlZCBieSBleHRlcm5hbCBsaWJyYXJpZXMgKGN1cnJlbnRseSBvbmx5IGpRdWVyeSwgYnV0IGNhbiBiZSBleHRlbmRlZClcbiAgICAgICAga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsW1wiY2xlYW5FeHRlcm5hbERhdGFcIl0obm9kZSk7XG5cbiAgICAgICAgLy8gQ2xlYXIgYW55IGltbWVkaWF0ZS1jaGlsZCBjb21tZW50IG5vZGVzLCBhcyB0aGVzZSB3b3VsZG4ndCBoYXZlIGJlZW4gZm91bmQgYnlcbiAgICAgICAgLy8gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIikgaW4gY2xlYW5Ob2RlKCkgKGNvbW1lbnQgbm9kZXMgYXJlbid0IGVsZW1lbnRzKVxuICAgICAgICBpZiAoY2xlYW5hYmxlTm9kZVR5cGVzV2l0aERlc2NlbmRhbnRzW25vZGUubm9kZVR5cGVdKVxuICAgICAgICAgICAgY2xlYW5JbW1lZGlhdGVDb21tZW50VHlwZUNoaWxkcmVuKG5vZGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFuSW1tZWRpYXRlQ29tbWVudFR5cGVDaGlsZHJlbihub2RlV2l0aENoaWxkcmVuKSB7XG4gICAgICAgIHZhciBjaGlsZCwgbmV4dENoaWxkID0gbm9kZVdpdGhDaGlsZHJlbi5maXJzdENoaWxkO1xuICAgICAgICB3aGlsZSAoY2hpbGQgPSBuZXh0Q2hpbGQpIHtcbiAgICAgICAgICAgIG5leHRDaGlsZCA9IGNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSA4KVxuICAgICAgICAgICAgICAgIGNsZWFuU2luZ2xlTm9kZShjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhZGREaXNwb3NlQ2FsbGJhY2sgOiBmdW5jdGlvbihub2RlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgZ2V0RGlzcG9zZUNhbGxiYWNrc0NvbGxlY3Rpb24obm9kZSwgdHJ1ZSkucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlRGlzcG9zZUNhbGxiYWNrIDogZnVuY3Rpb24obm9kZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3NDb2xsZWN0aW9uID0gZ2V0RGlzcG9zZUNhbGxiYWNrc0NvbGxlY3Rpb24obm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrc0NvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBrby51dGlscy5hcnJheVJlbW92ZUl0ZW0oY2FsbGJhY2tzQ29sbGVjdGlvbiwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja3NDb2xsZWN0aW9uLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICBkZXN0cm95Q2FsbGJhY2tzQ29sbGVjdGlvbihub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhbk5vZGUgOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAvLyBGaXJzdCBjbGVhbiB0aGlzIG5vZGUsIHdoZXJlIGFwcGxpY2FibGVcbiAgICAgICAgICAgIGlmIChjbGVhbmFibGVOb2RlVHlwZXNbbm9kZS5ub2RlVHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjbGVhblNpbmdsZU5vZGUobm9kZSk7XG5cbiAgICAgICAgICAgICAgICAvLyAuLi4gdGhlbiBpdHMgZGVzY2VuZGFudHMsIHdoZXJlIGFwcGxpY2FibGVcbiAgICAgICAgICAgICAgICBpZiAoY2xlYW5hYmxlTm9kZVR5cGVzV2l0aERlc2NlbmRhbnRzW25vZGUubm9kZVR5cGVdKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENsb25lIHRoZSBkZXNjZW5kYW50cyBsaXN0IGluIGNhc2UgaXQgY2hhbmdlcyBkdXJpbmcgaXRlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZXNjZW5kYW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5hcnJheVB1c2hBbGwoZGVzY2VuZGFudHMsIG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBkZXNjZW5kYW50cy5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhblNpbmdsZU5vZGUoZGVzY2VuZGFudHNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZU5vZGUgOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICBrby5jbGVhbk5vZGUobm9kZSk7XG4gICAgICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlKVxuICAgICAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBcImNsZWFuRXh0ZXJuYWxEYXRhXCIgOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBzdXBwb3J0IGZvciBqUXVlcnkgaGVyZSBiZWNhdXNlIGl0J3Mgc28gY29tbW9ubHkgdXNlZC5cbiAgICAgICAgICAgIC8vIE1hbnkgalF1ZXJ5IHBsdWdpbnMgKGluY2x1ZGluZyBqcXVlcnkudG1wbCkgc3RvcmUgZGF0YSB1c2luZyBqUXVlcnkncyBlcXVpdmFsZW50IG9mIGRvbURhdGFcbiAgICAgICAgICAgIC8vIHNvIG5vdGlmeSBpdCB0byB0ZWFyIGRvd24gYW55IHJlc291cmNlcyBhc3NvY2lhdGVkIHdpdGggdGhlIG5vZGUgJiBkZXNjZW5kYW50cyBoZXJlLlxuICAgICAgICAgICAgaWYgKGpRdWVyeUluc3RhbmNlICYmICh0eXBlb2YgalF1ZXJ5SW5zdGFuY2VbJ2NsZWFuRGF0YSddID09IFwiZnVuY3Rpb25cIikpXG4gICAgICAgICAgICAgICAgalF1ZXJ5SW5zdGFuY2VbJ2NsZWFuRGF0YSddKFtub2RlXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcbmtvLmNsZWFuTm9kZSA9IGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5jbGVhbk5vZGU7IC8vIFNob3J0aGFuZCBuYW1lIGZvciBjb252ZW5pZW5jZVxua28ucmVtb3ZlTm9kZSA9IGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5yZW1vdmVOb2RlOyAvLyBTaG9ydGhhbmQgbmFtZSBmb3IgY29udmVuaWVuY2VcbmtvLmV4cG9ydFN5bWJvbCgnY2xlYW5Ob2RlJywga28uY2xlYW5Ob2RlKTtcbmtvLmV4cG9ydFN5bWJvbCgncmVtb3ZlTm9kZScsIGtvLnJlbW92ZU5vZGUpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5kb21Ob2RlRGlzcG9zYWwnLCBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5kb21Ob2RlRGlzcG9zYWwuYWRkRGlzcG9zZUNhbGxiYWNrJywga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsLmFkZERpc3Bvc2VDYWxsYmFjayk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmRvbU5vZGVEaXNwb3NhbC5yZW1vdmVEaXNwb3NlQ2FsbGJhY2snLCBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwucmVtb3ZlRGlzcG9zZUNhbGxiYWNrKTtcbihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxlYWRpbmdDb21tZW50UmVnZXggPSAvXihcXHMqKTwhLS0oLio/KS0tPi87XG5cbiAgICBmdW5jdGlvbiBzaW1wbGVIdG1sUGFyc2UoaHRtbCwgZG9jdW1lbnRDb250ZXh0KSB7XG4gICAgICAgIGRvY3VtZW50Q29udGV4dCB8fCAoZG9jdW1lbnRDb250ZXh0ID0gZG9jdW1lbnQpO1xuICAgICAgICB2YXIgd2luZG93Q29udGV4dCA9IGRvY3VtZW50Q29udGV4dFsncGFyZW50V2luZG93J10gfHwgZG9jdW1lbnRDb250ZXh0WydkZWZhdWx0VmlldyddIHx8IHdpbmRvdztcblxuICAgICAgICAvLyBCYXNlZCBvbiBqUXVlcnkncyBcImNsZWFuXCIgZnVuY3Rpb24sIGJ1dCBvbmx5IGFjY291bnRpbmcgZm9yIHRhYmxlLXJlbGF0ZWQgZWxlbWVudHMuXG4gICAgICAgIC8vIElmIHlvdSBoYXZlIHJlZmVyZW5jZWQgalF1ZXJ5LCB0aGlzIHdvbid0IGJlIHVzZWQgYW55d2F5IC0gS08gd2lsbCB1c2UgalF1ZXJ5J3MgXCJjbGVhblwiIGZ1bmN0aW9uIGRpcmVjdGx5XG5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZXJlJ3Mgc3RpbGwgYW4gaXNzdWUgaW4gSUUgPCA5IHdoZXJlYnkgaXQgd2lsbCBkaXNjYXJkIGNvbW1lbnQgbm9kZXMgdGhhdCBhcmUgdGhlIGZpcnN0IGNoaWxkIG9mXG4gICAgICAgIC8vIGEgZGVzY2VuZGFudCBub2RlLiBGb3IgZXhhbXBsZTogXCI8ZGl2PjwhLS0gbXljb21tZW50IC0tPmFiYzwvZGl2PlwiIHdpbGwgZ2V0IHBhcnNlZCBhcyBcIjxkaXY+YWJjPC9kaXY+XCJcbiAgICAgICAgLy8gVGhpcyB3b24ndCBhZmZlY3QgYW55b25lIHdobyBoYXMgcmVmZXJlbmNlZCBqUXVlcnksIGFuZCB0aGVyZSdzIGFsd2F5cyB0aGUgd29ya2Fyb3VuZCBvZiBpbnNlcnRpbmcgYSBkdW1teSBub2RlXG4gICAgICAgIC8vIChwb3NzaWJseSBhIHRleHQgbm9kZSkgaW4gZnJvbnQgb2YgdGhlIGNvbW1lbnQuIFNvLCBLTyBkb2VzIG5vdCBhdHRlbXB0IHRvIHdvcmthcm91bmQgdGhpcyBJRSBpc3N1ZSBhdXRvbWF0aWNhbGx5IGF0IHByZXNlbnQuXG5cbiAgICAgICAgLy8gVHJpbSB3aGl0ZXNwYWNlLCBvdGhlcndpc2UgaW5kZXhPZiB3b24ndCB3b3JrIGFzIGV4cGVjdGVkXG4gICAgICAgIHZhciB0YWdzID0ga28udXRpbHMuc3RyaW5nVHJpbShodG1sKS50b0xvd2VyQ2FzZSgpLCBkaXYgPSBkb2N1bWVudENvbnRleHQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgICAgICAvLyBGaW5kcyB0aGUgZmlyc3QgbWF0Y2ggZnJvbSB0aGUgbGVmdCBjb2x1bW4sIGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIFwid3JhcFwiIGRhdGEgZnJvbSB0aGUgcmlnaHQgY29sdW1uXG4gICAgICAgIHZhciB3cmFwID0gdGFncy5tYXRjaCgvXjwodGhlYWR8dGJvZHl8dGZvb3QpLykgICAgICAgICAgICAgICYmIFsxLCBcIjx0YWJsZT5cIiwgXCI8L3RhYmxlPlwiXSB8fFxuICAgICAgICAgICAgICAgICAgICF0YWdzLmluZGV4T2YoXCI8dHJcIikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIFsyLCBcIjx0YWJsZT48dGJvZHk+XCIsIFwiPC90Ym9keT48L3RhYmxlPlwiXSB8fFxuICAgICAgICAgICAgICAgICAgICghdGFncy5pbmRleE9mKFwiPHRkXCIpIHx8ICF0YWdzLmluZGV4T2YoXCI8dGhcIikpICAgJiYgWzMsIFwiPHRhYmxlPjx0Ym9keT48dHI+XCIsIFwiPC90cj48L3Rib2R5PjwvdGFibGU+XCJdIHx8XG4gICAgICAgICAgICAgICAgICAgLyogYW55dGhpbmcgZWxzZSAqLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFswLCBcIlwiLCBcIlwiXTtcblxuICAgICAgICAvLyBHbyB0byBodG1sIGFuZCBiYWNrLCB0aGVuIHBlZWwgb2ZmIGV4dHJhIHdyYXBwZXJzXG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBhbHdheXMgcHJlZml4IHdpdGggc29tZSBkdW1teSB0ZXh0LCBiZWNhdXNlIG90aGVyd2lzZSwgSUU8OSB3aWxsIHN0cmlwIG91dCBsZWFkaW5nIGNvbW1lbnQgbm9kZXMgaW4gZGVzY2VuZGFudHMuIFRvdGFsIG1hZG5lc3MuXG4gICAgICAgIHZhciBtYXJrdXAgPSBcImlnbm9yZWQ8ZGl2PlwiICsgd3JhcFsxXSArIGh0bWwgKyB3cmFwWzJdICsgXCI8L2Rpdj5cIjtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3dDb250ZXh0Wydpbm5lclNoaXYnXSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCh3aW5kb3dDb250ZXh0Wydpbm5lclNoaXYnXShtYXJrdXApKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSBtYXJrdXA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3ZlIHRvIHRoZSByaWdodCBkZXB0aFxuICAgICAgICB3aGlsZSAod3JhcFswXS0tKVxuICAgICAgICAgICAgZGl2ID0gZGl2Lmxhc3RDaGlsZDtcblxuICAgICAgICByZXR1cm4ga28udXRpbHMubWFrZUFycmF5KGRpdi5sYXN0Q2hpbGQuY2hpbGROb2Rlcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24galF1ZXJ5SHRtbFBhcnNlKGh0bWwsIGRvY3VtZW50Q29udGV4dCkge1xuICAgICAgICAvLyBqUXVlcnkncyBcInBhcnNlSFRNTFwiIGZ1bmN0aW9uIHdhcyBpbnRyb2R1Y2VkIGluIGpRdWVyeSAxLjguMCBhbmQgaXMgYSBkb2N1bWVudGVkIHB1YmxpYyBBUEkuXG4gICAgICAgIGlmIChqUXVlcnlJbnN0YW5jZVsncGFyc2VIVE1MJ10pIHtcbiAgICAgICAgICAgIHJldHVybiBqUXVlcnlJbnN0YW5jZVsncGFyc2VIVE1MJ10oaHRtbCwgZG9jdW1lbnRDb250ZXh0KSB8fCBbXTsgLy8gRW5zdXJlIHdlIGFsd2F5cyByZXR1cm4gYW4gYXJyYXkgYW5kIG5ldmVyIG51bGxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZvciBqUXVlcnkgPCAxLjguMCwgd2UgZmFsbCBiYWNrIG9uIHRoZSB1bmRvY3VtZW50ZWQgaW50ZXJuYWwgXCJjbGVhblwiIGZ1bmN0aW9uLlxuICAgICAgICAgICAgdmFyIGVsZW1zID0galF1ZXJ5SW5zdGFuY2VbJ2NsZWFuJ10oW2h0bWxdLCBkb2N1bWVudENvbnRleHQpO1xuXG4gICAgICAgICAgICAvLyBBcyBvZiBqUXVlcnkgMS43LjEsIGpRdWVyeSBwYXJzZXMgdGhlIEhUTUwgYnkgYXBwZW5kaW5nIGl0IHRvIHNvbWUgZHVtbXkgcGFyZW50IG5vZGVzIGhlbGQgaW4gYW4gaW4tbWVtb3J5IGRvY3VtZW50IGZyYWdtZW50LlxuICAgICAgICAgICAgLy8gVW5mb3J0dW5hdGVseSwgaXQgbmV2ZXIgY2xlYXJzIHRoZSBkdW1teSBwYXJlbnQgbm9kZXMgZnJvbSB0aGUgZG9jdW1lbnQgZnJhZ21lbnQsIHNvIGl0IGxlYWtzIG1lbW9yeSBvdmVyIHRpbWUuXG4gICAgICAgICAgICAvLyBGaXggdGhpcyBieSBmaW5kaW5nIHRoZSB0b3AtbW9zdCBkdW1teSBwYXJlbnQgZWxlbWVudCwgYW5kIGRldGFjaGluZyBpdCBmcm9tIGl0cyBvd25lciBmcmFnbWVudC5cbiAgICAgICAgICAgIGlmIChlbGVtcyAmJiBlbGVtc1swXSkge1xuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIHRvcC1tb3N0IHBhcmVudCBlbGVtZW50IHRoYXQncyBhIGRpcmVjdCBjaGlsZCBvZiBhIGRvY3VtZW50IGZyYWdtZW50XG4gICAgICAgICAgICAgICAgdmFyIGVsZW0gPSBlbGVtc1swXTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoZWxlbS5wYXJlbnROb2RlICYmIGVsZW0ucGFyZW50Tm9kZS5ub2RlVHlwZSAhPT0gMTEgLyogaS5lLiwgRG9jdW1lbnRGcmFnbWVudCAqLylcbiAgICAgICAgICAgICAgICAgICAgZWxlbSA9IGVsZW0ucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAvLyAuLi4gdGhlbiBkZXRhY2ggaXRcbiAgICAgICAgICAgICAgICBpZiAoZWxlbS5wYXJlbnROb2RlKVxuICAgICAgICAgICAgICAgICAgICBlbGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBlbGVtcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGtvLnV0aWxzLnBhcnNlSHRtbEZyYWdtZW50ID0gZnVuY3Rpb24oaHRtbCwgZG9jdW1lbnRDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBqUXVlcnlJbnN0YW5jZSA/IGpRdWVyeUh0bWxQYXJzZShodG1sLCBkb2N1bWVudENvbnRleHQpICAgLy8gQXMgYmVsb3csIGJlbmVmaXQgZnJvbSBqUXVlcnkncyBvcHRpbWlzYXRpb25zIHdoZXJlIHBvc3NpYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHNpbXBsZUh0bWxQYXJzZShodG1sLCBkb2N1bWVudENvbnRleHQpOyAgLy8gLi4uIG90aGVyd2lzZSwgdGhpcyBzaW1wbGUgbG9naWMgd2lsbCBkbyBpbiBtb3N0IGNvbW1vbiBjYXNlcy5cbiAgICB9O1xuXG4gICAga28udXRpbHMuc2V0SHRtbCA9IGZ1bmN0aW9uKG5vZGUsIGh0bWwpIHtcbiAgICAgICAga28udXRpbHMuZW1wdHlEb21Ob2RlKG5vZGUpO1xuXG4gICAgICAgIC8vIFRoZXJlJ3Mgbm8gbGVnaXRpbWF0ZSByZWFzb24gdG8gZGlzcGxheSBhIHN0cmluZ2lmaWVkIG9ic2VydmFibGUgd2l0aG91dCB1bndyYXBwaW5nIGl0LCBzbyB3ZSdsbCB1bndyYXAgaXRcbiAgICAgICAgaHRtbCA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoaHRtbCk7XG5cbiAgICAgICAgaWYgKChodG1sICE9PSBudWxsKSAmJiAoaHRtbCAhPT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBodG1sICE9ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIC8vIGpRdWVyeSBjb250YWlucyBhIGxvdCBvZiBzb3BoaXN0aWNhdGVkIGNvZGUgdG8gcGFyc2UgYXJiaXRyYXJ5IEhUTUwgZnJhZ21lbnRzLFxuICAgICAgICAgICAgLy8gZm9yIGV4YW1wbGUgPHRyPiBlbGVtZW50cyB3aGljaCBhcmUgbm90IG5vcm1hbGx5IGFsbG93ZWQgdG8gZXhpc3Qgb24gdGhlaXIgb3duLlxuICAgICAgICAgICAgLy8gSWYgeW91J3ZlIHJlZmVyZW5jZWQgalF1ZXJ5IHdlJ2xsIHVzZSB0aGF0IHJhdGhlciB0aGFuIGR1cGxpY2F0aW5nIGl0cyBjb2RlLlxuICAgICAgICAgICAgaWYgKGpRdWVyeUluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5SW5zdGFuY2Uobm9kZSlbJ2h0bWwnXShodG1sKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gLi4uIG90aGVyd2lzZSwgdXNlIEtPJ3Mgb3duIHBhcnNpbmcgbG9naWMuXG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlZE5vZGVzID0ga28udXRpbHMucGFyc2VIdG1sRnJhZ21lbnQoaHRtbCwgbm9kZS5vd25lckRvY3VtZW50KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnNlZE5vZGVzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHBhcnNlZE5vZGVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnBhcnNlSHRtbEZyYWdtZW50Jywga28udXRpbHMucGFyc2VIdG1sRnJhZ21lbnQpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5zZXRIdG1sJywga28udXRpbHMuc2V0SHRtbCk7XG5cbmtvLm1lbW9pemF0aW9uID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbWVtb3MgPSB7fTtcblxuICAgIGZ1bmN0aW9uIHJhbmRvbU1heDhIZXhDaGFycygpIHtcbiAgICAgICAgcmV0dXJuICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMDAwKSB8IDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlUmFuZG9tSWQoKSB7XG4gICAgICAgIHJldHVybiByYW5kb21NYXg4SGV4Q2hhcnMoKSArIHJhbmRvbU1heDhIZXhDaGFycygpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmaW5kTWVtb05vZGVzKHJvb3ROb2RlLCBhcHBlbmRUb0FycmF5KSB7XG4gICAgICAgIGlmICghcm9vdE5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChyb290Tm9kZS5ub2RlVHlwZSA9PSA4KSB7XG4gICAgICAgICAgICB2YXIgbWVtb0lkID0ga28ubWVtb2l6YXRpb24ucGFyc2VNZW1vVGV4dChyb290Tm9kZS5ub2RlVmFsdWUpO1xuICAgICAgICAgICAgaWYgKG1lbW9JZCAhPSBudWxsKVxuICAgICAgICAgICAgICAgIGFwcGVuZFRvQXJyYXkucHVzaCh7IGRvbU5vZGU6IHJvb3ROb2RlLCBtZW1vSWQ6IG1lbW9JZCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChyb290Tm9kZS5ub2RlVHlwZSA9PSAxKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgY2hpbGROb2RlcyA9IHJvb3ROb2RlLmNoaWxkTm9kZXMsIGogPSBjaGlsZE5vZGVzLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICBmaW5kTWVtb05vZGVzKGNoaWxkTm9kZXNbaV0sIGFwcGVuZFRvQXJyYXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbWVtb2l6ZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgY2FuIG9ubHkgcGFzcyBhIGZ1bmN0aW9uIHRvIGtvLm1lbW9pemF0aW9uLm1lbW9pemUoKVwiKTtcbiAgICAgICAgICAgIHZhciBtZW1vSWQgPSBnZW5lcmF0ZVJhbmRvbUlkKCk7XG4gICAgICAgICAgICBtZW1vc1ttZW1vSWRdID0gY2FsbGJhY2s7XG4gICAgICAgICAgICByZXR1cm4gXCI8IS0tW2tvX21lbW86XCIgKyBtZW1vSWQgKyBcIl0tLT5cIjtcbiAgICAgICAgfSxcblxuICAgICAgICB1bm1lbW9pemU6IGZ1bmN0aW9uIChtZW1vSWQsIGNhbGxiYWNrUGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBtZW1vc1ttZW1vSWRdO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhbnkgbWVtbyB3aXRoIElEIFwiICsgbWVtb0lkICsgXCIuIFBlcmhhcHMgaXQncyBhbHJlYWR5IGJlZW4gdW5tZW1vaXplZC5cIik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGNhbGxiYWNrUGFyYW1zIHx8IFtdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkgeyBkZWxldGUgbWVtb3NbbWVtb0lkXTsgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVubWVtb2l6ZURvbU5vZGVBbmREZXNjZW5kYW50czogZnVuY3Rpb24gKGRvbU5vZGUsIGV4dHJhQ2FsbGJhY2tQYXJhbXNBcnJheSkge1xuICAgICAgICAgICAgdmFyIG1lbW9zID0gW107XG4gICAgICAgICAgICBmaW5kTWVtb05vZGVzKGRvbU5vZGUsIG1lbW9zKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gbWVtb3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBtZW1vc1tpXS5kb21Ob2RlO1xuICAgICAgICAgICAgICAgIHZhciBjb21iaW5lZFBhcmFtcyA9IFtub2RlXTtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFDYWxsYmFja1BhcmFtc0FycmF5KVxuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5hcnJheVB1c2hBbGwoY29tYmluZWRQYXJhbXMsIGV4dHJhQ2FsbGJhY2tQYXJhbXNBcnJheSk7XG4gICAgICAgICAgICAgICAga28ubWVtb2l6YXRpb24udW5tZW1vaXplKG1lbW9zW2ldLm1lbW9JZCwgY29tYmluZWRQYXJhbXMpO1xuICAgICAgICAgICAgICAgIG5vZGUubm9kZVZhbHVlID0gXCJcIjsgLy8gTmV1dGVyIHRoaXMgbm9kZSBzbyB3ZSBkb24ndCB0cnkgdG8gdW5tZW1vaXplIGl0IGFnYWluXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSlcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpOyAvLyBJZiBwb3NzaWJsZSwgZXJhc2UgaXQgdG90YWxseSAobm90IGFsd2F5cyBwb3NzaWJsZSAtIHNvbWVvbmUgZWxzZSBtaWdodCBqdXN0IGhvbGQgYSByZWZlcmVuY2UgdG8gaXQgdGhlbiBjYWxsIHVubWVtb2l6ZURvbU5vZGVBbmREZXNjZW5kYW50cyBhZ2FpbilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZU1lbW9UZXh0OiBmdW5jdGlvbiAobWVtb1RleHQpIHtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IG1lbW9UZXh0Lm1hdGNoKC9eXFxba29fbWVtb1xcOiguKj8pXFxdJC8pO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgnbWVtb2l6YXRpb24nLCBrby5tZW1vaXphdGlvbik7XG5rby5leHBvcnRTeW1ib2woJ21lbW9pemF0aW9uLm1lbW9pemUnLCBrby5tZW1vaXphdGlvbi5tZW1vaXplKTtcbmtvLmV4cG9ydFN5bWJvbCgnbWVtb2l6YXRpb24udW5tZW1vaXplJywga28ubWVtb2l6YXRpb24udW5tZW1vaXplKTtcbmtvLmV4cG9ydFN5bWJvbCgnbWVtb2l6YXRpb24ucGFyc2VNZW1vVGV4dCcsIGtvLm1lbW9pemF0aW9uLnBhcnNlTWVtb1RleHQpO1xua28uZXhwb3J0U3ltYm9sKCdtZW1vaXphdGlvbi51bm1lbW9pemVEb21Ob2RlQW5kRGVzY2VuZGFudHMnLCBrby5tZW1vaXphdGlvbi51bm1lbW9pemVEb21Ob2RlQW5kRGVzY2VuZGFudHMpO1xua28uZXh0ZW5kZXJzID0ge1xuICAgICd0aHJvdHRsZSc6IGZ1bmN0aW9uKHRhcmdldCwgdGltZW91dCkge1xuICAgICAgICAvLyBUaHJvdHRsaW5nIG1lYW5zIHR3byB0aGluZ3M6XG5cbiAgICAgICAgLy8gKDEpIEZvciBkZXBlbmRlbnQgb2JzZXJ2YWJsZXMsIHdlIHRocm90dGxlICpldmFsdWF0aW9ucyogc28gdGhhdCwgbm8gbWF0dGVyIGhvdyBmYXN0IGl0cyBkZXBlbmRlbmNpZXNcbiAgICAgICAgLy8gICAgIG5vdGlmeSB1cGRhdGVzLCB0aGUgdGFyZ2V0IGRvZXNuJ3QgcmUtZXZhbHVhdGUgKGFuZCBoZW5jZSBkb2Vzbid0IG5vdGlmeSkgZmFzdGVyIHRoYW4gYSBjZXJ0YWluIHJhdGVcbiAgICAgICAgdGFyZ2V0Wyd0aHJvdHRsZUV2YWx1YXRpb24nXSA9IHRpbWVvdXQ7XG5cbiAgICAgICAgLy8gKDIpIEZvciB3cml0YWJsZSB0YXJnZXRzIChvYnNlcnZhYmxlcywgb3Igd3JpdGFibGUgZGVwZW5kZW50IG9ic2VydmFibGVzKSwgd2UgdGhyb3R0bGUgKndyaXRlcypcbiAgICAgICAgLy8gICAgIHNvIHRoZSB0YXJnZXQgY2Fubm90IGNoYW5nZSB2YWx1ZSBzeW5jaHJvbm91c2x5IG9yIGZhc3RlciB0aGFuIGEgY2VydGFpbiByYXRlXG4gICAgICAgIHZhciB3cml0ZVRpbWVvdXRJbnN0YW5jZSA9IG51bGw7XG4gICAgICAgIHJldHVybiBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKHtcbiAgICAgICAgICAgICdyZWFkJzogdGFyZ2V0LFxuICAgICAgICAgICAgJ3dyaXRlJzogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQod3JpdGVUaW1lb3V0SW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHdyaXRlVGltZW91dEluc3RhbmNlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICdyYXRlTGltaXQnOiBmdW5jdGlvbih0YXJnZXQsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHRpbWVvdXQsIG1ldGhvZCwgbGltaXRGdW5jdGlvbjtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBvcHRpb25zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGltZW91dCA9IG9wdGlvbnNbJ3RpbWVvdXQnXTtcbiAgICAgICAgICAgIG1ldGhvZCA9IG9wdGlvbnNbJ21ldGhvZCddO1xuICAgICAgICB9XG5cbiAgICAgICAgbGltaXRGdW5jdGlvbiA9IG1ldGhvZCA9PSAnbm90aWZ5V2hlbkNoYW5nZXNTdG9wJyA/ICBkZWJvdW5jZSA6IHRocm90dGxlO1xuICAgICAgICB0YXJnZXQubGltaXQoZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBsaW1pdEZ1bmN0aW9uKGNhbGxiYWNrLCB0aW1lb3V0KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICdub3RpZnknOiBmdW5jdGlvbih0YXJnZXQsIG5vdGlmeVdoZW4pIHtcbiAgICAgICAgdGFyZ2V0W1wiZXF1YWxpdHlDb21wYXJlclwiXSA9IG5vdGlmeVdoZW4gPT0gXCJhbHdheXNcIiA/XG4gICAgICAgICAgICBudWxsIDogIC8vIG51bGwgZXF1YWxpdHlDb21wYXJlciBtZWFucyB0byBhbHdheXMgbm90aWZ5XG4gICAgICAgICAgICB2YWx1ZXNBcmVQcmltaXRpdmVBbmRFcXVhbDtcbiAgICB9XG59O1xuXG52YXIgcHJpbWl0aXZlVHlwZXMgPSB7ICd1bmRlZmluZWQnOjEsICdib29sZWFuJzoxLCAnbnVtYmVyJzoxLCAnc3RyaW5nJzoxIH07XG5mdW5jdGlvbiB2YWx1ZXNBcmVQcmltaXRpdmVBbmRFcXVhbChhLCBiKSB7XG4gICAgdmFyIG9sZFZhbHVlSXNQcmltaXRpdmUgPSAoYSA9PT0gbnVsbCkgfHwgKHR5cGVvZihhKSBpbiBwcmltaXRpdmVUeXBlcyk7XG4gICAgcmV0dXJuIG9sZFZhbHVlSXNQcmltaXRpdmUgPyAoYSA9PT0gYikgOiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gdGhyb3R0bGUoY2FsbGJhY2ssIHRpbWVvdXQpIHtcbiAgICB2YXIgdGltZW91dEluc3RhbmNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGltZW91dEluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aW1lb3V0SW5zdGFuY2UgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRpbWVvdXRJbnN0YW5jZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBkZWJvdW5jZShjYWxsYmFjaywgdGltZW91dCkge1xuICAgIHZhciB0aW1lb3V0SW5zdGFuY2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJbnN0YW5jZSk7XG4gICAgICAgIHRpbWVvdXRJbnN0YW5jZSA9IHNldFRpbWVvdXQoY2FsbGJhY2ssIHRpbWVvdXQpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFwcGx5RXh0ZW5kZXJzKHJlcXVlc3RlZEV4dGVuZGVycykge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzO1xuICAgIGlmIChyZXF1ZXN0ZWRFeHRlbmRlcnMpIHtcbiAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaChyZXF1ZXN0ZWRFeHRlbmRlcnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBleHRlbmRlckhhbmRsZXIgPSBrby5leHRlbmRlcnNba2V5XTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXh0ZW5kZXJIYW5kbGVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBleHRlbmRlckhhbmRsZXIodGFyZ2V0LCB2YWx1ZSkgfHwgdGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cblxua28uZXhwb3J0U3ltYm9sKCdleHRlbmRlcnMnLCBrby5leHRlbmRlcnMpO1xuXG5rby5zdWJzY3JpcHRpb24gPSBmdW5jdGlvbiAodGFyZ2V0LCBjYWxsYmFjaywgZGlzcG9zZUNhbGxiYWNrKSB7XG4gICAgdGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmRpc3Bvc2VDYWxsYmFjayA9IGRpc3Bvc2VDYWxsYmFjaztcbiAgICB0aGlzLmlzRGlzcG9zZWQgPSBmYWxzZTtcbiAgICBrby5leHBvcnRQcm9wZXJ0eSh0aGlzLCAnZGlzcG9zZScsIHRoaXMuZGlzcG9zZSk7XG59O1xua28uc3Vic2NyaXB0aW9uLnByb3RvdHlwZS5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNEaXNwb3NlZCA9IHRydWU7XG4gICAgdGhpcy5kaXNwb3NlQ2FsbGJhY2soKTtcbn07XG5cbmtvLnN1YnNjcmliYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZk9yRXh0ZW5kKHRoaXMsIGtvLnN1YnNjcmliYWJsZVsnZm4nXSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IHt9O1xuICAgIHRoaXMuX3ZlcnNpb25OdW1iZXIgPSAxO1xufVxuXG52YXIgZGVmYXVsdEV2ZW50ID0gXCJjaGFuZ2VcIjtcblxudmFyIGtvX3N1YnNjcmliYWJsZV9mbiA9IHtcbiAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIChjYWxsYmFjaywgY2FsbGJhY2tUYXJnZXQsIGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICBldmVudCA9IGV2ZW50IHx8IGRlZmF1bHRFdmVudDtcbiAgICAgICAgdmFyIGJvdW5kQ2FsbGJhY2sgPSBjYWxsYmFja1RhcmdldCA/IGNhbGxiYWNrLmJpbmQoY2FsbGJhY2tUYXJnZXQpIDogY2FsbGJhY2s7XG5cbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IG5ldyBrby5zdWJzY3JpcHRpb24oc2VsZiwgYm91bmRDYWxsYmFjaywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAga28udXRpbHMuYXJyYXlSZW1vdmVJdGVtKHNlbGYuX3N1YnNjcmlwdGlvbnNbZXZlbnRdLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICAgICAgaWYgKHNlbGYuYWZ0ZXJTdWJzY3JpcHRpb25SZW1vdmUpXG4gICAgICAgICAgICAgICAgc2VsZi5hZnRlclN1YnNjcmlwdGlvblJlbW92ZShldmVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzZWxmLmJlZm9yZVN1YnNjcmlwdGlvbkFkZClcbiAgICAgICAgICAgIHNlbGYuYmVmb3JlU3Vic2NyaXB0aW9uQWRkKGV2ZW50KTtcblxuICAgICAgICBpZiAoIXNlbGYuX3N1YnNjcmlwdGlvbnNbZXZlbnRdKVxuICAgICAgICAgICAgc2VsZi5fc3Vic2NyaXB0aW9uc1tldmVudF0gPSBbXTtcbiAgICAgICAgc2VsZi5fc3Vic2NyaXB0aW9uc1tldmVudF0ucHVzaChzdWJzY3JpcHRpb24pO1xuXG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb247XG4gICAgfSxcblxuICAgIFwibm90aWZ5U3Vic2NyaWJlcnNcIjogZnVuY3Rpb24gKHZhbHVlVG9Ob3RpZnksIGV2ZW50KSB7XG4gICAgICAgIGV2ZW50ID0gZXZlbnQgfHwgZGVmYXVsdEV2ZW50O1xuICAgICAgICBpZiAoZXZlbnQgPT09IGRlZmF1bHRFdmVudCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVWZXJzaW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaGFzU3Vic2NyaXB0aW9uc0ZvckV2ZW50KGV2ZW50KSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmJlZ2luKCk7IC8vIEJlZ2luIHN1cHByZXNzaW5nIGRlcGVuZGVuY3kgZGV0ZWN0aW9uIChieSBzZXR0aW5nIHRoZSB0b3AgZnJhbWUgdG8gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGEgPSB0aGlzLl9zdWJzY3JpcHRpb25zW2V2ZW50XS5zbGljZSgwKSwgaSA9IDAsIHN1YnNjcmlwdGlvbjsgc3Vic2NyaXB0aW9uID0gYVtpXTsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluIGNhc2UgYSBzdWJzY3JpcHRpb24gd2FzIGRpc3Bvc2VkIGR1cmluZyB0aGUgYXJyYXlGb3JFYWNoIGN5Y2xlLCBjaGVja1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgaXNEaXNwb3NlZCBvbiBlYWNoIHN1YnNjcmlwdGlvbiBiZWZvcmUgaW52b2tpbmcgaXRzIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgIGlmICghc3Vic2NyaXB0aW9uLmlzRGlzcG9zZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uY2FsbGJhY2sodmFsdWVUb05vdGlmeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmVuZCgpOyAvLyBFbmQgc3VwcHJlc3NpbmcgZGVwZW5kZW5jeSBkZXRlY3Rpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRWZXJzaW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92ZXJzaW9uTnVtYmVyO1xuICAgIH0sXG5cbiAgICBoYXNDaGFuZ2VkOiBmdW5jdGlvbiAodmVyc2lvblRvQ2hlY2spIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmVyc2lvbigpICE9PSB2ZXJzaW9uVG9DaGVjaztcbiAgICB9LFxuXG4gICAgdXBkYXRlVmVyc2lvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICArK3RoaXMuX3ZlcnNpb25OdW1iZXI7XG4gICAgfSxcblxuICAgIGxpbWl0OiBmdW5jdGlvbihsaW1pdEZ1bmN0aW9uKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcywgc2VsZklzT2JzZXJ2YWJsZSA9IGtvLmlzT2JzZXJ2YWJsZShzZWxmKSxcbiAgICAgICAgICAgIGlzUGVuZGluZywgcHJldmlvdXNWYWx1ZSwgcGVuZGluZ1ZhbHVlLCBiZWZvcmVDaGFuZ2UgPSAnYmVmb3JlQ2hhbmdlJztcblxuICAgICAgICBpZiAoIXNlbGYuX29yaWdOb3RpZnlTdWJzY3JpYmVycykge1xuICAgICAgICAgICAgc2VsZi5fb3JpZ05vdGlmeVN1YnNjcmliZXJzID0gc2VsZltcIm5vdGlmeVN1YnNjcmliZXJzXCJdO1xuICAgICAgICAgICAgc2VsZltcIm5vdGlmeVN1YnNjcmliZXJzXCJdID0gZnVuY3Rpb24odmFsdWUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFldmVudCB8fCBldmVudCA9PT0gZGVmYXVsdEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3JhdGVMaW1pdGVkQ2hhbmdlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50ID09PSBiZWZvcmVDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmF0ZUxpbWl0ZWRCZWZvcmVDaGFuZ2UodmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX29yaWdOb3RpZnlTdWJzY3JpYmVycyh2YWx1ZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZmluaXNoID0gbGltaXRGdW5jdGlvbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIElmIGFuIG9ic2VydmFibGUgcHJvdmlkZWQgYSByZWZlcmVuY2UgdG8gaXRzZWxmLCBhY2Nlc3MgaXQgdG8gZ2V0IHRoZSBsYXRlc3QgdmFsdWUuXG4gICAgICAgICAgICAvLyBUaGlzIGFsbG93cyBjb21wdXRlZCBvYnNlcnZhYmxlcyB0byBkZWxheSBjYWxjdWxhdGluZyB0aGVpciB2YWx1ZSB1bnRpbCBuZWVkZWQuXG4gICAgICAgICAgICBpZiAoc2VsZklzT2JzZXJ2YWJsZSAmJiBwZW5kaW5nVmFsdWUgPT09IHNlbGYpIHtcbiAgICAgICAgICAgICAgICBwZW5kaW5nVmFsdWUgPSBzZWxmKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpc1BlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChzZWxmLmlzRGlmZmVyZW50KHByZXZpb3VzVmFsdWUsIHBlbmRpbmdWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vcmlnTm90aWZ5U3Vic2NyaWJlcnMocHJldmlvdXNWYWx1ZSA9IHBlbmRpbmdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYuX3JhdGVMaW1pdGVkQ2hhbmdlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGlzUGVuZGluZyA9IHRydWU7XG4gICAgICAgICAgICBwZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGZpbmlzaCgpO1xuICAgICAgICB9O1xuICAgICAgICBzZWxmLl9yYXRlTGltaXRlZEJlZm9yZUNoYW5nZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWlzUGVuZGluZykge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLl9vcmlnTm90aWZ5U3Vic2NyaWJlcnModmFsdWUsIGJlZm9yZUNoYW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGhhc1N1YnNjcmlwdGlvbnNGb3JFdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1YnNjcmlwdGlvbnNbZXZlbnRdICYmIHRoaXMuX3N1YnNjcmlwdGlvbnNbZXZlbnRdLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgZ2V0U3Vic2NyaXB0aW9uc0NvdW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3Vic2NyaXB0aW9uc1tldmVudF0gJiYgdGhpcy5fc3Vic2NyaXB0aW9uc1tldmVudF0ubGVuZ3RoIHx8IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAwO1xuICAgICAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaCh0aGlzLl9zdWJzY3JpcHRpb25zLCBmdW5jdGlvbihldmVudE5hbWUsIHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB0b3RhbCArPSBzdWJzY3JpcHRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRvdGFsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGlzRGlmZmVyZW50OiBmdW5jdGlvbihvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzWydlcXVhbGl0eUNvbXBhcmVyJ10gfHwgIXRoaXNbJ2VxdWFsaXR5Q29tcGFyZXInXShvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIH0sXG5cbiAgICBleHRlbmQ6IGFwcGx5RXh0ZW5kZXJzXG59O1xuXG5rby5leHBvcnRQcm9wZXJ0eShrb19zdWJzY3JpYmFibGVfZm4sICdzdWJzY3JpYmUnLCBrb19zdWJzY3JpYmFibGVfZm4uc3Vic2NyaWJlKTtcbmtvLmV4cG9ydFByb3BlcnR5KGtvX3N1YnNjcmliYWJsZV9mbiwgJ2V4dGVuZCcsIGtvX3N1YnNjcmliYWJsZV9mbi5leHRlbmQpO1xua28uZXhwb3J0UHJvcGVydHkoa29fc3Vic2NyaWJhYmxlX2ZuLCAnZ2V0U3Vic2NyaXB0aW9uc0NvdW50Jywga29fc3Vic2NyaWJhYmxlX2ZuLmdldFN1YnNjcmlwdGlvbnNDb3VudCk7XG5cbi8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgcHJvdG8gYXNzaWdubWVudCwgd2Ugb3ZlcndyaXRlIHRoZSBwcm90b3R5cGUgb2YgZWFjaFxuLy8gb2JzZXJ2YWJsZSBpbnN0YW5jZS4gU2luY2Ugb2JzZXJ2YWJsZXMgYXJlIGZ1bmN0aW9ucywgd2UgbmVlZCBGdW5jdGlvbi5wcm90b3R5cGVcbi8vIHRvIHN0aWxsIGJlIGluIHRoZSBwcm90b3R5cGUgY2hhaW4uXG5pZiAoa28udXRpbHMuY2FuU2V0UHJvdG90eXBlKSB7XG4gICAga28udXRpbHMuc2V0UHJvdG90eXBlT2Yoa29fc3Vic2NyaWJhYmxlX2ZuLCBGdW5jdGlvbi5wcm90b3R5cGUpO1xufVxuXG5rby5zdWJzY3JpYmFibGVbJ2ZuJ10gPSBrb19zdWJzY3JpYmFibGVfZm47XG5cblxua28uaXNTdWJzY3JpYmFibGUgPSBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICByZXR1cm4gaW5zdGFuY2UgIT0gbnVsbCAmJiB0eXBlb2YgaW5zdGFuY2Uuc3Vic2NyaWJlID09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgaW5zdGFuY2VbXCJub3RpZnlTdWJzY3JpYmVyc1wiXSA9PSBcImZ1bmN0aW9uXCI7XG59O1xuXG5rby5leHBvcnRTeW1ib2woJ3N1YnNjcmliYWJsZScsIGtvLnN1YnNjcmliYWJsZSk7XG5rby5leHBvcnRTeW1ib2woJ2lzU3Vic2NyaWJhYmxlJywga28uaXNTdWJzY3JpYmFibGUpO1xuXG5rby5jb21wdXRlZENvbnRleHQgPSBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3V0ZXJGcmFtZXMgPSBbXSxcbiAgICAgICAgY3VycmVudEZyYW1lLFxuICAgICAgICBsYXN0SWQgPSAwO1xuXG4gICAgLy8gUmV0dXJuIGEgdW5pcXVlIElEIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIGFuIG9ic2VydmFibGUgZm9yIGRlcGVuZGVuY3kgdHJhY2tpbmcuXG4gICAgLy8gVGhlb3JldGljYWxseSwgeW91IGNvdWxkIGV2ZW50dWFsbHkgb3ZlcmZsb3cgdGhlIG51bWJlciBzdG9yYWdlIHNpemUsIHJlc3VsdGluZ1xuICAgIC8vIGluIGR1cGxpY2F0ZSBJRHMuIEJ1dCBpbiBKYXZhU2NyaXB0LCB0aGUgbGFyZ2VzdCBleGFjdCBpbnRlZ3JhbCB2YWx1ZSBpcyAyXjUzXG4gICAgLy8gb3IgOSwwMDcsMTk5LDI1NCw3NDAsOTkyLiBJZiB5b3UgY3JlYXRlZCAxLDAwMCwwMDAgSURzIHBlciBzZWNvbmQsIGl0IHdvdWxkXG4gICAgLy8gdGFrZSBvdmVyIDI4NSB5ZWFycyB0byByZWFjaCB0aGF0IG51bWJlci5cbiAgICAvLyBSZWZlcmVuY2UgaHR0cDovL2Jsb2cudmpldXguY29tLzIwMTAvamF2YXNjcmlwdC9qYXZhc2NyaXB0LW1heF9pbnQtbnVtYmVyLWxpbWl0cy5odG1sXG4gICAgZnVuY3Rpb24gZ2V0SWQoKSB7XG4gICAgICAgIHJldHVybiArK2xhc3RJZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiZWdpbihvcHRpb25zKSB7XG4gICAgICAgIG91dGVyRnJhbWVzLnB1c2goY3VycmVudEZyYW1lKTtcbiAgICAgICAgY3VycmVudEZyYW1lID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbmQoKSB7XG4gICAgICAgIGN1cnJlbnRGcmFtZSA9IG91dGVyRnJhbWVzLnBvcCgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGJlZ2luOiBiZWdpbixcblxuICAgICAgICBlbmQ6IGVuZCxcblxuICAgICAgICByZWdpc3RlckRlcGVuZGVuY3k6IGZ1bmN0aW9uIChzdWJzY3JpYmFibGUpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWtvLmlzU3Vic2NyaWJhYmxlKHN1YnNjcmliYWJsZSkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9ubHkgc3Vic2NyaWJhYmxlIHRoaW5ncyBjYW4gYWN0IGFzIGRlcGVuZGVuY2llc1wiKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50RnJhbWUuY2FsbGJhY2soc3Vic2NyaWJhYmxlLCBzdWJzY3JpYmFibGUuX2lkIHx8IChzdWJzY3JpYmFibGUuX2lkID0gZ2V0SWQoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlnbm9yZTogZnVuY3Rpb24gKGNhbGxiYWNrLCBjYWxsYmFja1RhcmdldCwgY2FsbGJhY2tBcmdzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJlZ2luKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KGNhbGxiYWNrVGFyZ2V0LCBjYWxsYmFja0FyZ3MgfHwgW10pO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBlbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXREZXBlbmRlbmNpZXNDb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRGcmFtZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEZyYW1lLmNvbXB1dGVkLmdldERlcGVuZGVuY2llc0NvdW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNJbml0aWFsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RnJhbWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZS5pc0luaXRpYWw7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCdjb21wdXRlZENvbnRleHQnLCBrby5jb21wdXRlZENvbnRleHQpO1xua28uZXhwb3J0U3ltYm9sKCdjb21wdXRlZENvbnRleHQuZ2V0RGVwZW5kZW5jaWVzQ291bnQnLCBrby5jb21wdXRlZENvbnRleHQuZ2V0RGVwZW5kZW5jaWVzQ291bnQpO1xua28uZXhwb3J0U3ltYm9sKCdjb21wdXRlZENvbnRleHQuaXNJbml0aWFsJywga28uY29tcHV0ZWRDb250ZXh0LmlzSW5pdGlhbCk7XG5rby5leHBvcnRTeW1ib2woJ2NvbXB1dGVkQ29udGV4dC5pc1NsZWVwaW5nJywga28uY29tcHV0ZWRDb250ZXh0LmlzU2xlZXBpbmcpO1xuXG5rby5leHBvcnRTeW1ib2woJ2lnbm9yZURlcGVuZGVuY2llcycsIGtvLmlnbm9yZURlcGVuZGVuY2llcyA9IGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKTtcbmtvLm9ic2VydmFibGUgPSBmdW5jdGlvbiAoaW5pdGlhbFZhbHVlKSB7XG4gICAgdmFyIF9sYXRlc3RWYWx1ZSA9IGluaXRpYWxWYWx1ZTtcblxuICAgIGZ1bmN0aW9uIG9ic2VydmFibGUoKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gV3JpdGVcblxuICAgICAgICAgICAgLy8gSWdub3JlIHdyaXRlcyBpZiB0aGUgdmFsdWUgaGFzbid0IGNoYW5nZWRcbiAgICAgICAgICAgIGlmIChvYnNlcnZhYmxlLmlzRGlmZmVyZW50KF9sYXRlc3RWYWx1ZSwgYXJndW1lbnRzWzBdKSkge1xuICAgICAgICAgICAgICAgIG9ic2VydmFibGUudmFsdWVXaWxsTXV0YXRlKCk7XG4gICAgICAgICAgICAgICAgX2xhdGVzdFZhbHVlID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIGlmIChERUJVRykgb2JzZXJ2YWJsZS5fbGF0ZXN0VmFsdWUgPSBfbGF0ZXN0VmFsdWU7XG4gICAgICAgICAgICAgICAgb2JzZXJ2YWJsZS52YWx1ZUhhc011dGF0ZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzOyAvLyBQZXJtaXRzIGNoYWluZWQgYXNzaWdubWVudHNcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlYWRcbiAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24ucmVnaXN0ZXJEZXBlbmRlbmN5KG9ic2VydmFibGUpOyAvLyBUaGUgY2FsbGVyIG9ubHkgbmVlZHMgdG8gYmUgbm90aWZpZWQgb2YgY2hhbmdlcyBpZiB0aGV5IGRpZCBhIFwicmVhZFwiIG9wZXJhdGlvblxuICAgICAgICAgICAgcmV0dXJuIF9sYXRlc3RWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBrby5zdWJzY3JpYmFibGUuY2FsbChvYnNlcnZhYmxlKTtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZk9yRXh0ZW5kKG9ic2VydmFibGUsIGtvLm9ic2VydmFibGVbJ2ZuJ10pO1xuXG4gICAgaWYgKERFQlVHKSBvYnNlcnZhYmxlLl9sYXRlc3RWYWx1ZSA9IF9sYXRlc3RWYWx1ZTtcbiAgICBvYnNlcnZhYmxlLnBlZWsgPSBmdW5jdGlvbigpIHsgcmV0dXJuIF9sYXRlc3RWYWx1ZSB9O1xuICAgIG9ic2VydmFibGUudmFsdWVIYXNNdXRhdGVkID0gZnVuY3Rpb24gKCkgeyBvYnNlcnZhYmxlW1wibm90aWZ5U3Vic2NyaWJlcnNcIl0oX2xhdGVzdFZhbHVlKTsgfVxuICAgIG9ic2VydmFibGUudmFsdWVXaWxsTXV0YXRlID0gZnVuY3Rpb24gKCkgeyBvYnNlcnZhYmxlW1wibm90aWZ5U3Vic2NyaWJlcnNcIl0oX2xhdGVzdFZhbHVlLCBcImJlZm9yZUNoYW5nZVwiKTsgfVxuXG4gICAga28uZXhwb3J0UHJvcGVydHkob2JzZXJ2YWJsZSwgJ3BlZWsnLCBvYnNlcnZhYmxlLnBlZWspO1xuICAgIGtvLmV4cG9ydFByb3BlcnR5KG9ic2VydmFibGUsIFwidmFsdWVIYXNNdXRhdGVkXCIsIG9ic2VydmFibGUudmFsdWVIYXNNdXRhdGVkKTtcbiAgICBrby5leHBvcnRQcm9wZXJ0eShvYnNlcnZhYmxlLCBcInZhbHVlV2lsbE11dGF0ZVwiLCBvYnNlcnZhYmxlLnZhbHVlV2lsbE11dGF0ZSk7XG5cbiAgICByZXR1cm4gb2JzZXJ2YWJsZTtcbn1cblxua28ub2JzZXJ2YWJsZVsnZm4nXSA9IHtcbiAgICBcImVxdWFsaXR5Q29tcGFyZXJcIjogdmFsdWVzQXJlUHJpbWl0aXZlQW5kRXF1YWxcbn07XG5cbnZhciBwcm90b1Byb3BlcnR5ID0ga28ub2JzZXJ2YWJsZS5wcm90b1Byb3BlcnR5ID0gXCJfX2tvX3Byb3RvX19cIjtcbmtvLm9ic2VydmFibGVbJ2ZuJ11bcHJvdG9Qcm9wZXJ0eV0gPSBrby5vYnNlcnZhYmxlO1xuXG4vLyBOb3RlIHRoYXQgZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBwcm90byBhc3NpZ25tZW50LCB0aGVcbi8vIGluaGVyaXRhbmNlIGNoYWluIGlzIGNyZWF0ZWQgbWFudWFsbHkgaW4gdGhlIGtvLm9ic2VydmFibGUgY29uc3RydWN0b3JcbmlmIChrby51dGlscy5jYW5TZXRQcm90b3R5cGUpIHtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZihrby5vYnNlcnZhYmxlWydmbiddLCBrby5zdWJzY3JpYmFibGVbJ2ZuJ10pO1xufVxuXG5rby5oYXNQcm90b3R5cGUgPSBmdW5jdGlvbihpbnN0YW5jZSwgcHJvdG90eXBlKSB7XG4gICAgaWYgKChpbnN0YW5jZSA9PT0gbnVsbCkgfHwgKGluc3RhbmNlID09PSB1bmRlZmluZWQpIHx8IChpbnN0YW5jZVtwcm90b1Byb3BlcnR5XSA9PT0gdW5kZWZpbmVkKSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChpbnN0YW5jZVtwcm90b1Byb3BlcnR5XSA9PT0gcHJvdG90eXBlKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4ga28uaGFzUHJvdG90eXBlKGluc3RhbmNlW3Byb3RvUHJvcGVydHldLCBwcm90b3R5cGUpOyAvLyBXYWxrIHRoZSBwcm90b3R5cGUgY2hhaW5cbn07XG5cbmtvLmlzT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgIHJldHVybiBrby5oYXNQcm90b3R5cGUoaW5zdGFuY2UsIGtvLm9ic2VydmFibGUpO1xufVxua28uaXNXcml0ZWFibGVPYnNlcnZhYmxlID0gZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgLy8gT2JzZXJ2YWJsZVxuICAgIGlmICgodHlwZW9mIGluc3RhbmNlID09IFwiZnVuY3Rpb25cIikgJiYgaW5zdGFuY2VbcHJvdG9Qcm9wZXJ0eV0gPT09IGtvLm9ic2VydmFibGUpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIC8vIFdyaXRlYWJsZSBkZXBlbmRlbnQgb2JzZXJ2YWJsZVxuICAgIGlmICgodHlwZW9mIGluc3RhbmNlID09IFwiZnVuY3Rpb25cIikgJiYgKGluc3RhbmNlW3Byb3RvUHJvcGVydHldID09PSBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKSAmJiAoaW5zdGFuY2UuaGFzV3JpdGVGdW5jdGlvbikpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIC8vIEFueXRoaW5nIGVsc2VcbiAgICByZXR1cm4gZmFsc2U7XG59XG5cblxua28uZXhwb3J0U3ltYm9sKCdvYnNlcnZhYmxlJywga28ub2JzZXJ2YWJsZSk7XG5rby5leHBvcnRTeW1ib2woJ2lzT2JzZXJ2YWJsZScsIGtvLmlzT2JzZXJ2YWJsZSk7XG5rby5leHBvcnRTeW1ib2woJ2lzV3JpdGVhYmxlT2JzZXJ2YWJsZScsIGtvLmlzV3JpdGVhYmxlT2JzZXJ2YWJsZSk7XG5rby5leHBvcnRTeW1ib2woJ2lzV3JpdGFibGVPYnNlcnZhYmxlJywga28uaXNXcml0ZWFibGVPYnNlcnZhYmxlKTtcbmtvLm9ic2VydmFibGVBcnJheSA9IGZ1bmN0aW9uIChpbml0aWFsVmFsdWVzKSB7XG4gICAgaW5pdGlhbFZhbHVlcyA9IGluaXRpYWxWYWx1ZXMgfHwgW107XG5cbiAgICBpZiAodHlwZW9mIGluaXRpYWxWYWx1ZXMgIT0gJ29iamVjdCcgfHwgISgnbGVuZ3RoJyBpbiBpbml0aWFsVmFsdWVzKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGFyZ3VtZW50IHBhc3NlZCB3aGVuIGluaXRpYWxpemluZyBhbiBvYnNlcnZhYmxlIGFycmF5IG11c3QgYmUgYW4gYXJyYXksIG9yIG51bGwsIG9yIHVuZGVmaW5lZC5cIik7XG5cbiAgICB2YXIgcmVzdWx0ID0ga28ub2JzZXJ2YWJsZShpbml0aWFsVmFsdWVzKTtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZk9yRXh0ZW5kKHJlc3VsdCwga28ub2JzZXJ2YWJsZUFycmF5WydmbiddKTtcbiAgICByZXR1cm4gcmVzdWx0LmV4dGVuZCh7J3RyYWNrQXJyYXlDaGFuZ2VzJzp0cnVlfSk7XG59O1xuXG5rby5vYnNlcnZhYmxlQXJyYXlbJ2ZuJ10gPSB7XG4gICAgJ3JlbW92ZSc6IGZ1bmN0aW9uICh2YWx1ZU9yUHJlZGljYXRlKSB7XG4gICAgICAgIHZhciB1bmRlcmx5aW5nQXJyYXkgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgdmFyIHJlbW92ZWRWYWx1ZXMgPSBbXTtcbiAgICAgICAgdmFyIHByZWRpY2F0ZSA9IHR5cGVvZiB2YWx1ZU9yUHJlZGljYXRlID09IFwiZnVuY3Rpb25cIiAmJiAha28uaXNPYnNlcnZhYmxlKHZhbHVlT3JQcmVkaWNhdGUpID8gdmFsdWVPclByZWRpY2F0ZSA6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgPT09IHZhbHVlT3JQcmVkaWNhdGU7IH07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5kZXJseWluZ0FycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB1bmRlcmx5aW5nQXJyYXlbaV07XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVkVmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlV2lsbE11dGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZW1vdmVkVmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgIHVuZGVybHlpbmdBcnJheS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZW1vdmVkVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZUhhc011dGF0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVtb3ZlZFZhbHVlcztcbiAgICB9LFxuXG4gICAgJ3JlbW92ZUFsbCc6IGZ1bmN0aW9uIChhcnJheU9mVmFsdWVzKSB7XG4gICAgICAgIC8vIElmIHlvdSBwYXNzZWQgemVybyBhcmdzLCB3ZSByZW1vdmUgZXZlcnl0aGluZ1xuICAgICAgICBpZiAoYXJyYXlPZlZhbHVlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgdW5kZXJseWluZ0FycmF5ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICB2YXIgYWxsVmFsdWVzID0gdW5kZXJseWluZ0FycmF5LnNsaWNlKDApO1xuICAgICAgICAgICAgdGhpcy52YWx1ZVdpbGxNdXRhdGUoKTtcbiAgICAgICAgICAgIHVuZGVybHlpbmdBcnJheS5zcGxpY2UoMCwgdW5kZXJseWluZ0FycmF5Lmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlSGFzTXV0YXRlZCgpO1xuICAgICAgICAgICAgcmV0dXJuIGFsbFZhbHVlcztcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB5b3UgcGFzc2VkIGFuIGFyZywgd2UgaW50ZXJwcmV0IGl0IGFzIGFuIGFycmF5IG9mIGVudHJpZXMgdG8gcmVtb3ZlXG4gICAgICAgIGlmICghYXJyYXlPZlZhbHVlcylcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIHRoaXNbJ3JlbW92ZSddKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmFycmF5SW5kZXhPZihhcnJheU9mVmFsdWVzLCB2YWx1ZSkgPj0gMDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICdkZXN0cm95JzogZnVuY3Rpb24gKHZhbHVlT3JQcmVkaWNhdGUpIHtcbiAgICAgICAgdmFyIHVuZGVybHlpbmdBcnJheSA9IHRoaXMucGVlaygpO1xuICAgICAgICB2YXIgcHJlZGljYXRlID0gdHlwZW9mIHZhbHVlT3JQcmVkaWNhdGUgPT0gXCJmdW5jdGlvblwiICYmICFrby5pc09ic2VydmFibGUodmFsdWVPclByZWRpY2F0ZSkgPyB2YWx1ZU9yUHJlZGljYXRlIDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZSA9PT0gdmFsdWVPclByZWRpY2F0ZTsgfTtcbiAgICAgICAgdGhpcy52YWx1ZVdpbGxNdXRhdGUoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IHVuZGVybHlpbmdBcnJheS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdW5kZXJseWluZ0FycmF5W2ldO1xuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgdW5kZXJseWluZ0FycmF5W2ldW1wiX2Rlc3Ryb3lcIl0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWVIYXNNdXRhdGVkKCk7XG4gICAgfSxcblxuICAgICdkZXN0cm95QWxsJzogZnVuY3Rpb24gKGFycmF5T2ZWYWx1ZXMpIHtcbiAgICAgICAgLy8gSWYgeW91IHBhc3NlZCB6ZXJvIGFyZ3MsIHdlIGRlc3Ryb3kgZXZlcnl0aGluZ1xuICAgICAgICBpZiAoYXJyYXlPZlZhbHVlcyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ2Rlc3Ryb3knXShmdW5jdGlvbigpIHsgcmV0dXJuIHRydWUgfSk7XG5cbiAgICAgICAgLy8gSWYgeW91IHBhc3NlZCBhbiBhcmcsIHdlIGludGVycHJldCBpdCBhcyBhbiBhcnJheSBvZiBlbnRyaWVzIHRvIGRlc3Ryb3lcbiAgICAgICAgaWYgKCFhcnJheU9mVmFsdWVzKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gdGhpc1snZGVzdHJveSddKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmFycmF5SW5kZXhPZihhcnJheU9mVmFsdWVzLCB2YWx1ZSkgPj0gMDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICdpbmRleE9mJzogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgdmFyIHVuZGVybHlpbmdBcnJheSA9IHRoaXMoKTtcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmFycmF5SW5kZXhPZih1bmRlcmx5aW5nQXJyYXksIGl0ZW0pO1xuICAgIH0sXG5cbiAgICAncmVwbGFjZSc6IGZ1bmN0aW9uKG9sZEl0ZW0sIG5ld0l0ZW0pIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpc1snaW5kZXhPZiddKG9sZEl0ZW0pO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZVdpbGxNdXRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucGVlaygpW2luZGV4XSA9IG5ld0l0ZW07XG4gICAgICAgICAgICB0aGlzLnZhbHVlSGFzTXV0YXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gUG9wdWxhdGUga28ub2JzZXJ2YWJsZUFycmF5LmZuIHdpdGggcmVhZC93cml0ZSBmdW5jdGlvbnMgZnJvbSBuYXRpdmUgYXJyYXlzXG4vLyBJbXBvcnRhbnQ6IERvIG5vdCBhZGQgYW55IGFkZGl0aW9uYWwgZnVuY3Rpb25zIGhlcmUgdGhhdCBtYXkgcmVhc29uYWJseSBiZSB1c2VkIHRvICpyZWFkKiBkYXRhIGZyb20gdGhlIGFycmF5XG4vLyBiZWNhdXNlIHdlJ2xsIGV2YWwgdGhlbSB3aXRob3V0IGNhdXNpbmcgc3Vic2NyaXB0aW9ucywgc28ga28uY29tcHV0ZWQgb3V0cHV0IGNvdWxkIGVuZCB1cCBnZXR0aW5nIHN0YWxlXG5rby51dGlscy5hcnJheUZvckVhY2goW1wicG9wXCIsIFwicHVzaFwiLCBcInJldmVyc2VcIiwgXCJzaGlmdFwiLCBcInNvcnRcIiwgXCJzcGxpY2VcIiwgXCJ1bnNoaWZ0XCJdLCBmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xuICAgIGtvLm9ic2VydmFibGVBcnJheVsnZm4nXVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gVXNlIFwicGVla1wiIHRvIGF2b2lkIGNyZWF0aW5nIGEgc3Vic2NyaXB0aW9uIGluIGFueSBjb21wdXRlZCB0aGF0IHdlJ3JlIGV4ZWN1dGluZyBpbiB0aGUgY29udGV4dCBvZlxuICAgICAgICAvLyAoZm9yIGNvbnNpc3RlbmN5IHdpdGggbXV0YXRpbmcgcmVndWxhciBvYnNlcnZhYmxlcylcbiAgICAgICAgdmFyIHVuZGVybHlpbmdBcnJheSA9IHRoaXMucGVlaygpO1xuICAgICAgICB0aGlzLnZhbHVlV2lsbE11dGF0ZSgpO1xuICAgICAgICB0aGlzLmNhY2hlRGlmZkZvcktub3duT3BlcmF0aW9uKHVuZGVybHlpbmdBcnJheSwgbWV0aG9kTmFtZSwgYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIG1ldGhvZENhbGxSZXN1bHQgPSB1bmRlcmx5aW5nQXJyYXlbbWV0aG9kTmFtZV0uYXBwbHkodW5kZXJseWluZ0FycmF5LCBhcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnZhbHVlSGFzTXV0YXRlZCgpO1xuICAgICAgICByZXR1cm4gbWV0aG9kQ2FsbFJlc3VsdDtcbiAgICB9O1xufSk7XG5cbi8vIFBvcHVsYXRlIGtvLm9ic2VydmFibGVBcnJheS5mbiB3aXRoIHJlYWQtb25seSBmdW5jdGlvbnMgZnJvbSBuYXRpdmUgYXJyYXlzXG5rby51dGlscy5hcnJheUZvckVhY2goW1wic2xpY2VcIl0sIGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAga28ub2JzZXJ2YWJsZUFycmF5WydmbiddW21ldGhvZE5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdW5kZXJseWluZ0FycmF5ID0gdGhpcygpO1xuICAgICAgICByZXR1cm4gdW5kZXJseWluZ0FycmF5W21ldGhvZE5hbWVdLmFwcGx5KHVuZGVybHlpbmdBcnJheSwgYXJndW1lbnRzKTtcbiAgICB9O1xufSk7XG5cbi8vIE5vdGUgdGhhdCBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHByb3RvIGFzc2lnbm1lbnQsIHRoZVxuLy8gaW5oZXJpdGFuY2UgY2hhaW4gaXMgY3JlYXRlZCBtYW51YWxseSBpbiB0aGUga28ub2JzZXJ2YWJsZUFycmF5IGNvbnN0cnVjdG9yXG5pZiAoa28udXRpbHMuY2FuU2V0UHJvdG90eXBlKSB7XG4gICAga28udXRpbHMuc2V0UHJvdG90eXBlT2Yoa28ub2JzZXJ2YWJsZUFycmF5WydmbiddLCBrby5vYnNlcnZhYmxlWydmbiddKTtcbn1cblxua28uZXhwb3J0U3ltYm9sKCdvYnNlcnZhYmxlQXJyYXknLCBrby5vYnNlcnZhYmxlQXJyYXkpO1xudmFyIGFycmF5Q2hhbmdlRXZlbnROYW1lID0gJ2FycmF5Q2hhbmdlJztcbmtvLmV4dGVuZGVyc1sndHJhY2tBcnJheUNoYW5nZXMnXSA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIC8vIE9ubHkgbW9kaWZ5IHRoZSB0YXJnZXQgb2JzZXJ2YWJsZSBvbmNlXG4gICAgaWYgKHRhcmdldC5jYWNoZURpZmZGb3JLbm93bk9wZXJhdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0cmFja2luZ0NoYW5nZXMgPSBmYWxzZSxcbiAgICAgICAgY2FjaGVkRGlmZiA9IG51bGwsXG4gICAgICAgIGFycmF5Q2hhbmdlU3Vic2NyaXB0aW9uLFxuICAgICAgICBwZW5kaW5nTm90aWZpY2F0aW9ucyA9IDAsXG4gICAgICAgIHVuZGVybHlpbmdCZWZvcmVTdWJzY3JpcHRpb25BZGRGdW5jdGlvbiA9IHRhcmdldC5iZWZvcmVTdWJzY3JpcHRpb25BZGQsXG4gICAgICAgIHVuZGVybHlpbmdBZnRlclN1YnNjcmlwdGlvblJlbW92ZUZ1bmN0aW9uID0gdGFyZ2V0LmFmdGVyU3Vic2NyaXB0aW9uUmVtb3ZlO1xuXG4gICAgLy8gV2F0Y2ggXCJzdWJzY3JpYmVcIiBjYWxscywgYW5kIGZvciBhcnJheSBjaGFuZ2UgZXZlbnRzLCBlbnN1cmUgY2hhbmdlIHRyYWNraW5nIGlzIGVuYWJsZWRcbiAgICB0YXJnZXQuYmVmb3JlU3Vic2NyaXB0aW9uQWRkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh1bmRlcmx5aW5nQmVmb3JlU3Vic2NyaXB0aW9uQWRkRnVuY3Rpb24pXG4gICAgICAgICAgICB1bmRlcmx5aW5nQmVmb3JlU3Vic2NyaXB0aW9uQWRkRnVuY3Rpb24uY2FsbCh0YXJnZXQsIGV2ZW50KTtcbiAgICAgICAgaWYgKGV2ZW50ID09PSBhcnJheUNoYW5nZUV2ZW50TmFtZSkge1xuICAgICAgICAgICAgdHJhY2tDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIFdhdGNoIFwiZGlzcG9zZVwiIGNhbGxzLCBhbmQgZm9yIGFycmF5IGNoYW5nZSBldmVudHMsIGVuc3VyZSBjaGFuZ2UgdHJhY2tpbmcgaXMgZGlzYWJsZWQgd2hlbiBhbGwgYXJlIGRpc3Bvc2VkXG4gICAgdGFyZ2V0LmFmdGVyU3Vic2NyaXB0aW9uUmVtb3ZlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh1bmRlcmx5aW5nQWZ0ZXJTdWJzY3JpcHRpb25SZW1vdmVGdW5jdGlvbilcbiAgICAgICAgICAgIHVuZGVybHlpbmdBZnRlclN1YnNjcmlwdGlvblJlbW92ZUZ1bmN0aW9uLmNhbGwodGFyZ2V0LCBldmVudCk7XG4gICAgICAgIGlmIChldmVudCA9PT0gYXJyYXlDaGFuZ2VFdmVudE5hbWUgJiYgIXRhcmdldC5oYXNTdWJzY3JpcHRpb25zRm9yRXZlbnQoYXJyYXlDaGFuZ2VFdmVudE5hbWUpKSB7XG4gICAgICAgICAgICBhcnJheUNoYW5nZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgICB0cmFja2luZ0NoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiB0cmFja0NoYW5nZXMoKSB7XG4gICAgICAgIC8vIENhbGxpbmcgJ3RyYWNrQ2hhbmdlcycgbXVsdGlwbGUgdGltZXMgaXMgdGhlIHNhbWUgYXMgY2FsbGluZyBpdCBvbmNlXG4gICAgICAgIGlmICh0cmFja2luZ0NoYW5nZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyYWNraW5nQ2hhbmdlcyA9IHRydWU7XG5cbiAgICAgICAgLy8gSW50ZXJjZXB0IFwibm90aWZ5U3Vic2NyaWJlcnNcIiB0byB0cmFjayBob3cgbWFueSB0aW1lcyBpdCB3YXMgY2FsbGVkLlxuICAgICAgICB2YXIgdW5kZXJseWluZ05vdGlmeVN1YnNjcmliZXJzRnVuY3Rpb24gPSB0YXJnZXRbJ25vdGlmeVN1YnNjcmliZXJzJ107XG4gICAgICAgIHRhcmdldFsnbm90aWZ5U3Vic2NyaWJlcnMnXSA9IGZ1bmN0aW9uKHZhbHVlVG9Ob3RpZnksIGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50IHx8IGV2ZW50ID09PSBkZWZhdWx0RXZlbnQpIHtcbiAgICAgICAgICAgICAgICArK3BlbmRpbmdOb3RpZmljYXRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVybHlpbmdOb3RpZnlTdWJzY3JpYmVyc0Z1bmN0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gRWFjaCB0aW1lIHRoZSBhcnJheSBjaGFuZ2VzIHZhbHVlLCBjYXB0dXJlIGEgY2xvbmUgc28gdGhhdCBvbiB0aGUgbmV4dFxuICAgICAgICAvLyBjaGFuZ2UgaXQncyBwb3NzaWJsZSB0byBwcm9kdWNlIGEgZGlmZlxuICAgICAgICB2YXIgcHJldmlvdXNDb250ZW50cyA9IFtdLmNvbmNhdCh0YXJnZXQucGVlaygpIHx8IFtdKTtcbiAgICAgICAgY2FjaGVkRGlmZiA9IG51bGw7XG4gICAgICAgIGFycmF5Q2hhbmdlU3Vic2NyaXB0aW9uID0gdGFyZ2V0LnN1YnNjcmliZShmdW5jdGlvbihjdXJyZW50Q29udGVudHMpIHtcbiAgICAgICAgICAgIC8vIE1ha2UgYSBjb3B5IG9mIHRoZSBjdXJyZW50IGNvbnRlbnRzIGFuZCBlbnN1cmUgaXQncyBhbiBhcnJheVxuICAgICAgICAgICAgY3VycmVudENvbnRlbnRzID0gW10uY29uY2F0KGN1cnJlbnRDb250ZW50cyB8fCBbXSk7XG5cbiAgICAgICAgICAgIC8vIENvbXB1dGUgdGhlIGRpZmYgYW5kIGlzc3VlIG5vdGlmaWNhdGlvbnMsIGJ1dCBvbmx5IGlmIHNvbWVvbmUgaXMgbGlzdGVuaW5nXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc1N1YnNjcmlwdGlvbnNGb3JFdmVudChhcnJheUNoYW5nZUV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hhbmdlcyA9IGdldENoYW5nZXMocHJldmlvdXNDb250ZW50cywgY3VycmVudENvbnRlbnRzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRWxpbWluYXRlIHJlZmVyZW5jZXMgdG8gdGhlIG9sZCwgcmVtb3ZlZCBpdGVtcywgc28gdGhleSBjYW4gYmUgR0NlZFxuICAgICAgICAgICAgcHJldmlvdXNDb250ZW50cyA9IGN1cnJlbnRDb250ZW50cztcbiAgICAgICAgICAgIGNhY2hlZERpZmYgPSBudWxsO1xuICAgICAgICAgICAgcGVuZGluZ05vdGlmaWNhdGlvbnMgPSAwO1xuXG4gICAgICAgICAgICBpZiAoY2hhbmdlcyAmJiBjaGFuZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRhcmdldFsnbm90aWZ5U3Vic2NyaWJlcnMnXShjaGFuZ2VzLCBhcnJheUNoYW5nZUV2ZW50TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldENoYW5nZXMocHJldmlvdXNDb250ZW50cywgY3VycmVudENvbnRlbnRzKSB7XG4gICAgICAgIC8vIFdlIHRyeSB0byByZS11c2UgY2FjaGVkIGRpZmZzLlxuICAgICAgICAvLyBUaGUgc2NlbmFyaW9zIHdoZXJlIHBlbmRpbmdOb3RpZmljYXRpb25zID4gMSBhcmUgd2hlbiB1c2luZyByYXRlLWxpbWl0aW5nIG9yIHRoZSBEZWZlcnJlZCBVcGRhdGVzXG4gICAgICAgIC8vIHBsdWdpbiwgd2hpY2ggd2l0aG91dCB0aGlzIGNoZWNrIHdvdWxkIG5vdCBiZSBjb21wYXRpYmxlIHdpdGggYXJyYXlDaGFuZ2Ugbm90aWZpY2F0aW9ucy4gTm9ybWFsbHksXG4gICAgICAgIC8vIG5vdGlmaWNhdGlvbnMgYXJlIGlzc3VlZCBpbW1lZGlhdGVseSBzbyB3ZSB3b3VsZG4ndCBiZSBxdWV1ZWluZyB1cCBtb3JlIHRoYW4gb25lLlxuICAgICAgICBpZiAoIWNhY2hlZERpZmYgfHwgcGVuZGluZ05vdGlmaWNhdGlvbnMgPiAxKSB7XG4gICAgICAgICAgICBjYWNoZWREaWZmID0ga28udXRpbHMuY29tcGFyZUFycmF5cyhwcmV2aW91c0NvbnRlbnRzLCBjdXJyZW50Q29udGVudHMsIHsgJ3NwYXJzZSc6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2FjaGVkRGlmZjtcbiAgICB9XG5cbiAgICB0YXJnZXQuY2FjaGVEaWZmRm9yS25vd25PcGVyYXRpb24gPSBmdW5jdGlvbihyYXdBcnJheSwgb3BlcmF0aW9uTmFtZSwgYXJncykge1xuICAgICAgICAvLyBPbmx5IHJ1biBpZiB3ZSdyZSBjdXJyZW50bHkgdHJhY2tpbmcgY2hhbmdlcyBmb3IgdGhpcyBvYnNlcnZhYmxlIGFycmF5XG4gICAgICAgIC8vIGFuZCB0aGVyZSBhcmVuJ3QgYW55IHBlbmRpbmcgZGVmZXJyZWQgbm90aWZpY2F0aW9ucy5cbiAgICAgICAgaWYgKCF0cmFja2luZ0NoYW5nZXMgfHwgcGVuZGluZ05vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGlmZiA9IFtdLFxuICAgICAgICAgICAgYXJyYXlMZW5ndGggPSByYXdBcnJheS5sZW5ndGgsXG4gICAgICAgICAgICBhcmdzTGVuZ3RoID0gYXJncy5sZW5ndGgsXG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIHB1c2hEaWZmKHN0YXR1cywgdmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gZGlmZltkaWZmLmxlbmd0aF0gPSB7ICdzdGF0dXMnOiBzdGF0dXMsICd2YWx1ZSc6IHZhbHVlLCAnaW5kZXgnOiBpbmRleCB9O1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAob3BlcmF0aW9uTmFtZSkge1xuICAgICAgICAgICAgY2FzZSAncHVzaCc6XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gYXJyYXlMZW5ndGg7XG4gICAgICAgICAgICBjYXNlICd1bnNoaWZ0JzpcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgYXJnc0xlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICBwdXNoRGlmZignYWRkZWQnLCBhcmdzW2luZGV4XSwgb2Zmc2V0ICsgaW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAncG9wJzpcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBhcnJheUxlbmd0aCAtIDE7XG4gICAgICAgICAgICBjYXNlICdzaGlmdCc6XG4gICAgICAgICAgICAgICAgaWYgKGFycmF5TGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHB1c2hEaWZmKCdkZWxldGVkJywgcmF3QXJyYXlbb2Zmc2V0XSwgb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NwbGljZSc6XG4gICAgICAgICAgICAgICAgLy8gTmVnYXRpdmUgc3RhcnQgaW5kZXggbWVhbnMgJ2Zyb20gZW5kIG9mIGFycmF5Jy4gQWZ0ZXIgdGhhdCB3ZSBjbGFtcCB0byBbMC4uLmFycmF5TGVuZ3RoXS5cbiAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvc3BsaWNlXG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0SW5kZXggPSBNYXRoLm1pbihNYXRoLm1heCgwLCBhcmdzWzBdIDwgMCA/IGFycmF5TGVuZ3RoICsgYXJnc1swXSA6IGFyZ3NbMF0pLCBhcnJheUxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIGVuZERlbGV0ZUluZGV4ID0gYXJnc0xlbmd0aCA9PT0gMSA/IGFycmF5TGVuZ3RoIDogTWF0aC5taW4oc3RhcnRJbmRleCArIChhcmdzWzFdIHx8IDApLCBhcnJheUxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIGVuZEFkZEluZGV4ID0gc3RhcnRJbmRleCArIGFyZ3NMZW5ndGggLSAyLFxuICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCA9IE1hdGgubWF4KGVuZERlbGV0ZUluZGV4LCBlbmRBZGRJbmRleCksXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9ucyA9IFtdLCBkZWxldGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IHN0YXJ0SW5kZXgsIGFyZ3NJbmRleCA9IDI7IGluZGV4IDwgZW5kSW5kZXg7ICsraW5kZXgsICsrYXJnc0luZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IGVuZERlbGV0ZUluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRpb25zLnB1c2gocHVzaERpZmYoJ2RlbGV0ZWQnLCByYXdBcnJheVtpbmRleF0sIGluZGV4KSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IGVuZEFkZEluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25zLnB1c2gocHVzaERpZmYoJ2FkZGVkJywgYXJnc1thcmdzSW5kZXhdLCBpbmRleCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrby51dGlscy5maW5kTW92ZXNJbkFycmF5Q29tcGFyaXNvbihkZWxldGlvbnMsIGFkZGl0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNhY2hlZERpZmYgPSBkaWZmO1xuICAgIH07XG59O1xua28uY29tcHV0ZWQgPSBrby5kZXBlbmRlbnRPYnNlcnZhYmxlID0gZnVuY3Rpb24gKGV2YWx1YXRvckZ1bmN0aW9uT3JPcHRpb25zLCBldmFsdWF0b3JGdW5jdGlvblRhcmdldCwgb3B0aW9ucykge1xuICAgIHZhciBfbGF0ZXN0VmFsdWUsXG4gICAgICAgIF9uZWVkc0V2YWx1YXRpb24gPSB0cnVlLFxuICAgICAgICBfaXNCZWluZ0V2YWx1YXRlZCA9IGZhbHNlLFxuICAgICAgICBfc3VwcHJlc3NEaXNwb3NhbFVudGlsRGlzcG9zZVdoZW5SZXR1cm5zRmFsc2UgPSBmYWxzZSxcbiAgICAgICAgX2lzRGlzcG9zZWQgPSBmYWxzZSxcbiAgICAgICAgcmVhZEZ1bmN0aW9uID0gZXZhbHVhdG9yRnVuY3Rpb25Pck9wdGlvbnMsXG4gICAgICAgIHB1cmUgPSBmYWxzZSxcbiAgICAgICAgaXNTbGVlcGluZyA9IGZhbHNlO1xuXG4gICAgaWYgKHJlYWRGdW5jdGlvbiAmJiB0eXBlb2YgcmVhZEZ1bmN0aW9uID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgLy8gU2luZ2xlLXBhcmFtZXRlciBzeW50YXggLSBldmVyeXRoaW5nIGlzIG9uIHRoaXMgXCJvcHRpb25zXCIgcGFyYW1cbiAgICAgICAgb3B0aW9ucyA9IHJlYWRGdW5jdGlvbjtcbiAgICAgICAgcmVhZEZ1bmN0aW9uID0gb3B0aW9uc1tcInJlYWRcIl07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTXVsdGktcGFyYW1ldGVyIHN5bnRheCAtIGNvbnN0cnVjdCB0aGUgb3B0aW9ucyBhY2NvcmRpbmcgdG8gdGhlIHBhcmFtcyBwYXNzZWRcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGlmICghcmVhZEZ1bmN0aW9uKVxuICAgICAgICAgICAgcmVhZEZ1bmN0aW9uID0gb3B0aW9uc1tcInJlYWRcIl07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmVhZEZ1bmN0aW9uICE9IFwiZnVuY3Rpb25cIilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFzcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGtvLmNvbXB1dGVkXCIpO1xuXG4gICAgZnVuY3Rpb24gYWRkRGVwZW5kZW5jeVRyYWNraW5nKGlkLCB0YXJnZXQsIHRyYWNraW5nT2JqKSB7XG4gICAgICAgIGlmIChwdXJlICYmIHRhcmdldCA9PT0gZGVwZW5kZW50T2JzZXJ2YWJsZSkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJBICdwdXJlJyBjb21wdXRlZCBtdXN0IG5vdCBiZSBjYWxsZWQgcmVjdXJzaXZlbHlcIik7XG4gICAgICAgIH1cblxuICAgICAgICBkZXBlbmRlbmN5VHJhY2tpbmdbaWRdID0gdHJhY2tpbmdPYmo7XG4gICAgICAgIHRyYWNraW5nT2JqLl9vcmRlciA9IF9kZXBlbmRlbmNpZXNDb3VudCsrO1xuICAgICAgICB0cmFja2luZ09iai5fdmVyc2lvbiA9IHRhcmdldC5nZXRWZXJzaW9uKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGF2ZURlcGVuZGVuY2llc0NoYW5nZWQoKSB7XG4gICAgICAgIHZhciBpZCwgZGVwZW5kZW5jeTtcbiAgICAgICAgZm9yIChpZCBpbiBkZXBlbmRlbmN5VHJhY2tpbmcpIHtcbiAgICAgICAgICAgIGlmIChkZXBlbmRlbmN5VHJhY2tpbmcuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jeSA9IGRlcGVuZGVuY3lUcmFja2luZ1tpZF07XG4gICAgICAgICAgICAgICAgaWYgKGRlcGVuZGVuY3kuX3RhcmdldC5oYXNDaGFuZ2VkKGRlcGVuZGVuY3kuX3ZlcnNpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpc3Bvc2VDb21wdXRlZCgpIHtcbiAgICAgICAgaWYgKCFpc1NsZWVwaW5nICYmIGRlcGVuZGVuY3lUcmFja2luZykge1xuICAgICAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaChkZXBlbmRlbmN5VHJhY2tpbmcsIGZ1bmN0aW9uIChpZCwgZGVwZW5kZW5jeSkge1xuICAgICAgICAgICAgICAgIGlmIChkZXBlbmRlbmN5LmRpc3Bvc2UpXG4gICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY3kuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZGVwZW5kZW5jeVRyYWNraW5nID0gbnVsbDtcbiAgICAgICAgX2RlcGVuZGVuY2llc0NvdW50ID0gMDtcbiAgICAgICAgX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICBfbmVlZHNFdmFsdWF0aW9uID0gZmFsc2U7XG4gICAgICAgIGlzU2xlZXBpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBldmFsdWF0ZVBvc3NpYmx5QXN5bmMoKSB7XG4gICAgICAgIHZhciB0aHJvdHRsZUV2YWx1YXRpb25UaW1lb3V0ID0gZGVwZW5kZW50T2JzZXJ2YWJsZVsndGhyb3R0bGVFdmFsdWF0aW9uJ107XG4gICAgICAgIGlmICh0aHJvdHRsZUV2YWx1YXRpb25UaW1lb3V0ICYmIHRocm90dGxlRXZhbHVhdGlvblRpbWVvdXQgPj0gMCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGV2YWx1YXRpb25UaW1lb3V0SW5zdGFuY2UpO1xuICAgICAgICAgICAgZXZhbHVhdGlvblRpbWVvdXRJbnN0YW5jZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGV2YWx1YXRlSW1tZWRpYXRlKHRydWUgLypub3RpZnlDaGFuZ2UqLyk7XG4gICAgICAgICAgICB9LCB0aHJvdHRsZUV2YWx1YXRpb25UaW1lb3V0KTtcbiAgICAgICAgfSBlbHNlIGlmIChkZXBlbmRlbnRPYnNlcnZhYmxlLl9ldmFsUmF0ZUxpbWl0ZWQpIHtcbiAgICAgICAgICAgIGRlcGVuZGVudE9ic2VydmFibGUuX2V2YWxSYXRlTGltaXRlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZhbHVhdGVJbW1lZGlhdGUodHJ1ZSAvKm5vdGlmeUNoYW5nZSovKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV2YWx1YXRlSW1tZWRpYXRlKG5vdGlmeUNoYW5nZSkge1xuICAgICAgICBpZiAoX2lzQmVpbmdFdmFsdWF0ZWQpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBldmFsdWF0aW9uIG9mIGEga28uY29tcHV0ZWQgY2F1c2VzIHNpZGUgZWZmZWN0cywgaXQncyBwb3NzaWJsZSB0aGF0IGl0IHdpbGwgdHJpZ2dlciBpdHMgb3duIHJlLWV2YWx1YXRpb24uXG4gICAgICAgICAgICAvLyBUaGlzIGlzIG5vdCBkZXNpcmFibGUgKGl0J3MgaGFyZCBmb3IgYSBkZXZlbG9wZXIgdG8gcmVhbGlzZSBhIGNoYWluIG9mIGRlcGVuZGVuY2llcyBtaWdodCBjYXVzZSB0aGlzLCBhbmQgdGhleSBhbG1vc3RcbiAgICAgICAgICAgIC8vIGNlcnRhaW5seSBkaWRuJ3QgaW50ZW5kIGluZmluaXRlIHJlLWV2YWx1YXRpb25zKS4gU28sIGZvciBwcmVkaWN0YWJpbGl0eSwgd2Ugc2ltcGx5IHByZXZlbnQga28uY29tcHV0ZWRzIGZyb20gY2F1c2luZ1xuICAgICAgICAgICAgLy8gdGhlaXIgb3duIHJlLWV2YWx1YXRpb24uIEZ1cnRoZXIgZGlzY3Vzc2lvbiBhdCBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvcHVsbC8zODdcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERvIG5vdCBldmFsdWF0ZSAoYW5kIHBvc3NpYmx5IGNhcHR1cmUgbmV3IGRlcGVuZGVuY2llcykgaWYgZGlzcG9zZWRcbiAgICAgICAgaWYgKF9pc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlzcG9zZVdoZW4gJiYgZGlzcG9zZVdoZW4oKSkge1xuICAgICAgICAgICAgLy8gU2VlIGNvbW1lbnQgYmVsb3cgYWJvdXQgX3N1cHByZXNzRGlzcG9zYWxVbnRpbERpc3Bvc2VXaGVuUmV0dXJuc0ZhbHNlXG4gICAgICAgICAgICBpZiAoIV9zdXBwcmVzc0Rpc3Bvc2FsVW50aWxEaXNwb3NlV2hlblJldHVybnNGYWxzZSkge1xuICAgICAgICAgICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJdCBqdXN0IGRpZCByZXR1cm4gZmFsc2UsIHNvIHdlIGNhbiBzdG9wIHN1cHByZXNzaW5nIG5vd1xuICAgICAgICAgICAgX3N1cHByZXNzRGlzcG9zYWxVbnRpbERpc3Bvc2VXaGVuUmV0dXJuc0ZhbHNlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfaXNCZWluZ0V2YWx1YXRlZCA9IHRydWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSwgd2UgYXNzdW1lIHRoYXQgbm9uZSBvZiB0aGUgc3Vic2NyaXB0aW9ucyBhcmUgc3RpbGwgYmVpbmcgdXNlZCAoaS5lLiwgYWxsIGFyZSBjYW5kaWRhdGVzIGZvciBkaXNwb3NhbCkuXG4gICAgICAgICAgICAvLyBUaGVuLCBkdXJpbmcgZXZhbHVhdGlvbiwgd2UgY3Jvc3Mgb2ZmIGFueSB0aGF0IGFyZSBpbiBmYWN0IHN0aWxsIGJlaW5nIHVzZWQuXG4gICAgICAgICAgICB2YXIgZGlzcG9zYWxDYW5kaWRhdGVzID0gZGVwZW5kZW5jeVRyYWNraW5nLFxuICAgICAgICAgICAgICAgIGRpc3Bvc2FsQ291bnQgPSBfZGVwZW5kZW5jaWVzQ291bnQsXG4gICAgICAgICAgICAgICAgaXNJbml0aWFsID0gcHVyZSA/IHVuZGVmaW5lZCA6ICFfZGVwZW5kZW5jaWVzQ291bnQ7ICAgLy8gSWYgd2UncmUgZXZhbHVhdGluZyB3aGVuIHRoZXJlIGFyZSBubyBwcmV2aW91cyBkZXBlbmRlbmNpZXMsIGl0IG11c3QgYmUgdGhlIGZpcnN0IHRpbWVcblxuICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5iZWdpbih7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKHN1YnNjcmliYWJsZSwgaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfaXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3Bvc2FsQ291bnQgJiYgZGlzcG9zYWxDYW5kaWRhdGVzW2lkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERvbid0IHdhbnQgdG8gZGlzcG9zZSB0aGlzIHN1YnNjcmlwdGlvbiwgYXMgaXQncyBzdGlsbCBiZWluZyB1c2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRGVwZW5kZW5jeVRyYWNraW5nKGlkLCBzdWJzY3JpYmFibGUsIGRpc3Bvc2FsQ2FuZGlkYXRlc1tpZF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkaXNwb3NhbENhbmRpZGF0ZXNbaWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tZGlzcG9zYWxDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWRlcGVuZGVuY3lUcmFja2luZ1tpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCcmFuZCBuZXcgc3Vic2NyaXB0aW9uIC0gYWRkIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRGVwZW5kZW5jeVRyYWNraW5nKGlkLCBzdWJzY3JpYmFibGUsIGlzU2xlZXBpbmcgPyB7IF90YXJnZXQ6IHN1YnNjcmliYWJsZSB9IDogc3Vic2NyaWJhYmxlLnN1YnNjcmliZShldmFsdWF0ZVBvc3NpYmx5QXN5bmMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29tcHV0ZWQ6IGRlcGVuZGVudE9ic2VydmFibGUsXG4gICAgICAgICAgICAgICAgaXNJbml0aWFsOiBpc0luaXRpYWxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkZXBlbmRlbmN5VHJhY2tpbmcgPSB7fTtcbiAgICAgICAgICAgIF9kZXBlbmRlbmNpZXNDb3VudCA9IDA7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gZXZhbHVhdG9yRnVuY3Rpb25UYXJnZXQgPyByZWFkRnVuY3Rpb24uY2FsbChldmFsdWF0b3JGdW5jdGlvblRhcmdldCkgOiByZWFkRnVuY3Rpb24oKTtcblxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmVuZCgpO1xuXG4gICAgICAgICAgICAgICAgLy8gRm9yIGVhY2ggc3Vic2NyaXB0aW9uIG5vIGxvbmdlciBiZWluZyB1c2VkLCByZW1vdmUgaXQgZnJvbSB0aGUgYWN0aXZlIHN1YnNjcmlwdGlvbnMgbGlzdCBhbmQgZGlzcG9zZSBpdFxuICAgICAgICAgICAgICAgIGlmIChkaXNwb3NhbENvdW50ICYmICFpc1NsZWVwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2goZGlzcG9zYWxDYW5kaWRhdGVzLCBmdW5jdGlvbihpZCwgdG9EaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9EaXNwb3NlLmRpc3Bvc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9EaXNwb3NlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgX25lZWRzRXZhbHVhdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwZW5kZW50T2JzZXJ2YWJsZS5pc0RpZmZlcmVudChfbGF0ZXN0VmFsdWUsIG5ld1ZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghaXNTbGVlcGluZykge1xuICAgICAgICAgICAgICAgICAgICBub3RpZnkoX2xhdGVzdFZhbHVlLCBcImJlZm9yZUNoYW5nZVwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfbGF0ZXN0VmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcpIGRlcGVuZGVudE9ic2VydmFibGUuX2xhdGVzdFZhbHVlID0gX2xhdGVzdFZhbHVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzU2xlZXBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS51cGRhdGVWZXJzaW9uKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub3RpZnlDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZ5KF9sYXRlc3RWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNJbml0aWFsKSB7XG4gICAgICAgICAgICAgICAgbm90aWZ5KF9sYXRlc3RWYWx1ZSwgXCJhd2FrZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIF9pc0JlaW5nRXZhbHVhdGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV9kZXBlbmRlbmNpZXNDb3VudClcbiAgICAgICAgICAgIGRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXBlbmRlbnRPYnNlcnZhYmxlKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd3JpdGVGdW5jdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgLy8gV3JpdGluZyBhIHZhbHVlXG4gICAgICAgICAgICAgICAgd3JpdGVGdW5jdGlvbi5hcHBseShldmFsdWF0b3JGdW5jdGlvblRhcmdldCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHdyaXRlIGEgdmFsdWUgdG8gYSBrby5jb21wdXRlZCB1bmxlc3MgeW91IHNwZWNpZnkgYSAnd3JpdGUnIG9wdGlvbi4gSWYgeW91IHdpc2ggdG8gcmVhZCB0aGUgY3VycmVudCB2YWx1ZSwgZG9uJ3QgcGFzcyBhbnkgcGFyYW1ldGVycy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpczsgLy8gUGVybWl0cyBjaGFpbmVkIGFzc2lnbm1lbnRzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBSZWFkaW5nIHRoZSB2YWx1ZVxuICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5yZWdpc3RlckRlcGVuZGVuY3koZGVwZW5kZW50T2JzZXJ2YWJsZSk7XG4gICAgICAgICAgICBpZiAoX25lZWRzRXZhbHVhdGlvbiB8fCAoaXNTbGVlcGluZyAmJiBoYXZlRGVwZW5kZW5jaWVzQ2hhbmdlZCgpKSkge1xuICAgICAgICAgICAgICAgIGV2YWx1YXRlSW1tZWRpYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX2xhdGVzdFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVlaygpIHtcbiAgICAgICAgLy8gUGVlayB3b24ndCByZS1ldmFsdWF0ZSwgZXhjZXB0IHdoaWxlIHRoZSBjb21wdXRlZCBpcyBzbGVlcGluZyBvciB0byBnZXQgdGhlIGluaXRpYWwgdmFsdWUgd2hlbiBcImRlZmVyRXZhbHVhdGlvblwiIGlzIHNldC5cbiAgICAgICAgaWYgKChfbmVlZHNFdmFsdWF0aW9uICYmICFfZGVwZW5kZW5jaWVzQ291bnQpIHx8IChpc1NsZWVwaW5nICYmIGhhdmVEZXBlbmRlbmNpZXNDaGFuZ2VkKCkpKSB7XG4gICAgICAgICAgICBldmFsdWF0ZUltbWVkaWF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfbGF0ZXN0VmFsdWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNBY3RpdmUoKSB7XG4gICAgICAgIHJldHVybiBfbmVlZHNFdmFsdWF0aW9uIHx8IF9kZXBlbmRlbmNpZXNDb3VudCA+IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm90aWZ5KHZhbHVlLCBldmVudCkge1xuICAgICAgICBkZXBlbmRlbnRPYnNlcnZhYmxlW1wibm90aWZ5U3Vic2NyaWJlcnNcIl0odmFsdWUsIGV2ZW50KTtcbiAgICB9XG5cbiAgICAvLyBCeSBoZXJlLCBcIm9wdGlvbnNcIiBpcyBhbHdheXMgbm9uLW51bGxcbiAgICB2YXIgd3JpdGVGdW5jdGlvbiA9IG9wdGlvbnNbXCJ3cml0ZVwiXSxcbiAgICAgICAgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkID0gb3B0aW9uc1tcImRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZFwiXSB8fCBvcHRpb25zLmRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZCB8fCBudWxsLFxuICAgICAgICBkaXNwb3NlV2hlbk9wdGlvbiA9IG9wdGlvbnNbXCJkaXNwb3NlV2hlblwiXSB8fCBvcHRpb25zLmRpc3Bvc2VXaGVuLFxuICAgICAgICBkaXNwb3NlV2hlbiA9IGRpc3Bvc2VXaGVuT3B0aW9uLFxuICAgICAgICBkaXNwb3NlID0gZGlzcG9zZUNvbXB1dGVkLFxuICAgICAgICBkZXBlbmRlbmN5VHJhY2tpbmcgPSB7fSxcbiAgICAgICAgX2RlcGVuZGVuY2llc0NvdW50ID0gMCxcbiAgICAgICAgZXZhbHVhdGlvblRpbWVvdXRJbnN0YW5jZSA9IG51bGw7XG5cbiAgICBpZiAoIWV2YWx1YXRvckZ1bmN0aW9uVGFyZ2V0KVxuICAgICAgICBldmFsdWF0b3JGdW5jdGlvblRhcmdldCA9IG9wdGlvbnNbXCJvd25lclwiXTtcblxuICAgIGtvLnN1YnNjcmliYWJsZS5jYWxsKGRlcGVuZGVudE9ic2VydmFibGUpO1xuICAgIGtvLnV0aWxzLnNldFByb3RvdHlwZU9mT3JFeHRlbmQoZGVwZW5kZW50T2JzZXJ2YWJsZSwga28uZGVwZW5kZW50T2JzZXJ2YWJsZVsnZm4nXSk7XG5cbiAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLnBlZWsgPSBwZWVrO1xuICAgIGRlcGVuZGVudE9ic2VydmFibGUuZ2V0RGVwZW5kZW5jaWVzQ291bnQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfZGVwZW5kZW5jaWVzQ291bnQ7IH07XG4gICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5oYXNXcml0ZUZ1bmN0aW9uID0gdHlwZW9mIHdyaXRlRnVuY3Rpb24gPT09IFwiZnVuY3Rpb25cIjtcbiAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7IGRpc3Bvc2UoKTsgfTtcbiAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLmlzQWN0aXZlID0gaXNBY3RpdmU7XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBsaW1pdCBmdW5jdGlvbiB3aXRoIG9uZSB0aGF0IGRlbGF5cyBldmFsdWF0aW9uIGFzIHdlbGwuXG4gICAgdmFyIG9yaWdpbmFsTGltaXQgPSBkZXBlbmRlbnRPYnNlcnZhYmxlLmxpbWl0O1xuICAgIGRlcGVuZGVudE9ic2VydmFibGUubGltaXQgPSBmdW5jdGlvbihsaW1pdEZ1bmN0aW9uKSB7XG4gICAgICAgIG9yaWdpbmFsTGltaXQuY2FsbChkZXBlbmRlbnRPYnNlcnZhYmxlLCBsaW1pdEZ1bmN0aW9uKTtcbiAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5fZXZhbFJhdGVMaW1pdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLl9yYXRlTGltaXRlZEJlZm9yZUNoYW5nZShfbGF0ZXN0VmFsdWUpO1xuXG4gICAgICAgICAgICBfbmVlZHNFdmFsdWF0aW9uID0gdHJ1ZTsgICAgLy8gTWFyayBhcyBkaXJ0eVxuXG4gICAgICAgICAgICAvLyBQYXNzIHRoZSBvYnNlcnZhYmxlIHRvIHRoZSByYXRlLWxpbWl0IGNvZGUsIHdoaWNoIHdpbGwgYWNjZXNzIGl0IHdoZW5cbiAgICAgICAgICAgIC8vIGl0J3MgdGltZSB0byBkbyB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5fcmF0ZUxpbWl0ZWRDaGFuZ2UoZGVwZW5kZW50T2JzZXJ2YWJsZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnNbJ3B1cmUnXSkge1xuICAgICAgICBwdXJlID0gdHJ1ZTtcbiAgICAgICAgaXNTbGVlcGluZyA9IHRydWU7ICAgICAvLyBTdGFydHMgb2ZmIHNsZWVwaW5nOyB3aWxsIGF3YWtlIG9uIHRoZSBmaXJzdCBzdWJzY3JpcHRpb25cbiAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5iZWZvcmVTdWJzY3JpcHRpb25BZGQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIElmIGFzbGVlcCwgd2FrZSB1cCB0aGUgY29tcHV0ZWQgYnkgc3Vic2NyaWJpbmcgdG8gYW55IGRlcGVuZGVuY2llcy5cbiAgICAgICAgICAgIGlmICghX2lzRGlzcG9zZWQgJiYgaXNTbGVlcGluZyAmJiBldmVudCA9PSAnY2hhbmdlJykge1xuICAgICAgICAgICAgICAgIGlzU2xlZXBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoX25lZWRzRXZhbHVhdGlvbiB8fCBoYXZlRGVwZW5kZW5jaWVzQ2hhbmdlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY3lUcmFja2luZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIF9kZXBlbmRlbmNpZXNDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIF9uZWVkc0V2YWx1YXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBldmFsdWF0ZUltbWVkaWF0ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0IHB1dCB0aGUgZGVwZW5kZW5jaWVzIGluIG9yZGVyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZXBlbmRlY2llc09yZGVyID0gW107XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2goZGVwZW5kZW5jeVRyYWNraW5nLCBmdW5jdGlvbiAoaWQsIGRlcGVuZGVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVjaWVzT3JkZXJbZGVwZW5kZW5jeS5fb3JkZXJdID0gaWQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBOZXh0LCBzdWJzY3JpYmUgdG8gZWFjaCBvbmVcbiAgICAgICAgICAgICAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKGRlcGVuZGVjaWVzT3JkZXIsIGZ1bmN0aW9uKGlkLCBvcmRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlcGVuZGVuY3kgPSBkZXBlbmRlbmN5VHJhY2tpbmdbaWRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IGRlcGVuZGVuY3kuX3RhcmdldC5zdWJzY3JpYmUoZXZhbHVhdGVQb3NzaWJseUFzeW5jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5fb3JkZXIgPSBvcmRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5fdmVyc2lvbiA9IGRlcGVuZGVuY3kuX3ZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmN5VHJhY2tpbmdbaWRdID0gc3Vic2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFfaXNEaXNwb3NlZCkgeyAgICAgLy8gdGVzdCBzaW5jZSBldmFsdWF0aW5nIGNvdWxkIHRyaWdnZXIgZGlzcG9zYWxcbiAgICAgICAgICAgICAgICAgICAgbm90aWZ5KF9sYXRlc3RWYWx1ZSwgXCJhd2FrZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5hZnRlclN1YnNjcmlwdGlvblJlbW92ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKCFfaXNEaXNwb3NlZCAmJiBldmVudCA9PSAnY2hhbmdlJyAmJiAhZGVwZW5kZW50T2JzZXJ2YWJsZS5oYXNTdWJzY3JpcHRpb25zRm9yRXZlbnQoJ2NoYW5nZScpKSB7XG4gICAgICAgICAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaChkZXBlbmRlbmN5VHJhY2tpbmcsIGZ1bmN0aW9uIChpZCwgZGVwZW5kZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVwZW5kZW5jeS5kaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmN5VHJhY2tpbmdbaWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90YXJnZXQ6IGRlcGVuZGVuY3kuX3RhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfb3JkZXI6IGRlcGVuZGVuY3kuX29yZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF92ZXJzaW9uOiBkZXBlbmRlbmN5Ll92ZXJzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW5jeS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpc1NsZWVwaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBub3RpZnkodW5kZWZpbmVkLCBcImFzbGVlcFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBCZWNhdXNlIGEgcHVyZSBjb21wdXRlZCBpcyBub3QgYXV0b21hdGljYWxseSB1cGRhdGVkIHdoaWxlIGl0IGlzIHNsZWVwaW5nLCB3ZSBjYW4ndFxuICAgICAgICAvLyBzaW1wbHkgcmV0dXJuIHRoZSB2ZXJzaW9uIG51bWJlci4gSW5zdGVhZCwgd2UgY2hlY2sgaWYgYW55IG9mIHRoZSBkZXBlbmRlbmNpZXMgaGF2ZVxuICAgICAgICAvLyBjaGFuZ2VkIGFuZCBjb25kaXRpb25hbGx5IHJlLWV2YWx1YXRlIHRoZSBjb21wdXRlZCBvYnNlcnZhYmxlLlxuICAgICAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLl9vcmlnaW5hbEdldFZlcnNpb24gPSBkZXBlbmRlbnRPYnNlcnZhYmxlLmdldFZlcnNpb247XG4gICAgICAgIGRlcGVuZGVudE9ic2VydmFibGUuZ2V0VmVyc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChpc1NsZWVwaW5nICYmIChfbmVlZHNFdmFsdWF0aW9uIHx8IGhhdmVEZXBlbmRlbmNpZXNDaGFuZ2VkKCkpKSB7XG4gICAgICAgICAgICAgICAgZXZhbHVhdGVJbW1lZGlhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZXBlbmRlbnRPYnNlcnZhYmxlLl9vcmlnaW5hbEdldFZlcnNpb24oKTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnNbJ2RlZmVyRXZhbHVhdGlvbiddKSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCBmb3JjZSBhIGNvbXB1dGVkIHdpdGggZGVmZXJFdmFsdWF0aW9uIHRvIGV2YWx1YXRlIHdoZW4gdGhlIGZpcnN0IHN1YnNjcmlwdGlvbnMgaXMgcmVnaXN0ZXJlZC5cbiAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5iZWZvcmVTdWJzY3JpcHRpb25BZGQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudCA9PSAnY2hhbmdlJyB8fCBldmVudCA9PSAnYmVmb3JlQ2hhbmdlJykge1xuICAgICAgICAgICAgICAgIHBlZWsoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGtvLmV4cG9ydFByb3BlcnR5KGRlcGVuZGVudE9ic2VydmFibGUsICdwZWVrJywgZGVwZW5kZW50T2JzZXJ2YWJsZS5wZWVrKTtcbiAgICBrby5leHBvcnRQcm9wZXJ0eShkZXBlbmRlbnRPYnNlcnZhYmxlLCAnZGlzcG9zZScsIGRlcGVuZGVudE9ic2VydmFibGUuZGlzcG9zZSk7XG4gICAga28uZXhwb3J0UHJvcGVydHkoZGVwZW5kZW50T2JzZXJ2YWJsZSwgJ2lzQWN0aXZlJywgZGVwZW5kZW50T2JzZXJ2YWJsZS5pc0FjdGl2ZSk7XG4gICAga28uZXhwb3J0UHJvcGVydHkoZGVwZW5kZW50T2JzZXJ2YWJsZSwgJ2dldERlcGVuZGVuY2llc0NvdW50JywgZGVwZW5kZW50T2JzZXJ2YWJsZS5nZXREZXBlbmRlbmNpZXNDb3VudCk7XG5cbiAgICAvLyBBZGQgYSBcImRpc3Bvc2VXaGVuXCIgY2FsbGJhY2sgdGhhdCwgb24gZWFjaCBldmFsdWF0aW9uLCBkaXNwb3NlcyBpZiB0aGUgbm9kZSB3YXMgcmVtb3ZlZCB3aXRob3V0IHVzaW5nIGtvLnJlbW92ZU5vZGUuXG4gICAgaWYgKGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZCkge1xuICAgICAgICAvLyBTaW5jZSB0aGlzIGNvbXB1dGVkIGlzIGFzc29jaWF0ZWQgd2l0aCBhIERPTSBub2RlLCBhbmQgd2UgZG9uJ3Qgd2FudCB0byBkaXNwb3NlIHRoZSBjb21wdXRlZFxuICAgICAgICAvLyB1bnRpbCB0aGUgRE9NIG5vZGUgaXMgKnJlbW92ZWQqIGZyb20gdGhlIGRvY3VtZW50IChhcyBvcHBvc2VkIHRvIG5ldmVyIGhhdmluZyBiZWVuIGluIHRoZSBkb2N1bWVudCksXG4gICAgICAgIC8vIHdlJ2xsIHByZXZlbnQgZGlzcG9zYWwgdW50aWwgXCJkaXNwb3NlV2hlblwiIGZpcnN0IHJldHVybnMgZmFsc2UuXG4gICAgICAgIF9zdXBwcmVzc0Rpc3Bvc2FsVW50aWxEaXNwb3NlV2hlblJldHVybnNGYWxzZSA9IHRydWU7XG5cbiAgICAgICAgLy8gT25seSB3YXRjaCBmb3IgdGhlIG5vZGUncyBkaXNwb3NhbCBpZiB0aGUgdmFsdWUgcmVhbGx5IGlzIGEgbm9kZS4gSXQgbWlnaHQgbm90IGJlLFxuICAgICAgICAvLyBlLmcuLCB7IGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogdHJ1ZSB9IGNhbiBiZSB1c2VkIHRvIG9wdCBpbnRvIHRoZSBcIm9ubHkgZGlzcG9zZVxuICAgICAgICAvLyBhZnRlciBmaXJzdCBmYWxzZSByZXN1bHRcIiBiZWhhdmlvdXIgZXZlbiBpZiB0aGVyZSdzIG5vIHNwZWNpZmljIG5vZGUgdG8gd2F0Y2guIFRoaXNcbiAgICAgICAgLy8gdGVjaG5pcXVlIGlzIGludGVuZGVkIGZvciBLTydzIGludGVybmFsIHVzZSBvbmx5IGFuZCBzaG91bGRuJ3QgYmUgZG9jdW1lbnRlZCBvciB1c2VkXG4gICAgICAgIC8vIGJ5IGFwcGxpY2F0aW9uIGNvZGUsIGFzIGl0J3MgbGlrZWx5IHRvIGNoYW5nZSBpbiBhIGZ1dHVyZSB2ZXJzaW9uIG9mIEtPLlxuICAgICAgICBpZiAoZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICBkaXNwb3NlV2hlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIWtvLnV0aWxzLmRvbU5vZGVJc0F0dGFjaGVkVG9Eb2N1bWVudChkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQpIHx8IChkaXNwb3NlV2hlbk9wdGlvbiAmJiBkaXNwb3NlV2hlbk9wdGlvbigpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFdmFsdWF0ZSwgdW5sZXNzIHNsZWVwaW5nIG9yIGRlZmVyRXZhbHVhdGlvbiBpcyB0cnVlXG4gICAgaWYgKCFpc1NsZWVwaW5nICYmICFvcHRpb25zWydkZWZlckV2YWx1YXRpb24nXSlcbiAgICAgICAgZXZhbHVhdGVJbW1lZGlhdGUoKTtcblxuICAgIC8vIEF0dGFjaCBhIERPTSBub2RlIGRpc3Bvc2FsIGNhbGxiYWNrIHNvIHRoYXQgdGhlIGNvbXB1dGVkIHdpbGwgYmUgcHJvYWN0aXZlbHkgZGlzcG9zZWQgYXMgc29vbiBhcyB0aGUgbm9kZSBpc1xuICAgIC8vIHJlbW92ZWQgdXNpbmcga28ucmVtb3ZlTm9kZS4gQnV0IHNraXAgaWYgaXNBY3RpdmUgaXMgZmFsc2UgKHRoZXJlIHdpbGwgbmV2ZXIgYmUgYW55IGRlcGVuZGVuY2llcyB0byBkaXNwb3NlKS5cbiAgICBpZiAoZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkICYmIGlzQWN0aXZlKCkgJiYgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkLm5vZGVUeXBlKSB7XG4gICAgICAgIGRpc3Bvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5yZW1vdmVEaXNwb3NlQ2FsbGJhY2soZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkLCBkaXNwb3NlKTtcbiAgICAgICAgICAgIGRpc3Bvc2VDb21wdXRlZCgpO1xuICAgICAgICB9O1xuICAgICAgICBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwuYWRkRGlzcG9zZUNhbGxiYWNrKGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZCwgZGlzcG9zZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlcGVuZGVudE9ic2VydmFibGU7XG59O1xuXG5rby5pc0NvbXB1dGVkID0gZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICByZXR1cm4ga28uaGFzUHJvdG90eXBlKGluc3RhbmNlLCBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKTtcbn07XG5cbnZhciBwcm90b1Byb3AgPSBrby5vYnNlcnZhYmxlLnByb3RvUHJvcGVydHk7IC8vID09IFwiX19rb19wcm90b19fXCJcbmtvLmRlcGVuZGVudE9ic2VydmFibGVbcHJvdG9Qcm9wXSA9IGtvLm9ic2VydmFibGU7XG5cbmtvLmRlcGVuZGVudE9ic2VydmFibGVbJ2ZuJ10gPSB7XG4gICAgXCJlcXVhbGl0eUNvbXBhcmVyXCI6IHZhbHVlc0FyZVByaW1pdGl2ZUFuZEVxdWFsXG59O1xua28uZGVwZW5kZW50T2JzZXJ2YWJsZVsnZm4nXVtwcm90b1Byb3BdID0ga28uZGVwZW5kZW50T2JzZXJ2YWJsZTtcblxuLy8gTm90ZSB0aGF0IGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgcHJvdG8gYXNzaWdubWVudCwgdGhlXG4vLyBpbmhlcml0YW5jZSBjaGFpbiBpcyBjcmVhdGVkIG1hbnVhbGx5IGluIHRoZSBrby5kZXBlbmRlbnRPYnNlcnZhYmxlIGNvbnN0cnVjdG9yXG5pZiAoa28udXRpbHMuY2FuU2V0UHJvdG90eXBlKSB7XG4gICAga28udXRpbHMuc2V0UHJvdG90eXBlT2Yoa28uZGVwZW5kZW50T2JzZXJ2YWJsZVsnZm4nXSwga28uc3Vic2NyaWJhYmxlWydmbiddKTtcbn1cblxua28uZXhwb3J0U3ltYm9sKCdkZXBlbmRlbnRPYnNlcnZhYmxlJywga28uZGVwZW5kZW50T2JzZXJ2YWJsZSk7XG5rby5leHBvcnRTeW1ib2woJ2NvbXB1dGVkJywga28uZGVwZW5kZW50T2JzZXJ2YWJsZSk7IC8vIE1ha2UgXCJrby5jb21wdXRlZFwiIGFuIGFsaWFzIGZvciBcImtvLmRlcGVuZGVudE9ic2VydmFibGVcIlxua28uZXhwb3J0U3ltYm9sKCdpc0NvbXB1dGVkJywga28uaXNDb21wdXRlZCk7XG5cbmtvLnB1cmVDb21wdXRlZCA9IGZ1bmN0aW9uIChldmFsdWF0b3JGdW5jdGlvbk9yT3B0aW9ucywgZXZhbHVhdG9yRnVuY3Rpb25UYXJnZXQpIHtcbiAgICBpZiAodHlwZW9mIGV2YWx1YXRvckZ1bmN0aW9uT3JPcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBrby5jb21wdXRlZChldmFsdWF0b3JGdW5jdGlvbk9yT3B0aW9ucywgZXZhbHVhdG9yRnVuY3Rpb25UYXJnZXQsIHsncHVyZSc6dHJ1ZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGV2YWx1YXRvckZ1bmN0aW9uT3JPcHRpb25zID0ga28udXRpbHMuZXh0ZW5kKHt9LCBldmFsdWF0b3JGdW5jdGlvbk9yT3B0aW9ucyk7ICAgLy8gbWFrZSBhIGNvcHkgb2YgdGhlIHBhcmFtZXRlciBvYmplY3RcbiAgICAgICAgZXZhbHVhdG9yRnVuY3Rpb25Pck9wdGlvbnNbJ3B1cmUnXSA9IHRydWU7XG4gICAgICAgIHJldHVybiBrby5jb21wdXRlZChldmFsdWF0b3JGdW5jdGlvbk9yT3B0aW9ucywgZXZhbHVhdG9yRnVuY3Rpb25UYXJnZXQpO1xuICAgIH1cbn1cbmtvLmV4cG9ydFN5bWJvbCgncHVyZUNvbXB1dGVkJywga28ucHVyZUNvbXB1dGVkKTtcblxuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXhOZXN0ZWRPYnNlcnZhYmxlRGVwdGggPSAxMDsgLy8gRXNjYXBlIHRoZSAodW5saWtlbHkpIHBhdGhhbG9naWNhbCBjYXNlIHdoZXJlIGFuIG9ic2VydmFibGUncyBjdXJyZW50IHZhbHVlIGlzIGl0c2VsZiAob3Igc2ltaWxhciByZWZlcmVuY2UgY3ljbGUpXG5cbiAgICBrby50b0pTID0gZnVuY3Rpb24ocm9vdE9iamVjdCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2hlbiBjYWxsaW5nIGtvLnRvSlMsIHBhc3MgdGhlIG9iamVjdCB5b3Ugd2FudCB0byBjb252ZXJ0LlwiKTtcblxuICAgICAgICAvLyBXZSBqdXN0IHVud3JhcCBldmVyeXRoaW5nIGF0IGV2ZXJ5IGxldmVsIGluIHRoZSBvYmplY3QgZ3JhcGhcbiAgICAgICAgcmV0dXJuIG1hcEpzT2JqZWN0R3JhcGgocm9vdE9iamVjdCwgZnVuY3Rpb24odmFsdWVUb01hcCkge1xuICAgICAgICAgICAgLy8gTG9vcCBiZWNhdXNlIGFuIG9ic2VydmFibGUncyB2YWx1ZSBtaWdodCBpbiB0dXJuIGJlIGFub3RoZXIgb2JzZXJ2YWJsZSB3cmFwcGVyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsga28uaXNPYnNlcnZhYmxlKHZhbHVlVG9NYXApICYmIChpIDwgbWF4TmVzdGVkT2JzZXJ2YWJsZURlcHRoKTsgaSsrKVxuICAgICAgICAgICAgICAgIHZhbHVlVG9NYXAgPSB2YWx1ZVRvTWFwKCk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVUb01hcDtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGtvLnRvSlNPTiA9IGZ1bmN0aW9uKHJvb3RPYmplY3QsIHJlcGxhY2VyLCBzcGFjZSkgeyAgICAgLy8gcmVwbGFjZXIgYW5kIHNwYWNlIGFyZSBvcHRpb25hbFxuICAgICAgICB2YXIgcGxhaW5KYXZhU2NyaXB0T2JqZWN0ID0ga28udG9KUyhyb290T2JqZWN0KTtcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLnN0cmluZ2lmeUpzb24ocGxhaW5KYXZhU2NyaXB0T2JqZWN0LCByZXBsYWNlciwgc3BhY2UpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBtYXBKc09iamVjdEdyYXBoKHJvb3RPYmplY3QsIG1hcElucHV0Q2FsbGJhY2ssIHZpc2l0ZWRPYmplY3RzKSB7XG4gICAgICAgIHZpc2l0ZWRPYmplY3RzID0gdmlzaXRlZE9iamVjdHMgfHwgbmV3IG9iamVjdExvb2t1cCgpO1xuXG4gICAgICAgIHJvb3RPYmplY3QgPSBtYXBJbnB1dENhbGxiYWNrKHJvb3RPYmplY3QpO1xuICAgICAgICB2YXIgY2FuSGF2ZVByb3BlcnRpZXMgPSAodHlwZW9mIHJvb3RPYmplY3QgPT0gXCJvYmplY3RcIikgJiYgKHJvb3RPYmplY3QgIT09IG51bGwpICYmIChyb290T2JqZWN0ICE9PSB1bmRlZmluZWQpICYmICghKHJvb3RPYmplY3QgaW5zdGFuY2VvZiBEYXRlKSkgJiYgKCEocm9vdE9iamVjdCBpbnN0YW5jZW9mIFN0cmluZykpICYmICghKHJvb3RPYmplY3QgaW5zdGFuY2VvZiBOdW1iZXIpKSAmJiAoIShyb290T2JqZWN0IGluc3RhbmNlb2YgQm9vbGVhbikpO1xuICAgICAgICBpZiAoIWNhbkhhdmVQcm9wZXJ0aWVzKVxuICAgICAgICAgICAgcmV0dXJuIHJvb3RPYmplY3Q7XG5cbiAgICAgICAgdmFyIG91dHB1dFByb3BlcnRpZXMgPSByb290T2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHt9O1xuICAgICAgICB2aXNpdGVkT2JqZWN0cy5zYXZlKHJvb3RPYmplY3QsIG91dHB1dFByb3BlcnRpZXMpO1xuXG4gICAgICAgIHZpc2l0UHJvcGVydGllc09yQXJyYXlFbnRyaWVzKHJvb3RPYmplY3QsIGZ1bmN0aW9uKGluZGV4ZXIpIHtcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0eVZhbHVlID0gbWFwSW5wdXRDYWxsYmFjayhyb290T2JqZWN0W2luZGV4ZXJdKTtcblxuICAgICAgICAgICAgc3dpdGNoICh0eXBlb2YgcHJvcGVydHlWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiZnVuY3Rpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0UHJvcGVydGllc1tpbmRleGVyXSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwidW5kZWZpbmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmV2aW91c2x5TWFwcGVkVmFsdWUgPSB2aXNpdGVkT2JqZWN0cy5nZXQocHJvcGVydHlWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFByb3BlcnRpZXNbaW5kZXhlcl0gPSAocHJldmlvdXNseU1hcHBlZFZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHByZXZpb3VzbHlNYXBwZWRWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBtYXBKc09iamVjdEdyYXBoKHByb3BlcnR5VmFsdWUsIG1hcElucHV0Q2FsbGJhY2ssIHZpc2l0ZWRPYmplY3RzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBvdXRwdXRQcm9wZXJ0aWVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZpc2l0UHJvcGVydGllc09yQXJyYXlFbnRyaWVzKHJvb3RPYmplY3QsIHZpc2l0b3JDYWxsYmFjaykge1xuICAgICAgICBpZiAocm9vdE9iamVjdCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvb3RPYmplY3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgdmlzaXRvckNhbGxiYWNrKGkpO1xuXG4gICAgICAgICAgICAvLyBGb3IgYXJyYXlzLCBhbHNvIHJlc3BlY3QgdG9KU09OIHByb3BlcnR5IGZvciBjdXN0b20gbWFwcGluZ3MgKGZpeGVzICMyNzgpXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJvb3RPYmplY3RbJ3RvSlNPTiddID09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgdmlzaXRvckNhbGxiYWNrKCd0b0pTT04nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiByb290T2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgdmlzaXRvckNhbGxiYWNrKHByb3BlcnR5TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb2JqZWN0TG9va3VwKCkge1xuICAgICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICB9O1xuXG4gICAgb2JqZWN0TG9va3VwLnByb3RvdHlwZSA9IHtcbiAgICAgICAgY29uc3RydWN0b3I6IG9iamVjdExvb2t1cCxcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGV4aXN0aW5nSW5kZXggPSBrby51dGlscy5hcnJheUluZGV4T2YodGhpcy5rZXlzLCBrZXkpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nSW5kZXggPj0gMClcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tleGlzdGluZ0luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZ0luZGV4ID0ga28udXRpbHMuYXJyYXlJbmRleE9mKHRoaXMua2V5cywga2V5KTtcbiAgICAgICAgICAgIHJldHVybiAoZXhpc3RpbmdJbmRleCA+PSAwKSA/IHRoaXMudmFsdWVzW2V4aXN0aW5nSW5kZXhdIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgndG9KUycsIGtvLnRvSlMpO1xua28uZXhwb3J0U3ltYm9sKCd0b0pTT04nLCBrby50b0pTT04pO1xuKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGFzRG9tRGF0YUV4cGFuZG9Qcm9wZXJ0eSA9ICdfX2tvX19oYXNEb21EYXRhT3B0aW9uVmFsdWVfXyc7XG5cbiAgICAvLyBOb3JtYWxseSwgU0VMRUNUIGVsZW1lbnRzIGFuZCB0aGVpciBPUFRJT05zIGNhbiBvbmx5IHRha2UgdmFsdWUgb2YgdHlwZSAnc3RyaW5nJyAoYmVjYXVzZSB0aGUgdmFsdWVzXG4gICAgLy8gYXJlIHN0b3JlZCBvbiBET00gYXR0cmlidXRlcykuIGtvLnNlbGVjdEV4dGVuc2lvbnMgcHJvdmlkZXMgYSB3YXkgZm9yIFNFTEVDVHMvT1BUSU9OcyB0byBoYXZlIHZhbHVlc1xuICAgIC8vIHRoYXQgYXJlIGFyYml0cmFyeSBvYmplY3RzLiBUaGlzIGlzIHZlcnkgY29udmVuaWVudCB3aGVuIGltcGxlbWVudGluZyB0aGluZ3MgbGlrZSBjYXNjYWRpbmcgZHJvcGRvd25zLlxuICAgIGtvLnNlbGVjdEV4dGVuc2lvbnMgPSB7XG4gICAgICAgIHJlYWRWYWx1ZSA6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoa28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnb3B0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRbaGFzRG9tRGF0YUV4cGFuZG9Qcm9wZXJ0eV0gPT09IHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga28udXRpbHMuZG9tRGF0YS5nZXQoZWxlbWVudCwga28uYmluZGluZ0hhbmRsZXJzLm9wdGlvbnMub3B0aW9uVmFsdWVEb21EYXRhS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmllVmVyc2lvbiA8PSA3XG4gICAgICAgICAgICAgICAgICAgICAgICA/IChlbGVtZW50LmdldEF0dHJpYnV0ZU5vZGUoJ3ZhbHVlJykgJiYgZWxlbWVudC5nZXRBdHRyaWJ1dGVOb2RlKCd2YWx1ZScpLnNwZWNpZmllZCA/IGVsZW1lbnQudmFsdWUgOiBlbGVtZW50LnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA+PSAwID8ga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUoZWxlbWVudC5vcHRpb25zW2VsZW1lbnQuc2VsZWN0ZWRJbmRleF0pIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHdyaXRlVmFsdWU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlLCBhbGxvd1Vuc2V0KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGtvLnV0aWxzLnRhZ05hbWVMb3dlcihlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ29wdGlvbic6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrby51dGlscy5kb21EYXRhLnNldChlbGVtZW50LCBrby5iaW5kaW5nSGFuZGxlcnMub3B0aW9ucy5vcHRpb25WYWx1ZURvbURhdGFLZXksIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0RvbURhdGFFeHBhbmRvUHJvcGVydHkgaW4gZWxlbWVudCkgeyAvLyBJRSA8PSA4IHRocm93cyBlcnJvcnMgaWYgeW91IGRlbGV0ZSBub24tZXhpc3RlbnQgcHJvcGVydGllcyBmcm9tIGEgRE9NIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGVsZW1lbnRbaGFzRG9tRGF0YUV4cGFuZG9Qcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RvcmUgYXJiaXRyYXJ5IG9iamVjdCB1c2luZyBEb21EYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQoZWxlbWVudCwga28uYmluZGluZ0hhbmRsZXJzLm9wdGlvbnMub3B0aW9uVmFsdWVEb21EYXRhS2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtoYXNEb21EYXRhRXhwYW5kb1Byb3BlcnR5XSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIHRyZWF0bWVudCBvZiBudW1iZXJzIGlzIGp1c3QgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkuIEtPIDEuMi4xIHdyb3RlIG51bWVyaWNhbCB2YWx1ZXMgdG8gZWxlbWVudC52YWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiID8gdmFsdWUgOiBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJcIiB8fCB2YWx1ZSA9PT0gbnVsbCkgICAgICAgLy8gQSBibGFuayBzdHJpbmcgb3IgbnVsbCB2YWx1ZSB3aWxsIHNlbGVjdCB0aGUgY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBlbGVtZW50Lm9wdGlvbnMubGVuZ3RoLCBvcHRpb25WYWx1ZTsgaSA8IG47ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uVmFsdWUgPSBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50Lm9wdGlvbnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5jbHVkZSBzcGVjaWFsIGNoZWNrIHRvIGhhbmRsZSBzZWxlY3RpbmcgYSBjYXB0aW9uIHdpdGggYSBibGFuayBzdHJpbmcgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25WYWx1ZSA9PSB2YWx1ZSB8fCAob3B0aW9uVmFsdWUgPT0gXCJcIiAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbiA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93VW5zZXQgfHwgc2VsZWN0aW9uID49IDAgfHwgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgZWxlbWVudC5zaXplID4gMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9IHNlbGVjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoKHZhbHVlID09PSBudWxsKSB8fCAodmFsdWUgPT09IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCdzZWxlY3RFeHRlbnNpb25zJywga28uc2VsZWN0RXh0ZW5zaW9ucyk7XG5rby5leHBvcnRTeW1ib2woJ3NlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlJywga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUpO1xua28uZXhwb3J0U3ltYm9sKCdzZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUnLCBrby5zZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUpO1xua28uZXhwcmVzc2lvblJld3JpdGluZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGphdmFTY3JpcHRSZXNlcnZlZFdvcmRzID0gW1widHJ1ZVwiLCBcImZhbHNlXCIsIFwibnVsbFwiLCBcInVuZGVmaW5lZFwiXTtcblxuICAgIC8vIE1hdGNoZXMgc29tZXRoaW5nIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvLS1laXRoZXIgYW4gaXNvbGF0ZWQgaWRlbnRpZmllciBvciBzb21ldGhpbmcgZW5kaW5nIHdpdGggYSBwcm9wZXJ0eSBhY2Nlc3NvclxuICAgIC8vIFRoaXMgaXMgZGVzaWduZWQgdG8gYmUgc2ltcGxlIGFuZCBhdm9pZCBmYWxzZSBuZWdhdGl2ZXMsIGJ1dCBjb3VsZCBwcm9kdWNlIGZhbHNlIHBvc2l0aXZlcyAoZS5nLiwgYStiLmMpLlxuICAgIC8vIFRoaXMgYWxzbyB3aWxsIG5vdCBwcm9wZXJseSBoYW5kbGUgbmVzdGVkIGJyYWNrZXRzIChlLmcuLCBvYmoxW29iajJbJ3Byb3AnXV07IHNlZSAjOTExKS5cbiAgICB2YXIgamF2YVNjcmlwdEFzc2lnbm1lbnRUYXJnZXQgPSAvXig/OlskX2Etel1bJFxcd10qfCguKykoXFwuXFxzKlskX2Etel1bJFxcd10qfFxcWy4rXFxdKSkkL2k7XG5cbiAgICBmdW5jdGlvbiBnZXRXcml0ZWFibGVWYWx1ZShleHByZXNzaW9uKSB7XG4gICAgICAgIGlmIChrby51dGlscy5hcnJheUluZGV4T2YoamF2YVNjcmlwdFJlc2VydmVkV29yZHMsIGV4cHJlc3Npb24pID49IDApXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBtYXRjaCA9IGV4cHJlc3Npb24ubWF0Y2goamF2YVNjcmlwdEFzc2lnbm1lbnRUYXJnZXQpO1xuICAgICAgICByZXR1cm4gbWF0Y2ggPT09IG51bGwgPyBmYWxzZSA6IG1hdGNoWzFdID8gKCdPYmplY3QoJyArIG1hdGNoWzFdICsgJyknICsgbWF0Y2hbMl0pIDogZXhwcmVzc2lvbjtcbiAgICB9XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMgd2lsbCBiZSB1c2VkIHRvIHNwbGl0IGFuIG9iamVjdC1saXRlcmFsIHN0cmluZyBpbnRvIHRva2Vuc1xuXG4gICAgICAgIC8vIFRoZXNlIHR3byBtYXRjaCBzdHJpbmdzLCBlaXRoZXIgd2l0aCBkb3VibGUgcXVvdGVzIG9yIHNpbmdsZSBxdW90ZXNcbiAgICB2YXIgc3RyaW5nRG91YmxlID0gJ1wiKD86W15cIlxcXFxcXFxcXXxcXFxcXFxcXC4pKlwiJyxcbiAgICAgICAgc3RyaW5nU2luZ2xlID0gXCInKD86W14nXFxcXFxcXFxdfFxcXFxcXFxcLikqJ1wiLFxuICAgICAgICAvLyBNYXRjaGVzIGEgcmVndWxhciBleHByZXNzaW9uICh0ZXh0IGVuY2xvc2VkIGJ5IHNsYXNoZXMpLCBidXQgd2lsbCBhbHNvIG1hdGNoIHNldHMgb2YgZGl2aXNpb25zXG4gICAgICAgIC8vIGFzIGEgcmVndWxhciBleHByZXNzaW9uICh0aGlzIGlzIGhhbmRsZWQgYnkgdGhlIHBhcnNpbmcgbG9vcCBiZWxvdykuXG4gICAgICAgIHN0cmluZ1JlZ2V4cCA9ICcvKD86W14vXFxcXFxcXFxdfFxcXFxcXFxcLikqL1xcdyonLFxuICAgICAgICAvLyBUaGVzZSBjaGFyYWN0ZXJzIGhhdmUgc3BlY2lhbCBtZWFuaW5nIHRvIHRoZSBwYXJzZXIgYW5kIG11c3Qgbm90IGFwcGVhciBpbiB0aGUgbWlkZGxlIG9mIGFcbiAgICAgICAgLy8gdG9rZW4sIGV4Y2VwdCBhcyBwYXJ0IG9mIGEgc3RyaW5nLlxuICAgICAgICBzcGVjaWFscyA9ICcsXCJcXCd7fSgpLzpbXFxcXF0nLFxuICAgICAgICAvLyBNYXRjaCB0ZXh0IChhdCBsZWFzdCB0d28gY2hhcmFjdGVycykgdGhhdCBkb2VzIG5vdCBjb250YWluIGFueSBvZiB0aGUgYWJvdmUgc3BlY2lhbCBjaGFyYWN0ZXJzLFxuICAgICAgICAvLyBhbHRob3VnaCBzb21lIG9mIHRoZSBzcGVjaWFsIGNoYXJhY3RlcnMgYXJlIGFsbG93ZWQgdG8gc3RhcnQgaXQgKGFsbCBidXQgdGhlIGNvbG9uIGFuZCBjb21tYSkuXG4gICAgICAgIC8vIFRoZSB0ZXh0IGNhbiBjb250YWluIHNwYWNlcywgYnV0IGxlYWRpbmcgb3IgdHJhaWxpbmcgc3BhY2VzIGFyZSBza2lwcGVkLlxuICAgICAgICBldmVyeVRoaW5nRWxzZSA9ICdbXlxcXFxzOiwvXVteJyArIHNwZWNpYWxzICsgJ10qW15cXFxccycgKyBzcGVjaWFscyArICddJyxcbiAgICAgICAgLy8gTWF0Y2ggYW55IG5vbi1zcGFjZSBjaGFyYWN0ZXIgbm90IG1hdGNoZWQgYWxyZWFkeS4gVGhpcyB3aWxsIG1hdGNoIGNvbG9ucyBhbmQgY29tbWFzLCBzaW5jZSB0aGV5J3JlXG4gICAgICAgIC8vIG5vdCBtYXRjaGVkIGJ5IFwiZXZlcnlUaGluZ0Vsc2VcIiwgYnV0IHdpbGwgYWxzbyBtYXRjaCBhbnkgb3RoZXIgc2luZ2xlIGNoYXJhY3RlciB0aGF0IHdhc24ndCBhbHJlYWR5XG4gICAgICAgIC8vIG1hdGNoZWQgKGZvciBleGFtcGxlOiBpbiBcImE6IDEsIGI6IDJcIiwgZWFjaCBvZiB0aGUgbm9uLXNwYWNlIGNoYXJhY3RlcnMgd2lsbCBiZSBtYXRjaGVkIGJ5IG9uZU5vdFNwYWNlKS5cbiAgICAgICAgb25lTm90U3BhY2UgPSAnW15cXFxcc10nLFxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgYWN0dWFsIHJlZ3VsYXIgZXhwcmVzc2lvbiBieSBvci1pbmcgdGhlIGFib3ZlIHN0cmluZ3MuIFRoZSBvcmRlciBpcyBpbXBvcnRhbnQuXG4gICAgICAgIGJpbmRpbmdUb2tlbiA9IFJlZ0V4cChzdHJpbmdEb3VibGUgKyAnfCcgKyBzdHJpbmdTaW5nbGUgKyAnfCcgKyBzdHJpbmdSZWdleHAgKyAnfCcgKyBldmVyeVRoaW5nRWxzZSArICd8JyArIG9uZU5vdFNwYWNlLCAnZycpLFxuXG4gICAgICAgIC8vIE1hdGNoIGVuZCBvZiBwcmV2aW91cyB0b2tlbiB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNsYXNoIGlzIGEgZGl2aXNpb24gb3IgcmVnZXguXG4gICAgICAgIGRpdmlzaW9uTG9va0JlaGluZCA9IC9bXFxdKVwiJ0EtWmEtejAtOV8kXSskLyxcbiAgICAgICAga2V5d29yZFJlZ2V4TG9va0JlaGluZCA9IHsnaW4nOjEsJ3JldHVybic6MSwndHlwZW9mJzoxfTtcblxuICAgIGZ1bmN0aW9uIHBhcnNlT2JqZWN0TGl0ZXJhbChvYmplY3RMaXRlcmFsU3RyaW5nKSB7XG4gICAgICAgIC8vIFRyaW0gbGVhZGluZyBhbmQgdHJhaWxpbmcgc3BhY2VzIGZyb20gdGhlIHN0cmluZ1xuICAgICAgICB2YXIgc3RyID0ga28udXRpbHMuc3RyaW5nVHJpbShvYmplY3RMaXRlcmFsU3RyaW5nKTtcblxuICAgICAgICAvLyBUcmltIGJyYWNlcyAneycgc3Vycm91bmRpbmcgdGhlIHdob2xlIG9iamVjdCBsaXRlcmFsXG4gICAgICAgIGlmIChzdHIuY2hhckNvZGVBdCgwKSA9PT0gMTIzKSBzdHIgPSBzdHIuc2xpY2UoMSwgLTEpO1xuXG4gICAgICAgIC8vIFNwbGl0IGludG8gdG9rZW5zXG4gICAgICAgIHZhciByZXN1bHQgPSBbXSwgdG9rcyA9IHN0ci5tYXRjaChiaW5kaW5nVG9rZW4pLCBrZXksIHZhbHVlcyA9IFtdLCBkZXB0aCA9IDA7XG5cbiAgICAgICAgaWYgKHRva3MpIHtcbiAgICAgICAgICAgIC8vIEFwcGVuZCBhIGNvbW1hIHNvIHRoYXQgd2UgZG9uJ3QgbmVlZCBhIHNlcGFyYXRlIGNvZGUgYmxvY2sgdG8gZGVhbCB3aXRoIHRoZSBsYXN0IGl0ZW1cbiAgICAgICAgICAgIHRva3MucHVzaCgnLCcpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgdG9rOyB0b2sgPSB0b2tzW2ldOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IHRvay5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgICAgIC8vIEEgY29tbWEgc2lnbmFscyB0aGUgZW5kIG9mIGEga2V5L3ZhbHVlIHBhaXIgaWYgZGVwdGggaXMgemVyb1xuICAgICAgICAgICAgICAgIGlmIChjID09PSA0NCkgeyAvLyBcIixcIlxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVwdGggPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goKGtleSAmJiB2YWx1ZXMubGVuZ3RoKSA/IHtrZXk6IGtleSwgdmFsdWU6IHZhbHVlcy5qb2luKCcnKX0gOiB7J3Vua25vd24nOiBrZXkgfHwgdmFsdWVzLmpvaW4oJycpfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgPSBkZXB0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2ltcGx5IHNraXAgdGhlIGNvbG9uIHRoYXQgc2VwYXJhdGVzIHRoZSBuYW1lIGFuZCB2YWx1ZVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gNTgpIHsgLy8gXCI6XCJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZXB0aCAmJiAha2V5ICYmIHZhbHVlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9IHZhbHVlcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQSBzZXQgb2Ygc2xhc2hlcyBpcyBpbml0aWFsbHkgbWF0Y2hlZCBhcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiwgYnV0IGNvdWxkIGJlIGRpdmlzaW9uXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSA0NyAmJiBpICYmIHRvay5sZW5ndGggPiAxKSB7ICAvLyBcIi9cIlxuICAgICAgICAgICAgICAgICAgICAvLyBMb29rIGF0IHRoZSBlbmQgb2YgdGhlIHByZXZpb3VzIHRva2VuIHRvIGRldGVybWluZSBpZiB0aGUgc2xhc2ggaXMgYWN0dWFsbHkgZGl2aXNpb25cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gdG9rc1tpLTFdLm1hdGNoKGRpdmlzaW9uTG9va0JlaGluZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAmJiAha2V5d29yZFJlZ2V4TG9va0JlaGluZFttYXRjaFswXV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzbGFzaCBpcyBhY3R1YWxseSBhIGRpdmlzaW9uIHB1bmN0dWF0b3I7IHJlLXBhcnNlIHRoZSByZW1haW5kZXIgb2YgdGhlIHN0cmluZyAobm90IGluY2x1ZGluZyB0aGUgc2xhc2gpXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyKHN0ci5pbmRleE9mKHRvaykgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva3MgPSBzdHIubWF0Y2goYmluZGluZ1Rva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva3MucHVzaCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udGludWUgd2l0aCBqdXN0IHRoZSBzbGFzaFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rID0gJy8nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSW5jcmVtZW50IGRlcHRoIGZvciBwYXJlbnRoZXNlcywgYnJhY2VzLCBhbmQgYnJhY2tldHMgc28gdGhhdCBpbnRlcmlvciBjb21tYXMgYXJlIGlnbm9yZWRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDQwIHx8IGMgPT09IDEyMyB8fCBjID09PSA5MSkgeyAvLyAnKCcsICd7JywgJ1snXG4gICAgICAgICAgICAgICAgICAgICsrZGVwdGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSA0MSB8fCBjID09PSAxMjUgfHwgYyA9PT0gOTMpIHsgLy8gJyknLCAnfScsICddJ1xuICAgICAgICAgICAgICAgICAgICAtLWRlcHRoO1xuICAgICAgICAgICAgICAgIC8vIFRoZSBrZXkgd2lsbCBiZSB0aGUgZmlyc3QgdG9rZW47IGlmIGl0J3MgYSBzdHJpbmcsIHRyaW0gdGhlIHF1b3Rlc1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWtleSAmJiAhdmFsdWVzLmxlbmd0aCAmJiAoYyA9PT0gMzQgfHwgYyA9PT0gMzkpKSB7IC8vICdcIicsIFwiJ1wiXG4gICAgICAgICAgICAgICAgICAgIHRvayA9IHRvay5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHRvayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBUd28td2F5IGJpbmRpbmdzIGluY2x1ZGUgYSB3cml0ZSBmdW5jdGlvbiB0aGF0IGFsbG93IHRoZSBoYW5kbGVyIHRvIHVwZGF0ZSB0aGUgdmFsdWUgZXZlbiBpZiBpdCdzIG5vdCBhbiBvYnNlcnZhYmxlLlxuICAgIHZhciB0d29XYXlCaW5kaW5ncyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gcHJlUHJvY2Vzc0JpbmRpbmdzKGJpbmRpbmdzU3RyaW5nT3JLZXlWYWx1ZUFycmF5LCBiaW5kaW5nT3B0aW9ucykge1xuICAgICAgICBiaW5kaW5nT3B0aW9ucyA9IGJpbmRpbmdPcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NLZXlWYWx1ZShrZXksIHZhbCkge1xuICAgICAgICAgICAgdmFyIHdyaXRhYmxlVmFsO1xuICAgICAgICAgICAgZnVuY3Rpb24gY2FsbFByZXByb2Nlc3NIb29rKG9iaikge1xuICAgICAgICAgICAgICAgIHJldHVybiAob2JqICYmIG9ialsncHJlcHJvY2VzcyddKSA/ICh2YWwgPSBvYmpbJ3ByZXByb2Nlc3MnXSh2YWwsIGtleSwgcHJvY2Vzc0tleVZhbHVlKSkgOiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFiaW5kaW5nUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjYWxsUHJlcHJvY2Vzc0hvb2soa29bJ2dldEJpbmRpbmdIYW5kbGVyJ10oa2V5KSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGlmICh0d29XYXlCaW5kaW5nc1trZXldICYmICh3cml0YWJsZVZhbCA9IGdldFdyaXRlYWJsZVZhbHVlKHZhbCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciB0d28td2F5IGJpbmRpbmdzLCBwcm92aWRlIGEgd3JpdGUgbWV0aG9kIGluIGNhc2UgdGhlIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIC8vIGlzbid0IGEgd3JpdGFibGUgb2JzZXJ2YWJsZS5cbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlBY2Nlc3NvclJlc3VsdFN0cmluZ3MucHVzaChcIidcIiArIGtleSArIFwiJzpmdW5jdGlvbihfeil7XCIgKyB3cml0YWJsZVZhbCArIFwiPV96fVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBWYWx1ZXMgYXJlIHdyYXBwZWQgaW4gYSBmdW5jdGlvbiBzbyB0aGF0IGVhY2ggdmFsdWUgY2FuIGJlIGFjY2Vzc2VkIGluZGVwZW5kZW50bHlcbiAgICAgICAgICAgIGlmIChtYWtlVmFsdWVBY2Nlc3NvcnMpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAnZnVuY3Rpb24oKXtyZXR1cm4gJyArIHZhbCArICcgfSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRTdHJpbmdzLnB1c2goXCInXCIgKyBrZXkgKyBcIic6XCIgKyB2YWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdFN0cmluZ3MgPSBbXSxcbiAgICAgICAgICAgIHByb3BlcnR5QWNjZXNzb3JSZXN1bHRTdHJpbmdzID0gW10sXG4gICAgICAgICAgICBtYWtlVmFsdWVBY2Nlc3NvcnMgPSBiaW5kaW5nT3B0aW9uc1sndmFsdWVBY2Nlc3NvcnMnXSxcbiAgICAgICAgICAgIGJpbmRpbmdQYXJhbXMgPSBiaW5kaW5nT3B0aW9uc1snYmluZGluZ1BhcmFtcyddLFxuICAgICAgICAgICAga2V5VmFsdWVBcnJheSA9IHR5cGVvZiBiaW5kaW5nc1N0cmluZ09yS2V5VmFsdWVBcnJheSA9PT0gXCJzdHJpbmdcIiA/XG4gICAgICAgICAgICAgICAgcGFyc2VPYmplY3RMaXRlcmFsKGJpbmRpbmdzU3RyaW5nT3JLZXlWYWx1ZUFycmF5KSA6IGJpbmRpbmdzU3RyaW5nT3JLZXlWYWx1ZUFycmF5O1xuXG4gICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChrZXlWYWx1ZUFycmF5LCBmdW5jdGlvbihrZXlWYWx1ZSkge1xuICAgICAgICAgICAgcHJvY2Vzc0tleVZhbHVlKGtleVZhbHVlLmtleSB8fCBrZXlWYWx1ZVsndW5rbm93biddLCBrZXlWYWx1ZS52YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eUFjY2Vzc29yUmVzdWx0U3RyaW5ncy5sZW5ndGgpXG4gICAgICAgICAgICBwcm9jZXNzS2V5VmFsdWUoJ19rb19wcm9wZXJ0eV93cml0ZXJzJywgXCJ7XCIgKyBwcm9wZXJ0eUFjY2Vzc29yUmVzdWx0U3RyaW5ncy5qb2luKFwiLFwiKSArIFwiIH1cIik7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFN0cmluZ3Muam9pbihcIixcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmluZGluZ1Jld3JpdGVWYWxpZGF0b3JzOiBbXSxcblxuICAgICAgICB0d29XYXlCaW5kaW5nczogdHdvV2F5QmluZGluZ3MsXG5cbiAgICAgICAgcGFyc2VPYmplY3RMaXRlcmFsOiBwYXJzZU9iamVjdExpdGVyYWwsXG5cbiAgICAgICAgcHJlUHJvY2Vzc0JpbmRpbmdzOiBwcmVQcm9jZXNzQmluZGluZ3MsXG5cbiAgICAgICAga2V5VmFsdWVBcnJheUNvbnRhaW5zS2V5OiBmdW5jdGlvbihrZXlWYWx1ZUFycmF5LCBrZXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsdWVBcnJheS5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICBpZiAoa2V5VmFsdWVBcnJheVtpXVsna2V5J10gPT0ga2V5KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBJbnRlcm5hbCwgcHJpdmF0ZSBLTyB1dGlsaXR5IGZvciB1cGRhdGluZyBtb2RlbCBwcm9wZXJ0aWVzIGZyb20gd2l0aGluIGJpbmRpbmdzXG4gICAgICAgIC8vIHByb3BlcnR5OiAgICAgICAgICAgIElmIHRoZSBwcm9wZXJ0eSBiZWluZyB1cGRhdGVkIGlzIChvciBtaWdodCBiZSkgYW4gb2JzZXJ2YWJsZSwgcGFzcyBpdCBoZXJlXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIElmIGl0IHR1cm5zIG91dCB0byBiZSBhIHdyaXRhYmxlIG9ic2VydmFibGUsIGl0IHdpbGwgYmUgd3JpdHRlbiB0byBkaXJlY3RseVxuICAgICAgICAvLyBhbGxCaW5kaW5nczogICAgICAgICBBbiBvYmplY3Qgd2l0aCBhIGdldCBtZXRob2QgdG8gcmV0cmlldmUgYmluZGluZ3MgaW4gdGhlIGN1cnJlbnQgZXhlY3V0aW9uIGNvbnRleHQuXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIFRoaXMgd2lsbCBiZSBzZWFyY2hlZCBmb3IgYSAnX2tvX3Byb3BlcnR5X3dyaXRlcnMnIHByb3BlcnR5IGluIGNhc2UgeW91J3JlIHdyaXRpbmcgdG8gYSBub24tb2JzZXJ2YWJsZVxuICAgICAgICAvLyBrZXk6ICAgICAgICAgICAgICAgICBUaGUga2V5IGlkZW50aWZ5aW5nIHRoZSBwcm9wZXJ0eSB0byBiZSB3cml0dGVuLiBFeGFtcGxlOiBmb3IgeyBoYXNGb2N1czogbXlWYWx1ZSB9LCB3cml0ZSB0byAnbXlWYWx1ZScgYnkgc3BlY2lmeWluZyB0aGUga2V5ICdoYXNGb2N1cydcbiAgICAgICAgLy8gdmFsdWU6ICAgICAgICAgICAgICAgVGhlIHZhbHVlIHRvIGJlIHdyaXR0ZW5cbiAgICAgICAgLy8gY2hlY2tJZkRpZmZlcmVudDogICAgSWYgdHJ1ZSwgYW5kIGlmIHRoZSBwcm9wZXJ0eSBiZWluZyB3cml0dGVuIGlzIGEgd3JpdGFibGUgb2JzZXJ2YWJsZSwgdGhlIHZhbHVlIHdpbGwgb25seSBiZSB3cml0dGVuIGlmXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIGl0IGlzICE9PSBleGlzdGluZyB2YWx1ZSBvbiB0aGF0IHdyaXRhYmxlIG9ic2VydmFibGVcbiAgICAgICAgd3JpdGVWYWx1ZVRvUHJvcGVydHk6IGZ1bmN0aW9uKHByb3BlcnR5LCBhbGxCaW5kaW5ncywga2V5LCB2YWx1ZSwgY2hlY2tJZkRpZmZlcmVudCkge1xuICAgICAgICAgICAgaWYgKCFwcm9wZXJ0eSB8fCAha28uaXNPYnNlcnZhYmxlKHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wV3JpdGVycyA9IGFsbEJpbmRpbmdzLmdldCgnX2tvX3Byb3BlcnR5X3dyaXRlcnMnKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvcFdyaXRlcnMgJiYgcHJvcFdyaXRlcnNba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgcHJvcFdyaXRlcnNba2V5XSh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtvLmlzV3JpdGVhYmxlT2JzZXJ2YWJsZShwcm9wZXJ0eSkgJiYgKCFjaGVja0lmRGlmZmVyZW50IHx8IHByb3BlcnR5LnBlZWsoKSAhPT0gdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHkodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgnZXhwcmVzc2lvblJld3JpdGluZycsIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcpO1xua28uZXhwb3J0U3ltYm9sKCdleHByZXNzaW9uUmV3cml0aW5nLmJpbmRpbmdSZXdyaXRlVmFsaWRhdG9ycycsIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcuYmluZGluZ1Jld3JpdGVWYWxpZGF0b3JzKTtcbmtvLmV4cG9ydFN5bWJvbCgnZXhwcmVzc2lvblJld3JpdGluZy5wYXJzZU9iamVjdExpdGVyYWwnLCBrby5leHByZXNzaW9uUmV3cml0aW5nLnBhcnNlT2JqZWN0TGl0ZXJhbCk7XG5rby5leHBvcnRTeW1ib2woJ2V4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzJywga28uZXhwcmVzc2lvblJld3JpdGluZy5wcmVQcm9jZXNzQmluZGluZ3MpO1xuXG4vLyBNYWtpbmcgYmluZGluZ3MgZXhwbGljaXRseSBkZWNsYXJlIHRoZW1zZWx2ZXMgYXMgXCJ0d28gd2F5XCIgaXNuJ3QgaWRlYWwgaW4gdGhlIGxvbmcgdGVybSAoaXQgd291bGQgYmUgYmV0dGVyIGlmXG4vLyBhbGwgYmluZGluZ3MgY291bGQgdXNlIGFuIG9mZmljaWFsICdwcm9wZXJ0eSB3cml0ZXInIEFQSSB3aXRob3V0IG5lZWRpbmcgdG8gZGVjbGFyZSB0aGF0IHRoZXkgbWlnaHQpLiBIb3dldmVyLFxuLy8gc2luY2UgdGhpcyBpcyBub3QsIGFuZCBoYXMgbmV2ZXIgYmVlbiwgYSBwdWJsaWMgQVBJIChfa29fcHJvcGVydHlfd3JpdGVycyB3YXMgbmV2ZXIgZG9jdW1lbnRlZCksIGl0J3MgYWNjZXB0YWJsZVxuLy8gYXMgYW4gaW50ZXJuYWwgaW1wbGVtZW50YXRpb24gZGV0YWlsIGluIHRoZSBzaG9ydCB0ZXJtLlxuLy8gRm9yIHRob3NlIGRldmVsb3BlcnMgd2hvIHJlbHkgb24gX2tvX3Byb3BlcnR5X3dyaXRlcnMgaW4gdGhlaXIgY3VzdG9tIGJpbmRpbmdzLCB3ZSBleHBvc2UgX3R3b1dheUJpbmRpbmdzIGFzIGFuXG4vLyB1bmRvY3VtZW50ZWQgZmVhdHVyZSB0aGF0IG1ha2VzIGl0IHJlbGF0aXZlbHkgZWFzeSB0byB1cGdyYWRlIHRvIEtPIDMuMC4gSG93ZXZlciwgdGhpcyBpcyBzdGlsbCBub3QgYW4gb2ZmaWNpYWxcbi8vIHB1YmxpYyBBUEksIGFuZCB3ZSByZXNlcnZlIHRoZSByaWdodCB0byByZW1vdmUgaXQgYXQgYW55IHRpbWUgaWYgd2UgY3JlYXRlIGEgcmVhbCBwdWJsaWMgcHJvcGVydHkgd3JpdGVycyBBUEkuXG5rby5leHBvcnRTeW1ib2woJ2V4cHJlc3Npb25SZXdyaXRpbmcuX3R3b1dheUJpbmRpbmdzJywga28uZXhwcmVzc2lvblJld3JpdGluZy50d29XYXlCaW5kaW5ncyk7XG5cbi8vIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCBkZWZpbmUgdGhlIGZvbGxvd2luZyBhbGlhc2VzLiAoUHJldmlvdXNseSwgdGhlc2UgZnVuY3Rpb24gbmFtZXMgd2VyZSBtaXNsZWFkaW5nIGJlY2F1c2Vcbi8vIHRoZXkgcmVmZXJyZWQgdG8gSlNPTiBzcGVjaWZpY2FsbHksIGV2ZW4gdGhvdWdoIHRoZXkgYWN0dWFsbHkgd29yayB3aXRoIGFyYml0cmFyeSBKYXZhU2NyaXB0IG9iamVjdCBsaXRlcmFsIGV4cHJlc3Npb25zLilcbmtvLmV4cG9ydFN5bWJvbCgnanNvbkV4cHJlc3Npb25SZXdyaXRpbmcnLCBrby5leHByZXNzaW9uUmV3cml0aW5nKTtcbmtvLmV4cG9ydFN5bWJvbCgnanNvbkV4cHJlc3Npb25SZXdyaXRpbmcuaW5zZXJ0UHJvcGVydHlBY2Nlc3NvcnNJbnRvSnNvbicsIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzKTtcbihmdW5jdGlvbigpIHtcbiAgICAvLyBcIlZpcnR1YWwgZWxlbWVudHNcIiBpcyBhbiBhYnN0cmFjdGlvbiBvbiB0b3Agb2YgdGhlIHVzdWFsIERPTSBBUEkgd2hpY2ggdW5kZXJzdGFuZHMgdGhlIG5vdGlvbiB0aGF0IGNvbW1lbnQgbm9kZXNcbiAgICAvLyBtYXkgYmUgdXNlZCB0byByZXByZXNlbnQgaGllcmFyY2h5IChpbiBhZGRpdGlvbiB0byB0aGUgRE9NJ3MgbmF0dXJhbCBoaWVyYXJjaHkpLlxuICAgIC8vIElmIHlvdSBjYWxsIHRoZSBET00tbWFuaXB1bGF0aW5nIGZ1bmN0aW9ucyBvbiBrby52aXJ0dWFsRWxlbWVudHMsIHlvdSB3aWxsIGJlIGFibGUgdG8gcmVhZCBhbmQgd3JpdGUgdGhlIHN0YXRlXG4gICAgLy8gb2YgdGhhdCB2aXJ0dWFsIGhpZXJhcmNoeVxuICAgIC8vXG4gICAgLy8gVGhlIHBvaW50IG9mIGFsbCB0aGlzIGlzIHRvIHN1cHBvcnQgY29udGFpbmVybGVzcyB0ZW1wbGF0ZXMgKGUuZy4sIDwhLS0ga28gZm9yZWFjaDpzb21lQ29sbGVjdGlvbiAtLT5ibGFoPCEtLSAva28gLS0+KVxuICAgIC8vIHdpdGhvdXQgaGF2aW5nIHRvIHNjYXR0ZXIgc3BlY2lhbCBjYXNlcyBhbGwgb3ZlciB0aGUgYmluZGluZyBhbmQgdGVtcGxhdGluZyBjb2RlLlxuXG4gICAgLy8gSUUgOSBjYW5ub3QgcmVsaWFibHkgcmVhZCB0aGUgXCJub2RlVmFsdWVcIiBwcm9wZXJ0eSBvZiBhIGNvbW1lbnQgbm9kZSAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvMTg2KVxuICAgIC8vIGJ1dCBpdCBkb2VzIGdpdmUgdGhlbSBhIG5vbnN0YW5kYXJkIGFsdGVybmF0aXZlIHByb3BlcnR5IGNhbGxlZCBcInRleHRcIiB0aGF0IGl0IGNhbiByZWFkIHJlbGlhYmx5LiBPdGhlciBicm93c2VycyBkb24ndCBoYXZlIHRoYXQgcHJvcGVydHkuXG4gICAgLy8gU28sIHVzZSBub2RlLnRleHQgd2hlcmUgYXZhaWxhYmxlLCBhbmQgbm9kZS5ub2RlVmFsdWUgZWxzZXdoZXJlXG4gICAgdmFyIGNvbW1lbnROb2Rlc0hhdmVUZXh0UHJvcGVydHkgPSBkb2N1bWVudCAmJiBkb2N1bWVudC5jcmVhdGVDb21tZW50KFwidGVzdFwiKS50ZXh0ID09PSBcIjwhLS10ZXN0LS0+XCI7XG5cbiAgICB2YXIgc3RhcnRDb21tZW50UmVnZXggPSBjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gL148IS0tXFxzKmtvKD86XFxzKyhbXFxzXFxTXSspKT9cXHMqLS0+JC8gOiAvXlxccyprbyg/OlxccysoW1xcc1xcU10rKSk/XFxzKiQvO1xuICAgIHZhciBlbmRDb21tZW50UmVnZXggPSAgIGNvbW1lbnROb2Rlc0hhdmVUZXh0UHJvcGVydHkgPyAvXjwhLS1cXHMqXFwva29cXHMqLS0+JC8gOiAvXlxccypcXC9rb1xccyokLztcbiAgICB2YXIgaHRtbFRhZ3NXaXRoT3B0aW9uYWxseUNsb3NpbmdDaGlsZHJlbiA9IHsgJ3VsJzogdHJ1ZSwgJ29sJzogdHJ1ZSB9O1xuXG4gICAgZnVuY3Rpb24gaXNTdGFydENvbW1lbnQobm9kZSkge1xuICAgICAgICByZXR1cm4gKG5vZGUubm9kZVR5cGUgPT0gOCkgJiYgc3RhcnRDb21tZW50UmVnZXgudGVzdChjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gbm9kZS50ZXh0IDogbm9kZS5ub2RlVmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRW5kQ29tbWVudChub2RlKSB7XG4gICAgICAgIHJldHVybiAobm9kZS5ub2RlVHlwZSA9PSA4KSAmJiBlbmRDb21tZW50UmVnZXgudGVzdChjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gbm9kZS50ZXh0IDogbm9kZS5ub2RlVmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFZpcnR1YWxDaGlsZHJlbihzdGFydENvbW1lbnQsIGFsbG93VW5iYWxhbmNlZCkge1xuICAgICAgICB2YXIgY3VycmVudE5vZGUgPSBzdGFydENvbW1lbnQ7XG4gICAgICAgIHZhciBkZXB0aCA9IDE7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuICAgICAgICB3aGlsZSAoY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0U2libGluZykge1xuICAgICAgICAgICAgaWYgKGlzRW5kQ29tbWVudChjdXJyZW50Tm9kZSkpIHtcbiAgICAgICAgICAgICAgICBkZXB0aC0tO1xuICAgICAgICAgICAgICAgIGlmIChkZXB0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGN1cnJlbnROb2RlKTtcblxuICAgICAgICAgICAgaWYgKGlzU3RhcnRDb21tZW50KGN1cnJlbnROb2RlKSlcbiAgICAgICAgICAgICAgICBkZXB0aCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYWxsb3dVbmJhbGFuY2VkKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgY2xvc2luZyBjb21tZW50IHRhZyB0byBtYXRjaDogXCIgKyBzdGFydENvbW1lbnQubm9kZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TWF0Y2hpbmdFbmRDb21tZW50KHN0YXJ0Q29tbWVudCwgYWxsb3dVbmJhbGFuY2VkKSB7XG4gICAgICAgIHZhciBhbGxWaXJ0dWFsQ2hpbGRyZW4gPSBnZXRWaXJ0dWFsQ2hpbGRyZW4oc3RhcnRDb21tZW50LCBhbGxvd1VuYmFsYW5jZWQpO1xuICAgICAgICBpZiAoYWxsVmlydHVhbENoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoYWxsVmlydHVhbENoaWxkcmVuLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFsbFZpcnR1YWxDaGlsZHJlblthbGxWaXJ0dWFsQ2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICByZXR1cm4gc3RhcnRDb21tZW50Lm5leHRTaWJsaW5nO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBNdXN0IGhhdmUgbm8gbWF0Y2hpbmcgZW5kIGNvbW1lbnQsIGFuZCBhbGxvd1VuYmFsYW5jZWQgaXMgdHJ1ZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFVuYmFsYW5jZWRDaGlsZFRhZ3Mobm9kZSkge1xuICAgICAgICAvLyBlLmcuLCBmcm9tIDxkaXY+T0s8L2Rpdj48IS0tIGtvIGJsYWggLS0+PHNwYW4+QW5vdGhlcjwvc3Bhbj4sIHJldHVybnM6IDwhLS0ga28gYmxhaCAtLT48c3Bhbj5Bbm90aGVyPC9zcGFuPlxuICAgICAgICAvLyAgICAgICBmcm9tIDxkaXY+T0s8L2Rpdj48IS0tIC9rbyAtLT48IS0tIC9rbyAtLT4sICAgICAgICAgICAgIHJldHVybnM6IDwhLS0gL2tvIC0tPjwhLS0gL2tvIC0tPlxuICAgICAgICB2YXIgY2hpbGROb2RlID0gbm9kZS5maXJzdENoaWxkLCBjYXB0dXJlUmVtYWluaW5nID0gbnVsbDtcbiAgICAgICAgaWYgKGNoaWxkTm9kZSkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChjYXB0dXJlUmVtYWluaW5nKSAgICAgICAgICAgICAgICAgICAvLyBXZSBhbHJlYWR5IGhpdCBhbiB1bmJhbGFuY2VkIG5vZGUgYW5kIGFyZSBub3cganVzdCBzY29vcGluZyB1cCBhbGwgc3Vic2VxdWVudCBub2Rlc1xuICAgICAgICAgICAgICAgICAgICBjYXB0dXJlUmVtYWluaW5nLnB1c2goY2hpbGROb2RlKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc1N0YXJ0Q29tbWVudChjaGlsZE5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaGluZ0VuZENvbW1lbnQgPSBnZXRNYXRjaGluZ0VuZENvbW1lbnQoY2hpbGROb2RlLCAvKiBhbGxvd1VuYmFsYW5jZWQ6ICovIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2hpbmdFbmRDb21tZW50KSAgICAgICAgICAgICAvLyBJdCdzIGEgYmFsYW5jZWQgdGFnLCBzbyBza2lwIGltbWVkaWF0ZWx5IHRvIHRoZSBlbmQgb2YgdGhpcyB2aXJ0dWFsIHNldFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gbWF0Y2hpbmdFbmRDb21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXB0dXJlUmVtYWluaW5nID0gW2NoaWxkTm9kZV07IC8vIEl0J3MgdW5iYWxhbmNlZCwgc28gc3RhcnQgY2FwdHVyaW5nIGZyb20gdGhpcyBwb2ludFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNFbmRDb21tZW50KGNoaWxkTm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZVJlbWFpbmluZyA9IFtjaGlsZE5vZGVdOyAgICAgLy8gSXQncyB1bmJhbGFuY2VkIChpZiBpdCB3YXNuJ3QsIHdlJ2QgaGF2ZSBza2lwcGVkIG92ZXIgaXQgYWxyZWFkeSksIHNvIHN0YXJ0IGNhcHR1cmluZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gd2hpbGUgKGNoaWxkTm9kZSA9IGNoaWxkTm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhcHR1cmVSZW1haW5pbmc7XG4gICAgfVxuXG4gICAga28udmlydHVhbEVsZW1lbnRzID0ge1xuICAgICAgICBhbGxvd2VkQmluZGluZ3M6IHt9LFxuXG4gICAgICAgIGNoaWxkTm9kZXM6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBpc1N0YXJ0Q29tbWVudChub2RlKSA/IGdldFZpcnR1YWxDaGlsZHJlbihub2RlKSA6IG5vZGUuY2hpbGROb2RlcztcbiAgICAgICAgfSxcblxuICAgICAgICBlbXB0eU5vZGU6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghaXNTdGFydENvbW1lbnQobm9kZSkpXG4gICAgICAgICAgICAgICAga28udXRpbHMuZW1wdHlEb21Ob2RlKG5vZGUpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpcnR1YWxDaGlsZHJlbiA9IGtvLnZpcnR1YWxFbGVtZW50cy5jaGlsZE5vZGVzKG5vZGUpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdmlydHVhbENoaWxkcmVuLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICAgICAga28ucmVtb3ZlTm9kZSh2aXJ0dWFsQ2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldERvbU5vZGVDaGlsZHJlbjogZnVuY3Rpb24obm9kZSwgY2hpbGROb2Rlcykge1xuICAgICAgICAgICAgaWYgKCFpc1N0YXJ0Q29tbWVudChub2RlKSlcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXREb21Ob2RlQ2hpbGRyZW4obm9kZSwgY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIHZhciBlbmRDb21tZW50Tm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7IC8vIE11c3QgYmUgdGhlIG5leHQgc2libGluZywgYXMgd2UganVzdCBlbXB0aWVkIHRoZSBjaGlsZHJlblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gY2hpbGROb2Rlcy5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgICAgIGVuZENvbW1lbnROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGNoaWxkTm9kZXNbaV0sIGVuZENvbW1lbnROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwcmVwZW5kOiBmdW5jdGlvbihjb250YWluZXJOb2RlLCBub2RlVG9QcmVwZW5kKSB7XG4gICAgICAgICAgICBpZiAoIWlzU3RhcnRDb21tZW50KGNvbnRhaW5lck5vZGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lck5vZGUuZmlyc3RDaGlsZClcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5pbnNlcnRCZWZvcmUobm9kZVRvUHJlcGVuZCwgY29udGFpbmVyTm9kZS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUuYXBwZW5kQ2hpbGQobm9kZVRvUHJlcGVuZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IGNvbW1lbnRzIG11c3QgYWx3YXlzIGhhdmUgYSBwYXJlbnQgYW5kIGF0IGxlYXN0IG9uZSBmb2xsb3dpbmcgc2libGluZyAodGhlIGVuZCBjb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZVRvUHJlcGVuZCwgY29udGFpbmVyTm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0QWZ0ZXI6IGZ1bmN0aW9uKGNvbnRhaW5lck5vZGUsIG5vZGVUb0luc2VydCwgaW5zZXJ0QWZ0ZXJOb2RlKSB7XG4gICAgICAgICAgICBpZiAoIWluc2VydEFmdGVyTm9kZSkge1xuICAgICAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5wcmVwZW5kKGNvbnRhaW5lck5vZGUsIG5vZGVUb0luc2VydCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc1N0YXJ0Q29tbWVudChjb250YWluZXJOb2RlKSkge1xuICAgICAgICAgICAgICAgIC8vIEluc2VydCBhZnRlciBpbnNlcnRpb24gcG9pbnRcbiAgICAgICAgICAgICAgICBpZiAoaW5zZXJ0QWZ0ZXJOb2RlLm5leHRTaWJsaW5nKVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLmluc2VydEJlZm9yZShub2RlVG9JbnNlcnQsIGluc2VydEFmdGVyTm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLmFwcGVuZENoaWxkKG5vZGVUb0luc2VydCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENoaWxkcmVuIG9mIHN0YXJ0IGNvbW1lbnRzIG11c3QgYWx3YXlzIGhhdmUgYSBwYXJlbnQgYW5kIGF0IGxlYXN0IG9uZSBmb2xsb3dpbmcgc2libGluZyAodGhlIGVuZCBjb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZVRvSW5zZXJ0LCBpbnNlcnRBZnRlck5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpcnN0Q2hpbGQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghaXNTdGFydENvbW1lbnQobm9kZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIGlmICghbm9kZS5uZXh0U2libGluZyB8fCBpc0VuZENvbW1lbnQobm9kZS5uZXh0U2libGluZykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0U2libGluZzogZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgaWYgKGlzU3RhcnRDb21tZW50KG5vZGUpKVxuICAgICAgICAgICAgICAgIG5vZGUgPSBnZXRNYXRjaGluZ0VuZENvbW1lbnQobm9kZSk7XG4gICAgICAgICAgICBpZiAobm9kZS5uZXh0U2libGluZyAmJiBpc0VuZENvbW1lbnQobm9kZS5uZXh0U2libGluZykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNCaW5kaW5nVmFsdWU6IGlzU3RhcnRDb21tZW50LFxuXG4gICAgICAgIHZpcnR1YWxOb2RlQmluZGluZ1ZhbHVlOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICB2YXIgcmVnZXhNYXRjaCA9IChjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gbm9kZS50ZXh0IDogbm9kZS5ub2RlVmFsdWUpLm1hdGNoKHN0YXJ0Q29tbWVudFJlZ2V4KTtcbiAgICAgICAgICAgIHJldHVybiByZWdleE1hdGNoID8gcmVnZXhNYXRjaFsxXSA6IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9ybWFsaXNlVmlydHVhbEVsZW1lbnREb21TdHJ1Y3R1cmU6IGZ1bmN0aW9uKGVsZW1lbnRWZXJpZmllZCkge1xuICAgICAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L2lzc3Vlcy8xNTVcbiAgICAgICAgICAgIC8vIChJRSA8PSA4IG9yIElFIDkgcXVpcmtzIG1vZGUgcGFyc2VzIHlvdXIgSFRNTCB3ZWlyZGx5LCB0cmVhdGluZyBjbG9zaW5nIDwvbGk+IHRhZ3MgYXMgaWYgdGhleSBkb24ndCBleGlzdCwgdGhlcmVieSBtb3ZpbmcgY29tbWVudCBub2Rlc1xuICAgICAgICAgICAgLy8gdGhhdCBhcmUgZGlyZWN0IGRlc2NlbmRhbnRzIG9mIDx1bD4gaW50byB0aGUgcHJlY2VkaW5nIDxsaT4pXG4gICAgICAgICAgICBpZiAoIWh0bWxUYWdzV2l0aE9wdGlvbmFsbHlDbG9zaW5nQ2hpbGRyZW5ba28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnRWZXJpZmllZCldKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgLy8gU2NhbiBpbW1lZGlhdGUgY2hpbGRyZW4gdG8gc2VlIGlmIHRoZXkgY29udGFpbiB1bmJhbGFuY2VkIGNvbW1lbnQgdGFncy4gSWYgdGhleSBkbywgdGhvc2UgY29tbWVudCB0YWdzXG4gICAgICAgICAgICAvLyBtdXN0IGJlIGludGVuZGVkIHRvIGFwcGVhciAqYWZ0ZXIqIHRoYXQgY2hpbGQsIHNvIG1vdmUgdGhlbSB0aGVyZS5cbiAgICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBlbGVtZW50VmVyaWZpZWQuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIGlmIChjaGlsZE5vZGUpIHtcbiAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1bmJhbGFuY2VkVGFncyA9IGdldFVuYmFsYW5jZWRDaGlsZFRhZ3MoY2hpbGROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bmJhbGFuY2VkVGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpeCB1cCB0aGUgRE9NIGJ5IG1vdmluZyB0aGUgdW5iYWxhbmNlZCB0YWdzIHRvIHdoZXJlIHRoZXkgbW9zdCBsaWtlbHkgd2VyZSBpbnRlbmRlZCB0byBiZSBwbGFjZWQgLSAqYWZ0ZXIqIHRoZSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlVG9JbnNlcnRCZWZvcmUgPSBjaGlsZE5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bmJhbGFuY2VkVGFncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZVRvSW5zZXJ0QmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFZlcmlmaWVkLmluc2VydEJlZm9yZSh1bmJhbGFuY2VkVGFnc1tpXSwgbm9kZVRvSW5zZXJ0QmVmb3JlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFZlcmlmaWVkLmFwcGVuZENoaWxkKHVuYmFsYW5jZWRUYWdzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IHdoaWxlIChjaGlsZE5vZGUgPSBjaGlsZE5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cycsIGtvLnZpcnR1YWxFbGVtZW50cyk7XG5rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cy5hbGxvd2VkQmluZGluZ3MnLCBrby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzKTtcbmtvLmV4cG9ydFN5bWJvbCgndmlydHVhbEVsZW1lbnRzLmVtcHR5Tm9kZScsIGtvLnZpcnR1YWxFbGVtZW50cy5lbXB0eU5vZGUpO1xuLy9rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkJywga28udmlydHVhbEVsZW1lbnRzLmZpcnN0Q2hpbGQpOyAgICAgLy8gZmlyc3RDaGlsZCBpcyBub3QgbWluaWZpZWRcbmtvLmV4cG9ydFN5bWJvbCgndmlydHVhbEVsZW1lbnRzLmluc2VydEFmdGVyJywga28udmlydHVhbEVsZW1lbnRzLmluc2VydEFmdGVyKTtcbi8va28uZXhwb3J0U3ltYm9sKCd2aXJ0dWFsRWxlbWVudHMubmV4dFNpYmxpbmcnLCBrby52aXJ0dWFsRWxlbWVudHMubmV4dFNpYmxpbmcpOyAgIC8vIG5leHRTaWJsaW5nIGlzIG5vdCBtaW5pZmllZFxua28uZXhwb3J0U3ltYm9sKCd2aXJ0dWFsRWxlbWVudHMucHJlcGVuZCcsIGtvLnZpcnR1YWxFbGVtZW50cy5wcmVwZW5kKTtcbmtvLmV4cG9ydFN5bWJvbCgndmlydHVhbEVsZW1lbnRzLnNldERvbU5vZGVDaGlsZHJlbicsIGtvLnZpcnR1YWxFbGVtZW50cy5zZXREb21Ob2RlQ2hpbGRyZW4pO1xuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZhdWx0QmluZGluZ0F0dHJpYnV0ZU5hbWUgPSBcImRhdGEtYmluZFwiO1xuXG4gICAga28uYmluZGluZ1Byb3ZpZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuYmluZGluZ0NhY2hlID0ge307XG4gICAgfTtcblxuICAgIGtvLnV0aWxzLmV4dGVuZChrby5iaW5kaW5nUHJvdmlkZXIucHJvdG90eXBlLCB7XG4gICAgICAgICdub2RlSGFzQmluZGluZ3MnOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IC8vIEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuZ2V0QXR0cmlidXRlKGRlZmF1bHRCaW5kaW5nQXR0cmlidXRlTmFtZSkgIT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwga28uY29tcG9uZW50c1snZ2V0Q29tcG9uZW50TmFtZUZvck5vZGUnXShub2RlKTtcbiAgICAgICAgICAgICAgICBjYXNlIDg6IC8vIENvbW1lbnQgbm9kZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga28udmlydHVhbEVsZW1lbnRzLmhhc0JpbmRpbmdWYWx1ZShub2RlKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgJ2dldEJpbmRpbmdzJzogZnVuY3Rpb24obm9kZSwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBiaW5kaW5nc1N0cmluZyA9IHRoaXNbJ2dldEJpbmRpbmdzU3RyaW5nJ10obm9kZSwgYmluZGluZ0NvbnRleHQpLFxuICAgICAgICAgICAgICAgIHBhcnNlZEJpbmRpbmdzID0gYmluZGluZ3NTdHJpbmcgPyB0aGlzWydwYXJzZUJpbmRpbmdzU3RyaW5nJ10oYmluZGluZ3NTdHJpbmcsIGJpbmRpbmdDb250ZXh0LCBub2RlKSA6IG51bGw7XG4gICAgICAgICAgICByZXR1cm4ga28uY29tcG9uZW50cy5hZGRCaW5kaW5nc0ZvckN1c3RvbUVsZW1lbnQocGFyc2VkQmluZGluZ3MsIG5vZGUsIGJpbmRpbmdDb250ZXh0LCAvKiB2YWx1ZUFjY2Vzc29ycyAqLyBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgJ2dldEJpbmRpbmdBY2Nlc3NvcnMnOiBmdW5jdGlvbihub2RlLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAgICAgdmFyIGJpbmRpbmdzU3RyaW5nID0gdGhpc1snZ2V0QmluZGluZ3NTdHJpbmcnXShub2RlLCBiaW5kaW5nQ29udGV4dCksXG4gICAgICAgICAgICAgICAgcGFyc2VkQmluZGluZ3MgPSBiaW5kaW5nc1N0cmluZyA/IHRoaXNbJ3BhcnNlQmluZGluZ3NTdHJpbmcnXShiaW5kaW5nc1N0cmluZywgYmluZGluZ0NvbnRleHQsIG5vZGUsIHsgJ3ZhbHVlQWNjZXNzb3JzJzogdHJ1ZSB9KSA6IG51bGw7XG4gICAgICAgICAgICByZXR1cm4ga28uY29tcG9uZW50cy5hZGRCaW5kaW5nc0ZvckN1c3RvbUVsZW1lbnQocGFyc2VkQmluZGluZ3MsIG5vZGUsIGJpbmRpbmdDb250ZXh0LCAvKiB2YWx1ZUFjY2Vzc29ycyAqLyB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoaXMgZGVmYXVsdCBwcm92aWRlci5cbiAgICAgICAgLy8gSXQncyBub3QgcGFydCBvZiB0aGUgaW50ZXJmYWNlIGRlZmluaXRpb24gZm9yIGEgZ2VuZXJhbCBiaW5kaW5nIHByb3ZpZGVyLlxuICAgICAgICAnZ2V0QmluZGluZ3NTdHJpbmcnOiBmdW5jdGlvbihub2RlLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAgICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gbm9kZS5nZXRBdHRyaWJ1dGUoZGVmYXVsdEJpbmRpbmdBdHRyaWJ1dGVOYW1lKTsgICAvLyBFbGVtZW50XG4gICAgICAgICAgICAgICAgY2FzZSA4OiByZXR1cm4ga28udmlydHVhbEVsZW1lbnRzLnZpcnR1YWxOb2RlQmluZGluZ1ZhbHVlKG5vZGUpOyAvLyBDb21tZW50IG5vZGVcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoaXMgZGVmYXVsdCBwcm92aWRlci5cbiAgICAgICAgLy8gSXQncyBub3QgcGFydCBvZiB0aGUgaW50ZXJmYWNlIGRlZmluaXRpb24gZm9yIGEgZ2VuZXJhbCBiaW5kaW5nIHByb3ZpZGVyLlxuICAgICAgICAncGFyc2VCaW5kaW5nc1N0cmluZyc6IGZ1bmN0aW9uKGJpbmRpbmdzU3RyaW5nLCBiaW5kaW5nQ29udGV4dCwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ0Z1bmN0aW9uID0gY3JlYXRlQmluZGluZ3NTdHJpbmdFdmFsdWF0b3JWaWFDYWNoZShiaW5kaW5nc1N0cmluZywgdGhpcy5iaW5kaW5nQ2FjaGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBiaW5kaW5nRnVuY3Rpb24oYmluZGluZ0NvbnRleHQsIG5vZGUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBleC5tZXNzYWdlID0gXCJVbmFibGUgdG8gcGFyc2UgYmluZGluZ3MuXFxuQmluZGluZ3MgdmFsdWU6IFwiICsgYmluZGluZ3NTdHJpbmcgKyBcIlxcbk1lc3NhZ2U6IFwiICsgZXgubWVzc2FnZTtcbiAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddID0gbmV3IGtvLmJpbmRpbmdQcm92aWRlcigpO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlQmluZGluZ3NTdHJpbmdFdmFsdWF0b3JWaWFDYWNoZShiaW5kaW5nc1N0cmluZywgY2FjaGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGNhY2hlS2V5ID0gYmluZGluZ3NTdHJpbmcgKyAob3B0aW9ucyAmJiBvcHRpb25zWyd2YWx1ZUFjY2Vzc29ycyddIHx8ICcnKTtcbiAgICAgICAgcmV0dXJuIGNhY2hlW2NhY2hlS2V5XVxuICAgICAgICAgICAgfHwgKGNhY2hlW2NhY2hlS2V5XSA9IGNyZWF0ZUJpbmRpbmdzU3RyaW5nRXZhbHVhdG9yKGJpbmRpbmdzU3RyaW5nLCBvcHRpb25zKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQmluZGluZ3NTdHJpbmdFdmFsdWF0b3IoYmluZGluZ3NTdHJpbmcsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gQnVpbGQgdGhlIHNvdXJjZSBmb3IgYSBmdW5jdGlvbiB0aGF0IGV2YWx1YXRlcyBcImV4cHJlc3Npb25cIlxuICAgICAgICAvLyBGb3IgZWFjaCBzY29wZSB2YXJpYWJsZSwgYWRkIGFuIGV4dHJhIGxldmVsIG9mIFwid2l0aFwiIG5lc3RpbmdcbiAgICAgICAgLy8gRXhhbXBsZSByZXN1bHQ6IHdpdGgoc2MxKSB7IHdpdGgoc2MwKSB7IHJldHVybiAoZXhwcmVzc2lvbikgfSB9XG4gICAgICAgIHZhciByZXdyaXR0ZW5CaW5kaW5ncyA9IGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzKGJpbmRpbmdzU3RyaW5nLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGZ1bmN0aW9uQm9keSA9IFwid2l0aCgkY29udGV4dCl7d2l0aCgkZGF0YXx8e30pe3JldHVybntcIiArIHJld3JpdHRlbkJpbmRpbmdzICsgXCJ9fX1cIjtcbiAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihcIiRjb250ZXh0XCIsIFwiJGVsZW1lbnRcIiwgZnVuY3Rpb25Cb2R5KTtcbiAgICB9XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ2JpbmRpbmdQcm92aWRlcicsIGtvLmJpbmRpbmdQcm92aWRlcik7XG4oZnVuY3Rpb24gKCkge1xuICAgIGtvLmJpbmRpbmdIYW5kbGVycyA9IHt9O1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBlbGVtZW50IHR5cGVzIHdpbGwgbm90IGJlIHJlY3Vyc2VkIGludG8gZHVyaW5nIGJpbmRpbmcuIEluIHRoZSBmdXR1cmUsIHdlXG4gICAgLy8gbWF5IGNvbnNpZGVyIGFkZGluZyA8dGVtcGxhdGU+IHRvIHRoaXMgbGlzdCwgYmVjYXVzZSBzdWNoIGVsZW1lbnRzJyBjb250ZW50cyBhcmUgYWx3YXlzXG4gICAgLy8gaW50ZW5kZWQgdG8gYmUgYm91bmQgaW4gYSBkaWZmZXJlbnQgY29udGV4dCBmcm9tIHdoZXJlIHRoZXkgYXBwZWFyIGluIHRoZSBkb2N1bWVudC5cbiAgICB2YXIgYmluZGluZ0RvZXNOb3RSZWN1cnNlSW50b0VsZW1lbnRUeXBlcyA9IHtcbiAgICAgICAgLy8gRG9uJ3Qgd2FudCBiaW5kaW5ncyB0aGF0IG9wZXJhdGUgb24gdGV4dCBub2RlcyB0byBtdXRhdGUgPHNjcmlwdD4gYW5kIDx0ZXh0YXJlYT4gY29udGVudHMsXG4gICAgICAgIC8vIGJlY2F1c2UgaXQncyB1bmV4cGVjdGVkIGFuZCBhIHBvdGVudGlhbCBYU1MgaXNzdWVcbiAgICAgICAgJ3NjcmlwdCc6IHRydWUsXG4gICAgICAgICd0ZXh0YXJlYSc6IHRydWVcbiAgICB9O1xuXG4gICAgLy8gVXNlIGFuIG92ZXJyaWRhYmxlIG1ldGhvZCBmb3IgcmV0cmlldmluZyBiaW5kaW5nIGhhbmRsZXJzIHNvIHRoYXQgYSBwbHVnaW5zIG1heSBzdXBwb3J0IGR5bmFtaWNhbGx5IGNyZWF0ZWQgaGFuZGxlcnNcbiAgICBrb1snZ2V0QmluZGluZ0hhbmRsZXInXSA9IGZ1bmN0aW9uKGJpbmRpbmdLZXkpIHtcbiAgICAgICAgcmV0dXJuIGtvLmJpbmRpbmdIYW5kbGVyc1tiaW5kaW5nS2V5XTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIGtvLmJpbmRpbmdDb250ZXh0IGNvbnN0cnVjdG9yIGlzIG9ubHkgY2FsbGVkIGRpcmVjdGx5IHRvIGNyZWF0ZSB0aGUgcm9vdCBjb250ZXh0LiBGb3IgY2hpbGRcbiAgICAvLyBjb250ZXh0cywgdXNlIGJpbmRpbmdDb250ZXh0LmNyZWF0ZUNoaWxkQ29udGV4dCBvciBiaW5kaW5nQ29udGV4dC5leHRlbmQuXG4gICAga28uYmluZGluZ0NvbnRleHQgPSBmdW5jdGlvbihkYXRhSXRlbU9yQWNjZXNzb3IsIHBhcmVudENvbnRleHQsIGRhdGFJdGVtQWxpYXMsIGV4dGVuZENhbGxiYWNrKSB7XG5cbiAgICAgICAgLy8gVGhlIGJpbmRpbmcgY29udGV4dCBvYmplY3QgaW5jbHVkZXMgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBjdXJyZW50LCBwYXJlbnQsIGFuZCByb290IHZpZXcgbW9kZWxzLlxuICAgICAgICAvLyBJZiBhIHZpZXcgbW9kZWwgaXMgYWN0dWFsbHkgc3RvcmVkIGluIGFuIG9ic2VydmFibGUsIHRoZSBjb3JyZXNwb25kaW5nIGJpbmRpbmcgY29udGV4dCBvYmplY3QsIGFuZFxuICAgICAgICAvLyBhbnkgY2hpbGQgY29udGV4dHMsIG11c3QgYmUgdXBkYXRlZCB3aGVuIHRoZSB2aWV3IG1vZGVsIGlzIGNoYW5nZWQuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNvbnRleHQoKSB7XG4gICAgICAgICAgICAvLyBNb3N0IG9mIHRoZSB0aW1lLCB0aGUgY29udGV4dCB3aWxsIGRpcmVjdGx5IGdldCBhIHZpZXcgbW9kZWwgb2JqZWN0LCBidXQgaWYgYSBmdW5jdGlvbiBpcyBnaXZlbixcbiAgICAgICAgICAgIC8vIHdlIGNhbGwgdGhlIGZ1bmN0aW9uIHRvIHJldHJpZXZlIHRoZSB2aWV3IG1vZGVsLiBJZiB0aGUgZnVuY3Rpb24gYWNjZXNzZXMgYW55IG9ic2V2YWJsZXMgb3IgcmV0dXJuc1xuICAgICAgICAgICAgLy8gYW4gb2JzZXJ2YWJsZSwgdGhlIGRlcGVuZGVuY3kgaXMgdHJhY2tlZCwgYW5kIHRob3NlIG9ic2VydmFibGVzIGNhbiBsYXRlciBjYXVzZSB0aGUgYmluZGluZ1xuICAgICAgICAgICAgLy8gY29udGV4dCB0byBiZSB1cGRhdGVkLlxuICAgICAgICAgICAgdmFyIGRhdGFJdGVtT3JPYnNlcnZhYmxlID0gaXNGdW5jID8gZGF0YUl0ZW1PckFjY2Vzc29yKCkgOiBkYXRhSXRlbU9yQWNjZXNzb3IsXG4gICAgICAgICAgICAgICAgZGF0YUl0ZW0gPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGRhdGFJdGVtT3JPYnNlcnZhYmxlKTtcblxuICAgICAgICAgICAgaWYgKHBhcmVudENvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAvLyBXaGVuIGEgXCJwYXJlbnRcIiBjb250ZXh0IGlzIGdpdmVuLCByZWdpc3RlciBhIGRlcGVuZGVuY3kgb24gdGhlIHBhcmVudCBjb250ZXh0LiBUaHVzIHdoZW5ldmVyIHRoZVxuICAgICAgICAgICAgICAgIC8vIHBhcmVudCBjb250ZXh0IGlzIHVwZGF0ZWQsIHRoaXMgY29udGV4dCB3aWxsIGFsc28gYmUgdXBkYXRlZC5cbiAgICAgICAgICAgICAgICBpZiAocGFyZW50Q29udGV4dC5fc3Vic2NyaWJhYmxlKVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRDb250ZXh0Ll9zdWJzY3JpYmFibGUoKTtcblxuICAgICAgICAgICAgICAgIC8vIENvcHkgJHJvb3QgYW5kIGFueSBjdXN0b20gcHJvcGVydGllcyBmcm9tIHRoZSBwYXJlbnQgY29udGV4dFxuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmV4dGVuZChzZWxmLCBwYXJlbnRDb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIC8vIEJlY2F1c2UgdGhlIGFib3ZlIGNvcHkgb3ZlcndyaXRlcyBvdXIgb3duIHByb3BlcnRpZXMsIHdlIG5lZWQgdG8gcmVzZXQgdGhlbS5cbiAgICAgICAgICAgICAgICAvLyBEdXJpbmcgdGhlIGZpcnN0IGV4ZWN1dGlvbiwgXCJzdWJzY3JpYmFibGVcIiBpc24ndCBzZXQsIHNvIGRvbid0IGJvdGhlciBkb2luZyB0aGUgdXBkYXRlIHRoZW4uXG4gICAgICAgICAgICAgICAgaWYgKHN1YnNjcmliYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zdWJzY3JpYmFibGUgPSBzdWJzY3JpYmFibGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmWyckcGFyZW50cyddID0gW107XG4gICAgICAgICAgICAgICAgc2VsZlsnJHJvb3QnXSA9IGRhdGFJdGVtO1xuXG4gICAgICAgICAgICAgICAgLy8gRXhwb3J0ICdrbycgaW4gdGhlIGJpbmRpbmcgY29udGV4dCBzbyBpdCB3aWxsIGJlIGF2YWlsYWJsZSBpbiBiaW5kaW5ncyBhbmQgdGVtcGxhdGVzXG4gICAgICAgICAgICAgICAgLy8gZXZlbiBpZiAna28nIGlzbid0IGV4cG9ydGVkIGFzIGEgZ2xvYmFsLCBzdWNoIGFzIHdoZW4gdXNpbmcgYW4gQU1EIGxvYWRlci5cbiAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L2lzc3Vlcy80OTBcbiAgICAgICAgICAgICAgICBzZWxmWydrbyddID0ga287XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmWyckcmF3RGF0YSddID0gZGF0YUl0ZW1Pck9ic2VydmFibGU7XG4gICAgICAgICAgICBzZWxmWyckZGF0YSddID0gZGF0YUl0ZW07XG4gICAgICAgICAgICBpZiAoZGF0YUl0ZW1BbGlhcylcbiAgICAgICAgICAgICAgICBzZWxmW2RhdGFJdGVtQWxpYXNdID0gZGF0YUl0ZW07XG5cbiAgICAgICAgICAgIC8vIFRoZSBleHRlbmRDYWxsYmFjayBmdW5jdGlvbiBpcyBwcm92aWRlZCB3aGVuIGNyZWF0aW5nIGEgY2hpbGQgY29udGV4dCBvciBleHRlbmRpbmcgYSBjb250ZXh0LlxuICAgICAgICAgICAgLy8gSXQgaGFuZGxlcyB0aGUgc3BlY2lmaWMgYWN0aW9ucyBuZWVkZWQgdG8gZmluaXNoIHNldHRpbmcgdXAgdGhlIGJpbmRpbmcgY29udGV4dC4gQWN0aW9ucyBpbiB0aGlzXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBjb3VsZCBhbHNvIGFkZCBkZXBlbmRlbmNpZXMgdG8gdGhpcyBiaW5kaW5nIGNvbnRleHQuXG4gICAgICAgICAgICBpZiAoZXh0ZW5kQ2FsbGJhY2spXG4gICAgICAgICAgICAgICAgZXh0ZW5kQ2FsbGJhY2soc2VsZiwgcGFyZW50Q29udGV4dCwgZGF0YUl0ZW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc2VsZlsnJGRhdGEnXTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBkaXNwb3NlV2hlbigpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlcyAmJiAha28udXRpbHMuYW55RG9tTm9kZUlzQXR0YWNoZWRUb0RvY3VtZW50KG5vZGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGlzRnVuYyA9IHR5cGVvZihkYXRhSXRlbU9yQWNjZXNzb3IpID09IFwiZnVuY3Rpb25cIiAmJiAha28uaXNPYnNlcnZhYmxlKGRhdGFJdGVtT3JBY2Nlc3NvciksXG4gICAgICAgICAgICBub2RlcyxcbiAgICAgICAgICAgIHN1YnNjcmliYWJsZSA9IGtvLmRlcGVuZGVudE9ic2VydmFibGUodXBkYXRlQ29udGV4dCwgbnVsbCwgeyBkaXNwb3NlV2hlbjogZGlzcG9zZVdoZW4sIGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogdHJ1ZSB9KTtcblxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgYmluZGluZyBjb250ZXh0IGhhcyBiZWVuIGluaXRpYWxpemVkLCBhbmQgdGhlIFwic3Vic2NyaWJhYmxlXCIgY29tcHV0ZWQgb2JzZXJ2YWJsZSBpc1xuICAgICAgICAvLyBzdWJzY3JpYmVkIHRvIGFueSBvYnNlcnZhYmxlcyB0aGF0IHdlcmUgYWNjZXNzZWQgaW4gdGhlIHByb2Nlc3MuIElmIHRoZXJlIGlzIG5vdGhpbmcgdG8gdHJhY2ssIHRoZVxuICAgICAgICAvLyBjb21wdXRlZCB3aWxsIGJlIGluYWN0aXZlLCBhbmQgd2UgY2FuIHNhZmVseSB0aHJvdyBpdCBhd2F5LiBJZiBpdCdzIGFjdGl2ZSwgdGhlIGNvbXB1dGVkIGlzIHN0b3JlZCBpblxuICAgICAgICAvLyB0aGUgY29udGV4dCBvYmplY3QuXG4gICAgICAgIGlmIChzdWJzY3JpYmFibGUuaXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgc2VsZi5fc3Vic2NyaWJhYmxlID0gc3Vic2NyaWJhYmxlO1xuXG4gICAgICAgICAgICAvLyBBbHdheXMgbm90aWZ5IGJlY2F1c2UgZXZlbiBpZiB0aGUgbW9kZWwgKCRkYXRhKSBoYXNuJ3QgY2hhbmdlZCwgb3RoZXIgY29udGV4dCBwcm9wZXJ0aWVzIG1pZ2h0IGhhdmUgY2hhbmdlZFxuICAgICAgICAgICAgc3Vic2NyaWJhYmxlWydlcXVhbGl0eUNvbXBhcmVyJ10gPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIGJlIGFibGUgdG8gZGlzcG9zZSBvZiB0aGlzIGNvbXB1dGVkIG9ic2VydmFibGUgd2hlbiBpdCdzIG5vIGxvbmdlciBuZWVkZWQuIFRoaXMgd291bGQgYmVcbiAgICAgICAgICAgIC8vIGVhc3kgaWYgd2UgaGFkIGEgc2luZ2xlIG5vZGUgdG8gd2F0Y2gsIGJ1dCBiaW5kaW5nIGNvbnRleHRzIGNhbiBiZSB1c2VkIGJ5IG1hbnkgZGlmZmVyZW50IG5vZGVzLCBhbmRcbiAgICAgICAgICAgIC8vIHdlIGNhbm5vdCBhc3N1bWUgdGhhdCB0aG9zZSBub2RlcyBoYXZlIGFueSByZWxhdGlvbiB0byBlYWNoIG90aGVyLiBTbyBpbnN0ZWFkIHdlIHRyYWNrIGFueSBub2RlIHRoYXRcbiAgICAgICAgICAgIC8vIHRoZSBjb250ZXh0IGlzIGF0dGFjaGVkIHRvLCBhbmQgZGlzcG9zZSB0aGUgY29tcHV0ZWQgd2hlbiBhbGwgb2YgdGhvc2Ugbm9kZXMgaGF2ZSBiZWVuIGNsZWFuZWQuXG5cbiAgICAgICAgICAgIC8vIEFkZCBwcm9wZXJ0aWVzIHRvICpzdWJzY3JpYmFibGUqIGluc3RlYWQgb2YgKnNlbGYqIGJlY2F1c2UgYW55IHByb3BlcnRpZXMgYWRkZWQgdG8gKnNlbGYqIG1heSBiZSBvdmVyd3JpdHRlbiBvbiB1cGRhdGVzXG4gICAgICAgICAgICBub2RlcyA9IFtdO1xuICAgICAgICAgICAgc3Vic2NyaWJhYmxlLl9hZGROb2RlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsLmFkZERpc3Bvc2VDYWxsYmFjayhub2RlLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5UmVtb3ZlSXRlbShub2Rlcywgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmFibGUuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fc3Vic2NyaWJhYmxlID0gc3Vic2NyaWJhYmxlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXh0ZW5kIHRoZSBiaW5kaW5nIGNvbnRleHQgaGllcmFyY2h5IHdpdGggYSBuZXcgdmlldyBtb2RlbCBvYmplY3QuIElmIHRoZSBwYXJlbnQgY29udGV4dCBpcyB3YXRjaGluZ1xuICAgIC8vIGFueSBvYnNldmFibGVzLCB0aGUgbmV3IGNoaWxkIGNvbnRleHQgd2lsbCBhdXRvbWF0aWNhbGx5IGdldCBhIGRlcGVuZGVuY3kgb24gdGhlIHBhcmVudCBjb250ZXh0LlxuICAgIC8vIEJ1dCB0aGlzIGRvZXMgbm90IG1lYW4gdGhhdCB0aGUgJGRhdGEgdmFsdWUgb2YgdGhlIGNoaWxkIGNvbnRleHQgd2lsbCBhbHNvIGdldCB1cGRhdGVkLiBJZiB0aGUgY2hpbGRcbiAgICAvLyB2aWV3IG1vZGVsIGFsc28gZGVwZW5kcyBvbiB0aGUgcGFyZW50IHZpZXcgbW9kZWwsIHlvdSBtdXN0IHByb3ZpZGUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNvcnJlY3RcbiAgICAvLyB2aWV3IG1vZGVsIG9uIGVhY2ggdXBkYXRlLlxuICAgIGtvLmJpbmRpbmdDb250ZXh0LnByb3RvdHlwZVsnY3JlYXRlQ2hpbGRDb250ZXh0J10gPSBmdW5jdGlvbiAoZGF0YUl0ZW1PckFjY2Vzc29yLCBkYXRhSXRlbUFsaWFzLCBleHRlbmRDYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gbmV3IGtvLmJpbmRpbmdDb250ZXh0KGRhdGFJdGVtT3JBY2Nlc3NvciwgdGhpcywgZGF0YUl0ZW1BbGlhcywgZnVuY3Rpb24oc2VsZiwgcGFyZW50Q29udGV4dCkge1xuICAgICAgICAgICAgLy8gRXh0ZW5kIHRoZSBjb250ZXh0IGhpZXJhcmNoeSBieSBzZXR0aW5nIHRoZSBhcHByb3ByaWF0ZSBwb2ludGVyc1xuICAgICAgICAgICAgc2VsZlsnJHBhcmVudENvbnRleHQnXSA9IHBhcmVudENvbnRleHQ7XG4gICAgICAgICAgICBzZWxmWyckcGFyZW50J10gPSBwYXJlbnRDb250ZXh0WyckZGF0YSddO1xuICAgICAgICAgICAgc2VsZlsnJHBhcmVudHMnXSA9IChwYXJlbnRDb250ZXh0WyckcGFyZW50cyddIHx8IFtdKS5zbGljZSgwKTtcbiAgICAgICAgICAgIHNlbGZbJyRwYXJlbnRzJ10udW5zaGlmdChzZWxmWyckcGFyZW50J10pO1xuICAgICAgICAgICAgaWYgKGV4dGVuZENhbGxiYWNrKVxuICAgICAgICAgICAgICAgIGV4dGVuZENhbGxiYWNrKHNlbGYpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gRXh0ZW5kIHRoZSBiaW5kaW5nIGNvbnRleHQgd2l0aCBuZXcgY3VzdG9tIHByb3BlcnRpZXMuIFRoaXMgZG9lc24ndCBjaGFuZ2UgdGhlIGNvbnRleHQgaGllcmFyY2h5LlxuICAgIC8vIFNpbWlsYXJseSB0byBcImNoaWxkXCIgY29udGV4dHMsIHByb3ZpZGUgYSBmdW5jdGlvbiBoZXJlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBjb3JyZWN0IHZhbHVlcyBhcmUgc2V0XG4gICAgLy8gd2hlbiBhbiBvYnNlcnZhYmxlIHZpZXcgbW9kZWwgaXMgdXBkYXRlZC5cbiAgICBrby5iaW5kaW5nQ29udGV4dC5wcm90b3R5cGVbJ2V4dGVuZCddID0gZnVuY3Rpb24ocHJvcGVydGllcykge1xuICAgICAgICAvLyBJZiB0aGUgcGFyZW50IGNvbnRleHQgcmVmZXJlbmNlcyBhbiBvYnNlcnZhYmxlIHZpZXcgbW9kZWwsIFwiX3N1YnNjcmliYWJsZVwiIHdpbGwgYWx3YXlzIGJlIHRoZVxuICAgICAgICAvLyBsYXRlc3QgdmlldyBtb2RlbCBvYmplY3QuIElmIG5vdCwgXCJfc3Vic2NyaWJhYmxlXCIgaXNuJ3Qgc2V0LCBhbmQgd2UgY2FuIHVzZSB0aGUgc3RhdGljIFwiJGRhdGFcIiB2YWx1ZS5cbiAgICAgICAgcmV0dXJuIG5ldyBrby5iaW5kaW5nQ29udGV4dCh0aGlzLl9zdWJzY3JpYmFibGUgfHwgdGhpc1snJGRhdGEnXSwgdGhpcywgbnVsbCwgZnVuY3Rpb24oc2VsZiwgcGFyZW50Q29udGV4dCkge1xuICAgICAgICAgICAgLy8gVGhpcyBcImNoaWxkXCIgY29udGV4dCBkb2Vzbid0IGRpcmVjdGx5IHRyYWNrIGEgcGFyZW50IG9ic2VydmFibGUgdmlldyBtb2RlbCxcbiAgICAgICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gbWFudWFsbHkgc2V0IHRoZSAkcmF3RGF0YSB2YWx1ZSB0byBtYXRjaCB0aGUgcGFyZW50LlxuICAgICAgICAgICAgc2VsZlsnJHJhd0RhdGEnXSA9IHBhcmVudENvbnRleHRbJyRyYXdEYXRhJ107XG4gICAgICAgICAgICBrby51dGlscy5leHRlbmQoc2VsZiwgdHlwZW9mKHByb3BlcnRpZXMpID09IFwiZnVuY3Rpb25cIiA/IHByb3BlcnRpZXMoKSA6IHByb3BlcnRpZXMpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdmFsdWVBY2Nlc29yIGZ1bmN0aW9uIGZvciBhIGJpbmRpbmcgdmFsdWVcbiAgICBmdW5jdGlvbiBtYWtlVmFsdWVBY2Nlc3Nvcih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgdmFsdWUgb2YgYSB2YWx1ZUFjY2Vzc29yIGZ1bmN0aW9uXG4gICAgZnVuY3Rpb24gZXZhbHVhdGVWYWx1ZUFjY2Vzc29yKHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlQWNjZXNzb3IoKTtcbiAgICB9XG5cbiAgICAvLyBHaXZlbiBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBiaW5kaW5ncywgY3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgb2JqZWN0IHRoYXQgY29udGFpbnNcbiAgICAvLyBiaW5kaW5nIHZhbHVlLWFjY2Vzc29ycyBmdW5jdGlvbnMuIEVhY2ggYWNjZXNzb3IgZnVuY3Rpb24gY2FsbHMgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uXG4gICAgLy8gc28gdGhhdCBpdCBhbHdheXMgZ2V0cyB0aGUgbGF0ZXN0IHZhbHVlIGFuZCBhbGwgZGVwZW5kZW5jaWVzIGFyZSBjYXB0dXJlZC4gVGhpcyBpcyB1c2VkXG4gICAgLy8gYnkga28uYXBwbHlCaW5kaW5nc1RvTm9kZSBhbmQgZ2V0QmluZGluZ3NBbmRNYWtlQWNjZXNzb3JzLlxuICAgIGZ1bmN0aW9uIG1ha2VBY2Nlc3NvcnNGcm9tRnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLm9iamVjdE1hcChrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShjYWxsYmFjayksIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKVtrZXldO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gR2l2ZW4gYSBiaW5kaW5ncyBmdW5jdGlvbiBvciBvYmplY3QsIGNyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IG9iamVjdCB0aGF0IGNvbnRhaW5zXG4gICAgLy8gYmluZGluZyB2YWx1ZS1hY2Nlc3NvcnMgZnVuY3Rpb25zLiBUaGlzIGlzIHVzZWQgYnkga28uYXBwbHlCaW5kaW5nc1RvTm9kZS5cbiAgICBmdW5jdGlvbiBtYWtlQmluZGluZ0FjY2Vzc29ycyhiaW5kaW5ncywgY29udGV4dCwgbm9kZSkge1xuICAgICAgICBpZiAodHlwZW9mIGJpbmRpbmdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFrZUFjY2Vzc29yc0Zyb21GdW5jdGlvbihiaW5kaW5ncy5iaW5kKG51bGwsIGNvbnRleHQsIG5vZGUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBrby51dGlscy5vYmplY3RNYXAoYmluZGluZ3MsIG1ha2VWYWx1ZUFjY2Vzc29yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBpZiB0aGUgYmluZGluZyBwcm92aWRlciBkb2Vzbid0IGluY2x1ZGUgYSBnZXRCaW5kaW5nQWNjZXNzb3JzIGZ1bmN0aW9uLlxuICAgIC8vIEl0IG11c3QgYmUgY2FsbGVkIHdpdGggJ3RoaXMnIHNldCB0byB0aGUgcHJvdmlkZXIgaW5zdGFuY2UuXG4gICAgZnVuY3Rpb24gZ2V0QmluZGluZ3NBbmRNYWtlQWNjZXNzb3JzKG5vZGUsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIG1ha2VBY2Nlc3NvcnNGcm9tRnVuY3Rpb24odGhpc1snZ2V0QmluZGluZ3MnXS5iaW5kKHRoaXMsIG5vZGUsIGNvbnRleHQpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZVRoYXRCaW5kaW5nSXNBbGxvd2VkRm9yVmlydHVhbEVsZW1lbnRzKGJpbmRpbmdOYW1lKSB7XG4gICAgICAgIHZhciB2YWxpZGF0b3IgPSBrby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzW2JpbmRpbmdOYW1lXTtcbiAgICAgICAgaWYgKCF2YWxpZGF0b3IpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYmluZGluZyAnXCIgKyBiaW5kaW5nTmFtZSArIFwiJyBjYW5ub3QgYmUgdXNlZCB3aXRoIHZpcnR1YWwgZWxlbWVudHNcIilcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50c0ludGVybmFsIChiaW5kaW5nQ29udGV4dCwgZWxlbWVudE9yVmlydHVhbEVsZW1lbnQsIGJpbmRpbmdDb250ZXh0c01heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50KSB7XG4gICAgICAgIHZhciBjdXJyZW50Q2hpbGQsXG4gICAgICAgICAgICBuZXh0SW5RdWV1ZSA9IGtvLnZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkKGVsZW1lbnRPclZpcnR1YWxFbGVtZW50KSxcbiAgICAgICAgICAgIHByb3ZpZGVyID0ga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddLFxuICAgICAgICAgICAgcHJlcHJvY2Vzc05vZGUgPSBwcm92aWRlclsncHJlcHJvY2Vzc05vZGUnXTtcblxuICAgICAgICAvLyBQcmVwcm9jZXNzaW5nIGFsbG93cyBhIGJpbmRpbmcgcHJvdmlkZXIgdG8gbXV0YXRlIGEgbm9kZSBiZWZvcmUgYmluZGluZ3MgYXJlIGFwcGxpZWQgdG8gaXQuIEZvciBleGFtcGxlIGl0J3NcbiAgICAgICAgLy8gcG9zc2libGUgdG8gaW5zZXJ0IG5ldyBzaWJsaW5ncyBhZnRlciBpdCwgYW5kL29yIHJlcGxhY2UgdGhlIG5vZGUgd2l0aCBhIGRpZmZlcmVudCBvbmUuIFRoaXMgY2FuIGJlIHVzZWQgdG9cbiAgICAgICAgLy8gaW1wbGVtZW50IGN1c3RvbSBiaW5kaW5nIHN5bnRheGVzLCBzdWNoIGFzIHt7IHZhbHVlIH19IGZvciBzdHJpbmcgaW50ZXJwb2xhdGlvbiwgb3IgY3VzdG9tIGVsZW1lbnQgdHlwZXMgdGhhdFxuICAgICAgICAvLyB0cmlnZ2VyIGluc2VydGlvbiBvZiA8dGVtcGxhdGU+IGNvbnRlbnRzIGF0IHRoYXQgcG9pbnQgaW4gdGhlIGRvY3VtZW50LlxuICAgICAgICBpZiAocHJlcHJvY2Vzc05vZGUpIHtcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50Q2hpbGQgPSBuZXh0SW5RdWV1ZSkge1xuICAgICAgICAgICAgICAgIG5leHRJblF1ZXVlID0ga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKGN1cnJlbnRDaGlsZCk7XG4gICAgICAgICAgICAgICAgcHJlcHJvY2Vzc05vZGUuY2FsbChwcm92aWRlciwgY3VycmVudENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlc2V0IG5leHRJblF1ZXVlIGZvciB0aGUgbmV4dCBsb29wXG4gICAgICAgICAgICBuZXh0SW5RdWV1ZSA9IGtvLnZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkKGVsZW1lbnRPclZpcnR1YWxFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChjdXJyZW50Q2hpbGQgPSBuZXh0SW5RdWV1ZSkge1xuICAgICAgICAgICAgLy8gS2VlcCBhIHJlY29yZCBvZiB0aGUgbmV4dCBjaGlsZCAqYmVmb3JlKiBhcHBseWluZyBiaW5kaW5ncywgaW4gY2FzZSB0aGUgYmluZGluZyByZW1vdmVzIHRoZSBjdXJyZW50IGNoaWxkIGZyb20gaXRzIHBvc2l0aW9uXG4gICAgICAgICAgICBuZXh0SW5RdWV1ZSA9IGtvLnZpcnR1YWxFbGVtZW50cy5uZXh0U2libGluZyhjdXJyZW50Q2hpbGQpO1xuICAgICAgICAgICAgYXBwbHlCaW5kaW5nc1RvTm9kZUFuZERlc2NlbmRhbnRzSW50ZXJuYWwoYmluZGluZ0NvbnRleHQsIGN1cnJlbnRDaGlsZCwgYmluZGluZ0NvbnRleHRzTWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwbHlCaW5kaW5nc1RvTm9kZUFuZERlc2NlbmRhbnRzSW50ZXJuYWwgKGJpbmRpbmdDb250ZXh0LCBub2RlVmVyaWZpZWQsIGJpbmRpbmdDb250ZXh0TWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHNob3VsZEJpbmREZXNjZW5kYW50cyA9IHRydWU7XG5cbiAgICAgICAgLy8gUGVyZiBvcHRpbWlzYXRpb246IEFwcGx5IGJpbmRpbmdzIG9ubHkgaWYuLi5cbiAgICAgICAgLy8gKDEpIFdlIG5lZWQgdG8gc3RvcmUgdGhlIGJpbmRpbmcgY29udGV4dCBvbiB0aGlzIG5vZGUgKGJlY2F1c2UgaXQgbWF5IGRpZmZlciBmcm9tIHRoZSBET00gcGFyZW50IG5vZGUncyBiaW5kaW5nIGNvbnRleHQpXG4gICAgICAgIC8vICAgICBOb3RlIHRoYXQgd2UgY2FuJ3Qgc3RvcmUgYmluZGluZyBjb250ZXh0cyBvbiBub24tZWxlbWVudHMgKGUuZy4sIHRleHQgbm9kZXMpLCBhcyBJRSBkb2Vzbid0IGFsbG93IGV4cGFuZG8gcHJvcGVydGllcyBmb3IgdGhvc2VcbiAgICAgICAgLy8gKDIpIEl0IG1pZ2h0IGhhdmUgYmluZGluZ3MgKGUuZy4sIGl0IGhhcyBhIGRhdGEtYmluZCBhdHRyaWJ1dGUsIG9yIGl0J3MgYSBtYXJrZXIgZm9yIGEgY29udGFpbmVybGVzcyB0ZW1wbGF0ZSlcbiAgICAgICAgdmFyIGlzRWxlbWVudCA9IChub2RlVmVyaWZpZWQubm9kZVR5cGUgPT09IDEpO1xuICAgICAgICBpZiAoaXNFbGVtZW50KSAvLyBXb3JrYXJvdW5kIElFIDw9IDggSFRNTCBwYXJzaW5nIHdlaXJkbmVzc1xuICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLm5vcm1hbGlzZVZpcnR1YWxFbGVtZW50RG9tU3RydWN0dXJlKG5vZGVWZXJpZmllZCk7XG5cbiAgICAgICAgdmFyIHNob3VsZEFwcGx5QmluZGluZ3MgPSAoaXNFbGVtZW50ICYmIGJpbmRpbmdDb250ZXh0TWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpICAgICAgICAgICAgIC8vIENhc2UgKDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddWydub2RlSGFzQmluZGluZ3MnXShub2RlVmVyaWZpZWQpOyAgICAgICAvLyBDYXNlICgyKVxuICAgICAgICBpZiAoc2hvdWxkQXBwbHlCaW5kaW5ncylcbiAgICAgICAgICAgIHNob3VsZEJpbmREZXNjZW5kYW50cyA9IGFwcGx5QmluZGluZ3NUb05vZGVJbnRlcm5hbChub2RlVmVyaWZpZWQsIG51bGwsIGJpbmRpbmdDb250ZXh0LCBiaW5kaW5nQ29udGV4dE1heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50KVsnc2hvdWxkQmluZERlc2NlbmRhbnRzJ107XG5cbiAgICAgICAgaWYgKHNob3VsZEJpbmREZXNjZW5kYW50cyAmJiAhYmluZGluZ0RvZXNOb3RSZWN1cnNlSW50b0VsZW1lbnRUeXBlc1trby51dGlscy50YWdOYW1lTG93ZXIobm9kZVZlcmlmaWVkKV0pIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJlY3Vyc2luZyBhdXRvbWF0aWNhbGx5IGludG8gKHJlYWwgb3IgdmlydHVhbCkgY2hpbGQgbm9kZXMgd2l0aG91dCBjaGFuZ2luZyBiaW5kaW5nIGNvbnRleHRzLiBTbyxcbiAgICAgICAgICAgIC8vICAqIEZvciBjaGlsZHJlbiBvZiBhICpyZWFsKiBlbGVtZW50LCB0aGUgYmluZGluZyBjb250ZXh0IGlzIGNlcnRhaW5seSB0aGUgc2FtZSBhcyBvbiB0aGVpciBET00gLnBhcmVudE5vZGUsXG4gICAgICAgICAgICAvLyAgICBoZW5jZSBiaW5kaW5nQ29udGV4dHNNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCBpcyBmYWxzZVxuICAgICAgICAgICAgLy8gICogRm9yIGNoaWxkcmVuIG9mIGEgKnZpcnR1YWwqIGVsZW1lbnQsIHdlIGNhbid0IGJlIHN1cmUuIEV2YWx1YXRpbmcgLnBhcmVudE5vZGUgb24gdGhvc2UgY2hpbGRyZW4gbWF5XG4gICAgICAgICAgICAvLyAgICBza2lwIG92ZXIgYW55IG51bWJlciBvZiBpbnRlcm1lZGlhdGUgdmlydHVhbCBlbGVtZW50cywgYW55IG9mIHdoaWNoIG1pZ2h0IGRlZmluZSBhIGN1c3RvbSBiaW5kaW5nIGNvbnRleHQsXG4gICAgICAgICAgICAvLyAgICBoZW5jZSBiaW5kaW5nQ29udGV4dHNNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCBpcyB0cnVlXG4gICAgICAgICAgICBhcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50c0ludGVybmFsKGJpbmRpbmdDb250ZXh0LCBub2RlVmVyaWZpZWQsIC8qIGJpbmRpbmdDb250ZXh0c01heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50OiAqLyAhaXNFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBib3VuZEVsZW1lbnREb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG5cblxuICAgIGZ1bmN0aW9uIHRvcG9sb2dpY2FsU29ydEJpbmRpbmdzKGJpbmRpbmdzKSB7XG4gICAgICAgIC8vIERlcHRoLWZpcnN0IHNvcnRcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLCAgICAgICAgICAgICAgICAvLyBUaGUgbGlzdCBvZiBrZXkvaGFuZGxlciBwYWlycyB0aGF0IHdlIHdpbGwgcmV0dXJuXG4gICAgICAgICAgICBiaW5kaW5nc0NvbnNpZGVyZWQgPSB7fSwgICAgLy8gQSB0ZW1wb3JhcnkgcmVjb3JkIG9mIHdoaWNoIGJpbmRpbmdzIGFyZSBhbHJlYWR5IGluICdyZXN1bHQnXG4gICAgICAgICAgICBjeWNsaWNEZXBlbmRlbmN5U3RhY2sgPSBbXTsgLy8gS2VlcHMgdHJhY2sgb2YgYSBkZXB0aC1zZWFyY2ggc28gdGhhdCwgaWYgdGhlcmUncyBhIGN5Y2xlLCB3ZSBrbm93IHdoaWNoIGJpbmRpbmdzIGNhdXNlZCBpdFxuICAgICAgICBrby51dGlscy5vYmplY3RGb3JFYWNoKGJpbmRpbmdzLCBmdW5jdGlvbiBwdXNoQmluZGluZyhiaW5kaW5nS2V5KSB7XG4gICAgICAgICAgICBpZiAoIWJpbmRpbmdzQ29uc2lkZXJlZFtiaW5kaW5nS2V5XSkge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nID0ga29bJ2dldEJpbmRpbmdIYW5kbGVyJ10oYmluZGluZ0tleSk7XG4gICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QgYWRkIGRlcGVuZGVuY2llcyAoaWYgYW55KSBvZiB0aGUgY3VycmVudCBiaW5kaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nWydhZnRlciddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjeWNsaWNEZXBlbmRlbmN5U3RhY2sucHVzaChiaW5kaW5nS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChiaW5kaW5nWydhZnRlciddLCBmdW5jdGlvbihiaW5kaW5nRGVwZW5kZW5jeUtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nc1tiaW5kaW5nRGVwZW5kZW5jeUtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtvLnV0aWxzLmFycmF5SW5kZXhPZihjeWNsaWNEZXBlbmRlbmN5U3RhY2ssIGJpbmRpbmdEZXBlbmRlbmN5S2V5KSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiQ2Fubm90IGNvbWJpbmUgdGhlIGZvbGxvd2luZyBiaW5kaW5ncywgYmVjYXVzZSB0aGV5IGhhdmUgYSBjeWNsaWMgZGVwZW5kZW5jeTogXCIgKyBjeWNsaWNEZXBlbmRlbmN5U3RhY2suam9pbihcIiwgXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hCaW5kaW5nKGJpbmRpbmdEZXBlbmRlbmN5S2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGljRGVwZW5kZW5jeVN0YWNrLmxlbmd0aC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIE5leHQgYWRkIHRoZSBjdXJyZW50IGJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goeyBrZXk6IGJpbmRpbmdLZXksIGhhbmRsZXI6IGJpbmRpbmcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJpbmRpbmdzQ29uc2lkZXJlZFtiaW5kaW5nS2V5XSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwbHlCaW5kaW5nc1RvTm9kZUludGVybmFsKG5vZGUsIHNvdXJjZUJpbmRpbmdzLCBiaW5kaW5nQ29udGV4dCwgYmluZGluZ0NvbnRleHRNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCkge1xuICAgICAgICAvLyBQcmV2ZW50IG11bHRpcGxlIGFwcGx5QmluZGluZ3MgY2FsbHMgZm9yIHRoZSBzYW1lIG5vZGUsIGV4Y2VwdCB3aGVuIGEgYmluZGluZyB2YWx1ZSBpcyBzcGVjaWZpZWRcbiAgICAgICAgdmFyIGFscmVhZHlCb3VuZCA9IGtvLnV0aWxzLmRvbURhdGEuZ2V0KG5vZGUsIGJvdW5kRWxlbWVudERvbURhdGFLZXkpO1xuICAgICAgICBpZiAoIXNvdXJjZUJpbmRpbmdzKSB7XG4gICAgICAgICAgICBpZiAoYWxyZWFkeUJvdW5kKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJZb3UgY2Fubm90IGFwcGx5IGJpbmRpbmdzIG11bHRpcGxlIHRpbWVzIHRvIHRoZSBzYW1lIGVsZW1lbnQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQobm9kZSwgYm91bmRFbGVtZW50RG9tRGF0YUtleSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPcHRpbWl6YXRpb246IERvbid0IHN0b3JlIHRoZSBiaW5kaW5nIGNvbnRleHQgb24gdGhpcyBub2RlIGlmIGl0J3MgZGVmaW5pdGVseSB0aGUgc2FtZSBhcyBvbiBub2RlLnBhcmVudE5vZGUsIGJlY2F1c2VcbiAgICAgICAgLy8gd2UgY2FuIGVhc2lseSByZWNvdmVyIGl0IGp1c3QgYnkgc2Nhbm5pbmcgdXAgdGhlIG5vZGUncyBhbmNlc3RvcnMgaW4gdGhlIERPTVxuICAgICAgICAvLyAobm90ZTogaGVyZSwgcGFyZW50IG5vZGUgbWVhbnMgXCJyZWFsIERPTSBwYXJlbnRcIiBub3QgXCJ2aXJ0dWFsIHBhcmVudFwiLCBhcyB0aGVyZSdzIG5vIE8oMSkgd2F5IHRvIGZpbmQgdGhlIHZpcnR1YWwgcGFyZW50KVxuICAgICAgICBpZiAoIWFscmVhZHlCb3VuZCAmJiBiaW5kaW5nQ29udGV4dE1heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50KVxuICAgICAgICAgICAga28uc3RvcmVkQmluZGluZ0NvbnRleHRGb3JOb2RlKG5vZGUsIGJpbmRpbmdDb250ZXh0KTtcblxuICAgICAgICAvLyBVc2UgYmluZGluZ3MgaWYgZ2l2ZW4sIG90aGVyd2lzZSBmYWxsIGJhY2sgb24gYXNraW5nIHRoZSBiaW5kaW5ncyBwcm92aWRlciB0byBnaXZlIHVzIHNvbWUgYmluZGluZ3NcbiAgICAgICAgdmFyIGJpbmRpbmdzO1xuICAgICAgICBpZiAoc291cmNlQmluZGluZ3MgJiYgdHlwZW9mIHNvdXJjZUJpbmRpbmdzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBiaW5kaW5ncyA9IHNvdXJjZUJpbmRpbmdzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0ga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddLFxuICAgICAgICAgICAgICAgIGdldEJpbmRpbmdzID0gcHJvdmlkZXJbJ2dldEJpbmRpbmdBY2Nlc3NvcnMnXSB8fCBnZXRCaW5kaW5nc0FuZE1ha2VBY2Nlc3NvcnM7XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgYmluZGluZyBmcm9tIHRoZSBwcm92aWRlciB3aXRoaW4gYSBjb21wdXRlZCBvYnNlcnZhYmxlIHNvIHRoYXQgd2UgY2FuIHVwZGF0ZSB0aGUgYmluZGluZ3Mgd2hlbmV2ZXJcbiAgICAgICAgICAgIC8vIHRoZSBiaW5kaW5nIGNvbnRleHQgaXMgdXBkYXRlZCBvciBpZiB0aGUgYmluZGluZyBwcm92aWRlciBhY2Nlc3NlcyBvYnNlcnZhYmxlcy5cbiAgICAgICAgICAgIHZhciBiaW5kaW5nc1VwZGF0ZXIgPSBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBiaW5kaW5ncyA9IHNvdXJjZUJpbmRpbmdzID8gc291cmNlQmluZGluZ3MoYmluZGluZ0NvbnRleHQsIG5vZGUpIDogZ2V0QmluZGluZ3MuY2FsbChwcm92aWRlciwgbm9kZSwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWdpc3RlciBhIGRlcGVuZGVuY3kgb24gdGhlIGJpbmRpbmcgY29udGV4dCB0byBzdXBwb3J0IG9ic2V2YWJsZSB2aWV3IG1vZGVscy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmdzICYmIGJpbmRpbmdDb250ZXh0Ll9zdWJzY3JpYmFibGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nQ29udGV4dC5fc3Vic2NyaWJhYmxlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiaW5kaW5ncztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBub2RlIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmICghYmluZGluZ3MgfHwgIWJpbmRpbmdzVXBkYXRlci5pc0FjdGl2ZSgpKVxuICAgICAgICAgICAgICAgIGJpbmRpbmdzVXBkYXRlciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYmluZGluZ0hhbmRsZXJUaGF0Q29udHJvbHNEZXNjZW5kYW50QmluZGluZ3M7XG4gICAgICAgIGlmIChiaW5kaW5ncykge1xuICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBhY2Nlc3NvciBmb3IgYSBnaXZlbiBiaW5kaW5nLiBXaGVuIGJpbmRpbmdzIGFyZSBzdGF0aWMgKHdvbid0IGJlIHVwZGF0ZWQgYmVjYXVzZSBvZiBhIGJpbmRpbmdcbiAgICAgICAgICAgIC8vIGNvbnRleHQgdXBkYXRlKSwganVzdCByZXR1cm4gdGhlIHZhbHVlIGFjY2Vzc29yIGZyb20gdGhlIGJpbmRpbmcuIE90aGVyd2lzZSwgcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCBhbHdheXMgZ2V0c1xuICAgICAgICAgICAgLy8gdGhlIGxhdGVzdCBiaW5kaW5nIHZhbHVlIGFuZCByZWdpc3RlcnMgYSBkZXBlbmRlbmN5IG9uIHRoZSBiaW5kaW5nIHVwZGF0ZXIuXG4gICAgICAgICAgICB2YXIgZ2V0VmFsdWVBY2Nlc3NvciA9IGJpbmRpbmdzVXBkYXRlclxuICAgICAgICAgICAgICAgID8gZnVuY3Rpb24oYmluZGluZ0tleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXZhbHVhdGVWYWx1ZUFjY2Vzc29yKGJpbmRpbmdzVXBkYXRlcigpW2JpbmRpbmdLZXldKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IDogZnVuY3Rpb24oYmluZGluZ0tleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmluZGluZ3NbYmluZGluZ0tleV07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gVXNlIG9mIGFsbEJpbmRpbmdzIGFzIGEgZnVuY3Rpb24gaXMgbWFpbnRhaW5lZCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHksIGJ1dCBpdHMgdXNlIGlzIGRlcHJlY2F0ZWRcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsbEJpbmRpbmdzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBrby51dGlscy5vYmplY3RNYXAoYmluZGluZ3NVcGRhdGVyID8gYmluZGluZ3NVcGRhdGVyKCkgOiBiaW5kaW5ncywgZXZhbHVhdGVWYWx1ZUFjY2Vzc29yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgaXMgdGhlIDMueCBhbGxCaW5kaW5ncyBBUElcbiAgICAgICAgICAgIGFsbEJpbmRpbmdzWydnZXQnXSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBiaW5kaW5nc1trZXldICYmIGV2YWx1YXRlVmFsdWVBY2Nlc3NvcihnZXRWYWx1ZUFjY2Vzc29yKGtleSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGFsbEJpbmRpbmdzWydoYXMnXSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBrZXkgaW4gYmluZGluZ3M7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBGaXJzdCBwdXQgdGhlIGJpbmRpbmdzIGludG8gdGhlIHJpZ2h0IG9yZGVyXG4gICAgICAgICAgICB2YXIgb3JkZXJlZEJpbmRpbmdzID0gdG9wb2xvZ2ljYWxTb3J0QmluZGluZ3MoYmluZGluZ3MpO1xuXG4gICAgICAgICAgICAvLyBHbyB0aHJvdWdoIHRoZSBzb3J0ZWQgYmluZGluZ3MsIGNhbGxpbmcgaW5pdCBhbmQgdXBkYXRlIGZvciBlYWNoXG4gICAgICAgICAgICBrby51dGlscy5hcnJheUZvckVhY2gob3JkZXJlZEJpbmRpbmdzLCBmdW5jdGlvbihiaW5kaW5nS2V5QW5kSGFuZGxlcikge1xuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCB0b3BvbG9naWNhbFNvcnRCaW5kaW5ncyBoYXMgYWxyZWFkeSBmaWx0ZXJlZCBvdXQgYW55IG5vbmV4aXN0ZW50IGJpbmRpbmcgaGFuZGxlcnMsXG4gICAgICAgICAgICAgICAgLy8gc28gYmluZGluZ0tleUFuZEhhbmRsZXIuaGFuZGxlciB3aWxsIGFsd2F5cyBiZSBub25udWxsLlxuICAgICAgICAgICAgICAgIHZhciBoYW5kbGVySW5pdEZuID0gYmluZGluZ0tleUFuZEhhbmRsZXIuaGFuZGxlcltcImluaXRcIl0sXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJVcGRhdGVGbiA9IGJpbmRpbmdLZXlBbmRIYW5kbGVyLmhhbmRsZXJbXCJ1cGRhdGVcIl0sXG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdLZXkgPSBiaW5kaW5nS2V5QW5kSGFuZGxlci5rZXk7XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZVRoYXRCaW5kaW5nSXNBbGxvd2VkRm9yVmlydHVhbEVsZW1lbnRzKGJpbmRpbmdLZXkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJ1biBpbml0LCBpZ25vcmluZyBhbnkgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlckluaXRGbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbml0UmVzdWx0ID0gaGFuZGxlckluaXRGbihub2RlLCBnZXRWYWx1ZUFjY2Vzc29yKGJpbmRpbmdLZXkpLCBhbGxCaW5kaW5ncywgYmluZGluZ0NvbnRleHRbJyRkYXRhJ10sIGJpbmRpbmdDb250ZXh0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgYmluZGluZyBoYW5kbGVyIGNsYWltcyB0byBjb250cm9sIGRlc2NlbmRhbnQgYmluZGluZ3MsIG1ha2UgYSBub3RlIG9mIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdFJlc3VsdCAmJiBpbml0UmVzdWx0Wydjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nSGFuZGxlclRoYXRDb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTXVsdGlwbGUgYmluZGluZ3MgKFwiICsgYmluZGluZ0hhbmRsZXJUaGF0Q29udHJvbHNEZXNjZW5kYW50QmluZGluZ3MgKyBcIiBhbmQgXCIgKyBiaW5kaW5nS2V5ICsgXCIpIGFyZSB0cnlpbmcgdG8gY29udHJvbCBkZXNjZW5kYW50IGJpbmRpbmdzIG9mIHRoZSBzYW1lIGVsZW1lbnQuIFlvdSBjYW5ub3QgdXNlIHRoZXNlIGJpbmRpbmdzIHRvZ2V0aGVyIG9uIHRoZSBzYW1lIGVsZW1lbnQuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nSGFuZGxlclRoYXRDb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyA9IGJpbmRpbmdLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBSdW4gdXBkYXRlIGluIGl0cyBvd24gY29tcHV0ZWQgd3JhcHBlclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXJVcGRhdGVGbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVudE9ic2VydmFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJVcGRhdGVGbihub2RlLCBnZXRWYWx1ZUFjY2Vzc29yKGJpbmRpbmdLZXkpLCBhbGxCaW5kaW5ncywgYmluZGluZ0NvbnRleHRbJyRkYXRhJ10sIGJpbmRpbmdDb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IG5vZGUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGV4Lm1lc3NhZ2UgPSBcIlVuYWJsZSB0byBwcm9jZXNzIGJpbmRpbmcgXFxcIlwiICsgYmluZGluZ0tleSArIFwiOiBcIiArIGJpbmRpbmdzW2JpbmRpbmdLZXldICsgXCJcXFwiXFxuTWVzc2FnZTogXCIgKyBleC5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnc2hvdWxkQmluZERlc2NlbmRhbnRzJzogYmluZGluZ0hhbmRsZXJUaGF0Q29udHJvbHNEZXNjZW5kYW50QmluZGluZ3MgPT09IHVuZGVmaW5lZFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgc3RvcmVkQmluZGluZ0NvbnRleHREb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG4gICAga28uc3RvcmVkQmluZGluZ0NvbnRleHRGb3JOb2RlID0gZnVuY3Rpb24gKG5vZGUsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KG5vZGUsIHN0b3JlZEJpbmRpbmdDb250ZXh0RG9tRGF0YUtleSwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGJpbmRpbmdDb250ZXh0Ll9zdWJzY3JpYmFibGUpXG4gICAgICAgICAgICAgICAgYmluZGluZ0NvbnRleHQuX3N1YnNjcmliYWJsZS5fYWRkTm9kZShub2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBrby51dGlscy5kb21EYXRhLmdldChub2RlLCBzdG9yZWRCaW5kaW5nQ29udGV4dERvbURhdGFLZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QmluZGluZ0NvbnRleHQodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCkge1xuICAgICAgICByZXR1cm4gdmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCAmJiAodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCBpbnN0YW5jZW9mIGtvLmJpbmRpbmdDb250ZXh0KVxuICAgICAgICAgICAgPyB2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0XG4gICAgICAgICAgICA6IG5ldyBrby5iaW5kaW5nQ29udGV4dCh2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0KTtcbiAgICB9XG5cbiAgICBrby5hcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGUgPSBmdW5jdGlvbiAobm9kZSwgYmluZGluZ3MsIHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIC8vIElmIGl0J3MgYW4gZWxlbWVudCwgd29ya2Fyb3VuZCBJRSA8PSA4IEhUTUwgcGFyc2luZyB3ZWlyZG5lc3NcbiAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5ub3JtYWxpc2VWaXJ0dWFsRWxlbWVudERvbVN0cnVjdHVyZShub2RlKTtcbiAgICAgICAgcmV0dXJuIGFwcGx5QmluZGluZ3NUb05vZGVJbnRlcm5hbChub2RlLCBiaW5kaW5ncywgZ2V0QmluZGluZ0NvbnRleHQodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCksIHRydWUpO1xuICAgIH07XG5cbiAgICBrby5hcHBseUJpbmRpbmdzVG9Ob2RlID0gZnVuY3Rpb24gKG5vZGUsIGJpbmRpbmdzLCB2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gZ2V0QmluZGluZ0NvbnRleHQodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCk7XG4gICAgICAgIHJldHVybiBrby5hcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGUobm9kZSwgbWFrZUJpbmRpbmdBY2Nlc3NvcnMoYmluZGluZ3MsIGNvbnRleHQsIG5vZGUpLCBjb250ZXh0KTtcbiAgICB9O1xuXG4gICAga28uYXBwbHlCaW5kaW5nc1RvRGVzY2VuZGFudHMgPSBmdW5jdGlvbih2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0LCByb290Tm9kZSkge1xuICAgICAgICBpZiAocm9vdE5vZGUubm9kZVR5cGUgPT09IDEgfHwgcm9vdE5vZGUubm9kZVR5cGUgPT09IDgpXG4gICAgICAgICAgICBhcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50c0ludGVybmFsKGdldEJpbmRpbmdDb250ZXh0KHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHQpLCByb290Tm9kZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIGtvLmFwcGx5QmluZGluZ3MgPSBmdW5jdGlvbiAodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCwgcm9vdE5vZGUpIHtcbiAgICAgICAgLy8gSWYgalF1ZXJ5IGlzIGxvYWRlZCBhZnRlciBLbm9ja291dCwgd2Ugd29uJ3QgaW5pdGlhbGx5IGhhdmUgYWNjZXNzIHRvIGl0LiBTbyBzYXZlIGl0IGhlcmUuXG4gICAgICAgIGlmICghalF1ZXJ5SW5zdGFuY2UgJiYgd2luZG93WydqUXVlcnknXSkge1xuICAgICAgICAgICAgalF1ZXJ5SW5zdGFuY2UgPSB3aW5kb3dbJ2pRdWVyeSddO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvb3ROb2RlICYmIChyb290Tm9kZS5ub2RlVHlwZSAhPT0gMSkgJiYgKHJvb3ROb2RlLm5vZGVUeXBlICE9PSA4KSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImtvLmFwcGx5QmluZGluZ3M6IGZpcnN0IHBhcmFtZXRlciBzaG91bGQgYmUgeW91ciB2aWV3IG1vZGVsOyBzZWNvbmQgcGFyYW1ldGVyIHNob3VsZCBiZSBhIERPTSBub2RlXCIpO1xuICAgICAgICByb290Tm9kZSA9IHJvb3ROb2RlIHx8IHdpbmRvdy5kb2N1bWVudC5ib2R5OyAvLyBNYWtlIFwicm9vdE5vZGVcIiBwYXJhbWV0ZXIgb3B0aW9uYWxcblxuICAgICAgICBhcHBseUJpbmRpbmdzVG9Ob2RlQW5kRGVzY2VuZGFudHNJbnRlcm5hbChnZXRCaW5kaW5nQ29udGV4dCh2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0KSwgcm9vdE5vZGUsIHRydWUpO1xuICAgIH07XG5cbiAgICAvLyBSZXRyaWV2aW5nIGJpbmRpbmcgY29udGV4dCBmcm9tIGFyYml0cmFyeSBub2Rlc1xuICAgIGtvLmNvbnRleHRGb3IgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIC8vIFdlIGNhbiBvbmx5IGRvIHNvbWV0aGluZyBtZWFuaW5nZnVsIGZvciBlbGVtZW50cyBhbmQgY29tbWVudCBub2RlcyAoaW4gcGFydGljdWxhciwgbm90IHRleHQgbm9kZXMsIGFzIElFIGNhbid0IHN0b3JlIGRvbWRhdGEgZm9yIHRoZW0pXG4gICAgICAgIHN3aXRjaCAobm9kZS5ub2RlVHlwZSkge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0ga28uc3RvcmVkQmluZGluZ0NvbnRleHRGb3JOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0KSByZXR1cm4gY29udGV4dDtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlKSByZXR1cm4ga28uY29udGV4dEZvcihub2RlLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICBrby5kYXRhRm9yID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgY29udGV4dCA9IGtvLmNvbnRleHRGb3Iobm9kZSk7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID8gY29udGV4dFsnJGRhdGEnXSA6IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAga28uZXhwb3J0U3ltYm9sKCdiaW5kaW5nSGFuZGxlcnMnLCBrby5iaW5kaW5nSGFuZGxlcnMpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgnYXBwbHlCaW5kaW5ncycsIGtvLmFwcGx5QmluZGluZ3MpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgnYXBwbHlCaW5kaW5nc1RvRGVzY2VuZGFudHMnLCBrby5hcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50cyk7XG4gICAga28uZXhwb3J0U3ltYm9sKCdhcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGUnLCBrby5hcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGUpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgnYXBwbHlCaW5kaW5nc1RvTm9kZScsIGtvLmFwcGx5QmluZGluZ3NUb05vZGUpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgnY29udGV4dEZvcicsIGtvLmNvbnRleHRGb3IpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgnZGF0YUZvcicsIGtvLmRhdGFGb3IpO1xufSkoKTtcbihmdW5jdGlvbih1bmRlZmluZWQpIHtcbiAgICB2YXIgbG9hZGluZ1N1YnNjcmliYWJsZXNDYWNoZSA9IHt9LCAvLyBUcmFja3MgY29tcG9uZW50IGxvYWRzIHRoYXQgYXJlIGN1cnJlbnRseSBpbiBmbGlnaHRcbiAgICAgICAgbG9hZGVkRGVmaW5pdGlvbnNDYWNoZSA9IHt9OyAgICAvLyBUcmFja3MgY29tcG9uZW50IGxvYWRzIHRoYXQgaGF2ZSBhbHJlYWR5IGNvbXBsZXRlZFxuXG4gICAga28uY29tcG9uZW50cyA9IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbihjb21wb25lbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNhY2hlZERlZmluaXRpb24gPSBnZXRPYmplY3RPd25Qcm9wZXJ0eShsb2FkZWREZWZpbml0aW9uc0NhY2hlLCBjb21wb25lbnROYW1lKTtcbiAgICAgICAgICAgIGlmIChjYWNoZWREZWZpbml0aW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBhbHJlYWR5IGxvYWRlZCBhbmQgY2FjaGVkLiBSZXVzZSB0aGUgc2FtZSBkZWZpbml0aW9uIG9iamVjdC5cbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgZm9yIEFQSSBjb25zaXN0ZW5jeSwgZXZlbiBjYWNoZSBoaXRzIGNvbXBsZXRlIGFzeW5jaHJvbm91c2x5IGJ5IGRlZmF1bHQuXG4gICAgICAgICAgICAgICAgLy8gWW91IGNhbiBieXBhc3MgdGhpcyBieSBwdXR0aW5nIHN5bmNocm9ub3VzOnRydWUgb24geW91ciBjb21wb25lbnQgY29uZmlnLlxuICAgICAgICAgICAgICAgIGlmIChjYWNoZWREZWZpbml0aW9uLmlzU3luY2hyb25vdXNDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUoZnVuY3Rpb24oKSB7IC8vIFNlZSBjb21tZW50IGluIGxvYWRlclJlZ2lzdHJ5QmVoYXZpb3JzLmpzIGZvciByZWFzb25pbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNhY2hlZERlZmluaXRpb24uZGVmaW5pdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGNhY2hlZERlZmluaXRpb24uZGVmaW5pdGlvbik7IH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSm9pbiB0aGUgbG9hZGluZyBwcm9jZXNzIHRoYXQgaXMgYWxyZWFkeSB1bmRlcndheSwgb3Igc3RhcnQgYSBuZXcgb25lLlxuICAgICAgICAgICAgICAgIGxvYWRDb21wb25lbnRBbmROb3RpZnkoY29tcG9uZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyQ2FjaGVkRGVmaW5pdGlvbjogZnVuY3Rpb24oY29tcG9uZW50TmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIGxvYWRlZERlZmluaXRpb25zQ2FjaGVbY29tcG9uZW50TmFtZV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldEZpcnN0UmVzdWx0RnJvbUxvYWRlcnM6IGdldEZpcnN0UmVzdWx0RnJvbUxvYWRlcnNcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0T2JqZWN0T3duUHJvcGVydHkob2JqLCBwcm9wTmFtZSkge1xuICAgICAgICByZXR1cm4gb2JqLmhhc093blByb3BlcnR5KHByb3BOYW1lKSA/IG9ialtwcm9wTmFtZV0gOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZENvbXBvbmVudEFuZE5vdGlmeShjb21wb25lbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc3Vic2NyaWJhYmxlID0gZ2V0T2JqZWN0T3duUHJvcGVydHkobG9hZGluZ1N1YnNjcmliYWJsZXNDYWNoZSwgY29tcG9uZW50TmFtZSksXG4gICAgICAgICAgICBjb21wbGV0ZWRBc3luYztcbiAgICAgICAgaWYgKCFzdWJzY3JpYmFibGUpIHtcbiAgICAgICAgICAgIC8vIEl0J3Mgbm90IHN0YXJ0ZWQgbG9hZGluZyB5ZXQuIFN0YXJ0IGxvYWRpbmcsIGFuZCB3aGVuIGl0J3MgZG9uZSwgbW92ZSBpdCB0byBsb2FkZWREZWZpbml0aW9uc0NhY2hlLlxuICAgICAgICAgICAgc3Vic2NyaWJhYmxlID0gbG9hZGluZ1N1YnNjcmliYWJsZXNDYWNoZVtjb21wb25lbnROYW1lXSA9IG5ldyBrby5zdWJzY3JpYmFibGUoKTtcbiAgICAgICAgICAgIHN1YnNjcmliYWJsZS5zdWJzY3JpYmUoY2FsbGJhY2spO1xuXG4gICAgICAgICAgICBiZWdpbkxvYWRpbmdDb21wb25lbnQoY29tcG9uZW50TmFtZSwgZnVuY3Rpb24oZGVmaW5pdGlvbiwgY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzU3luY2hyb25vdXNDb21wb25lbnQgPSAhIShjb25maWcgJiYgY29uZmlnWydzeW5jaHJvbm91cyddKTtcbiAgICAgICAgICAgICAgICBsb2FkZWREZWZpbml0aW9uc0NhY2hlW2NvbXBvbmVudE5hbWVdID0geyBkZWZpbml0aW9uOiBkZWZpbml0aW9uLCBpc1N5bmNocm9ub3VzQ29tcG9uZW50OiBpc1N5bmNocm9ub3VzQ29tcG9uZW50IH07XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvYWRpbmdTdWJzY3JpYmFibGVzQ2FjaGVbY29tcG9uZW50TmFtZV07XG5cbiAgICAgICAgICAgICAgICAvLyBGb3IgQVBJIGNvbnNpc3RlbmN5LCBhbGwgbG9hZHMgY29tcGxldGUgYXN5bmNocm9ub3VzbHkuIEhvd2V2ZXIgd2Ugd2FudCB0byBhdm9pZFxuICAgICAgICAgICAgICAgIC8vIGFkZGluZyBhbiBleHRyYSBzZXRUaW1lb3V0IGlmIGl0J3MgdW5uZWNlc3NhcnkgKGkuZS4sIHRoZSBjb21wbGV0aW9uIGlzIGFscmVhZHlcbiAgICAgICAgICAgICAgICAvLyBhc3luYykgc2luY2Ugc2V0VGltZW91dCguLi4sIDApIHN0aWxsIHRha2VzIGFib3V0IDE2bXMgb3IgbW9yZSBvbiBtb3N0IGJyb3dzZXJzLlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gWW91IGNhbiBieXBhc3MgdGhlICdhbHdheXMgc3luY2hyb25vdXMnIGZlYXR1cmUgYnkgcHV0dGluZyB0aGUgc3luY2hyb25vdXM6dHJ1ZVxuICAgICAgICAgICAgICAgIC8vIGZsYWcgb24geW91ciBjb21wb25lbnQgY29uZmlndXJhdGlvbiB3aGVuIHlvdSByZWdpc3RlciBpdC5cbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkQXN5bmMgfHwgaXNTeW5jaHJvbm91c0NvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgbm90aWZ5U3Vic2NyaWJlcnMgaWdub3JlcyBhbnkgZGVwZW5kZW5jaWVzIHJlYWQgd2l0aGluIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2VlIGNvbW1lbnQgaW4gbG9hZGVyUmVnaXN0cnlCZWhhdmlvcnMuanMgZm9yIHJlYXNvbmluZ1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmFibGVbJ25vdGlmeVN1YnNjcmliZXJzJ10oZGVmaW5pdGlvbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliYWJsZVsnbm90aWZ5U3Vic2NyaWJlcnMnXShkZWZpbml0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb21wbGV0ZWRBc3luYyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdWJzY3JpYmFibGUuc3Vic2NyaWJlKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJlZ2luTG9hZGluZ0NvbXBvbmVudChjb21wb25lbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICBnZXRGaXJzdFJlc3VsdEZyb21Mb2FkZXJzKCdnZXRDb25maWcnLCBbY29tcG9uZW50TmFtZV0sIGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICAgICAgaWYgKGNvbmZpZykge1xuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBjb25maWcsIHNvIG5vdyBsb2FkIGl0cyBkZWZpbml0aW9uXG4gICAgICAgICAgICAgICAgZ2V0Rmlyc3RSZXN1bHRGcm9tTG9hZGVycygnbG9hZENvbXBvbmVudCcsIFtjb21wb25lbnROYW1lLCBjb25maWddLCBmdW5jdGlvbihkZWZpbml0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRlZmluaXRpb24sIGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBjb21wb25lbnQgaGFzIG5vIGNvbmZpZyAtIGl0J3MgdW5rbm93biB0byBhbGwgdGhlIGxvYWRlcnMuXG4gICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgbm90IGFuIGVycm9yIChlLmcuLCBhIG1vZHVsZSBsb2FkaW5nIGVycm9yKSAtIHRoYXQgd291bGQgYWJvcnQgdGhlXG4gICAgICAgICAgICAgICAgLy8gcHJvY2VzcyBhbmQgdGhpcyBjYWxsYmFjayB3b3VsZCBub3QgcnVuLiBGb3IgdGhpcyBjYWxsYmFjayB0byBydW4sIGFsbCBsb2FkZXJzIG11c3RcbiAgICAgICAgICAgICAgICAvLyBoYXZlIGNvbmZpcm1lZCB0aGV5IGRvbid0IGtub3cgYWJvdXQgdGhpcyBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEZpcnN0UmVzdWx0RnJvbUxvYWRlcnMobWV0aG9kTmFtZSwgYXJnc0V4Y2VwdENhbGxiYWNrLCBjYWxsYmFjaywgY2FuZGlkYXRlTG9hZGVycykge1xuICAgICAgICAvLyBPbiB0aGUgZmlyc3QgY2FsbCBpbiB0aGUgc3RhY2ssIHN0YXJ0IHdpdGggdGhlIGZ1bGwgc2V0IG9mIGxvYWRlcnNcbiAgICAgICAgaWYgKCFjYW5kaWRhdGVMb2FkZXJzKSB7XG4gICAgICAgICAgICBjYW5kaWRhdGVMb2FkZXJzID0ga28uY29tcG9uZW50c1snbG9hZGVycyddLnNsaWNlKDApOyAvLyBVc2UgYSBjb3B5LCBiZWNhdXNlIHdlJ2xsIGJlIG11dGF0aW5nIHRoaXMgYXJyYXlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRyeSB0aGUgbmV4dCBjYW5kaWRhdGVcbiAgICAgICAgdmFyIGN1cnJlbnRDYW5kaWRhdGVMb2FkZXIgPSBjYW5kaWRhdGVMb2FkZXJzLnNoaWZ0KCk7XG4gICAgICAgIGlmIChjdXJyZW50Q2FuZGlkYXRlTG9hZGVyKSB7XG4gICAgICAgICAgICB2YXIgbWV0aG9kSW5zdGFuY2UgPSBjdXJyZW50Q2FuZGlkYXRlTG9hZGVyW21ldGhvZE5hbWVdO1xuICAgICAgICAgICAgaWYgKG1ldGhvZEluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdhc0Fib3J0ZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc3luY2hyb25vdXNSZXR1cm5WYWx1ZSA9IG1ldGhvZEluc3RhbmNlLmFwcGx5KGN1cnJlbnRDYW5kaWRhdGVMb2FkZXIsIGFyZ3NFeGNlcHRDYWxsYmFjay5jb25jYXQoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2FzQWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNhbmRpZGF0ZSByZXR1cm5lZCBhIHZhbHVlLiBVc2UgaXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IHRoZSBuZXh0IGNhbmRpZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldEZpcnN0UmVzdWx0RnJvbUxvYWRlcnMobWV0aG9kTmFtZSwgYXJnc0V4Y2VwdENhbGxiYWNrLCBjYWxsYmFjaywgY2FuZGlkYXRlTG9hZGVycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnRseSwgbG9hZGVycyBtYXkgbm90IHJldHVybiBhbnl0aGluZyBzeW5jaHJvbm91c2x5LiBUaGlzIGxlYXZlcyBvcGVuIHRoZSBwb3NzaWJpbGl0eVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2UnbGwgZXh0ZW5kIHRoZSBBUEkgdG8gc3VwcG9ydCBzeW5jaHJvbm91cyByZXR1cm4gdmFsdWVzIGluIHRoZSBmdXR1cmUuIEl0IHdvbid0IGJlXG4gICAgICAgICAgICAgICAgLy8gYSBicmVha2luZyBjaGFuZ2UsIGJlY2F1c2UgY3VycmVudGx5IG5vIGxvYWRlciBpcyBhbGxvd2VkIHRvIHJldHVybiBhbnl0aGluZyBleGNlcHQgdW5kZWZpbmVkLlxuICAgICAgICAgICAgICAgIGlmIChzeW5jaHJvbm91c1JldHVyblZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgd2FzQWJvcnRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gTWV0aG9kIHRvIHN1cHByZXNzIGV4Y2VwdGlvbnMgd2lsbCByZW1haW4gdW5kb2N1bWVudGVkLiBUaGlzIGlzIG9ubHkgdG8ga2VlcFxuICAgICAgICAgICAgICAgICAgICAvLyBLTydzIHNwZWNzIHJ1bm5pbmcgdGlkaWx5LCBzaW5jZSB3ZSBjYW4gb2JzZXJ2ZSB0aGUgbG9hZGluZyBnb3QgYWJvcnRlZCB3aXRob3V0XG4gICAgICAgICAgICAgICAgICAgIC8vIGhhdmluZyBleGNlcHRpb25zIGNsdXR0ZXJpbmcgdXAgdGhlIGNvbnNvbGUgdG9vLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRDYW5kaWRhdGVMb2FkZXJbJ3N1cHByZXNzTG9hZGVyRXhjZXB0aW9ucyddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBsb2FkZXJzIG11c3Qgc3VwcGx5IHZhbHVlcyBieSBpbnZva2luZyB0aGUgY2FsbGJhY2ssIG5vdCBieSByZXR1cm5pbmcgdmFsdWVzIHN5bmNocm9ub3VzbHkuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgY2FuZGlkYXRlIGRvZXNuJ3QgaGF2ZSB0aGUgcmVsZXZhbnQgaGFuZGxlci4gU3luY2hyb25vdXNseSBtb3ZlIG9uIHRvIHRoZSBuZXh0IG9uZS5cbiAgICAgICAgICAgICAgICBnZXRGaXJzdFJlc3VsdEZyb21Mb2FkZXJzKG1ldGhvZE5hbWUsIGFyZ3NFeGNlcHRDYWxsYmFjaywgY2FsbGJhY2ssIGNhbmRpZGF0ZUxvYWRlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm8gY2FuZGlkYXRlcyByZXR1cm5lZCBhIHZhbHVlXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlZmVyZW5jZSB0aGUgbG9hZGVycyB2aWEgc3RyaW5nIG5hbWUgc28gaXQncyBwb3NzaWJsZSBmb3IgZGV2ZWxvcGVyc1xuICAgIC8vIHRvIHJlcGxhY2UgdGhlIHdob2xlIGFycmF5IGJ5IGFzc2lnbmluZyB0byBrby5jb21wb25lbnRzLmxvYWRlcnNcbiAgICBrby5jb21wb25lbnRzWydsb2FkZXJzJ10gPSBbXTtcblxuICAgIGtvLmV4cG9ydFN5bWJvbCgnY29tcG9uZW50cycsIGtvLmNvbXBvbmVudHMpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgnY29tcG9uZW50cy5nZXQnLCBrby5jb21wb25lbnRzLmdldCk7XG4gICAga28uZXhwb3J0U3ltYm9sKCdjb21wb25lbnRzLmNsZWFyQ2FjaGVkRGVmaW5pdGlvbicsIGtvLmNvbXBvbmVudHMuY2xlYXJDYWNoZWREZWZpbml0aW9uKTtcbn0pKCk7XG4oZnVuY3Rpb24odW5kZWZpbmVkKSB7XG5cbiAgICAvLyBUaGUgZGVmYXVsdCBsb2FkZXIgaXMgcmVzcG9uc2libGUgZm9yIHR3byB0aGluZ3M6XG4gICAgLy8gMS4gTWFpbnRhaW5pbmcgdGhlIGRlZmF1bHQgaW4tbWVtb3J5IHJlZ2lzdHJ5IG9mIGNvbXBvbmVudCBjb25maWd1cmF0aW9uIG9iamVjdHNcbiAgICAvLyAgICAoaS5lLiwgdGhlIHRoaW5nIHlvdSdyZSB3cml0aW5nIHRvIHdoZW4geW91IGNhbGwga28uY29tcG9uZW50cy5yZWdpc3Rlcihzb21lTmFtZSwgLi4uKSlcbiAgICAvLyAyLiBBbnN3ZXJpbmcgcmVxdWVzdHMgZm9yIGNvbXBvbmVudHMgYnkgZmV0Y2hpbmcgY29uZmlndXJhdGlvbiBvYmplY3RzXG4gICAgLy8gICAgZnJvbSB0aGF0IGRlZmF1bHQgaW4tbWVtb3J5IHJlZ2lzdHJ5IGFuZCByZXNvbHZpbmcgdGhlbSBpbnRvIHN0YW5kYXJkXG4gICAgLy8gICAgY29tcG9uZW50IGRlZmluaXRpb24gb2JqZWN0cyAob2YgdGhlIGZvcm0geyBjcmVhdGVWaWV3TW9kZWw6IC4uLiwgdGVtcGxhdGU6IC4uLiB9KVxuICAgIC8vIEN1c3RvbSBsb2FkZXJzIG1heSBvdmVycmlkZSBlaXRoZXIgb2YgdGhlc2UgZmFjaWxpdGllcywgaS5lLixcbiAgICAvLyAxLiBUbyBzdXBwbHkgY29uZmlndXJhdGlvbiBvYmplY3RzIGZyb20gc29tZSBvdGhlciBzb3VyY2UgKGUuZy4sIGNvbnZlbnRpb25zKVxuICAgIC8vIDIuIE9yLCB0byByZXNvbHZlIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyBieSBsb2FkaW5nIHZpZXdtb2RlbHMvdGVtcGxhdGVzIHZpYSBhcmJpdHJhcnkgbG9naWMuXG5cbiAgICB2YXIgZGVmYXVsdENvbmZpZ1JlZ2lzdHJ5ID0ge307XG5cbiAgICBrby5jb21wb25lbnRzLnJlZ2lzdGVyID0gZnVuY3Rpb24oY29tcG9uZW50TmFtZSwgY29uZmlnKSB7XG4gICAgICAgIGlmICghY29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29uZmlndXJhdGlvbiBmb3IgJyArIGNvbXBvbmVudE5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtvLmNvbXBvbmVudHMuaXNSZWdpc3RlcmVkKGNvbXBvbmVudE5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCAnICsgY29tcG9uZW50TmFtZSArICcgaXMgYWxyZWFkeSByZWdpc3RlcmVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZhdWx0Q29uZmlnUmVnaXN0cnlbY29tcG9uZW50TmFtZV0gPSBjb25maWc7XG4gICAgfVxuXG4gICAga28uY29tcG9uZW50cy5pc1JlZ2lzdGVyZWQgPSBmdW5jdGlvbihjb21wb25lbnROYW1lKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnROYW1lIGluIGRlZmF1bHRDb25maWdSZWdpc3RyeTtcbiAgICB9XG5cbiAgICBrby5jb21wb25lbnRzLnVucmVnaXN0ZXIgPSBmdW5jdGlvbihjb21wb25lbnROYW1lKSB7XG4gICAgICAgIGRlbGV0ZSBkZWZhdWx0Q29uZmlnUmVnaXN0cnlbY29tcG9uZW50TmFtZV07XG4gICAgICAgIGtvLmNvbXBvbmVudHMuY2xlYXJDYWNoZWREZWZpbml0aW9uKGNvbXBvbmVudE5hbWUpO1xuICAgIH1cblxuICAgIGtvLmNvbXBvbmVudHMuZGVmYXVsdExvYWRlciA9IHtcbiAgICAgICAgJ2dldENvbmZpZyc6IGZ1bmN0aW9uKGNvbXBvbmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZGVmYXVsdENvbmZpZ1JlZ2lzdHJ5Lmhhc093blByb3BlcnR5KGNvbXBvbmVudE5hbWUpXG4gICAgICAgICAgICAgICAgPyBkZWZhdWx0Q29uZmlnUmVnaXN0cnlbY29tcG9uZW50TmFtZV1cbiAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQpO1xuICAgICAgICB9LFxuXG4gICAgICAgICdsb2FkQ29tcG9uZW50JzogZnVuY3Rpb24oY29tcG9uZW50TmFtZSwgY29uZmlnLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGVycm9yQ2FsbGJhY2sgPSBtYWtlRXJyb3JDYWxsYmFjayhjb21wb25lbnROYW1lKTtcbiAgICAgICAgICAgIHBvc3NpYmx5R2V0Q29uZmlnRnJvbUFtZChlcnJvckNhbGxiYWNrLCBjb25maWcsIGZ1bmN0aW9uKGxvYWRlZENvbmZpZykge1xuICAgICAgICAgICAgICAgIHJlc29sdmVDb25maWcoY29tcG9uZW50TmFtZSwgZXJyb3JDYWxsYmFjaywgbG9hZGVkQ29uZmlnLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAnbG9hZFRlbXBsYXRlJzogZnVuY3Rpb24oY29tcG9uZW50TmFtZSwgdGVtcGxhdGVDb25maWcsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXNvbHZlVGVtcGxhdGUobWFrZUVycm9yQ2FsbGJhY2soY29tcG9uZW50TmFtZSksIHRlbXBsYXRlQ29uZmlnLCBjYWxsYmFjayk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgJ2xvYWRWaWV3TW9kZWwnOiBmdW5jdGlvbihjb21wb25lbnROYW1lLCB2aWV3TW9kZWxDb25maWcsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXNvbHZlVmlld01vZGVsKG1ha2VFcnJvckNhbGxiYWNrKGNvbXBvbmVudE5hbWUpLCB2aWV3TW9kZWxDb25maWcsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlVmlld01vZGVsS2V5ID0gJ2NyZWF0ZVZpZXdNb2RlbCc7XG5cbiAgICAvLyBUYWtlcyBhIGNvbmZpZyBvYmplY3Qgb2YgdGhlIGZvcm0geyB0ZW1wbGF0ZTogLi4uLCB2aWV3TW9kZWw6IC4uLiB9LCBhbmQgYXN5bmNocm9ub3VzbHkgY29udmVydCBpdFxuICAgIC8vIGludG8gdGhlIHN0YW5kYXJkIGNvbXBvbmVudCBkZWZpbml0aW9uIGZvcm1hdDpcbiAgICAvLyAgICB7IHRlbXBsYXRlOiA8QXJyYXlPZkRvbU5vZGVzPiwgY3JlYXRlVmlld01vZGVsOiBmdW5jdGlvbihwYXJhbXMsIGNvbXBvbmVudEluZm8pIHsgLi4uIH0gfS5cbiAgICAvLyBTaW5jZSBib3RoIHRlbXBsYXRlIGFuZCB2aWV3TW9kZWwgbWF5IG5lZWQgdG8gYmUgcmVzb2x2ZWQgYXN5bmNocm9ub3VzbHksIGJvdGggdGFza3MgYXJlIHBlcmZvcm1lZFxuICAgIC8vIGluIHBhcmFsbGVsLCBhbmQgdGhlIHJlc3VsdHMgam9pbmVkIHdoZW4gYm90aCBhcmUgcmVhZHkuIFdlIGRvbid0IGRlcGVuZCBvbiBhbnkgcHJvbWlzZXMgaW5mcmFzdHJ1Y3R1cmUsXG4gICAgLy8gc28gdGhpcyBpcyBpbXBsZW1lbnRlZCBtYW51YWxseSBiZWxvdy5cbiAgICBmdW5jdGlvbiByZXNvbHZlQ29uZmlnKGNvbXBvbmVudE5hbWUsIGVycm9yQ2FsbGJhY2ssIGNvbmZpZywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgICAgICAgICAgbWFrZUNhbGxCYWNrV2hlblplcm8gPSAyLFxuICAgICAgICAgICAgdHJ5SXNzdWVDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICgtLW1ha2VDYWxsQmFja1doZW5aZXJvID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlQ29uZmlnID0gY29uZmlnWyd0ZW1wbGF0ZSddLFxuICAgICAgICAgICAgdmlld01vZGVsQ29uZmlnID0gY29uZmlnWyd2aWV3TW9kZWwnXTtcblxuICAgICAgICBpZiAodGVtcGxhdGVDb25maWcpIHtcbiAgICAgICAgICAgIHBvc3NpYmx5R2V0Q29uZmlnRnJvbUFtZChlcnJvckNhbGxiYWNrLCB0ZW1wbGF0ZUNvbmZpZywgZnVuY3Rpb24obG9hZGVkQ29uZmlnKSB7XG4gICAgICAgICAgICAgICAga28uY29tcG9uZW50cy5fZ2V0Rmlyc3RSZXN1bHRGcm9tTG9hZGVycygnbG9hZFRlbXBsYXRlJywgW2NvbXBvbmVudE5hbWUsIGxvYWRlZENvbmZpZ10sIGZ1bmN0aW9uKHJlc29sdmVkVGVtcGxhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Wyd0ZW1wbGF0ZSddID0gcmVzb2x2ZWRUZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5SXNzdWVDYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cnlJc3N1ZUNhbGxiYWNrKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmlld01vZGVsQ29uZmlnKSB7XG4gICAgICAgICAgICBwb3NzaWJseUdldENvbmZpZ0Zyb21BbWQoZXJyb3JDYWxsYmFjaywgdmlld01vZGVsQ29uZmlnLCBmdW5jdGlvbihsb2FkZWRDb25maWcpIHtcbiAgICAgICAgICAgICAgICBrby5jb21wb25lbnRzLl9nZXRGaXJzdFJlc3VsdEZyb21Mb2FkZXJzKCdsb2FkVmlld01vZGVsJywgW2NvbXBvbmVudE5hbWUsIGxvYWRlZENvbmZpZ10sIGZ1bmN0aW9uKHJlc29sdmVkVmlld01vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjcmVhdGVWaWV3TW9kZWxLZXldID0gcmVzb2x2ZWRWaWV3TW9kZWw7XG4gICAgICAgICAgICAgICAgICAgIHRyeUlzc3VlQ2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5SXNzdWVDYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZVRlbXBsYXRlKGVycm9yQ2FsbGJhY2ssIHRlbXBsYXRlQ29uZmlnLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIHRlbXBsYXRlQ29uZmlnID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gTWFya3VwIC0gcGFyc2UgaXRcbiAgICAgICAgICAgIGNhbGxiYWNrKGtvLnV0aWxzLnBhcnNlSHRtbEZyYWdtZW50KHRlbXBsYXRlQ29uZmlnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGVDb25maWcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgLy8gQXNzdW1lIGFscmVhZHkgYW4gYXJyYXkgb2YgRE9NIG5vZGVzIC0gcGFzcyB0aHJvdWdoIHVuY2hhbmdlZFxuICAgICAgICAgICAgY2FsbGJhY2sodGVtcGxhdGVDb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRG9jdW1lbnRGcmFnbWVudCh0ZW1wbGF0ZUNvbmZpZykpIHtcbiAgICAgICAgICAgIC8vIERvY3VtZW50IGZyYWdtZW50IC0gdXNlIGl0cyBjaGlsZCBub2Rlc1xuICAgICAgICAgICAgY2FsbGJhY2soa28udXRpbHMubWFrZUFycmF5KHRlbXBsYXRlQ29uZmlnLmNoaWxkTm9kZXMpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wbGF0ZUNvbmZpZ1snZWxlbWVudCddKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IHRlbXBsYXRlQ29uZmlnWydlbGVtZW50J107XG4gICAgICAgICAgICBpZiAoaXNEb21FbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgLy8gRWxlbWVudCBpbnN0YW5jZSAtIGNvcHkgaXRzIGNoaWxkIG5vZGVzXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soY2xvbmVOb2Rlc0Zyb21UZW1wbGF0ZVNvdXJjZUVsZW1lbnQoZWxlbWVudCkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAvLyBFbGVtZW50IElEIC0gZmluZCBpdCwgdGhlbiBjb3B5IGl0cyBjaGlsZCBub2Rlc1xuICAgICAgICAgICAgICAgIHZhciBlbGVtSW5zdGFuY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbUluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNsb25lTm9kZXNGcm9tVGVtcGxhdGVTb3VyY2VFbGVtZW50KGVsZW1JbnN0YW5jZSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ2FsbGJhY2soJ0Nhbm5vdCBmaW5kIGVsZW1lbnQgd2l0aCBJRCAnICsgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvckNhbGxiYWNrKCdVbmtub3duIGVsZW1lbnQgdHlwZTogJyArIGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3JDYWxsYmFjaygnVW5rbm93biB0ZW1wbGF0ZSB2YWx1ZTogJyArIHRlbXBsYXRlQ29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVWaWV3TW9kZWwoZXJyb3JDYWxsYmFjaywgdmlld01vZGVsQ29uZmlnLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIHZpZXdNb2RlbENvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gQ29uc3RydWN0b3IgLSBjb252ZXJ0IHRvIHN0YW5kYXJkIGZhY3RvcnkgZnVuY3Rpb24gZm9ybWF0XG4gICAgICAgICAgICAvLyBCeSBkZXNpZ24sIHRoaXMgZG9lcyAqbm90KiBzdXBwbHkgY29tcG9uZW50SW5mbyB0byB0aGUgY29uc3RydWN0b3IsIGFzIHRoZSBpbnRlbnQgaXMgdGhhdFxuICAgICAgICAgICAgLy8gY29tcG9uZW50SW5mbyBjb250YWlucyBub24tdmlld21vZGVsIGRhdGEgKGUuZy4sIHRoZSBjb21wb25lbnQncyBlbGVtZW50KSB0aGF0IHNob3VsZCBvbmx5XG4gICAgICAgICAgICAvLyBiZSB1c2VkIGluIGZhY3RvcnkgZnVuY3Rpb25zLCBub3Qgdmlld21vZGVsIGNvbnN0cnVjdG9ycy5cbiAgICAgICAgICAgIGNhbGxiYWNrKGZ1bmN0aW9uIChwYXJhbXMgLyosIGNvbXBvbmVudEluZm8gKi8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHZpZXdNb2RlbENvbmZpZyhwYXJhbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZpZXdNb2RlbENvbmZpZ1tjcmVhdGVWaWV3TW9kZWxLZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBBbHJlYWR5IGEgZmFjdG9yeSBmdW5jdGlvbiAtIHVzZSBpdCBhcy1pc1xuICAgICAgICAgICAgY2FsbGJhY2sodmlld01vZGVsQ29uZmlnW2NyZWF0ZVZpZXdNb2RlbEtleV0pO1xuICAgICAgICB9IGVsc2UgaWYgKCdpbnN0YW5jZScgaW4gdmlld01vZGVsQ29uZmlnKSB7XG4gICAgICAgICAgICAvLyBGaXhlZCBvYmplY3QgaW5zdGFuY2UgLSBwcm9tb3RlIHRvIGNyZWF0ZVZpZXdNb2RlbCBmb3JtYXQgZm9yIEFQSSBjb25zaXN0ZW5jeVxuICAgICAgICAgICAgdmFyIGZpeGVkSW5zdGFuY2UgPSB2aWV3TW9kZWxDb25maWdbJ2luc3RhbmNlJ107XG4gICAgICAgICAgICBjYWxsYmFjayhmdW5jdGlvbiAocGFyYW1zLCBjb21wb25lbnRJbmZvKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVkSW5zdGFuY2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICgndmlld01vZGVsJyBpbiB2aWV3TW9kZWxDb25maWcpIHtcbiAgICAgICAgICAgIC8vIFJlc29sdmVkIEFNRCBtb2R1bGUgd2hvc2UgdmFsdWUgaXMgb2YgdGhlIGZvcm0geyB2aWV3TW9kZWw6IC4uLiB9XG4gICAgICAgICAgICByZXNvbHZlVmlld01vZGVsKGVycm9yQ2FsbGJhY2ssIHZpZXdNb2RlbENvbmZpZ1sndmlld01vZGVsJ10sIGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVycm9yQ2FsbGJhY2soJ1Vua25vd24gdmlld01vZGVsIHZhbHVlOiAnICsgdmlld01vZGVsQ29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsb25lTm9kZXNGcm9tVGVtcGxhdGVTb3VyY2VFbGVtZW50KGVsZW1JbnN0YW5jZSkge1xuICAgICAgICBzd2l0Y2ggKGtvLnV0aWxzLnRhZ05hbWVMb3dlcihlbGVtSW5zdGFuY2UpKSB7XG4gICAgICAgICAgICBjYXNlICdzY3JpcHQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBrby51dGlscy5wYXJzZUh0bWxGcmFnbWVudChlbGVtSW5zdGFuY2UudGV4dCk7XG4gICAgICAgICAgICBjYXNlICd0ZXh0YXJlYSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLnBhcnNlSHRtbEZyYWdtZW50KGVsZW1JbnN0YW5jZS52YWx1ZSk7XG4gICAgICAgICAgICBjYXNlICd0ZW1wbGF0ZSc6XG4gICAgICAgICAgICAgICAgLy8gRm9yIGJyb3dzZXJzIHdpdGggcHJvcGVyIDx0ZW1wbGF0ZT4gZWxlbWVudCBzdXBwb3J0IChpLmUuLCB3aGVyZSB0aGUgLmNvbnRlbnQgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAvLyBnaXZlcyBhIGRvY3VtZW50IGZyYWdtZW50KSwgdXNlIHRoYXQgZG9jdW1lbnQgZnJhZ21lbnQuXG4gICAgICAgICAgICAgICAgaWYgKGlzRG9jdW1lbnRGcmFnbWVudChlbGVtSW5zdGFuY2UuY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmNsb25lTm9kZXMoZWxlbUluc3RhbmNlLmNvbnRlbnQuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVndWxhciBlbGVtZW50cyBzdWNoIGFzIDxkaXY+LCBhbmQgPHRlbXBsYXRlPiBlbGVtZW50cyBvbiBvbGQgYnJvd3NlcnMgdGhhdCBkb24ndCByZWFsbHlcbiAgICAgICAgLy8gdW5kZXJzdGFuZCA8dGVtcGxhdGU+IGFuZCBqdXN0IHRyZWF0IGl0IGFzIGEgcmVndWxhciBjb250YWluZXJcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmNsb25lTm9kZXMoZWxlbUluc3RhbmNlLmNoaWxkTm9kZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRG9tRWxlbWVudChvYmopIHtcbiAgICAgICAgaWYgKHdpbmRvd1snSFRNTEVsZW1lbnQnXSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiAmJiBvYmoudGFnTmFtZSAmJiBvYmoubm9kZVR5cGUgPT09IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0RvY3VtZW50RnJhZ21lbnQob2JqKSB7XG4gICAgICAgIGlmICh3aW5kb3dbJ0RvY3VtZW50RnJhZ21lbnQnXSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb3NzaWJseUdldENvbmZpZ0Zyb21BbWQoZXJyb3JDYWxsYmFjaywgY29uZmlnLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGNvbmZpZ1sncmVxdWlyZSddID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gVGhlIGNvbmZpZyBpcyB0aGUgdmFsdWUgb2YgYW4gQU1EIG1vZHVsZVxuICAgICAgICAgICAgaWYgKGFtZFJlcXVpcmUgfHwgd2luZG93WydyZXF1aXJlJ10pIHtcbiAgICAgICAgICAgICAgICAoYW1kUmVxdWlyZSB8fCB3aW5kb3dbJ3JlcXVpcmUnXSkoW2NvbmZpZ1sncmVxdWlyZSddXSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvckNhbGxiYWNrKCdVc2VzIHJlcXVpcmUsIGJ1dCBubyBBTUQgbG9hZGVyIGlzIHByZXNlbnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlRXJyb3JDYWxsYmFjayhjb21wb25lbnROYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgXFwnJyArIGNvbXBvbmVudE5hbWUgKyAnXFwnOiAnICsgbWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAga28uZXhwb3J0U3ltYm9sKCdjb21wb25lbnRzLnJlZ2lzdGVyJywga28uY29tcG9uZW50cy5yZWdpc3Rlcik7XG4gICAga28uZXhwb3J0U3ltYm9sKCdjb21wb25lbnRzLmlzUmVnaXN0ZXJlZCcsIGtvLmNvbXBvbmVudHMuaXNSZWdpc3RlcmVkKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ2NvbXBvbmVudHMudW5yZWdpc3RlcicsIGtvLmNvbXBvbmVudHMudW5yZWdpc3Rlcik7XG5cbiAgICAvLyBFeHBvc2UgdGhlIGRlZmF1bHQgbG9hZGVyIHNvIHRoYXQgZGV2ZWxvcGVycyBjYW4gZGlyZWN0bHkgYXNrIGl0IGZvciBjb25maWd1cmF0aW9uXG4gICAgLy8gb3IgdG8gcmVzb2x2ZSBjb25maWd1cmF0aW9uXG4gICAga28uZXhwb3J0U3ltYm9sKCdjb21wb25lbnRzLmRlZmF1bHRMb2FkZXInLCBrby5jb21wb25lbnRzLmRlZmF1bHRMb2FkZXIpO1xuXG4gICAgLy8gQnkgZGVmYXVsdCwgdGhlIGRlZmF1bHQgbG9hZGVyIGlzIHRoZSBvbmx5IHJlZ2lzdGVyZWQgY29tcG9uZW50IGxvYWRlclxuICAgIGtvLmNvbXBvbmVudHNbJ2xvYWRlcnMnXS5wdXNoKGtvLmNvbXBvbmVudHMuZGVmYXVsdExvYWRlcik7XG5cbiAgICAvLyBQcml2YXRlbHkgZXhwb3NlIHRoZSB1bmRlcmx5aW5nIGNvbmZpZyByZWdpc3RyeSBmb3IgdXNlIGluIG9sZC1JRSBzaGltXG4gICAga28uY29tcG9uZW50cy5fYWxsUmVnaXN0ZXJlZENvbXBvbmVudHMgPSBkZWZhdWx0Q29uZmlnUmVnaXN0cnk7XG59KSgpO1xuKGZ1bmN0aW9uICh1bmRlZmluZWQpIHtcbiAgICAvLyBPdmVycmlkYWJsZSBBUEkgZm9yIGRldGVybWluaW5nIHdoaWNoIGNvbXBvbmVudCBuYW1lIGFwcGxpZXMgdG8gYSBnaXZlbiBub2RlLiBCeSBvdmVycmlkaW5nIHRoaXMsXG4gICAgLy8geW91IGNhbiBmb3IgZXhhbXBsZSBtYXAgc3BlY2lmaWMgdGFnTmFtZXMgdG8gY29tcG9uZW50cyB0aGF0IGFyZSBub3QgcHJlcmVnaXN0ZXJlZC5cbiAgICBrby5jb21wb25lbnRzWydnZXRDb21wb25lbnROYW1lRm9yTm9kZSddID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgdGFnTmFtZUxvd2VyID0ga28udXRpbHMudGFnTmFtZUxvd2VyKG5vZGUpO1xuICAgICAgICByZXR1cm4ga28uY29tcG9uZW50cy5pc1JlZ2lzdGVyZWQodGFnTmFtZUxvd2VyKSAmJiB0YWdOYW1lTG93ZXI7XG4gICAgfTtcblxuICAgIGtvLmNvbXBvbmVudHMuYWRkQmluZGluZ3NGb3JDdXN0b21FbGVtZW50ID0gZnVuY3Rpb24oYWxsQmluZGluZ3MsIG5vZGUsIGJpbmRpbmdDb250ZXh0LCB2YWx1ZUFjY2Vzc29ycykge1xuICAgICAgICAvLyBEZXRlcm1pbmUgaWYgaXQncyByZWFsbHkgYSBjdXN0b20gZWxlbWVudCBtYXRjaGluZyBhIGNvbXBvbmVudFxuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudE5hbWUgPSBrby5jb21wb25lbnRzWydnZXRDb21wb25lbnROYW1lRm9yTm9kZSddKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJdCBkb2VzIHJlcHJlc2VudCBhIGNvbXBvbmVudCwgc28gYWRkIGEgY29tcG9uZW50IGJpbmRpbmcgZm9yIGl0XG4gICAgICAgICAgICAgICAgYWxsQmluZGluZ3MgPSBhbGxCaW5kaW5ncyB8fCB7fTtcblxuICAgICAgICAgICAgICAgIGlmIChhbGxCaW5kaW5nc1snY29tcG9uZW50J10pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXZvaWQgc2lsZW50bHkgb3ZlcndyaXRpbmcgc29tZSBvdGhlciAnY29tcG9uZW50JyBiaW5kaW5nIHRoYXQgbWF5IGFscmVhZHkgYmUgb24gdGhlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIHRoZSBcImNvbXBvbmVudFwiIGJpbmRpbmcgb24gYSBjdXN0b20gZWxlbWVudCBtYXRjaGluZyBhIGNvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRCaW5kaW5nVmFsdWUgPSB7ICduYW1lJzogY29tcG9uZW50TmFtZSwgJ3BhcmFtcyc6IGdldENvbXBvbmVudFBhcmFtc0Zyb21DdXN0b21FbGVtZW50KG5vZGUsIGJpbmRpbmdDb250ZXh0KSB9O1xuXG4gICAgICAgICAgICAgICAgYWxsQmluZGluZ3NbJ2NvbXBvbmVudCddID0gdmFsdWVBY2Nlc3NvcnNcbiAgICAgICAgICAgICAgICAgICAgPyBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbXBvbmVudEJpbmRpbmdWYWx1ZTsgfVxuICAgICAgICAgICAgICAgICAgICA6IGNvbXBvbmVudEJpbmRpbmdWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbGxCaW5kaW5ncztcbiAgICB9XG5cbiAgICB2YXIgbmF0aXZlQmluZGluZ1Byb3ZpZGVySW5zdGFuY2UgPSBuZXcga28uYmluZGluZ1Byb3ZpZGVyKCk7XG5cbiAgICBmdW5jdGlvbiBnZXRDb21wb25lbnRQYXJhbXNGcm9tQ3VzdG9tRWxlbWVudChlbGVtLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICB2YXIgcGFyYW1zQXR0cmlidXRlID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ3BhcmFtcycpO1xuXG4gICAgICAgIGlmIChwYXJhbXNBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBuYXRpdmVCaW5kaW5nUHJvdmlkZXJJbnN0YW5jZVsncGFyc2VCaW5kaW5nc1N0cmluZyddKHBhcmFtc0F0dHJpYnV0ZSwgYmluZGluZ0NvbnRleHQsIGVsZW0sIHsgJ3ZhbHVlQWNjZXNzb3JzJzogdHJ1ZSwgJ2JpbmRpbmdQYXJhbXMnOiB0cnVlIH0pLFxuICAgICAgICAgICAgICAgIHJhd1BhcmFtQ29tcHV0ZWRWYWx1ZXMgPSBrby51dGlscy5vYmplY3RNYXAocGFyYW1zLCBmdW5jdGlvbihwYXJhbVZhbHVlLCBwYXJhbU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtvLmNvbXB1dGVkKHBhcmFtVmFsdWUsIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBlbGVtIH0pO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGtvLnV0aWxzLm9iamVjdE1hcChyYXdQYXJhbUNvbXB1dGVkVmFsdWVzLCBmdW5jdGlvbihwYXJhbVZhbHVlQ29tcHV0ZWQsIHBhcmFtTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW1WYWx1ZSA9IHBhcmFtVmFsdWVDb21wdXRlZC5wZWVrKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvZXMgdGhlIGV2YWx1YXRpb24gb2YgdGhlIHBhcmFtZXRlciB2YWx1ZSB1bndyYXAgYW55IG9ic2VydmFibGVzP1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmFtVmFsdWVDb21wdXRlZC5pc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBObyBpdCBkb2Vzbid0LCBzbyB0aGVyZSdzIG5vIG5lZWQgZm9yIGFueSBjb21wdXRlZCB3cmFwcGVyLiBKdXN0IHBhc3MgdGhyb3VnaCB0aGUgc3VwcGxpZWQgdmFsdWUgZGlyZWN0bHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFeGFtcGxlOiBcInNvbWVWYWw6IGZpcnN0TmFtZSwgYWdlOiAxMjNcIiAod2hldGhlciBvciBub3QgZmlyc3ROYW1lIGlzIGFuIG9ic2VydmFibGUvY29tcHV0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1WYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFllcyBpdCBkb2VzLiBTdXBwbHkgYSBjb21wdXRlZCBwcm9wZXJ0eSB0aGF0IHVud3JhcHMgYm90aCB0aGUgb3V0ZXIgKGJpbmRpbmcgZXhwcmVzc2lvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldmVsIG9mIG9ic2VydmFiaWxpdHksIGFuZCBhbnkgaW5uZXIgKHJlc3VsdGluZyBtb2RlbCB2YWx1ZSkgbGV2ZWwgb2Ygb2JzZXJ2YWJpbGl0eS5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgbWVhbnMgdGhlIGNvbXBvbmVudCBkb2Vzbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgbXVsdGlwbGUgdW53cmFwcGluZy4gSWYgdGhlIHZhbHVlIGlzIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdyaXRhYmxlIG9ic2VydmFibGUsIHRoZSBjb21wdXRlZCB3aWxsIGFsc28gYmUgd3JpdGFibGUgYW5kIHBhc3MgdGhlIHZhbHVlIG9uIHRvIHRoZSBvYnNlcnZhYmxlLlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtvLmNvbXB1dGVkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVhZCc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShwYXJhbVZhbHVlQ29tcHV0ZWQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd3JpdGUnOiBrby5pc1dyaXRlYWJsZU9ic2VydmFibGUocGFyYW1WYWx1ZSkgJiYgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1WYWx1ZUNvbXB1dGVkKCkodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBlbGVtXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBHaXZlIGFjY2VzcyB0byB0aGUgcmF3IGNvbXB1dGVkcywgYXMgbG9uZyBhcyB0aGF0IHdvdWxkbid0IG92ZXJ3cml0ZSBhbnkgY3VzdG9tIHBhcmFtIGFsc28gY2FsbGVkICckcmF3J1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBpbiBjYXNlIHRoZSBkZXZlbG9wZXIgd2FudHMgdG8gcmVhY3QgdG8gb3V0ZXIgKGJpbmRpbmcpIG9ic2VydmFiaWxpdHkgc2VwYXJhdGVseSBmcm9tIGlubmVyXG4gICAgICAgICAgICAvLyAobW9kZWwgdmFsdWUpIG9ic2VydmFiaWxpdHksIG9yIGluIGNhc2UgdGhlIG1vZGVsIHZhbHVlIG9ic2VydmFibGUgaGFzIHN1Ym9ic2VydmFibGVzLlxuICAgICAgICAgICAgaWYgKCFyZXN1bHQuaGFzT3duUHJvcGVydHkoJyRyYXcnKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFsnJHJhdyddID0gcmF3UGFyYW1Db21wdXRlZFZhbHVlcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZvciBjb25zaXN0ZW5jeSwgYWJzZW5jZSBvZiBhIFwicGFyYW1zXCIgYXR0cmlidXRlIGlzIHRyZWF0ZWQgdGhlIHNhbWUgYXMgdGhlIHByZXNlbmNlIG9mXG4gICAgICAgICAgICAvLyBhbnkgZW1wdHkgb25lLiBPdGhlcndpc2UgY29tcG9uZW50IHZpZXdtb2RlbHMgbmVlZCBzcGVjaWFsIGNvZGUgdG8gY2hlY2sgd2hldGhlciBvciBub3RcbiAgICAgICAgICAgIC8vICdwYXJhbXMnIG9yICdwYXJhbXMuJHJhdycgaXMgbnVsbC91bmRlZmluZWQgYmVmb3JlIHJlYWRpbmcgc3VicHJvcGVydGllcywgd2hpY2ggaXMgYW5ub3lpbmcuXG4gICAgICAgICAgICByZXR1cm4geyAnJHJhdyc6IHt9IH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIENvbXBhdGliaWxpdHkgY29kZSBmb3Igb2xkZXIgKHByZS1IVE1MNSkgSUUgYnJvd3NlcnNcblxuICAgIGlmIChrby51dGlscy5pZVZlcnNpb24gPCA5KSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHlvdSBwcmVyZWdpc3RlciBhIGNvbXBvbmVudCwgZW5hYmxlIGl0IGFzIGEgY3VzdG9tIGVsZW1lbnQgaW4gdGhlIGN1cnJlbnQgZG9jdW1lbnRcbiAgICAgICAga28uY29tcG9uZW50c1sncmVnaXN0ZXInXSA9IChmdW5jdGlvbihvcmlnaW5hbEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oY29tcG9uZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoY29tcG9uZW50TmFtZSk7IC8vIEFsbG93cyBJRTw5IHRvIHBhcnNlIG1hcmt1cCBjb250YWluaW5nIHRoZSBjdXN0b20gZWxlbWVudFxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEZ1bmN0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKGtvLmNvbXBvbmVudHNbJ3JlZ2lzdGVyJ10pO1xuXG4gICAgICAgIC8vIFdoZW5ldmVyIHlvdSBjcmVhdGUgYSBkb2N1bWVudCBmcmFnbWVudCwgZW5hYmxlIGFsbCBwcmVyZWdpc3RlcmVkIGNvbXBvbmVudCBuYW1lcyBhcyBjdXN0b20gZWxlbWVudHNcbiAgICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gbWFrZSBpbm5lclNoaXYvalF1ZXJ5IEhUTUwgcGFyc2luZyBjb3JyZWN0bHkgaGFuZGxlIHRoZSBjdXN0b20gZWxlbWVudHNcbiAgICAgICAgZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCA9IChmdW5jdGlvbihvcmlnaW5hbEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld0RvY0ZyYWcgPSBvcmlnaW5hbEZ1bmN0aW9uKCksXG4gICAgICAgICAgICAgICAgICAgIGFsbENvbXBvbmVudHMgPSBrby5jb21wb25lbnRzLl9hbGxSZWdpc3RlcmVkQ29tcG9uZW50cztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjb21wb25lbnROYW1lIGluIGFsbENvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbENvbXBvbmVudHMuaGFzT3duUHJvcGVydHkoY29tcG9uZW50TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0RvY0ZyYWcuY3JlYXRlRWxlbWVudChjb21wb25lbnROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3RG9jRnJhZztcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQpO1xuICAgIH1cbn0pKCk7KGZ1bmN0aW9uKHVuZGVmaW5lZCkge1xuXG4gICAgdmFyIGNvbXBvbmVudExvYWRpbmdPcGVyYXRpb25VbmlxdWVJZCA9IDA7XG5cbiAgICBrby5iaW5kaW5nSGFuZGxlcnNbJ2NvbXBvbmVudCddID0ge1xuICAgICAgICAnaW5pdCc6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGlnbm9yZWQxLCBpZ25vcmVkMiwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50Vmlld01vZGVsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRMb2FkaW5nT3BlcmF0aW9uSWQsXG4gICAgICAgICAgICAgICAgZGlzcG9zZUFzc29jaWF0ZWRDb21wb25lbnRWaWV3TW9kZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Vmlld01vZGVsRGlzcG9zZSA9IGN1cnJlbnRWaWV3TW9kZWwgJiYgY3VycmVudFZpZXdNb2RlbFsnZGlzcG9zZSddO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRWaWV3TW9kZWxEaXNwb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Vmlld01vZGVsRGlzcG9zZS5jYWxsKGN1cnJlbnRWaWV3TW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQW55IGluLWZsaWdodCBsb2FkaW5nIG9wZXJhdGlvbiBpcyBubyBsb25nZXIgcmVsZXZhbnQsIHNvIG1ha2Ugc3VyZSB3ZSBpZ25vcmUgaXRzIGNvbXBsZXRpb25cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudExvYWRpbmdPcGVyYXRpb25JZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbENoaWxkTm9kZXMgPSBrby51dGlscy5tYWtlQXJyYXkoa28udmlydHVhbEVsZW1lbnRzLmNoaWxkTm9kZXMoZWxlbWVudCkpO1xuXG4gICAgICAgICAgICBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwuYWRkRGlzcG9zZUNhbGxiYWNrKGVsZW1lbnQsIGRpc3Bvc2VBc3NvY2lhdGVkQ29tcG9uZW50Vmlld01vZGVsKTtcblxuICAgICAgICAgICAga28uY29tcHV0ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50TmFtZSwgY29tcG9uZW50UGFyYW1zO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50TmFtZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5hbWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlWyduYW1lJ10pO1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRQYXJhbXMgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlWydwYXJhbXMnXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gY29tcG9uZW50IG5hbWUgc3BlY2lmaWVkJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGxvYWRpbmdPcGVyYXRpb25JZCA9IGN1cnJlbnRMb2FkaW5nT3BlcmF0aW9uSWQgPSArK2NvbXBvbmVudExvYWRpbmdPcGVyYXRpb25VbmlxdWVJZDtcbiAgICAgICAgICAgICAgICBrby5jb21wb25lbnRzLmdldChjb21wb25lbnROYW1lLCBmdW5jdGlvbihjb21wb25lbnREZWZpbml0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgbm90IHRoZSBjdXJyZW50IGxvYWQgb3BlcmF0aW9uIGZvciB0aGlzIGVsZW1lbnQsIGlnbm9yZSBpdC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRMb2FkaW5nT3BlcmF0aW9uSWQgIT09IGxvYWRpbmdPcGVyYXRpb25JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgcHJldmlvdXMgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgZGlzcG9zZUFzc29jaWF0ZWRDb21wb25lbnRWaWV3TW9kZWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJbnN0YW50aWF0ZSBhbmQgYmluZCBuZXcgY29tcG9uZW50LiBJbXBsaWNpdGx5IHRoaXMgY2xlYW5zIGFueSBvbGQgRE9NIG5vZGVzLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudERlZmluaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBjb21wb25lbnQgXFwnJyArIGNvbXBvbmVudE5hbWUgKyAnXFwnJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2xvbmVUZW1wbGF0ZUludG9FbGVtZW50KGNvbXBvbmVudE5hbWUsIGNvbXBvbmVudERlZmluaXRpb24sIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50Vmlld01vZGVsID0gY3JlYXRlVmlld01vZGVsKGNvbXBvbmVudERlZmluaXRpb24sIGVsZW1lbnQsIG9yaWdpbmFsQ2hpbGROb2RlcywgY29tcG9uZW50UGFyYW1zKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkQmluZGluZ0NvbnRleHQgPSBiaW5kaW5nQ29udGV4dFsnY3JlYXRlQ2hpbGRDb250ZXh0J10oY29tcG9uZW50Vmlld01vZGVsLCAvKiBkYXRhSXRlbUFsaWFzICovIHVuZGVmaW5lZCwgZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4WyckY29tcG9uZW50J10gPSBjb21wb25lbnRWaWV3TW9kZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4WyckY29tcG9uZW50VGVtcGxhdGVOb2RlcyddID0gb3JpZ2luYWxDaGlsZE5vZGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWaWV3TW9kZWwgPSBjb21wb25lbnRWaWV3TW9kZWw7XG4gICAgICAgICAgICAgICAgICAgIGtvLmFwcGx5QmluZGluZ3NUb0Rlc2NlbmRhbnRzKGNoaWxkQmluZGluZ0NvbnRleHQsIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgbnVsbCwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IGVsZW1lbnQgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7ICdjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyc6IHRydWUgfTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBrby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzWydjb21wb25lbnQnXSA9IHRydWU7XG5cbiAgICBmdW5jdGlvbiBjbG9uZVRlbXBsYXRlSW50b0VsZW1lbnQoY29tcG9uZW50TmFtZSwgY29tcG9uZW50RGVmaW5pdGlvbiwgZWxlbWVudCkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBjb21wb25lbnREZWZpbml0aW9uWyd0ZW1wbGF0ZSddO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBcXCcnICsgY29tcG9uZW50TmFtZSArICdcXCcgaGFzIG5vIHRlbXBsYXRlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2xvbmVkTm9kZXNBcnJheSA9IGtvLnV0aWxzLmNsb25lTm9kZXModGVtcGxhdGUpO1xuICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuc2V0RG9tTm9kZUNoaWxkcmVuKGVsZW1lbnQsIGNsb25lZE5vZGVzQXJyYXkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVZpZXdNb2RlbChjb21wb25lbnREZWZpbml0aW9uLCBlbGVtZW50LCBvcmlnaW5hbENoaWxkTm9kZXMsIGNvbXBvbmVudFBhcmFtcykge1xuICAgICAgICB2YXIgY29tcG9uZW50Vmlld01vZGVsRmFjdG9yeSA9IGNvbXBvbmVudERlZmluaXRpb25bJ2NyZWF0ZVZpZXdNb2RlbCddO1xuICAgICAgICByZXR1cm4gY29tcG9uZW50Vmlld01vZGVsRmFjdG9yeVxuICAgICAgICAgICAgPyBjb21wb25lbnRWaWV3TW9kZWxGYWN0b3J5LmNhbGwoY29tcG9uZW50RGVmaW5pdGlvbiwgY29tcG9uZW50UGFyYW1zLCB7ICdlbGVtZW50JzogZWxlbWVudCwgJ3RlbXBsYXRlTm9kZXMnOiBvcmlnaW5hbENoaWxkTm9kZXMgfSlcbiAgICAgICAgICAgIDogY29tcG9uZW50UGFyYW1zOyAvLyBUZW1wbGF0ZS1vbmx5IGNvbXBvbmVudFxuICAgIH1cblxufSkoKTtcbnZhciBhdHRySHRtbFRvSmF2YXNjcmlwdE1hcCA9IHsgJ2NsYXNzJzogJ2NsYXNzTmFtZScsICdmb3InOiAnaHRtbEZvcicgfTtcbmtvLmJpbmRpbmdIYW5kbGVyc1snYXR0ciddID0ge1xuICAgICd1cGRhdGUnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncykge1xuICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSkgfHwge307XG4gICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2godmFsdWUsIGZ1bmN0aW9uKGF0dHJOYW1lLCBhdHRyVmFsdWUpIHtcbiAgICAgICAgICAgIGF0dHJWYWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoYXR0clZhbHVlKTtcblxuICAgICAgICAgICAgLy8gVG8gY292ZXIgY2FzZXMgbGlrZSBcImF0dHI6IHsgY2hlY2tlZDpzb21lUHJvcCB9XCIsIHdlIHdhbnQgdG8gcmVtb3ZlIHRoZSBhdHRyaWJ1dGUgZW50aXJlbHlcbiAgICAgICAgICAgIC8vIHdoZW4gc29tZVByb3AgaXMgYSBcIm5vIHZhbHVlXCItbGlrZSB2YWx1ZSAoc3RyaWN0bHkgbnVsbCwgZmFsc2UsIG9yIHVuZGVmaW5lZClcbiAgICAgICAgICAgIC8vIChiZWNhdXNlIHRoZSBhYnNlbmNlIG9mIHRoZSBcImNoZWNrZWRcIiBhdHRyIGlzIGhvdyB0byBtYXJrIGFuIGVsZW1lbnQgYXMgbm90IGNoZWNrZWQsIGV0Yy4pXG4gICAgICAgICAgICB2YXIgdG9SZW1vdmUgPSAoYXR0clZhbHVlID09PSBmYWxzZSkgfHwgKGF0dHJWYWx1ZSA9PT0gbnVsbCkgfHwgKGF0dHJWYWx1ZSA9PT0gdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIGlmICh0b1JlbW92ZSlcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG5cbiAgICAgICAgICAgIC8vIEluIElFIDw9IDcgYW5kIElFOCBRdWlya3MgTW9kZSwgeW91IGhhdmUgdG8gdXNlIHRoZSBKYXZhc2NyaXB0IHByb3BlcnR5IG5hbWUgaW5zdGVhZCBvZiB0aGVcbiAgICAgICAgICAgIC8vIEhUTUwgYXR0cmlidXRlIG5hbWUgZm9yIGNlcnRhaW4gYXR0cmlidXRlcy4gSUU4IFN0YW5kYXJkcyBNb2RlIHN1cHBvcnRzIHRoZSBjb3JyZWN0IGJlaGF2aW9yLFxuICAgICAgICAgICAgLy8gYnV0IGluc3RlYWQgb2YgZmlndXJpbmcgb3V0IHRoZSBtb2RlLCB3ZSdsbCBqdXN0IHNldCB0aGUgYXR0cmlidXRlIHRocm91Z2ggdGhlIEphdmFzY3JpcHRcbiAgICAgICAgICAgIC8vIHByb3BlcnR5IGZvciBJRSA8PSA4LlxuICAgICAgICAgICAgaWYgKGtvLnV0aWxzLmllVmVyc2lvbiA8PSA4ICYmIGF0dHJOYW1lIGluIGF0dHJIdG1sVG9KYXZhc2NyaXB0TWFwKSB7XG4gICAgICAgICAgICAgICAgYXR0ck5hbWUgPSBhdHRySHRtbFRvSmF2YXNjcmlwdE1hcFthdHRyTmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKHRvUmVtb3ZlKVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W2F0dHJOYW1lXSA9IGF0dHJWYWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRvUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGF0dHJWYWx1ZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVHJlYXQgXCJuYW1lXCIgc3BlY2lhbGx5IC0gYWx0aG91Z2ggeW91IGNhbiB0aGluayBvZiBpdCBhcyBhbiBhdHRyaWJ1dGUsIGl0IGFsc28gbmVlZHNcbiAgICAgICAgICAgIC8vIHNwZWNpYWwgaGFuZGxpbmcgb24gb2xkZXIgdmVyc2lvbnMgb2YgSUUgKGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9wdWxsLzMzMylcbiAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSBiZWluZyBjYXNlLXNlbnNpdGl2ZSBoZXJlIGJlY2F1c2UgWEhUTUwgd291bGQgcmVnYXJkIFwiTmFtZVwiIGFzIGEgZGlmZmVyZW50IHRoaW5nXG4gICAgICAgICAgICAvLyBlbnRpcmVseSwgYW5kIHRoZXJlJ3Mgbm8gc3Ryb25nIHJlYXNvbiB0byBhbGxvdyBmb3Igc3VjaCBjYXNpbmcgaW4gSFRNTC5cbiAgICAgICAgICAgIGlmIChhdHRyTmFtZSA9PT0gXCJuYW1lXCIpIHtcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXRFbGVtZW50TmFtZShlbGVtZW50LCB0b1JlbW92ZSA/IFwiXCIgOiBhdHRyVmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4oZnVuY3Rpb24oKSB7XG5cbmtvLmJpbmRpbmdIYW5kbGVyc1snY2hlY2tlZCddID0ge1xuICAgICdhZnRlcic6IFsndmFsdWUnLCAnYXR0ciddLFxuICAgICdpbml0JzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzKSB7XG4gICAgICAgIHZhciBjaGVja2VkVmFsdWUgPSBrby5wdXJlQ29tcHV0ZWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBUcmVhdCBcInZhbHVlXCIgbGlrZSBcImNoZWNrZWRWYWx1ZVwiIHdoZW4gaXQgaXMgaW5jbHVkZWQgd2l0aCBcImNoZWNrZWRcIiBiaW5kaW5nXG4gICAgICAgICAgICBpZiAoYWxsQmluZGluZ3NbJ2hhcyddKCdjaGVja2VkVmFsdWUnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGFsbEJpbmRpbmdzLmdldCgnY2hlY2tlZFZhbHVlJykpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhbGxCaW5kaW5nc1snaGFzJ10oJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShhbGxCaW5kaW5ncy5nZXQoJ3ZhbHVlJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlTW9kZWwoKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHVwZGF0ZXMgdGhlIG1vZGVsIHZhbHVlIGZyb20gdGhlIHZpZXcgdmFsdWUuXG4gICAgICAgICAgICAvLyBJdCBydW5zIGluIHJlc3BvbnNlIHRvIERPTSBldmVudHMgKGNsaWNrKSBhbmQgY2hhbmdlcyBpbiBjaGVja2VkVmFsdWUuXG4gICAgICAgICAgICB2YXIgaXNDaGVja2VkID0gZWxlbWVudC5jaGVja2VkLFxuICAgICAgICAgICAgICAgIGVsZW1WYWx1ZSA9IHVzZUNoZWNrZWRWYWx1ZSA/IGNoZWNrZWRWYWx1ZSgpIDogaXNDaGVja2VkO1xuXG4gICAgICAgICAgICAvLyBXaGVuIHdlJ3JlIGZpcnN0IHNldHRpbmcgdXAgdGhpcyBjb21wdXRlZCwgZG9uJ3QgY2hhbmdlIGFueSBtb2RlbCBzdGF0ZS5cbiAgICAgICAgICAgIGlmIChrby5jb21wdXRlZENvbnRleHQuaXNJbml0aWFsKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlIGNhbiBpZ25vcmUgdW5jaGVja2VkIHJhZGlvIGJ1dHRvbnMsIGJlY2F1c2Ugc29tZSBvdGhlciByYWRpb1xuICAgICAgICAgICAgLy8gYnV0dG9uIHdpbGwgYmUgZ2V0dGluZyBjaGVja2VkLCBhbmQgdGhhdCBvbmUgY2FuIHRha2UgY2FyZSBvZiB1cGRhdGluZyBzdGF0ZS5cbiAgICAgICAgICAgIGlmIChpc1JhZGlvICYmICFpc0NoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBtb2RlbFZhbHVlID0ga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUodmFsdWVBY2Nlc3Nvcik7XG4gICAgICAgICAgICBpZiAoaXNWYWx1ZUFycmF5KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZEVsZW1WYWx1ZSAhPT0gZWxlbVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdoZW4gd2UncmUgcmVzcG9uZGluZyB0byB0aGUgY2hlY2tlZFZhbHVlIGNoYW5naW5nLCBhbmQgdGhlIGVsZW1lbnQgaXNcbiAgICAgICAgICAgICAgICAgICAgLy8gY3VycmVudGx5IGNoZWNrZWQsIHJlcGxhY2UgdGhlIG9sZCBlbGVtIHZhbHVlIHdpdGggdGhlIG5ldyBlbGVtIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIC8vIGluIHRoZSBtb2RlbCBhcnJheS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAga28udXRpbHMuYWRkT3JSZW1vdmVJdGVtKG1vZGVsVmFsdWUsIGVsZW1WYWx1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBrby51dGlscy5hZGRPclJlbW92ZUl0ZW0obW9kZWxWYWx1ZSwgb2xkRWxlbVZhbHVlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvbGRFbGVtVmFsdWUgPSBlbGVtVmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2hlbiB3ZSdyZSByZXNwb25kaW5nIHRvIHRoZSB1c2VyIGhhdmluZyBjaGVja2VkL3VuY2hlY2tlZCBhIGNoZWNrYm94LFxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQvcmVtb3ZlIHRoZSBlbGVtZW50IHZhbHVlIHRvIHRoZSBtb2RlbCBhcnJheS5cbiAgICAgICAgICAgICAgICAgICAga28udXRpbHMuYWRkT3JSZW1vdmVJdGVtKG1vZGVsVmFsdWUsIGVsZW1WYWx1ZSwgaXNDaGVja2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcud3JpdGVWYWx1ZVRvUHJvcGVydHkobW9kZWxWYWx1ZSwgYWxsQmluZGluZ3MsICdjaGVja2VkJywgZWxlbVZhbHVlLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVWaWV3KCkge1xuICAgICAgICAgICAgLy8gVGhpcyB1cGRhdGVzIHRoZSB2aWV3IHZhbHVlIGZyb20gdGhlIG1vZGVsIHZhbHVlLlxuICAgICAgICAgICAgLy8gSXQgcnVucyBpbiByZXNwb25zZSB0byBjaGFuZ2VzIGluIHRoZSBib3VuZCAoY2hlY2tlZCkgdmFsdWUuXG4gICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcblxuICAgICAgICAgICAgaWYgKGlzVmFsdWVBcnJheSkge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gYSBjaGVja2JveCBpcyBib3VuZCB0byBhbiBhcnJheSwgYmVpbmcgY2hlY2tlZCByZXByZXNlbnRzIGl0cyB2YWx1ZSBiZWluZyBwcmVzZW50IGluIHRoYXQgYXJyYXlcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSBrby51dGlscy5hcnJheUluZGV4T2YobW9kZWxWYWx1ZSwgY2hlY2tlZFZhbHVlKCkpID49IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzQ2hlY2tib3gpIHtcbiAgICAgICAgICAgICAgICAvLyBXaGVuIGEgY2hlY2tib3ggaXMgYm91bmQgdG8gYW55IG90aGVyIHZhbHVlIChub3QgYW4gYXJyYXkpLCBiZWluZyBjaGVja2VkIHJlcHJlc2VudHMgdGhlIHZhbHVlIGJlaW5nIHRydWVpc2hcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSBtb2RlbFZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgcmFkaW8gYnV0dG9ucywgYmVpbmcgY2hlY2tlZCBtZWFucyB0aGF0IHRoZSByYWRpbyBidXR0b24ncyB2YWx1ZSBjb3JyZXNwb25kcyB0byB0aGUgbW9kZWwgdmFsdWVcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSAoY2hlY2tlZFZhbHVlKCkgPT09IG1vZGVsVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBpc0NoZWNrYm94ID0gZWxlbWVudC50eXBlID09IFwiY2hlY2tib3hcIixcbiAgICAgICAgICAgIGlzUmFkaW8gPSBlbGVtZW50LnR5cGUgPT0gXCJyYWRpb1wiO1xuXG4gICAgICAgIC8vIE9ubHkgYmluZCB0byBjaGVjayBib3hlcyBhbmQgcmFkaW8gYnV0dG9uc1xuICAgICAgICBpZiAoIWlzQ2hlY2tib3ggJiYgIWlzUmFkaW8pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpc1ZhbHVlQXJyYXkgPSBpc0NoZWNrYm94ICYmIChrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSkgaW5zdGFuY2VvZiBBcnJheSksXG4gICAgICAgICAgICBvbGRFbGVtVmFsdWUgPSBpc1ZhbHVlQXJyYXkgPyBjaGVja2VkVmFsdWUoKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVzZUNoZWNrZWRWYWx1ZSA9IGlzUmFkaW8gfHwgaXNWYWx1ZUFycmF5O1xuXG4gICAgICAgIC8vIElFIDYgd29uJ3QgYWxsb3cgcmFkaW8gYnV0dG9ucyB0byBiZSBzZWxlY3RlZCB1bmxlc3MgdGhleSBoYXZlIGEgbmFtZVxuICAgICAgICBpZiAoaXNSYWRpbyAmJiAhZWxlbWVudC5uYW1lKVxuICAgICAgICAgICAga28uYmluZGluZ0hhbmRsZXJzWyd1bmlxdWVOYW1lJ11bJ2luaXQnXShlbGVtZW50LCBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWUgfSk7XG5cbiAgICAgICAgLy8gU2V0IHVwIHR3byBjb21wdXRlZHMgdG8gdXBkYXRlIHRoZSBiaW5kaW5nOlxuXG4gICAgICAgIC8vIFRoZSBmaXJzdCByZXNwb25kcyB0byBjaGFuZ2VzIGluIHRoZSBjaGVja2VkVmFsdWUgdmFsdWUgYW5kIHRvIGVsZW1lbnQgY2xpY2tzXG4gICAgICAgIGtvLmNvbXB1dGVkKHVwZGF0ZU1vZGVsLCBudWxsLCB7IGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogZWxlbWVudCB9KTtcbiAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJjbGlja1wiLCB1cGRhdGVNb2RlbCk7XG5cbiAgICAgICAgLy8gVGhlIHNlY29uZCByZXNwb25kcyB0byBjaGFuZ2VzIGluIHRoZSBtb2RlbCB2YWx1ZSAodGhlIG9uZSBhc3NvY2lhdGVkIHdpdGggdGhlIGNoZWNrZWQgYmluZGluZylcbiAgICAgICAga28uY29tcHV0ZWQodXBkYXRlVmlldywgbnVsbCwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IGVsZW1lbnQgfSk7XG4gICAgfVxufTtcbmtvLmV4cHJlc3Npb25SZXdyaXRpbmcudHdvV2F5QmluZGluZ3NbJ2NoZWNrZWQnXSA9IHRydWU7XG5cbmtvLmJpbmRpbmdIYW5kbGVyc1snY2hlY2tlZFZhbHVlJ10gPSB7XG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgfVxufTtcblxufSkoKTt2YXIgY2xhc3Nlc1dyaXR0ZW5CeUJpbmRpbmdLZXkgPSAnX19rb19fY3NzVmFsdWUnO1xua28uYmluZGluZ0hhbmRsZXJzWydjc3MnXSA9IHtcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgdmFyIHZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2godmFsdWUsIGZ1bmN0aW9uKGNsYXNzTmFtZSwgc2hvdWxkSGF2ZUNsYXNzKSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkSGF2ZUNsYXNzID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShzaG91bGRIYXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnRvZ2dsZURvbU5vZGVDc3NDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUsIHNob3VsZEhhdmVDbGFzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlIHx8ICcnKTsgLy8gTWFrZSBzdXJlIHdlIGRvbid0IHRyeSB0byBzdG9yZSBvciBzZXQgYSBub24tc3RyaW5nIHZhbHVlXG4gICAgICAgICAgICBrby51dGlscy50b2dnbGVEb21Ob2RlQ3NzQ2xhc3MoZWxlbWVudCwgZWxlbWVudFtjbGFzc2VzV3JpdHRlbkJ5QmluZGluZ0tleV0sIGZhbHNlKTtcbiAgICAgICAgICAgIGVsZW1lbnRbY2xhc3Nlc1dyaXR0ZW5CeUJpbmRpbmdLZXldID0gdmFsdWU7XG4gICAgICAgICAgICBrby51dGlscy50b2dnbGVEb21Ob2RlQ3NzQ2xhc3MoZWxlbWVudCwgdmFsdWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufTtcbmtvLmJpbmRpbmdIYW5kbGVyc1snZW5hYmxlJ10gPSB7XG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcbiAgICAgICAgaWYgKHZhbHVlICYmIGVsZW1lbnQuZGlzYWJsZWQpXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgICAgICBlbHNlIGlmICgoIXZhbHVlKSAmJiAoIWVsZW1lbnQuZGlzYWJsZWQpKVxuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxufTtcblxua28uYmluZGluZ0hhbmRsZXJzWydkaXNhYmxlJ10gPSB7XG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIGtvLmJpbmRpbmdIYW5kbGVyc1snZW5hYmxlJ11bJ3VwZGF0ZSddKGVsZW1lbnQsIGZ1bmN0aW9uKCkgeyByZXR1cm4gIWtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKSB9KTtcbiAgICB9XG59O1xuLy8gRm9yIGNlcnRhaW4gY29tbW9uIGV2ZW50cyAoY3VycmVudGx5IGp1c3QgJ2NsaWNrJyksIGFsbG93IGEgc2ltcGxpZmllZCBkYXRhLWJpbmRpbmcgc3ludGF4XG4vLyBlLmcuIGNsaWNrOmhhbmRsZXIgaW5zdGVhZCBvZiB0aGUgdXN1YWwgZnVsbC1sZW5ndGggZXZlbnQ6e2NsaWNrOmhhbmRsZXJ9XG5mdW5jdGlvbiBtYWtlRXZlbnRIYW5kbGVyU2hvcnRjdXQoZXZlbnROYW1lKSB7XG4gICAga28uYmluZGluZ0hhbmRsZXJzW2V2ZW50TmFtZV0gPSB7XG4gICAgICAgICdpbml0JzogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZUFjY2Vzc29yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgICAgICByZXN1bHRbZXZlbnROYW1lXSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBrby5iaW5kaW5nSGFuZGxlcnNbJ2V2ZW50J11bJ2luaXQnXS5jYWxsKHRoaXMsIGVsZW1lbnQsIG5ld1ZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxua28uYmluZGluZ0hhbmRsZXJzWydldmVudCddID0ge1xuICAgICdpbml0JyA6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncywgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICB2YXIgZXZlbnRzVG9IYW5kbGUgPSB2YWx1ZUFjY2Vzc29yKCkgfHwge307XG4gICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2goZXZlbnRzVG9IYW5kbGUsIGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBldmVudE5hbWUgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIGV2ZW50TmFtZSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoYW5kbGVyUmV0dXJuVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoYW5kbGVyRnVuY3Rpb24gPSB2YWx1ZUFjY2Vzc29yKClbZXZlbnROYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoYW5kbGVyRnVuY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRha2UgYWxsIHRoZSBldmVudCBhcmdzLCBhbmQgcHJlZml4IHdpdGggdGhlIHZpZXdtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3NGb3JIYW5kbGVyID0ga28udXRpbHMubWFrZUFycmF5KGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3TW9kZWwgPSBiaW5kaW5nQ29udGV4dFsnJGRhdGEnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3NGb3JIYW5kbGVyLnVuc2hpZnQodmlld01vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJSZXR1cm5WYWx1ZSA9IGhhbmRsZXJGdW5jdGlvbi5hcHBseSh2aWV3TW9kZWwsIGFyZ3NGb3JIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyUmV0dXJuVmFsdWUgIT09IHRydWUpIHsgLy8gTm9ybWFsbHkgd2Ugd2FudCB0byBwcmV2ZW50IGRlZmF1bHQgYWN0aW9uLiBEZXZlbG9wZXIgY2FuIG92ZXJyaWRlIHRoaXMgYmUgZXhwbGljaXRseSByZXR1cm5pbmcgdHJ1ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ1YmJsZSA9IGFsbEJpbmRpbmdzLmdldChldmVudE5hbWUgKyAnQnViYmxlJykgIT09IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWJ1YmJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5zdG9wUHJvcGFnYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcbi8vIFwiZm9yZWFjaDogc29tZUV4cHJlc3Npb25cIiBpcyBlcXVpdmFsZW50IHRvIFwidGVtcGxhdGU6IHsgZm9yZWFjaDogc29tZUV4cHJlc3Npb24gfVwiXG4vLyBcImZvcmVhY2g6IHsgZGF0YTogc29tZUV4cHJlc3Npb24sIGFmdGVyQWRkOiBteWZuIH1cIiBpcyBlcXVpdmFsZW50IHRvIFwidGVtcGxhdGU6IHsgZm9yZWFjaDogc29tZUV4cHJlc3Npb24sIGFmdGVyQWRkOiBteWZuIH1cIlxua28uYmluZGluZ0hhbmRsZXJzWydmb3JlYWNoJ10gPSB7XG4gICAgbWFrZVRlbXBsYXRlVmFsdWVBY2Nlc3NvcjogZnVuY3Rpb24odmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IHZhbHVlQWNjZXNzb3IoKSxcbiAgICAgICAgICAgICAgICB1bndyYXBwZWRWYWx1ZSA9IGtvLnV0aWxzLnBlZWtPYnNlcnZhYmxlKG1vZGVsVmFsdWUpOyAgICAvLyBVbndyYXAgd2l0aG91dCBzZXR0aW5nIGEgZGVwZW5kZW5jeSBoZXJlXG5cbiAgICAgICAgICAgIC8vIElmIHVud3JhcHBlZFZhbHVlIGlzIHRoZSBhcnJheSwgcGFzcyBpbiB0aGUgd3JhcHBlZCB2YWx1ZSBvbiBpdHMgb3duXG4gICAgICAgICAgICAvLyBUaGUgdmFsdWUgd2lsbCBiZSB1bndyYXBwZWQgYW5kIHRyYWNrZWQgd2l0aGluIHRoZSB0ZW1wbGF0ZSBiaW5kaW5nXG4gICAgICAgICAgICAvLyAoU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvNTIzKVxuICAgICAgICAgICAgaWYgKCghdW53cmFwcGVkVmFsdWUpIHx8IHR5cGVvZiB1bndyYXBwZWRWYWx1ZS5sZW5ndGggPT0gXCJudW1iZXJcIilcbiAgICAgICAgICAgICAgICByZXR1cm4geyAnZm9yZWFjaCc6IG1vZGVsVmFsdWUsICd0ZW1wbGF0ZUVuZ2luZSc6IGtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lLmluc3RhbmNlIH07XG5cbiAgICAgICAgICAgIC8vIElmIHVud3JhcHBlZFZhbHVlLmRhdGEgaXMgdGhlIGFycmF5LCBwcmVzZXJ2ZSBhbGwgcmVsZXZhbnQgb3B0aW9ucyBhbmQgdW53cmFwIGFnYWluIHZhbHVlIHNvIHdlIGdldCB1cGRhdGVzXG4gICAgICAgICAgICBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKG1vZGVsVmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnZm9yZWFjaCc6IHVud3JhcHBlZFZhbHVlWydkYXRhJ10sXG4gICAgICAgICAgICAgICAgJ2FzJzogdW53cmFwcGVkVmFsdWVbJ2FzJ10sXG4gICAgICAgICAgICAgICAgJ2luY2x1ZGVEZXN0cm95ZWQnOiB1bndyYXBwZWRWYWx1ZVsnaW5jbHVkZURlc3Ryb3llZCddLFxuICAgICAgICAgICAgICAgICdhZnRlckFkZCc6IHVud3JhcHBlZFZhbHVlWydhZnRlckFkZCddLFxuICAgICAgICAgICAgICAgICdiZWZvcmVSZW1vdmUnOiB1bndyYXBwZWRWYWx1ZVsnYmVmb3JlUmVtb3ZlJ10sXG4gICAgICAgICAgICAgICAgJ2FmdGVyUmVuZGVyJzogdW53cmFwcGVkVmFsdWVbJ2FmdGVyUmVuZGVyJ10sXG4gICAgICAgICAgICAgICAgJ2JlZm9yZU1vdmUnOiB1bndyYXBwZWRWYWx1ZVsnYmVmb3JlTW92ZSddLFxuICAgICAgICAgICAgICAgICdhZnRlck1vdmUnOiB1bndyYXBwZWRWYWx1ZVsnYWZ0ZXJNb3ZlJ10sXG4gICAgICAgICAgICAgICAgJ3RlbXBsYXRlRW5naW5lJzoga28ubmF0aXZlVGVtcGxhdGVFbmdpbmUuaW5zdGFuY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfSxcbiAgICAnaW5pdCc6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBrby5iaW5kaW5nSGFuZGxlcnNbJ3RlbXBsYXRlJ11bJ2luaXQnXShlbGVtZW50LCBrby5iaW5kaW5nSGFuZGxlcnNbJ2ZvcmVhY2gnXS5tYWtlVGVtcGxhdGVWYWx1ZUFjY2Vzc29yKHZhbHVlQWNjZXNzb3IpKTtcbiAgICB9LFxuICAgICd1cGRhdGUnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncywgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICByZXR1cm4ga28uYmluZGluZ0hhbmRsZXJzWyd0ZW1wbGF0ZSddWyd1cGRhdGUnXShlbGVtZW50LCBrby5iaW5kaW5nSGFuZGxlcnNbJ2ZvcmVhY2gnXS5tYWtlVGVtcGxhdGVWYWx1ZUFjY2Vzc29yKHZhbHVlQWNjZXNzb3IpLCBhbGxCaW5kaW5ncywgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCk7XG4gICAgfVxufTtcbmtvLmV4cHJlc3Npb25SZXdyaXRpbmcuYmluZGluZ1Jld3JpdGVWYWxpZGF0b3JzWydmb3JlYWNoJ10gPSBmYWxzZTsgLy8gQ2FuJ3QgcmV3cml0ZSBjb250cm9sIGZsb3cgYmluZGluZ3NcbmtvLnZpcnR1YWxFbGVtZW50cy5hbGxvd2VkQmluZGluZ3NbJ2ZvcmVhY2gnXSA9IHRydWU7XG52YXIgaGFzZm9jdXNVcGRhdGluZ1Byb3BlcnR5ID0gJ19fa29faGFzZm9jdXNVcGRhdGluZyc7XG52YXIgaGFzZm9jdXNMYXN0VmFsdWUgPSAnX19rb19oYXNmb2N1c0xhc3RWYWx1ZSc7XG5rby5iaW5kaW5nSGFuZGxlcnNbJ2hhc2ZvY3VzJ10gPSB7XG4gICAgJ2luaXQnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncykge1xuICAgICAgICB2YXIgaGFuZGxlRWxlbWVudEZvY3VzQ2hhbmdlID0gZnVuY3Rpb24oaXNGb2N1c2VkKSB7XG4gICAgICAgICAgICAvLyBXaGVyZSBwb3NzaWJsZSwgaWdub3JlIHdoaWNoIGV2ZW50IHdhcyByYWlzZWQgYW5kIGRldGVybWluZSBmb2N1cyBzdGF0ZSB1c2luZyBhY3RpdmVFbGVtZW50LFxuICAgICAgICAgICAgLy8gYXMgdGhpcyBhdm9pZHMgcGhhbnRvbSBmb2N1cy9ibHVyIGV2ZW50cyByYWlzZWQgd2hlbiBjaGFuZ2luZyB0YWJzIGluIG1vZGVybiBicm93c2Vycy5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIG5vdCBhbGwgS08tdGFyZ2V0ZWQgYnJvd3NlcnMgKEZpcmVmb3ggMikgc3VwcG9ydCBhY3RpdmVFbGVtZW50LiBGb3IgdGhvc2UgYnJvd3NlcnMsXG4gICAgICAgICAgICAvLyBwcmV2ZW50IGEgbG9zcyBvZiBmb2N1cyB3aGVuIGNoYW5naW5nIHRhYnMvd2luZG93cyBieSBzZXR0aW5nIGEgZmxhZyB0aGF0IHByZXZlbnRzIGhhc2ZvY3VzXG4gICAgICAgICAgICAvLyBmcm9tIGNhbGxpbmcgJ2JsdXIoKScgb24gdGhlIGVsZW1lbnQgd2hlbiBpdCBsb3NlcyBmb2N1cy5cbiAgICAgICAgICAgIC8vIERpc2N1c3Npb24gYXQgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L3B1bGwvMzUyXG4gICAgICAgICAgICBlbGVtZW50W2hhc2ZvY3VzVXBkYXRpbmdQcm9wZXJ0eV0gPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG93bmVyRG9jID0gZWxlbWVudC5vd25lckRvY3VtZW50O1xuICAgICAgICAgICAgaWYgKFwiYWN0aXZlRWxlbWVudFwiIGluIG93bmVyRG9jKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFjdGl2ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmUgPSBvd25lckRvYy5hY3RpdmVFbGVtZW50O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJRTkgdGhyb3dzIGlmIHlvdSBhY2Nlc3MgYWN0aXZlRWxlbWVudCBkdXJpbmcgcGFnZSBsb2FkIChzZWUgaXNzdWUgIzcwMylcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlID0gb3duZXJEb2MuYm9keTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXNGb2N1c2VkID0gKGFjdGl2ZSA9PT0gZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcud3JpdGVWYWx1ZVRvUHJvcGVydHkobW9kZWxWYWx1ZSwgYWxsQmluZGluZ3MsICdoYXNmb2N1cycsIGlzRm9jdXNlZCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vY2FjaGUgdGhlIGxhdGVzdCB2YWx1ZSwgc28gd2UgY2FuIGF2b2lkIHVubmVjZXNzYXJpbHkgY2FsbGluZyBmb2N1cy9ibHVyIGluIHRoZSB1cGRhdGUgZnVuY3Rpb25cbiAgICAgICAgICAgIGVsZW1lbnRbaGFzZm9jdXNMYXN0VmFsdWVdID0gaXNGb2N1c2VkO1xuICAgICAgICAgICAgZWxlbWVudFtoYXNmb2N1c1VwZGF0aW5nUHJvcGVydHldID0gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBoYW5kbGVFbGVtZW50Rm9jdXNJbiA9IGhhbmRsZUVsZW1lbnRGb2N1c0NoYW5nZS5iaW5kKG51bGwsIHRydWUpO1xuICAgICAgICB2YXIgaGFuZGxlRWxlbWVudEZvY3VzT3V0ID0gaGFuZGxlRWxlbWVudEZvY3VzQ2hhbmdlLmJpbmQobnVsbCwgZmFsc2UpO1xuXG4gICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwiZm9jdXNcIiwgaGFuZGxlRWxlbWVudEZvY3VzSW4pO1xuICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcImZvY3VzaW5cIiwgaGFuZGxlRWxlbWVudEZvY3VzSW4pOyAvLyBGb3IgSUVcbiAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJibHVyXCIsICBoYW5kbGVFbGVtZW50Rm9jdXNPdXQpO1xuICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcImZvY3Vzb3V0XCIsICBoYW5kbGVFbGVtZW50Rm9jdXNPdXQpOyAvLyBGb3IgSUVcbiAgICB9LFxuICAgICd1cGRhdGUnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9ICEha28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpOyAvL2ZvcmNlIGJvb2xlYW4gdG8gY29tcGFyZSB3aXRoIGxhc3QgdmFsdWVcbiAgICAgICAgaWYgKCFlbGVtZW50W2hhc2ZvY3VzVXBkYXRpbmdQcm9wZXJ0eV0gJiYgZWxlbWVudFtoYXNmb2N1c0xhc3RWYWx1ZV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICB2YWx1ZSA/IGVsZW1lbnQuZm9jdXMoKSA6IGVsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUoa28udXRpbHMudHJpZ2dlckV2ZW50LCBudWxsLCBbZWxlbWVudCwgdmFsdWUgPyBcImZvY3VzaW5cIiA6IFwiZm9jdXNvdXRcIl0pOyAvLyBGb3IgSUUsIHdoaWNoIGRvZXNuJ3QgcmVsaWFibHkgZmlyZSBcImZvY3VzXCIgb3IgXCJibHVyXCIgZXZlbnRzIHN5bmNocm9ub3VzbHlcbiAgICAgICAgfVxuICAgIH1cbn07XG5rby5leHByZXNzaW9uUmV3cml0aW5nLnR3b1dheUJpbmRpbmdzWydoYXNmb2N1cyddID0gdHJ1ZTtcblxua28uYmluZGluZ0hhbmRsZXJzWydoYXNGb2N1cyddID0ga28uYmluZGluZ0hhbmRsZXJzWydoYXNmb2N1cyddOyAvLyBNYWtlIFwiaGFzRm9jdXNcIiBhbiBhbGlhc1xua28uZXhwcmVzc2lvblJld3JpdGluZy50d29XYXlCaW5kaW5nc1snaGFzRm9jdXMnXSA9IHRydWU7XG5rby5iaW5kaW5nSGFuZGxlcnNbJ2h0bWwnXSA9IHtcbiAgICAnaW5pdCc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBQcmV2ZW50IGJpbmRpbmcgb24gdGhlIGR5bmFtaWNhbGx5LWluamVjdGVkIEhUTUwgKGFzIGRldmVsb3BlcnMgYXJlIHVubGlrZWx5IHRvIGV4cGVjdCB0aGF0LCBhbmQgaXQgaGFzIHNlY3VyaXR5IGltcGxpY2F0aW9ucylcbiAgICAgICAgcmV0dXJuIHsgJ2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzJzogdHJ1ZSB9O1xuICAgIH0sXG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIC8vIHNldEh0bWwgd2lsbCB1bndyYXAgdGhlIHZhbHVlIGlmIG5lZWRlZFxuICAgICAgICBrby51dGlscy5zZXRIdG1sKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgfVxufTtcbi8vIE1ha2VzIGEgYmluZGluZyBsaWtlIHdpdGggb3IgaWZcbmZ1bmN0aW9uIG1ha2VXaXRoSWZCaW5kaW5nKGJpbmRpbmdLZXksIGlzV2l0aCwgaXNOb3QsIG1ha2VDb250ZXh0Q2FsbGJhY2spIHtcbiAgICBrby5iaW5kaW5nSGFuZGxlcnNbYmluZGluZ0tleV0gPSB7XG4gICAgICAgICdpbml0JzogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBkaWREaXNwbGF5T25MYXN0VXBkYXRlLFxuICAgICAgICAgICAgICAgIHNhdmVkTm9kZXM7XG4gICAgICAgICAgICBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YVZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpLFxuICAgICAgICAgICAgICAgICAgICBzaG91bGREaXNwbGF5ID0gIWlzTm90ICE9PSAhZGF0YVZhbHVlLCAvLyBlcXVpdmFsZW50IHRvIGlzTm90ID8gIWRhdGFWYWx1ZSA6ICEhZGF0YVZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlzRmlyc3RSZW5kZXIgPSAhc2F2ZWROb2RlcyxcbiAgICAgICAgICAgICAgICAgICAgbmVlZHNSZWZyZXNoID0gaXNGaXJzdFJlbmRlciB8fCBpc1dpdGggfHwgKHNob3VsZERpc3BsYXkgIT09IGRpZERpc3BsYXlPbkxhc3RVcGRhdGUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5lZWRzUmVmcmVzaCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGEgY29weSBvZiB0aGUgaW5uZXIgbm9kZXMgb24gdGhlIGluaXRpYWwgdXBkYXRlLCBidXQgb25seSBpZiB3ZSBoYXZlIGRlcGVuZGVuY2llcy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRmlyc3RSZW5kZXIgJiYga28uY29tcHV0ZWRDb250ZXh0LmdldERlcGVuZGVuY2llc0NvdW50KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVkTm9kZXMgPSBrby51dGlscy5jbG9uZU5vZGVzKGtvLnZpcnR1YWxFbGVtZW50cy5jaGlsZE5vZGVzKGVsZW1lbnQpLCB0cnVlIC8qIHNob3VsZENsZWFuTm9kZXMgKi8pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3VsZERpc3BsYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNGaXJzdFJlbmRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5zZXREb21Ob2RlQ2hpbGRyZW4oZWxlbWVudCwga28udXRpbHMuY2xvbmVOb2RlcyhzYXZlZE5vZGVzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBrby5hcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50cyhtYWtlQ29udGV4dENhbGxiYWNrID8gbWFrZUNvbnRleHRDYWxsYmFjayhiaW5kaW5nQ29udGV4dCwgZGF0YVZhbHVlKSA6IGJpbmRpbmdDb250ZXh0LCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5lbXB0eU5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBkaWREaXNwbGF5T25MYXN0VXBkYXRlID0gc2hvdWxkRGlzcGxheTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBudWxsLCB7IGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogZWxlbWVudCB9KTtcbiAgICAgICAgICAgIHJldHVybiB7ICdjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyc6IHRydWUgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAga28uZXhwcmVzc2lvblJld3JpdGluZy5iaW5kaW5nUmV3cml0ZVZhbGlkYXRvcnNbYmluZGluZ0tleV0gPSBmYWxzZTsgLy8gQ2FuJ3QgcmV3cml0ZSBjb250cm9sIGZsb3cgYmluZGluZ3NcbiAgICBrby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzW2JpbmRpbmdLZXldID0gdHJ1ZTtcbn1cblxuLy8gQ29uc3RydWN0IHRoZSBhY3R1YWwgYmluZGluZyBoYW5kbGVyc1xubWFrZVdpdGhJZkJpbmRpbmcoJ2lmJyk7XG5tYWtlV2l0aElmQmluZGluZygnaWZub3QnLCBmYWxzZSAvKiBpc1dpdGggKi8sIHRydWUgLyogaXNOb3QgKi8pO1xubWFrZVdpdGhJZkJpbmRpbmcoJ3dpdGgnLCB0cnVlIC8qIGlzV2l0aCAqLywgZmFsc2UgLyogaXNOb3QgKi8sXG4gICAgZnVuY3Rpb24oYmluZGluZ0NvbnRleHQsIGRhdGFWYWx1ZSkge1xuICAgICAgICByZXR1cm4gYmluZGluZ0NvbnRleHRbJ2NyZWF0ZUNoaWxkQ29udGV4dCddKGRhdGFWYWx1ZSk7XG4gICAgfVxuKTtcbnZhciBjYXB0aW9uUGxhY2Vob2xkZXIgPSB7fTtcbmtvLmJpbmRpbmdIYW5kbGVyc1snb3B0aW9ucyddID0ge1xuICAgICdpbml0JzogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICBpZiAoa28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpICE9PSBcInNlbGVjdFwiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucyBiaW5kaW5nIGFwcGxpZXMgb25seSB0byBTRUxFQ1QgZWxlbWVudHNcIik7XG5cbiAgICAgICAgLy8gUmVtb3ZlIGFsbCBleGlzdGluZyA8b3B0aW9uPnMuXG4gICAgICAgIHdoaWxlIChlbGVtZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5zdXJlcyB0aGF0IHRoZSBiaW5kaW5nIHByb2Nlc3NvciBkb2Vzbid0IHRyeSB0byBiaW5kIHRoZSBvcHRpb25zXG4gICAgICAgIHJldHVybiB7ICdjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyc6IHRydWUgfTtcbiAgICB9LFxuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MpIHtcbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0ZWRPcHRpb25zKCkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmFycmF5RmlsdGVyKGVsZW1lbnQub3B0aW9ucywgZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIG5vZGUuc2VsZWN0ZWQ7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbGVjdFdhc1ByZXZpb3VzbHlFbXB0eSA9IGVsZW1lbnQubGVuZ3RoID09IDAsXG4gICAgICAgICAgICBtdWx0aXBsZSA9IGVsZW1lbnQubXVsdGlwbGUsXG4gICAgICAgICAgICBwcmV2aW91c1Njcm9sbFRvcCA9ICghc2VsZWN0V2FzUHJldmlvdXNseUVtcHR5ICYmIG11bHRpcGxlKSA/IGVsZW1lbnQuc2Nyb2xsVG9wIDogbnVsbCxcbiAgICAgICAgICAgIHVud3JhcHBlZEFycmF5ID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpLFxuICAgICAgICAgICAgdmFsdWVBbGxvd1Vuc2V0ID0gYWxsQmluZGluZ3MuZ2V0KCd2YWx1ZUFsbG93VW5zZXQnKSAmJiBhbGxCaW5kaW5nc1snaGFzJ10oJ3ZhbHVlJyksXG4gICAgICAgICAgICBpbmNsdWRlRGVzdHJveWVkID0gYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zSW5jbHVkZURlc3Ryb3llZCcpLFxuICAgICAgICAgICAgYXJyYXlUb0RvbU5vZGVDaGlsZHJlbk9wdGlvbnMgPSB7fSxcbiAgICAgICAgICAgIGNhcHRpb25WYWx1ZSxcbiAgICAgICAgICAgIGZpbHRlcmVkQXJyYXksXG4gICAgICAgICAgICBwcmV2aW91c1NlbGVjdGVkVmFsdWVzID0gW107XG5cbiAgICAgICAgaWYgKCF2YWx1ZUFsbG93VW5zZXQpIHtcbiAgICAgICAgICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMgPSBrby51dGlscy5hcnJheU1hcChzZWxlY3RlZE9wdGlvbnMoKSwga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50LnNlbGVjdGVkSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMucHVzaChrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50Lm9wdGlvbnNbZWxlbWVudC5zZWxlY3RlZEluZGV4XSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVud3JhcHBlZEFycmF5KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHVud3JhcHBlZEFycmF5Lmxlbmd0aCA9PSBcInVuZGVmaW5lZFwiKSAvLyBDb2VyY2Ugc2luZ2xlIHZhbHVlIGludG8gYXJyYXlcbiAgICAgICAgICAgICAgICB1bndyYXBwZWRBcnJheSA9IFt1bndyYXBwZWRBcnJheV07XG5cbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgYW55IGVudHJpZXMgbWFya2VkIGFzIGRlc3Ryb3llZFxuICAgICAgICAgICAgZmlsdGVyZWRBcnJheSA9IGtvLnV0aWxzLmFycmF5RmlsdGVyKHVud3JhcHBlZEFycmF5LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluY2x1ZGVEZXN0cm95ZWQgfHwgaXRlbSA9PT0gdW5kZWZpbmVkIHx8IGl0ZW0gPT09IG51bGwgfHwgIWtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoaXRlbVsnX2Rlc3Ryb3knXSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gSWYgY2FwdGlvbiBpcyBpbmNsdWRlZCwgYWRkIGl0IHRvIHRoZSBhcnJheVxuICAgICAgICAgICAgaWYgKGFsbEJpbmRpbmdzWydoYXMnXSgnb3B0aW9uc0NhcHRpb24nKSkge1xuICAgICAgICAgICAgICAgIGNhcHRpb25WYWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zQ2FwdGlvbicpKTtcbiAgICAgICAgICAgICAgICAvLyBJZiBjYXB0aW9uIHZhbHVlIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBkb24ndCBzaG93IGEgY2FwdGlvblxuICAgICAgICAgICAgICAgIGlmIChjYXB0aW9uVmFsdWUgIT09IG51bGwgJiYgY2FwdGlvblZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRBcnJheS51bnNoaWZ0KGNhcHRpb25QbGFjZWhvbGRlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgYSBmYWxzeSB2YWx1ZSBpcyBwcm92aWRlZCAoZS5nLiBudWxsKSwgd2UnbGwgc2ltcGx5IGVtcHR5IHRoZSBzZWxlY3QgZWxlbWVudFxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXBwbHlUb09iamVjdChvYmplY3QsIHByZWRpY2F0ZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcHJlZGljYXRlVHlwZSA9IHR5cGVvZiBwcmVkaWNhdGU7XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlVHlwZSA9PSBcImZ1bmN0aW9uXCIpICAgIC8vIEdpdmVuIGEgZnVuY3Rpb247IHJ1biBpdCBhZ2FpbnN0IHRoZSBkYXRhIHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWRpY2F0ZShvYmplY3QpO1xuICAgICAgICAgICAgZWxzZSBpZiAocHJlZGljYXRlVHlwZSA9PSBcInN0cmluZ1wiKSAvLyBHaXZlbiBhIHN0cmluZzsgdHJlYXQgaXQgYXMgYSBwcm9wZXJ0eSBuYW1lIG9uIHRoZSBkYXRhIHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdFtwcmVkaWNhdGVdO1xuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2l2ZW4gbm8gb3B0aW9uc1RleHQgYXJnOyB1c2UgdGhlIGRhdGEgdmFsdWUgaXRzZWxmXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIGNhbiBydW4gYXQgdHdvIGRpZmZlcmVudCB0aW1lczpcbiAgICAgICAgLy8gVGhlIGZpcnN0IGlzIHdoZW4gdGhlIHdob2xlIGFycmF5IGlzIGJlaW5nIHVwZGF0ZWQgZGlyZWN0bHkgZnJvbSB0aGlzIGJpbmRpbmcgaGFuZGxlci5cbiAgICAgICAgLy8gVGhlIHNlY29uZCBpcyB3aGVuIGFuIG9ic2VydmFibGUgdmFsdWUgZm9yIGEgc3BlY2lmaWMgYXJyYXkgZW50cnkgaXMgdXBkYXRlZC5cbiAgICAgICAgLy8gb2xkT3B0aW9ucyB3aWxsIGJlIGVtcHR5IGluIHRoZSBmaXJzdCBjYXNlLCBidXQgd2lsbCBiZSBmaWxsZWQgd2l0aCB0aGUgcHJldmlvdXNseSBnZW5lcmF0ZWQgb3B0aW9uIGluIHRoZSBzZWNvbmQuXG4gICAgICAgIHZhciBpdGVtVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIG9wdGlvbkZvckFycmF5SXRlbShhcnJheUVudHJ5LCBpbmRleCwgb2xkT3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKG9sZE9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXNTZWxlY3RlZFZhbHVlcyA9ICF2YWx1ZUFsbG93VW5zZXQgJiYgb2xkT3B0aW9uc1swXS5zZWxlY3RlZCA/IFsga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUob2xkT3B0aW9uc1swXSkgXSA6IFtdO1xuICAgICAgICAgICAgICAgIGl0ZW1VcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGVsZW1lbnQub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICAgICAgaWYgKGFycmF5RW50cnkgPT09IGNhcHRpb25QbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnNldFRleHRDb250ZW50KG9wdGlvbiwgYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zQ2FwdGlvbicpKTtcbiAgICAgICAgICAgICAgICBrby5zZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUob3B0aW9uLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBBcHBseSBhIHZhbHVlIHRvIHRoZSBvcHRpb24gZWxlbWVudFxuICAgICAgICAgICAgICAgIHZhciBvcHRpb25WYWx1ZSA9IGFwcGx5VG9PYmplY3QoYXJyYXlFbnRyeSwgYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zVmFsdWUnKSwgYXJyYXlFbnRyeSk7XG4gICAgICAgICAgICAgICAga28uc2VsZWN0RXh0ZW5zaW9ucy53cml0ZVZhbHVlKG9wdGlvbiwga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShvcHRpb25WYWx1ZSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgc29tZSB0ZXh0IHRvIHRoZSBvcHRpb24gZWxlbWVudFxuICAgICAgICAgICAgICAgIHZhciBvcHRpb25UZXh0ID0gYXBwbHlUb09iamVjdChhcnJheUVudHJ5LCBhbGxCaW5kaW5ncy5nZXQoJ29wdGlvbnNUZXh0JyksIG9wdGlvblZhbHVlKTtcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXRUZXh0Q29udGVudChvcHRpb24sIG9wdGlvblRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtvcHRpb25dO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnkgdXNpbmcgYSBiZWZvcmVSZW1vdmUgY2FsbGJhY2ssIHdlIGRlbGF5IHRoZSByZW1vdmFsIHVudGlsIGFmdGVyIG5ldyBpdGVtcyBhcmUgYWRkZWQuIFRoaXMgZml4ZXMgYSBzZWxlY3Rpb25cbiAgICAgICAgLy8gcHJvYmxlbSBpbiBJRTw9OCBhbmQgRmlyZWZveC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9rbm9ja291dC9rbm9ja291dC9pc3N1ZXMvMTIwOFxuICAgICAgICBhcnJheVRvRG9tTm9kZUNoaWxkcmVuT3B0aW9uc1snYmVmb3JlUmVtb3ZlJ10gPVxuICAgICAgICAgICAgZnVuY3Rpb24gKG9wdGlvbikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQob3B0aW9uKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0U2VsZWN0aW9uQ2FsbGJhY2soYXJyYXlFbnRyeSwgbmV3T3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKGl0ZW1VcGRhdGUgJiYgdmFsdWVBbGxvd1Vuc2V0KSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIG1vZGVsIHZhbHVlIGlzIGF1dGhvcml0YXRpdmUsIHNvIG1ha2Ugc3VyZSBpdHMgdmFsdWUgaXMgdGhlIG9uZSBzZWxlY3RlZFxuICAgICAgICAgICAgICAgIC8vIFRoZXJlIGlzIG5vIG5lZWQgdG8gdXNlIGRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlIHNpbmNlIHNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcgZG9lcyBzbyBhbHJlYWR5LlxuICAgICAgICAgICAgICAgIGtvLnNlbGVjdEV4dGVuc2lvbnMud3JpdGVWYWx1ZShlbGVtZW50LCBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGFsbEJpbmRpbmdzLmdldCgndmFsdWUnKSksIHRydWUgLyogYWxsb3dVbnNldCAqLyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gSUU2IGRvZXNuJ3QgbGlrZSB1cyB0byBhc3NpZ24gc2VsZWN0aW9uIHRvIE9QVElPTiBub2RlcyBiZWZvcmUgdGhleSdyZSBhZGRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gVGhhdCdzIHdoeSB3ZSBmaXJzdCBhZGRlZCB0aGVtIHdpdGhvdXQgc2VsZWN0aW9uLiBOb3cgaXQncyB0aW1lIHRvIHNldCB0aGUgc2VsZWN0aW9uLlxuICAgICAgICAgICAgICAgIHZhciBpc1NlbGVjdGVkID0ga28udXRpbHMuYXJyYXlJbmRleE9mKHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMsIGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKG5ld09wdGlvbnNbMF0pKSA+PSAwO1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnNldE9wdGlvbk5vZGVTZWxlY3Rpb25TdGF0ZShuZXdPcHRpb25zWzBdLCBpc1NlbGVjdGVkKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgb3B0aW9uIHdhcyBjaGFuZ2VkIGZyb20gYmVpbmcgc2VsZWN0ZWQgZHVyaW5nIGEgc2luZ2xlLWl0ZW0gdXBkYXRlLCBub3RpZnkgdGhlIGNoYW5nZVxuICAgICAgICAgICAgICAgIGlmIChpdGVtVXBkYXRlICYmICFpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGtvLnV0aWxzLnRyaWdnZXJFdmVudCwgbnVsbCwgW2VsZW1lbnQsIFwiY2hhbmdlXCJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBzZXRTZWxlY3Rpb25DYWxsYmFjaztcbiAgICAgICAgaWYgKGFsbEJpbmRpbmdzWydoYXMnXSgnb3B0aW9uc0FmdGVyUmVuZGVyJykgJiYgdHlwZW9mIGFsbEJpbmRpbmdzLmdldCgnb3B0aW9uc0FmdGVyUmVuZGVyJykgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKGFycmF5RW50cnksIG5ld09wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb25DYWxsYmFjayhhcnJheUVudHJ5LCBuZXdPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShhbGxCaW5kaW5ncy5nZXQoJ29wdGlvbnNBZnRlclJlbmRlcicpLCBudWxsLCBbbmV3T3B0aW9uc1swXSwgYXJyYXlFbnRyeSAhPT0gY2FwdGlvblBsYWNlaG9sZGVyID8gYXJyYXlFbnRyeSA6IHVuZGVmaW5lZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAga28udXRpbHMuc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyhlbGVtZW50LCBmaWx0ZXJlZEFycmF5LCBvcHRpb25Gb3JBcnJheUl0ZW0sIGFycmF5VG9Eb21Ob2RlQ2hpbGRyZW5PcHRpb25zLCBjYWxsYmFjayk7XG5cbiAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlQWxsb3dVbnNldCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBtb2RlbCB2YWx1ZSBpcyBhdXRob3JpdGF0aXZlLCBzbyBtYWtlIHN1cmUgaXRzIHZhbHVlIGlzIHRoZSBvbmUgc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICBrby5zZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUoZWxlbWVudCwga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShhbGxCaW5kaW5ncy5nZXQoJ3ZhbHVlJykpLCB0cnVlIC8qIGFsbG93VW5zZXQgKi8pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgaWYgdGhlIHNlbGVjdGlvbiBoYXMgY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiB1cGRhdGluZyB0aGUgb3B0aW9ucyBsaXN0XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdGlvbkNoYW5nZWQ7XG4gICAgICAgICAgICAgICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBhIG11bHRpcGxlLXNlbGVjdCBib3gsIGNvbXBhcmUgdGhlIG5ldyBzZWxlY3Rpb24gY291bnQgdG8gdGhlIHByZXZpb3VzIG9uZVxuICAgICAgICAgICAgICAgICAgICAvLyBCdXQgaWYgbm90aGluZyB3YXMgc2VsZWN0ZWQgYmVmb3JlLCB0aGUgc2VsZWN0aW9uIGNhbid0IGhhdmUgY2hhbmdlZFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25DaGFuZ2VkID0gcHJldmlvdXNTZWxlY3RlZFZhbHVlcy5sZW5ndGggJiYgc2VsZWN0ZWRPcHRpb25zKCkubGVuZ3RoIDwgcHJldmlvdXNTZWxlY3RlZFZhbHVlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGEgc2luZ2xlLXNlbGVjdCBib3gsIGNvbXBhcmUgdGhlIGN1cnJlbnQgdmFsdWUgdG8gdGhlIHByZXZpb3VzIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIC8vIEJ1dCBpZiBub3RoaW5nIHdhcyBzZWxlY3RlZCBiZWZvcmUgb3Igbm90aGluZyBpcyBzZWxlY3RlZCBub3csIGp1c3QgbG9vayBmb3IgYSBjaGFuZ2UgaW4gc2VsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbkNoYW5nZWQgPSAocHJldmlvdXNTZWxlY3RlZFZhbHVlcy5sZW5ndGggJiYgZWxlbWVudC5zZWxlY3RlZEluZGV4ID49IDApXG4gICAgICAgICAgICAgICAgICAgICAgICA/IChrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50Lm9wdGlvbnNbZWxlbWVudC5zZWxlY3RlZEluZGV4XSkgIT09IHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXNbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IChwcmV2aW91c1NlbGVjdGVkVmFsdWVzLmxlbmd0aCB8fCBlbGVtZW50LnNlbGVjdGVkSW5kZXggPj0gMCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnNpc3RlbmN5IGJldHdlZW4gbW9kZWwgdmFsdWUgYW5kIHNlbGVjdGVkIG9wdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZHJvcGRvd24gd2FzIGNoYW5nZWQgc28gdGhhdCBzZWxlY3Rpb24gaXMgbm8gbG9uZ2VyIHRoZSBzYW1lLFxuICAgICAgICAgICAgICAgIC8vIG5vdGlmeSB0aGUgdmFsdWUgb3Igc2VsZWN0ZWRPcHRpb25zIGJpbmRpbmcuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbkNoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICAgICAga28udXRpbHMudHJpZ2dlckV2ZW50KGVsZW1lbnQsIFwiY2hhbmdlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgSUUgYnVnXG4gICAgICAgIGtvLnV0aWxzLmVuc3VyZVNlbGVjdEVsZW1lbnRJc1JlbmRlcmVkQ29ycmVjdGx5KGVsZW1lbnQpO1xuXG4gICAgICAgIGlmIChwcmV2aW91c1Njcm9sbFRvcCAmJiBNYXRoLmFicyhwcmV2aW91c1Njcm9sbFRvcCAtIGVsZW1lbnQuc2Nyb2xsVG9wKSA+IDIwKVxuICAgICAgICAgICAgZWxlbWVudC5zY3JvbGxUb3AgPSBwcmV2aW91c1Njcm9sbFRvcDtcbiAgICB9XG59O1xua28uYmluZGluZ0hhbmRsZXJzWydvcHRpb25zJ10ub3B0aW9uVmFsdWVEb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3NlbGVjdGVkT3B0aW9ucyddID0ge1xuICAgICdhZnRlcic6IFsnb3B0aW9ucycsICdmb3JlYWNoJ10sXG4gICAgJ2luaXQnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MpIHtcbiAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpLCB2YWx1ZVRvV3JpdGUgPSBbXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0aW9uXCIpLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuc2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlVG9Xcml0ZS5wdXNoKGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKG5vZGUpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAga28uZXhwcmVzc2lvblJld3JpdGluZy53cml0ZVZhbHVlVG9Qcm9wZXJ0eSh2YWx1ZSwgYWxsQmluZGluZ3MsICdzZWxlY3RlZE9wdGlvbnMnLCB2YWx1ZVRvV3JpdGUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICBpZiAoa28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpICE9IFwic2VsZWN0XCIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ2YWx1ZXMgYmluZGluZyBhcHBsaWVzIG9ubHkgdG8gU0VMRUNUIGVsZW1lbnRzXCIpO1xuXG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcbiAgICAgICAgaWYgKG5ld1ZhbHVlICYmIHR5cGVvZiBuZXdWYWx1ZS5sZW5ndGggPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRpb25cIiksIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXNTZWxlY3RlZCA9IGtvLnV0aWxzLmFycmF5SW5kZXhPZihuZXdWYWx1ZSwga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUobm9kZSkpID49IDA7XG4gICAgICAgICAgICAgICAga28udXRpbHMuc2V0T3B0aW9uTm9kZVNlbGVjdGlvblN0YXRlKG5vZGUsIGlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xua28uZXhwcmVzc2lvblJld3JpdGluZy50d29XYXlCaW5kaW5nc1snc2VsZWN0ZWRPcHRpb25zJ10gPSB0cnVlO1xua28uYmluZGluZ0hhbmRsZXJzWydzdHlsZSddID0ge1xuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSB8fCB7fSk7XG4gICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2godmFsdWUsIGZ1bmN0aW9uKHN0eWxlTmFtZSwgc3R5bGVWYWx1ZSkge1xuICAgICAgICAgICAgc3R5bGVWYWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoc3R5bGVWYWx1ZSk7XG5cbiAgICAgICAgICAgIGlmIChzdHlsZVZhbHVlID09PSBudWxsIHx8IHN0eWxlVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBzdHlsZVZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIC8vIEVtcHR5IHN0cmluZyByZW1vdmVzIHRoZSB2YWx1ZSwgd2hlcmVhcyBudWxsL3VuZGVmaW5lZCBoYXZlIG5vIGVmZmVjdFxuICAgICAgICAgICAgICAgIHN0eWxlVmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3N0eWxlTmFtZV0gPSBzdHlsZVZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xua28uYmluZGluZ0hhbmRsZXJzWydzdWJtaXQnXSA9IHtcbiAgICAnaW5pdCc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncywgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlQWNjZXNzb3IoKSAhPSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgdmFsdWUgZm9yIGEgc3VibWl0IGJpbmRpbmcgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcInN1Ym1pdFwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyUmV0dXJuVmFsdWU7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICB0cnkgeyBoYW5kbGVyUmV0dXJuVmFsdWUgPSB2YWx1ZS5jYWxsKGJpbmRpbmdDb250ZXh0WyckZGF0YSddLCBlbGVtZW50KTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJSZXR1cm5WYWx1ZSAhPT0gdHJ1ZSkgeyAvLyBOb3JtYWxseSB3ZSB3YW50IHRvIHByZXZlbnQgZGVmYXVsdCBhY3Rpb24uIERldmVsb3BlciBjYW4gb3ZlcnJpZGUgdGhpcyBiZSBleHBsaWNpdGx5IHJldHVybmluZyB0cnVlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcbmtvLmJpbmRpbmdIYW5kbGVyc1sndGV4dCddID0ge1xuICAgICdpbml0JzogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFByZXZlbnQgYmluZGluZyBvbiB0aGUgZHluYW1pY2FsbHktaW5qZWN0ZWQgdGV4dCBub2RlIChhcyBkZXZlbG9wZXJzIGFyZSB1bmxpa2VseSB0byBleHBlY3QgdGhhdCwgYW5kIGl0IGhhcyBzZWN1cml0eSBpbXBsaWNhdGlvbnMpLlxuICAgICAgICAvLyBJdCBzaG91bGQgYWxzbyBtYWtlIHRoaW5ncyBmYXN0ZXIsIGFzIHdlIG5vIGxvbmdlciBoYXZlIHRvIGNvbnNpZGVyIHdoZXRoZXIgdGhlIHRleHQgbm9kZSBtaWdodCBiZSBiaW5kYWJsZS5cbiAgICAgICAgcmV0dXJuIHsgJ2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzJzogdHJ1ZSB9O1xuICAgIH0sXG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIGtvLnV0aWxzLnNldFRleHRDb250ZW50KGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgfVxufTtcbmtvLnZpcnR1YWxFbGVtZW50cy5hbGxvd2VkQmluZGluZ3NbJ3RleHQnXSA9IHRydWU7XG4oZnVuY3Rpb24gKCkge1xuXG5pZiAod2luZG93ICYmIHdpbmRvdy5uYXZpZ2F0b3IpIHtcbiAgICB2YXIgcGFyc2VWZXJzaW9uID0gZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG1hdGNoZXNbMV0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIERldGVjdCB2YXJpb3VzIGJyb3dzZXIgdmVyc2lvbnMgYmVjYXVzZSBzb21lIG9sZCB2ZXJzaW9ucyBkb24ndCBmdWxseSBzdXBwb3J0IHRoZSAnaW5wdXQnIGV2ZW50XG4gICAgdmFyIG9wZXJhVmVyc2lvbiA9IHdpbmRvdy5vcGVyYSAmJiB3aW5kb3cub3BlcmEudmVyc2lvbiAmJiBwYXJzZUludCh3aW5kb3cub3BlcmEudmVyc2lvbigpKSxcbiAgICAgICAgdXNlckFnZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgIHNhZmFyaVZlcnNpb24gPSBwYXJzZVZlcnNpb24odXNlckFnZW50Lm1hdGNoKC9eKD86KD8hY2hyb21lKS4pKnZlcnNpb25cXC8oW14gXSopIHNhZmFyaS9pKSksXG4gICAgICAgIGZpcmVmb3hWZXJzaW9uID0gcGFyc2VWZXJzaW9uKHVzZXJBZ2VudC5tYXRjaCgvRmlyZWZveFxcLyhbXiBdKikvKSk7XG59XG5cbi8vIElFIDggYW5kIDkgaGF2ZSBidWdzIHRoYXQgcHJldmVudCB0aGUgbm9ybWFsIGV2ZW50cyBmcm9tIGZpcmluZyB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzLlxuLy8gQnV0IGl0IGRvZXMgZmlyZSB0aGUgJ3NlbGVjdGlvbmNoYW5nZScgZXZlbnQgb24gbWFueSBvZiB0aG9zZSwgcHJlc3VtYWJseSBiZWNhdXNlIHRoZVxuLy8gY3Vyc29yIGlzIG1vdmluZyBhbmQgdGhhdCBjb3VudHMgYXMgdGhlIHNlbGVjdGlvbiBjaGFuZ2luZy4gVGhlICdzZWxlY3Rpb25jaGFuZ2UnIGV2ZW50IGlzXG4vLyBmaXJlZCBhdCB0aGUgZG9jdW1lbnQgbGV2ZWwgb25seSBhbmQgZG9lc24ndCBkaXJlY3RseSBpbmRpY2F0ZSB3aGljaCBlbGVtZW50IGNoYW5nZWQuIFdlXG4vLyBzZXQgdXAganVzdCBvbmUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGRvY3VtZW50IGFuZCB1c2UgJ2FjdGl2ZUVsZW1lbnQnIHRvIGRldGVybWluZSB3aGljaFxuLy8gZWxlbWVudCB3YXMgY2hhbmdlZC5cbmlmIChrby51dGlscy5pZVZlcnNpb24gPCAxMCkge1xuICAgIHZhciBzZWxlY3Rpb25DaGFuZ2VSZWdpc3RlcmVkTmFtZSA9IGtvLnV0aWxzLmRvbURhdGEubmV4dEtleSgpLFxuICAgICAgICBzZWxlY3Rpb25DaGFuZ2VIYW5kbGVyTmFtZSA9IGtvLnV0aWxzLmRvbURhdGEubmV4dEtleSgpO1xuICAgIHZhciBzZWxlY3Rpb25DaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IHRoaXMuYWN0aXZlRWxlbWVudCxcbiAgICAgICAgICAgIGhhbmRsZXIgPSB0YXJnZXQgJiYga28udXRpbHMuZG9tRGF0YS5nZXQodGFyZ2V0LCBzZWxlY3Rpb25DaGFuZ2VIYW5kbGVyTmFtZSk7XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgICBoYW5kbGVyKGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIHJlZ2lzdGVyRm9yU2VsZWN0aW9uQ2hhbmdlRXZlbnQgPSBmdW5jdGlvbiAoZWxlbWVudCwgaGFuZGxlcikge1xuICAgICAgICB2YXIgb3duZXJEb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQ7XG4gICAgICAgIGlmICgha28udXRpbHMuZG9tRGF0YS5nZXQob3duZXJEb2MsIHNlbGVjdGlvbkNoYW5nZVJlZ2lzdGVyZWROYW1lKSkge1xuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQob3duZXJEb2MsIHNlbGVjdGlvbkNoYW5nZVJlZ2lzdGVyZWROYW1lLCB0cnVlKTtcbiAgICAgICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKG93bmVyRG9jLCAnc2VsZWN0aW9uY2hhbmdlJywgc2VsZWN0aW9uQ2hhbmdlSGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQoZWxlbWVudCwgc2VsZWN0aW9uQ2hhbmdlSGFuZGxlck5hbWUsIGhhbmRsZXIpO1xuICAgIH07XG59XG5cbmtvLmJpbmRpbmdIYW5kbGVyc1sndGV4dElucHV0J10gPSB7XG4gICAgJ2luaXQnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MpIHtcblxuICAgICAgICB2YXIgcHJldmlvdXNFbGVtZW50VmFsdWUgPSBlbGVtZW50LnZhbHVlLFxuICAgICAgICAgICAgdGltZW91dEhhbmRsZSxcbiAgICAgICAgICAgIGVsZW1lbnRWYWx1ZUJlZm9yZUV2ZW50O1xuXG4gICAgICAgIHZhciB1cGRhdGVNb2RlbCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRIYW5kbGUpO1xuICAgICAgICAgICAgZWxlbWVudFZhbHVlQmVmb3JlRXZlbnQgPSB0aW1lb3V0SGFuZGxlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB2YXIgZWxlbWVudFZhbHVlID0gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgIGlmIChwcmV2aW91c0VsZW1lbnRWYWx1ZSAhPT0gZWxlbWVudFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy8gUHJvdmlkZSBhIHdheSBmb3IgdGVzdHMgdG8ga25vdyBleGFjdGx5IHdoaWNoIGV2ZW50IHdhcyBwcm9jZXNzZWRcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcgJiYgZXZlbnQpIGVsZW1lbnRbJ19rb190ZXh0SW5wdXRQcm9jZXNzZWRFdmVudCddID0gZXZlbnQudHlwZTtcbiAgICAgICAgICAgICAgICBwcmV2aW91c0VsZW1lbnRWYWx1ZSA9IGVsZW1lbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICBrby5leHByZXNzaW9uUmV3cml0aW5nLndyaXRlVmFsdWVUb1Byb3BlcnR5KHZhbHVlQWNjZXNzb3IoKSwgYWxsQmluZGluZ3MsICd0ZXh0SW5wdXQnLCBlbGVtZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBkZWZlclVwZGF0ZU1vZGVsID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoIXRpbWVvdXRIYW5kbGUpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgZWxlbWVudFZhbHVlQmVmb3JlRXZlbnQgdmFyaWFibGUgaXMgc2V0ICpvbmx5KiBkdXJpbmcgdGhlIGJyaWVmIGdhcCBiZXR3ZWVuIGFuXG4gICAgICAgICAgICAgICAgLy8gZXZlbnQgZmlyaW5nIGFuZCB0aGUgdXBkYXRlTW9kZWwgZnVuY3Rpb24gcnVubmluZy4gVGhpcyBhbGxvd3MgdXMgdG8gaWdub3JlIG1vZGVsXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlcyB0aGF0IGFyZSBmcm9tIHRoZSBwcmV2aW91cyBzdGF0ZSBvZiB0aGUgZWxlbWVudCwgdXN1YWxseSBkdWUgdG8gdGVjaG5pcXVlc1xuICAgICAgICAgICAgICAgIC8vIHN1Y2ggYXMgcmF0ZUxpbWl0LiBTdWNoIHVwZGF0ZXMsIGlmIG5vdCBpZ25vcmVkLCBjYW4gY2F1c2Uga2V5c3Ryb2tlcyB0byBiZSBsb3N0LlxuICAgICAgICAgICAgICAgIGVsZW1lbnRWYWx1ZUJlZm9yZUV2ZW50ID0gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgICAgICB2YXIgaGFuZGxlciA9IERFQlVHID8gdXBkYXRlTW9kZWwuYmluZChlbGVtZW50LCB7dHlwZTogZXZlbnQudHlwZX0pIDogdXBkYXRlTW9kZWw7XG4gICAgICAgICAgICAgICAgdGltZW91dEhhbmRsZSA9IHNldFRpbWVvdXQoaGFuZGxlciwgNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHVwZGF0ZVZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcblxuICAgICAgICAgICAgaWYgKG1vZGVsVmFsdWUgPT09IG51bGwgfHwgbW9kZWxWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbW9kZWxWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWxlbWVudFZhbHVlQmVmb3JlRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBtb2RlbFZhbHVlID09PSBlbGVtZW50VmFsdWVCZWZvcmVFdmVudCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodXBkYXRlVmlldywgNCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGVsZW1lbnQgb25seSBpZiB0aGUgZWxlbWVudCBhbmQgbW9kZWwgYXJlIGRpZmZlcmVudC4gT24gc29tZSBicm93c2VycywgdXBkYXRpbmcgdGhlIHZhbHVlXG4gICAgICAgICAgICAvLyB3aWxsIG1vdmUgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBpbnB1dCwgd2hpY2ggd291bGQgYmUgYmFkIHdoaWxlIHRoZSB1c2VyIGlzIHR5cGluZy5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnZhbHVlICE9PSBtb2RlbFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXNFbGVtZW50VmFsdWUgPSBtb2RlbFZhbHVlOyAgLy8gTWFrZSBzdXJlIHdlIGlnbm9yZSBldmVudHMgKHByb3BlcnR5Y2hhbmdlKSB0aGF0IHJlc3VsdCBmcm9tIHVwZGF0aW5nIHRoZSB2YWx1ZVxuICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSBtb2RlbFZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBvbkV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBldmVudCwgaGFuZGxlcik7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKERFQlVHICYmIGtvLmJpbmRpbmdIYW5kbGVyc1sndGV4dElucHV0J11bJ19mb3JjZVVwZGF0ZU9uJ10pIHtcbiAgICAgICAgICAgIC8vIFByb3ZpZGUgYSB3YXkgZm9yIHRlc3RzIHRvIHNwZWNpZnkgZXhhY3RseSB3aGljaCBldmVudHMgYXJlIGJvdW5kXG4gICAgICAgICAgICBrby51dGlscy5hcnJheUZvckVhY2goa28uYmluZGluZ0hhbmRsZXJzWyd0ZXh0SW5wdXQnXVsnX2ZvcmNlVXBkYXRlT24nXSwgZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50TmFtZS5zbGljZSgwLDUpID09ICdhZnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FdmVudChldmVudE5hbWUuc2xpY2UoNSksIGRlZmVyVXBkYXRlTW9kZWwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXZlbnQoZXZlbnROYW1lLCB1cGRhdGVNb2RlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa28udXRpbHMuaWVWZXJzaW9uIDwgMTApIHtcbiAgICAgICAgICAgICAgICAvLyBJbnRlcm5ldCBFeHBsb3JlciA8PSA4IGRvZXNuJ3Qgc3VwcG9ydCB0aGUgJ2lucHV0JyBldmVudCwgYnV0IGRvZXMgaW5jbHVkZSAncHJvcGVydHljaGFuZ2UnIHRoYXQgZmlyZXMgd2hlbmV2ZXJcbiAgICAgICAgICAgICAgICAvLyBhbnkgcHJvcGVydHkgb2YgYW4gZWxlbWVudCBjaGFuZ2VzLiBVbmxpa2UgJ2lucHV0JywgaXQgYWxzbyBmaXJlcyBpZiBhIHByb3BlcnR5IGlzIGNoYW5nZWQgZnJvbSBKYXZhU2NyaXB0IGNvZGUsXG4gICAgICAgICAgICAgICAgLy8gYnV0IHRoYXQncyBhbiBhY2NlcHRhYmxlIGNvbXByb21pc2UgZm9yIHRoaXMgYmluZGluZy4gSUUgOSBkb2VzIHN1cHBvcnQgJ2lucHV0JywgYnV0IHNpbmNlIGl0IGRvZXNuJ3QgZmlyZSBpdFxuICAgICAgICAgICAgICAgIC8vIHdoZW4gdXNpbmcgYXV0b2NvbXBsZXRlLCB3ZSdsbCB1c2UgJ3Byb3BlcnR5Y2hhbmdlJyBmb3IgaXQgYWxzby5cbiAgICAgICAgICAgICAgICBvbkV2ZW50KCdwcm9wZXJ0eWNoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5wcm9wZXJ0eU5hbWUgPT09ICd2YWx1ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZU1vZGVsKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGtvLnV0aWxzLmllVmVyc2lvbiA9PSA4KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElFIDggaGFzIGEgYnVnIHdoZXJlIGl0IGZhaWxzIHRvIGZpcmUgJ3Byb3BlcnR5Y2hhbmdlJyBvbiB0aGUgZmlyc3QgdXBkYXRlIGZvbGxvd2luZyBhIHZhbHVlIGNoYW5nZSBmcm9tXG4gICAgICAgICAgICAgICAgICAgIC8vIEphdmFTY3JpcHQgY29kZS4gSXQgYWxzbyBkb2Vzbid0IGZpcmUgaWYgeW91IGNsZWFyIHRoZSBlbnRpcmUgdmFsdWUuIFRvIGZpeCB0aGlzLCB3ZSBiaW5kIHRvIHRoZSBmb2xsb3dpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlbnRzIHRvby5cbiAgICAgICAgICAgICAgICAgICAgb25FdmVudCgna2V5dXAnLCB1cGRhdGVNb2RlbCk7ICAgICAgLy8gQSBzaW5nbGUga2V5c3Rva2VcbiAgICAgICAgICAgICAgICAgICAgb25FdmVudCgna2V5ZG93bicsIHVwZGF0ZU1vZGVsKTsgICAgLy8gVGhlIGZpcnN0IGNoYXJhY3RlciB3aGVuIGEga2V5IGlzIGhlbGQgZG93blxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoa28udXRpbHMuaWVWZXJzaW9uID49IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJuZXQgRXhwbG9yZXIgOSBkb2Vzbid0IGZpcmUgdGhlICdpbnB1dCcgZXZlbnQgd2hlbiBkZWxldGluZyB0ZXh0LCBpbmNsdWRpbmcgdXNpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGJhY2tzcGFjZSwgZGVsZXRlLCBvciBjdHJsLXgga2V5cywgY2xpY2tpbmcgdGhlICd4JyB0byBjbGVhciB0aGUgaW5wdXQsIGRyYWdnaW5nIHRleHRcbiAgICAgICAgICAgICAgICAgICAgLy8gb3V0IG9mIHRoZSBmaWVsZCwgYW5kIGN1dHRpbmcgb3IgZGVsZXRpbmcgdGV4dCB1c2luZyB0aGUgY29udGV4dCBtZW51LiAnc2VsZWN0aW9uY2hhbmdlJ1xuICAgICAgICAgICAgICAgICAgICAvLyBjYW4gZGV0ZWN0IGFsbCBvZiB0aG9zZSBleGNlcHQgZHJhZ2dpbmcgdGV4dCBvdXQgb2YgdGhlIGZpZWxkLCBmb3Igd2hpY2ggd2UgdXNlICdkcmFnZW5kJy5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlc2UgYXJlIGFsc28gbmVlZGVkIGluIElFOCBiZWNhdXNlIG9mIHRoZSBidWcgZGVzY3JpYmVkIGFib3ZlLlxuICAgICAgICAgICAgICAgICAgICByZWdpc3RlckZvclNlbGVjdGlvbkNoYW5nZUV2ZW50KGVsZW1lbnQsIHVwZGF0ZU1vZGVsKTsgIC8vICdzZWxlY3Rpb25jaGFuZ2UnIGNvdmVycyBjdXQsIHBhc3RlLCBkcm9wLCBkZWxldGUsIGV0Yy5cbiAgICAgICAgICAgICAgICAgICAgb25FdmVudCgnZHJhZ2VuZCcsIGRlZmVyVXBkYXRlTW9kZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQWxsIG90aGVyIHN1cHBvcnRlZCBicm93c2VycyBzdXBwb3J0IHRoZSAnaW5wdXQnIGV2ZW50LCB3aGljaCBmaXJlcyB3aGVuZXZlciB0aGUgY29udGVudCBvZiB0aGUgZWxlbWVudCBpcyBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgLy8gdGhyb3VnaCB0aGUgdXNlciBpbnRlcmZhY2UuXG4gICAgICAgICAgICAgICAgb25FdmVudCgnaW5wdXQnLCB1cGRhdGVNb2RlbCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2FmYXJpVmVyc2lvbiA8IDUgJiYga28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpID09PSBcInRleHRhcmVhXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIDw1IGRvZXNuJ3QgZmlyZSB0aGUgJ2lucHV0JyBldmVudCBmb3IgPHRleHRhcmVhPiBlbGVtZW50cyAoaXQgZG9lcyBmaXJlICd0ZXh0SW5wdXQnXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1dCBvbmx5IHdoZW4gdHlwaW5nKS4gU28gd2UnbGwganVzdCBjYXRjaCBhcyBtdWNoIGFzIHdlIGNhbiB3aXRoIGtleWRvd24sIGN1dCwgYW5kIHBhc3RlLlxuICAgICAgICAgICAgICAgICAgICBvbkV2ZW50KCdrZXlkb3duJywgZGVmZXJVcGRhdGVNb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgIG9uRXZlbnQoJ3Bhc3RlJywgZGVmZXJVcGRhdGVNb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgIG9uRXZlbnQoJ2N1dCcsIGRlZmVyVXBkYXRlTW9kZWwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3BlcmFWZXJzaW9uIDwgMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgMTAgZG9lc24ndCBhbHdheXMgZmlyZSB0aGUgJ2lucHV0JyBldmVudCBmb3IgY3V0LCBwYXN0ZSwgdW5kbyAmIGRyb3Agb3BlcmF0aW9ucy5cbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgY2FuIHRyeSB0byBjYXRjaCBzb21lIG9mIHRob3NlIHVzaW5nICdrZXlkb3duJy5cbiAgICAgICAgICAgICAgICAgICAgb25FdmVudCgna2V5ZG93bicsIGRlZmVyVXBkYXRlTW9kZWwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlyZWZveFZlcnNpb24gPCA0LjApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCA8PSAzLjYgZG9lc24ndCBmaXJlIHRoZSAnaW5wdXQnIGV2ZW50IHdoZW4gdGV4dCBpcyBmaWxsZWQgaW4gdGhyb3VnaCBhdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgb25FdmVudCgnRE9NQXV0b0NvbXBsZXRlJywgdXBkYXRlTW9kZWwpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggPD0zLjUgZG9lc24ndCBmaXJlIHRoZSAnaW5wdXQnIGV2ZW50IHdoZW4gdGV4dCBpcyBkcm9wcGVkIGludG8gdGhlIGlucHV0LlxuICAgICAgICAgICAgICAgICAgICBvbkV2ZW50KCdkcmFnZHJvcCcsIHVwZGF0ZU1vZGVsKTsgICAgICAgLy8gPDMuNVxuICAgICAgICAgICAgICAgICAgICBvbkV2ZW50KCdkcm9wJywgdXBkYXRlTW9kZWwpOyAgICAgICAgICAgLy8gMy41XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmluZCB0byB0aGUgY2hhbmdlIGV2ZW50IHNvIHRoYXQgd2UgY2FuIGNhdGNoIHByb2dyYW1tYXRpYyB1cGRhdGVzIG9mIHRoZSB2YWx1ZSB0aGF0IGZpcmUgdGhpcyBldmVudC5cbiAgICAgICAgb25FdmVudCgnY2hhbmdlJywgdXBkYXRlTW9kZWwpO1xuXG4gICAgICAgIGtvLmNvbXB1dGVkKHVwZGF0ZVZpZXcsIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBlbGVtZW50IH0pO1xuICAgIH1cbn07XG5rby5leHByZXNzaW9uUmV3cml0aW5nLnR3b1dheUJpbmRpbmdzWyd0ZXh0SW5wdXQnXSA9IHRydWU7XG5cbi8vIHRleHRpbnB1dCBpcyBhbiBhbGlhcyBmb3IgdGV4dElucHV0XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3RleHRpbnB1dCddID0ge1xuICAgIC8vIHByZXByb2Nlc3MgaXMgdGhlIG9ubHkgd2F5IHRvIHNldCB1cCBhIGZ1bGwgYWxpYXNcbiAgICAncHJlcHJvY2Vzcyc6IGZ1bmN0aW9uICh2YWx1ZSwgbmFtZSwgYWRkQmluZGluZykge1xuICAgICAgICBhZGRCaW5kaW5nKCd0ZXh0SW5wdXQnLCB2YWx1ZSk7XG4gICAgfVxufTtcblxufSkoKTtrby5iaW5kaW5nSGFuZGxlcnNbJ3VuaXF1ZU5hbWUnXSA9IHtcbiAgICAnaW5pdCc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIGlmICh2YWx1ZUFjY2Vzc29yKCkpIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gXCJrb191bmlxdWVfXCIgKyAoKytrby5iaW5kaW5nSGFuZGxlcnNbJ3VuaXF1ZU5hbWUnXS5jdXJyZW50SW5kZXgpO1xuICAgICAgICAgICAga28udXRpbHMuc2V0RWxlbWVudE5hbWUoZWxlbWVudCwgbmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xua28uYmluZGluZ0hhbmRsZXJzWyd1bmlxdWVOYW1lJ10uY3VycmVudEluZGV4ID0gMDtcbmtvLmJpbmRpbmdIYW5kbGVyc1sndmFsdWUnXSA9IHtcbiAgICAnYWZ0ZXInOiBbJ29wdGlvbnMnLCAnZm9yZWFjaCddLFxuICAgICdpbml0JzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzKSB7XG4gICAgICAgIC8vIElmIHRoZSB2YWx1ZSBiaW5kaW5nIGlzIHBsYWNlZCBvbiBhIHJhZGlvL2NoZWNrYm94LCB0aGVuIGp1c3QgcGFzcyB0aHJvdWdoIHRvIGNoZWNrZWRWYWx1ZSBhbmQgcXVpdFxuICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJpbnB1dFwiICYmIChlbGVtZW50LnR5cGUgPT0gXCJjaGVja2JveFwiIHx8IGVsZW1lbnQudHlwZSA9PSBcInJhZGlvXCIpKSB7XG4gICAgICAgICAgICBrby5hcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGUoZWxlbWVudCwgeyAnY2hlY2tlZFZhbHVlJzogdmFsdWVBY2Nlc3NvciB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsd2F5cyBjYXRjaCBcImNoYW5nZVwiIGV2ZW50OyBwb3NzaWJseSBvdGhlciBldmVudHMgdG9vIGlmIGFza2VkXG4gICAgICAgIHZhciBldmVudHNUb0NhdGNoID0gW1wiY2hhbmdlXCJdO1xuICAgICAgICB2YXIgcmVxdWVzdGVkRXZlbnRzVG9DYXRjaCA9IGFsbEJpbmRpbmdzLmdldChcInZhbHVlVXBkYXRlXCIpO1xuICAgICAgICB2YXIgcHJvcGVydHlDaGFuZ2VkRmlyZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVsZW1lbnRWYWx1ZUJlZm9yZUV2ZW50ID0gbnVsbDtcblxuICAgICAgICBpZiAocmVxdWVzdGVkRXZlbnRzVG9DYXRjaCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0ZWRFdmVudHNUb0NhdGNoID09IFwic3RyaW5nXCIpIC8vIEFsbG93IGJvdGggaW5kaXZpZHVhbCBldmVudCBuYW1lcywgYW5kIGFycmF5cyBvZiBldmVudCBuYW1lc1xuICAgICAgICAgICAgICAgIHJlcXVlc3RlZEV2ZW50c1RvQ2F0Y2ggPSBbcmVxdWVzdGVkRXZlbnRzVG9DYXRjaF07XG4gICAgICAgICAgICBrby51dGlscy5hcnJheVB1c2hBbGwoZXZlbnRzVG9DYXRjaCwgcmVxdWVzdGVkRXZlbnRzVG9DYXRjaCk7XG4gICAgICAgICAgICBldmVudHNUb0NhdGNoID0ga28udXRpbHMuYXJyYXlHZXREaXN0aW5jdFZhbHVlcyhldmVudHNUb0NhdGNoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB2YWx1ZVVwZGF0ZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGVsZW1lbnRWYWx1ZUJlZm9yZUV2ZW50ID0gbnVsbDtcbiAgICAgICAgICAgIHByb3BlcnR5Q2hhbmdlZEZpcmVkID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIHZhciBlbGVtZW50VmFsdWUgPSBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50KTtcbiAgICAgICAgICAgIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcud3JpdGVWYWx1ZVRvUHJvcGVydHkobW9kZWxWYWx1ZSwgYWxsQmluZGluZ3MsICd2YWx1ZScsIGVsZW1lbnRWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzEyMlxuICAgICAgICAvLyBJRSBkb2Vzbid0IGZpcmUgXCJjaGFuZ2VcIiBldmVudHMgb24gdGV4dGJveGVzIGlmIHRoZSB1c2VyIHNlbGVjdHMgYSB2YWx1ZSBmcm9tIGl0cyBhdXRvY29tcGxldGUgbGlzdFxuICAgICAgICB2YXIgaWVBdXRvQ29tcGxldGVIYWNrTmVlZGVkID0ga28udXRpbHMuaWVWZXJzaW9uICYmIGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IFwiaW5wdXRcIiAmJiBlbGVtZW50LnR5cGUgPT0gXCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGVsZW1lbnQuYXV0b2NvbXBsZXRlICE9IFwib2ZmXCIgJiYgKCFlbGVtZW50LmZvcm0gfHwgZWxlbWVudC5mb3JtLmF1dG9jb21wbGV0ZSAhPSBcIm9mZlwiKTtcbiAgICAgICAgaWYgKGllQXV0b0NvbXBsZXRlSGFja05lZWRlZCAmJiBrby51dGlscy5hcnJheUluZGV4T2YoZXZlbnRzVG9DYXRjaCwgXCJwcm9wZXJ0eWNoYW5nZVwiKSA9PSAtMSkge1xuICAgICAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJwcm9wZXJ0eWNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7IHByb3BlcnR5Q2hhbmdlZEZpcmVkID0gdHJ1ZSB9KTtcbiAgICAgICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwiZm9jdXNcIiwgZnVuY3Rpb24gKCkgeyBwcm9wZXJ0eUNoYW5nZWRGaXJlZCA9IGZhbHNlIH0pO1xuICAgICAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJibHVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eUNoYW5nZWRGaXJlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZVVwZGF0ZUhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChldmVudHNUb0NhdGNoLCBmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgICAgIC8vIFRoZSBzeW50YXggXCJhZnRlcjxldmVudG5hbWU+XCIgbWVhbnMgXCJydW4gdGhlIGhhbmRsZXIgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIGV2ZW50XCJcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgdXNlZnVsLCBmb3IgZXhhbXBsZSwgdG8gY2F0Y2ggXCJrZXlkb3duXCIgZXZlbnRzIGFmdGVyIHRoZSBicm93c2VyIGhhcyB1cGRhdGVkIHRoZSBjb250cm9sXG4gICAgICAgICAgICAvLyAob3RoZXJ3aXNlLCBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZSh0aGlzKSB3aWxsIHJlY2VpdmUgdGhlIGNvbnRyb2wncyB2YWx1ZSAqYmVmb3JlKiB0aGUga2V5IGV2ZW50KVxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB2YWx1ZVVwZGF0ZUhhbmRsZXI7XG4gICAgICAgICAgICBpZiAoa28udXRpbHMuc3RyaW5nU3RhcnRzV2l0aChldmVudE5hbWUsIFwiYWZ0ZXJcIikpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBlbGVtZW50VmFsdWVCZWZvcmVFdmVudCB2YXJpYWJsZSBpcyBub24tbnVsbCAqb25seSogZHVyaW5nIHRoZSBicmllZiBnYXAgYmV0d2VlblxuICAgICAgICAgICAgICAgICAgICAvLyBhIGtleVggZXZlbnQgZmlyaW5nIGFuZCB0aGUgdmFsdWVVcGRhdGVIYW5kbGVyIHJ1bm5pbmcsIHdoaWNoIGlzIHNjaGVkdWxlZCB0byBoYXBwZW5cbiAgICAgICAgICAgICAgICAgICAgLy8gYXQgdGhlIGVhcmxpZXN0IGFzeW5jaHJvbm91cyBvcHBvcnR1bml0eS4gV2Ugc3RvcmUgdGhpcyB0ZW1wb3JhcnkgaW5mb3JtYXRpb24gc28gdGhhdFxuICAgICAgICAgICAgICAgICAgICAvLyBpZiwgYmV0d2VlbiBrZXlYIGFuZCB2YWx1ZVVwZGF0ZUhhbmRsZXIsIHRoZSB1bmRlcmx5aW5nIG1vZGVsIHZhbHVlIGNoYW5nZXMgc2VwYXJhdGVseSxcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgY2FuIG92ZXJ3cml0ZSB0aGF0IG1vZGVsIHZhbHVlIGNoYW5nZSB3aXRoIHRoZSB2YWx1ZSB0aGUgdXNlciBqdXN0IHR5cGVkLiBPdGhlcndpc2UsXG4gICAgICAgICAgICAgICAgICAgIC8vIHRlY2huaXF1ZXMgbGlrZSByYXRlTGltaXQgY2FuIHRyaWdnZXIgbW9kZWwgY2hhbmdlcyBhdCBjcml0aWNhbCBtb21lbnRzIHRoYXQgd2lsbFxuICAgICAgICAgICAgICAgICAgICAvLyBvdmVycmlkZSB0aGUgdXNlcidzIGlucHV0cywgY2F1c2luZyBrZXlzdHJva2VzIHRvIGJlIGxvc3QuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRWYWx1ZUJlZm9yZUV2ZW50ID0ga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodmFsdWVVcGRhdGVIYW5kbGVyLCAwKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZSA9IGV2ZW50TmFtZS5zdWJzdHJpbmcoXCJhZnRlclwiLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdXBkYXRlRnJvbU1vZGVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRWYWx1ZSA9IGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudFZhbHVlQmVmb3JlRXZlbnQgIT09IG51bGwgJiYgbmV3VmFsdWUgPT09IGVsZW1lbnRWYWx1ZUJlZm9yZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh1cGRhdGVGcm9tTW9kZWwsIDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbHVlSGFzQ2hhbmdlZCA9IChuZXdWYWx1ZSAhPT0gZWxlbWVudFZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlSGFzQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIGlmIChrby51dGlscy50YWdOYW1lTG93ZXIoZWxlbWVudCkgPT09IFwic2VsZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFsbG93VW5zZXQgPSBhbGxCaW5kaW5ncy5nZXQoJ3ZhbHVlQWxsb3dVbnNldCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXBwbHlWYWx1ZUFjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLnNlbGVjdEV4dGVuc2lvbnMud3JpdGVWYWx1ZShlbGVtZW50LCBuZXdWYWx1ZSwgYWxsb3dVbnNldCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5VmFsdWVBY3Rpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFsbG93VW5zZXQgJiYgbmV3VmFsdWUgIT09IGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB5b3UgdHJ5IHRvIHNldCBhIG1vZGVsIHZhbHVlIHRoYXQgY2FuJ3QgYmUgcmVwcmVzZW50ZWQgaW4gYW4gYWxyZWFkeS1wb3B1bGF0ZWQgZHJvcGRvd24sIHJlamVjdCB0aGF0IGNoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJlY2F1c2UgeW91J3JlIG5vdCBhbGxvd2VkIHRvIGhhdmUgYSBtb2RlbCB2YWx1ZSB0aGF0IGRpc2FncmVlcyB3aXRoIGEgdmlzaWJsZSBVSSBzZWxlY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShrby51dGlscy50cmlnZ2VyRXZlbnQsIG51bGwsIFtlbGVtZW50LCBcImNoYW5nZVwiXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBJRTYgYnVnOiBJdCB3b24ndCByZWxpYWJseSBhcHBseSB2YWx1ZXMgdG8gU0VMRUNUIG5vZGVzIGR1cmluZyB0aGUgc2FtZSBleGVjdXRpb24gdGhyZWFkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByaWdodCBhZnRlciB5b3UndmUgY2hhbmdlZCB0aGUgc2V0IG9mIE9QVElPTiBub2RlcyBvbiBpdC4gU28gZm9yIHRoYXQgbm9kZSB0eXBlLCB3ZSdsbCBzY2hlZHVsZSBhIHNlY29uZCB0aHJlYWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvIGFwcGx5IHRoZSB2YWx1ZSBhcyB3ZWxsLlxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChhcHBseVZhbHVlQWN0aW9uLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnNlbGVjdEV4dGVuc2lvbnMud3JpdGVWYWx1ZShlbGVtZW50LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGtvLmNvbXB1dGVkKHVwZGF0ZUZyb21Nb2RlbCwgbnVsbCwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IGVsZW1lbnQgfSk7XG4gICAgfSxcbiAgICAndXBkYXRlJzogZnVuY3Rpb24oKSB7fSAvLyBLZWVwIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3aXRoIGNvZGUgdGhhdCBtYXkgaGF2ZSB3cmFwcGVkIHZhbHVlIGJpbmRpbmdcbn07XG5rby5leHByZXNzaW9uUmV3cml0aW5nLnR3b1dheUJpbmRpbmdzWyd2YWx1ZSddID0gdHJ1ZTtcbmtvLmJpbmRpbmdIYW5kbGVyc1sndmlzaWJsZSddID0ge1xuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgIHZhciBpc0N1cnJlbnRseVZpc2libGUgPSAhKGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9PSBcIm5vbmVcIik7XG4gICAgICAgIGlmICh2YWx1ZSAmJiAhaXNDdXJyZW50bHlWaXNpYmxlKVxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgZWxzZSBpZiAoKCF2YWx1ZSkgJiYgaXNDdXJyZW50bHlWaXNpYmxlKVxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxufTtcbi8vICdjbGljaycgaXMganVzdCBhIHNob3J0aGFuZCBmb3IgdGhlIHVzdWFsIGZ1bGwtbGVuZ3RoIGV2ZW50OntjbGljazpoYW5kbGVyfVxubWFrZUV2ZW50SGFuZGxlclNob3J0Y3V0KCdjbGljaycpO1xuLy8gSWYgeW91IHdhbnQgdG8gbWFrZSBhIGN1c3RvbSB0ZW1wbGF0ZSBlbmdpbmUsXG4vL1xuLy8gWzFdIEluaGVyaXQgZnJvbSB0aGlzIGNsYXNzIChsaWtlIGtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lIGRvZXMpXG4vLyBbMl0gT3ZlcnJpZGUgJ3JlbmRlclRlbXBsYXRlU291cmNlJywgc3VwcGx5aW5nIGEgZnVuY3Rpb24gd2l0aCB0aGlzIHNpZ25hdHVyZTpcbi8vXG4vLyAgICAgICAgZnVuY3Rpb24gKHRlbXBsYXRlU291cmNlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucykge1xuLy8gICAgICAgICAgICAvLyAtIHRlbXBsYXRlU291cmNlLnRleHQoKSBpcyB0aGUgdGV4dCBvZiB0aGUgdGVtcGxhdGUgeW91IHNob3VsZCByZW5kZXJcbi8vICAgICAgICAgICAgLy8gLSBiaW5kaW5nQ29udGV4dC4kZGF0YSBpcyB0aGUgZGF0YSB5b3Ugc2hvdWxkIHBhc3MgaW50byB0aGUgdGVtcGxhdGVcbi8vICAgICAgICAgICAgLy8gICAtIHlvdSBtaWdodCBhbHNvIHdhbnQgdG8gbWFrZSBiaW5kaW5nQ29udGV4dC4kcGFyZW50LCBiaW5kaW5nQ29udGV4dC4kcGFyZW50cyxcbi8vICAgICAgICAgICAgLy8gICAgIGFuZCBiaW5kaW5nQ29udGV4dC4kcm9vdCBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIHRvb1xuLy8gICAgICAgICAgICAvLyAtIG9wdGlvbnMgZ2l2ZXMgeW91IGFjY2VzcyB0byBhbnkgb3RoZXIgcHJvcGVydGllcyBzZXQgb24gXCJkYXRhLWJpbmQ6IHsgdGVtcGxhdGU6IG9wdGlvbnMgfVwiXG4vLyAgICAgICAgICAgIC8vIC0gdGVtcGxhdGVEb2N1bWVudCBpcyB0aGUgZG9jdW1lbnQgb2JqZWN0IG9mIHRoZSB0ZW1wbGF0ZVxuLy8gICAgICAgICAgICAvL1xuLy8gICAgICAgICAgICAvLyBSZXR1cm4gdmFsdWU6IGFuIGFycmF5IG9mIERPTSBub2Rlc1xuLy8gICAgICAgIH1cbi8vXG4vLyBbM10gT3ZlcnJpZGUgJ2NyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jaycsIHN1cHBseWluZyBhIGZ1bmN0aW9uIHdpdGggdGhpcyBzaWduYXR1cmU6XG4vL1xuLy8gICAgICAgIGZ1bmN0aW9uIChzY3JpcHQpIHtcbi8vICAgICAgICAgICAgLy8gUmV0dXJuIHZhbHVlOiBXaGF0ZXZlciBzeW50YXggbWVhbnMgXCJFdmFsdWF0ZSB0aGUgSmF2YVNjcmlwdCBzdGF0ZW1lbnQgJ3NjcmlwdCcgYW5kIG91dHB1dCB0aGUgcmVzdWx0XCJcbi8vICAgICAgICAgICAgLy8gICAgICAgICAgICAgICBGb3IgZXhhbXBsZSwgdGhlIGpxdWVyeS50bXBsIHRlbXBsYXRlIGVuZ2luZSBjb252ZXJ0cyAnc29tZVNjcmlwdCcgdG8gJyR7IHNvbWVTY3JpcHQgfSdcbi8vICAgICAgICB9XG4vL1xuLy8gICAgIFRoaXMgaXMgb25seSBuZWNlc3NhcnkgaWYgeW91IHdhbnQgdG8gYWxsb3cgZGF0YS1iaW5kIGF0dHJpYnV0ZXMgdG8gcmVmZXJlbmNlIGFyYml0cmFyeSB0ZW1wbGF0ZSB2YXJpYWJsZXMuXG4vLyAgICAgSWYgeW91IGRvbid0IHdhbnQgdG8gYWxsb3cgdGhhdCwgeW91IGNhbiBzZXQgdGhlIHByb3BlcnR5ICdhbGxvd1RlbXBsYXRlUmV3cml0aW5nJyB0byBmYWxzZSAobGlrZSBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZSBkb2VzKVxuLy8gICAgIGFuZCB0aGVuIHlvdSBkb24ndCBuZWVkIHRvIG92ZXJyaWRlICdjcmVhdGVKYXZhU2NyaXB0RXZhbHVhdG9yQmxvY2snLlxuXG5rby50ZW1wbGF0ZUVuZ2luZSA9IGZ1bmN0aW9uICgpIHsgfTtcblxua28udGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydyZW5kZXJUZW1wbGF0ZVNvdXJjZSddID0gZnVuY3Rpb24gKHRlbXBsYXRlU291cmNlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucywgdGVtcGxhdGVEb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk92ZXJyaWRlIHJlbmRlclRlbXBsYXRlU291cmNlXCIpO1xufTtcblxua28udGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydjcmVhdGVKYXZhU2NyaXB0RXZhbHVhdG9yQmxvY2snXSA9IGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJPdmVycmlkZSBjcmVhdGVKYXZhU2NyaXB0RXZhbHVhdG9yQmxvY2tcIik7XG59O1xuXG5rby50ZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGVbJ21ha2VUZW1wbGF0ZVNvdXJjZSddID0gZnVuY3Rpb24odGVtcGxhdGUsIHRlbXBsYXRlRG9jdW1lbnQpIHtcbiAgICAvLyBOYW1lZCB0ZW1wbGF0ZVxuICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0ZW1wbGF0ZURvY3VtZW50ID0gdGVtcGxhdGVEb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgICAgICAgdmFyIGVsZW0gPSB0ZW1wbGF0ZURvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRlbXBsYXRlKTtcbiAgICAgICAgaWYgKCFlbGVtKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgdGVtcGxhdGUgd2l0aCBJRCBcIiArIHRlbXBsYXRlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudChlbGVtKTtcbiAgICB9IGVsc2UgaWYgKCh0ZW1wbGF0ZS5ub2RlVHlwZSA9PSAxKSB8fCAodGVtcGxhdGUubm9kZVR5cGUgPT0gOCkpIHtcbiAgICAgICAgLy8gQW5vbnltb3VzIHRlbXBsYXRlXG4gICAgICAgIHJldHVybiBuZXcga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICB9IGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0ZW1wbGF0ZSB0eXBlOiBcIiArIHRlbXBsYXRlKTtcbn07XG5cbmtvLnRlbXBsYXRlRW5naW5lLnByb3RvdHlwZVsncmVuZGVyVGVtcGxhdGUnXSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMsIHRlbXBsYXRlRG9jdW1lbnQpIHtcbiAgICB2YXIgdGVtcGxhdGVTb3VyY2UgPSB0aGlzWydtYWtlVGVtcGxhdGVTb3VyY2UnXSh0ZW1wbGF0ZSwgdGVtcGxhdGVEb2N1bWVudCk7XG4gICAgcmV0dXJuIHRoaXNbJ3JlbmRlclRlbXBsYXRlU291cmNlJ10odGVtcGxhdGVTb3VyY2UsIGJpbmRpbmdDb250ZXh0LCBvcHRpb25zLCB0ZW1wbGF0ZURvY3VtZW50KTtcbn07XG5cbmtvLnRlbXBsYXRlRW5naW5lLnByb3RvdHlwZVsnaXNUZW1wbGF0ZVJld3JpdHRlbiddID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB0ZW1wbGF0ZURvY3VtZW50KSB7XG4gICAgLy8gU2tpcCByZXdyaXRpbmcgaWYgcmVxdWVzdGVkXG4gICAgaWYgKHRoaXNbJ2FsbG93VGVtcGxhdGVSZXdyaXRpbmcnXSA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIHJldHVybiB0aGlzWydtYWtlVGVtcGxhdGVTb3VyY2UnXSh0ZW1wbGF0ZSwgdGVtcGxhdGVEb2N1bWVudClbJ2RhdGEnXShcImlzUmV3cml0dGVuXCIpO1xufTtcblxua28udGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydyZXdyaXRlVGVtcGxhdGUnXSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgcmV3cml0ZXJDYWxsYmFjaywgdGVtcGxhdGVEb2N1bWVudCkge1xuICAgIHZhciB0ZW1wbGF0ZVNvdXJjZSA9IHRoaXNbJ21ha2VUZW1wbGF0ZVNvdXJjZSddKHRlbXBsYXRlLCB0ZW1wbGF0ZURvY3VtZW50KTtcbiAgICB2YXIgcmV3cml0dGVuID0gcmV3cml0ZXJDYWxsYmFjayh0ZW1wbGF0ZVNvdXJjZVsndGV4dCddKCkpO1xuICAgIHRlbXBsYXRlU291cmNlWyd0ZXh0J10ocmV3cml0dGVuKTtcbiAgICB0ZW1wbGF0ZVNvdXJjZVsnZGF0YSddKFwiaXNSZXdyaXR0ZW5cIiwgdHJ1ZSk7XG59O1xuXG5rby5leHBvcnRTeW1ib2woJ3RlbXBsYXRlRW5naW5lJywga28udGVtcGxhdGVFbmdpbmUpO1xuXG5rby50ZW1wbGF0ZVJld3JpdGluZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1lbW9pemVEYXRhQmluZGluZ0F0dHJpYnV0ZVN5bnRheFJlZ2V4ID0gLyg8KFthLXpdK1xcZCopKD86XFxzKyg/IWRhdGEtYmluZFxccyo9XFxzKilbYS16MC05XFwtXSsoPzo9KD86XFxcIlteXFxcIl0qXFxcInxcXCdbXlxcJ10qXFwnfFtePl0qKSk/KSpcXHMrKWRhdGEtYmluZFxccyo9XFxzKihbXCInXSkoW1xcc1xcU10qPylcXDMvZ2k7XG4gICAgdmFyIG1lbW9pemVWaXJ0dWFsQ29udGFpbmVyQmluZGluZ1N5bnRheFJlZ2V4ID0gLzwhLS1cXHMqa29cXGJcXHMqKFtcXHNcXFNdKj8pXFxzKi0tPi9nO1xuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVEYXRhQmluZFZhbHVlc0ZvclJld3JpdGluZyhrZXlWYWx1ZUFycmF5KSB7XG4gICAgICAgIHZhciBhbGxWYWxpZGF0b3JzID0ga28uZXhwcmVzc2lvblJld3JpdGluZy5iaW5kaW5nUmV3cml0ZVZhbGlkYXRvcnM7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsdWVBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGtleVZhbHVlQXJyYXlbaV1bJ2tleSddO1xuICAgICAgICAgICAgaWYgKGFsbFZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSBhbGxWYWxpZGF0b3JzW2tleV07XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwb3NzaWJsZUVycm9yTWVzc2FnZSA9IHZhbGlkYXRvcihrZXlWYWx1ZUFycmF5W2ldWyd2YWx1ZSddKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc3NpYmxlRXJyb3JNZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHBvc3NpYmxlRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF2YWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyB0ZW1wbGF0ZSBlbmdpbmUgZG9lcyBub3Qgc3VwcG9ydCB0aGUgJ1wiICsga2V5ICsgXCInIGJpbmRpbmcgd2l0aGluIGl0cyB0ZW1wbGF0ZXNcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uc3RydWN0TWVtb2l6ZWRUYWdSZXBsYWNlbWVudChkYXRhQmluZEF0dHJpYnV0ZVZhbHVlLCB0YWdUb1JldGFpbiwgbm9kZU5hbWUsIHRlbXBsYXRlRW5naW5lKSB7XG4gICAgICAgIHZhciBkYXRhQmluZEtleVZhbHVlQXJyYXkgPSBrby5leHByZXNzaW9uUmV3cml0aW5nLnBhcnNlT2JqZWN0TGl0ZXJhbChkYXRhQmluZEF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgdmFsaWRhdGVEYXRhQmluZFZhbHVlc0ZvclJld3JpdGluZyhkYXRhQmluZEtleVZhbHVlQXJyYXkpO1xuICAgICAgICB2YXIgcmV3cml0dGVuRGF0YUJpbmRBdHRyaWJ1dGVWYWx1ZSA9IGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzKGRhdGFCaW5kS2V5VmFsdWVBcnJheSwgeyd2YWx1ZUFjY2Vzc29ycyc6dHJ1ZX0pO1xuXG4gICAgICAgIC8vIEZvciBubyBvYnZpb3VzIHJlYXNvbiwgT3BlcmEgZmFpbHMgdG8gZXZhbHVhdGUgcmV3cml0dGVuRGF0YUJpbmRBdHRyaWJ1dGVWYWx1ZSB1bmxlc3MgaXQncyB3cmFwcGVkIGluIGFuIGFkZGl0aW9uYWxcbiAgICAgICAgLy8gYW5vbnltb3VzIGZ1bmN0aW9uLCBldmVuIHRob3VnaCBPcGVyYSdzIGJ1aWx0LWluIGRlYnVnZ2VyIGNhbiBldmFsdWF0ZSBpdCBhbnl3YXkuIE5vIG90aGVyIGJyb3dzZXIgcmVxdWlyZXMgdGhpc1xuICAgICAgICAvLyBleHRyYSBpbmRpcmVjdGlvbi5cbiAgICAgICAgdmFyIGFwcGx5QmluZGluZ3NUb05leHRTaWJsaW5nU2NyaXB0ID1cbiAgICAgICAgICAgIFwia28uX190cl9hbWJ0bnMoZnVuY3Rpb24oJGNvbnRleHQsJGVsZW1lbnQpe3JldHVybihmdW5jdGlvbigpe3JldHVybnsgXCIgKyByZXdyaXR0ZW5EYXRhQmluZEF0dHJpYnV0ZVZhbHVlICsgXCIgfSB9KSgpfSwnXCIgKyBub2RlTmFtZS50b0xvd2VyQ2FzZSgpICsgXCInKVwiO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGVFbmdpbmVbJ2NyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jayddKGFwcGx5QmluZGluZ3NUb05leHRTaWJsaW5nU2NyaXB0KSArIHRhZ1RvUmV0YWluO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGVuc3VyZVRlbXBsYXRlSXNSZXdyaXR0ZW46IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdGVtcGxhdGVFbmdpbmUsIHRlbXBsYXRlRG9jdW1lbnQpIHtcbiAgICAgICAgICAgIGlmICghdGVtcGxhdGVFbmdpbmVbJ2lzVGVtcGxhdGVSZXdyaXR0ZW4nXSh0ZW1wbGF0ZSwgdGVtcGxhdGVEb2N1bWVudCkpXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVFbmdpbmVbJ3Jld3JpdGVUZW1wbGF0ZSddKHRlbXBsYXRlLCBmdW5jdGlvbiAoaHRtbFN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga28udGVtcGxhdGVSZXdyaXRpbmcubWVtb2l6ZUJpbmRpbmdBdHRyaWJ1dGVTeW50YXgoaHRtbFN0cmluZywgdGVtcGxhdGVFbmdpbmUpO1xuICAgICAgICAgICAgICAgIH0sIHRlbXBsYXRlRG9jdW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1lbW9pemVCaW5kaW5nQXR0cmlidXRlU3ludGF4OiBmdW5jdGlvbiAoaHRtbFN0cmluZywgdGVtcGxhdGVFbmdpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sU3RyaW5nLnJlcGxhY2UobWVtb2l6ZURhdGFCaW5kaW5nQXR0cmlidXRlU3ludGF4UmVnZXgsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc3RydWN0TWVtb2l6ZWRUYWdSZXBsYWNlbWVudCgvKiBkYXRhQmluZEF0dHJpYnV0ZVZhbHVlOiAqLyBhcmd1bWVudHNbNF0sIC8qIHRhZ1RvUmV0YWluOiAqLyBhcmd1bWVudHNbMV0sIC8qIG5vZGVOYW1lOiAqLyBhcmd1bWVudHNbMl0sIHRlbXBsYXRlRW5naW5lKTtcbiAgICAgICAgICAgIH0pLnJlcGxhY2UobWVtb2l6ZVZpcnR1YWxDb250YWluZXJCaW5kaW5nU3ludGF4UmVnZXgsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3RNZW1vaXplZFRhZ1JlcGxhY2VtZW50KC8qIGRhdGFCaW5kQXR0cmlidXRlVmFsdWU6ICovIGFyZ3VtZW50c1sxXSwgLyogdGFnVG9SZXRhaW46ICovIFwiPCEtLSBrbyAtLT5cIiwgLyogbm9kZU5hbWU6ICovIFwiI2NvbW1lbnRcIiwgdGVtcGxhdGVFbmdpbmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwbHlNZW1vaXplZEJpbmRpbmdzVG9OZXh0U2libGluZzogZnVuY3Rpb24gKGJpbmRpbmdzLCBub2RlTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLm1lbW9pemF0aW9uLm1lbW9pemUoZnVuY3Rpb24gKGRvbU5vZGUsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGVUb0JpbmQgPSBkb21Ob2RlLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIGlmIChub2RlVG9CaW5kICYmIG5vZGVUb0JpbmQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAga28uYXBwbHlCaW5kaW5nQWNjZXNzb3JzVG9Ob2RlKG5vZGVUb0JpbmQsIGJpbmRpbmdzLCBiaW5kaW5nQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59KSgpO1xuXG5cbi8vIEV4cG9ydGVkIG9ubHkgYmVjYXVzZSBpdCBoYXMgdG8gYmUgcmVmZXJlbmNlZCBieSBzdHJpbmcgbG9va3VwIGZyb20gd2l0aGluIHJld3JpdHRlbiB0ZW1wbGF0ZVxua28uZXhwb3J0U3ltYm9sKCdfX3RyX2FtYnRucycsIGtvLnRlbXBsYXRlUmV3cml0aW5nLmFwcGx5TWVtb2l6ZWRCaW5kaW5nc1RvTmV4dFNpYmxpbmcpO1xuKGZ1bmN0aW9uKCkge1xuICAgIC8vIEEgdGVtcGxhdGUgc291cmNlIHJlcHJlc2VudHMgYSByZWFkL3dyaXRlIHdheSBvZiBhY2Nlc3NpbmcgYSB0ZW1wbGF0ZS4gVGhpcyBpcyB0byBlbGltaW5hdGUgdGhlIG5lZWQgZm9yIHRlbXBsYXRlIGxvYWRpbmcvc2F2aW5nXG4gICAgLy8gbG9naWMgdG8gYmUgZHVwbGljYXRlZCBpbiBldmVyeSB0ZW1wbGF0ZSBlbmdpbmUgKGFuZCBtZWFucyB0aGV5IGNhbiBhbGwgd29yayB3aXRoIGFub255bW91cyB0ZW1wbGF0ZXMsIGV0Yy4pXG4gICAgLy9cbiAgICAvLyBUd28gYXJlIHByb3ZpZGVkIGJ5IGRlZmF1bHQ6XG4gICAgLy8gIDEuIGtvLnRlbXBsYXRlU291cmNlcy5kb21FbGVtZW50ICAgICAgIC0gcmVhZHMvd3JpdGVzIHRoZSB0ZXh0IGNvbnRlbnQgb2YgYW4gYXJiaXRyYXJ5IERPTSBlbGVtZW50XG4gICAgLy8gIDIuIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNFbGVtZW50IC0gdXNlcyBrby51dGlscy5kb21EYXRhIHRvIHJlYWQvd3JpdGUgdGV4dCAqYXNzb2NpYXRlZCogd2l0aCB0aGUgRE9NIGVsZW1lbnQsIGJ1dFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGhvdXQgcmVhZGluZy93cml0aW5nIHRoZSBhY3R1YWwgZWxlbWVudCB0ZXh0IGNvbnRlbnQsIHNpbmNlIGl0IHdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSByZW5kZXJlZCB0ZW1wbGF0ZSBvdXRwdXQuXG4gICAgLy8gWW91IGNhbiBpbXBsZW1lbnQgeW91ciBvd24gdGVtcGxhdGUgc291cmNlIGlmIHlvdSB3YW50IHRvIGZldGNoL3N0b3JlIHRlbXBsYXRlcyBzb21ld2hlcmUgb3RoZXIgdGhhbiBpbiBET00gZWxlbWVudHMuXG4gICAgLy8gVGVtcGxhdGUgc291cmNlcyBuZWVkIHRvIGhhdmUgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gICAgLy8gICB0ZXh0KCkgXHRcdFx0LSByZXR1cm5zIHRoZSB0ZW1wbGF0ZSB0ZXh0IGZyb20geW91ciBzdG9yYWdlIGxvY2F0aW9uXG4gICAgLy8gICB0ZXh0KHZhbHVlKVx0XHQtIHdyaXRlcyB0aGUgc3VwcGxpZWQgdGVtcGxhdGUgdGV4dCB0byB5b3VyIHN0b3JhZ2UgbG9jYXRpb25cbiAgICAvLyAgIGRhdGEoa2V5KVx0XHRcdC0gcmVhZHMgdmFsdWVzIHN0b3JlZCB1c2luZyBkYXRhKGtleSwgdmFsdWUpIC0gc2VlIGJlbG93XG4gICAgLy8gICBkYXRhKGtleSwgdmFsdWUpXHQtIGFzc29jaWF0ZXMgXCJ2YWx1ZVwiIHdpdGggdGhpcyB0ZW1wbGF0ZSBhbmQgdGhlIGtleSBcImtleVwiLiBJcyB1c2VkIHRvIHN0b3JlIGluZm9ybWF0aW9uIGxpa2UgXCJpc1Jld3JpdHRlblwiLlxuICAgIC8vXG4gICAgLy8gT3B0aW9uYWxseSwgdGVtcGxhdGUgc291cmNlcyBjYW4gYWxzbyBoYXZlIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zOlxuICAgIC8vICAgbm9kZXMoKSAgICAgICAgICAgIC0gcmV0dXJucyBhIERPTSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIG5vZGVzIG9mIHRoaXMgdGVtcGxhdGUsIHdoZXJlIGF2YWlsYWJsZVxuICAgIC8vICAgbm9kZXModmFsdWUpICAgICAgIC0gd3JpdGVzIHRoZSBnaXZlbiBET00gZWxlbWVudCB0byB5b3VyIHN0b3JhZ2UgbG9jYXRpb25cbiAgICAvLyBJZiBhIERPTSBlbGVtZW50IGlzIGF2YWlsYWJsZSBmb3IgYSBnaXZlbiB0ZW1wbGF0ZSBzb3VyY2UsIHRlbXBsYXRlIGVuZ2luZXMgYXJlIGVuY291cmFnZWQgdG8gdXNlIGl0IGluIHByZWZlcmVuY2Ugb3ZlciB0ZXh0KClcbiAgICAvLyBmb3IgaW1wcm92ZWQgc3BlZWQuIEhvd2V2ZXIsIGFsbCB0ZW1wbGF0ZVNvdXJjZXMgbXVzdCBzdXBwbHkgdGV4dCgpIGV2ZW4gaWYgdGhleSBkb24ndCBzdXBwbHkgbm9kZXMoKS5cbiAgICAvL1xuICAgIC8vIE9uY2UgeW91J3ZlIGltcGxlbWVudGVkIGEgdGVtcGxhdGVTb3VyY2UsIG1ha2UgeW91ciB0ZW1wbGF0ZSBlbmdpbmUgdXNlIGl0IGJ5IHN1YmNsYXNzaW5nIHdoYXRldmVyIHRlbXBsYXRlIGVuZ2luZSB5b3Ugd2VyZVxuICAgIC8vIHVzaW5nIGFuZCBvdmVycmlkaW5nIFwibWFrZVRlbXBsYXRlU291cmNlXCIgdG8gcmV0dXJuIGFuIGluc3RhbmNlIG9mIHlvdXIgY3VzdG9tIHRlbXBsYXRlIHNvdXJjZS5cblxuICAgIGtvLnRlbXBsYXRlU291cmNlcyA9IHt9O1xuXG4gICAgLy8gLS0tLSBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudCAtLS0tLVxuXG4gICAga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQucHJvdG90eXBlWyd0ZXh0J10gPSBmdW5jdGlvbigvKiB2YWx1ZVRvV3JpdGUgKi8pIHtcbiAgICAgICAgdmFyIHRhZ05hbWVMb3dlciA9IGtvLnV0aWxzLnRhZ05hbWVMb3dlcih0aGlzLmRvbUVsZW1lbnQpLFxuICAgICAgICAgICAgZWxlbUNvbnRlbnRzUHJvcGVydHkgPSB0YWdOYW1lTG93ZXIgPT09IFwic2NyaXB0XCIgPyBcInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0YWdOYW1lTG93ZXIgPT09IFwidGV4dGFyZWFcIiA/IFwidmFsdWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcImlubmVySFRNTFwiO1xuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRvbUVsZW1lbnRbZWxlbUNvbnRlbnRzUHJvcGVydHldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZhbHVlVG9Xcml0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGlmIChlbGVtQ29udGVudHNQcm9wZXJ0eSA9PT0gXCJpbm5lckhUTUxcIilcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXRIdG1sKHRoaXMuZG9tRWxlbWVudCwgdmFsdWVUb1dyaXRlKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmRvbUVsZW1lbnRbZWxlbUNvbnRlbnRzUHJvcGVydHldID0gdmFsdWVUb1dyaXRlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBkYXRhRG9tRGF0YVByZWZpeCA9IGtvLnV0aWxzLmRvbURhdGEubmV4dEtleSgpICsgXCJfXCI7XG4gICAga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQucHJvdG90eXBlWydkYXRhJ10gPSBmdW5jdGlvbihrZXkgLyosIHZhbHVlVG9Xcml0ZSAqLykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmRvbURhdGEuZ2V0KHRoaXMuZG9tRWxlbWVudCwgZGF0YURvbURhdGFQcmVmaXggKyBrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQodGhpcy5kb21FbGVtZW50LCBkYXRhRG9tRGF0YVByZWZpeCArIGtleSwgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyAtLS0tIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZSAtLS0tLVxuICAgIC8vIEFub255bW91cyB0ZW1wbGF0ZXMgYXJlIG5vcm1hbGx5IHNhdmVkL3JldHJpZXZlZCBhcyBET00gbm9kZXMgdGhyb3VnaCBcIm5vZGVzXCIuXG4gICAgLy8gRm9yIGNvbXBhdGliaWxpdHksIHlvdSBjYW4gYWxzbyByZWFkIFwidGV4dFwiOyBpdCB3aWxsIGJlIHNlcmlhbGl6ZWQgZnJvbSB0aGUgbm9kZXMgb24gZGVtYW5kLlxuICAgIC8vIFdyaXRpbmcgdG8gXCJ0ZXh0XCIgaXMgc3RpbGwgc3VwcG9ydGVkLCBidXQgdGhlbiB0aGUgdGVtcGxhdGUgZGF0YSB3aWxsIG5vdCBiZSBhdmFpbGFibGUgYXMgRE9NIG5vZGVzLlxuXG4gICAgdmFyIGFub255bW91c1RlbXBsYXRlc0RvbURhdGFLZXkgPSBrby51dGlscy5kb21EYXRhLm5leHRLZXkoKTtcbiAgICBrby50ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuICAgIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZS5wcm90b3R5cGUgPSBuZXcga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQoKTtcbiAgICBrby50ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0ga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlO1xuICAgIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZS5wcm90b3R5cGVbJ3RleHQnXSA9IGZ1bmN0aW9uKC8qIHZhbHVlVG9Xcml0ZSAqLykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0ga28udXRpbHMuZG9tRGF0YS5nZXQodGhpcy5kb21FbGVtZW50LCBhbm9ueW1vdXNUZW1wbGF0ZXNEb21EYXRhS2V5KSB8fCB7fTtcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZURhdGEudGV4dERhdGEgPT09IHVuZGVmaW5lZCAmJiB0ZW1wbGF0ZURhdGEuY29udGFpbmVyRGF0YSlcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGEudGV4dERhdGEgPSB0ZW1wbGF0ZURhdGEuY29udGFpbmVyRGF0YS5pbm5lckhUTUw7XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVEYXRhLnRleHREYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZhbHVlVG9Xcml0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KHRoaXMuZG9tRWxlbWVudCwgYW5vbnltb3VzVGVtcGxhdGVzRG9tRGF0YUtleSwge3RleHREYXRhOiB2YWx1ZVRvV3JpdGV9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQucHJvdG90eXBlWydub2RlcyddID0gZnVuY3Rpb24oLyogdmFsdWVUb1dyaXRlICovKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBrby51dGlscy5kb21EYXRhLmdldCh0aGlzLmRvbUVsZW1lbnQsIGFub255bW91c1RlbXBsYXRlc0RvbURhdGFLZXkpIHx8IHt9O1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlRGF0YS5jb250YWluZXJEYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZhbHVlVG9Xcml0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KHRoaXMuZG9tRWxlbWVudCwgYW5vbnltb3VzVGVtcGxhdGVzRG9tRGF0YUtleSwge2NvbnRhaW5lckRhdGE6IHZhbHVlVG9Xcml0ZX0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGtvLmV4cG9ydFN5bWJvbCgndGVtcGxhdGVTb3VyY2VzJywga28udGVtcGxhdGVTb3VyY2VzKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ3RlbXBsYXRlU291cmNlcy5kb21FbGVtZW50Jywga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgndGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlJywga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlKTtcbn0pKCk7XG4oZnVuY3Rpb24gKCkge1xuICAgIHZhciBfdGVtcGxhdGVFbmdpbmU7XG4gICAga28uc2V0VGVtcGxhdGVFbmdpbmUgPSBmdW5jdGlvbiAodGVtcGxhdGVFbmdpbmUpIHtcbiAgICAgICAgaWYgKCh0ZW1wbGF0ZUVuZ2luZSAhPSB1bmRlZmluZWQpICYmICEodGVtcGxhdGVFbmdpbmUgaW5zdGFuY2VvZiBrby50ZW1wbGF0ZUVuZ2luZSkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0ZW1wbGF0ZUVuZ2luZSBtdXN0IGluaGVyaXQgZnJvbSBrby50ZW1wbGF0ZUVuZ2luZVwiKTtcbiAgICAgICAgX3RlbXBsYXRlRW5naW5lID0gdGVtcGxhdGVFbmdpbmU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW52b2tlRm9yRWFjaE5vZGVJbkNvbnRpbnVvdXNSYW5nZShmaXJzdE5vZGUsIGxhc3ROb2RlLCBhY3Rpb24pIHtcbiAgICAgICAgdmFyIG5vZGUsIG5leHRJblF1ZXVlID0gZmlyc3ROb2RlLCBmaXJzdE91dE9mUmFuZ2VOb2RlID0ga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKGxhc3ROb2RlKTtcbiAgICAgICAgd2hpbGUgKG5leHRJblF1ZXVlICYmICgobm9kZSA9IG5leHRJblF1ZXVlKSAhPT0gZmlyc3RPdXRPZlJhbmdlTm9kZSkpIHtcbiAgICAgICAgICAgIG5leHRJblF1ZXVlID0ga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKG5vZGUpO1xuICAgICAgICAgICAgYWN0aW9uKG5vZGUsIG5leHRJblF1ZXVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFjdGl2YXRlQmluZGluZ3NPbkNvbnRpbnVvdXNOb2RlQXJyYXkoY29udGludW91c05vZGVBcnJheSwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgLy8gVG8gYmUgdXNlZCBvbiBhbnkgbm9kZXMgdGhhdCBoYXZlIGJlZW4gcmVuZGVyZWQgYnkgYSB0ZW1wbGF0ZSBhbmQgaGF2ZSBiZWVuIGluc2VydGVkIGludG8gc29tZSBwYXJlbnQgZWxlbWVudFxuICAgICAgICAvLyBXYWxrcyB0aHJvdWdoIGNvbnRpbnVvdXNOb2RlQXJyYXkgKHdoaWNoICptdXN0KiBiZSBjb250aW51b3VzLCBpLmUuLCBhbiB1bmludGVycnVwdGVkIHNlcXVlbmNlIG9mIHNpYmxpbmcgbm9kZXMsIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIGFsZ29yaXRobSBmb3Igd2Fsa2luZyB0aGVtIHJlbGllcyBvbiB0aGlzKSwgYW5kIGZvciBlYWNoIHRvcC1sZXZlbCBpdGVtIGluIHRoZSB2aXJ0dWFsLWVsZW1lbnQgc2Vuc2UsXG4gICAgICAgIC8vICgxKSBEb2VzIGEgcmVndWxhciBcImFwcGx5QmluZGluZ3NcIiB0byBhc3NvY2lhdGUgYmluZGluZ0NvbnRleHQgd2l0aCB0aGlzIG5vZGUgYW5kIHRvIGFjdGl2YXRlIGFueSBub24tbWVtb2l6ZWQgYmluZGluZ3NcbiAgICAgICAgLy8gKDIpIFVubWVtb2l6ZXMgYW55IG1lbW9zIGluIHRoZSBET00gc3VidHJlZSAoZS5nLiwgdG8gYWN0aXZhdGUgYmluZGluZ3MgdGhhdCBoYWQgYmVlbiBtZW1vaXplZCBkdXJpbmcgdGVtcGxhdGUgcmV3cml0aW5nKVxuXG4gICAgICAgIGlmIChjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGZpcnN0Tm9kZSA9IGNvbnRpbnVvdXNOb2RlQXJyYXlbMF0sXG4gICAgICAgICAgICAgICAgbGFzdE5vZGUgPSBjb250aW51b3VzTm9kZUFycmF5W2NvbnRpbnVvdXNOb2RlQXJyYXkubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSA9IGZpcnN0Tm9kZS5wYXJlbnROb2RlLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVyID0ga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddLFxuICAgICAgICAgICAgICAgIHByZXByb2Nlc3NOb2RlID0gcHJvdmlkZXJbJ3ByZXByb2Nlc3NOb2RlJ107XG5cbiAgICAgICAgICAgIGlmIChwcmVwcm9jZXNzTm9kZSkge1xuICAgICAgICAgICAgICAgIGludm9rZUZvckVhY2hOb2RlSW5Db250aW51b3VzUmFuZ2UoZmlyc3ROb2RlLCBsYXN0Tm9kZSwgZnVuY3Rpb24obm9kZSwgbmV4dE5vZGVJblJhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlUHJldmlvdXNTaWJsaW5nID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOb2RlcyA9IHByZXByb2Nlc3NOb2RlLmNhbGwocHJvdmlkZXIsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Tm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlID09PSBmaXJzdE5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROb2RlID0gbmV3Tm9kZXNbMF0gfHwgbmV4dE5vZGVJblJhbmdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUgPT09IGxhc3ROb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROb2RlID0gbmV3Tm9kZXNbbmV3Tm9kZXMubGVuZ3RoIC0gMV0gfHwgbm9kZVByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSBwcmVwcm9jZXNzTm9kZSBjYW4gY2hhbmdlIHRoZSBub2RlcywgaW5jbHVkaW5nIHRoZSBmaXJzdCBhbmQgbGFzdCBub2RlcywgdXBkYXRlIGNvbnRpbnVvdXNOb2RlQXJyYXkgdG8gbWF0Y2guXG4gICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0aGUgZnVsbCBzZXQsIGluY2x1ZGluZyBpbm5lciBub2RlcywgYmVjYXVzZSB0aGUgdW5tZW1vaXplIHN0ZXAgbWlnaHQgcmVtb3ZlIHRoZSBmaXJzdCBub2RlIChhbmQgc28gdGhlIHJlYWxcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBub2RlIG5lZWRzIHRvIGJlIGluIHRoZSBhcnJheSkuXG4gICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIGlmICghZmlyc3ROb2RlKSB7IC8vIHByZXByb2Nlc3NOb2RlIG1pZ2h0IGhhdmUgcmVtb3ZlZCBhbGwgdGhlIG5vZGVzLCBpbiB3aGljaCBjYXNlIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Tm9kZSA9PT0gbGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5wdXNoKGZpcnN0Tm9kZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5wdXNoKGZpcnN0Tm9kZSwgbGFzdE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5maXhVcENvbnRpbnVvdXNOb2RlQXJyYXkoY29udGludW91c05vZGVBcnJheSwgcGFyZW50Tm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOZWVkIHRvIGFwcGx5QmluZGluZ3MgKmJlZm9yZSogdW5tZW1vemlhdGlvbiwgYmVjYXVzZSB1bm1lbW9pemF0aW9uIG1pZ2h0IGludHJvZHVjZSBleHRyYSBub2RlcyAodGhhdCB3ZSBkb24ndCB3YW50IHRvIHJlLWJpbmQpXG4gICAgICAgICAgICAvLyB3aGVyZWFzIGEgcmVndWxhciBhcHBseUJpbmRpbmdzIHdvbid0IGludHJvZHVjZSBuZXcgbWVtb2l6ZWQgbm9kZXNcbiAgICAgICAgICAgIGludm9rZUZvckVhY2hOb2RlSW5Db250aW51b3VzUmFuZ2UoZmlyc3ROb2RlLCBsYXN0Tm9kZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxIHx8IG5vZGUubm9kZVR5cGUgPT09IDgpXG4gICAgICAgICAgICAgICAgICAgIGtvLmFwcGx5QmluZGluZ3MoYmluZGluZ0NvbnRleHQsIG5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpbnZva2VGb3JFYWNoTm9kZUluQ29udGludW91c1JhbmdlKGZpcnN0Tm9kZSwgbGFzdE5vZGUsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSB8fCBub2RlLm5vZGVUeXBlID09PSA4KVxuICAgICAgICAgICAgICAgICAgICBrby5tZW1vaXphdGlvbi51bm1lbW9pemVEb21Ob2RlQW5kRGVzY2VuZGFudHMobm9kZSwgW2JpbmRpbmdDb250ZXh0XSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIGFueSBjaGFuZ2VzIGRvbmUgYnkgYXBwbHlCaW5kaW5ncyBvciB1bm1lbW9pemUgYXJlIHJlZmxlY3RlZCBpbiB0aGUgYXJyYXlcbiAgICAgICAgICAgIGtvLnV0aWxzLmZpeFVwQ29udGludW91c05vZGVBcnJheShjb250aW51b3VzTm9kZUFycmF5LCBwYXJlbnROb2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEZpcnN0Tm9kZUZyb21Qb3NzaWJsZUFycmF5KG5vZGVPck5vZGVBcnJheSkge1xuICAgICAgICByZXR1cm4gbm9kZU9yTm9kZUFycmF5Lm5vZGVUeXBlID8gbm9kZU9yTm9kZUFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBub2RlT3JOb2RlQXJyYXkubGVuZ3RoID4gMCA/IG5vZGVPck5vZGVBcnJheVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjdXRlVGVtcGxhdGUodGFyZ2V0Tm9kZU9yTm9kZUFycmF5LCByZW5kZXJNb2RlLCB0ZW1wbGF0ZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHZhciBmaXJzdFRhcmdldE5vZGUgPSB0YXJnZXROb2RlT3JOb2RlQXJyYXkgJiYgZ2V0Rmlyc3ROb2RlRnJvbVBvc3NpYmxlQXJyYXkodGFyZ2V0Tm9kZU9yTm9kZUFycmF5KTtcbiAgICAgICAgdmFyIHRlbXBsYXRlRG9jdW1lbnQgPSAoZmlyc3RUYXJnZXROb2RlIHx8IHRlbXBsYXRlIHx8IHt9KS5vd25lckRvY3VtZW50O1xuICAgICAgICB2YXIgdGVtcGxhdGVFbmdpbmVUb1VzZSA9IChvcHRpb25zWyd0ZW1wbGF0ZUVuZ2luZSddIHx8IF90ZW1wbGF0ZUVuZ2luZSk7XG4gICAgICAgIGtvLnRlbXBsYXRlUmV3cml0aW5nLmVuc3VyZVRlbXBsYXRlSXNSZXdyaXR0ZW4odGVtcGxhdGUsIHRlbXBsYXRlRW5naW5lVG9Vc2UsIHRlbXBsYXRlRG9jdW1lbnQpO1xuICAgICAgICB2YXIgcmVuZGVyZWROb2Rlc0FycmF5ID0gdGVtcGxhdGVFbmdpbmVUb1VzZVsncmVuZGVyVGVtcGxhdGUnXSh0ZW1wbGF0ZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMsIHRlbXBsYXRlRG9jdW1lbnQpO1xuXG4gICAgICAgIC8vIExvb3NlbHkgY2hlY2sgcmVzdWx0IGlzIGFuIGFycmF5IG9mIERPTSBub2Rlc1xuICAgICAgICBpZiAoKHR5cGVvZiByZW5kZXJlZE5vZGVzQXJyYXkubGVuZ3RoICE9IFwibnVtYmVyXCIpIHx8IChyZW5kZXJlZE5vZGVzQXJyYXkubGVuZ3RoID4gMCAmJiB0eXBlb2YgcmVuZGVyZWROb2Rlc0FycmF5WzBdLm5vZGVUeXBlICE9IFwibnVtYmVyXCIpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGVtcGxhdGUgZW5naW5lIG11c3QgcmV0dXJuIGFuIGFycmF5IG9mIERPTSBub2Rlc1wiKTtcblxuICAgICAgICB2YXIgaGF2ZUFkZGVkTm9kZXNUb1BhcmVudCA9IGZhbHNlO1xuICAgICAgICBzd2l0Y2ggKHJlbmRlck1vZGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJyZXBsYWNlQ2hpbGRyZW5cIjpcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuc2V0RG9tTm9kZUNoaWxkcmVuKHRhcmdldE5vZGVPck5vZGVBcnJheSwgcmVuZGVyZWROb2Rlc0FycmF5KTtcbiAgICAgICAgICAgICAgICBoYXZlQWRkZWROb2Rlc1RvUGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJyZXBsYWNlTm9kZVwiOlxuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnJlcGxhY2VEb21Ob2Rlcyh0YXJnZXROb2RlT3JOb2RlQXJyYXksIHJlbmRlcmVkTm9kZXNBcnJheSk7XG4gICAgICAgICAgICAgICAgaGF2ZUFkZGVkTm9kZXNUb1BhcmVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaWdub3JlVGFyZ2V0Tm9kZVwiOiBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biByZW5kZXJNb2RlOiBcIiArIHJlbmRlck1vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhdmVBZGRlZE5vZGVzVG9QYXJlbnQpIHtcbiAgICAgICAgICAgIGFjdGl2YXRlQmluZGluZ3NPbkNvbnRpbnVvdXNOb2RlQXJyYXkocmVuZGVyZWROb2Rlc0FycmF5LCBiaW5kaW5nQ29udGV4dCk7XG4gICAgICAgICAgICBpZiAob3B0aW9uc1snYWZ0ZXJSZW5kZXInXSlcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShvcHRpb25zWydhZnRlclJlbmRlciddLCBudWxsLCBbcmVuZGVyZWROb2Rlc0FycmF5LCBiaW5kaW5nQ29udGV4dFsnJGRhdGEnXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlbmRlcmVkTm9kZXNBcnJheTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlVGVtcGxhdGVOYW1lKHRlbXBsYXRlLCBkYXRhLCBjb250ZXh0KSB7XG4gICAgICAgIC8vIFRoZSB0ZW1wbGF0ZSBjYW4gYmUgc3BlY2lmaWVkIGFzOlxuICAgICAgICBpZiAoa28uaXNPYnNlcnZhYmxlKHRlbXBsYXRlKSkge1xuICAgICAgICAgICAgLy8gMS4gQW4gb2JzZXJ2YWJsZSwgd2l0aCBzdHJpbmcgdmFsdWVcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gMi4gQSBmdW5jdGlvbiBvZiAoZGF0YSwgY29udGV4dCkgcmV0dXJuaW5nIGEgc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUoZGF0YSwgY29udGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyAzLiBBIHN0cmluZ1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAga28ucmVuZGVyVGVtcGxhdGUgPSBmdW5jdGlvbiAodGVtcGxhdGUsIGRhdGFPckJpbmRpbmdDb250ZXh0LCBvcHRpb25zLCB0YXJnZXROb2RlT3JOb2RlQXJyYXksIHJlbmRlck1vZGUpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGlmICgob3B0aW9uc1sndGVtcGxhdGVFbmdpbmUnXSB8fCBfdGVtcGxhdGVFbmdpbmUpID09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNldCBhIHRlbXBsYXRlIGVuZ2luZSBiZWZvcmUgY2FsbGluZyByZW5kZXJUZW1wbGF0ZVwiKTtcbiAgICAgICAgcmVuZGVyTW9kZSA9IHJlbmRlck1vZGUgfHwgXCJyZXBsYWNlQ2hpbGRyZW5cIjtcblxuICAgICAgICBpZiAodGFyZ2V0Tm9kZU9yTm9kZUFycmF5KSB7XG4gICAgICAgICAgICB2YXIgZmlyc3RUYXJnZXROb2RlID0gZ2V0Rmlyc3ROb2RlRnJvbVBvc3NpYmxlQXJyYXkodGFyZ2V0Tm9kZU9yTm9kZUFycmF5KTtcblxuICAgICAgICAgICAgdmFyIHdoZW5Ub0Rpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAoIWZpcnN0VGFyZ2V0Tm9kZSkgfHwgIWtvLnV0aWxzLmRvbU5vZGVJc0F0dGFjaGVkVG9Eb2N1bWVudChmaXJzdFRhcmdldE5vZGUpOyB9OyAvLyBQYXNzaXZlIGRpc3Bvc2FsIChvbiBuZXh0IGV2YWx1YXRpb24pXG4gICAgICAgICAgICB2YXIgYWN0aXZlbHlEaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQgPSAoZmlyc3RUYXJnZXROb2RlICYmIHJlbmRlck1vZGUgPT0gXCJyZXBsYWNlTm9kZVwiKSA/IGZpcnN0VGFyZ2V0Tm9kZS5wYXJlbnROb2RlIDogZmlyc3RUYXJnZXROb2RlO1xuXG4gICAgICAgICAgICByZXR1cm4ga28uZGVwZW5kZW50T2JzZXJ2YWJsZSggLy8gU28gdGhlIERPTSBpcyBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgd2hlbiBhbnkgZGVwZW5kZW5jeSBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBFbnN1cmUgd2UndmUgZ290IGEgcHJvcGVyIGJpbmRpbmcgY29udGV4dCB0byB3b3JrIHdpdGhcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdDb250ZXh0ID0gKGRhdGFPckJpbmRpbmdDb250ZXh0ICYmIChkYXRhT3JCaW5kaW5nQ29udGV4dCBpbnN0YW5jZW9mIGtvLmJpbmRpbmdDb250ZXh0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZGF0YU9yQmluZGluZ0NvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IGtvLmJpbmRpbmdDb250ZXh0KGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoZGF0YU9yQmluZGluZ0NvbnRleHQpKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGVOYW1lID0gcmVzb2x2ZVRlbXBsYXRlTmFtZSh0ZW1wbGF0ZSwgYmluZGluZ0NvbnRleHRbJyRkYXRhJ10sIGJpbmRpbmdDb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkTm9kZXNBcnJheSA9IGV4ZWN1dGVUZW1wbGF0ZSh0YXJnZXROb2RlT3JOb2RlQXJyYXksIHJlbmRlck1vZGUsIHRlbXBsYXRlTmFtZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW5kZXJNb2RlID09IFwicmVwbGFjZU5vZGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Tm9kZU9yTm9kZUFycmF5ID0gcmVuZGVyZWROb2Rlc0FycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RUYXJnZXROb2RlID0gZ2V0Rmlyc3ROb2RlRnJvbVBvc3NpYmxlQXJyYXkodGFyZ2V0Tm9kZU9yTm9kZUFycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICB7IGRpc3Bvc2VXaGVuOiB3aGVuVG9EaXNwb3NlLCBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IGFjdGl2ZWx5RGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB5ZXQgaGF2ZSBhIERPTSBub2RlIHRvIGV2YWx1YXRlLCBzbyB1c2UgYSBtZW1vIGFuZCByZW5kZXIgdGhlIHRlbXBsYXRlIGxhdGVyIHdoZW4gdGhlcmUgaXMgYSBET00gbm9kZVxuICAgICAgICAgICAgcmV0dXJuIGtvLm1lbW9pemF0aW9uLm1lbW9pemUoZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICAgICAgICAgICAgICBrby5yZW5kZXJUZW1wbGF0ZSh0ZW1wbGF0ZSwgZGF0YU9yQmluZGluZ0NvbnRleHQsIG9wdGlvbnMsIGRvbU5vZGUsIFwicmVwbGFjZU5vZGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBrby5yZW5kZXJUZW1wbGF0ZUZvckVhY2ggPSBmdW5jdGlvbiAodGVtcGxhdGUsIGFycmF5T3JPYnNlcnZhYmxlQXJyYXksIG9wdGlvbnMsIHRhcmdldE5vZGUsIHBhcmVudEJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIC8vIFNpbmNlIHNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcgYWx3YXlzIGNhbGxzIGV4ZWN1dGVUZW1wbGF0ZUZvckFycmF5SXRlbSBhbmQgdGhlblxuICAgICAgICAvLyBhY3RpdmF0ZUJpbmRpbmdzQ2FsbGJhY2sgZm9yIGFkZGVkIGl0ZW1zLCB3ZSBjYW4gc3RvcmUgdGhlIGJpbmRpbmcgY29udGV4dCBpbiB0aGUgZm9ybWVyIHRvIHVzZSBpbiB0aGUgbGF0dGVyLlxuICAgICAgICB2YXIgYXJyYXlJdGVtQ29udGV4dDtcblxuICAgICAgICAvLyBUaGlzIHdpbGwgYmUgY2FsbGVkIGJ5IHNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcgdG8gZ2V0IHRoZSBub2RlcyB0byBhZGQgdG8gdGFyZ2V0Tm9kZVxuICAgICAgICB2YXIgZXhlY3V0ZVRlbXBsYXRlRm9yQXJyYXlJdGVtID0gZnVuY3Rpb24gKGFycmF5VmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICAvLyBTdXBwb3J0IHNlbGVjdGluZyB0ZW1wbGF0ZSBhcyBhIGZ1bmN0aW9uIG9mIHRoZSBkYXRhIGJlaW5nIHJlbmRlcmVkXG4gICAgICAgICAgICBhcnJheUl0ZW1Db250ZXh0ID0gcGFyZW50QmluZGluZ0NvbnRleHRbJ2NyZWF0ZUNoaWxkQ29udGV4dCddKGFycmF5VmFsdWUsIG9wdGlvbnNbJ2FzJ10sIGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0WyckaW5kZXgnXSA9IGluZGV4O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZU5hbWUgPSByZXNvbHZlVGVtcGxhdGVOYW1lKHRlbXBsYXRlLCBhcnJheVZhbHVlLCBhcnJheUl0ZW1Db250ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBleGVjdXRlVGVtcGxhdGUobnVsbCwgXCJpZ25vcmVUYXJnZXROb2RlXCIsIHRlbXBsYXRlTmFtZSwgYXJyYXlJdGVtQ29udGV4dCwgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIHdpbGwgYmUgY2FsbGVkIHdoZW5ldmVyIHNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcgaGFzIGFkZGVkIG5vZGVzIHRvIHRhcmdldE5vZGVcbiAgICAgICAgdmFyIGFjdGl2YXRlQmluZGluZ3NDYWxsYmFjayA9IGZ1bmN0aW9uKGFycmF5VmFsdWUsIGFkZGVkTm9kZXNBcnJheSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGFjdGl2YXRlQmluZGluZ3NPbkNvbnRpbnVvdXNOb2RlQXJyYXkoYWRkZWROb2Rlc0FycmF5LCBhcnJheUl0ZW1Db250ZXh0KTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zWydhZnRlclJlbmRlciddKVxuICAgICAgICAgICAgICAgIG9wdGlvbnNbJ2FmdGVyUmVuZGVyJ10oYWRkZWROb2Rlc0FycmF5LCBhcnJheVZhbHVlKTtcblxuICAgICAgICAgICAgLy8gcmVsZWFzZSB0aGUgXCJjYWNoZVwiIHZhcmlhYmxlLCBzbyB0aGF0IGl0IGNhbiBiZSBjb2xsZWN0ZWQgYnlcbiAgICAgICAgICAgIC8vIHRoZSBHQyB3aGVuIGl0cyB2YWx1ZSBpc24ndCB1c2VkIGZyb20gd2l0aGluIHRoZSBiaW5kaW5ncyBhbnltb3JlLlxuICAgICAgICAgICAgYXJyYXlJdGVtQ29udGV4dCA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGtvLmRlcGVuZGVudE9ic2VydmFibGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHVud3JhcHBlZEFycmF5ID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShhcnJheU9yT2JzZXJ2YWJsZUFycmF5KSB8fCBbXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdW53cmFwcGVkQXJyYXkubGVuZ3RoID09IFwidW5kZWZpbmVkXCIpIC8vIENvZXJjZSBzaW5nbGUgdmFsdWUgaW50byBhcnJheVxuICAgICAgICAgICAgICAgIHVud3JhcHBlZEFycmF5ID0gW3Vud3JhcHBlZEFycmF5XTtcblxuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBhbnkgZW50cmllcyBtYXJrZWQgYXMgZGVzdHJveWVkXG4gICAgICAgICAgICB2YXIgZmlsdGVyZWRBcnJheSA9IGtvLnV0aWxzLmFycmF5RmlsdGVyKHVud3JhcHBlZEFycmF5LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnNbJ2luY2x1ZGVEZXN0cm95ZWQnXSB8fCBpdGVtID09PSB1bmRlZmluZWQgfHwgaXRlbSA9PT0gbnVsbCB8fCAha28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShpdGVtWydfZGVzdHJveSddKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBDYWxsIHNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcsIGlnbm9yaW5nIGFueSBvYnNlcnZhYmxlcyB1bndyYXBwZWQgd2l0aGluIChtb3N0IGxpa2VseSBmcm9tIGEgY2FsbGJhY2sgZnVuY3Rpb24pLlxuICAgICAgICAgICAgLy8gSWYgdGhlIGFycmF5IGl0ZW1zIGFyZSBvYnNlcnZhYmxlcywgdGhvdWdoLCB0aGV5IHdpbGwgYmUgdW53cmFwcGVkIGluIGV4ZWN1dGVUZW1wbGF0ZUZvckFycmF5SXRlbSBhbmQgbWFuYWdlZCB3aXRoaW4gc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZy5cbiAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGtvLnV0aWxzLnNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcsIG51bGwsIFt0YXJnZXROb2RlLCBmaWx0ZXJlZEFycmF5LCBleGVjdXRlVGVtcGxhdGVGb3JBcnJheUl0ZW0sIG9wdGlvbnMsIGFjdGl2YXRlQmluZGluZ3NDYWxsYmFja10pO1xuXG4gICAgICAgIH0sIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiB0YXJnZXROb2RlIH0pO1xuICAgIH07XG5cbiAgICB2YXIgdGVtcGxhdGVDb21wdXRlZERvbURhdGFLZXkgPSBrby51dGlscy5kb21EYXRhLm5leHRLZXkoKTtcbiAgICBmdW5jdGlvbiBkaXNwb3NlT2xkQ29tcHV0ZWRBbmRTdG9yZU5ld09uZShlbGVtZW50LCBuZXdDb21wdXRlZCkge1xuICAgICAgICB2YXIgb2xkQ29tcHV0ZWQgPSBrby51dGlscy5kb21EYXRhLmdldChlbGVtZW50LCB0ZW1wbGF0ZUNvbXB1dGVkRG9tRGF0YUtleSk7XG4gICAgICAgIGlmIChvbGRDb21wdXRlZCAmJiAodHlwZW9mKG9sZENvbXB1dGVkLmRpc3Bvc2UpID09ICdmdW5jdGlvbicpKVxuICAgICAgICAgICAgb2xkQ29tcHV0ZWQuZGlzcG9zZSgpO1xuICAgICAgICBrby51dGlscy5kb21EYXRhLnNldChlbGVtZW50LCB0ZW1wbGF0ZUNvbXB1dGVkRG9tRGF0YUtleSwgKG5ld0NvbXB1dGVkICYmIG5ld0NvbXB1dGVkLmlzQWN0aXZlKCkpID8gbmV3Q29tcHV0ZWQgOiB1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIGtvLmJpbmRpbmdIYW5kbGVyc1sndGVtcGxhdGUnXSA9IHtcbiAgICAgICAgJ2luaXQnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBTdXBwb3J0IGFub255bW91cyB0ZW1wbGF0ZXNcbiAgICAgICAgICAgIHZhciBiaW5kaW5nVmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJpbmRpbmdWYWx1ZSA9PSBcInN0cmluZ1wiIHx8IGJpbmRpbmdWYWx1ZVsnbmFtZSddKSB7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBhIG5hbWVkIHRlbXBsYXRlIC0gY2xlYXIgdGhlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgnbm9kZXMnIGluIGJpbmRpbmdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGJlZW4gZ2l2ZW4gYW4gYXJyYXkgb2YgRE9NIG5vZGVzLiBTYXZlIHRoZW0gYXMgdGhlIHRlbXBsYXRlIHNvdXJjZS5cbiAgICAgICAgICAgICAgICAvLyBUaGVyZSBpcyBubyBrbm93biB1c2UgY2FzZSBmb3IgdGhlIG5vZGUgYXJyYXkgYmVpbmcgYW4gb2JzZXJ2YWJsZSBhcnJheSAoaWYgdGhlIG91dHB1dFxuICAgICAgICAgICAgICAgIC8vIHZhcmllcywgcHV0IHRoYXQgYmVoYXZpb3IgKmludG8qIHlvdXIgdGVtcGxhdGUgLSB0aGF0J3Mgd2hhdCB0ZW1wbGF0ZXMgYXJlIGZvciksIGFuZFxuICAgICAgICAgICAgICAgIC8vIHRoZSBpbXBsZW1lbnRhdGlvbiB3b3VsZCBiZSBhIG1lc3MsIHNvIGFzc2VydCB0aGF0IGl0J3Mgbm90IG9ic2VydmFibGUuXG4gICAgICAgICAgICAgICAgdmFyIG5vZGVzID0gYmluZGluZ1ZhbHVlWydub2RlcyddIHx8IFtdO1xuICAgICAgICAgICAgICAgIGlmIChrby5pc09ic2VydmFibGUobm9kZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIFwibm9kZXNcIiBvcHRpb24gbXVzdCBiZSBhIHBsYWluLCBub24tb2JzZXJ2YWJsZSBhcnJheS4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IGtvLnV0aWxzLm1vdmVDbGVhbmVkTm9kZXNUb0NvbnRhaW5lckVsZW1lbnQobm9kZXMpOyAvLyBUaGlzIGFsc28gcmVtb3ZlcyB0aGUgbm9kZXMgZnJvbSB0aGVpciBjdXJyZW50IHBhcmVudFxuICAgICAgICAgICAgICAgIG5ldyBrby50ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGUoZWxlbWVudClbJ25vZGVzJ10oY29udGFpbmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBhbiBhbm9ueW1vdXMgdGVtcGxhdGUgLSBzdG9yZSB0aGUgZWxlbWVudCBjb250ZW50cywgdGhlbiBjbGVhciB0aGUgZWxlbWVudFxuICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZU5vZGVzID0ga28udmlydHVhbEVsZW1lbnRzLmNoaWxkTm9kZXMoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IGtvLnV0aWxzLm1vdmVDbGVhbmVkTm9kZXNUb0NvbnRhaW5lckVsZW1lbnQodGVtcGxhdGVOb2Rlcyk7IC8vIFRoaXMgYWxzbyByZW1vdmVzIHRoZSBub2RlcyBmcm9tIHRoZWlyIGN1cnJlbnQgcGFyZW50XG4gICAgICAgICAgICAgICAgbmV3IGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZShlbGVtZW50KVsnbm9kZXMnXShjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgJ2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzJzogdHJ1ZSB9O1xuICAgICAgICB9LFxuICAgICAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCksXG4gICAgICAgICAgICAgICAgZGF0YVZhbHVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlKSxcbiAgICAgICAgICAgICAgICBzaG91bGREaXNwbGF5ID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUNvbXB1dGVkID0gbnVsbCxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVOYW1lID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWUgPSBvcHRpb25zWyduYW1lJ107XG5cbiAgICAgICAgICAgICAgICAvLyBTdXBwb3J0IFwiaWZcIi9cImlmbm90XCIgY29uZGl0aW9uc1xuICAgICAgICAgICAgICAgIGlmICgnaWYnIGluIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZERpc3BsYXkgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKG9wdGlvbnNbJ2lmJ10pO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGREaXNwbGF5ICYmICdpZm5vdCcgaW4gb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkRGlzcGxheSA9ICFrby51dGlscy51bndyYXBPYnNlcnZhYmxlKG9wdGlvbnNbJ2lmbm90J10pO1xuXG4gICAgICAgICAgICAgICAgZGF0YVZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShvcHRpb25zWydkYXRhJ10pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJ2ZvcmVhY2gnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAvLyBSZW5kZXIgb25jZSBmb3IgZWFjaCBkYXRhIHBvaW50ICh0cmVhdGluZyBkYXRhIHNldCBhcyBlbXB0eSBpZiBzaG91bGREaXNwbGF5PT1mYWxzZSlcbiAgICAgICAgICAgICAgICB2YXIgZGF0YUFycmF5ID0gKHNob3VsZERpc3BsYXkgJiYgb3B0aW9uc1snZm9yZWFjaCddKSB8fCBbXTtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUNvbXB1dGVkID0ga28ucmVuZGVyVGVtcGxhdGVGb3JFYWNoKHRlbXBsYXRlTmFtZSB8fCBlbGVtZW50LCBkYXRhQXJyYXksIG9wdGlvbnMsIGVsZW1lbnQsIGJpbmRpbmdDb250ZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXNob3VsZERpc3BsYXkpIHtcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBSZW5kZXIgb25jZSBmb3IgdGhpcyBzaW5nbGUgZGF0YSBwb2ludCAob3IgdXNlIHRoZSB2aWV3TW9kZWwgaWYgbm8gZGF0YSB3YXMgcHJvdmlkZWQpXG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQmluZGluZ0NvbnRleHQgPSAoJ2RhdGEnIGluIG9wdGlvbnMpID9cbiAgICAgICAgICAgICAgICAgICAgYmluZGluZ0NvbnRleHRbJ2NyZWF0ZUNoaWxkQ29udGV4dCddKGRhdGFWYWx1ZSwgb3B0aW9uc1snYXMnXSkgOiAgLy8gR2l2ZW4gYW4gZXhwbGl0aXQgJ2RhdGEnIHZhbHVlLCB3ZSBjcmVhdGUgYSBjaGlsZCBiaW5kaW5nIGNvbnRleHQgZm9yIGl0XG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdDb250ZXh0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2l2ZW4gbm8gZXhwbGljaXQgJ2RhdGEnIHZhbHVlLCB3ZSByZXRhaW4gdGhlIHNhbWUgYmluZGluZyBjb250ZXh0XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVDb21wdXRlZCA9IGtvLnJlbmRlclRlbXBsYXRlKHRlbXBsYXRlTmFtZSB8fCBlbGVtZW50LCBpbm5lckJpbmRpbmdDb250ZXh0LCBvcHRpb25zLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSXQgb25seSBtYWtlcyBzZW5zZSB0byBoYXZlIGEgc2luZ2xlIHRlbXBsYXRlIGNvbXB1dGVkIHBlciBlbGVtZW50IChvdGhlcndpc2Ugd2hpY2ggb25lIHNob3VsZCBoYXZlIGl0cyBvdXRwdXQgZGlzcGxheWVkPylcbiAgICAgICAgICAgIGRpc3Bvc2VPbGRDb21wdXRlZEFuZFN0b3JlTmV3T25lKGVsZW1lbnQsIHRlbXBsYXRlQ29tcHV0ZWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFub255bW91cyB0ZW1wbGF0ZXMgY2FuJ3QgYmUgcmV3cml0dGVuLiBHaXZlIGEgbmljZSBlcnJvciBtZXNzYWdlIGlmIHlvdSB0cnkgdG8gZG8gaXQuXG4gICAga28uZXhwcmVzc2lvblJld3JpdGluZy5iaW5kaW5nUmV3cml0ZVZhbGlkYXRvcnNbJ3RlbXBsYXRlJ10gPSBmdW5jdGlvbihiaW5kaW5nVmFsdWUpIHtcbiAgICAgICAgdmFyIHBhcnNlZEJpbmRpbmdWYWx1ZSA9IGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucGFyc2VPYmplY3RMaXRlcmFsKGJpbmRpbmdWYWx1ZSk7XG5cbiAgICAgICAgaWYgKChwYXJzZWRCaW5kaW5nVmFsdWUubGVuZ3RoID09IDEpICYmIHBhcnNlZEJpbmRpbmdWYWx1ZVswXVsndW5rbm93biddKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIEl0IGxvb2tzIGxpa2UgYSBzdHJpbmcgbGl0ZXJhbCwgbm90IGFuIG9iamVjdCBsaXRlcmFsLCBzbyB0cmVhdCBpdCBhcyBhIG5hbWVkIHRlbXBsYXRlICh3aGljaCBpcyBhbGxvd2VkIGZvciByZXdyaXRpbmcpXG5cbiAgICAgICAgaWYgKGtvLmV4cHJlc3Npb25SZXdyaXRpbmcua2V5VmFsdWVBcnJheUNvbnRhaW5zS2V5KHBhcnNlZEJpbmRpbmdWYWx1ZSwgXCJuYW1lXCIpKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIE5hbWVkIHRlbXBsYXRlcyBjYW4gYmUgcmV3cml0dGVuLCBzbyByZXR1cm4gXCJubyBlcnJvclwiXG4gICAgICAgIHJldHVybiBcIlRoaXMgdGVtcGxhdGUgZW5naW5lIGRvZXMgbm90IHN1cHBvcnQgYW5vbnltb3VzIHRlbXBsYXRlcyBuZXN0ZWQgd2l0aGluIGl0cyB0ZW1wbGF0ZXNcIjtcbiAgICB9O1xuXG4gICAga28udmlydHVhbEVsZW1lbnRzLmFsbG93ZWRCaW5kaW5nc1sndGVtcGxhdGUnXSA9IHRydWU7XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ3NldFRlbXBsYXRlRW5naW5lJywga28uc2V0VGVtcGxhdGVFbmdpbmUpO1xua28uZXhwb3J0U3ltYm9sKCdyZW5kZXJUZW1wbGF0ZScsIGtvLnJlbmRlclRlbXBsYXRlKTtcbi8vIEdvIHRocm91Z2ggdGhlIGl0ZW1zIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIGFuZCBkZWxldGVkIGFuZCB0cnkgdG8gZmluZCBtYXRjaGVzIGJldHdlZW4gdGhlbS5cbmtvLnV0aWxzLmZpbmRNb3Zlc0luQXJyYXlDb21wYXJpc29uID0gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0LCBsaW1pdEZhaWxlZENvbXBhcmVzKSB7XG4gICAgaWYgKGxlZnQubGVuZ3RoICYmIHJpZ2h0Lmxlbmd0aCkge1xuICAgICAgICB2YXIgZmFpbGVkQ29tcGFyZXMsIGwsIHIsIGxlZnRJdGVtLCByaWdodEl0ZW07XG4gICAgICAgIGZvciAoZmFpbGVkQ29tcGFyZXMgPSBsID0gMDsgKCFsaW1pdEZhaWxlZENvbXBhcmVzIHx8IGZhaWxlZENvbXBhcmVzIDwgbGltaXRGYWlsZWRDb21wYXJlcykgJiYgKGxlZnRJdGVtID0gbGVmdFtsXSk7ICsrbCkge1xuICAgICAgICAgICAgZm9yIChyID0gMDsgcmlnaHRJdGVtID0gcmlnaHRbcl07ICsrcikge1xuICAgICAgICAgICAgICAgIGlmIChsZWZ0SXRlbVsndmFsdWUnXSA9PT0gcmlnaHRJdGVtWyd2YWx1ZSddKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnRJdGVtWydtb3ZlZCddID0gcmlnaHRJdGVtWydpbmRleCddO1xuICAgICAgICAgICAgICAgICAgICByaWdodEl0ZW1bJ21vdmVkJ10gPSBsZWZ0SXRlbVsnaW5kZXgnXTtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQuc3BsaWNlKHIsIDEpOyAgICAgICAgIC8vIFRoaXMgaXRlbSBpcyBtYXJrZWQgYXMgbW92ZWQ7IHNvIHJlbW92ZSBpdCBmcm9tIHJpZ2h0IGxpc3RcbiAgICAgICAgICAgICAgICAgICAgZmFpbGVkQ29tcGFyZXMgPSByID0gMDsgICAgIC8vIFJlc2V0IGZhaWxlZCBjb21wYXJlcyBjb3VudCBiZWNhdXNlIHdlJ3JlIGNoZWNraW5nIGZvciBjb25zZWN1dGl2ZSBmYWlsdXJlc1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmYWlsZWRDb21wYXJlcyArPSByO1xuICAgICAgICB9XG4gICAgfVxufTtcblxua28udXRpbHMuY29tcGFyZUFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXR1c05vdEluT2xkID0gJ2FkZGVkJywgc3RhdHVzTm90SW5OZXcgPSAnZGVsZXRlZCc7XG5cbiAgICAvLyBTaW1wbGUgY2FsY3VsYXRpb24gYmFzZWQgb24gTGV2ZW5zaHRlaW4gZGlzdGFuY2UuXG4gICAgZnVuY3Rpb24gY29tcGFyZUFycmF5cyhvbGRBcnJheSwgbmV3QXJyYXksIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gRm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIGlmIHRoZSB0aGlyZCBhcmcgaXMgYWN0dWFsbHkgYSBib29sLCBpbnRlcnByZXRcbiAgICAgICAgLy8gaXQgYXMgdGhlIG9sZCBwYXJhbWV0ZXIgJ2RvbnRMaW1pdE1vdmVzJy4gTmV3ZXIgY29kZSBzaG91bGQgdXNlIHsgZG9udExpbWl0TW92ZXM6IHRydWUgfS5cbiAgICAgICAgb3B0aW9ucyA9ICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Jvb2xlYW4nKSA/IHsgJ2RvbnRMaW1pdE1vdmVzJzogb3B0aW9ucyB9IDogKG9wdGlvbnMgfHwge30pO1xuICAgICAgICBvbGRBcnJheSA9IG9sZEFycmF5IHx8IFtdO1xuICAgICAgICBuZXdBcnJheSA9IG5ld0FycmF5IHx8IFtdO1xuXG4gICAgICAgIGlmIChvbGRBcnJheS5sZW5ndGggPD0gbmV3QXJyYXkubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmVTbWFsbEFycmF5VG9CaWdBcnJheShvbGRBcnJheSwgbmV3QXJyYXksIHN0YXR1c05vdEluT2xkLCBzdGF0dXNOb3RJbk5ldywgb3B0aW9ucyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlU21hbGxBcnJheVRvQmlnQXJyYXkobmV3QXJyYXksIG9sZEFycmF5LCBzdGF0dXNOb3RJbk5ldywgc3RhdHVzTm90SW5PbGQsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbXBhcmVTbWFsbEFycmF5VG9CaWdBcnJheShzbWxBcnJheSwgYmlnQXJyYXksIHN0YXR1c05vdEluU21sLCBzdGF0dXNOb3RJbkJpZywgb3B0aW9ucykge1xuICAgICAgICB2YXIgbXlNaW4gPSBNYXRoLm1pbixcbiAgICAgICAgICAgIG15TWF4ID0gTWF0aC5tYXgsXG4gICAgICAgICAgICBlZGl0RGlzdGFuY2VNYXRyaXggPSBbXSxcbiAgICAgICAgICAgIHNtbEluZGV4LCBzbWxJbmRleE1heCA9IHNtbEFycmF5Lmxlbmd0aCxcbiAgICAgICAgICAgIGJpZ0luZGV4LCBiaWdJbmRleE1heCA9IGJpZ0FycmF5Lmxlbmd0aCxcbiAgICAgICAgICAgIGNvbXBhcmVSYW5nZSA9IChiaWdJbmRleE1heCAtIHNtbEluZGV4TWF4KSB8fCAxLFxuICAgICAgICAgICAgbWF4RGlzdGFuY2UgPSBzbWxJbmRleE1heCArIGJpZ0luZGV4TWF4ICsgMSxcbiAgICAgICAgICAgIHRoaXNSb3csIGxhc3RSb3csXG4gICAgICAgICAgICBiaWdJbmRleE1heEZvclJvdywgYmlnSW5kZXhNaW5Gb3JSb3c7XG5cbiAgICAgICAgZm9yIChzbWxJbmRleCA9IDA7IHNtbEluZGV4IDw9IHNtbEluZGV4TWF4OyBzbWxJbmRleCsrKSB7XG4gICAgICAgICAgICBsYXN0Um93ID0gdGhpc1JvdztcbiAgICAgICAgICAgIGVkaXREaXN0YW5jZU1hdHJpeC5wdXNoKHRoaXNSb3cgPSBbXSk7XG4gICAgICAgICAgICBiaWdJbmRleE1heEZvclJvdyA9IG15TWluKGJpZ0luZGV4TWF4LCBzbWxJbmRleCArIGNvbXBhcmVSYW5nZSk7XG4gICAgICAgICAgICBiaWdJbmRleE1pbkZvclJvdyA9IG15TWF4KDAsIHNtbEluZGV4IC0gMSk7XG4gICAgICAgICAgICBmb3IgKGJpZ0luZGV4ID0gYmlnSW5kZXhNaW5Gb3JSb3c7IGJpZ0luZGV4IDw9IGJpZ0luZGV4TWF4Rm9yUm93OyBiaWdJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFiaWdJbmRleClcbiAgICAgICAgICAgICAgICAgICAgdGhpc1Jvd1tiaWdJbmRleF0gPSBzbWxJbmRleCArIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXNtbEluZGV4KSAgLy8gVG9wIHJvdyAtIHRyYW5zZm9ybSBlbXB0eSBhcnJheSBpbnRvIG5ldyBhcnJheSB2aWEgYWRkaXRpb25zXG4gICAgICAgICAgICAgICAgICAgIHRoaXNSb3dbYmlnSW5kZXhdID0gYmlnSW5kZXggKyAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNtbEFycmF5W3NtbEluZGV4IC0gMV0gPT09IGJpZ0FycmF5W2JpZ0luZGV4IC0gMV0pXG4gICAgICAgICAgICAgICAgICAgIHRoaXNSb3dbYmlnSW5kZXhdID0gbGFzdFJvd1tiaWdJbmRleCAtIDFdOyAgICAgICAgICAgICAgICAgIC8vIGNvcHkgdmFsdWUgKG5vIGVkaXQpXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub3J0aERpc3RhbmNlID0gbGFzdFJvd1tiaWdJbmRleF0gfHwgbWF4RGlzdGFuY2U7ICAgICAgIC8vIG5vdCBpbiBiaWcgKGRlbGV0aW9uKVxuICAgICAgICAgICAgICAgICAgICB2YXIgd2VzdERpc3RhbmNlID0gdGhpc1Jvd1tiaWdJbmRleCAtIDFdIHx8IG1heERpc3RhbmNlOyAgICAvLyBub3QgaW4gc21hbGwgKGFkZGl0aW9uKVxuICAgICAgICAgICAgICAgICAgICB0aGlzUm93W2JpZ0luZGV4XSA9IG15TWluKG5vcnRoRGlzdGFuY2UsIHdlc3REaXN0YW5jZSkgKyAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlZGl0U2NyaXB0ID0gW10sIG1lTWludXNPbmUsIG5vdEluU21sID0gW10sIG5vdEluQmlnID0gW107XG4gICAgICAgIGZvciAoc21sSW5kZXggPSBzbWxJbmRleE1heCwgYmlnSW5kZXggPSBiaWdJbmRleE1heDsgc21sSW5kZXggfHwgYmlnSW5kZXg7KSB7XG4gICAgICAgICAgICBtZU1pbnVzT25lID0gZWRpdERpc3RhbmNlTWF0cml4W3NtbEluZGV4XVtiaWdJbmRleF0gLSAxO1xuICAgICAgICAgICAgaWYgKGJpZ0luZGV4ICYmIG1lTWludXNPbmUgPT09IGVkaXREaXN0YW5jZU1hdHJpeFtzbWxJbmRleF1bYmlnSW5kZXgtMV0pIHtcbiAgICAgICAgICAgICAgICBub3RJblNtbC5wdXNoKGVkaXRTY3JpcHRbZWRpdFNjcmlwdC5sZW5ndGhdID0geyAgICAgLy8gYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgJ3N0YXR1cyc6IHN0YXR1c05vdEluU21sLFxuICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBiaWdBcnJheVstLWJpZ0luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgJ2luZGV4JzogYmlnSW5kZXggfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNtbEluZGV4ICYmIG1lTWludXNPbmUgPT09IGVkaXREaXN0YW5jZU1hdHJpeFtzbWxJbmRleCAtIDFdW2JpZ0luZGV4XSkge1xuICAgICAgICAgICAgICAgIG5vdEluQmlnLnB1c2goZWRpdFNjcmlwdFtlZGl0U2NyaXB0Lmxlbmd0aF0gPSB7ICAgICAvLyBkZWxldGVkXG4gICAgICAgICAgICAgICAgICAgICdzdGF0dXMnOiBzdGF0dXNOb3RJbkJpZyxcbiAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJzogc21sQXJyYXlbLS1zbWxJbmRleF0sXG4gICAgICAgICAgICAgICAgICAgICdpbmRleCc6IHNtbEluZGV4IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAtLWJpZ0luZGV4O1xuICAgICAgICAgICAgICAgIC0tc21sSW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zWydzcGFyc2UnXSkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0U2NyaXB0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXR1cyc6IFwicmV0YWluZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IGJpZ0FycmF5W2JpZ0luZGV4XSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgYSBsaW1pdCBvbiB0aGUgbnVtYmVyIG9mIGNvbnNlY3V0aXZlIG5vbi1tYXRjaGluZyBjb21wYXJpc29uczsgaGF2aW5nIGl0IGEgbXVsdGlwbGUgb2ZcbiAgICAgICAgLy8gc21sSW5kZXhNYXgga2VlcHMgdGhlIHRpbWUgY29tcGxleGl0eSBvZiB0aGlzIGFsZ29yaXRobSBsaW5lYXIuXG4gICAgICAgIGtvLnV0aWxzLmZpbmRNb3Zlc0luQXJyYXlDb21wYXJpc29uKG5vdEluU21sLCBub3RJbkJpZywgc21sSW5kZXhNYXggKiAxMCk7XG5cbiAgICAgICAgcmV0dXJuIGVkaXRTY3JpcHQucmV2ZXJzZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBjb21wYXJlQXJyYXlzO1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCd1dGlscy5jb21wYXJlQXJyYXlzJywga28udXRpbHMuY29tcGFyZUFycmF5cyk7XG4oZnVuY3Rpb24gKCkge1xuICAgIC8vIE9iamVjdGl2ZTpcbiAgICAvLyAqIEdpdmVuIGFuIGlucHV0IGFycmF5LCBhIGNvbnRhaW5lciBET00gbm9kZSwgYW5kIGEgZnVuY3Rpb24gZnJvbSBhcnJheSBlbGVtZW50cyB0byBhcnJheXMgb2YgRE9NIG5vZGVzLFxuICAgIC8vICAgbWFwIHRoZSBhcnJheSBlbGVtZW50cyB0byBhcnJheXMgb2YgRE9NIG5vZGVzLCBjb25jYXRlbmF0ZSB0b2dldGhlciBhbGwgdGhlc2UgYXJyYXlzLCBhbmQgdXNlIHRoZW0gdG8gcG9wdWxhdGUgdGhlIGNvbnRhaW5lciBET00gbm9kZVxuICAgIC8vICogTmV4dCB0aW1lIHdlJ3JlIGdpdmVuIHRoZSBzYW1lIGNvbWJpbmF0aW9uIG9mIHRoaW5ncyAod2l0aCB0aGUgYXJyYXkgcG9zc2libHkgaGF2aW5nIG11dGF0ZWQpLCB1cGRhdGUgdGhlIGNvbnRhaW5lciBET00gbm9kZVxuICAgIC8vICAgc28gdGhhdCBpdHMgY2hpbGRyZW4gaXMgYWdhaW4gdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlIG1hcHBpbmdzIG9mIHRoZSBhcnJheSBlbGVtZW50cywgYnV0IGRvbid0IHJlLW1hcCBhbnkgYXJyYXkgZWxlbWVudHMgdGhhdCB3ZVxuICAgIC8vICAgcHJldmlvdXNseSBtYXBwZWQgLSByZXRhaW4gdGhvc2Ugbm9kZXMsIGFuZCBqdXN0IGluc2VydC9kZWxldGUgb3RoZXIgb25lc1xuXG4gICAgLy8gXCJjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXNcIiB3aWxsIGJlIGludm9rZWQgYWZ0ZXIgYW55IFwibWFwcGluZ1wiLWdlbmVyYXRlZCBub2RlcyBhcmUgaW5zZXJ0ZWQgaW50byB0aGUgY29udGFpbmVyIG5vZGVcbiAgICAvLyBZb3UgY2FuIHVzZSB0aGlzLCBmb3IgZXhhbXBsZSwgdG8gYWN0aXZhdGUgYmluZGluZ3Mgb24gdGhvc2Ugbm9kZXMuXG5cbiAgICBmdW5jdGlvbiBtYXBOb2RlQW5kUmVmcmVzaFdoZW5DaGFuZ2VkKGNvbnRhaW5lck5vZGUsIG1hcHBpbmcsIHZhbHVlVG9NYXAsIGNhbGxiYWNrQWZ0ZXJBZGRpbmdOb2RlcywgaW5kZXgpIHtcbiAgICAgICAgLy8gTWFwIHRoaXMgYXJyYXkgdmFsdWUgaW5zaWRlIGEgZGVwZW5kZW50T2JzZXJ2YWJsZSBzbyB3ZSByZS1tYXAgd2hlbiBhbnkgZGVwZW5kZW5jeSBjaGFuZ2VzXG4gICAgICAgIHZhciBtYXBwZWROb2RlcyA9IFtdO1xuICAgICAgICB2YXIgZGVwZW5kZW50T2JzZXJ2YWJsZSA9IGtvLmRlcGVuZGVudE9ic2VydmFibGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbmV3TWFwcGVkTm9kZXMgPSBtYXBwaW5nKHZhbHVlVG9NYXAsIGluZGV4LCBrby51dGlscy5maXhVcENvbnRpbnVvdXNOb2RlQXJyYXkobWFwcGVkTm9kZXMsIGNvbnRhaW5lck5vZGUpKSB8fCBbXTtcblxuICAgICAgICAgICAgLy8gT24gc3Vic2VxdWVudCBldmFsdWF0aW9ucywganVzdCByZXBsYWNlIHRoZSBwcmV2aW91c2x5LWluc2VydGVkIERPTSBub2Rlc1xuICAgICAgICAgICAgaWYgKG1hcHBlZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBrby51dGlscy5yZXBsYWNlRG9tTm9kZXMobWFwcGVkTm9kZXMsIG5ld01hcHBlZE5vZGVzKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tBZnRlckFkZGluZ05vZGVzKVxuICAgICAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMsIG51bGwsIFt2YWx1ZVRvTWFwLCBuZXdNYXBwZWROb2RlcywgaW5kZXhdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVwbGFjZSB0aGUgY29udGVudHMgb2YgdGhlIG1hcHBlZE5vZGVzIGFycmF5LCB0aGVyZWJ5IHVwZGF0aW5nIHRoZSByZWNvcmRcbiAgICAgICAgICAgIC8vIG9mIHdoaWNoIG5vZGVzIHdvdWxkIGJlIGRlbGV0ZWQgaWYgdmFsdWVUb01hcCB3YXMgaXRzZWxmIGxhdGVyIHJlbW92ZWRcbiAgICAgICAgICAgIG1hcHBlZE5vZGVzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBrby51dGlscy5hcnJheVB1c2hBbGwobWFwcGVkTm9kZXMsIG5ld01hcHBlZE5vZGVzKTtcbiAgICAgICAgfSwgbnVsbCwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IGNvbnRhaW5lck5vZGUsIGRpc3Bvc2VXaGVuOiBmdW5jdGlvbigpIHsgcmV0dXJuICFrby51dGlscy5hbnlEb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQobWFwcGVkTm9kZXMpOyB9IH0pO1xuICAgICAgICByZXR1cm4geyBtYXBwZWROb2RlcyA6IG1hcHBlZE5vZGVzLCBkZXBlbmRlbnRPYnNlcnZhYmxlIDogKGRlcGVuZGVudE9ic2VydmFibGUuaXNBY3RpdmUoKSA/IGRlcGVuZGVudE9ic2VydmFibGUgOiB1bmRlZmluZWQpIH07XG4gICAgfVxuXG4gICAgdmFyIGxhc3RNYXBwaW5nUmVzdWx0RG9tRGF0YUtleSA9IGtvLnV0aWxzLmRvbURhdGEubmV4dEtleSgpO1xuXG4gICAga28udXRpbHMuc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyA9IGZ1bmN0aW9uIChkb21Ob2RlLCBhcnJheSwgbWFwcGluZywgb3B0aW9ucywgY2FsbGJhY2tBZnRlckFkZGluZ05vZGVzKSB7XG4gICAgICAgIC8vIENvbXBhcmUgdGhlIHByb3ZpZGVkIGFycmF5IGFnYWluc3QgdGhlIHByZXZpb3VzIG9uZVxuICAgICAgICBhcnJheSA9IGFycmF5IHx8IFtdO1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdmFyIGlzRmlyc3RFeGVjdXRpb24gPSBrby51dGlscy5kb21EYXRhLmdldChkb21Ob2RlLCBsYXN0TWFwcGluZ1Jlc3VsdERvbURhdGFLZXkpID09PSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBsYXN0TWFwcGluZ1Jlc3VsdCA9IGtvLnV0aWxzLmRvbURhdGEuZ2V0KGRvbU5vZGUsIGxhc3RNYXBwaW5nUmVzdWx0RG9tRGF0YUtleSkgfHwgW107XG4gICAgICAgIHZhciBsYXN0QXJyYXkgPSBrby51dGlscy5hcnJheU1hcChsYXN0TWFwcGluZ1Jlc3VsdCwgZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHguYXJyYXlFbnRyeTsgfSk7XG4gICAgICAgIHZhciBlZGl0U2NyaXB0ID0ga28udXRpbHMuY29tcGFyZUFycmF5cyhsYXN0QXJyYXksIGFycmF5LCBvcHRpb25zWydkb250TGltaXRNb3ZlcyddKTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgbmV3IG1hcHBpbmcgcmVzdWx0XG4gICAgICAgIHZhciBuZXdNYXBwaW5nUmVzdWx0ID0gW107XG4gICAgICAgIHZhciBsYXN0TWFwcGluZ1Jlc3VsdEluZGV4ID0gMDtcbiAgICAgICAgdmFyIG5ld01hcHBpbmdSZXN1bHRJbmRleCA9IDA7XG5cbiAgICAgICAgdmFyIG5vZGVzVG9EZWxldGUgPSBbXTtcbiAgICAgICAgdmFyIGl0ZW1zVG9Qcm9jZXNzID0gW107XG4gICAgICAgIHZhciBpdGVtc0ZvckJlZm9yZVJlbW92ZUNhbGxiYWNrcyA9IFtdO1xuICAgICAgICB2YXIgaXRlbXNGb3JNb3ZlQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHZhciBpdGVtc0ZvckFmdGVyQWRkQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHZhciBtYXBEYXRhO1xuXG4gICAgICAgIGZ1bmN0aW9uIGl0ZW1Nb3ZlZE9yUmV0YWluZWQoZWRpdFNjcmlwdEluZGV4LCBvbGRQb3NpdGlvbikge1xuICAgICAgICAgICAgbWFwRGF0YSA9IGxhc3RNYXBwaW5nUmVzdWx0W29sZFBvc2l0aW9uXTtcbiAgICAgICAgICAgIGlmIChuZXdNYXBwaW5nUmVzdWx0SW5kZXggIT09IG9sZFBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIGl0ZW1zRm9yTW92ZUNhbGxiYWNrc1tlZGl0U2NyaXB0SW5kZXhdID0gbWFwRGF0YTtcbiAgICAgICAgICAgIC8vIFNpbmNlIHVwZGF0aW5nIHRoZSBpbmRleCBtaWdodCBjaGFuZ2UgdGhlIG5vZGVzLCBkbyBzbyBiZWZvcmUgY2FsbGluZyBmaXhVcENvbnRpbnVvdXNOb2RlQXJyYXlcbiAgICAgICAgICAgIG1hcERhdGEuaW5kZXhPYnNlcnZhYmxlKG5ld01hcHBpbmdSZXN1bHRJbmRleCsrKTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmZpeFVwQ29udGludW91c05vZGVBcnJheShtYXBEYXRhLm1hcHBlZE5vZGVzLCBkb21Ob2RlKTtcbiAgICAgICAgICAgIG5ld01hcHBpbmdSZXN1bHQucHVzaChtYXBEYXRhKTtcbiAgICAgICAgICAgIGl0ZW1zVG9Qcm9jZXNzLnB1c2gobWFwRGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjYWxsQ2FsbGJhY2soY2FsbGJhY2ssIGl0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGl0ZW1zLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbXNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChpdGVtc1tpXS5tYXBwZWROb2RlcywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5vZGUsIGksIGl0ZW1zW2ldLmFycmF5RW50cnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgZWRpdFNjcmlwdEl0ZW0sIG1vdmVkSW5kZXg7IGVkaXRTY3JpcHRJdGVtID0gZWRpdFNjcmlwdFtpXTsgaSsrKSB7XG4gICAgICAgICAgICBtb3ZlZEluZGV4ID0gZWRpdFNjcmlwdEl0ZW1bJ21vdmVkJ107XG4gICAgICAgICAgICBzd2l0Y2ggKGVkaXRTY3JpcHRJdGVtWydzdGF0dXMnXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJkZWxldGVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb3ZlZEluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcERhdGEgPSBsYXN0TWFwcGluZ1Jlc3VsdFtsYXN0TWFwcGluZ1Jlc3VsdEluZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RvcCB0cmFja2luZyBjaGFuZ2VzIHRvIHRoZSBtYXBwaW5nIGZvciB0aGVzZSBub2Rlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcERhdGEuZGVwZW5kZW50T2JzZXJ2YWJsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBEYXRhLmRlcGVuZGVudE9ic2VydmFibGUuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBRdWV1ZSB0aGVzZSBub2RlcyBmb3IgbGF0ZXIgcmVtb3ZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb0RlbGV0ZS5wdXNoLmFwcGx5KG5vZGVzVG9EZWxldGUsIGtvLnV0aWxzLmZpeFVwQ29udGludW91c05vZGVBcnJheShtYXBEYXRhLm1hcHBlZE5vZGVzLCBkb21Ob2RlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9uc1snYmVmb3JlUmVtb3ZlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtc0ZvckJlZm9yZVJlbW92ZUNhbGxiYWNrc1tpXSA9IG1hcERhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXNUb1Byb2Nlc3MucHVzaChtYXBEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0TWFwcGluZ1Jlc3VsdEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcInJldGFpbmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Nb3ZlZE9yUmV0YWluZWQoaSwgbGFzdE1hcHBpbmdSZXN1bHRJbmRleCsrKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiYWRkZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vdmVkSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbU1vdmVkT3JSZXRhaW5lZChpLCBtb3ZlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcERhdGEgPSB7IGFycmF5RW50cnk6IGVkaXRTY3JpcHRJdGVtWyd2YWx1ZSddLCBpbmRleE9ic2VydmFibGU6IGtvLm9ic2VydmFibGUobmV3TWFwcGluZ1Jlc3VsdEluZGV4KyspIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdNYXBwaW5nUmVzdWx0LnB1c2gobWFwRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtc1RvUHJvY2Vzcy5wdXNoKG1hcERhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpcnN0RXhlY3V0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zRm9yQWZ0ZXJBZGRDYWxsYmFja3NbaV0gPSBtYXBEYXRhO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbCBiZWZvcmVNb3ZlIGZpcnN0IGJlZm9yZSBhbnkgY2hhbmdlcyBoYXZlIGJlZW4gbWFkZSB0byB0aGUgRE9NXG4gICAgICAgIGNhbGxDYWxsYmFjayhvcHRpb25zWydiZWZvcmVNb3ZlJ10sIGl0ZW1zRm9yTW92ZUNhbGxiYWNrcyk7XG5cbiAgICAgICAgLy8gTmV4dCByZW1vdmUgbm9kZXMgZm9yIGRlbGV0ZWQgaXRlbXMgKG9yIGp1c3QgY2xlYW4gaWYgdGhlcmUncyBhIGJlZm9yZVJlbW92ZSBjYWxsYmFjaylcbiAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKG5vZGVzVG9EZWxldGUsIG9wdGlvbnNbJ2JlZm9yZVJlbW92ZSddID8ga28uY2xlYW5Ob2RlIDoga28ucmVtb3ZlTm9kZSk7XG5cbiAgICAgICAgLy8gTmV4dCBhZGQvcmVvcmRlciB0aGUgcmVtYWluaW5nIGl0ZW1zICh3aWxsIGluY2x1ZGUgZGVsZXRlZCBpdGVtcyBpZiB0aGVyZSdzIGEgYmVmb3JlUmVtb3ZlIGNhbGxiYWNrKVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbmV4dE5vZGUgPSBrby52aXJ0dWFsRWxlbWVudHMuZmlyc3RDaGlsZChkb21Ob2RlKSwgbGFzdE5vZGUsIG5vZGU7IG1hcERhdGEgPSBpdGVtc1RvUHJvY2Vzc1tpXTsgaSsrKSB7XG4gICAgICAgICAgICAvLyBHZXQgbm9kZXMgZm9yIG5ld2x5IGFkZGVkIGl0ZW1zXG4gICAgICAgICAgICBpZiAoIW1hcERhdGEubWFwcGVkTm9kZXMpXG4gICAgICAgICAgICAgICAga28udXRpbHMuZXh0ZW5kKG1hcERhdGEsIG1hcE5vZGVBbmRSZWZyZXNoV2hlbkNoYW5nZWQoZG9tTm9kZSwgbWFwcGluZywgbWFwRGF0YS5hcnJheUVudHJ5LCBjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMsIG1hcERhdGEuaW5kZXhPYnNlcnZhYmxlKSk7XG5cbiAgICAgICAgICAgIC8vIFB1dCBub2RlcyBpbiB0aGUgcmlnaHQgcGxhY2UgaWYgdGhleSBhcmVuJ3QgdGhlcmUgYWxyZWFkeVxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IG5vZGUgPSBtYXBEYXRhLm1hcHBlZE5vZGVzW2pdOyBuZXh0Tm9kZSA9IG5vZGUubmV4dFNpYmxpbmcsIGxhc3ROb2RlID0gbm9kZSwgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUgIT09IG5leHROb2RlKVxuICAgICAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuaW5zZXJ0QWZ0ZXIoZG9tTm9kZSwgbm9kZSwgbGFzdE5vZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSdW4gdGhlIGNhbGxiYWNrcyBmb3IgbmV3bHkgYWRkZWQgbm9kZXMgKGZvciBleGFtcGxlLCB0byBhcHBseSBiaW5kaW5ncywgZXRjLilcbiAgICAgICAgICAgIGlmICghbWFwRGF0YS5pbml0aWFsaXplZCAmJiBjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMobWFwRGF0YS5hcnJheUVudHJ5LCBtYXBEYXRhLm1hcHBlZE5vZGVzLCBtYXBEYXRhLmluZGV4T2JzZXJ2YWJsZSk7XG4gICAgICAgICAgICAgICAgbWFwRGF0YS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGVyZSdzIGEgYmVmb3JlUmVtb3ZlIGNhbGxiYWNrLCBjYWxsIGl0IGFmdGVyIHJlb3JkZXJpbmcuXG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBhc3N1bWUgdGhhdCB0aGUgYmVmb3JlUmVtb3ZlIGNhbGxiYWNrIHdpbGwgdXN1YWxseSBiZSB1c2VkIHRvIHJlbW92ZSB0aGUgbm9kZXMgdXNpbmdcbiAgICAgICAgLy8gc29tZSBzb3J0IG9mIGFuaW1hdGlvbiwgd2hpY2ggaXMgd2h5IHdlIGZpcnN0IHJlb3JkZXIgdGhlIG5vZGVzIHRoYXQgd2lsbCBiZSByZW1vdmVkLiBJZiB0aGVcbiAgICAgICAgLy8gY2FsbGJhY2sgaW5zdGVhZCByZW1vdmVzIHRoZSBub2RlcyByaWdodCBhd2F5LCBpdCB3b3VsZCBiZSBtb3JlIGVmZmljaWVudCB0byBza2lwIHJlb3JkZXJpbmcgdGhlbS5cbiAgICAgICAgLy8gUGVyaGFwcyB3ZSdsbCBtYWtlIHRoYXQgY2hhbmdlIGluIHRoZSBmdXR1cmUgaWYgdGhpcyBzY2VuYXJpbyBiZWNvbWVzIG1vcmUgY29tbW9uLlxuICAgICAgICBjYWxsQ2FsbGJhY2sob3B0aW9uc1snYmVmb3JlUmVtb3ZlJ10sIGl0ZW1zRm9yQmVmb3JlUmVtb3ZlQ2FsbGJhY2tzKTtcblxuICAgICAgICAvLyBGaW5hbGx5IGNhbGwgYWZ0ZXJNb3ZlIGFuZCBhZnRlckFkZCBjYWxsYmFja3NcbiAgICAgICAgY2FsbENhbGxiYWNrKG9wdGlvbnNbJ2FmdGVyTW92ZSddLCBpdGVtc0Zvck1vdmVDYWxsYmFja3MpO1xuICAgICAgICBjYWxsQ2FsbGJhY2sob3B0aW9uc1snYWZ0ZXJBZGQnXSwgaXRlbXNGb3JBZnRlckFkZENhbGxiYWNrcyk7XG5cbiAgICAgICAgLy8gU3RvcmUgYSBjb3B5IG9mIHRoZSBhcnJheSBpdGVtcyB3ZSBqdXN0IGNvbnNpZGVyZWQgc28gd2UgY2FuIGRpZmZlcmVuY2UgaXQgbmV4dCB0aW1lXG4gICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KGRvbU5vZGUsIGxhc3RNYXBwaW5nUmVzdWx0RG9tRGF0YUtleSwgbmV3TWFwcGluZ1Jlc3VsdCk7XG4gICAgfVxufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCd1dGlscy5zZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nJywga28udXRpbHMuc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyk7XG5rby5uYXRpdmVUZW1wbGF0ZUVuZ2luZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzWydhbGxvd1RlbXBsYXRlUmV3cml0aW5nJ10gPSBmYWxzZTtcbn1cblxua28ubmF0aXZlVGVtcGxhdGVFbmdpbmUucHJvdG90eXBlID0gbmV3IGtvLnRlbXBsYXRlRW5naW5lKCk7XG5rby5uYXRpdmVUZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZTtcbmtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lLnByb3RvdHlwZVsncmVuZGVyVGVtcGxhdGVTb3VyY2UnXSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZVNvdXJjZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMsIHRlbXBsYXRlRG9jdW1lbnQpIHtcbiAgICB2YXIgdXNlTm9kZXNJZkF2YWlsYWJsZSA9ICEoa28udXRpbHMuaWVWZXJzaW9uIDwgOSksIC8vIElFPDkgY2xvbmVOb2RlIGRvZXNuJ3Qgd29yayBwcm9wZXJseVxuICAgICAgICB0ZW1wbGF0ZU5vZGVzRnVuYyA9IHVzZU5vZGVzSWZBdmFpbGFibGUgPyB0ZW1wbGF0ZVNvdXJjZVsnbm9kZXMnXSA6IG51bGwsXG4gICAgICAgIHRlbXBsYXRlTm9kZXMgPSB0ZW1wbGF0ZU5vZGVzRnVuYyA/IHRlbXBsYXRlU291cmNlWydub2RlcyddKCkgOiBudWxsO1xuXG4gICAgaWYgKHRlbXBsYXRlTm9kZXMpIHtcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLm1ha2VBcnJheSh0ZW1wbGF0ZU5vZGVzLmNsb25lTm9kZSh0cnVlKS5jaGlsZE5vZGVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdGVtcGxhdGVUZXh0ID0gdGVtcGxhdGVTb3VyY2VbJ3RleHQnXSgpO1xuICAgICAgICByZXR1cm4ga28udXRpbHMucGFyc2VIdG1sRnJhZ21lbnQodGVtcGxhdGVUZXh0LCB0ZW1wbGF0ZURvY3VtZW50KTtcbiAgICB9XG59O1xuXG5rby5uYXRpdmVUZW1wbGF0ZUVuZ2luZS5pbnN0YW5jZSA9IG5ldyBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZSgpO1xua28uc2V0VGVtcGxhdGVFbmdpbmUoa28ubmF0aXZlVGVtcGxhdGVFbmdpbmUuaW5zdGFuY2UpO1xuXG5rby5leHBvcnRTeW1ib2woJ25hdGl2ZVRlbXBsYXRlRW5naW5lJywga28ubmF0aXZlVGVtcGxhdGVFbmdpbmUpO1xuKGZ1bmN0aW9uKCkge1xuICAgIGtvLmpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gRGV0ZWN0IHdoaWNoIHZlcnNpb24gb2YganF1ZXJ5LXRtcGwgeW91J3JlIHVzaW5nLiBVbmZvcnR1bmF0ZWx5IGpxdWVyeS10bXBsXG4gICAgICAgIC8vIGRvZXNuJ3QgZXhwb3NlIGEgdmVyc2lvbiBudW1iZXIsIHNvIHdlIGhhdmUgdG8gaW5mZXIgaXQuXG4gICAgICAgIC8vIE5vdGUgdGhhdCBhcyBvZiBLbm9ja291dCAxLjMsIHdlIG9ubHkgc3VwcG9ydCBqUXVlcnkudG1wbCAxLjAuMHByZSBhbmQgbGF0ZXIsXG4gICAgICAgIC8vIHdoaWNoIEtPIGludGVybmFsbHkgcmVmZXJzIHRvIGFzIHZlcnNpb24gXCIyXCIsIHNvIG9sZGVyIHZlcnNpb25zIGFyZSBubyBsb25nZXIgZGV0ZWN0ZWQuXG4gICAgICAgIHZhciBqUXVlcnlUbXBsVmVyc2lvbiA9IHRoaXMualF1ZXJ5VG1wbFZlcnNpb24gPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWpRdWVyeUluc3RhbmNlIHx8ICEoalF1ZXJ5SW5zdGFuY2VbJ3RtcGwnXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAvLyBTaW5jZSBpdCBleHBvc2VzIG5vIG9mZmljaWFsIHZlcnNpb24gbnVtYmVyLCB3ZSB1c2Ugb3VyIG93biBudW1iZXJpbmcgc3lzdGVtLiBUbyBiZSB1cGRhdGVkIGFzIGpxdWVyeS10bXBsIGV2b2x2ZXMuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChqUXVlcnlJbnN0YW5jZVsndG1wbCddWyd0YWcnXVsndG1wbCddWydvcGVuJ10udG9TdHJpbmcoKS5pbmRleE9mKCdfXycpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgMS4wLjBwcmUsIGN1c3RvbSB0YWdzIHNob3VsZCBhcHBlbmQgbWFya3VwIHRvIGFuIGFycmF5IGNhbGxlZCBcIl9fXCJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDI7IC8vIEZpbmFsIHZlcnNpb24gb2YganF1ZXJ5LnRtcGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoKGV4KSB7IC8qIEFwcGFyZW50bHkgbm90IHRoZSB2ZXJzaW9uIHdlIHdlcmUgbG9va2luZyBmb3IgKi8gfVxuXG4gICAgICAgICAgICByZXR1cm4gMTsgLy8gQW55IG9sZGVyIHZlcnNpb24gdGhhdCB3ZSBkb24ndCBzdXBwb3J0XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZW5zdXJlSGFzUmVmZXJlbmNlZEpRdWVyeVRlbXBsYXRlcygpIHtcbiAgICAgICAgICAgIGlmIChqUXVlcnlUbXBsVmVyc2lvbiA8IDIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91ciB2ZXJzaW9uIG9mIGpRdWVyeS50bXBsIGlzIHRvbyBvbGQuIFBsZWFzZSB1cGdyYWRlIHRvIGpRdWVyeS50bXBsIDEuMC4wcHJlIG9yIGxhdGVyLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGV4ZWN1dGVUZW1wbGF0ZShjb21waWxlZFRlbXBsYXRlLCBkYXRhLCBqUXVlcnlUZW1wbGF0ZU9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBqUXVlcnlJbnN0YW5jZVsndG1wbCddKGNvbXBpbGVkVGVtcGxhdGUsIGRhdGEsIGpRdWVyeVRlbXBsYXRlT3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzWydyZW5kZXJUZW1wbGF0ZVNvdXJjZSddID0gZnVuY3Rpb24odGVtcGxhdGVTb3VyY2UsIGJpbmRpbmdDb250ZXh0LCBvcHRpb25zLCB0ZW1wbGF0ZURvY3VtZW50KSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZURvY3VtZW50ID0gdGVtcGxhdGVEb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICAgICAgZW5zdXJlSGFzUmVmZXJlbmNlZEpRdWVyeVRlbXBsYXRlcygpO1xuXG4gICAgICAgICAgICAvLyBFbnN1cmUgd2UgaGF2ZSBzdG9yZWQgYSBwcmVjb21waWxlZCB2ZXJzaW9uIG9mIHRoaXMgdGVtcGxhdGUgKGRvbid0IHdhbnQgdG8gcmVwYXJzZSBvbiBldmVyeSByZW5kZXIpXG4gICAgICAgICAgICB2YXIgcHJlY29tcGlsZWQgPSB0ZW1wbGF0ZVNvdXJjZVsnZGF0YSddKCdwcmVjb21waWxlZCcpO1xuICAgICAgICAgICAgaWYgKCFwcmVjb21waWxlZCkge1xuICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZVRleHQgPSB0ZW1wbGF0ZVNvdXJjZVsndGV4dCddKCkgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAvLyBXcmFwIGluIFwid2l0aCgkd2hhdGV2ZXIua29CaW5kaW5nQ29udGV4dCkgeyAuLi4gfVwiXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVUZXh0ID0gXCJ7e2tvX3dpdGggJGl0ZW0ua29CaW5kaW5nQ29udGV4dH19XCIgKyB0ZW1wbGF0ZVRleHQgKyBcInt7L2tvX3dpdGh9fVwiO1xuXG4gICAgICAgICAgICAgICAgcHJlY29tcGlsZWQgPSBqUXVlcnlJbnN0YW5jZVsndGVtcGxhdGUnXShudWxsLCB0ZW1wbGF0ZVRleHQpO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlU291cmNlWydkYXRhJ10oJ3ByZWNvbXBpbGVkJywgcHJlY29tcGlsZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFtiaW5kaW5nQ29udGV4dFsnJGRhdGEnXV07IC8vIFByZXdyYXAgdGhlIGRhdGEgaW4gYW4gYXJyYXkgdG8gc3RvcCBqcXVlcnkudG1wbCBmcm9tIHRyeWluZyB0byB1bndyYXAgYW55IGFycmF5c1xuICAgICAgICAgICAgdmFyIGpRdWVyeVRlbXBsYXRlT3B0aW9ucyA9IGpRdWVyeUluc3RhbmNlWydleHRlbmQnXSh7ICdrb0JpbmRpbmdDb250ZXh0JzogYmluZGluZ0NvbnRleHQgfSwgb3B0aW9uc1sndGVtcGxhdGVPcHRpb25zJ10pO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0Tm9kZXMgPSBleGVjdXRlVGVtcGxhdGUocHJlY29tcGlsZWQsIGRhdGEsIGpRdWVyeVRlbXBsYXRlT3B0aW9ucyk7XG4gICAgICAgICAgICByZXN1bHROb2Rlc1snYXBwZW5kVG8nXSh0ZW1wbGF0ZURvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpOyAvLyBVc2luZyBcImFwcGVuZFRvXCIgZm9yY2VzIGpRdWVyeS9qUXVlcnkudG1wbCB0byBwZXJmb3JtIG5lY2Vzc2FyeSBjbGVhbnVwIHdvcmtcblxuICAgICAgICAgICAgalF1ZXJ5SW5zdGFuY2VbJ2ZyYWdtZW50cyddID0ge307IC8vIENsZWFyIGpRdWVyeSdzIGZyYWdtZW50IGNhY2hlIHRvIGF2b2lkIGEgbWVtb3J5IGxlYWsgYWZ0ZXIgYSBsYXJnZSBudW1iZXIgb2YgdGVtcGxhdGUgcmVuZGVyc1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXNbJ2NyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jayddID0gZnVuY3Rpb24oc2NyaXB0KSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ7e2tvX2NvZGUgKChmdW5jdGlvbigpIHsgcmV0dXJuIFwiICsgc2NyaXB0ICsgXCIgfSkoKSkgfX1cIjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzWydhZGRUZW1wbGF0ZSddID0gZnVuY3Rpb24odGVtcGxhdGVOYW1lLCB0ZW1wbGF0ZU1hcmt1cCkge1xuICAgICAgICAgICAgZG9jdW1lbnQud3JpdGUoXCI8c2NyaXB0IHR5cGU9J3RleHQvaHRtbCcgaWQ9J1wiICsgdGVtcGxhdGVOYW1lICsgXCInPlwiICsgdGVtcGxhdGVNYXJrdXAgKyBcIjxcIiArIFwiL3NjcmlwdD5cIik7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGpRdWVyeVRtcGxWZXJzaW9uID4gMCkge1xuICAgICAgICAgICAgalF1ZXJ5SW5zdGFuY2VbJ3RtcGwnXVsndGFnJ11bJ2tvX2NvZGUnXSA9IHtcbiAgICAgICAgICAgICAgICBvcGVuOiBcIl9fLnB1c2goJDEgfHwgJycpO1wiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgalF1ZXJ5SW5zdGFuY2VbJ3RtcGwnXVsndGFnJ11bJ2tvX3dpdGgnXSA9IHtcbiAgICAgICAgICAgICAgICBvcGVuOiBcIndpdGgoJDEpIHtcIixcbiAgICAgICAgICAgICAgICBjbG9zZTogXCJ9IFwiXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGtvLmpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGUgPSBuZXcga28udGVtcGxhdGVFbmdpbmUoKTtcbiAgICBrby5qcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0ga28uanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lO1xuXG4gICAgLy8gVXNlIHRoaXMgb25lIGJ5IGRlZmF1bHQgKm9ubHkgaWYganF1ZXJ5LnRtcGwgaXMgcmVmZXJlbmNlZCpcbiAgICB2YXIganF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lSW5zdGFuY2UgPSBuZXcga28uanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lKCk7XG4gICAgaWYgKGpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZUluc3RhbmNlLmpRdWVyeVRtcGxWZXJzaW9uID4gMClcbiAgICAgICAga28uc2V0VGVtcGxhdGVFbmdpbmUoanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lSW5zdGFuY2UpO1xuXG4gICAga28uZXhwb3J0U3ltYm9sKCdqcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmUnLCBrby5qcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmUpO1xufSkoKTtcbn0pKTtcbn0oKSk7XG59KSgpO1xuIiwiICAvKiBnbG9iYWxzIHJlcXVpcmUsIG1vZHVsZSAqL1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAgICovXG5cbiAgdmFyIHBhdGh0b1JlZ2V4cCA9IHJlcXVpcmUoJ3BhdGgtdG8tcmVnZXhwJyk7XG5cbiAgLyoqXG4gICAqIE1vZHVsZSBleHBvcnRzLlxuICAgKi9cblxuICBtb2R1bGUuZXhwb3J0cyA9IHBhZ2U7XG5cbiAgLyoqXG4gICAqIERldGVjdCBjbGljayBldmVudFxuICAgKi9cbiAgdmFyIGNsaWNrRXZlbnQgPSAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBkb2N1bWVudCkgJiYgZG9jdW1lbnQub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJztcblxuICAvKipcbiAgICogVG8gd29yayBwcm9wZXJseSB3aXRoIHRoZSBVUkxcbiAgICogaGlzdG9yeS5sb2NhdGlvbiBnZW5lcmF0ZWQgcG9seWZpbGwgaW4gaHR0cHM6Ly9naXRodWIuY29tL2Rldm90ZS9IVE1MNS1IaXN0b3J5LUFQSVxuICAgKi9cblxuICB2YXIgbG9jYXRpb24gPSAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB3aW5kb3cpICYmICh3aW5kb3cuaGlzdG9yeS5sb2NhdGlvbiB8fCB3aW5kb3cubG9jYXRpb24pO1xuXG4gIC8qKlxuICAgKiBQZXJmb3JtIGluaXRpYWwgZGlzcGF0Y2guXG4gICAqL1xuXG4gIHZhciBkaXNwYXRjaCA9IHRydWU7XG5cblxuICAvKipcbiAgICogRGVjb2RlIFVSTCBjb21wb25lbnRzIChxdWVyeSBzdHJpbmcsIHBhdGhuYW1lLCBoYXNoKS5cbiAgICogQWNjb21tb2RhdGVzIGJvdGggcmVndWxhciBwZXJjZW50IGVuY29kaW5nIGFuZCB4LXd3dy1mb3JtLXVybGVuY29kZWQgZm9ybWF0LlxuICAgKi9cbiAgdmFyIGRlY29kZVVSTENvbXBvbmVudHMgPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBCYXNlIHBhdGguXG4gICAqL1xuXG4gIHZhciBiYXNlID0gJyc7XG5cbiAgLyoqXG4gICAqIFJ1bm5pbmcgZmxhZy5cbiAgICovXG5cbiAgdmFyIHJ1bm5pbmc7XG5cbiAgLyoqXG4gICAqIEhhc2hCYW5nIG9wdGlvblxuICAgKi9cblxuICB2YXIgaGFzaGJhbmcgPSBmYWxzZTtcblxuICAvKipcbiAgICogUHJldmlvdXMgY29udGV4dCwgZm9yIGNhcHR1cmluZ1xuICAgKiBwYWdlIGV4aXQgZXZlbnRzLlxuICAgKi9cblxuICB2YXIgcHJldkNvbnRleHQ7XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGBwYXRoYCB3aXRoIGNhbGxiYWNrIGBmbigpYCxcbiAgICogb3Igcm91dGUgYHBhdGhgLCBvciByZWRpcmVjdGlvbixcbiAgICogb3IgYHBhZ2Uuc3RhcnQoKWAuXG4gICAqXG4gICAqICAgcGFnZShmbik7XG4gICAqICAgcGFnZSgnKicsIGZuKTtcbiAgICogICBwYWdlKCcvdXNlci86aWQnLCBsb2FkLCB1c2VyKTtcbiAgICogICBwYWdlKCcvdXNlci8nICsgdXNlci5pZCwgeyBzb21lOiAndGhpbmcnIH0pO1xuICAgKiAgIHBhZ2UoJy91c2VyLycgKyB1c2VyLmlkKTtcbiAgICogICBwYWdlKCcvZnJvbScsICcvdG8nKVxuICAgKiAgIHBhZ2UoKTtcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHBhdGhcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4uLi5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gcGFnZShwYXRoLCBmbikge1xuICAgIC8vIDxjYWxsYmFjaz5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHJldHVybiBwYWdlKCcqJywgcGF0aCk7XG4gICAgfVxuXG4gICAgLy8gcm91dGUgPHBhdGg+IHRvIDxjYWxsYmFjayAuLi4+XG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBmbikge1xuICAgICAgdmFyIHJvdXRlID0gbmV3IFJvdXRlKHBhdGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcGFnZS5jYWxsYmFja3MucHVzaChyb3V0ZS5taWRkbGV3YXJlKGFyZ3VtZW50c1tpXSkpO1xuICAgICAgfVxuICAgICAgLy8gc2hvdyA8cGF0aD4gd2l0aCBbc3RhdGVdXG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHBhZ2VbJ3N0cmluZycgPT09IHR5cGVvZiBmbiA/ICdyZWRpcmVjdCcgOiAnc2hvdyddKHBhdGgsIGZuKTtcbiAgICAgIC8vIHN0YXJ0IFtvcHRpb25zXVxuICAgIH0gZWxzZSB7XG4gICAgICBwYWdlLnN0YXJ0KHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmdW5jdGlvbnMuXG4gICAqL1xuXG4gIHBhZ2UuY2FsbGJhY2tzID0gW107XG4gIHBhZ2UuZXhpdHMgPSBbXTtcblxuICAvKipcbiAgICogQ3VycmVudCBwYXRoIGJlaW5nIHByb2Nlc3NlZFxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgcGFnZS5jdXJyZW50ID0gJyc7XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBwYWdlcyBuYXZpZ2F0ZWQgdG8uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqXG4gICAqICAgICBwYWdlLmxlbiA9PSAwO1xuICAgKiAgICAgcGFnZSgnL2xvZ2luJyk7XG4gICAqICAgICBwYWdlLmxlbiA9PSAxO1xuICAgKi9cblxuICBwYWdlLmxlbiA9IDA7XG5cbiAgLyoqXG4gICAqIEdldCBvciBzZXQgYmFzZXBhdGggdG8gYHBhdGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLmJhc2UgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgaWYgKDAgPT09IGFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBiYXNlO1xuICAgIGJhc2UgPSBwYXRoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBCaW5kIHdpdGggdGhlIGdpdmVuIGBvcHRpb25zYC5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogICAgLSBgY2xpY2tgIGJpbmQgdG8gY2xpY2sgZXZlbnRzIFt0cnVlXVxuICAgKiAgICAtIGBwb3BzdGF0ZWAgYmluZCB0byBwb3BzdGF0ZSBbdHJ1ZV1cbiAgICogICAgLSBgZGlzcGF0Y2hgIHBlcmZvcm0gaW5pdGlhbCBkaXNwYXRjaCBbdHJ1ZV1cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zdGFydCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAocnVubmluZykgcmV0dXJuO1xuICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgIGlmIChmYWxzZSA9PT0gb3B0aW9ucy5kaXNwYXRjaCkgZGlzcGF0Y2ggPSBmYWxzZTtcbiAgICBpZiAoZmFsc2UgPT09IG9wdGlvbnMuZGVjb2RlVVJMQ29tcG9uZW50cykgZGVjb2RlVVJMQ29tcG9uZW50cyA9IGZhbHNlO1xuICAgIGlmIChmYWxzZSAhPT0gb3B0aW9ucy5wb3BzdGF0ZSkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgb25wb3BzdGF0ZSwgZmFsc2UpO1xuICAgIGlmIChmYWxzZSAhPT0gb3B0aW9ucy5jbGljaykge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50LCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgfVxuICAgIGlmICh0cnVlID09PSBvcHRpb25zLmhhc2hiYW5nKSBoYXNoYmFuZyA9IHRydWU7XG4gICAgaWYgKCFkaXNwYXRjaCkgcmV0dXJuO1xuICAgIHZhciB1cmwgPSAoaGFzaGJhbmcgJiYgfmxvY2F0aW9uLmhhc2guaW5kZXhPZignIyEnKSkgPyBsb2NhdGlvbi5oYXNoLnN1YnN0cigyKSArIGxvY2F0aW9uLnNlYXJjaCA6IGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoICsgbG9jYXRpb24uaGFzaDtcbiAgICBwYWdlLnJlcGxhY2UodXJsLCBudWxsLCB0cnVlLCBkaXNwYXRjaCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFVuYmluZCBjbGljayBhbmQgcG9wc3RhdGUgZXZlbnQgaGFuZGxlcnMuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2Uuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghcnVubmluZykgcmV0dXJuO1xuICAgIHBhZ2UuY3VycmVudCA9ICcnO1xuICAgIHBhZ2UubGVuID0gMDtcbiAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50LCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgb25wb3BzdGF0ZSwgZmFsc2UpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTaG93IGBwYXRoYCB3aXRoIG9wdGlvbmFsIGBzdGF0ZWAgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGVcbiAgICogQHBhcmFtIHtCb29sZWFufSBkaXNwYXRjaFxuICAgKiBAcmV0dXJuIHtDb250ZXh0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnNob3cgPSBmdW5jdGlvbihwYXRoLCBzdGF0ZSwgZGlzcGF0Y2gsIHB1c2gpIHtcbiAgICB2YXIgY3R4ID0gbmV3IENvbnRleHQocGF0aCwgc3RhdGUpO1xuICAgIHBhZ2UuY3VycmVudCA9IGN0eC5wYXRoO1xuICAgIGlmIChmYWxzZSAhPT0gZGlzcGF0Y2gpIHBhZ2UuZGlzcGF0Y2goY3R4KTtcbiAgICBpZiAoZmFsc2UgIT09IGN0eC5oYW5kbGVkICYmIGZhbHNlICE9PSBwdXNoKSBjdHgucHVzaFN0YXRlKCk7XG4gICAgcmV0dXJuIGN0eDtcbiAgfTtcblxuICAvKipcbiAgICogR29lcyBiYWNrIGluIHRoZSBoaXN0b3J5XG4gICAqIEJhY2sgc2hvdWxkIGFsd2F5cyBsZXQgdGhlIGN1cnJlbnQgcm91dGUgcHVzaCBzdGF0ZSBhbmQgdGhlbiBnbyBiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIGZhbGxiYWNrIHBhdGggdG8gZ28gYmFjayBpZiBubyBtb3JlIGhpc3RvcnkgZXhpc3RzLCBpZiB1bmRlZmluZWQgZGVmYXVsdHMgdG8gcGFnZS5iYXNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhdGVdXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2UuYmFjayA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlKSB7XG4gICAgaWYgKHBhZ2UubGVuID4gMCkge1xuICAgICAgLy8gdGhpcyBtYXkgbmVlZCBtb3JlIHRlc3RpbmcgdG8gc2VlIGlmIGFsbCBicm93c2Vyc1xuICAgICAgLy8gd2FpdCBmb3IgdGhlIG5leHQgdGljayB0byBnbyBiYWNrIGluIGhpc3RvcnlcbiAgICAgIGhpc3RvcnkuYmFjaygpO1xuICAgICAgcGFnZS5sZW4tLTtcbiAgICB9IGVsc2UgaWYgKHBhdGgpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2Uuc2hvdyhwYXRoLCBzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9ZWxzZXtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2Uuc2hvdyhiYXNlLCBzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogUmVnaXN0ZXIgcm91dGUgdG8gcmVkaXJlY3QgZnJvbSBvbmUgcGF0aCB0byBvdGhlclxuICAgKiBvciBqdXN0IHJlZGlyZWN0IHRvIGFub3RoZXIgcm91dGVcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGZyb20gLSBpZiBwYXJhbSAndG8nIGlzIHVuZGVmaW5lZCByZWRpcmVjdHMgdG8gJ2Zyb20nXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbdG9dXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBwYWdlLnJlZGlyZWN0ID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICAvLyBEZWZpbmUgcm91dGUgZnJvbSBhIHBhdGggdG8gYW5vdGhlclxuICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGZyb20gJiYgJ3N0cmluZycgPT09IHR5cGVvZiB0bykge1xuICAgICAgcGFnZShmcm9tLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcGFnZS5yZXBsYWNlKHRvKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgcHVzaCBzdGF0ZSBhbmQgcmVwbGFjZSBpdCB3aXRoIGFub3RoZXJcbiAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBmcm9tICYmICd1bmRlZmluZWQnID09PSB0eXBlb2YgdG8pIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2UucmVwbGFjZShmcm9tKTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUmVwbGFjZSBgcGF0aGAgd2l0aCBvcHRpb25hbCBgc3RhdGVgIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlXG4gICAqIEByZXR1cm4ge0NvbnRleHR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG5cbiAgcGFnZS5yZXBsYWNlID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUsIGluaXQsIGRpc3BhdGNoKSB7XG4gICAgdmFyIGN0eCA9IG5ldyBDb250ZXh0KHBhdGgsIHN0YXRlKTtcbiAgICBwYWdlLmN1cnJlbnQgPSBjdHgucGF0aDtcbiAgICBjdHguaW5pdCA9IGluaXQ7XG4gICAgY3R4LnNhdmUoKTsgLy8gc2F2ZSBiZWZvcmUgZGlzcGF0Y2hpbmcsIHdoaWNoIG1heSByZWRpcmVjdFxuICAgIGlmIChmYWxzZSAhPT0gZGlzcGF0Y2gpIHBhZ2UuZGlzcGF0Y2goY3R4KTtcbiAgICByZXR1cm4gY3R4O1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNwYXRjaCB0aGUgZ2l2ZW4gYGN0eGAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdHhcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHBhZ2UuZGlzcGF0Y2ggPSBmdW5jdGlvbihjdHgpIHtcbiAgICB2YXIgcHJldiA9IHByZXZDb250ZXh0LFxuICAgICAgaSA9IDAsXG4gICAgICBqID0gMDtcblxuICAgIHByZXZDb250ZXh0ID0gY3R4O1xuXG4gICAgZnVuY3Rpb24gbmV4dEV4aXQoKSB7XG4gICAgICB2YXIgZm4gPSBwYWdlLmV4aXRzW2orK107XG4gICAgICBpZiAoIWZuKSByZXR1cm4gbmV4dEVudGVyKCk7XG4gICAgICBmbihwcmV2LCBuZXh0RXhpdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dEVudGVyKCkge1xuICAgICAgdmFyIGZuID0gcGFnZS5jYWxsYmFja3NbaSsrXTtcblxuICAgICAgaWYgKGN0eC5wYXRoICE9PSBwYWdlLmN1cnJlbnQpIHtcbiAgICAgICAgY3R4LmhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCFmbikgcmV0dXJuIHVuaGFuZGxlZChjdHgpO1xuICAgICAgZm4oY3R4LCBuZXh0RW50ZXIpO1xuICAgIH1cblxuICAgIGlmIChwcmV2KSB7XG4gICAgICBuZXh0RXhpdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0RW50ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFVuaGFuZGxlZCBgY3R4YC4gV2hlbiBpdCdzIG5vdCB0aGUgaW5pdGlhbFxuICAgKiBwb3BzdGF0ZSB0aGVuIHJlZGlyZWN0LiBJZiB5b3Ugd2lzaCB0byBoYW5kbGVcbiAgICogNDA0cyBvbiB5b3VyIG93biB1c2UgYHBhZ2UoJyonLCBjYWxsYmFjaylgLlxuICAgKlxuICAgKiBAcGFyYW0ge0NvbnRleHR9IGN0eFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gdW5oYW5kbGVkKGN0eCkge1xuICAgIGlmIChjdHguaGFuZGxlZCkgcmV0dXJuO1xuICAgIHZhciBjdXJyZW50O1xuXG4gICAgaWYgKGhhc2hiYW5nKSB7XG4gICAgICBjdXJyZW50ID0gYmFzZSArIGxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIyEnLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnQgPSBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaDtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudCA9PT0gY3R4LmNhbm9uaWNhbFBhdGgpIHJldHVybjtcbiAgICBwYWdlLnN0b3AoKTtcbiAgICBjdHguaGFuZGxlZCA9IGZhbHNlO1xuICAgIGxvY2F0aW9uLmhyZWYgPSBjdHguY2Fub25pY2FsUGF0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBleGl0IHJvdXRlIG9uIGBwYXRoYCB3aXRoXG4gICAqIGNhbGxiYWNrIGBmbigpYCwgd2hpY2ggd2lsbCBiZSBjYWxsZWRcbiAgICogb24gdGhlIHByZXZpb3VzIGNvbnRleHQgd2hlbiBhIG5ld1xuICAgKiBwYWdlIGlzIHZpc2l0ZWQuXG4gICAqL1xuICBwYWdlLmV4aXQgPSBmdW5jdGlvbihwYXRoLCBmbikge1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHBhZ2UuZXhpdCgnKicsIHBhdGgpO1xuICAgIH1cblxuICAgIHZhciByb3V0ZSA9IG5ldyBSb3V0ZShwYXRoKTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgcGFnZS5leGl0cy5wdXNoKHJvdXRlLm1pZGRsZXdhcmUoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgVVJMIGVuY29kaW5nIGZyb20gdGhlIGdpdmVuIGBzdHJgLlxuICAgKiBBY2NvbW1vZGF0ZXMgd2hpdGVzcGFjZSBpbiBib3RoIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAgKiBhbmQgcmVndWxhciBwZXJjZW50LWVuY29kZWQgZm9ybS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJ9IFVSTCBjb21wb25lbnQgdG8gZGVjb2RlXG4gICAqL1xuICBmdW5jdGlvbiBkZWNvZGVVUkxFbmNvZGVkVVJJQ29tcG9uZW50KHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykgeyByZXR1cm4gdmFsOyB9XG4gICAgcmV0dXJuIGRlY29kZVVSTENvbXBvbmVudHMgPyBkZWNvZGVVUklDb21wb25lbnQodmFsLnJlcGxhY2UoL1xcKy9nLCAnICcpKSA6IHZhbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGEgbmV3IFwicmVxdWVzdFwiIGBDb250ZXh0YFxuICAgKiB3aXRoIHRoZSBnaXZlbiBgcGF0aGAgYW5kIG9wdGlvbmFsIGluaXRpYWwgYHN0YXRlYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIENvbnRleHQocGF0aCwgc3RhdGUpIHtcbiAgICBpZiAoJy8nID09PSBwYXRoWzBdICYmIDAgIT09IHBhdGguaW5kZXhPZihiYXNlKSkgcGF0aCA9IGJhc2UgKyAoaGFzaGJhbmcgPyAnIyEnIDogJycpICsgcGF0aDtcbiAgICB2YXIgaSA9IHBhdGguaW5kZXhPZignPycpO1xuXG4gICAgdGhpcy5jYW5vbmljYWxQYXRoID0gcGF0aDtcbiAgICB0aGlzLnBhdGggPSBwYXRoLnJlcGxhY2UoYmFzZSwgJycpIHx8ICcvJztcbiAgICBpZiAoaGFzaGJhbmcpIHRoaXMucGF0aCA9IHRoaXMucGF0aC5yZXBsYWNlKCcjIScsICcnKSB8fCAnLyc7XG5cbiAgICB0aGlzLnRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuICAgIHRoaXMuc3RhdGUucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5xdWVyeXN0cmluZyA9IH5pID8gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudChwYXRoLnNsaWNlKGkgKyAxKSkgOiAnJztcbiAgICB0aGlzLnBhdGhuYW1lID0gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudCh+aSA/IHBhdGguc2xpY2UoMCwgaSkgOiBwYXRoKTtcbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xuXG4gICAgLy8gZnJhZ21lbnRcbiAgICB0aGlzLmhhc2ggPSAnJztcbiAgICBpZiAoIWhhc2hiYW5nKSB7XG4gICAgICBpZiAoIX50aGlzLnBhdGguaW5kZXhPZignIycpKSByZXR1cm47XG4gICAgICB2YXIgcGFydHMgPSB0aGlzLnBhdGguc3BsaXQoJyMnKTtcbiAgICAgIHRoaXMucGF0aCA9IHBhcnRzWzBdO1xuICAgICAgdGhpcy5oYXNoID0gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudChwYXJ0c1sxXSkgfHwgJyc7XG4gICAgICB0aGlzLnF1ZXJ5c3RyaW5nID0gdGhpcy5xdWVyeXN0cmluZy5zcGxpdCgnIycpWzBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgYENvbnRleHRgLlxuICAgKi9cblxuICBwYWdlLkNvbnRleHQgPSBDb250ZXh0O1xuXG4gIC8qKlxuICAgKiBQdXNoIHN0YXRlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgQ29udGV4dC5wcm90b3R5cGUucHVzaFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcGFnZS5sZW4rKztcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSh0aGlzLnN0YXRlLCB0aGlzLnRpdGxlLCBoYXNoYmFuZyAmJiB0aGlzLnBhdGggIT09ICcvJyA/ICcjIScgKyB0aGlzLnBhdGggOiB0aGlzLmNhbm9uaWNhbFBhdGgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTYXZlIHRoZSBjb250ZXh0IHN0YXRlLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBDb250ZXh0LnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUodGhpcy5zdGF0ZSwgdGhpcy50aXRsZSwgaGFzaGJhbmcgJiYgdGhpcy5wYXRoICE9PSAnLycgPyAnIyEnICsgdGhpcy5wYXRoIDogdGhpcy5jYW5vbmljYWxQYXRoKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBgUm91dGVgIHdpdGggdGhlIGdpdmVuIEhUVFAgYHBhdGhgLFxuICAgKiBhbmQgYW4gYXJyYXkgb2YgYGNhbGxiYWNrc2AgYW5kIGBvcHRpb25zYC5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogICAtIGBzZW5zaXRpdmVgICAgIGVuYWJsZSBjYXNlLXNlbnNpdGl2ZSByb3V0ZXNcbiAgICogICAtIGBzdHJpY3RgICAgICAgIGVuYWJsZSBzdHJpY3QgbWF0Y2hpbmcgZm9yIHRyYWlsaW5nIHNsYXNoZXNcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBSb3V0ZShwYXRoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5wYXRoID0gKHBhdGggPT09ICcqJykgPyAnKC4qKScgOiBwYXRoO1xuICAgIHRoaXMubWV0aG9kID0gJ0dFVCc7XG4gICAgdGhpcy5yZWdleHAgPSBwYXRodG9SZWdleHAodGhpcy5wYXRoLFxuICAgICAgdGhpcy5rZXlzID0gW10sXG4gICAgICBvcHRpb25zLnNlbnNpdGl2ZSxcbiAgICAgIG9wdGlvbnMuc3RyaWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgYFJvdXRlYC5cbiAgICovXG5cbiAgcGFnZS5Sb3V0ZSA9IFJvdXRlO1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gcm91dGUgbWlkZGxld2FyZSB3aXRoXG4gICAqIHRoZSBnaXZlbiBjYWxsYmFjayBgZm4oKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBSb3V0ZS5wcm90b3R5cGUubWlkZGxld2FyZSA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihjdHgsIG5leHQpIHtcbiAgICAgIGlmIChzZWxmLm1hdGNoKGN0eC5wYXRoLCBjdHgucGFyYW1zKSkgcmV0dXJuIGZuKGN0eCwgbmV4dCk7XG4gICAgICBuZXh0KCk7XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhpcyByb3V0ZSBtYXRjaGVzIGBwYXRoYCwgaWYgc29cbiAgICogcG9wdWxhdGUgYHBhcmFtc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFJvdXRlLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uKHBhdGgsIHBhcmFtcykge1xuICAgIHZhciBrZXlzID0gdGhpcy5rZXlzLFxuICAgICAgcXNJbmRleCA9IHBhdGguaW5kZXhPZignPycpLFxuICAgICAgcGF0aG5hbWUgPSB+cXNJbmRleCA/IHBhdGguc2xpY2UoMCwgcXNJbmRleCkgOiBwYXRoLFxuICAgICAgbSA9IHRoaXMucmVnZXhwLmV4ZWMoZGVjb2RlVVJJQ29tcG9uZW50KHBhdGhuYW1lKSk7XG5cbiAgICBpZiAoIW0pIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAxLCBsZW4gPSBtLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpIC0gMV07XG4gICAgICB2YXIgdmFsID0gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudChtW2ldKTtcbiAgICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCB8fCAhKGhhc093blByb3BlcnR5LmNhbGwocGFyYW1zLCBrZXkubmFtZSkpKSB7XG4gICAgICAgIHBhcmFtc1trZXkubmFtZV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvKipcbiAgICogSGFuZGxlIFwicG9wdWxhdGVcIiBldmVudHMuXG4gICAqL1xuXG4gIHZhciBvbnBvcHN0YXRlID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbG9hZGVkID0gZmFsc2U7XG4gICAgaWYgKCd1bmRlZmluZWQnID09PSB0eXBlb2Ygd2luZG93KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICBsb2FkZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgICAgIH0sIDApO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiBvbnBvcHN0YXRlKGUpIHtcbiAgICAgIGlmICghbG9hZGVkKSByZXR1cm47XG4gICAgICBpZiAoZS5zdGF0ZSkge1xuICAgICAgICB2YXIgcGF0aCA9IGUuc3RhdGUucGF0aDtcbiAgICAgICAgcGFnZS5yZXBsYWNlKHBhdGgsIGUuc3RhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFnZS5zaG93KGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uaGFzaCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSgpO1xuICAvKipcbiAgICogSGFuZGxlIFwiY2xpY2tcIiBldmVudHMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uY2xpY2soZSkge1xuXG4gICAgaWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cbiAgICBpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG4gICAgaWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cblxuICAgIC8vIGVuc3VyZSBsaW5rXG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgd2hpbGUgKGVsICYmICdBJyAhPT0gZWwubm9kZU5hbWUpIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICBpZiAoIWVsIHx8ICdBJyAhPT0gZWwubm9kZU5hbWUpIHJldHVybjtcblxuXG5cbiAgICAvLyBJZ25vcmUgaWYgdGFnIGhhc1xuICAgIC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcbiAgICAvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJykgcmV0dXJuO1xuXG4gICAgLy8gZW5zdXJlIG5vbi1oYXNoIGZvciB0aGUgc2FtZSBwYXRoXG4gICAgdmFyIGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoIWhhc2hiYW5nICYmIGVsLnBhdGhuYW1lID09PSBsb2NhdGlvbi5wYXRobmFtZSAmJiAoZWwuaGFzaCB8fCAnIycgPT09IGxpbmspKSByZXR1cm47XG5cblxuXG4gICAgLy8gQ2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcbiAgICBpZiAobGluayAmJiBsaW5rLmluZGV4T2YoJ21haWx0bzonKSA+IC0xKSByZXR1cm47XG5cbiAgICAvLyBjaGVjayB0YXJnZXRcbiAgICBpZiAoZWwudGFyZ2V0KSByZXR1cm47XG5cbiAgICAvLyB4LW9yaWdpblxuICAgIGlmICghc2FtZU9yaWdpbihlbC5ocmVmKSkgcmV0dXJuO1xuXG5cblxuICAgIC8vIHJlYnVpbGQgcGF0aFxuICAgIHZhciBwYXRoID0gZWwucGF0aG5hbWUgKyBlbC5zZWFyY2ggKyAoZWwuaGFzaCB8fCAnJyk7XG5cbiAgICAvLyBzdHJpcCBsZWFkaW5nIFwiL1tkcml2ZSBsZXR0ZXJdOlwiIG9uIE5XLmpzIG9uIFdpbmRvd3NcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHBhdGgubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuICAgICAgcGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sICcvJyk7XG4gICAgfVxuXG4gICAgLy8gc2FtZSBwYWdlXG4gICAgdmFyIG9yaWcgPSBwYXRoO1xuXG4gICAgaWYgKHBhdGguaW5kZXhPZihiYXNlKSA9PT0gMCkge1xuICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKGJhc2UubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZiAoaGFzaGJhbmcpIHBhdGggPSBwYXRoLnJlcGxhY2UoJyMhJywgJycpO1xuXG4gICAgaWYgKGJhc2UgJiYgb3JpZyA9PT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHBhZ2Uuc2hvdyhvcmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBidXR0b24uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHdoaWNoKGUpIHtcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgcmV0dXJuIG51bGwgPT09IGUud2hpY2ggPyBlLmJ1dHRvbiA6IGUud2hpY2g7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGhyZWZgIGlzIHRoZSBzYW1lIG9yaWdpbi5cbiAgICovXG5cbiAgZnVuY3Rpb24gc2FtZU9yaWdpbihocmVmKSB7XG4gICAgdmFyIG9yaWdpbiA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3RuYW1lO1xuICAgIGlmIChsb2NhdGlvbi5wb3J0KSBvcmlnaW4gKz0gJzonICsgbG9jYXRpb24ucG9ydDtcbiAgICByZXR1cm4gKGhyZWYgJiYgKDAgPT09IGhyZWYuaW5kZXhPZihvcmlnaW4pKSk7XG4gIH1cblxuICBwYWdlLnNhbWVPcmlnaW4gPSBzYW1lT3JpZ2luO1xuIiwidmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5Jyk7XG5cbi8qKlxuICogRXhwb3NlIGBwYXRoVG9SZWdleHBgLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhUb1JlZ2V4cDtcblxuLyoqXG4gKiBUaGUgbWFpbiBwYXRoIG1hdGNoaW5nIHJlZ2V4cCB1dGlsaXR5LlxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbnZhciBQQVRIX1JFR0VYUCA9IG5ldyBSZWdFeHAoW1xuICAvLyBNYXRjaCBlc2NhcGVkIGNoYXJhY3RlcnMgdGhhdCB3b3VsZCBvdGhlcndpc2UgYXBwZWFyIGluIGZ1dHVyZSBtYXRjaGVzLlxuICAvLyBUaGlzIGFsbG93cyB0aGUgdXNlciB0byBlc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgd29uJ3QgdHJhbnNmb3JtLlxuICAnKFxcXFxcXFxcLiknLFxuICAvLyBNYXRjaCBFeHByZXNzLXN0eWxlIHBhcmFtZXRlcnMgYW5kIHVuLW5hbWVkIHBhcmFtZXRlcnMgd2l0aCBhIHByZWZpeFxuICAvLyBhbmQgb3B0aW9uYWwgc3VmZml4ZXMuIE1hdGNoZXMgYXBwZWFyIGFzOlxuICAvL1xuICAvLyBcIi86dGVzdChcXFxcZCspP1wiID0+IFtcIi9cIiwgXCJ0ZXN0XCIsIFwiXFxkK1wiLCB1bmRlZmluZWQsIFwiP1wiXVxuICAvLyBcIi9yb3V0ZShcXFxcZCspXCIgPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiXFxkK1wiLCB1bmRlZmluZWRdXG4gICcoW1xcXFwvLl0pPyg/OlxcXFw6KFxcXFx3KykoPzpcXFxcKCgoPzpcXFxcXFxcXC58W14pXSkqKVxcXFwpKT98XFxcXCgoKD86XFxcXFxcXFwufFteKV0pKilcXFxcKSkoWysqP10pPycsXG4gIC8vIE1hdGNoIHJlZ2V4cCBzcGVjaWFsIGNoYXJhY3RlcnMgdGhhdCBhcmUgYWx3YXlzIGVzY2FwZWQuXG4gICcoWy4rKj89XiE6JHt9KClbXFxcXF18XFxcXC9dKSdcbl0uam9pbignfCcpLCAnZycpO1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgY2FwdHVyaW5nIGdyb3VwIGJ5IGVzY2FwaW5nIHNwZWNpYWwgY2hhcmFjdGVycyBhbmQgbWVhbmluZy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGdyb3VwXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZUdyb3VwIChncm91cCkge1xuICByZXR1cm4gZ3JvdXAucmVwbGFjZSgvKFs9ITokXFwvKCldKS9nLCAnXFxcXCQxJyk7XG59XG5cbi8qKlxuICogQXR0YWNoIHRoZSBrZXlzIGFzIGEgcHJvcGVydHkgb2YgdGhlIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHtSZWdFeHB9IHJlXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXR0YWNoS2V5cyAocmUsIGtleXMpIHtcbiAgcmUua2V5cyA9IGtleXM7XG4gIHJldHVybiByZTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZsYWdzIGZvciBhIHJlZ2V4cCBmcm9tIHRoZSBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBmbGFncyAob3B0aW9ucykge1xuICByZXR1cm4gb3B0aW9ucy5zZW5zaXRpdmUgPyAnJyA6ICdpJztcbn1cblxuLyoqXG4gKiBQdWxsIG91dCBrZXlzIGZyb20gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcmVnZXhwVG9SZWdleHAgKHBhdGgsIGtleXMpIHtcbiAgLy8gVXNlIGEgbmVnYXRpdmUgbG9va2FoZWFkIHRvIG1hdGNoIG9ubHkgY2FwdHVyaW5nIGdyb3Vwcy5cbiAgdmFyIGdyb3VwcyA9IHBhdGguc291cmNlLm1hdGNoKC9cXCgoPyFcXD8pL2cpO1xuXG4gIGlmIChncm91cHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKykge1xuICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgbmFtZTogICAgICBpLFxuICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgIG9wdGlvbmFsOiAgZmFsc2UsXG4gICAgICAgIHJlcGVhdDogICAgZmFsc2VcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHBhdGgsIGtleXMpO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhbiBhcnJheSBpbnRvIGEgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXJyYXlUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICB2YXIgcGFydHMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICBwYXJ0cy5wdXNoKHBhdGhUb1JlZ2V4cChwYXRoW2ldLCBrZXlzLCBvcHRpb25zKS5zb3VyY2UpO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJyg/OicgKyBwYXJ0cy5qb2luKCd8JykgKyAnKScsIGZsYWdzKG9wdGlvbnMpKTtcbiAgcmV0dXJuIGF0dGFjaEtleXMocmVnZXhwLCBrZXlzKTtcbn1cblxuLyoqXG4gKiBSZXBsYWNlIHRoZSBzcGVjaWZpYyB0YWdzIHdpdGggcmVnZXhwIHN0cmluZ3MuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gcmVwbGFjZVBhdGggKHBhdGgsIGtleXMpIHtcbiAgdmFyIGluZGV4ID0gMDtcblxuICBmdW5jdGlvbiByZXBsYWNlIChfLCBlc2NhcGVkLCBwcmVmaXgsIGtleSwgY2FwdHVyZSwgZ3JvdXAsIHN1ZmZpeCwgZXNjYXBlKSB7XG4gICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgIHJldHVybiBlc2NhcGVkO1xuICAgIH1cblxuICAgIGlmIChlc2NhcGUpIHtcbiAgICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGU7XG4gICAgfVxuXG4gICAgdmFyIHJlcGVhdCAgID0gc3VmZml4ID09PSAnKycgfHwgc3VmZml4ID09PSAnKic7XG4gICAgdmFyIG9wdGlvbmFsID0gc3VmZml4ID09PSAnPycgfHwgc3VmZml4ID09PSAnKic7XG5cbiAgICBrZXlzLnB1c2goe1xuICAgICAgbmFtZTogICAgICBrZXkgfHwgaW5kZXgrKyxcbiAgICAgIGRlbGltaXRlcjogcHJlZml4IHx8ICcvJyxcbiAgICAgIG9wdGlvbmFsOiAgb3B0aW9uYWwsXG4gICAgICByZXBlYXQ6ICAgIHJlcGVhdFxuICAgIH0pO1xuXG4gICAgcHJlZml4ID0gcHJlZml4ID8gKCdcXFxcJyArIHByZWZpeCkgOiAnJztcbiAgICBjYXB0dXJlID0gZXNjYXBlR3JvdXAoY2FwdHVyZSB8fCBncm91cCB8fCAnW14nICsgKHByZWZpeCB8fCAnXFxcXC8nKSArICddKz8nKTtcblxuICAgIGlmIChyZXBlYXQpIHtcbiAgICAgIGNhcHR1cmUgPSBjYXB0dXJlICsgJyg/OicgKyBwcmVmaXggKyBjYXB0dXJlICsgJykqJztcbiAgICB9XG5cbiAgICBpZiAob3B0aW9uYWwpIHtcbiAgICAgIHJldHVybiAnKD86JyArIHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKSk/JztcbiAgICB9XG5cbiAgICAvLyBCYXNpYyBwYXJhbWV0ZXIgc3VwcG9ydC5cbiAgICByZXR1cm4gcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpJztcbiAgfVxuXG4gIHJldHVybiBwYXRoLnJlcGxhY2UoUEFUSF9SRUdFWFAsIHJlcGxhY2UpO1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgZ2l2ZW4gcGF0aCBzdHJpbmcsIHJldHVybmluZyBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBBbiBlbXB0eSBhcnJheSBjYW4gYmUgcGFzc2VkIGluIGZvciB0aGUga2V5cywgd2hpY2ggd2lsbCBob2xkIHRoZVxuICogcGxhY2Vob2xkZXIga2V5IGRlc2NyaXB0aW9ucy4gRm9yIGV4YW1wbGUsIHVzaW5nIGAvdXNlci86aWRgLCBga2V5c2Agd2lsbFxuICogY29udGFpbiBgW3sgbmFtZTogJ2lkJywgZGVsaW1pdGVyOiAnLycsIG9wdGlvbmFsOiBmYWxzZSwgcmVwZWF0OiBmYWxzZSB9XWAuXG4gKlxuICogQHBhcmFtICB7KFN0cmluZ3xSZWdFeHB8QXJyYXkpfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgICAgICAgICAgIFtrZXlzXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgICAgICAgICAgICBbb3B0aW9uc11cbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcGF0aFRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIGtleXMgPSBrZXlzIHx8IFtdO1xuXG4gIGlmICghaXNBcnJheShrZXlzKSkge1xuICAgIG9wdGlvbnMgPSBrZXlzO1xuICAgIGtleXMgPSBbXTtcbiAgfSBlbHNlIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIGlmIChwYXRoIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgcmV0dXJuIHJlZ2V4cFRvUmVnZXhwKHBhdGgsIGtleXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkocGF0aCkpIHtcbiAgICByZXR1cm4gYXJyYXlUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKTtcbiAgfVxuXG4gIHZhciBzdHJpY3QgPSBvcHRpb25zLnN0cmljdDtcbiAgdmFyIGVuZCA9IG9wdGlvbnMuZW5kICE9PSBmYWxzZTtcbiAgdmFyIHJvdXRlID0gcmVwbGFjZVBhdGgocGF0aCwga2V5cyk7XG4gIHZhciBlbmRzV2l0aFNsYXNoID0gcGF0aC5jaGFyQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gJy8nO1xuXG4gIC8vIEluIG5vbi1zdHJpY3QgbW9kZSB3ZSBhbGxvdyBhIHNsYXNoIGF0IHRoZSBlbmQgb2YgbWF0Y2guIElmIHRoZSBwYXRoIHRvXG4gIC8vIG1hdGNoIGFscmVhZHkgZW5kcyB3aXRoIGEgc2xhc2gsIHdlIHJlbW92ZSBpdCBmb3IgY29uc2lzdGVuY3kuIFRoZSBzbGFzaFxuICAvLyBpcyB2YWxpZCBhdCB0aGUgZW5kIG9mIGEgcGF0aCBtYXRjaCwgbm90IGluIHRoZSBtaWRkbGUuIFRoaXMgaXMgaW1wb3J0YW50XG4gIC8vIGluIG5vbi1lbmRpbmcgbW9kZSwgd2hlcmUgXCIvdGVzdC9cIiBzaG91bGRuJ3QgbWF0Y2ggXCIvdGVzdC8vcm91dGVcIi5cbiAgaWYgKCFzdHJpY3QpIHtcbiAgICByb3V0ZSA9IChlbmRzV2l0aFNsYXNoID8gcm91dGUuc2xpY2UoMCwgLTIpIDogcm91dGUpICsgJyg/OlxcXFwvKD89JCkpPyc7XG4gIH1cblxuICBpZiAoZW5kKSB7XG4gICAgcm91dGUgKz0gJyQnO1xuICB9IGVsc2Uge1xuICAgIC8vIEluIG5vbi1lbmRpbmcgbW9kZSwgd2UgbmVlZCB0aGUgY2FwdHVyaW5nIGdyb3VwcyB0byBtYXRjaCBhcyBtdWNoIGFzXG4gICAgLy8gcG9zc2libGUgYnkgdXNpbmcgYSBwb3NpdGl2ZSBsb29rYWhlYWQgdG8gdGhlIGVuZCBvciBuZXh0IHBhdGggc2VnbWVudC5cbiAgICByb3V0ZSArPSBzdHJpY3QgJiYgZW5kc1dpdGhTbGFzaCA/ICcnIDogJyg/PVxcXFwvfCQpJztcbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKG5ldyBSZWdFeHAoJ14nICsgcm91dGUsIGZsYWdzKG9wdGlvbnMpKSwga2V5cyk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iXX0=
