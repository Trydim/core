import { addClass, attributes, Base, Browser, classList, closest, Component, createElement, detach, Event, EventHandler, extend, formatUnit, getNumericObject, getUniqueID, getValue, Internationalization, isNullOrUndefined, L10n, merge, NotifyPropertyChanges, onIntlChange, Property, remove, removeClass, select, selectAll, setValue } from './ej2-base';

/* eslint-disable valid-jsdoc, jsdoc/require-jsdoc, jsdoc/require-returns, jsdoc/require-param */
const CLASSNAMES = {
    RTL: 'e-rtl',
    DISABLE: 'e-disabled',
    INPUT: 'e-input',
    TEXTAREA: 'e-multi-line-input',
    INPUTGROUP: 'e-input-group',
    FLOATINPUT: 'e-float-input',
    FLOATLINE: 'e-float-line',
    FLOATTEXT: 'e-float-text',
    FLOATTEXTCONTENT: 'e-float-text-content',
    CLEARICON: 'e-clear-icon',
    CLEARICONHIDE: 'e-clear-icon-hide',
    LABELTOP: 'e-label-top',
    LABELBOTTOM: 'e-label-bottom',
    NOFLOATLABEL: 'e-no-float-label',
    INPUTCUSTOMTAG: 'e-input-custom-tag',
    FLOATCUSTOMTAG: 'e-float-custom-tag'
};
/**
 * Defines the constant attributes for the input element container.
 */
const containerAttributes = ['title', 'style', 'class'];
/**
 * Defines the constant focus class for the input element.
 */
const TEXTBOX_FOCUS = 'e-input-focus';
/**
 * Base for Input creation through util methods.
 */

