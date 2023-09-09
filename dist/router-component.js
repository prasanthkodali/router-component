/*!
  * Router-component v0.16.4
  * https://github.com/markcellus/router-component
  *
  * Copyright (c) 2023 Mark
  * Licensed under the MIT license
 */

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/* istanbul ignore file */


// normalize-selector-rev-02.js
/*
  author: kyle simpson (@getify)
  original source: https://gist.github.com/getify/9679380

  modified for tests by david kaye (@dfkaye)
  21 march 2014

  rev-02 incorporate kyle's changes 3/2/42014
*/

function normalizeSelector(sel) {
  // save unmatched text, if any
  function saveUnmatched() {
    if (unmatched) {
      // whitespace needed after combinator?
      if (tokens.length > 0 && /^[~+>]$/.test(tokens[tokens.length - 1])) {
        tokens.push(" ");
      }

      // save unmatched text
      tokens.push(unmatched);
    }
  }

  var tokens = [],
    match,
    unmatched,
    regex,
    state = [0],
    next_match_idx = 0,
    prev_match_idx,
    not_escaped_pattern = /(?:[^\\]|(?:^|[^\\])(?:\\\\)+)$/,
    whitespace_pattern = /^\s+$/,
    state_patterns = [
      /\s+|\/\*|["'>~+[(]/g, // general
      /\s+|\/\*|["'[\]()]/g, // [..] set
      /\s+|\/\*|["'[\]()]/g, // (..) set
      null, // string literal (placeholder)
      /\*\//g, // comment
    ];
  sel = sel.trim();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    unmatched = "";

    regex = state_patterns[state[state.length - 1]];

    regex.lastIndex = next_match_idx;
    match = regex.exec(sel);

    // matched text to process?
    if (match) {
      prev_match_idx = next_match_idx;
      next_match_idx = regex.lastIndex;

      // collect the previous string chunk not matched before this token
      if (prev_match_idx < next_match_idx - match[0].length) {
        unmatched = sel.substring(
          prev_match_idx,
          next_match_idx - match[0].length
        );
      }

      // general, [ ] pair, ( ) pair?
      if (state[state.length - 1] < 3) {
        saveUnmatched();

        // starting a [ ] pair?
        if (match[0] === "[") {
          state.push(1);
        }
        // starting a ( ) pair?
        else if (match[0] === "(") {
          state.push(2);
        }
        // starting a string literal?
        else if (/^["']$/.test(match[0])) {
          state.push(3);
          state_patterns[3] = new RegExp(match[0], "g");
        }
        // starting a comment?
        else if (match[0] === "/*") {
          state.push(4);
        }
        // ending a [ ] or ( ) pair?
        else if (/^[\])]$/.test(match[0]) && state.length > 0) {
          state.pop();
        }
        // handling whitespace or a combinator?
        else if (/^(?:\s+|[~+>])$/.test(match[0])) {
          // need to insert whitespace before?
          if (
            tokens.length > 0 &&
            !whitespace_pattern.test(tokens[tokens.length - 1]) &&
            state[state.length - 1] === 0
          ) {
            // add normalized whitespace
            tokens.push(" ");
          }

          // case-insensitive attribute selector CSS L4
          if (
            state[state.length - 1] === 1 &&
            tokens.length === 5 &&
            tokens[2].charAt(tokens[2].length - 1) === "="
          ) {
            tokens[4] = " " + tokens[4];
          }

          // whitespace token we can skip?
          if (whitespace_pattern.test(match[0])) {
            continue;
          }
        }

        // save matched text
        tokens.push(match[0]);
      }
      // otherwise, string literal or comment
      else {
        // save unmatched text
        tokens[tokens.length - 1] += unmatched;

        // unescaped terminator to string literal or comment?
        if (not_escaped_pattern.test(tokens[tokens.length - 1])) {
          // comment terminator?
          if (state[state.length - 1] === 4) {
            // ok to drop comment?
            if (
              tokens.length < 2 ||
              whitespace_pattern.test(tokens[tokens.length - 2])
            ) {
              tokens.pop();
            }
            // otherwise, turn comment into whitespace
            else {
              tokens[tokens.length - 1] = " ";
            }

            // handled already
            match[0] = "";
          }

          state.pop();
        }

        // append matched text to existing token
        tokens[tokens.length - 1] += match[0];
      }
    }
    // otherwise, end of processing (no more matches)
    else {
      unmatched = sel.substr(next_match_idx);
      saveUnmatched();

      break;
    }
  }

  return tokens.join("").trim();
}

function querySelectorDeep(selector, root = document, allElements = null) {
    return _querySelectorDeep(selector, false, root, allElements);
}

function _querySelectorDeep(selector, findMany, root, allElements = null) {
    selector = normalizeSelector(selector);
    let lightElement = root.querySelector(selector);

    if (document.head.createShadowRoot || document.head.attachShadow) {
        // no need to do any special if selector matches something specific in light-dom
        if (!findMany && lightElement) {
            return lightElement;
        }

        // split on commas because those are a logical divide in the operation
        const selectionsToMake = splitByCharacterUnlessQuoted(selector, ',');

        return selectionsToMake.reduce((acc, minimalSelector) => {
            // if not finding many just reduce the first match
            if (!findMany && acc) {
                return acc;
            }
            // do best to support complex selectors and split the query
            const splitSelector = splitByCharacterUnlessQuoted(minimalSelector
                    //remove white space at start of selector
                    .replace(/^\s+/g, '')
                    .replace(/\s*([>+~]+)\s*/g, '$1'), ' ')
                    // filter out entry white selectors
                    .filter((entry) => !!entry)
                    // convert "a > b" to ["a", "b"]
                    .map((entry) => splitByCharacterUnlessQuoted(entry, '>'));

            const possibleElementsIndex = splitSelector.length - 1;
            const lastSplitPart = splitSelector[possibleElementsIndex][splitSelector[possibleElementsIndex].length - 1];
            const possibleElements = collectAllElementsDeep(lastSplitPart, root, allElements);
            const findElements = findMatchingElement(splitSelector, possibleElementsIndex, root);
            if (findMany) {
                acc = acc.concat(possibleElements.filter(findElements));
                return acc;
            } else {
                acc = possibleElements.find(findElements);
                return acc || null;
            }
        }, findMany ? [] : null);


    } else {
        if (!findMany) {
            return lightElement;
        } else {
            return root.querySelectorAll(selector);
        }
    }

}

function findMatchingElement(splitSelector, possibleElementsIndex, root) {
    return (element) => {
        let position = possibleElementsIndex;
        let parent = element;
        let foundElement = false;
        while (parent && !isDocumentNode(parent)) {
            let foundMatch = true;
            if (splitSelector[position].length === 1) {
                foundMatch = parent.matches(splitSelector[position]);
            } else {
                // selector is in the format "a > b"
                // make sure a few parents match in order
                const reversedParts = ([]).concat(splitSelector[position]).reverse();
                let newParent = parent;
                for (const part of reversedParts) {
                    if (!newParent || !newParent.matches(part)) {
                        foundMatch = false;
                        break;
                    }
                    newParent = findParentOrHost(newParent, root);
                }
            }

            if (foundMatch && position === 0) {
                foundElement = true;
                break;
            }
            if (foundMatch) {
                position--;
            }
            parent = findParentOrHost(parent, root);
        }
        return foundElement;
    };

}

function splitByCharacterUnlessQuoted(selector, character) {
    return selector.match(/\\?.|^$/g).reduce((p, c) => {
        if (c === '"' && !p.sQuote) {
            p.quote ^= 1;
            p.a[p.a.length - 1] += c;
        } else if (c === '\'' && !p.quote) {
            p.sQuote ^= 1;
            p.a[p.a.length - 1] += c;

        } else if (!p.quote && !p.sQuote && c === character) {
            p.a.push('');
        } else {
            p.a[p.a.length - 1] += c;
        }
        return p;
    }, { a: [''] }).a;
}

/**
 * Checks if the node is a document node or not.
 * @param {Node} node
 * @returns {node is Document | DocumentFragment}
 */
function isDocumentNode(node) {
    return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.DOCUMENT_NODE;
}

function findParentOrHost(element, root) {
    const parentNode = element.parentNode;
    return (parentNode && parentNode.host && parentNode.nodeType === 11) ? parentNode.host : parentNode === root ? null : parentNode;
}

/**
 * Finds all elements on the page, inclusive of those within shadow roots.
 * @param {string=} selector Simple selector to filter the elements by. e.g. 'a', 'div.main'
 * @return {!Array<string>} List of anchor hrefs.
 * @author ebidel@ (Eric Bidelman)
 * License Apache-2.0
 */
function collectAllElementsDeep(selector = null, root, cachedElements = null) {
    let allElements = [];

    if (cachedElements) {
        allElements = cachedElements;
    } else {
        const findAllElements = function(nodes) {
            for (let i = 0; i < nodes.length; i++) {
                const el = nodes[i];
                allElements.push(el);
                // If the element has a shadow root, dig deeper.
                if (el.shadowRoot) {
                    findAllElements(el.shadowRoot.querySelectorAll('*'));
                }
            }
        };
        if(root.shadowRoot) {
            findAllElements(root.shadowRoot.querySelectorAll('*'));
        }
        findAllElements(root.querySelectorAll('*'));
    }

    return selector ? allElements.filter(el => el.matches(selector)) : allElements;	}

function extractPathParams(pattern, path) {
    const regex = new RegExp(pattern);
    const matches = regex.exec(path);
    if (!matches) {
        return [];
    }
    else {
        const groups = [...matches];
        // remove first result since its not a capture group
        groups.shift();
        return groups;
    }
}
function delay(milliseconds = 0) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            resolve();
            clearTimeout(timer);
        }, Number(milliseconds));
    });
}
const routeComponents = new Set();
class RouterComponent extends HTMLElement {
    constructor() {
        super();
        this.routeElements = [];
        this.shownRouteElements = new Map();
        /**
         * @deprecated since 0.15.0
         * TODO: remove this in next major version
         */
        this.show = this.showRoute;
        routeComponents.add(this);
        this.fragment = document.createDocumentFragment();
        const children = this.children;
        while (children.length > 0) {
            const element = children[0];
            this.routeElements.push(element);
            this.fragment.appendChild(element);
        }
    }
    connectedCallback() {
        this.popStateChangedListener = this.popStateChanged.bind(this);
        window.addEventListener('popstate', this.popStateChangedListener);
        this.bindLinks();
        // we must hijack pushState and replaceState because we need to
        // detect when consumer attempts to use and trigger a page load
        this.historyChangeStates = new Map([
            [window.history.pushState, 'pushState'],
            [window.history.replaceState, 'replaceState'],
        ]);
        for (const [method, name] of this.historyChangeStates) {
            window.history[name] = (state, title, url) => {
                const triggerRouteChange = !state || state.triggerRouteChange !== false;
                if (!triggerRouteChange) {
                    delete state.triggerRouteChange;
                }
                method.call(history, state, title, url);
                if (!triggerRouteChange) {
                    return;
                }
                if (this.previousLocation) {
                    this.hideRoute(this.previousLocation.pathname);
                }
                this.showRoute(url);
            };
        }
        this.showRoute(this.getFullPathname(this.location));
    }
    getRouteElementByPath(pathname) {
        let element;
        if (!pathname)
            return;
        for (const child of this.routeElements) {
            let path = pathname;
            const search = child.getAttribute('search-params');
            if (search) {
                path = `${pathname}?${search}`;
            }
            if (this.matchPathWithRegex(path, child.getAttribute('path'))) {
                element = child;
                break;
            }
        }
        return element;
    }
    get storedScrollPosition() {
        const positionString = sessionStorage.getItem('currentScrollPosition');
        return positionString && Number(positionString);
    }
    set storedScrollPosition(value) {
        sessionStorage.setItem('currentScrollPosition', value.toString());
    }
    scrollToHash(hash = this.location.hash) {
        const behaviorAttribute = this.getAttribute('hash-scroll-behavior');
        const hashId = hash.replace('#', '');
        try {
            const hashElement = querySelectorDeep(`[id=${hashId}]`, this);
            if (hashElement) {
                hashElement.scrollIntoView({
                    behavior: behaviorAttribute || 'auto',
                });
            }
        }
        catch (e) {
            // id attributes can only have valid characters, if invalid, skip
            console.warn(`Cannot scroll to element with the id of "${hashId}".`);
            return;
        }
    }
    handleHash(hash = '', wait = false) {
        const delayAttribute = this.getAttribute('hash-scroll-delay');
        const delay = delayAttribute ? Number(delayAttribute) : 1;
        if (!wait) {
            this.scrollToHash(hash);
        }
        else {
            // wait for custom element to connect to the DOM so we
            // can scroll to it, on certain browsers this takes a while
            const timer = setTimeout(() => {
                this.scrollToHash(hash);
                clearTimeout(timer);
            }, delay);
        }
    }
    showRoute(location) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!location)
                return;
            const [pathname, hashString] = location.split('#');
            const routeElement = this.getRouteElementByPath(pathname);
            this.previousLocation = Object.assign({}, this.location);
            if (!routeElement) {
                return console.warn(`Navigated to path "${pathname}" but there is no matching element with a path ` +
                    `that matches. Maybe you should implement a catch-all route with the path attribute of ".*"?`);
            }
            const child = this.children[0];
            if (child &&
                this.previousLocation.href !== this.location.href &&
                !querySelectorDeep('router-component', child)) {
                this.hideRoute(this.previousLocation.pathname);
            }
            if (!this.shownRouteElements.has(pathname)) {
                this.shownRouteElements.set(pathname, routeElement);
            }
            this.dispatchEvent(new CustomEvent('route-changed'));
            this.appendChild(routeElement);
            this.dispatchEvent(new CustomEvent('showing-page', {
                detail: routeElement,
            }));
            const showDelayAttribute = this.getAttribute('show-delay');
            if (showDelayAttribute) {
                yield delay(showDelayAttribute);
            }
            this.setupElement(routeElement);
            let scrollToPosition = 0;
            if (this.storedScrollPosition &&
                window.history.scrollRestoration === 'manual') {
                scrollToPosition = this.storedScrollPosition;
                sessionStorage.removeItem('currentScrollPosition');
            }
            if (hashString) {
                this.handleHash(`#${hashString}`);
            }
            else {
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'auto', // we dont wanna scroll here
                });
            }
        });
    }
    hideRoute(location = '') {
        return __awaiter(this, void 0, void 0, function* () {
            if (!location) {
                return;
            }
            const [pathname] = location.split('#');
            const routeElement = this.getRouteElementByPath(pathname);
            if (!routeElement) {
                return;
            }
            this.dispatchEvent(new CustomEvent('hiding-page', {
                detail: routeElement,
            }));
            const hideDelayAttribute = this.getAttribute('hide-delay');
            if (hideDelayAttribute) {
                yield delay(hideDelayAttribute);
            }
            this.fragment.appendChild(routeElement);
            this.teardownElement(routeElement);
        });
    }
    get location() {
        return window.location;
    }
    disconnectedCallback() {
        window.removeEventListener('popstate', this.popStateChangedListener);
        for (const [method, name] of this.historyChangeStates) {
            window.history[name] = method;
        }
        this.unbindLinks();
        this.shownRouteElements.clear();
        this.previousLocation = undefined;
    }
    clickedLink(link, e) {
        const { href } = link;
        if (!href || href.indexOf('mailto:') !== -1)
            return;
        const { location } = this;
        const origin = location.origin || location.protocol + '//' + location.host;
        if (href.indexOf(origin) !== 0 || link.origin !== location.origin) {
            // external links
            window.history.scrollRestoration = 'manual';
            sessionStorage.setItem('currentScrollPosition', document.documentElement.scrollTop.toString());
            return;
        }
        e.preventDefault();
        const state = {};
        if (link.hash && link.pathname === location.pathname) {
            this.scrollToHash(link.hash);
            state.triggerRouteChange = false;
        }
        window.history.pushState(state, document.title, `${link.pathname}${link.search}${link.hash}`);
    }
    bindLinks() {
        // TODO: update this to be more performant
        // listening to body to allow detection inside of shadow roots
        this.clickedLinkListener = (e) => {
            if (e.defaultPrevented)
                return;
            const link = e
                .composedPath()
                .filter((n) => n.tagName === 'A')[0];
            if (!link) {
                return;
            }
            this.clickedLink(link, e);
        };
        document.body.addEventListener('click', this.clickedLinkListener);
    }
    unbindLinks() {
        document.body.removeEventListener('click', this.clickedLinkListener);
    }
    matchPathWithRegex(pathname = '', regex) {
        if (!pathname.startsWith('/')) {
            pathname = `${pathname.replace(/^\//, '')}`;
        }
        return pathname.match(regex);
    }
    /**
     * Returns href without the hostname and stuff.
     * @param location
     * @returns
     */
    getFullPathname(location) {
        if (!location) {
            return '';
        }
        const { pathname, search, hash } = location;
        return `${pathname}${search}${hash}`;
    }
    popStateChanged() {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.getFullPathname(this.location);
            // although popstate was called we still need to trigger
            // replaceState so all stateful operations can be performed
            window.history.replaceState({}, document.title, path);
        });
    }
    setupElement(routeElement) {
        const { pathname } = this.location;
        this.originalDocumentTitle = document.title;
        const title = routeElement.getAttribute('document-title');
        if (title) {
            document.title = title;
        }
        else {
            document.title = this.originalDocumentTitle;
        }
        const nestedRouterComponent = routeElement.querySelector('router-component');
        if (nestedRouterComponent) {
            nestedRouterComponent.showRoute(pathname);
        }
    }
    // eslint-disable-next-line no-unused-vars
    teardownElement(element) {
        document.title = this.originalDocumentTitle;
    }
    getExternalRouterByPath(pathname) {
        for (const component of routeComponents) {
            const routeElement = component.getRouteElementByPath(pathname);
            if (routeElement) {
                return component;
            }
        }
    }
}
customElements.define('router-component', RouterComponent);

export { RouterComponent, extractPathParams };