var Input;
(function (Input) {
    let floatType;
    let isBindClearAction = true;
    /**
     * Create a wrapper to input element with multiple span elements and set the basic properties to input based components.
     * ```
     * E.g : Input.createInput({ element: element, floatLabelType : "Auto", properties: { placeholder: 'Search' } });
     * ```
     *
     */
    function createInput(args, internalCreateElement) {
        args.element.__eventHandlers = {};
        const makeElement = !isNullOrUndefined(internalCreateElement) ? internalCreateElement : createElement;
        let inputObject = { container: null, buttons: [], clearButton: null };
        floatType = args.floatLabelType;
        isBindClearAction = args.bindClearAction;
        if (isNullOrUndefined(args.floatLabelType) || args.floatLabelType === 'Never') {
            inputObject.container = createInputContainer(args, CLASSNAMES.INPUTGROUP, CLASSNAMES.INPUTCUSTOMTAG, 'span', makeElement);
            args.element.parentNode.insertBefore(inputObject.container, args.element);
            addClass([args.element], CLASSNAMES.INPUT);
            inputObject.container.appendChild(args.element);
        }
        else {
            createFloatingInput(args, inputObject, makeElement);
        }
        bindInitialEvent(args);
        if (!isNullOrUndefined(args.properties) && !isNullOrUndefined(args.properties.showClearButton) &&
            args.properties.showClearButton) {
            setClearButton(args.properties.showClearButton, args.element, inputObject, true, makeElement);
            inputObject.clearButton.setAttribute('role', 'button');
            if (inputObject.container.classList.contains(CLASSNAMES.FLOATINPUT)) {
                addClass([inputObject.container], CLASSNAMES.INPUTGROUP);
            }
        }
        if (!isNullOrUndefined(args.buttons)) {
            for (let i = 0; i < args.buttons.length; i++) {
                inputObject.buttons.push(appendSpan(args.buttons[i], inputObject.container, makeElement));
            }
        }
        if (!isNullOrUndefined(args.element) && args.element.tagName === 'TEXTAREA') {
            addClass([inputObject.container], CLASSNAMES.TEXTAREA);
        }
        validateInputType(inputObject.container, args.element);
        inputObject = setPropertyValue(args, inputObject);
        createSpanElement(inputObject.container, makeElement);
        return inputObject;
    }
    Input.createInput = createInput;
    function bindFocusEventHandler(args) {
        const parent = getParentNode(args.element);
        if (parent.classList.contains('e-input-group') || parent.classList.contains('e-outline') || parent.classList.contains('e-filled')) {
            parent.classList.add('e-input-focus');
        }
        if (args.floatLabelType !== 'Never') {
            setTimeout(() => {
                Input.calculateWidth(args.element, parent);
            }, 80);
        }
    }
    function bindBlurEventHandler(args) {
        const parent = getParentNode(args.element);
        if (parent.classList.contains('e-input-group') || parent.classList.contains('e-outline') || parent.classList.contains('e-filled')) {
            parent.classList.remove('e-input-focus');
        }
        if (args.floatLabelType !== 'Never') {
            setTimeout(() => {
                Input.calculateWidth(args.element, parent);
            }, 80);
        }
    }
    function bindInputEventHandler(args) {
        checkInputValue(args.floatLabelType, args.element);
    }
    function bindInitialEvent(args) {
        checkInputValue(args.floatLabelType, args.element);
        const focusHandler = () => bindFocusEventHandler(args);
        const blurHandler = () => bindBlurEventHandler(args);
        const inputHandler = () => bindInputEventHandler(args);
        args.element.addEventListener('focus', focusHandler);
        args.element.addEventListener('blur', blurHandler);
        args.element.addEventListener('input', inputHandler);
        args.element.__eventHandlers['inputFocusHandler'] = { focusHandler };
        args.element.__eventHandlers['inputBlurHandler'] = { blurHandler };
        args.element.__eventHandlers['inputHandler'] = { inputHandler };
    }
    Input.bindInitialEvent = bindInitialEvent;
    function unbindInitialEvent(args) {
        if (!isNullOrUndefined(args.element)) {
            if (!isNullOrUndefined(args.element.__eventHandlers)) {
                if (!isNullOrUndefined(args.element.__eventHandlers['inputFocusHandler'])
                    && !isNullOrUndefined(args.element.__eventHandlers['inputBlurHandler'])
                    && !isNullOrUndefined(args.element.__eventHandlers['inputHandler'])) {
                    const focusHandler = args.element.__eventHandlers['inputFocusHandler'].focusHandler;
                    const blurHandler = args.element.__eventHandlers['inputBlurHandler'].blurHandler;
                    const inputHandler = args.element.__eventHandlers['inputHandler'].inputHandler;
                    args.element.removeEventListener('focus', focusHandler);
                    args.element.removeEventListener('blur', blurHandler);
                    args.element.removeEventListener('input', inputHandler);
                    // Clean up stored bound functions
                    delete args.element.__eventHandlers['inputFocusHandler'];
                    delete args.element.__eventHandlers['inputBlurHandler'];
                    delete args.element.__eventHandlers['inputHandler'];
                }
            }
        }
    }
    function checkInputValue(floatLabelType, inputElement) {
        const inputValue = inputElement.value;
        const inputParent = inputElement.parentElement;
        const grandParent = inputParent && inputParent.parentElement;
        if (inputValue !== '' && !isNullOrUndefined(inputValue)) {
            if (inputParent && inputParent.classList.contains('e-input-group')) {
                inputParent.classList.add('e-valid-input');
            }
            else if (grandParent && grandParent.classList.contains('e-input-group')) {
                grandParent.classList.add('e-valid-input');
            }
        }
        else if (floatLabelType !== 'Always') {
            if (inputParent && inputParent.classList.contains('e-input-group')) {
                inputParent.classList.remove('e-valid-input');
            }
            else if (grandParent && grandParent.classList.contains('e-input-group')) {
                grandParent.classList.remove('e-valid-input');
            }
        }
    }
    function _focusFn() {
        const label = getParentNode(this).getElementsByClassName('e-float-text')[0];
        if (!isNullOrUndefined(label)) {
            addClass([label], CLASSNAMES.LABELTOP);
            if (label.classList.contains(CLASSNAMES.LABELBOTTOM)) {
                removeClass([label], CLASSNAMES.LABELBOTTOM);
            }
        }
    }
    function _blurFn() {
        const parent = getParentNode(this);
        if ((parent.getElementsByTagName('textarea')[0]) ? parent.getElementsByTagName('textarea')[0].value === '' :
            parent.getElementsByTagName('input')[0].value === '') {
            const label = parent.getElementsByClassName('e-float-text')[0];
            if (!isNullOrUndefined(label)) {
                if (label.classList.contains(CLASSNAMES.LABELTOP)) {
                    removeClass([label], CLASSNAMES.LABELTOP);
                }
                addClass([label], CLASSNAMES.LABELBOTTOM);
            }
        }
    }
    function wireFloatingEvents(element) {
        element.addEventListener('focus', _focusFn);
        element.addEventListener('blur', _blurFn);
    }
    Input.wireFloatingEvents = wireFloatingEvents;
    function unwireFloatingEvents(element) {
        if (!isNullOrUndefined(element)) {
            element.removeEventListener('focus', _focusFn);
            element.removeEventListener('blur', _blurFn);
        }
    }
    function inputEventHandler(args) {
        validateLabel(args.element, args.floatLabelType);
    }
    function blurEventHandler(args) {
        validateLabel(args.element, args.floatLabelType);
    }
    function createFloatingInput(args, inputObject, internalCreateElement) {
        const makeElement = !isNullOrUndefined(internalCreateElement) ? internalCreateElement : createElement;
        if (args.floatLabelType === 'Auto') {
            wireFloatingEvents(args.element);
        }
        if (isNullOrUndefined(inputObject.container)) {
            inputObject.container = createInputContainer(args, CLASSNAMES.FLOATINPUT, CLASSNAMES.FLOATCUSTOMTAG, 'div', makeElement);
            inputObject.container.classList.add(CLASSNAMES.INPUTGROUP);
            if (args.element.parentNode) {
                args.element.parentNode.insertBefore(inputObject.container, args.element);
            }
        }
        else {
            if (!isNullOrUndefined(args.customTag)) {
                inputObject.container.classList.add(CLASSNAMES.FLOATCUSTOMTAG);
            }
            inputObject.container.classList.add(CLASSNAMES.FLOATINPUT);
        }
        const floatLinelement = makeElement('span', { className: CLASSNAMES.FLOATLINE });
        const floatLabelElement = makeElement('label', { className: CLASSNAMES.FLOATTEXT });
        if (!isNullOrUndefined(args.element.id) && args.element.id !== '') {
            floatLabelElement.id = 'label_' + args.element.id.replace(/ /g, '_');
            attributes(args.element, { 'aria-labelledby': floatLabelElement.id });
        }
        if (!isNullOrUndefined(args.element.placeholder) && args.element.placeholder !== '') {
            floatLabelElement.innerText = encodePlaceHolder(args.element.placeholder);
            args.element.removeAttribute('placeholder');
        }
        if (!isNullOrUndefined(args.properties) && !isNullOrUndefined(args.properties.placeholder) &&
            args.properties.placeholder !== '') {
            floatLabelElement.innerText = encodePlaceHolder(args.properties.placeholder);
        }
        if (!floatLabelElement.innerText) {
            inputObject.container.classList.add(CLASSNAMES.NOFLOATLABEL);
        }
        if (inputObject.container.classList.contains('e-float-icon-left')) {
            const inputWrap = inputObject.container.querySelector('.e-input-in-wrap');
            inputWrap.appendChild(args.element);
            inputWrap.appendChild(floatLinelement);
            inputWrap.appendChild(floatLabelElement);
        }
        else {
            inputObject.container.appendChild(args.element);
            inputObject.container.appendChild(floatLinelement);
            inputObject.container.appendChild(floatLabelElement);
        }
        updateLabelState(args.element.value, floatLabelElement);
        if (args.floatLabelType === 'Always') {
            if (floatLabelElement.classList.contains(CLASSNAMES.LABELBOTTOM)) {
                removeClass([floatLabelElement], CLASSNAMES.LABELBOTTOM);
            }
            addClass([floatLabelElement], CLASSNAMES.LABELTOP);
        }
        if (args.floatLabelType === 'Auto') {
            const inputFloatHandler = () => inputEventHandler(args);
            const blurFloatHandler = () => blurEventHandler(args);
            // Add event listeners using the defined functions
            args.element.addEventListener('input', inputFloatHandler);
            args.element.addEventListener('blur', blurFloatHandler);
            // Store the event handler functions to remove them later
            args.element.__eventHandlers['floatInputHandler'] = { inputFloatHandler };
            args.element.__eventHandlers['floatBlurHandler'] = { blurFloatHandler };
        }
        else {
            unWireFloatLabelEvents(args);
        }
        if (!isNullOrUndefined(args.element.getAttribute('id'))) {
            floatLabelElement.setAttribute('for', args.element.getAttribute('id'));
        }
    }
    function unWireFloatLabelEvents(args) {
        if (!isNullOrUndefined(args.element) &&
            !isNullOrUndefined(args.element.__eventHandlers)
            && !isNullOrUndefined(args.element.__eventHandlers['floatInputHandler'])
            && !isNullOrUndefined(args.element.__eventHandlers['floatBlurHandler'])) {
            const inputFloatHandler = args.element.__eventHandlers['floatInputHandler'].inputFloatHandler;
            const blurFloatHandler = args.element.__eventHandlers['floatBlurHandler'].blurFloatHandler;
            // Remove the event listeners using the defined functions
            args.element.removeEventListener('input', inputFloatHandler);
            args.element.removeEventListener('blur', blurFloatHandler);
            // Clean up stored event handler functions
            delete args.element.__eventHandlers['floatInputHandler'];
            delete args.element.__eventHandlers['floatBlurHandler'];
        }
    }
    function checkFloatLabelType(type, container) {
        if (type === 'Always' && container.classList.contains('e-outline')) {
            container.classList.add('e-valid-input');
        }
    }
    function setPropertyValue(args, inputObject) {
        if (!isNullOrUndefined(args.properties)) {
            for (const prop of Object.keys(args.properties)) {
                switch (prop) {
                    case 'cssClass':
                        setCssClass(args.properties.cssClass, [inputObject.container]);
                        checkFloatLabelType(args.floatLabelType, inputObject.container);
                        break;
                    case 'enabled':
                        setEnabled(args.properties.enabled, args.element, args.floatLabelType, inputObject.container);
                        break;
                    case 'enableRtl':
                        setEnableRtl(args.properties.enableRtl, [inputObject.container]);
                        break;
                    case 'placeholder':
                        setPlaceholder(args.properties.placeholder, args.element);
                        break;
                    case 'readonly':
                        setReadonly(args.properties.readonly, args.element);
                        break;
                }
            }
        }
        return inputObject;
    }
    function updateIconState(value, button, readonly) {
        if (!isNullOrUndefined(button)) {
            if (value && !readonly) {
                removeClass([button], CLASSNAMES.CLEARICONHIDE);
            }
            else {
                addClass([button], CLASSNAMES.CLEARICONHIDE);
            }
        }
    }
    function updateLabelState(value, label, element = null) {
        if (value) {
            addClass([label], CLASSNAMES.LABELTOP);
            if (label.classList.contains(CLASSNAMES.LABELBOTTOM)) {
                removeClass([label], CLASSNAMES.LABELBOTTOM);
            }
        }
        else {
            const isNotFocused = element != null ? element !== document.activeElement : true;
            if (isNotFocused) {
                if (label.classList.contains(CLASSNAMES.LABELTOP)) {
                    removeClass([label], CLASSNAMES.LABELTOP);
                }
                addClass([label], CLASSNAMES.LABELBOTTOM);
            }
        }
    }
    function getParentNode(element) {
        let parentNode = isNullOrUndefined(element.parentNode) ? element
            : element.parentNode;
        if (parentNode && parentNode.classList.contains('e-input-in-wrap')) {
            parentNode = parentNode.parentNode;
        }
        return parentNode;
    }
    /**
     * To create clear button.
     */
    function createClearButton(element, inputObject, initial, internalCreateElement) {
        const makeElement = !isNullOrUndefined(internalCreateElement) ? internalCreateElement : createElement;
        const button = makeElement('span', { className: CLASSNAMES.CLEARICON });
        const container = inputObject.container;
        if (!isNullOrUndefined(initial)) {
            container.appendChild(button);
        }
        else {
            const baseElement = inputObject.container.classList.contains(CLASSNAMES.FLOATINPUT) ?
                inputObject.container.querySelector('.' + CLASSNAMES.FLOATTEXT) : element;
            baseElement.insertAdjacentElement('afterend', button);
        }
        addClass([button], CLASSNAMES.CLEARICONHIDE);
        wireClearBtnEvents(element, button);
        button.setAttribute('aria-label', 'close');
        return button;
    }
    function clickHandler(event, element, button) {
        if (!(element.classList.contains(CLASSNAMES.DISABLE) || element.readOnly)) {
            event.preventDefault();
            if (element !== document.activeElement) {
                element.focus();
            }
            element.value = '';
            addClass([button], CLASSNAMES.CLEARICONHIDE);
        }
    }
    function inputHandler(element, button) {
        updateIconState(element.value, button);
    }
    function focusHandler(element, button) {
        updateIconState(element.value, button, element.readOnly);
    }
    function blurHandler(element, button) {
        setTimeout(() => {
            if (!isNullOrUndefined(button)) {
                addClass([button], CLASSNAMES.CLEARICONHIDE);
                button = !isNullOrUndefined(element) && element.classList.contains('e-combobox') ? null : button;
            }
        }, 200);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function wireClearBtnEvents(element, button) {
        if (isBindClearAction === undefined || isBindClearAction) {
            const clickHandlerEvent = (e) => clickHandler(e, element, button);
            button.addEventListener('click', clickHandlerEvent);
            element.__eventHandlers['clearClickHandler'] = { clickHandlerEvent };
        }
        const inputHandlerEvent = () => inputHandler(element, button);
        const focusHandlerEvent = () => focusHandler(element, button);
        const blurHandlerEvent = () => blurHandler(element, button);
        element.addEventListener('input', inputHandlerEvent);
        element.addEventListener('focus', focusHandlerEvent);
        element.addEventListener('blur', blurHandlerEvent);
        // Store the bound functions to remove them later
        element.__eventHandlers['clearInputHandler'] = { inputHandlerEvent };
        element.__eventHandlers['clearFocusHandler'] = { focusHandlerEvent };
        element.__eventHandlers['clearBlurHandler'] = { blurHandlerEvent };
    }
    Input.wireClearBtnEvents = wireClearBtnEvents;
    function unWireClearBtnEvents(element, button) {
        if (!isNullOrUndefined(element) &&
            !isNullOrUndefined(element.__eventHandlers)) {
            if (!isNullOrUndefined(element.__eventHandlers['clearClickHandler'])) {
                const clickHandlerEvent = element.__eventHandlers['clearClickHandler'].clickHandlerEvent;
                if (isBindClearAction === undefined || isBindClearAction) {
                    if (!isNullOrUndefined(button)) {
                        button.removeEventListener('click', clickHandlerEvent);
                    }
                }
                delete element.__eventHandlers['clearClickHandler'];
            }
            if (!isNullOrUndefined(element.__eventHandlers['clearInputHandler'])
                && !isNullOrUndefined(element.__eventHandlers['clearFocusHandler'])
                && !isNullOrUndefined(element.__eventHandlers['clearBlurHandler'])) {
                const inputHandlerEvent = element.__eventHandlers['clearInputHandler'].inputHandlerEvent;
                const focusHandlerEvent = element.__eventHandlers['clearFocusHandler'].focusHandlerEvent;
                const blurHandlerEvent = element.__eventHandlers['clearBlurHandler'].blurHandlerEvent;
                element.removeEventListener('input', inputHandlerEvent);
                element.removeEventListener('focus', focusHandlerEvent);
                element.removeEventListener('blur', blurHandlerEvent);
                // Clean up stored Event functions
                delete element.__eventHandlers['clearInputHandler'];
                delete element.__eventHandlers['clearFocusHandler'];
                delete element.__eventHandlers['clearBlurHandler'];
            }
        }
    }
    function destroy(args, button = null) {
        unbindInitialEvent(args);
        if (args.floatLabelType === 'Auto') {
            unWireFloatLabelEvents(args);
        }
        if (args.properties.showClearButton) {
            unWireClearBtnEvents(args.element, button);
        }
        if (!isNullOrUndefined(args.buttons)) {
            _internalRipple(false, null, args.buttons);
        }
        unwireFloatingEvents(args.element);
        if (!isNullOrUndefined(args.element)) {
            delete args.element.__eventHandlers;
            if (args.element.classList.contains(CLASSNAMES.INPUT)) {
                args.element.classList.remove(CLASSNAMES.INPUT);
            }
        }
    }
    Input.destroy = destroy;
    function validateLabel(element, floatLabelType) {
        const parent = getParentNode(element);
        if (parent.classList.contains(CLASSNAMES.FLOATINPUT) && floatLabelType === 'Auto') {
            const label = getParentNode(element).getElementsByClassName('e-float-text')[0];
            updateLabelState(element.value, label, element);
        }
    }
    /**
     * To create input box contianer.
     */
    function createInputContainer(args, className, tagClass, tag, internalCreateElement) {
        const makeElement = !isNullOrUndefined(internalCreateElement) ? internalCreateElement : createElement;
        let container;
        if (!isNullOrUndefined(args.customTag)) {
            container = makeElement(args.customTag, { className: className });
            container.classList.add(tagClass);
        }
        else {
            container = makeElement(tag, { className: className });
        }
        container.classList.add('e-control-wrapper');
        return container;
    }
    function encodePlaceHolder(placeholder) {
        if (placeholder == null || placeholder === '') {
            return '';
        }
        return decodeHtmlEntities(placeholder);
    }
    function decodeHtmlEntities(str) {
        const entityMap = {
            '&amp;': '&',
            // eslint-disable-next-line quotes
            '&quot;': '"',
            // eslint-disable-next-line quotes
            '&#39;': "'",
            '&lt;': '<',
            '&gt;': '>',
            '&eacute;': 'é' // tslint:disable-line:comma-dangle
        };
        // tslint:disable-next-line:typedef
        // tslint-disable-next-line security/detect-object-injection
        return str.replace(/&[a-zA-Z#0-9]+;/g, (entity) => entityMap[entity] || entity);
    }
    /**
     * Sets the value to the input element.
     * ```
     * E.g : Input.setValue('content', element, "Auto", true );
     * ```
     *
     * @param {string} value - Specify the value of the input element.
     * @param {HTMLInputElement | HTMLTextAreaElement} element - The element on which the specified value is updated.
     * @param {string} floatLabelType - Specify the float label type of the input element.
     * @param {boolean} clearButton - Boolean value to specify whether the clear icon is enabled / disabled on the input.
     */
    function setValue(value, element, floatLabelType, clearButton) {
        element.value = value;
        if (floatLabelType !== 'Never') {
            calculateWidth(element, element.parentElement);
        }
        if ((!isNullOrUndefined(floatLabelType)) && floatLabelType === 'Auto') {
            validateLabel(element, floatLabelType);
        }
        if (!isNullOrUndefined(clearButton) && clearButton) {
            const parentElement = getParentNode(element);
            if (!isNullOrUndefined(parentElement)) {
                const button = parentElement.getElementsByClassName(CLASSNAMES.CLEARICON)[0];
                if (!isNullOrUndefined(button)) {
                    if (element.value && !isNullOrUndefined(parentElement) && parentElement.classList.contains('e-input-focus')) {
                        removeClass([button], CLASSNAMES.CLEARICONHIDE);
                    }
                    else {
                        addClass([button], CLASSNAMES.CLEARICONHIDE);
                    }
                }
            }
        }
        checkInputValue(floatLabelType, element);
    }
    Input.setValue = setValue;
    /**
     * Sets the single or multiple cssClass to wrapper of input element.
     * ```
     * E.g : Input.setCssClass('e-custom-class', [element]);
     * ```
     *
     * @param {string} cssClass - Css class names which are needed to add.
     * @param {Element[] | NodeList} elements - The elements which are needed to add / remove classes.
     * @param {string} oldClass
     * - Css class names which are needed to remove. If old classes are need to remove, can give this optional parameter.
     */
    function setCssClass(cssClass, elements, oldClass) {
        if (!isNullOrUndefined(oldClass) && oldClass !== '') {
            removeClass(elements, oldClass.split(' '));
        }
        if (!isNullOrUndefined(cssClass) && cssClass !== '') {
            addClass(elements, cssClass.split(' '));
        }
    }
    Input.setCssClass = setCssClass;
    /**
     * Set the width to the placeholder when it overflows on the button such as spinbutton, clearbutton, icon etc
     * ```
     * E.g : Input.calculateWidth(element, container);
     * ```
     *
     * @param {any} element - Input element which is need to add.
     * @param {HTMLElement} container - The parent element which is need to get the label span to calculate width
     */
    function calculateWidth(element, container, moduleName) {
        if (moduleName !== 'multiselect' && !_isElementVisible(element)) {
            return;
        }
        const elementWidth = moduleName === 'multiselect' ? element : element.clientWidth - parseInt(getComputedStyle(element, null).getPropertyValue('padding-left'), 10);
        if (!isNullOrUndefined(container) && !isNullOrUndefined(container.getElementsByClassName('e-float-text-content')[0])) {
            if (container.getElementsByClassName('e-float-text-content')[0].classList.contains('e-float-text-overflow')) {
                container.getElementsByClassName('e-float-text-content')[0].classList.remove('e-float-text-overflow');
            }
            if (elementWidth < container.getElementsByClassName('e-float-text-content')[0].clientWidth || elementWidth === container.getElementsByClassName('e-float-text-content')[0].clientWidth) {
                container.getElementsByClassName('e-float-text-content')[0].classList.add('e-float-text-overflow');
            }
        }
    }
    Input.calculateWidth = calculateWidth;
    /**
     * Set the width to the wrapper of input element.
     * ```
     * E.g : Input.setWidth('200px', container);
     * ```
     *
     * @param {number | string} width - Width value which is need to add.
     * @param {HTMLElement} container - The element on which the width is need to add.
     */
    function setWidth(width, container) {
        if (typeof width === 'number') {
            container.style.width = formatUnit(width);
        }
        else if (typeof width === 'string') {
            container.style.width = (width.match(/px|%|em/)) ? (width) : (formatUnit(width));
        }
        calculateWidth(container.firstChild, container);
    }
    Input.setWidth = setWidth;
    /**
     * Set the placeholder attribute to the input element.
     * ```
     * E.g : Input.setPlaceholder('Search here', element);
     * ```
     *
     * @param {string} placeholder - Placeholder value which is need to add.
     * @param {HTMLInputElement | HTMLTextAreaElement} element - The element on which the placeholder is need to add.
     */
    function setPlaceholder(placeholder, element) {
        placeholder = encodePlaceHolder(placeholder);
        const parentElement = getParentNode(element);
        if (parentElement.classList.contains(CLASSNAMES.FLOATINPUT)) {
            if (!isNullOrUndefined(placeholder) && placeholder !== '') {
                const floatTextContent = parentElement.getElementsByClassName('e-float-text-content')[0];
                if (floatTextContent && floatTextContent.children[0]) {
                    floatTextContent.children[0].textContent = placeholder;
                }
                else {
                    const floatText = parentElement.getElementsByClassName(CLASSNAMES.FLOATTEXT)[0];
                    if (!isNullOrUndefined(floatText)) {
                        floatText.textContent = placeholder;
                    }
                }
                parentElement.classList.remove(CLASSNAMES.NOFLOATLABEL);
                element.removeAttribute('placeholder');
            }
            else {
                parentElement.classList.add(CLASSNAMES.NOFLOATLABEL);
                const floatTextContent = parentElement.getElementsByClassName('e-float-text-content')[0];
                if (floatTextContent) {
                    floatTextContent.children[0].textContent = '';
                }
                else {
                    const floatText = parentElement.getElementsByClassName(CLASSNAMES.FLOATTEXT)[0];
                    if (!isNullOrUndefined(floatText)) {
                        floatText.textContent = '';
                    }
                }
            }
        }
        else {
            if (!isNullOrUndefined(placeholder) && placeholder !== '') {
                attributes(element, { 'placeholder': placeholder });
            }
            else {
                element.removeAttribute('placeholder');
            }
        }
    }
    Input.setPlaceholder = setPlaceholder;
    /**
     * Set the read only attribute to the input element
     * ```
     * E.g : Input.setReadonly(true, element);
     * ```
     *
     * @param {boolean} isReadonly
     * - Boolean value to specify whether to set read only. Setting "True" value enables read only.
     * @param {HTMLInputElement | HTMLTextAreaElement} element
     * - The element which is need to enable read only.
     */
    function setReadonly(isReadonly, element, floatLabelType) {
        if (isReadonly) {
            attributes(element, { readonly: '' });
        }
        else {
            element.removeAttribute('readonly');
        }
        if (!isNullOrUndefined(floatLabelType)) {
            validateLabel(element, floatLabelType);
        }
    }
    Input.setReadonly = setReadonly;
    /**
     * Displays the element direction from right to left when its enabled.
     * ```
     * E.g : Input.setEnableRtl(true, [inputObj.container]);
     * ```
     *
     * @param {boolean} isRtl
     * - Boolean value to specify whether to set RTL. Setting "True" value enables the RTL mode.
     * @param {Element[] | NodeList} elements
     * - The elements that are needed to enable/disable RTL.
     */
    function setEnableRtl(isRtl, elements) {
        if (isRtl) {
            addClass(elements, CLASSNAMES.RTL);
        }
        else {
            removeClass(elements, CLASSNAMES.RTL);
        }
    }
    Input.setEnableRtl = setEnableRtl;
    /**
     * Enables or disables the given input element.
     * ```
     * E.g : Input.setEnabled(false, element);
     * ```
     *
     * @param {boolean} isEnable
     * - Boolean value to specify whether to enable or disable.
     * @param {HTMLInputElement | HTMLTextAreaElement} element
     * - Element to be enabled or disabled.
     */
    function setEnabled(isEnable, element, floatLabelType, inputContainer) {
        const disabledAttrs = { 'disabled': '', 'aria-disabled': 'true' };
        const considerWrapper = !isNullOrUndefined(inputContainer);
        if (isEnable) {
            element.classList.remove(CLASSNAMES.DISABLE);
            removeAttributes(disabledAttrs, element);
            if (considerWrapper) {
                removeClass([inputContainer], CLASSNAMES.DISABLE);
            }
        }
        else {
            element.classList.add(CLASSNAMES.DISABLE);
            addAttributes(disabledAttrs, element);
            if (considerWrapper) {
                addClass([inputContainer], CLASSNAMES.DISABLE);
            }
        }
        if (!isNullOrUndefined(floatLabelType)) {
            validateLabel(element, floatLabelType);
        }
    }
    Input.setEnabled = setEnabled;
    function setClearButton(isClear, element, inputObject, initial, internalCreateElement) {
        const makeElement = !isNullOrUndefined(internalCreateElement) ? internalCreateElement : createElement;
        if (isClear) {
            inputObject.clearButton = createClearButton(element, inputObject, initial, makeElement);
        }
        else {
            remove(inputObject.clearButton);
            inputObject.clearButton = null;
        }
    }
    Input.setClearButton = setClearButton;
    /**
     * Removing the multiple attributes from the given element such as "disabled","id" , etc.
     * ```
     * E.g : Input.removeAttributes({ 'disabled': 'disabled', 'aria-disabled': 'true' }, element);
     * ```
     *
     * @param {string} attrs
     * - Array of attributes which are need to removed from the element.
     * @param {HTMLInputElement | HTMLElement} element
     * - Element on which the attributes are needed to be removed.
     */
    function removeAttributes(attrs, element) {
        for (const key of Object.keys(attrs)) {
            const parentElement = getParentNode(element);
            if (key === 'disabled') {
                element.classList.remove(CLASSNAMES.DISABLE);
            }
            if (key === 'disabled' && parentElement.classList.contains(CLASSNAMES.INPUTGROUP)) {
                parentElement.classList.remove(CLASSNAMES.DISABLE);
            }
            if (key === 'placeholder' && parentElement.classList.contains(CLASSNAMES.FLOATINPUT)) {
                parentElement.getElementsByClassName(CLASSNAMES.FLOATTEXT)[0].textContent = '';
            }
            else {
                element.removeAttribute(key);
            }
        }
    }
    Input.removeAttributes = removeAttributes;
    /**
     * Adding the multiple attributes to the given element such as "disabled","id" , etc.
     * ```
     * E.g : Input.addAttributes({ 'id': 'inputpopup' }, element);
     * ```
     *
     * @param {string} attrs
     * - Array of attributes which is added to element.
     * @param {HTMLInputElement | HTMLElement} element
     * - Element on which the attributes are needed to be added.
     */
    function addAttributes(attrs, element) {
        for (const key of Object.keys(attrs)) {
            const parentElement = getParentNode(element);
            if (key === 'disabled') {
                element.classList.add(CLASSNAMES.DISABLE);
            }
            if (key === 'disabled' && parentElement.classList.contains(CLASSNAMES.INPUTGROUP)) {
                parentElement.classList.add(CLASSNAMES.DISABLE);
            }
            if (key === 'placeholder' && parentElement.classList.contains(CLASSNAMES.FLOATINPUT)) {
                parentElement.getElementsByClassName(CLASSNAMES.FLOATTEXT)[0].textContent = attrs[`${key}`];
            }
            else {
                element.setAttribute(key, attrs[`${key}`]);
            }
        }
    }
    Input.addAttributes = addAttributes;
    function removeFloating(input) {
        const container = input.container;
        if (!isNullOrUndefined(container) && container.classList.contains(CLASSNAMES.FLOATINPUT)) {
            const inputEle = container.querySelector('textarea') ? container.querySelector('textarea') :
                container.querySelector('input');
            const placeholder = container.querySelector('.' + CLASSNAMES.FLOATTEXT).textContent;
            const clearButton = container.querySelector('.e-clear-icon') !== null;
            detach(container.querySelector('.' + CLASSNAMES.FLOATLINE));
            detach(container.querySelector('.' + CLASSNAMES.FLOATTEXT));
            classList(container, [CLASSNAMES.INPUTGROUP], [CLASSNAMES.FLOATINPUT]);
            unwireFloatingEvents(inputEle);
            attributes(inputEle, { 'placeholder': placeholder });
            inputEle.classList.add(CLASSNAMES.INPUT);
            if (!clearButton && inputEle.tagName === 'INPUT') {
                inputEle.removeAttribute('required');
            }
        }
    }
    Input.removeFloating = removeFloating;
    function addFloating(input, type, placeholder, internalCreateElement) {
        const makeElement = !isNullOrUndefined(internalCreateElement) ? internalCreateElement : createElement;
        const container = closest(input, '.' + CLASSNAMES.INPUTGROUP);
        floatType = type;
        let customTag = container.tagName;
        customTag = customTag !== 'DIV' && customTag !== 'SPAN' ? customTag : null;
        const args = { element: input, floatLabelType: type,
            customTag: customTag, properties: { placeholder: placeholder } };
        if (type !== 'Never') {
            let iconEle = container.querySelector('.e-clear-icon');
            const inputObj = { container: container };
            input.classList.remove(CLASSNAMES.INPUT);
            createFloatingInput(args, inputObj, makeElement);
            createSpanElement(inputObj.container, makeElement);
            calculateWidth(args.element, inputObj.container);
            const isPrependIcon = container.classList.contains('e-float-icon-left');
            if (isNullOrUndefined(iconEle)) {}
            else {
                const floatLine = container.querySelector('.' + CLASSNAMES.FLOATLINE);
                const floatText = container.querySelector('.' + CLASSNAMES.FLOATTEXT);
                const wrapper = isPrependIcon ? container.querySelector('.e-input-in-wrap') : container;
                wrapper.insertBefore(input, iconEle);
                wrapper.insertBefore(floatLine, iconEle);
                wrapper.insertBefore(floatText, iconEle);
            }
        }
        else {
            unWireFloatLabelEvents(args);
        }
        checkFloatLabelType(type, input.parentElement);
    }
    Input.addFloating = addFloating;
    /**
     * Create the span inside the label and add the label text into the span textcontent
     * ```
     * E.g : Input.createSpanElement(inputObject, makeElement);
     * ```
     *
     * @param {Element} inputObject
     * - Element which is need to get the label
     * @param {createElementParams} makeElement
     * - Element which is need to create the span
     */
    function createSpanElement(inputObject, makeElement) {
        if (inputObject.classList.contains('e-outline') && inputObject.getElementsByClassName('e-float-text')[0]) {
            const labelSpanElement = makeElement('span', { className: CLASSNAMES.FLOATTEXTCONTENT });
            labelSpanElement.innerHTML = inputObject.getElementsByClassName('e-float-text')[0].innerHTML;
            inputObject.getElementsByClassName('e-float-text')[0].innerHTML = '';
            inputObject.getElementsByClassName('e-float-text')[0].appendChild(labelSpanElement);
        }
    }
    Input.createSpanElement = createSpanElement;
    /**
     * Enable or Disable the ripple effect on the icons inside the Input. Ripple effect is only applicable for material theme.
     * ```
     * E.g : Input.setRipple(true, [inputObjects]);
     * ```
     *
     * @param {boolean} isRipple
     * - Boolean value to specify whether to enable the ripple effect.
     * @param {InputObject[]} inputObj
     * - Specify the collection of input objects.
     */
    function setRipple(isRipple, inputObj) {
        for (let i = 0; i < inputObj.length; i++) {
            _internalRipple(isRipple, inputObj[parseInt(i.toString(), 10)].container);
        }
    }
    Input.setRipple = setRipple;
    function _internalRipple(isRipple, container, button) {
        const argsButton = [];
        argsButton.push(button);
        const buttons = isNullOrUndefined(button) ?
            container.querySelectorAll('.e-input-group-icon') : argsButton;
        if (isRipple && buttons.length > 0) {
            for (let index = 0; index < buttons.length; index++) {
                buttons[parseInt(index.toString(), 10)].addEventListener('mousedown', _onMouseDownRipple, false);
                buttons[parseInt(index.toString(), 10)].addEventListener('mouseup', _onMouseUpRipple, false);
            }
        }
        else if (buttons.length > 0) {
            for (let index = 0; index < buttons.length; index++) {
                buttons[parseInt(index.toString(), 10)].removeEventListener('mousedown', _onMouseDownRipple, this);
                buttons[parseInt(index.toString(), 10)].removeEventListener('mouseup', _onMouseUpRipple, this);
            }
        }
    }
    function _onMouseRipple(container, button) {
        if (!container.classList.contains('e-disabled') && !container.querySelector('input').readOnly) {
            button.classList.add('e-input-btn-ripple');
        }
    }
    function _isElementVisible(element) {
        if (!element) {
            return false;
        }
        // Check if the element or any of its parents are hidden using display: none
        let currentElement = element;
        while (currentElement && currentElement !== document.body) {
            const style = window.getComputedStyle(currentElement);
            if (style.display === 'none') {
                return false;
            }
            currentElement = currentElement.parentElement;
        }
        // If none of the elements have display: none, the element is considered visible
        return true;
    }
    function _onMouseDownRipple() {
        const ele =  this;
        let parentEle = this.parentElement;
        while (!parentEle.classList.contains('e-input-group')) {
            parentEle = parentEle.parentElement;
        }
        _onMouseRipple(parentEle, ele);
    }
    function _onMouseUpRipple() {
        const ele =  this;
        setTimeout(() => {
            ele.classList.remove('e-input-btn-ripple');
        }, 500);
    }
    function createIconEle(iconClass, makeElement) {
        const button = makeElement('span', { className: iconClass });
        button.classList.add('e-input-group-icon');
        return button;
    }
    /**
     * Creates a new span element with the given icons added and append it in container element.
     * ```
     * E.g : Input.addIcon('append', 'e-icon-spin', inputObj.container, inputElement);
     * ```
     *
     * @param {string} position - Specify the icon placement on the input.Possible values are append and prepend.
     * @param {string | string[]} icons - Icon classes which are need to add to the span element which is going to created.
     * Span element acts as icon or button element for input.
     * @param {HTMLElement} container - The container on which created span element is going to append.
     * @param {HTMLElement} input - The inputElement on which created span element is going to prepend.
     */
    function addIcon(position, icons, container, input, internalCreate) {
        const result = typeof (icons) === 'string' ? icons.split(',')
            : icons;
        if (position.toLowerCase() === 'append') {
            for (const icon of result) {
                appendSpan(icon, container, internalCreate);
            }
        }
        else {
            for (const icon of result) {
                prependSpan(icon, container, input, internalCreate);
            }
        }
        if (container.getElementsByClassName('e-input-group-icon')[0] && container.getElementsByClassName('e-float-text-overflow')[0]) {
            container.getElementsByClassName('e-float-text-overflow')[0].classList.add('e-icon');
        }
    }
    Input.addIcon = addIcon;
    /**
     * Creates a new span element with the given icons added and prepend it in input element.
     * ```
     * E.g : Input.prependSpan('e-icon-spin', inputObj.container, inputElement);
     * ```
     *
     * @param {string} iconClass - Icon classes which are need to add to the span element which is going to created.
     * Span element acts as icon or button element for input.
     * @param {HTMLElement} container - The container on which created span element is going to append.
     * @param {HTMLElement} inputElement - The inputElement on which created span element is going to prepend.
     */
    function prependSpan(iconClass, container, inputElement, internalCreateElement) {
        const makeElement = !isNullOrUndefined(internalCreateElement) ? internalCreateElement : createElement;
        const button = createIconEle(iconClass, makeElement);
        container.classList.add('e-float-icon-left');
        let innerWrapper = container.querySelector('.e-input-in-wrap');
        if (isNullOrUndefined(innerWrapper)) {
            innerWrapper = makeElement('span', { className: 'e-input-in-wrap' });
            inputElement.parentNode.insertBefore(innerWrapper, inputElement);
            const result = container.querySelectorAll(inputElement.tagName + ' ~ *');
            innerWrapper.appendChild(inputElement);
            for (let i = 0; i < result.length; i++) {
                const element = result[parseInt(i.toString(), 10)];
                const parentElement = innerWrapper.parentElement;
                if (!(element.classList.contains('e-float-line')) || (!(parentElement && parentElement.classList.contains('e-filled')) && parentElement)) {
                    innerWrapper.appendChild(element);
                }
            }
        }
        innerWrapper.parentNode.insertBefore(button, innerWrapper);
        _internalRipple(true, container, button);
        return button;
    }
    Input.prependSpan = prependSpan;
    /**
     * Creates a new span element with the given icons added and append it in container element.
     * ```
     * E.g : Input.appendSpan('e-icon-spin', inputObj.container);
     * ```
     *
     * @param {string} iconClass - Icon classes which are need to add to the span element which is going to created.
     * Span element acts as icon or button element for input.
     * @param {HTMLElement} container - The container on which created span element is going to append.
     */
    function appendSpan(iconClass, container, internalCreateElement) {
        const makeElement = !isNullOrUndefined(internalCreateElement) ? internalCreateElement : createElement;
        const button = createIconEle(iconClass, makeElement);
        const wrap = (container.classList.contains('e-float-icon-left')) ? container.querySelector('.e-input-in-wrap') :
            container;
        wrap.appendChild(button);
        _internalRipple(true, container, button);
        return button;
    }
    Input.appendSpan = appendSpan;
    function validateInputType(containerElement, input) {
        if (input.type === 'hidden') {
            containerElement.classList.add('e-hidden');
        }
        else if (containerElement.classList.contains('e-hidden')) {
            containerElement.classList.remove('e-hidden');
        }
    }
    Input.validateInputType = validateInputType;
    function updateHTMLAttributesToElement(htmlAttributes, element) {
        if (!isNullOrUndefined(htmlAttributes)) {
            for (const key of Object.keys(htmlAttributes)) {
                if (containerAttributes.indexOf(key) < 0) {
                    element.setAttribute(key, htmlAttributes[`${key}`]);
                }
            }
        }
    }
    Input.updateHTMLAttributesToElement = updateHTMLAttributesToElement;
    function updateCssClass(newClass, oldClass, container) {
        setCssClass(getInputValidClassList(newClass), [container], getInputValidClassList(oldClass));
    }
    Input.updateCssClass = updateCssClass;
    function getInputValidClassList(inputClassName) {
        let result = inputClassName;
        if (!isNullOrUndefined(inputClassName) && inputClassName !== '') {
            result = (inputClassName.replace(/\s+/g, ' ')).trim();
        }
        return result;
    }
    Input.getInputValidClassList = getInputValidClassList;
    function updateHTMLAttributesToWrapper(htmlAttributes, container) {
        if (!isNullOrUndefined(htmlAttributes)) {
            for (const key of Object.keys(htmlAttributes)) {
                if (containerAttributes.indexOf(key) > -1) {
                    if (key === 'class') {
                        const updatedClassValues = this.getInputValidClassList(htmlAttributes[`${key}`]);
                        if (updatedClassValues !== '') {
                            addClass([container], updatedClassValues.split(' '));
                        }
                    }
                    else if (key === 'style') {
                        let setStyle = container.getAttribute(key);
                        setStyle = !isNullOrUndefined(setStyle) ? (setStyle + htmlAttributes[`${key}`]) :
                            htmlAttributes[`${key}`];
                        container.setAttribute(key, setStyle);
                    }
                    else {
                        container.setAttribute(key, htmlAttributes[`${key}`]);
                    }
                }
            }
        }
    }
    Input.updateHTMLAttributesToWrapper = updateHTMLAttributesToWrapper;
    function isBlank(inputString) {
        return (!inputString || /^\s*$/.test(inputString));
    }
    Input.isBlank = isBlank;
})(Input || (Input = {}));
/* eslint-enable valid-jsdoc, jsdoc/require-jsdoc, jsdoc/require-returns, jsdoc/require-param */

var __decorate = function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const ROOT = 'e-control-wrapper e-numeric';
const SPINICON = 'e-input-group-icon';
const SPINUP = 'e-spin-up';
const SPINDOWN = 'e-spin-down';
const ERROR = 'e-error';
const INCREMENT = 'increment';
const DECREMENT = 'decrement';
const INTREGEXP = new RegExp('^(-)?(\\d*)$');
const DECIMALSEPARATOR = '.';
const COMPONENT = 'e-numerictextbox';
const CONTROL = 'e-control';
const NUMERIC_FOCUS = 'e-input-focus';
const HIDDENELEMENT = 'e-numeric-hidden';
const wrapperAttributes = ['title', 'style', 'class'];
let selectionTimeOut = 0;
/**
 * Represents the NumericTextBox component that allows the user to enter only numeric values.
 * ```html
 * <input type='text' id="numeric"/>
 * ```
 * ```typescript
 * <script>
 *   var numericObj = new NumericTextBox({ value: 10 });
 *   numericObj.appendTo("#numeric");
 * </script>
 * ```
 */
let NumericTextBox = class NumericTextBox extends Component {
    /**
     *
     * @param {NumericTextBoxModel} options - Specifies the NumericTextBox model.
     * @param {string | HTMLInputElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
        this.preventChange = false;
        this.isDynamicChange = false;
        this.numericOptions = options;
    }
    preRender() {
        this.isPrevFocused = false;
        this.decimalSeparator = '.';
        // eslint-disable-next-line no-useless-escape
        this.intRegExp = new RegExp('/^(-)?(\d*)$/');
        this.isCalled = false;
        const ejInstance = getValue('ej2_instances', this.element);
        this.cloneElement = this.element.cloneNode(true);
        removeClass([this.cloneElement], [CONTROL, COMPONENT, 'e-lib']);
        this.angularTagName = null;
        this.formEle = closest(this.element, 'form');
        if (this.element.tagName === 'EJS-NUMERICTEXTBOX') {
            this.angularTagName = this.element.tagName;
            const input = this.createElement('input');
            let index = 0;
            for (index; index < this.element.attributes.length; index++) {
                const attributeName = this.element.attributes[index].nodeName;
                if (attributeName !== 'id' && attributeName !== 'class') {
                    input.setAttribute(this.element.attributes[index].nodeName, this.element.attributes[index].nodeValue);
                    input.innerHTML = this.element.innerHTML;
                }
                else if (attributeName === 'class') {
                    input.setAttribute(attributeName, this.element.className.split(' ').filter((item) => item.indexOf('ng-') !== 0).join(' '));
                }
            }
            if (this.element.hasAttribute('name')) {
                this.element.removeAttribute('name');
            }
            this.element.classList.remove('e-control', 'e-numerictextbox');
            this.element.appendChild(input);
            this.element = input;
            setValue('ej2_instances', ejInstance, this.element);
        }
        attributes(this.element, { 'role': 'spinbutton', 'tabindex': '0', 'autocomplete': 'off' });
        const localeText = {
            incrementTitle: 'Increment value', decrementTitle: 'Decrement value', placeholder: this.placeholder
        };
        this.l10n = new L10n('numerictextbox', localeText, this.locale);
        if (this.l10n.getConstant('placeholder') !== '') {
            this.setProperties({ placeholder: this.placeholder || this.l10n.getConstant('placeholder') }, true);
        }
        if (!this.element.hasAttribute('id')) {
            this.element.setAttribute('id', getUniqueID('numerictextbox'));
        }
        this.isValidState = true;
        this.inputStyle = null;
        this.inputName = null;
        this.cultureInfo = {};
        this.initCultureInfo();
        this.initCultureFunc();
        this.prevValue = this.value;
        this.updateHTMLAttrToElement();
        this.checkAttributes(false);
        if (this.formEle) {
            this.inputEleValue = this.value;
        }
        this.validateMinMax();
        this.validateStep();
        if (this.placeholder === null) {
            this.updatePlaceholder();
        }
    }
    /**
     * To Initialize the control rendering
     *
     * @returns {void}
     * @private
     */
    render() {
        if (this.element.tagName.toLowerCase() === 'input') {
            this.createWrapper();
            if (this.showSpinButton) {
                this.spinBtnCreation();
            }
            this.setElementWidth(this.width);
            if (!this.container.classList.contains('e-input-group')) {
                this.container.classList.add('e-input-group');
            }
            this.changeValue(this.value === null || isNaN(this.value) ?
                null : this.strictMode ? this.trimValue(this.value) : this.value);
            this.wireEvents();
            if (this.value !== null && !isNaN(this.value)) {
                if (this.decimals) {
                    this.setProperties({ value: this.roundNumber(this.value, this.decimals) }, true);
                }
            }
            if (this.element.getAttribute('value') || this.value) {
                this.element.setAttribute('value', this.element.value);
                this.hiddenInput.setAttribute('value', this.hiddenInput.value);
            }
            this.elementPrevValue = this.element.value;
            if (this.element.hasAttribute('data-val')) {
                this.element.setAttribute('data-val', 'false');
            }
            if (!this.element.hasAttribute('aria-labelledby') && !this.element.hasAttribute('placeholder') && !this.element.hasAttribute('aria-label')) {
                this.element.setAttribute('aria-label', 'numerictextbox');
            }
            if (!isNullOrUndefined(closest(this.element, 'fieldset')) && closest(this.element, 'fieldset').disabled) {
                this.enabled = false;
            }
            this.renderComplete();
        }
    }
    checkAttributes(isDynamic) {
        const attributes = isDynamic ? isNullOrUndefined(this.htmlAttributes) ? [] : Object.keys(this.htmlAttributes) :
            ['value', 'min', 'max', 'step', 'disabled', 'readonly', 'style', 'name', 'placeholder'];
        for (const prop of attributes) {
            if (!isNullOrUndefined(this.element.getAttribute(prop))) {
                switch (prop) {
                    case 'disabled':
                        if ((isNullOrUndefined(this.numericOptions) || (this.numericOptions['enabled'] === undefined)) || isDynamic) {
                            const enabled = this.element.getAttribute(prop) === 'disabled' || this.element.getAttribute(prop) === ''
                                || this.element.getAttribute(prop) === 'true' ? false : true;
                            this.setProperties({ enabled: enabled }, !isDynamic);
                        }
                        break;
                    case 'readonly':
                        if ((isNullOrUndefined(this.numericOptions) || (this.numericOptions['readonly'] === undefined)) || isDynamic) {
                            const readonly = this.element.getAttribute(prop) === 'readonly' || this.element.getAttribute(prop) === ''
                                || this.element.getAttribute(prop) === 'true' ? true : false;
                            this.setProperties({ readonly: readonly }, !isDynamic);
                        }
                        break;
                    case 'placeholder':
                        if ((isNullOrUndefined(this.numericOptions) || (this.numericOptions['placeholder'] === undefined)) || isDynamic) {
                            this.setProperties({ placeholder: this.element.placeholder }, !isDynamic);
                        }
                        break;
                    case 'value':
                        if ((isNullOrUndefined(this.numericOptions) || (this.numericOptions['value'] === undefined)) || isDynamic) {
                            const setNumber = this.instance.getNumberParser({ format: 'n' })(this.element.getAttribute(prop));
                            this.setProperties(setValue(prop, setNumber, {}), !isDynamic);
                        }
                        break;
                    case 'min':
                        if ((isNullOrUndefined(this.numericOptions) || (this.numericOptions['min'] === undefined)) || isDynamic) {
                            const minValue = this.instance.getNumberParser({ format: 'n' })(this.element.getAttribute(prop));
                            if (minValue !== null && !isNaN(minValue)) {
                                this.setProperties(setValue(prop, minValue, {}), !isDynamic);
                            }
                        }
                        break;
                    case 'max':
                        if ((isNullOrUndefined(this.numericOptions) || (this.numericOptions['max'] === undefined)) || isDynamic) {
                            const maxValue = this.instance.getNumberParser({ format: 'n' })(this.element.getAttribute(prop));
                            if (maxValue !== null && !isNaN(maxValue)) {
                                this.setProperties(setValue(prop, maxValue, {}), !isDynamic);
                            }
                        }
                        break;
                    case 'step':
                        if ((isNullOrUndefined(this.numericOptions) || (this.numericOptions['step'] === undefined)) || isDynamic) {
                            const stepValue = this.instance.getNumberParser({ format: 'n' })(this.element.getAttribute(prop));
                            if (stepValue !== null && !isNaN(stepValue)) {
                                this.setProperties(setValue(prop, stepValue, {}), !isDynamic);
                            }
                        }
                        break;
                    case 'style':
                        this.inputStyle = this.element.getAttribute(prop);
                        break;
                    case 'name':
                        this.inputName = this.element.getAttribute(prop);
                        break;
                    default:
                        {
                            const value = this.instance.getNumberParser({ format: 'n' })(this.element.getAttribute(prop));
                            if ((value !== null && !isNaN(value)) || (prop === 'value')) {
                                this.setProperties(setValue(prop, value, {}), true);
                            }
                        }
                        break;
                }
            }
        }
    }
    updatePlaceholder() {
        this.setProperties({ placeholder: this.l10n.getConstant('placeholder') }, true);
    }
    initCultureFunc() {
        this.instance = new Internationalization(this.locale);
    }
    initCultureInfo() {
        this.cultureInfo.format = this.format;
        if (getValue('currency', this) !== null) {
            setValue('currency', this.currency, this.cultureInfo);
            this.setProperties({ currencyCode: this.currency }, true);
        }
    }
    /* Wrapper creation */
    createWrapper() {
        let updatedCssClassValue = this.cssClass;
        if (!isNullOrUndefined(this.cssClass) && this.cssClass !== '') {
            updatedCssClassValue = this.getNumericValidClassList(this.cssClass);
        }
        const inputObj = Input.createInput({
            element: this.element,
            floatLabelType: this.floatLabelType,
            properties: {
                readonly: this.readonly,
                placeholder: this.placeholder,
                cssClass: updatedCssClassValue,
                enableRtl: this.enableRtl,
                showClearButton: this.showClearButton,
                enabled: this.enabled
            }
        }, this.createElement);
        this.inputWrapper = inputObj;
        this.container = inputObj.container;
        this.container.setAttribute('class', ROOT + ' ' + this.container.getAttribute('class'));
        this.updateHTMLAttrToWrapper();
        if (this.readonly) {
            attributes(this.element, { 'aria-readonly': 'true' });
        }
        this.hiddenInput = (this.createElement('input', { attrs: { type: 'text',
                'data-validateHidden': 'true', 'aria-label': 'hidden', 'class': HIDDENELEMENT } }));
        this.inputName = this.inputName !== null ? this.inputName : this.element.id;
        this.element.removeAttribute('name');
        if (this.isAngular && this.angularTagName === 'EJS-NUMERICTEXTBOX' && this.cloneElement.id.length > 0) {
            attributes(this.hiddenInput, { 'name': this.cloneElement.id });
        }
        else {
            attributes(this.hiddenInput, { 'name': this.inputName });
        }
        this.container.insertBefore(this.hiddenInput, this.container.childNodes[1]);
        this.updateDataAttribute(false);
        if (this.inputStyle !== null) {
            attributes(this.container, { 'style': this.inputStyle });
        }
    }
    updateDataAttribute(isDynamic) {
        let attr = {};
        if (!isDynamic) {
            for (let a = 0; a < this.element.attributes.length; a++) {
                attr[this.element.attributes[a].name] = this.element.getAttribute(this.element.attributes[a].name);
            }
        }
        else {
            attr = this.htmlAttributes;
        }
        for (const key of Object.keys(attr)) {
            if (key.indexOf('data') === 0) {
                this.hiddenInput.setAttribute(key, attr[`${key}`]);
            }
        }
    }
    updateHTMLAttrToElement() {
        if (!isNullOrUndefined(this.htmlAttributes)) {
            for (const pro of Object.keys(this.htmlAttributes)) {
                if (wrapperAttributes.indexOf(pro) < 0) {
                    this.element.setAttribute(pro, this.htmlAttributes[`${pro}`]);
                }
            }
        }
    }
    updateCssClass(newClass, oldClass) {
        Input.setCssClass(this.getNumericValidClassList(newClass), [this.container], this.getNumericValidClassList(oldClass));
    }
    getNumericValidClassList(numericClassName) {
        let result = numericClassName;
        if (!isNullOrUndefined(numericClassName) && numericClassName !== '') {
            result = (numericClassName.replace(/\s+/g, ' ')).trim();
        }
        return result;
    }
    updateHTMLAttrToWrapper() {
        if (!isNullOrUndefined(this.htmlAttributes)) {
            for (const pro of Object.keys(this.htmlAttributes)) {
                if (wrapperAttributes.indexOf(pro) > -1) {
                    if (pro === 'class') {
                        const updatedClassValue = this.getNumericValidClassList(this.htmlAttributes[`${pro}`]);
                        if (updatedClassValue !== '') {
                            addClass([this.container], updatedClassValue.split(' '));
                        }
                    }
                    else if (pro === 'style') {
                        let numericStyle = this.container.getAttribute(pro);
                        numericStyle = !isNullOrUndefined(numericStyle) ? (numericStyle + this.htmlAttributes[`${pro}`]) :
                            this.htmlAttributes[`${pro}`];
                        this.container.setAttribute(pro, numericStyle);
                    }
                    else {
                        this.container.setAttribute(pro, this.htmlAttributes[`${pro}`]);
                    }
                }
            }
        }
    }
    setElementWidth(width) {
        if (!isNullOrUndefined(width)) {
            if (typeof width === 'number') {
                this.container.style.width = formatUnit(width);
            }
            else if (typeof width === 'string') {
                this.container.style.width = (width.match(/px|%|em/)) ? (width) : (formatUnit(width));
            }
        }
    }
    /* Spinner creation */
    spinBtnCreation() {
        this.spinDown = Input.appendSpan(SPINICON + ' ' + SPINDOWN, this.container, this.createElement);
        attributes(this.spinDown, {
            'title': this.l10n.getConstant('decrementTitle')
        });
        this.spinUp = Input.appendSpan(SPINICON + ' ' + SPINUP, this.container, this.createElement);
        attributes(this.spinUp, {
            'title': this.l10n.getConstant('incrementTitle')
        });
        this.wireSpinBtnEvents();
    }
    validateMinMax() {
        if (!(typeof (this.min) === 'number' && !isNaN(this.min))) {
            this.setProperties({ min: -(Number.MAX_VALUE) }, true);
        }
        if (!(typeof (this.max) === 'number' && !isNaN(this.max))) {
            this.setProperties({ max: Number.MAX_VALUE }, true);
        }
        if (this.decimals !== null) {
            if (this.min !== -(Number.MAX_VALUE)) {
                this.setProperties({ min: this.instance.getNumberParser({ format: 'n' })(this.formattedValue(this.decimals, this.min)) }, true);
            }
            if (this.max !== (Number.MAX_VALUE)) {
                this.setProperties({ max: this.instance.getNumberParser({ format: 'n' })(this.formattedValue(this.decimals, this.max)) }, true);
            }
        }
        this.setProperties({ min: this.min > this.max ? this.max : this.min }, true);
        if (this.min !== -(Number.MAX_VALUE)) {
            attributes(this.element, { 'aria-valuemin': this.min.toString() });
        }
        if (this.max !== (Number.MAX_VALUE)) {
            attributes(this.element, { 'aria-valuemax': this.max.toString() });
        }
    }
    formattedValue(decimals, value) {
        return this.instance.getNumberFormat({
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals, useGrouping: false
        })(value);
    }
    validateStep() {
        if (this.decimals !== null) {
            this.setProperties({ step: this.instance.getNumberParser({ format: 'n' })(this.formattedValue(this.decimals, this.step)) }, true);
        }
    }
    action(operation, event) {
        this.isInteract = true;
        const value = this.isFocused ? this.instance.getNumberParser({ format: 'n' })(this.element.value) : this.value;
        this.changeValue(this.performAction(value, this.step, operation));
        this.raiseChangeEvent(event);
    }
    checkErrorClass() {
        if (this.isValidState) {
            removeClass([this.container], ERROR);
        }
        else {
            addClass([this.container], ERROR);
        }
        attributes(this.element, { 'aria-invalid': this.isValidState ? 'false' : 'true' });
    }
    bindClearEvent() {
        if (this.showClearButton) {
            EventHandler.add(this.inputWrapper.clearButton, 'mousedown touchstart', this.resetHandler, this);
        }
    }
    resetHandler(e) {
        e.preventDefault();
        if (!(this.inputWrapper.clearButton.classList.contains('e-clear-icon-hide')) || this.inputWrapper.container.classList.contains('e-static-clear')) {
            this.clear(e);
        }
        this.isInteract = true;
        this.raiseChangeEvent(e);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clear() {
        this.setProperties({ value: null }, true);
        this.setElementValue('');
        this.hiddenInput.value = '';
        const formElement = closest(this.element, 'form');
        if (formElement) {
            const element = this.element.nextElementSibling;
            const keyupEvent = document.createEvent('KeyboardEvent');
            keyupEvent.initEvent('keyup', false, true);
            element.dispatchEvent(keyupEvent);
        }
    }
    resetFormHandler() {
        if (this.element.tagName === 'EJS-NUMERICTEXTBOX') {
            this.updateValue(null);
        }
        else {
            this.updateValue(this.inputEleValue);
        }
    }
    setSpinButton() {
        if (!isNullOrUndefined(this.spinDown)) {
            attributes(this.spinDown, {
                'title': this.l10n.getConstant('decrementTitle'),
                'aria-label': this.l10n.getConstant('decrementTitle')
            });
        }
        if (!isNullOrUndefined(this.spinUp)) {
            attributes(this.spinUp, {
                'title': this.l10n.getConstant('incrementTitle'),
                'aria-label': this.l10n.getConstant('incrementTitle')
            });
        }
    }
    wireEvents() {
        EventHandler.add(this.element, 'focus', this.focusHandler, this);
        EventHandler.add(this.element, 'blur', this.focusOutHandler, this);
        EventHandler.add(this.element, 'keydown', this.keyDownHandler, this);
        EventHandler.add(this.element, 'keyup', this.keyUpHandler, this);
        EventHandler.add(this.element, 'input', this.inputHandler, this);
        EventHandler.add(this.element, 'keypress', this.keyPressHandler, this);
        EventHandler.add(this.element, 'change', this.changeHandler, this);
        EventHandler.add(this.element, 'paste', this.pasteHandler, this);
        if (this.enabled) {
            this.bindClearEvent();
            if (this.formEle) {
                EventHandler.add(this.formEle, 'reset', this.resetFormHandler, this);
            }
        }
    }
    wireSpinBtnEvents() {
        /* bind spin button events */
        EventHandler.add(this.spinUp, Browser.touchStartEvent, this.mouseDownOnSpinner, this);
        EventHandler.add(this.spinDown, Browser.touchStartEvent, this.mouseDownOnSpinner, this);
        EventHandler.add(this.spinUp, Browser.touchEndEvent, this.mouseUpOnSpinner, this);
        EventHandler.add(this.spinDown, Browser.touchEndEvent, this.mouseUpOnSpinner, this);
        EventHandler.add(this.spinUp, Browser.touchMoveEvent, this.touchMoveOnSpinner, this);
        EventHandler.add(this.spinDown, Browser.touchMoveEvent, this.touchMoveOnSpinner, this);
    }
    unwireEvents() {
        EventHandler.remove(this.element, 'focus', this.focusHandler);
        EventHandler.remove(this.element, 'blur', this.focusOutHandler);
        EventHandler.remove(this.element, 'keyup', this.keyUpHandler);
        EventHandler.remove(this.element, 'input', this.inputHandler);
        EventHandler.remove(this.element, 'keydown', this.keyDownHandler);
        EventHandler.remove(this.element, 'keypress', this.keyPressHandler);
        EventHandler.remove(this.element, 'change', this.changeHandler);
        EventHandler.remove(this.element, 'paste', this.pasteHandler);
        if (this.formEle) {
            EventHandler.remove(this.formEle, 'reset', this.resetFormHandler);
        }
    }
    unwireSpinBtnEvents() {
        /* unbind spin button events */
        EventHandler.remove(this.spinUp, Browser.touchStartEvent, this.mouseDownOnSpinner);
        EventHandler.remove(this.spinDown, Browser.touchStartEvent, this.mouseDownOnSpinner);
        EventHandler.remove(this.spinUp, Browser.touchEndEvent, this.mouseUpOnSpinner);
        EventHandler.remove(this.spinDown, Browser.touchEndEvent, this.mouseUpOnSpinner);
        EventHandler.remove(this.spinUp, Browser.touchMoveEvent, this.touchMoveOnSpinner);
        EventHandler.remove(this.spinDown, Browser.touchMoveEvent, this.touchMoveOnSpinner);
    }
    changeHandler(event) {
        event.stopPropagation();
        if (!this.element.value.length) {
            this.setProperties({ value: null }, true);
        }
        const parsedInput = this.instance.getNumberParser({ format: 'n' })(this.element.value);
        this.updateValue(parsedInput, event);
    }
    raiseChangeEvent(event) {
        this.inputValue = (isNullOrUndefined(this.inputValue) || isNaN(this.inputValue)) ? null : this.inputValue;
        if (this.prevValue !== this.value || this.prevValue !== this.inputValue) {
            const eventArgs = {};
            this.changeEventArgs = { value: this.value, previousValue: this.prevValue, isInteracted: this.isInteract,
                isInteraction: this.isInteract, event: event };
            if (event) {
                this.changeEventArgs.event = event;
            }
            if (this.changeEventArgs.event === undefined) {
                this.changeEventArgs.isInteracted = false;
                this.changeEventArgs.isInteraction = false;
            }
            merge(eventArgs, this.changeEventArgs);
            this.prevValue = this.value;
            this.isInteract = false;
            this.elementPrevValue = this.element.value;
            this.preventChange = false;
            this.trigger('change', eventArgs);
        }
    }
    pasteHandler() {
        if (!this.enabled || this.readonly) {
            return;
        }
        const beforeUpdate = this.element.value;
        setTimeout(() => {
            if (!this.numericRegex().test(this.element.value)) {
                this.setElementValue(beforeUpdate);
            }
        });
    }
    preventHandler() {
        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        setTimeout(() => {
            if (this.element.selectionStart > 0) {
                const currentPos = this.element.selectionStart;
                const prevPos = this.element.selectionStart - 1;
                const start = 0;
                const valArray = this.element.value.split('');
                const numericObject = getNumericObject(this.locale);
                const decimalSeparator = getValue('decimal', numericObject);
                const ignoreKeyCode = decimalSeparator.charCodeAt(0);
                if (this.element.value[prevPos] === ' ' && this.element.selectionStart > 0 && !iOS) {
                    if (isNullOrUndefined(this.prevVal)) {
                        this.element.value = this.element.value.trim();
                    }
                    else if (prevPos !== 0) {
                        this.element.value = this.prevVal;
                    }
                    else if (prevPos === 0) {
                        this.element.value = this.element.value.trim();
                    }
                    this.element.setSelectionRange(prevPos, prevPos);
                }
                else if (isNaN(parseFloat(this.element.value[this.element.selectionStart - 1])) &&
                    this.element.value[this.element.selectionStart - 1].charCodeAt(0) !== 45) {
                    if ((valArray.indexOf(this.element.value[this.element.selectionStart - 1]) !==
                        valArray.lastIndexOf(this.element.value[this.element.selectionStart - 1]) &&
                        this.element.value[this.element.selectionStart - 1].charCodeAt(0) === ignoreKeyCode) ||
                        this.element.value[this.element.selectionStart - 1].charCodeAt(0) !== ignoreKeyCode) {
                        this.element.value = this.element.value.substring(0, prevPos) +
                            this.element.value.substring(currentPos, this.element.value.length);
                        this.element.setSelectionRange(prevPos, prevPos);
                        if (isNaN(parseFloat(this.element.value[this.element.selectionStart - 1])) && this.element.selectionStart > 0
                            && this.element.value.length) {
                            this.preventHandler();
                        }
                    }
                }
                else if (isNaN(parseFloat(this.element.value[this.element.selectionStart - 2])) && this.element.selectionStart > 1 &&
                    this.element.value[this.element.selectionStart - 2].charCodeAt(0) !== 45) {
                    if ((valArray.indexOf(this.element.value[this.element.selectionStart - 2]) !==
                        valArray.lastIndexOf(this.element.value[this.element.selectionStart - 2]) &&
                        this.element.value[this.element.selectionStart - 2].charCodeAt(0) === ignoreKeyCode) ||
                        this.element.value[this.element.selectionStart - 2].charCodeAt(0) !== ignoreKeyCode) {
                        this.element.setSelectionRange(prevPos, prevPos);
                        this.nextEle = this.element.value[this.element.selectionStart];
                        this.cursorPosChanged = true;
                        this.preventHandler();
                    }
                }
                if (this.cursorPosChanged === true && this.element.value[this.element.selectionStart] === this.nextEle &&
                    isNaN(parseFloat(this.element.value[this.element.selectionStart - 1]))) {
                    this.element.setSelectionRange(this.element.selectionStart + 1, this.element.selectionStart + 1);
                    this.cursorPosChanged = false;
                    this.nextEle = null;
                }
                if (this.element.value.trim() === '') {
                    this.element.setSelectionRange(start, start);
                }
                if (this.element.selectionStart > 0) {
                    if ((this.element.value[this.element.selectionStart - 1].charCodeAt(0) === 45) && this.element.selectionStart > 1) {
                        if (!isNullOrUndefined(this.prevVal)) {
                            this.element.value = this.prevVal;
                        }
                        this.element.setSelectionRange(this.element.selectionStart, this.element.selectionStart);
                    }
                    if (this.element.value[this.element.selectionStart - 1] === decimalSeparator &&
                        this.decimals === 0 &&
                        this.validateDecimalOnType) {
                        this.element.value = this.element.value.substring(0, prevPos) +
                            this.element.value.substring(currentPos, this.element.value.length);
                    }
                }
                this.prevVal = this.element.value;
            }
        });
    }
    keyUpHandler() {
        if (!this.enabled || this.readonly) {
            return;
        }
        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        if (!iOS && Browser.isDevice) {
            this.preventHandler();
        }
        let parseValue = this.instance.getNumberParser({ format: 'n' })(this.element.value);
        parseValue = parseValue === null || isNaN(parseValue) ? null : parseValue;
        this.hiddenInput.value = parseValue || parseValue === 0 ? parseValue.toString() : null;
        const formElement = closest(this.element, 'form');
        if (formElement) {
            const element = this.element.nextElementSibling;
            const keyupEvent = document.createEvent('KeyboardEvent');
            keyupEvent.initEvent('keyup', false, true);
            element.dispatchEvent(keyupEvent);
        }
    }
    inputHandler(event) {
        const numerictextboxObj =  this;
        if (!this.enabled || this.readonly) {
            return;
        }
        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        const fireFox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if ((fireFox || iOS) && Browser.isDevice) {
            this.preventHandler();
        }
        /* istanbul ignore next */
        if (this.isAngular
            && this.element.value !== getValue('decimal', getNumericObject(this.locale))
            && this.element.value !== getValue('minusSign', getNumericObject(this.locale))
            && this.numericRegex().test(this.element.value)) {
            let parsedValue = this.instance.getNumberParser({ format: 'n' })(this.element.value);
            parsedValue = isNaN(parsedValue) ? null : parsedValue;
            numerictextboxObj.localChange({ value: parsedValue });
            this.preventChange = true;
        }
        if (this.isVue) {
            let current = this.instance.getNumberParser({ format: 'n' })(this.element.value);
            const previous = this.instance.getNumberParser({ format: 'n' })(this.elementPrevValue);
            //EJ2-54963-if type "." or ".0" or "-.0" it converts to "0" automatically when binding v-model
            const nonZeroRegex = new RegExp('[^0-9]+$');
            if (nonZeroRegex.test(this.element.value) ||
                ((this.elementPrevValue.indexOf('.') !== -1 || this.elementPrevValue.indexOf('-') !== -1) &&
                    this.element.value[this.element.value.length - 1] === '0')) {
                current = this.value;
            }
            const eventArgs = {
                event: event,
                value: (current === null || isNaN(current) ? null : current),
                previousValue: (previous === null || isNaN(previous) ? null : previous)
            };
            this.preventChange = true;
            this.elementPrevValue = this.element.value;
            this.trigger('input', eventArgs);
        }
    }
    keyDownHandler(event) {
        if (!this.readonly) {
            switch (event.keyCode) {
                case 38:
                    event.preventDefault();
                    this.action(INCREMENT, event);
                    break;
                case 40:
                    event.preventDefault();
                    this.action(DECREMENT, event);
                    break;
            }
        }
    }
    performAction(value, step, operation) {
        if (value === null || isNaN(value)) {
            value = 0;
        }
        let updatedValue = operation === INCREMENT ? value + step : value - step;
        updatedValue = this.correctRounding(value, step, updatedValue);
        return this.strictMode ? this.trimValue(updatedValue) : updatedValue;
    }
    correctRounding(value, step, result) {
        const floatExp = new RegExp('[,.](.*)');
        const floatValue = floatExp.test(value.toString());
        const floatStep = floatExp.test(step.toString());
        if (floatValue || floatStep) {
            const valueCount = floatValue ? floatExp.exec(value.toString())[0].length : 0;
            const stepCount = floatStep ? floatExp.exec(step.toString())[0].length : 0;
            const max = Math.max(valueCount, stepCount);
            return value = this.roundValue(result, max);
        }
        return result;
    }
    roundValue(result, precision) {
        precision = precision || 0;
        const divide = Math.pow(10, precision);
        return result *= divide, result = Math.round(result) / divide;
    }
    updateValue(value, event) {
        if (event) {
            this.isInteract = true;
        }
        if (value !== null && !isNaN(value)) {
            if (this.decimals) {
                value = this.roundNumber(value, this.decimals);
            }
        }
        this.inputValue = value;
        if (!(this.isVue && this.element && this.element.hasAttribute('modelvalue') && this.isDynamicChange)) {
            this.changeValue(value === null || isNaN(value) ? null : this.strictMode ? this.trimValue(value) : value);
        }
        /* istanbul ignore next */
        if (!this.isDynamicChange) {
            this.raiseChangeEvent(event);
        }
    }
    updateCurrency(prop, propVal) {
        setValue(prop, propVal, this.cultureInfo);
        this.updateValue(this.value);
    }
    changeValue(value) {
        if (!(value || value === 0)) {
            value = null;
            this.setProperties({ value: value }, true);
        }
        else {
            const numberOfDecimals = this.getNumberOfDecimals(value);
            this.setProperties({ value: this.roundNumber(value, numberOfDecimals) }, true);
        }
        this.modifyText();
        if (!this.strictMode) {
            this.validateState();
        }
    }
    modifyText() {
        if (this.value || this.value === 0) {
            const value = this.formatNumber();
            const elementValue = this.isFocused ? value : this.instance.getNumberFormat(this.cultureInfo)(this.value);
            this.setElementValue(elementValue);
            attributes(this.element, { 'aria-valuenow': value });
            if (!isNullOrUndefined(this.hiddenInput)) {
                this.hiddenInput.value = this.value.toString();
                if (this.value !== null && this.serverDecimalSeparator) {
                    this.hiddenInput.value = this.hiddenInput.value.replace('.', this.serverDecimalSeparator);
                }
            }
        }
        else {
            this.setElementValue('');
            this.element.removeAttribute('aria-valuenow');
            this.hiddenInput.value = null;
        }
    }
    setElementValue(val, element) {
        Input.setValue(val, (element ? element : this.element), this.floatLabelType, this.showClearButton);
    }
    validateState() {
        this.isValidState = true;
        if (this.value || this.value === 0) {
            this.isValidState = !(this.value > this.max || this.value < this.min);
        }
        this.checkErrorClass();
    }
    getNumberOfDecimals(value) {
        let numberOfDecimals;
        // eslint-disable-next-line no-useless-escape
        const EXPREGEXP = new RegExp('[eE][\-+]?([0-9]+)');
        let valueString = value.toString();
        if (EXPREGEXP.test(valueString)) {
            const result = EXPREGEXP.exec(valueString);
            if (!isNullOrUndefined(result)) {
                valueString = value.toFixed(Math.min(parseInt(result[1], 10), 20));
            }
        }
        const decimalPart = valueString.split('.')[1];
        numberOfDecimals = !decimalPart || !decimalPart.length ? 0 : decimalPart.length;
        if (this.decimals !== null) {
            numberOfDecimals = numberOfDecimals < this.decimals ? numberOfDecimals : this.decimals;
        }
        return numberOfDecimals;
    }
    formatNumber() {
        const numberOfDecimals = this.getNumberOfDecimals(this.value);
        return this.instance.getNumberFormat({
            maximumFractionDigits: numberOfDecimals,
            minimumFractionDigits: numberOfDecimals, useGrouping: false
        })(this.value);
    }
    trimValue(value) {
        if (value > this.max) {
            return this.max;
        }
        if (value < this.min) {
            return this.min;
        }
        return value;
    }
    roundNumber(value, precision) {
        let result = value;
        const decimals = precision || 0;
        const result1 = result.toString().split('e');
        result = Math.round(Number(result1[0] + 'e' + (result1[1] ? (Number(result1[1]) + decimals) : decimals)));
        const result2 = result.toString().split('e');
        result = Number(result2[0] + 'e' + (result2[1] ? (Number(result2[1]) - decimals) : -decimals));
        return Number(result.toFixed(decimals));
    }
    cancelEvent(event) {
        event.preventDefault();
        return false;
    }
    keyPressHandler(event) {
        if (!this.enabled || this.readonly) {
            return true;
        }
        if (!Browser.isDevice && Browser.info.version === '11.0' && event.keyCode === 13) {
            const parsedInput = this.instance.getNumberParser({ format: 'n' })(this.element.value);
            this.updateValue(parsedInput, event);
            return true;
        }
        if (event.which === 0 || event.metaKey || event.ctrlKey || event.keyCode === 8 || event.keyCode === 13) {
            return true;
        }
        let currentChar = String.fromCharCode(event.which);
        const decimalSeparator = getValue('decimal', getNumericObject(this.locale));
        const isAlterNumPadDecimalChar = event.code === 'NumpadDecimal' && currentChar !== decimalSeparator;
        //EJ2-59813-replace the culture decimal separator value with numberpad decimal separator value when culture decimal separator and numberpad decimal separator are different
        if (isAlterNumPadDecimalChar) {
            currentChar = decimalSeparator;
        }
        let text = this.element.value;
        text = text.substring(0, this.element.selectionStart) + currentChar + text.substring(this.element.selectionEnd);
        if (!this.numericRegex().test(text)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        else {
            //EJ2-59813-update the numberpad decimal separator and update the cursor position
            if (isAlterNumPadDecimalChar) {
                const start = this.element.selectionStart + 1;
                this.element.value = text;
                this.element.setSelectionRange(start, start);
                event.preventDefault();
                event.stopPropagation();
            }
            return true;
        }
    }
    numericRegex() {
        const numericObject = getNumericObject(this.locale);
        let decimalSeparator = getValue('decimal', numericObject);
        let fractionRule = '*';
        if (decimalSeparator === DECIMALSEPARATOR) {
            decimalSeparator = '\\' + decimalSeparator;
        }
        if (this.decimals === 0 && this.validateDecimalOnType) {
            return INTREGEXP;
        }
        if (this.decimals && this.validateDecimalOnType) {
            fractionRule = '{0,' + this.decimals + '}';
        }
        /* eslint-disable-next-line security/detect-non-literal-regexp */
        return new RegExp('^\\s*(-)?(((\\d+(' + decimalSeparator + '\\d' + fractionRule +
            ')?)|(' + decimalSeparator + '\\d' + fractionRule + ')))?$');
    }
    mouseWheel(event) {
        event.preventDefault();
        let delta;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawEvent = event;
        if (rawEvent.wheelDelta) {
            delta = rawEvent.wheelDelta / 120;
        }
        else if (rawEvent.detail) {
            delta = -rawEvent.detail / 3;
        }
        if (delta > 0) {
            this.action(INCREMENT, event);
        }
        else if (delta < 0) {
            this.action(DECREMENT, event);
        }
        this.cancelEvent(event);
    }
    focusHandler(event) {
        clearTimeout(selectionTimeOut);
        this.focusEventArgs = { event: event, value: this.value, container: this.container };
        this.trigger('focus', this.focusEventArgs);
        if (!this.enabled || this.readonly) {
            return;
        }
        this.isFocused = true;
        this.prevValue = this.value;
        if ((this.value || this.value === 0)) {
            const formatValue = this.formatNumber();
            this.setElementValue(formatValue);
            if (!this.isPrevFocused) {
                if (!Browser.isDevice && Browser.info.version === '11.0') {
                    this.element.setSelectionRange(0, formatValue.length);
                }
                else {
                    const delay = (Browser.isDevice && Browser.isIos) ? 600 : 0;
                    selectionTimeOut = setTimeout(() => {
                        this.element.setSelectionRange(0, formatValue.length);
                    }, delay);
                }
            }
        }
        if (!Browser.isDevice) {
            EventHandler.add(this.element, 'mousewheel DOMMouseScroll', this.mouseWheel, this);
        }
    }
    focusOutHandler(event) {
        this.blurEventArgs = { event: event, value: this.value, container: this.container };
        this.trigger('blur', this.blurEventArgs);
        if (!this.enabled || this.readonly) {
            return;
        }
        if (this.isPrevFocused) {
            event.preventDefault();
            if (Browser.isDevice) {
                const value = this.element.value;
                this.element.focus();
                this.isPrevFocused = false;
                const ele = this.element;
                setTimeout(() => {
                    this.setElementValue(value, ele);
                }, 200);
            }
        }
        else {
            this.isFocused = false;
            if (!this.element.value.length) {
                this.setProperties({ value: null }, true);
            }
            const parsedInput = this.instance.getNumberParser({ format: 'n' })(this.element.value);
            this.updateValue(parsedInput);
            if (!Browser.isDevice) {
                EventHandler.remove(this.element, 'mousewheel DOMMouseScroll', this.mouseWheel);
            }
        }
        const formElement = closest(this.element, 'form');
        if (formElement) {
            const element = this.element.nextElementSibling;
            const focusEvent = document.createEvent('FocusEvent');
            focusEvent.initEvent('focusout', false, true);
            element.dispatchEvent(focusEvent);
        }
    }
    mouseDownOnSpinner(event) {
        if (this.isFocused) {
            this.isPrevFocused = true;
            event.preventDefault();
        }
        if (!this.getElementData(event)) {
            return;
        }
        this.getElementData(event);
        const target = event.currentTarget;
        const action = (target.classList.contains(SPINUP)) ? INCREMENT : DECREMENT;
        EventHandler.add(target, 'mouseleave', this.mouseUpClick, this);
        this.timeOut = setInterval(() => {
            this.isCalled = true;
            this.action(action, event);
        }, 150);
        EventHandler.add(document, 'mouseup', this.mouseUpClick, this);
    }
    touchMoveOnSpinner(event) {
        let target;
        if (event.type === 'touchmove') {
            const touchEvent = event.touches;
            target = touchEvent.length && document.elementFromPoint(touchEvent[0].pageX, touchEvent[0].pageY);
        }
        else {
            target = document.elementFromPoint(event.clientX, event.clientY);
        }
        if (!(target.classList.contains(SPINICON))) {
            clearInterval(this.timeOut);
        }
    }
    mouseUpOnSpinner(event) {
        this.prevValue = this.value;
        if (this.isPrevFocused) {
            this.element.focus();
            if (!Browser.isDevice) {
                this.isPrevFocused = false;
            }
        }
        if (!Browser.isDevice) {
            event.preventDefault();
        }
        if (!this.getElementData(event)) {
            return;
        }
        const target = event.currentTarget;
        const action = (target.classList.contains(SPINUP)) ? INCREMENT : DECREMENT;
        EventHandler.remove(target, 'mouseleave', this.mouseUpClick);
        if (!this.isCalled) {
            this.action(action, event);
        }
        this.isCalled = false;
        EventHandler.remove(document, 'mouseup', this.mouseUpClick);
        const formElement = closest(this.element, 'form');
        if (formElement) {
            const element = this.element.nextElementSibling;
            const keyupEvent = document.createEvent('KeyboardEvent');
            keyupEvent.initEvent('keyup', false, true);
            element.dispatchEvent(keyupEvent);
        }
    }
    getElementData(event) {
        if ((event.which && event.which === 3) || (event.button && event.button === 2)
            || !this.enabled || this.readonly) {
            return false;
        }
        clearInterval(this.timeOut);
        return true;
    }
    floatLabelTypeUpdate() {
        Input.removeFloating(this.inputWrapper);
        const hiddenInput = this.hiddenInput;
        this.hiddenInput.remove();
        Input.addFloating(this.element, this.floatLabelType, this.placeholder, this.createElement);
        this.container.insertBefore(hiddenInput, this.container.childNodes[1]);
    }
    mouseUpClick(event) {
        event.stopPropagation();
        clearInterval(this.timeOut);
        this.isCalled = false;
        if (this.spinUp) {
            EventHandler.remove(this.spinUp, 'mouseleave', this.mouseUpClick);
        }
        if (this.spinDown) {
            EventHandler.remove(this.spinDown, 'mouseleave', this.mouseUpClick);
        }
    }
    /**
     * Increments the NumericTextBox value with the specified step value.
     *
     * @param {number} step - Specifies the value used to increment the NumericTextBox value.
     * if its not given then numeric value will be incremented based on the step property value.
     * @returns {void}
     */
    increment(step = this.step) {
        this.isInteract = false;
        this.changeValue(this.performAction(this.value, step, INCREMENT));
        this.raiseChangeEvent();
    }
    /**
     * Decrements the NumericTextBox value with specified step value.
     *
     * @param {number} step - Specifies the value used to decrement the NumericTextBox value.
     * if its not given then numeric value will be decremented based on the step property value.
     * @returns {void}
     */
    decrement(step = this.step) {
        this.isInteract = false;
        this.changeValue(this.performAction(this.value, step, DECREMENT));
        this.raiseChangeEvent();
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers.
     * Also it maintains the initial input element from the DOM.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        this.unwireEvents();
        if (this.showClearButton) {
            this.clearButton = document.getElementsByClassName('e-clear-icon')[0];
        }
        detach(this.hiddenInput);
        if (this.showSpinButton) {
            this.unwireSpinBtnEvents();
            detach(this.spinUp);
            detach(this.spinDown);
        }
        const attrArray = ['aria-labelledby', 'role', 'autocomplete', 'aria-readonly',
            'aria-disabled', 'autocapitalize', 'spellcheck', 'aria-autocomplete', 'tabindex',
            'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-invalid'];
        for (let i = 0; i < attrArray.length; i++) {
            this.element.removeAttribute(attrArray[i]);
        }
        this.element.classList.remove('e-input');
        this.container.insertAdjacentElement('afterend', this.element);
        detach(this.container);
        this.spinUp = null;
        this.spinDown = null;
        this.container = null;
        this.hiddenInput = null;
        this.changeEventArgs = null;
        this.blurEventArgs = null;
        this.focusEventArgs = null;
        this.inputWrapper = null;
        Input.destroy({
            element: this.element,
            floatLabelType: this.floatLabelType,
            properties: this.properties
        }, this.clearButton);
        super.destroy();
    }
    /**
     * Returns the value of NumericTextBox with the format applied to the NumericTextBox.
     *
     * @returns {string} - Returns the formatted value of the NumericTextBox.
     */
    getText() {
        return this.element.value;
    }
    /**
     * Sets the focus to widget for interaction.
     *
     * @returns {void}
     */
    focusIn() {
        if (document.activeElement !== this.element && this.enabled) {
            this.element.focus();
            addClass([this.container], [NUMERIC_FOCUS]);
        }
    }
    /**
     * Remove the focus from widget, if the widget is in focus state.
     *
     * @returns {void}
     */
    focusOut() {
        if (document.activeElement === this.element && this.enabled) {
            this.element.blur();
            removeClass([this.container], [NUMERIC_FOCUS]);
        }
    }
    /**
     * Gets the properties to be maintained in the persisted state.
     *
     * @returns {string} - Returns the persisted data.
     */
    getPersistData() {
        const keyEntity = ['value'];
        return this.addOnPersist(keyEntity);
    }
    /**
     * Calls internally if any of the property value is changed.
     *
     * @param {NumericTextBoxModel} newProp - Returns the dynamic property value of the component.
     * @param {NumericTextBoxModel} oldProp - Returns the previous property value of the component.
     * @returns {void}
     * @private
     */
    onPropertyChanged(newProp, oldProp) {
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'width':
                    this.setElementWidth(newProp.width);
                    Input.calculateWidth(this.element, this.container);
                    break;
                case 'cssClass':
                    this.updateCssClass(newProp.cssClass, oldProp.cssClass);
                    break;
                case 'enabled':
                    Input.setEnabled(newProp.enabled, this.element);
                    this.bindClearEvent();
                    break;
                case 'enableRtl':
                    Input.setEnableRtl(newProp.enableRtl, [this.container]);
                    break;
                case 'readonly':
                    Input.setReadonly(newProp.readonly, this.element);
                    if (this.readonly) {
                        attributes(this.element, { 'aria-readonly': 'true' });
                    }
                    else {
                        this.element.removeAttribute('aria-readonly');
                    }
                    break;
                case 'htmlAttributes':
                    this.updateHTMLAttrToElement();
                    this.updateHTMLAttrToWrapper();
                    this.updateDataAttribute(true);
                    this.checkAttributes(true);
                    Input.validateInputType(this.container, this.element);
                    break;
                case 'placeholder':
                    Input.setPlaceholder(newProp.placeholder, this.element);
                    Input.calculateWidth(this.element, this.container);
                    break;
                case 'step':
                    this.step = newProp.step;
                    this.validateStep();
                    break;
                case 'showSpinButton':
                    this.updateSpinButton(newProp);
                    break;
                case 'showClearButton':
                    this.updateClearButton(newProp);
                    break;
                case 'floatLabelType':
                    this.floatLabelType = newProp.floatLabelType;
                    this.floatLabelTypeUpdate();
                    break;
                case 'value':
                    this.isDynamicChange = (this.isAngular || this.isVue) && this.preventChange;
                    this.updateValue(newProp.value);
                    if (this.isDynamicChange) {
                        this.preventChange = false;
                        this.isDynamicChange = false;
                    }
                    break;
                case 'min':
                case 'max':
                    setValue(prop, getValue(prop, newProp), this);
                    this.validateMinMax();
                    this.updateValue(this.value);
                    break;
                case 'strictMode':
                    this.strictMode = newProp.strictMode;
                    this.updateValue(this.value);
                    this.validateState();
                    break;
                case 'locale':
                    this.initCultureFunc();
                    this.l10n.setLocale(this.locale);
                    this.setSpinButton();
                    this.updatePlaceholder();
                    Input.setPlaceholder(this.placeholder, this.element);
                    this.updateValue(this.value);
                    break;
                case 'currency':
                    {
                        const propVal = getValue(prop, newProp);
                        this.setProperties({ currencyCode: propVal }, true);
                        this.updateCurrency(prop, propVal);
                    }
                    break;
                case 'currencyCode':
                    {
                        const propValue = getValue(prop, newProp);
                        this.setProperties({ currency: propValue }, true);
                        this.updateCurrency('currency', propValue);
                    }
                    break;
                case 'format':
                    setValue(prop, getValue(prop, newProp), this);
                    this.initCultureInfo();
                    this.updateValue(this.value);
                    break;
                case 'decimals':
                    this.decimals = newProp.decimals;
                    this.updateValue(this.value);
            }
        }
    }
    updateClearButton(newProp) {
        Input.setClearButton(newProp.showClearButton, this.element, this.inputWrapper, undefined, this.createElement);
        this.bindClearEvent();
    }
    updateSpinButton(newProp) {
        if (newProp.showSpinButton) {
            this.spinBtnCreation();
        }
        else {
            detach(this.spinUp);
            detach(this.spinDown);
        }
    }
    /**
     * Gets the component name
     *
     * @returns {string} Returns the component name.
     * @private
     */
    getModuleName() {
        return 'numerictextbox';
    }
};
__decorate([
    Property('')
], NumericTextBox.prototype, "cssClass", void 0);
__decorate([
    Property(null)
], NumericTextBox.prototype, "value", void 0);
__decorate([
    Property(-(Number.MAX_VALUE))
], NumericTextBox.prototype, "min", void 0);
__decorate([
    Property(Number.MAX_VALUE)
], NumericTextBox.prototype, "max", void 0);
__decorate([
    Property(1)
], NumericTextBox.prototype, "step", void 0);
__decorate([
    Property(null)
], NumericTextBox.prototype, "width", void 0);
__decorate([
    Property(null)
], NumericTextBox.prototype, "placeholder", void 0);
__decorate([
    Property({})
], NumericTextBox.prototype, "htmlAttributes", void 0);
__decorate([
    Property(true)
], NumericTextBox.prototype, "showSpinButton", void 0);
__decorate([
    Property(false)
], NumericTextBox.prototype, "readonly", void 0);
__decorate([
    Property(true)
], NumericTextBox.prototype, "enabled", void 0);
__decorate([
    Property(false)
], NumericTextBox.prototype, "showClearButton", void 0);
__decorate([
    Property(false)
], NumericTextBox.prototype, "enablePersistence", void 0);
__decorate([
    Property('n2')
], NumericTextBox.prototype, "format", void 0);
__decorate([
    Property(null)
], NumericTextBox.prototype, "decimals", void 0);
__decorate([
    Property(null)
], NumericTextBox.prototype, "currency", void 0);
__decorate([
    Property(null)
], NumericTextBox.prototype, "currencyCode", void 0);
__decorate([
    Property(true)
], NumericTextBox.prototype, "strictMode", void 0);
__decorate([
    Property(false)
], NumericTextBox.prototype, "validateDecimalOnType", void 0);
__decorate([
    Property('Never')
], NumericTextBox.prototype, "floatLabelType", void 0);
__decorate([
    Event()
], NumericTextBox.prototype, "created", void 0);
__decorate([
    Event()
], NumericTextBox.prototype, "destroyed", void 0);
__decorate([
    Event()
], NumericTextBox.prototype, "change", void 0);
__decorate([
    Event()
], NumericTextBox.prototype, "focus", void 0);
__decorate([
    Event()
], NumericTextBox.prototype, "blur", void 0);
NumericTextBox = __decorate([
    NotifyPropertyChanges
], NumericTextBox);

var __decorate$3 = function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FormValidator_1;
/**
 * global declarations
 */
const regex = {
    /* eslint-disable no-useless-escape */
    EMAIL: new RegExp('^[A-Za-z0-9._%+-]{1,}@[A-Za-z0-9._%+-]{1,}([.]{1}[a-zA-Z0-9]{2,}' +
        '|[.]{1}[a-zA-Z0-9]{2,4}[.]{1}[a-zA-Z0-9]{2,4})$'),
    /* eslint-disable-next-line security/detect-unsafe-regex */
    URL: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/m,
    DATE_ISO: new RegExp('^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$'),
    DIGITS: new RegExp('^[0-9]*$'),
    PHONE: new RegExp('^[+]?[0-9]{9,13}$'),
    CREDITCARD: new RegExp('^\\d{13,16}$')
    /* eslint-enable no-useless-escape */
};
/**
 * ErrorOption values
 *
 * @private
 */
var ErrorOption;
(function (ErrorOption) {
    /**
     * Defines the error message.
     */
    ErrorOption[ErrorOption["Message"] = 0] = "Message";
    /**
     * Defines the error element type.
     */
    ErrorOption[ErrorOption["Label"] = 1] = "Label";
})(ErrorOption || (ErrorOption = {}));
/**
 * FormValidator class enables you to validate the form fields based on your defined rules
 * ```html
 * <form id='formId'>
 *  <input type='text' name='Name' />
 *  <input type='text' name='Age' />
 * </form>
 * <script>
 *   let formObject = new FormValidator('#formId', {
 *      rules: { Name: { required: true }, Age: { range: [18, 30] } };
 *   });
 *   formObject.validate();
 * </script>
 * ```
 */
let FormValidator = FormValidator_1 = class FormValidator extends Base {
    /**
     * Initializes the FormValidator.
     *
     * @param {string | HTMLFormElement} element - Specifies the element to render as component.
     * @param {FormValidatorModel} options - Specifies the FormValidator model.
     * @private
     */
    constructor(element, options) {
        super(options, element);
        this.validated = [];
        this.errorRules = [];
        this.allowSubmit = false;
        this.required = 'required';
        this.infoElement = null;
        this.inputElement = null;
        this.selectQuery = 'input:not([type=reset]):not([type=button]), select, textarea';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.localyMessage = {};
        /**
         * Specifies the default messages for validation rules.
         *
         * @default { List of validation message }
         */
        this.defaultMessages = {
            required: 'This field is required.',
            email: 'Please enter a valid email address.',
            url: 'Please enter a valid URL.',
            date: 'Please enter a valid date.',
            dateIso: 'Please enter a valid date ( ISO ).',
            creditcard: 'Please enter valid card number',
            number: 'Please enter a valid number.',
            digits: 'Please enter only digits.',
            maxLength: 'Please enter no more than {0} characters.',
            minLength: 'Please enter at least {0} characters.',
            rangeLength: 'Please enter a value between {0} and {1} characters long.',
            range: 'Please enter a value between {0} and {1}.',
            max: 'Please enter a value less than or equal to {0}.',
            min: 'Please enter a value greater than or equal to {0}.',
            regex: 'Please enter a correct value.',
            tel: 'Please enter a valid phone number.',
            pattern: 'Please enter a correct pattern value.',
            equalTo: 'Please enter the valid match text'
        };
        if (typeof this.rules === 'undefined') {
            this.rules = {};
        }
        this.l10n = new L10n('formValidator', this.defaultMessages, this.locale);
        if (this.locale) {
            this.localeFunc();
        }
        onIntlChange.on('notifyExternalChange', this.afterLocalization, this);
        element = typeof element === 'string' ? select(element, document) : element;
        // Set novalidate to prevent default HTML5 form validation
        if (this.element != null) {
            this.element.setAttribute('novalidate', '');
            this.inputElements = selectAll(this.selectQuery, this.element);
            this.createHTML5Rules();
            this.wireEvents();
        }
        else {
            return undefined;
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    /**
     * Add validation rules to the corresponding input element based on `name` attribute.
     *
     * @param {string} name `name` of form field.
     * @param {Object} rules Validation rules for the corresponding element.
     * @returns {void}
     */
    addRules(name, rules) {
        if (name) {
            // eslint-disable-next-line no-prototype-builtins
            if (this.rules.hasOwnProperty(name)) {
                extend(this.rules[`${name}`], rules, {});
            }
            else {
                this.rules[`${name}`] = rules;
            }
        }
    }
    /**
     * Remove validation to the corresponding field based on name attribute.
     * When no parameter is passed, remove all the validations in the form.
     *
     * @param {string} name Input name attribute value.
     * @param {string[]} rules List of validation rules need to be remove from the corresponding element.
     * @returns {void}
     */
    removeRules(name, rules) {
        if (!name && !rules) {
            this.rules = {};
        }
        else if (this.rules[`${name}`] && !rules) {
            delete this.rules[`${name}`];
        }
        else if (!isNullOrUndefined(this.rules[`${name}`] && rules)) {
            for (let i = 0; i < rules.length; i++) {
                delete this.rules[`${name}`][rules[parseInt(i.toString(), 10)]];
            }
        }
        else {
            return;
        }
    }
    /**
     * Validate the current form values using defined rules.
     * Returns `true` when the form is valid otherwise `false`
     *
     * @param {string} selected - Optional parameter to validate specified element.
     * @returns {boolean} - Returns form validation status.
     */
    validate(selected) {
        const rules = Object.keys(this.rules);
        if (selected && rules.length) {
            this.validateRules(selected);
            //filter the selected element it don't have any valid input element
            return rules.indexOf(selected) !== -1 && this.errorRules.filter((data) => {
                return data.name === selected;
            }).length === 0;
        }
        else {
            this.errorRules = [];
            for (const name of rules) {
                this.validateRules(name);
            }
            return this.errorRules.length === 0;
        }
    }
    /**
     * Reset the value of all the fields in form.
     *
     * @returns {void}
     */
    reset() {
        this.element.reset();
        this.clearForm();
    }
    /**
     * Get input element by name.
     *
     * @param {string} name - Input element name attribute value.
     * @returns {HTMLInputElement} - Returns the input element.
     */
    getInputElement(name) {
        this.inputElement = (select('[name="' + name + '"]', this.element));
        return this.inputElement;
    }
    /**
     * Destroy the form validator object and error elements.
     *
     * @returns {void}
     */
    destroy() {
        this.reset();
        this.unwireEvents();
        this.rules = {};
        const elements = selectAll('.' + this.errorClass + ', .' + this.validClass, this.element);
        for (const element of elements) {
            detach(element);
        }
        super.destroy();
        this.infoElement = null;
        onIntlChange.off('notifyExternalChange', this.afterLocalization);
    }
    /**
     * @param {FormValidatorModel} newProp - Returns the dynamic property value of the component.
     * @param {FormValidatorModel} oldProp - Returns the previous property value of the component.
     * @returns {void}
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPropertyChanged(newProp, oldProp) {
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'locale':
                    this.localeFunc();
                    break;
            }
        }
    }
    /**
     * @private
     * @returns {void}
     */
    localeFunc() {
        for (const key of Object.keys(this.defaultMessages)) {
            this.l10n.setLocale(this.locale);
            const value = this.l10n.getConstant(key);
            this.localyMessage[`${key}`] = value;
        }
    }
    /**
     * @private
     * @returns {string} - Returns the component name.
     */
    getModuleName() {
        return 'formvalidator';
    }
    /**
     * @param {any} args - Specifies the culture name.
     * @returns {void}
     * @private
     */
    afterLocalization(args) {
        this.locale = args.locale;
        this.localeFunc();
    }
    /**
     * Allows you to refresh the form validator base events to the elements inside the form.
     *
     * @returns {void}
     */
    refresh() {
        this.unwireEvents();
        this.inputElements = selectAll(this.selectQuery, this.element);
        this.wireEvents();
    }
    clearForm() {
        this.errorRules = [];
        this.validated = [];
        const elements = selectAll(this.selectQuery, this.element);
        for (const element of elements) {
            const input = element;
            input.removeAttribute('aria-invalid');
            const inputParent = input.parentElement;
            const grandParent = inputParent.parentElement;
            if (inputParent.classList.contains('e-control-wrapper') || inputParent.classList.contains('e-wrapper') ||
                (input.classList.contains('e-input') && inputParent.classList.contains('e-input-group'))) {
                inputParent.classList.remove(this.errorClass);
            }
            else if ((grandParent != null) && (grandParent.classList.contains('e-control-wrapper') ||
                grandParent.classList.contains('e-wrapper'))) {
                grandParent.classList.remove(this.errorClass);
            }
            else {
                input.classList.remove(this.errorClass);
            }
            if (input.name.length > 0) {
                this.getInputElement(input.name);
                this.getErrorElement(input.name);
                this.hideMessage(input.name);
            }
            if (inputParent.classList.contains('e-control-wrapper') || inputParent.classList.contains('e-wrapper') ||
                (input.classList.contains('e-input') && inputParent.classList.contains('e-input-group'))) {
                inputParent.classList.remove(this.validClass);
            }
            else if ((grandParent != null) && (grandParent.classList.contains('e-control-wrapper') ||
                grandParent.classList.contains('e-wrapper'))) {
                grandParent.classList.remove(this.validClass);
            }
            else {
                input.classList.remove(this.validClass);
            }
        }
    }
    createHTML5Rules() {
        const defRules = ['required', 'validateHidden', 'regex', 'rangeLength', 'maxLength', 'minLength', 'dateIso', 'digits',
            'pattern', 'data-val-required', 'type', 'data-validation', 'min', 'max', 'range', 'equalTo', 'data-val-minlength-min',
            'data-val-equalto-other', 'data-val-maxlength-max', 'data-val-range-min', 'data-val-regex-pattern', 'data-val-length-max',
            'data-val-creditcard', 'data-val-phone'];
        const acceptedTypes = ['hidden', 'email', 'url', 'date', 'number', 'tel'];
        for (const input of (this.inputElements)) {
            // Default attribute rules
            const allRule = {};
            for (let rule of defRules) {
                if (input.getAttribute(rule) !== null) {
                    switch (rule) {
                        case 'required':
                            this.defRule(input, allRule, rule, input.required);
                            break;
                        case 'data-validation':
                            rule = input.getAttribute(rule);
                            this.defRule(input, allRule, rule, true);
                            break;
                        case 'type':
                            if (acceptedTypes.indexOf(input.type) !== -1) {
                                this.defRule(input, allRule, input.type, true);
                            }
                            break;
                        case 'rangeLength':
                        case 'range':
                            this.defRule(input, allRule, rule, JSON.parse(input.getAttribute(rule)));
                            break;
                        case 'equalTo':
                            {
                                const id = input.getAttribute(rule);
                                this.defRule(input, allRule, rule, id);
                            }
                            break;
                        default:
                            if (input.getAttribute('data-val') === 'true') {
                                this.annotationRule(input, allRule, rule, input.getAttribute(rule));
                            }
                            else {
                                this.defRule(input, allRule, rule, input.getAttribute(rule));
                            }
                    }
                }
            }
            //adding pattern type validation
            if (Object.keys(allRule).length !== 0) {
                this.addRules(input.name, allRule);
            }
        }
    }
    annotationRule(input, ruleCon, ruleName, value) {
        const annotationRule = ruleName.split('-');
        const rulesList = ['required', 'creditcard', 'phone', 'maxlength', 'minlength', 'range', 'regex', 'equalto'];
        const ruleFirstName = annotationRule[annotationRule.length - 1];
        const ruleSecondName = annotationRule[annotationRule.length - 2];
        if (rulesList.indexOf(ruleFirstName) !== -1) {
            switch (ruleFirstName) {
                case 'required':
                    this.defRule(input, ruleCon, 'required', value);
                    break;
                case 'creditcard':
                    this.defRule(input, ruleCon, 'creditcard', value);
                    break;
                case 'phone':
                    this.defRule(input, ruleCon, 'tel', value);
                    break;
            }
        }
        else if (rulesList.indexOf(ruleSecondName) !== -1) {
            switch (ruleSecondName) {
                case 'maxlength':
                    this.defRule(input, ruleCon, 'maxLength', value);
                    break;
                case 'minlength':
                    this.defRule(input, ruleCon, 'minLength', value);
                    break;
                case 'range':
                    {
                        const minvalue = input.getAttribute('data-val-range-min');
                        const maxvalue = input.getAttribute('data-val-range-max');
                        this.defRule(input, ruleCon, 'range', [minvalue, maxvalue]);
                    }
                    break;
                case 'equalto':
                    {
                        const id = input.getAttribute(ruleName).split('.');
                        this.defRule(input, ruleCon, 'equalTo', id[id.length - 1]);
                    }
                    break;
                case 'regex':
                    this.defRule(input, ruleCon, 'regex', value);
                    break;
            }
        }
    }
    defRule(input, ruleCon, ruleName, value) {
        const message = input.getAttribute('data-' + ruleName + '-message');
        const annotationMessage = input.getAttribute('data-val-' + ruleName);
        let customMessage;
        if (this.rules[input.name] && ruleName !== 'validateHidden' && ruleName !== 'hidden') {
            this.getInputElement(input.name);
            customMessage = this.getErrorMessage(this.rules[input.name][`${ruleName}`], ruleName);
        }
        if (message) {
            value = [value, message];
        }
        else if (annotationMessage) {
            value = [value, annotationMessage];
        }
        else if (customMessage) {
            value = [value, customMessage];
        }
        ruleCon[`${ruleName}`] = value;
    }
    // Wire events to the form elements
    wireEvents() {
        for (const input of (this.inputElements)) {
            if (FormValidator_1.isCheckable(input)) {
                EventHandler.add(input, 'click', this.clickHandler, this);
            }
            else if (input.tagName === 'SELECT') {
                EventHandler.add(input, 'change', this.changeHandler, this);
            }
            else {
                EventHandler.add(input, 'focusout', this.focusOutHandler, this);
                EventHandler.add(input, 'keyup', this.keyUpHandler, this);
            }
        }
        EventHandler.add(this.element, 'submit', this.submitHandler, this);
        EventHandler.add(this.element, 'reset', this.resetHandler, this);
    }
    // UnWire events to the form elements
    unwireEvents() {
        for (const input of (this.inputElements)) {
            EventHandler.clearEvents(input);
        }
        EventHandler.remove(this.element, 'submit', this.submitHandler);
        EventHandler.remove(this.element, 'reset', this.resetHandler);
    }
    // Handle input element focusout event
    focusOutHandler(e) {
        this.trigger('focusout', e);
        //FormValidator.triggerCallback(this.focusout, e);
        const element = e.target;
        if (this.rules[element.name]) {
            if (this.rules[element.name][this.required] || element.value.length > 0) {
                this.validate(element.name);
            }
            else if (this.validated.indexOf(element.name) === -1) {
                this.validated.push(element.name);
            }
        }
    }
    // Handle input element keyup event
    keyUpHandler(e) {
        this.trigger('keyup', e);
        const element = e.target;
        // List of keys need to prevent while validation
        const excludeKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];
        if (e.which === 9 && (!this.rules[element.name] || (this.rules[element.name] && !this.rules[element.name][this.required]))) {
            return;
        }
        if (this.validated.indexOf(element.name) !== -1 && this.rules[element.name] && excludeKeys.indexOf(e.which) === -1) {
            this.validate(element.name);
        }
    }
    // Handle input click event
    clickHandler(e) {
        this.trigger('click', e);
        const element = e.target;
        // If element type is not submit allow validation
        if (element.type !== 'submit') {
            this.validate(element.name);
        }
        else if (element.getAttribute('formnovalidate') !== null) {
            // Prevent form validation, if submit button has formnovalidate attribute
            this.allowSubmit = true;
        }
    }
    // Handle input change event
    changeHandler(e) {
        this.trigger('change', e);
        const element = e.target;
        this.validate(element.name);
    }
    // Handle form submit event
    submitHandler(e) {
        this.trigger('submit', e);
        //FormValidator.triggerCallback(this.submit, e);
        // Prevent form submit if validation failed
        if (!this.allowSubmit && !this.validate()) {
            e.preventDefault();
        }
        else {
            this.allowSubmit = false;
        }
    }
    // Handle form reset
    resetHandler() {
        this.clearForm();
    }
    // Validate each rule based on input element name
    validateRules(name) {
        if (!this.rules[`${name}`]) {
            return;
        }
        const rules = Object.keys(this.rules[`${name}`]);
        let hiddenType = false;
        let validateHiddenType = false;
        const vhPos = rules.indexOf('validateHidden');
        const hPos = rules.indexOf('hidden');
        this.getInputElement(name);
        if (hPos !== -1) {
            hiddenType = true;
        }
        if (vhPos !== -1) {
            validateHiddenType = true;
        }
        if (!hiddenType || (hiddenType && validateHiddenType)) {
            if (vhPos !== -1) {
                rules.splice(vhPos, 1);
            }
            if (hPos !== -1) {
                rules.splice((hPos - 1), 1);
            }
            this.getErrorElement(name);
            for (const rule of rules) {
                const errorMessage = this.getErrorMessage(this.rules[`${name}`][`${rule}`], rule);
                const errorRule = { name: name, message: errorMessage };
                const eventArgs = {
                    inputName: name,
                    element: this.inputElement,
                    message: errorMessage
                };
                if (!this.isValid(name, rule) && !this.inputElement.classList.contains(this.ignore)) {
                    this.removeErrorRules(name);
                    this.errorRules.push(errorRule);
                    // Set aria attributes to invalid elements
                    this.inputElement.setAttribute('aria-invalid', 'true');
                    this.inputElement.setAttribute('aria-describedby', this.inputElement.id + '-info');
                    const inputParent = this.inputElement.parentElement;
                    const grandParent = inputParent.parentElement;
                    if (inputParent.classList.contains('e-control-wrapper') || inputParent.classList.contains('e-wrapper') ||
                        (this.inputElement.classList.contains('e-input') && inputParent.classList.contains('e-input-group'))) {
                        inputParent.classList.add(this.errorClass);
                        inputParent.classList.remove(this.validClass);
                    }
                    else if ((grandParent != null) && (grandParent.classList.contains('e-control-wrapper') ||
                        grandParent.classList.contains('e-wrapper'))) {
                        grandParent.classList.add(this.errorClass);
                        grandParent.classList.remove(this.validClass);
                    }
                    else {
                        this.inputElement.classList.add(this.errorClass);
                        this.inputElement.classList.remove(this.validClass);
                    }
                    if (!this.infoElement) {
                        this.createErrorElement(name, errorRule.message, this.inputElement);
                    }
                    else {
                        this.showMessage(errorRule);
                    }
                    eventArgs.errorElement = this.infoElement;
                    eventArgs.status = 'failure';
                    if (inputParent.classList.contains('e-control-wrapper') || inputParent.classList.contains('e-wrapper') ||
                        (this.inputElement.classList.contains('e-input') && inputParent.classList.contains('e-input-group'))) {
                        inputParent.classList.add(this.errorClass);
                        inputParent.classList.remove(this.validClass);
                    }
                    else if ((grandParent != null) && (grandParent.classList.contains('e-control-wrapper') ||
                        grandParent.classList.contains('e-wrapper'))) {
                        grandParent.classList.add(this.errorClass);
                        grandParent.classList.remove(this.validClass);
                    }
                    else {
                        this.inputElement.classList.add(this.errorClass);
                        this.inputElement.classList.remove(this.validClass);
                    }
                    this.optionalValidationStatus(name, eventArgs);
                    this.trigger('validationComplete', eventArgs);
                    // Set aria-required to required rule elements
                    if (rule === 'required') {
                        this.inputElement.setAttribute('aria-required', 'true');
                    }
                    break;
                }
                else {
                    this.hideMessage(name);
                    eventArgs.status = 'success';
                    this.trigger('validationComplete', eventArgs);
                }
            }
        }
        else {
            return;
        }
    }
    // Update the optional validation status
    optionalValidationStatus(name, refer) {
        if (!this.rules[`${name}`][this.required] && !this.inputElement.value.length && !isNullOrUndefined(this.infoElement)) {
            this.infoElement.innerHTML = this.inputElement.value;
            this.infoElement.setAttribute('aria-invalid', 'false');
            refer.status = '';
            this.hideMessage(name);
        }
    }
    // Check the input element whether it's value satisfy the validation rule or not
    isValid(name, rule) {
        const params = this.rules[`${name}`][`${rule}`];
        const param = (params instanceof Array && typeof params[1] === 'string') ? params[0] : params;
        const currentRule = this.rules[`${name}`][`${rule}`];
        const dateFormat = ((rule === 'min' || rule === 'max') && this.rules['' + name].date &&
            typeof (this.rules['' + name].date) === 'string') ? this.rules['' + name].date : null;
        const args = { value: this.inputElement.value,
            param: param, element: this.inputElement, formElement: this.element, format: dateFormat, culture: this.locale };
        this.trigger('validationBegin', args);
        if (!args.param && rule === 'required') {
            return true;
        }
        if (currentRule && typeof currentRule[0] === 'function') {
            const fn = currentRule[0];
            return fn.call(this, { element: this.inputElement, value: this.inputElement.value });
        }
        else if (FormValidator_1.isCheckable(this.inputElement)) {
            if (rule !== 'required') {
                return true;
            }
            return selectAll('input[name="' + name + '"]:checked', this.element).length > 0;
        }
        else {
            return FormValidator_1.checkValidator[`${rule}`](args);
        }
    }
    // Return default error message or custom error message
    getErrorMessage(ruleValue, rule) {
        let message = this.inputElement.getAttribute('data-' + rule + '-message') ?
            this.inputElement.getAttribute('data-' + rule + '-message') :
            (ruleValue instanceof Array && typeof ruleValue[1] === 'string') ? ruleValue[1] :
                (Object.keys(this.localyMessage).length !== 0) ? this.localyMessage[`${rule}`] : this.defaultMessages[`${rule}`];
        const formats = message.match(/{(\d)}/g);
        if (!isNullOrUndefined(formats)) {
            for (let i = 0; i < formats.length; i++) {
                const value = ruleValue instanceof Array ? ruleValue[parseInt(i.toString(), 10)] : ruleValue;
                message = message.replace(formats[parseInt(i.toString(), 10)], value);
            }
        }
        return message;
    }
    // Create error element based on name and error message
    createErrorElement(name, message, input) {
        let errorElement = createElement(this.errorElement, {
            className: this.errorClass,
            innerHTML: message,
            attrs: { for: name }
        });
        // Create message design if errorOption is message
        if (this.errorOption === ErrorOption.Message) {
            errorElement.classList.remove(this.errorClass);
            errorElement.classList.add('e-message');
            errorElement = createElement(this.errorContainer, { className: this.errorClass, innerHTML: errorElement.outerHTML });
        }
        errorElement.id = this.inputElement.name + '-info';
        // Append error message into MVC error message element
        if (this.element.querySelector('[data-valmsg-for="' + input.id + '"]')) {
            this.element.querySelector('[data-valmsg-for="' + input.id + '"]').appendChild(errorElement);
        }
        else if (input.hasAttribute('data-msg-containerid') === true) {
            // Append error message into custom div element
            const containerId = input.getAttribute('data-msg-containerid');
            const divElement = select('#' + containerId, this.element);
            divElement.appendChild(errorElement);
        }
        else if (this.customPlacement != null) {
            // Call custom placement function if customPlacement is not null
            this.customPlacement.call(this, this.inputElement, errorElement);
        }
        else {
            const inputParent = this.inputElement.parentElement;
            const grandParent = inputParent.parentElement;
            if (inputParent.classList.contains('e-control-wrapper') || inputParent.classList.contains('e-wrapper')) {
                grandParent.insertBefore(errorElement, inputParent.nextSibling);
            }
            else if (grandParent.classList.contains('e-control-wrapper') || grandParent.classList.contains('e-wrapper')) {
                grandParent.parentElement.insertBefore(errorElement, grandParent.nextSibling);
            }
            else {
                inputParent.insertBefore(errorElement, this.inputElement.nextSibling);
            }
        }
        errorElement.style.display = 'block';
        this.getErrorElement(name);
        this.validated.push(name);
        this.checkRequired(name);
    }
    // Get error element by name
    getErrorElement(name) {
        this.infoElement = select(this.errorElement + '.' + this.errorClass, this.inputElement.parentElement);
        if (!this.infoElement) {
            this.infoElement = select(this.errorElement + '.' + this.errorClass + '[for="' + name + '"]', this.element);
        }
        return this.infoElement;
    }
    // Remove existing rule from errorRules object
    removeErrorRules(name) {
        for (let i = 0; i < this.errorRules.length; i++) {
            const rule = this.errorRules[parseInt(i.toString(), 10)];
            if (rule.name === name) {
                this.errorRules.splice(i, 1);
            }
        }
    }
    // Show error message to the input element
    showMessage(errorRule) {
        this.infoElement.style.display = 'block';
        this.infoElement.innerHTML = errorRule.message;
        this.checkRequired(errorRule.name);
    }
    // Hide error message based on input name
    hideMessage(name) {
        if (this.infoElement) {
            this.infoElement.style.display = 'none';
            this.removeErrorRules(name);
            const inputParent = this.inputElement.parentElement;
            const grandParent = inputParent.parentElement;
            if (inputParent.classList.contains('e-control-wrapper') || inputParent.classList.contains('e-wrapper') ||
                (this.inputElement.classList.contains('e-input') && inputParent.classList.contains('e-input-group'))) {
                inputParent.classList.add(this.validClass);
                inputParent.classList.remove(this.errorClass);
            }
            else if ((grandParent != null) && (grandParent.classList.contains('e-control-wrapper') || grandParent.classList.contains('e-wrapper'))) {
                grandParent.classList.add(this.validClass);
                grandParent.classList.remove(this.errorClass);
            }
            else {
                this.inputElement.classList.add(this.validClass);
                this.inputElement.classList.remove(this.errorClass);
            }
            this.inputElement.setAttribute('aria-invalid', 'false');
        }
    }
    // Check whether the input element have required rule and its value is not empty
    checkRequired(name) {
        if (!this.rules[`${name}`][this.required] && !this.inputElement.value.length && !isNullOrUndefined(this.infoElement)) {
            this.infoElement.innerHTML = this.inputElement.value;
            this.infoElement.setAttribute('aria-invalid', 'false');
            this.hideMessage(name);
        }
    }
    // Return boolean result if the input have checkable or submit types
    static isCheckable(input) {
        const inputType = input.getAttribute('type');
        return inputType && (inputType === 'checkbox' || inputType === 'radio' || inputType === 'submit');
    }
};
// List of function to validate the rules
FormValidator.checkValidator = {
    required: (option) => {
        return !isNaN(Date.parse(option.value)) ? !isNaN(new Date(option.value).getTime()) : option.value.toString().length > 0;
    },
    email: (option) => {
        return regex.EMAIL.test(option.value);
    },
    url: (option) => {
        return regex.URL.test(option.value);
    },
    dateIso: (option) => {
        return regex.DATE_ISO.test(option.value);
    },
    tel: (option) => {
        return regex.PHONE.test(option.value);
    },
    creditcard: (option) => {
        return regex.CREDITCARD.test(option.value);
    },
    number: (option) => {
        return !isNaN(Number(option.value)) && String(option.value).indexOf(' ') === -1;
    },
    digits: (option) => {
        return regex.DIGITS.test(option.value);
    },
    maxLength: (option) => {
        return option.value.length <= Number(option.param);
    },
    minLength: (option) => {
        return option.value.length >= Number(option.param);
    },
    rangeLength: (option) => {
        const param = option.param;
        return option.value.length >= param[0] && option.value.length <= param[1];
    },
    range: (option) => {
        const param = option.param;
        return !isNaN(Number(option.value)) && Number(option.value) >= param[0] && Number(option.value) <= param[1];
    },
    date: (option) => {
        if (!isNullOrUndefined(option.param) && (typeof (option.param) === 'string' && option.param !== '')) {
            const globalize = option.culture && option.culture !== '' ? new Internationalization(option.culture) : new Internationalization;
            const dateOptions = { format: option.param.toString(), type: 'dateTime', skeleton: 'yMd' };
            const dateValue = globalize.parseDate(option.value, dateOptions);
            return (!isNullOrUndefined(dateValue) && dateValue instanceof Date && !isNaN(+dateValue));
        }
        else {
            return !isNaN(new Date(option.value).getTime());
        }
    },
    max: (option) => {
        if (!isNaN(Number(option.value))) {
            // Maximum rule validation for number
            return +option.value <= +option.param;
        }
        // Maximum rule validation for date
        if (option.format && option.format !== '') {
            const globalize = option.culture && option.culture !== '' ? new Internationalization(option.culture) : new Internationalization;
            const dateOptions = { format: option.format.toString(), type: 'dateTime', skeleton: 'yMd' };
            const dateValue = globalize.parseDate(option.value, dateOptions);
            const maxValue = (typeof (option.param) === 'string') ? globalize.parseDate(JSON.parse(JSON.stringify(option.param)), dateOptions) : option.param;
            return new Date(dateValue).getTime() <= new Date(maxValue).getTime();
        }
        else {
            return new Date(option.value).getTime() <= new Date(JSON.parse(JSON.stringify(option.param))).getTime();
        }
    },
    min: (option) => {
        if (!isNaN(Number(option.value))) {
            // Minimum rule validation for number
            return +option.value >= +option.param;
        }
        else if ((option.value).indexOf(',') !== -1) {
            const uNum = (option.value).replace(/,/g, '');
            return parseFloat(uNum) >= Number(option.param); // Convert option.param to a number
        }
        else {
            // Minimum rule validation for date
            if (option.format && option.format !== '') {
                const globalize = option.culture && option.culture !== '' ? new Internationalization(option.culture) : new Internationalization;
                const dateOptions = { format: option.format.toString(), type: 'dateTime', skeleton: 'yMd' };
                const dateValue = globalize.parseDate(option.value, dateOptions);
                const minValue = (typeof (option.param) === 'string') ? globalize.parseDate(JSON.parse(JSON.stringify(option.param)), dateOptions) : option.param;
                return new Date(dateValue).getTime() >= new Date(minValue).getTime();
            }
            else {
                return new Date(option.value).getTime() >= new Date(JSON.parse(JSON.stringify(option.param))).getTime();
            }
        }
    },
    regex: (option) => {
        /* eslint-disable-next-line security/detect-non-literal-regexp */
        return new RegExp(option.param).test(option.value);
    },
    equalTo: (option) => {
        const compareTo = option.formElement.querySelector('#' + option.param);
        option.param = compareTo.value;
        return option.param === option.value;
    }
};
__decorate$3([
    Property('')
], FormValidator.prototype, "locale", void 0);
__decorate$3([
    Property('e-hidden')
], FormValidator.prototype, "ignore", void 0);
__decorate$3([
    Property()
], FormValidator.prototype, "rules", void 0);
__decorate$3([
    Property('e-error')
], FormValidator.prototype, "errorClass", void 0);
__decorate$3([
    Property('e-valid')
], FormValidator.prototype, "validClass", void 0);
__decorate$3([
    Property('label')
], FormValidator.prototype, "errorElement", void 0);
__decorate$3([
    Property('div')
], FormValidator.prototype, "errorContainer", void 0);
__decorate$3([
    Property(ErrorOption.Label)
], FormValidator.prototype, "errorOption", void 0);
__decorate$3([
    Event()
], FormValidator.prototype, "focusout", void 0);
__decorate$3([
    Event()
], FormValidator.prototype, "keyup", void 0);
__decorate$3([
    Event()
], FormValidator.prototype, "click", void 0);
__decorate$3([
    Event()
], FormValidator.prototype, "change", void 0);
__decorate$3([
    Event()
], FormValidator.prototype, "submit", void 0);
__decorate$3([
    Event()
], FormValidator.prototype, "validationBegin", void 0);
__decorate$3([
    Event()
], FormValidator.prototype, "validationComplete", void 0);
__decorate$3([
    Event()
], FormValidator.prototype, "customPlacement", void 0);
FormValidator = FormValidator_1 = __decorate$3([
    NotifyPropertyChanges
], FormValidator);

var __decorate$6 = function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const HIDE_CLEAR = 'e-clear-icon-hide';
/**
 * Represents the TextBox component that allows the user to enter the values based on it's type.
 * ```html
 * <input name='images' id='textbox'/>
 * ```
 * ```typescript
 * <script>
 *   var textboxObj = new TextBox();
 *   textboxObj.appendTo('#textbox');
 * </script>
 * ```
 */
let TextBox = class TextBox extends Component {
    /**
     *
     * @param {TextBoxModel} options - Specifies the TextBox model.
     * @param {string | HTMLInputElement | HTMLTextAreaElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
        this.previousValue = null;
        this.isHiddenInput = false;
        this.isForm = false;
        this.inputPreviousValue = null;
        this.textboxOptions = options;
    }
    /**
     * Calls internally if any of the property value is changed.
     *
     * @param {TextBoxModel} newProp - Returns the dynamic property value of the component.
     * @param {TextBoxModel} oldProp - Returns the previous property value of the component.
     * @returns {void}
     * @private
     */
    onPropertyChanged(newProp, oldProp) {
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'floatLabelType':
                    Input.removeFloating(this.textboxWrapper);
                    Input.addFloating(this.respectiveElement, this.floatLabelType, this.placeholder);
                    break;
                case 'enabled':
                    Input.setEnabled(this.enabled, this.respectiveElement, this.floatLabelType, this.textboxWrapper.container);
                    this.bindClearEvent();
                    break;
                case 'width':
                    Input.setWidth(newProp.width, this.textboxWrapper.container);
                    break;
                case 'value':
                    {
                        const prevOnChange = this.isProtectedOnChange;
                        this.isProtectedOnChange = true;
                        if (!Input.isBlank(this.value)) {
                            this.value = this.value.toString();
                        }
                        this.isProtectedOnChange = prevOnChange;
                        Input.setValue(this.value, this.respectiveElement, this.floatLabelType, this.showClearButton);
                        if (this.isHiddenInput) {
                            this.element.value = this.respectiveElement.value;
                        }
                        this.inputPreviousValue = this.respectiveElement.value;
                        /* istanbul ignore next */
                        if ((this.isAngular || this.isVue) && this.preventChange === true) {
                            this.previousValue = this.isAngular ? this.value : this.previousValue;
                            this.preventChange = false;
                        }
                        else if (isNullOrUndefined(this.isAngular) || !this.isAngular
                            || (this.isAngular && !this.preventChange) || (this.isAngular && isNullOrUndefined(this.preventChange))) {
                            this.raiseChangeEvent();
                        }
                    }
                    break;
                case 'htmlAttributes':
                    {
                        this.updateHTMLAttributesToElement();
                        this.updateHTMLAttributesToWrapper();
                        this.checkAttributes(true);
                        if (this.multiline && !isNullOrUndefined(this.textarea)) {
                            Input.validateInputType(this.textboxWrapper.container, this.textarea);
                        }
                        else {
                            Input.validateInputType(this.textboxWrapper.container, this.element);
                        }
                    }
                    break;
                case 'readonly':
                    Input.setReadonly(this.readonly, this.respectiveElement);
                    break;
                case 'type':
                    if (this.respectiveElement.tagName !== 'TEXTAREA') {
                        this.respectiveElement.setAttribute('type', this.type);
                        Input.validateInputType(this.textboxWrapper.container, this.element);
                        this.raiseChangeEvent();
                    }
                    break;
                case 'showClearButton':
                    Input.setClearButton(this.showClearButton, this.respectiveElement, this.textboxWrapper);
                    this.bindClearEvent();
                    break;
                case 'enableRtl':
                    Input.setEnableRtl(this.enableRtl, [this.textboxWrapper.container]);
                    break;
                case 'placeholder':
                    Input.setPlaceholder(this.placeholder, this.respectiveElement);
                    Input.calculateWidth(this.respectiveElement, this.textboxWrapper.container);
                    break;
                case 'autocomplete':
                    if (this.autocomplete !== 'on' && this.autocomplete !== '') {
                        this.respectiveElement.autocomplete = this.autocomplete;
                    }
                    else {
                        this.removeAttributes(['autocomplete']);
                    }
                    break;
                case 'cssClass':
                    Input.updateCssClass(newProp.cssClass, oldProp.cssClass, this.textboxWrapper.container);
                    break;
                case 'locale':
                    this.globalize = new Internationalization(this.locale);
                    this.l10n.setLocale(this.locale);
                    this.setProperties({ placeholder: this.l10n.getConstant('placeholder') }, true);
                    Input.setPlaceholder(this.placeholder, this.respectiveElement);
                    break;
            }
        }
    }
    /**
     * Gets the component name
     *
     * @returns {string} Returns the component name.
     * @private
     */
    getModuleName() {
        return 'textbox';
    }
    preRender() {
        this.cloneElement = this.element.cloneNode(true);
        this.formElement = closest(this.element, 'form');
        if (!isNullOrUndefined(this.formElement)) {
            this.isForm = true;
        }
        /* istanbul ignore next */
        if (this.element.tagName === 'EJS-TEXTBOX') {
            const ejInstance = getValue('ej2_instances', this.element);
            const inputElement = this.multiline ?
                this.createElement('textarea') :
                this.createElement('input');
            let index = 0;
            for (index; index < this.element.attributes.length; index++) {
                const attributeName = this.element.attributes[index].nodeName;
                if (attributeName !== 'id' && attributeName !== 'class') {
                    inputElement.setAttribute(attributeName, this.element.attributes[index].nodeValue);
                    inputElement.innerHTML = this.element.innerHTML;
                    if (attributeName === 'name') {
                        this.element.removeAttribute('name');
                    }
                }
                else if (attributeName === 'class') {
                    inputElement.setAttribute(attributeName, this.element.className.split(' ').filter((item) => item.indexOf('ng-') !== 0).join(' '));
                }
            }
            this.element.appendChild(inputElement);
            this.element = inputElement;
            setValue('ej2_instances', ejInstance, this.element);
        }
        this.updateHTMLAttributesToElement();
        this.checkAttributes(false);
        if ((isNullOrUndefined(this.textboxOptions) || (this.textboxOptions['value'] === undefined)) && this.element.value !== '') {
            this.setProperties({ value: this.element.value }, true);
        }
        if (this.element.tagName !== 'TEXTAREA') {
            this.element.setAttribute('type', this.type);
        }
        if (this.type === 'text' || (this.element.tagName === 'INPUT' && this.multiline && this.isReact)) {
            this.element.setAttribute('role', 'textbox');
        }
        this.globalize = new Internationalization(this.locale);
        const localeText = { placeholder: this.placeholder };
        this.l10n = new L10n('textbox', localeText, this.locale);
        if (this.l10n.getConstant('placeholder') !== '') {
            this.setProperties({ placeholder: this.placeholder || this.l10n.getConstant('placeholder') }, true);
        }
        if (!this.element.hasAttribute('id')) {
            this.element.setAttribute('id', getUniqueID('textbox'));
        }
        if (!this.element.hasAttribute('name')) {
            this.element.setAttribute('name', this.element.getAttribute('id'));
        }
        if (this.element.tagName === 'INPUT' && this.multiline) {
            this.isHiddenInput = true;
            this.textarea = this.createElement('textarea');
            this.element.parentNode.insertBefore(this.textarea, this.element);
            this.element.setAttribute('type', 'hidden');
            this.textarea.setAttribute('name', this.element.getAttribute('name'));
            this.element.removeAttribute('name');
            this.textarea.setAttribute('role', this.element.getAttribute('role'));
            this.element.removeAttribute('role');
            this.textarea.setAttribute('id', getUniqueID('textarea'));
            const apiAttributes = ['placeholder', 'disabled', 'value', 'readonly', 'type', 'autocomplete'];
            for (let index = 0; index < this.element.attributes.length; index++) {
                const attributeName = this.element.attributes[index].nodeName;
                if (this.element.hasAttribute(attributeName) && containerAttributes.indexOf(attributeName) < 0 &&
                    !(attributeName === 'id' || attributeName === 'type' || attributeName === 'e-mappinguid')) {
                    // e-mappinguid attribute is handled for Grid component.
                    this.textarea.setAttribute(attributeName, this.element.attributes[index].nodeValue);
                    if (apiAttributes.indexOf(attributeName) < 0) {
                        this.element.removeAttribute(attributeName);
                        index--;
                    }
                }
            }
        }
    }
    checkAttributes(isDynamic) {
        const attrs = isDynamic ? isNullOrUndefined(this.htmlAttributes) ? [] : Object.keys(this.htmlAttributes) :
            ['placeholder', 'disabled', 'value', 'readonly', 'type', 'autocomplete'];
        for (const key of attrs) {
            if (!isNullOrUndefined(this.element.getAttribute(key))) {
                switch (key) {
                    case 'disabled':
                        if ((isNullOrUndefined(this.textboxOptions) || (this.textboxOptions['enabled'] === undefined)) || isDynamic) {
                            const enabled = this.element.getAttribute(key) === 'disabled' || this.element.getAttribute(key) === '' ||
                                this.element.getAttribute(key) === 'true' ? false : true;
                            this.setProperties({ enabled: enabled }, !isDynamic);
                        }
                        break;
                    case 'readonly':
                        if ((isNullOrUndefined(this.textboxOptions) || (this.textboxOptions['readonly'] === undefined)) || isDynamic) {
                            const readonly = this.element.getAttribute(key) === 'readonly' || this.element.getAttribute(key) === ''
                                || this.element.getAttribute(key) === 'true' ? true : false;
                            this.setProperties({ readonly: readonly }, !isDynamic);
                        }
                        break;
                    case 'placeholder':
                        if ((isNullOrUndefined(this.textboxOptions) || (this.textboxOptions['placeholder'] === undefined)) || isDynamic) {
                            this.setProperties({ placeholder: this.element.placeholder }, !isDynamic);
                        }
                        break;
                    case 'autocomplete':
                        if ((isNullOrUndefined(this.textboxOptions) || (this.textboxOptions['autocomplete'] === undefined)) || isDynamic) {
                            const autoCompleteTxt = this.element.autocomplete === 'off' ? 'off' : 'on';
                            this.setProperties({ autocomplete: autoCompleteTxt }, !isDynamic);
                        }
                        break;
                    case 'value':
                        if (((isNullOrUndefined(this.textboxOptions) || (this.textboxOptions['value'] === undefined)) || isDynamic) && this.element.value !== '') {
                            this.setProperties({ value: this.element.value }, !isDynamic);
                        }
                        break;
                    case 'type':
                        if ((isNullOrUndefined(this.textboxOptions) || (this.textboxOptions['type'] === undefined)) || isDynamic) {
                            this.setProperties({ type: this.element.type }, !isDynamic);
                        }
                        break;
                }
            }
        }
    }
    /**
     * To Initialize the control rendering
     *
     * @returns {void}
     * @private
     */
    render() {
        let updatedCssClassValue = this.cssClass;
        if (!isNullOrUndefined(this.cssClass) && this.cssClass !== '') {
            updatedCssClassValue = Input.getInputValidClassList(this.cssClass);
        }
        this.respectiveElement = (this.isHiddenInput) ? this.textarea : this.element;
        this.textboxWrapper = Input.createInput({
            element: this.respectiveElement,
            floatLabelType: this.floatLabelType,
            properties: {
                enabled: this.enabled,
                enableRtl: this.enableRtl,
                cssClass: updatedCssClassValue,
                readonly: this.readonly,
                placeholder: this.placeholder,
                showClearButton: this.showClearButton
            }
        });
        this.updateHTMLAttributesToWrapper();
        if (this.isHiddenInput) {
            this.respectiveElement.parentNode.insertBefore(this.element, this.respectiveElement);
        }
        this.wireEvents();
        if (!isNullOrUndefined(this.value)) {
            Input.setValue(this.value, this.respectiveElement, this.floatLabelType, this.showClearButton);
            if (this.isHiddenInput) {
                this.element.value = this.respectiveElement.value;
            }
        }
        if (!isNullOrUndefined(this.value)) {
            this.initialValue = this.value;
            this.setInitialValue();
        }
        if (this.autocomplete !== 'on' && this.autocomplete !== '') {
            this.respectiveElement.autocomplete = this.autocomplete;
        }
        else if (!isNullOrUndefined(this.textboxOptions) && (this.textboxOptions['autocomplete'] !== undefined)) {
            this.removeAttributes(['autocomplete']);
        }
        this.previousValue = this.value;
        this.inputPreviousValue = this.value;
        this.respectiveElement.defaultValue = this.respectiveElement.value;
        Input.setWidth(this.width, this.textboxWrapper.container);
        if (!isNullOrUndefined(closest(this.element, 'fieldset')) && closest(this.element, 'fieldset').disabled) {
            this.enabled = false;
        }
        if (!this.element.hasAttribute('aria-labelledby') && !this.element.hasAttribute('placeholder') && !this.element.hasAttribute('aria-label')) {
            this.element.setAttribute('aria-label', 'textbox');
        }
        this.renderComplete();
    }
    updateHTMLAttributesToWrapper() {
        Input.updateHTMLAttributesToWrapper(this.htmlAttributes, this.textboxWrapper.container);
    }
    updateHTMLAttributesToElement() {
        Input.updateHTMLAttributesToElement(this.htmlAttributes, this.respectiveElement ? this.respectiveElement :
            (this.multiline && !isNullOrUndefined(this.textarea) ? this.textarea : this.element));
    }
    setInitialValue() {
        if (!this.isAngular) {
            this.respectiveElement.setAttribute('value', this.initialValue);
        }
    }
    wireEvents() {
        EventHandler.add(this.respectiveElement, 'focus', this.focusHandler, this);
        EventHandler.add(this.respectiveElement, 'blur', this.focusOutHandler, this);
        EventHandler.add(this.respectiveElement, 'keydown', this.keydownHandler, this);
        EventHandler.add(this.respectiveElement, 'input', this.inputHandler, this);
        EventHandler.add(this.respectiveElement, 'change', this.changeHandler, this);
        if (this.isForm) {
            EventHandler.add(this.formElement, 'reset', this.resetForm, this);
        }
        this.bindClearEvent();
        if (!isNullOrUndefined(this.textboxWrapper.container.querySelector('.e-float-text')) && this.floatLabelType === 'Auto'
            && this.textboxWrapper.container.classList.contains('e-autofill') &&
            this.textboxWrapper.container.classList.contains('e-outline')) {
            EventHandler.add((this.textboxWrapper.container.querySelector('.e-float-text')), 'animationstart', this.animationHandler, this);
        }
    }
    animationHandler() {
        this.textboxWrapper.container.classList.add('e-valid-input');
        const label = this.textboxWrapper.container.querySelector('.e-float-text');
        if (!isNullOrUndefined(label)) {
            label.classList.add('e-label-top');
            if (label.classList.contains('e-label-bottom')) {
                label.classList.remove('e-label-bottom');
            }
        }
    }
    resetValue(value) {
        const prevOnChange = this.isProtectedOnChange;
        this.isProtectedOnChange = true;
        this.value = value;
        if (value == null && this.textboxWrapper.container.classList.contains('e-valid-input') && !(this.floatLabelType === 'Always' && this.textboxWrapper.container.classList.contains('e-outline'))) {
            this.textboxWrapper.container.classList.remove('e-valid-input');
        }
        this.isProtectedOnChange = prevOnChange;
    }
    resetForm() {
        if (this.isAngular) {
            this.resetValue('');
        }
        else {
            this.resetValue(this.initialValue);
        }
        if (!isNullOrUndefined(this.textboxWrapper)) {
            const label = this.textboxWrapper.container.querySelector('.e-float-text');
            if (!isNullOrUndefined(label) && this.floatLabelType !== 'Always') {
                if ((isNullOrUndefined(this.initialValue) || this.initialValue === '')) {
                    label.classList.add('e-label-bottom');
                    label.classList.remove('e-label-top');
                }
                else if (this.initialValue !== '') {
                    label.classList.add('e-label-top');
                    label.classList.remove('e-label-bottom');
                }
            }
        }
    }
    focusHandler(args) {
        const eventArgs = {
            container: this.textboxWrapper.container,
            event: args,
            value: this.value
        };
        this.trigger('focus', eventArgs);
    }
    focusOutHandler(args) {
        if (!(this.previousValue === null && this.value === null && this.respectiveElement.value === '') &&
            (this.previousValue !== this.value)) {
            this.raiseChangeEvent(args, true);
        }
        const eventArgs = {
            container: this.textboxWrapper.container,
            event: args,
            value: this.value
        };
        this.trigger('blur', eventArgs);
    }
    keydownHandler(args) {
        if ((args.keyCode === 13 || args.keyCode === 9) && !((this.previousValue === null || this.previousValue === '') && (this.value === null || this.value === '') && this.respectiveElement.value === '')) {
            this.setProperties({ value: this.respectiveElement.value }, true);
        }
    }
    inputHandler(args) {
        const textboxObj =  this;
        const eventArgs = {
            event: args,
            value: this.respectiveElement.value,
            previousValue: this.inputPreviousValue,
            container: this.textboxWrapper.container
        };
        this.inputPreviousValue = this.respectiveElement.value;
        /* istanbul ignore next */
        if (this.isAngular) {
            textboxObj.localChange({ value: this.respectiveElement.value });
            this.preventChange = true;
        }
        if (this.isVue) {
            this.preventChange = true;
        }
        this.trigger('input', eventArgs);
        args.stopPropagation();
    }
    changeHandler(args) {
        this.setProperties({ value: this.respectiveElement.value }, true);
        if (this.previousValue !== this.value) {
            this.raiseChangeEvent(args, true);
        }
        args.stopPropagation();
    }
    raiseChangeEvent(event, interaction) {
        const eventArgs = {
            event: event,
            value: this.value,
            previousValue: this.previousValue,
            container: this.textboxWrapper.container,
            isInteraction: interaction ? interaction : false,
            isInteracted: interaction ? interaction : false
        };
        this.preventChange = false;
        this.trigger('change', eventArgs);
        this.previousValue = this.value;
        //EJ2CORE-738:For this task we update the textarea value to the input when input tag with multiline is present
        if (this.element.tagName === 'INPUT' && this.multiline && Browser.info.name === 'mozilla') {
            this.element.value = this.respectiveElement.value;
        }
    }
    bindClearEvent() {
        if (this.showClearButton) {
            if (this.enabled) {
                EventHandler.add(this.textboxWrapper.clearButton, 'mousedown touchstart', this.resetInputHandler, this);
            }
            else {
                EventHandler.remove(this.textboxWrapper.clearButton, 'mousedown touchstart', this.resetInputHandler);
            }
        }
    }
    resetInputHandler(event) {
        event.preventDefault();
        if (!(this.textboxWrapper.clearButton.classList.contains(HIDE_CLEAR)) || this.textboxWrapper.container.classList.contains('e-static-clear')) {
            Input.setValue('', this.respectiveElement, this.floatLabelType, this.showClearButton);
            if (this.isHiddenInput) {
                this.element.value = this.respectiveElement.value;
            }
            this.setProperties({ value: this.respectiveElement.value }, true);
            const eventArgs = {
                event: event,
                value: this.respectiveElement.value,
                previousValue: this.inputPreviousValue,
                container: this.textboxWrapper.container
            };
            this.trigger('input', eventArgs);
            this.inputPreviousValue = this.respectiveElement.value;
            this.raiseChangeEvent(event, true);
            if (closest(this.element, 'form')) {
                const element = this.element;
                const keyupEvent = document.createEvent('KeyboardEvent');
                keyupEvent.initEvent('keyup', false, true);
                element.dispatchEvent(keyupEvent);
            }
        }
    }
    unWireEvents() {
        EventHandler.remove(this.respectiveElement, 'focus', this.focusHandler);
        EventHandler.remove(this.respectiveElement, 'blur', this.focusOutHandler);
        EventHandler.remove(this.respectiveElement, 'keydown', this.keydownHandler);
        EventHandler.remove(this.respectiveElement, 'input', this.inputHandler);
        EventHandler.remove(this.respectiveElement, 'change', this.changeHandler);
        if (this.isForm) {
            EventHandler.remove(this.formElement, 'reset', this.resetForm);
        }
        if (!isNullOrUndefined(this.textboxWrapper.container.querySelector('.e-float-text')) && this.floatLabelType === 'Auto'
            && this.textboxWrapper.container.classList.contains('e-outline') &&
            this.textboxWrapper.container.classList.contains('e-autofill')) {
            EventHandler.remove((this.textboxWrapper.container.querySelector('.e-float-text')), 'animationstart', this.animationHandler);
        }
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers.
     * Also, it maintains the initial TextBox element from the DOM.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        this.unWireEvents();
        if (this.showClearButton) {
            this.clearButton = document.getElementsByClassName('e-clear-icon')[0];
        }
        if (this.element.tagName === 'INPUT' && this.multiline) {
            detach(this.textboxWrapper.container.getElementsByTagName('textarea')[0]);
            this.respectiveElement = this.element;
            this.element.removeAttribute('type');
        }
        this.respectiveElement.value = this.respectiveElement.defaultValue;
        this.respectiveElement.classList.remove('e-input');
        this.removeAttributes(['aria-disabled', 'aria-readonly', 'aria-labelledby']);
        if (!isNullOrUndefined(this.textboxWrapper)) {
            this.textboxWrapper.container.insertAdjacentElement('afterend', this.respectiveElement);
            detach(this.textboxWrapper.container);
        }
        this.textboxWrapper = null;
        Input.destroy({
            element: this.respectiveElement,
            floatLabelType: this.floatLabelType,
            properties: this.properties
        }, this.clearButton);
        super.destroy();
    }
    /**
     * Adding the icons to the TextBox component.
     *
     * @param { string } position - Specify the icon placement on the TextBox. Possible values are append and prepend.
     * @param { string | string[] } icons - Icon classes which are need to add to the span element which is going to created.
     * Span element acts as icon or button element for TextBox.
     * @returns {void}
     */
    addIcon(position, icons) {
        Input.addIcon(position, icons, this.textboxWrapper.container, this.respectiveElement, this.createElement);
    }
    /**
     * Gets the properties to be maintained in the persisted state.
     *
     * @returns {string} Returns the persisted data.
     */
    getPersistData() {
        const keyEntity = ['value'];
        return this.addOnPersist(keyEntity);
    }
    /**
     * Adding the multiple attributes as key-value pair to the TextBox element.
     *
     * @param {string} attributes - Specifies the attributes to be add to TextBox element.
     * @returns {void}
     */
    addAttributes(attributes) {
        for (const key of Object.keys(attributes)) {
            if (key === 'disabled') {
                this.setProperties({ enabled: false }, true);
                Input.setEnabled(this.enabled, this.respectiveElement, this.floatLabelType, this.textboxWrapper.container);
            }
            else if (key === 'readonly') {
                this.setProperties({ readonly: true }, true);
                Input.setReadonly(this.readonly, this.respectiveElement);
            }
            else if (key === 'class') {
                this.respectiveElement.classList.add(attributes[`${key}`]);
            }
            else if (key === 'placeholder') {
                this.setProperties({ placeholder: attributes[`${key}`] }, true);
                Input.setPlaceholder(this.placeholder, this.respectiveElement);
            }
            else if (key === 'rows' && this.respectiveElement.tagName === 'TEXTAREA') {
                this.respectiveElement.setAttribute(key, attributes[`${key}`]);
            }
            else {
                this.respectiveElement.setAttribute(key, attributes[`${key}`]);
            }
        }
    }
    /**
     * Removing the multiple attributes as key-value pair to the TextBox element.
     *
     * @param { string[] } attributes - Specifies the attributes name to be removed from TextBox element.
     * @returns {void}
     */
    removeAttributes(attributes) {
        for (const key of attributes) {
            if (key === 'disabled') {
                this.setProperties({ enabled: true }, true);
                Input.setEnabled(this.enabled, this.respectiveElement, this.floatLabelType, this.textboxWrapper.container);
            }
            else if (key === 'readonly') {
                this.setProperties({ readonly: false }, true);
                Input.setReadonly(this.readonly, this.respectiveElement);
            }
            else if (key === 'placeholder') {
                this.setProperties({ placeholder: null }, true);
                Input.setPlaceholder(this.placeholder, this.respectiveElement);
            }
            else {
                this.respectiveElement.removeAttribute(key);
            }
        }
    }
    /**
     * Sets the focus to widget for interaction.
     *
     * @returns {void}
     */
    focusIn() {
        if (document.activeElement !== this.respectiveElement && this.enabled) {
            this.respectiveElement.focus();
            if (this.textboxWrapper.container.classList.contains('e-input-group')
                || this.textboxWrapper.container.classList.contains('e-outline')
                || this.textboxWrapper.container.classList.contains('e-filled')) {
                addClass([this.textboxWrapper.container], [TEXTBOX_FOCUS]);
            }
        }
    }
    /**
     * Remove the focus from widget, if the widget is in focus state.
     *
     * @returns {void}
     */
    focusOut() {
        if (document.activeElement === this.respectiveElement && this.enabled) {
            this.respectiveElement.blur();
            if (this.textboxWrapper.container.classList.contains('e-input-group')
                || this.textboxWrapper.container.classList.contains('e-outline')
                || this.textboxWrapper.container.classList.contains('e-filled')) {
                removeClass([this.textboxWrapper.container], [TEXTBOX_FOCUS]);
            }
        }
    }
};
__decorate$6([
    Property('text')
], TextBox.prototype, "type", void 0);
__decorate$6([
    Property(false)
], TextBox.prototype, "readonly", void 0);
__decorate$6([
    Property(null)
], TextBox.prototype, "value", void 0);
__decorate$6([
    Property('Never')
], TextBox.prototype, "floatLabelType", void 0);
__decorate$6([
    Property('')
], TextBox.prototype, "cssClass", void 0);
__decorate$6([
    Property(null)
], TextBox.prototype, "placeholder", void 0);
__decorate$6([
    Property('on')
], TextBox.prototype, "autocomplete", void 0);
__decorate$6([
    Property({})
], TextBox.prototype, "htmlAttributes", void 0);
__decorate$6([
    Property(false)
], TextBox.prototype, "multiline", void 0);
__decorate$6([
    Property(true)
], TextBox.prototype, "enabled", void 0);
__decorate$6([
    Property(false)
], TextBox.prototype, "showClearButton", void 0);
__decorate$6([
    Property(false)
], TextBox.prototype, "enablePersistence", void 0);
__decorate$6([
    Property(null)
], TextBox.prototype, "width", void 0);
__decorate$6([
    Event()
], TextBox.prototype, "created", void 0);
__decorate$6([
    Event()
], TextBox.prototype, "destroyed", void 0);
__decorate$6([
    Event()
], TextBox.prototype, "change", void 0);
__decorate$6([
    Event()
], TextBox.prototype, "blur", void 0);
__decorate$6([
    Event()
], TextBox.prototype, "focus", void 0);
__decorate$6([
    Event()
], TextBox.prototype, "input", void 0);
TextBox = __decorate$6([
    NotifyPropertyChanges
], TextBox);

export { Input, TextBox, NumericTextBox, FormValidator };
