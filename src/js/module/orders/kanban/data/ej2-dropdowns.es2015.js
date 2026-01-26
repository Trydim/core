import { EventHandler, isNullOrUndefined, getValue, select, Browser, ChildProperty, Property, Component, selectAll, compile, L10n, addClass, removeClass, extend, append, setStyleAttribute, prepend, rippleEffect, detach, Complex, Event, NotifyPropertyChanges, classList, closest, KeyboardEvents, attributes, isUndefined, formatUnit, Animation, getUniqueID } from './ej2-base';
import { DataManager, Query, DataUtil, Predicate } from './ej2-data.es2015.js';
import { ListBase } from './ej2-lists.es2015.js';
import { Skeleton } from './ej2-notifications.es2015.js';
import { hideSpinner, createSpinner, showSpinner, isCollide, Popup } from './ej2-popups.es2015.js';
import { Input } from './ej2-inputs.es2015.js';

/**
 * IncrementalSearch module file
 */
let queryString = '';
let prevString = '';
let tempQueryString = '';
let matches = [];
const activeClass = 'e-active';
let prevElementId = '';
/**
 * Search and focus the list item based on key code matches with list text content.
 *
 * @param {number} keyCode - Specifies the key code which pressed on keyboard events.
 * @param {HTMLElement[]} items - Specifies an array of HTMLElement, from which matches find has done.
 * @param {number} selectedIndex - Specifies the selected item in list item, so that search will happen after selected item otherwise it will do from initial.
 * @param {boolean} ignoreCase - Specifies the case consideration when search has done.
 * @param {string} elementId - Specifies the list element ID.
 * @param {boolean} [queryStringUpdated] - Optional parameter.
 * @param {string} [currentValue] - Optional parameter.
 * @param {boolean} [isVirtual] - Optional parameter.
 * @param {boolean} [refresh] - Optional parameter.
 * @returns {Element} Returns list item based on key code matches with list text content.
 */
function incrementalSearch(keyCode, items, selectedIndex, ignoreCase, elementId, queryStringUpdated, currentValue, isVirtual, refresh) {
    if (!queryStringUpdated || queryString === '') {
        if (tempQueryString !== '') {
            queryString = tempQueryString + String.fromCharCode(keyCode);
            tempQueryString = '';
        }
        else {
            queryString += String.fromCharCode(keyCode);
        }
    }
    else if (queryString === prevString) {
        tempQueryString = String.fromCharCode(keyCode);
    }
    if (isVirtual) {
        setTimeout(function () {
            tempQueryString = '';
        }, 700);
        setTimeout(function () {
            queryString = '';
        }, 3000);
    }
    else {
        setTimeout(function () {
            queryString = '';
        }, 1000);
    }
    let index;
    queryString = ignoreCase ? queryString.toLowerCase() : queryString;
    if (prevElementId === elementId && prevString === queryString && !refresh) {
        for (let i = 0; i < matches.length; i++) {
            if (matches[i].classList.contains(activeClass)) {
                index = i;
                break;
            }
            if (currentValue && matches[i].textContent.toLowerCase() === currentValue.toLowerCase()) {
                index = i;
                break;
            }
        }
        index = index + 1;
        if (isVirtual) {
            return matches[index] && matches.length - 1 !== index ? matches[index] : matches[matches.length];
        }
        return matches[index] ? matches[index] : matches[0];
    }
    else {
        const listItems = items;
        const strLength = queryString.length;
        let text;
        let item;
        selectedIndex = selectedIndex ? selectedIndex + 1 : 0;
        let i = selectedIndex;
        matches = [];
        do {
            if (i === listItems.length) {
                i = -1;
            }
            if (i === -1) {
                index = 0;
            }
            else {
                index = i;
            }
            item = listItems[index];
            text = ignoreCase ? item.innerText.toLowerCase() : item.innerText;
            if (text.substr(0, strLength) === queryString) {
                matches.push(listItems[index]);
            }
            i++;
        } while (i !== selectedIndex);
        prevString = queryString;
        prevElementId = elementId;
        if (isVirtual) {
            let indexUpdated = false;
            for (let i = 0; i < matches.length; i++) {
                if (currentValue && matches[i].textContent.toLowerCase() === currentValue.toLowerCase()) {
                    index = i;
                    indexUpdated = true;
                    break;
                }
            }
            if (currentValue && indexUpdated) {
                index = index + 1;
            }
            return matches[index] ? matches[index] : matches[0];
        }
        return matches[0];
    }
}
// eslint-disable-next-line valid-jsdoc

/**
 * @param {string} elementId - The ID of the list element.
 * @returns {void}
 */
function resetIncrementalSearchValues(elementId) {
    if (prevElementId === elementId) {
        prevElementId = '';
        prevString = '';
        queryString = '';
        matches = [];
    }
}

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class FieldSettings extends ChildProperty {
}
__decorate([
    Property()
], FieldSettings.prototype, "text", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "value", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "iconCss", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "groupBy", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "htmlAttributes", void 0);
__decorate([
    Property()
], FieldSettings.prototype, "disabled", void 0);

const dropDownBaseClasses = {
    root: 'e-dropdownbase',
    rtl: 'e-rtl',
    content: 'e-content',
    selected: 'e-active',
    hover: 'e-hover',
    noData: 'e-nodata',
    fixedHead: 'e-fixed-head',
    focus: 'e-item-focus',
    li: 'e-list-item',
    group: 'e-list-group-item',
    disabled: 'e-disabled',
    grouping: 'e-dd-group',
    virtualList: 'e-list-item e-virtual-list'
};
const ITEMTEMPLATE_PROPERTY = 'ItemTemplate';
const DISPLAYTEMPLATE_PROPERTY = 'DisplayTemplate';
const SPINNERTEMPLATE_PROPERTY = 'SpinnerTemplate';
const VALUETEMPLATE_PROPERTY = 'ValueTemplate';
const GROUPTEMPLATE_PROPERTY = 'GroupTemplate';
const HEADERTEMPLATE_PROPERTY = 'HeaderTemplate';
const FOOTERTEMPLATE_PROPERTY = 'FooterTemplate';
const NORECORDSTEMPLATE_PROPERTY = 'NoRecordsTemplate';
const ACTIONFAILURETEMPLATE_PROPERTY = 'ActionFailureTemplate';
const HIDE_GROUPLIST = 'e-hide-group-header';
/**
 * DropDownBase component will generate the list items based on given data and act as base class to drop-down related components
 */
let DropDownBase = class DropDownBase extends Component {
    /**
     * * Constructor for DropDownBase class
     *
     * @param {DropDownBaseModel} options - Specifies the DropDownBase model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
        this.preventChange = false;
        this.isPreventChange = false;
        this.isDynamicDataChange = false;
        this.addedNewItem = false;
        this.isAddNewItemTemplate = false;
        this.isRequesting = false;
        this.isVirtualizationEnabled = false;
        this.isCustomDataUpdated = false;
        this.isAllowFiltering = false;
        this.virtualizedItemsCount = 0;
        this.isCheckBoxSelection = false;
        this.totalItemCount = 0;
        this.dataCount = 0;
        this.remoteDataCount = -1;
        this.isIncrementalRequest = false;
        this.itemCount = 30;
        this.virtualListHeight = 0;
        this.isVirtualScrolling = false;
        this.isKeyBoardAction = false;
        this.startIndex = 0;
        this.currentPageNumber = 0;
        this.pageCount = 0;
        this.isPreventKeyAction = false;
        this.skeletonCount = 32;
        this.isVirtualTrackHeight = false;
        this.virtualSelectAll = false;
        this.isVirtualReorder = false;
        this.incrementalQueryString = '';
        this.incrementalEndIndex = 0;
        this.incrementalStartIndex = 0;
        this.incrementalPreQueryString = '';
        this.isObjectCustomValue = false;
        this.appendUncheckList = false;
        this.getInitialData = false;
        this.virtualSelectAllState = false;
        this.CurrentEvent = null;
        this.isDynamicData = false;
        this.isPrimitiveData = false;
        this.isCustomFiltering = false;
        this.debounceTimer = null;
        this.virtualListInfo = {
            currentPageNumber: null,
            direction: null,
            sentinelInfo: {},
            offsets: {},
            startIndex: 0,
            endIndex: 0
        };
        this.viewPortInfo = {
            currentPageNumber: null,
            direction: null,
            sentinelInfo: {},
            offsets: {},
            startIndex: 0,
            endIndex: 0
        };
        this.selectedValueInfo = {
            currentPageNumber: null,
            direction: null,
            sentinelInfo: {},
            offsets: {},
            startIndex: 0,
            endIndex: 0
        };
    }
    getPropObject(prop, newProp, oldProp) {
        const newProperty = new Object();
        const oldProperty = new Object();
        const propName = (prop) => {
            return prop;
        };
        newProperty[propName(prop)] = newProp[propName(prop)];
        oldProperty[propName(prop)] = oldProp[propName(prop)];
        const data = new Object();
        data.newProperty = newProperty;
        data.oldProperty = oldProperty;
        return data;
    }
    getValueByText(text, ignoreCase, ignoreAccent) {
        let value = null;
        if (!isNullOrUndefined(this.listData)) {
            if (ignoreCase) {
                value = this.checkValueCase(text, true, ignoreAccent);
            }
            else {
                value = this.checkValueCase(text, false, ignoreAccent);
            }
        }
        return value;
    }
    checkValueCase(text, ignoreCase, ignoreAccent, isTextByValue) {
        let value = null;
        if (isTextByValue) {
            value = text;
        }
        if (!isNullOrUndefined(this.listData)) {
            const dataSource = this.listData;
            const fields = this.fields;
            const type = this.typeOfData(dataSource).typeof;
            if (type === 'string' || type === 'number' || type === 'boolean') {
                for (const item of dataSource) {
                    if (!isNullOrUndefined(item)) {
                        if (ignoreAccent) {
                            value = this.checkingAccent(String(item), text, ignoreCase);
                        }
                        else {
                            if (ignoreCase) {
                                if (this.checkIgnoreCase(String(item), text)) {
                                    value = this.getItemValue(String(item), text, ignoreCase);
                                }
                            }
                            else {
                                if (this.checkNonIgnoreCase(String(item), text)) {
                                    value = this.getItemValue(String(item), text, ignoreCase, isTextByValue);
                                }
                            }
                        }
                    }
                }
            }
            else {
                if (ignoreCase) {
                    dataSource.filter((item) => {
                        const itemValue = getValue(fields.value, item);
                        if (!isNullOrUndefined(itemValue) && this.checkIgnoreCase(getValue(fields.text, item).toString(), text)) {
                            value = getValue(fields.value, item);
                        }
                    });
                }
                else {
                    if (isTextByValue) {
                        let compareValue = null;
                        compareValue = value;
                        dataSource.filter((item) => {
                            const itemValue = getValue(fields.value, item);
                            if (!isNullOrUndefined(itemValue) && !isNullOrUndefined(value) &&
                                itemValue.toString() === compareValue.toString()) {
                                value = getValue(fields.text, item);
                            }
                        });
                    }
                    else {
                        dataSource.filter((item) => {
                            if (this.checkNonIgnoreCase(getValue(fields.text, item), text)) {
                                value = getValue(fields.value, item);
                            }
                        });
                    }
                }
            }
        }
        return value;
    }
    checkingAccent(item, text, ignoreCase) {
        const dataItem = DataUtil.ignoreDiacritics(String(item));
        const textItem = DataUtil.ignoreDiacritics(text.toString());
        let value = null;
        if (ignoreCase) {
            if (this.checkIgnoreCase(dataItem, textItem)) {
                value = this.getItemValue(String(item), text, ignoreCase);
            }
        }
        else {
            if (this.checkNonIgnoreCase(String(item), text)) {
                value = this.getItemValue(String(item), text, ignoreCase);
            }
        }
        return value;
    }
    checkIgnoreCase(item, text) {
        return String(item).toLowerCase() === text.toString().toLowerCase() ? true : false;
    }
    checkNonIgnoreCase(item, text) {
        return String(item) === text.toString() ? true : false;
    }
    getItemValue(dataItem, typedText, ignoreCase, isTextByValue) {
        let value = null;
        const dataSource = this.listData;
        const type = this.typeOfData(dataSource).typeof;
        if (isTextByValue) {
            value = dataItem.toString();
        }
        else {
            if (ignoreCase) {
                value = type === 'string' ? String(dataItem) : this.getFormattedValue(String(dataItem));
            }
            else {
                value = type === 'string' ? typedText : this.getFormattedValue(typedText);
            }
        }
        return value;
    }
    templateCompiler(baseTemplate) {
        let checkTemplate = false;
        if (typeof baseTemplate !== 'function' && baseTemplate) {
            try {
                checkTemplate = (selectAll(baseTemplate, document).length) ? true : false;
            }
            catch (exception) {
                checkTemplate = false;
            }
        }
        return checkTemplate;
    }
    l10nUpdate(actionFailure) {
        const ele = this.getModuleName() === 'listbox' ? this.ulElement : this.list;
        if ((!isNullOrUndefined(this.noRecordsTemplate) && this.noRecordsTemplate !== 'No records found') || this.actionFailureTemplate !== 'Request failed') {
            const template = actionFailure ? this.actionFailureTemplate : this.noRecordsTemplate;
            let compiledString;
            const templateId = actionFailure ? this.actionFailureTemplateId : this.noRecordsTemplateId;
            ele.innerHTML = '';
            const tempaltecheck = this.templateCompiler(template);
            if (typeof template !== 'function' && tempaltecheck) {
                compiledString = compile(select(template, document).innerHTML.trim());
            }
            else {
                compiledString = compile(template);
            }
            const templateName = actionFailure ? 'actionFailureTemplate' : 'noRecordsTemplate';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let noDataElement;
            if ((this.isReact) && typeof template === 'function') {
                noDataElement = compiledString({}, this, templateName, templateId, this.isStringTemplate, null);
            }
            else {
                noDataElement = compiledString({}, this, templateName, templateId, this.isStringTemplate, null, ele);
            }
            if (noDataElement && noDataElement.length > 0) {
                for (let i = 0; i < noDataElement.length; i++) {
                    if (this.getModuleName() === 'listbox' && templateName === 'noRecordsTemplate') {
                        if (noDataElement[i].nodeName === '#text') {
                            const liElem = this.createElement('li');
                            liElem.textContent = noDataElement[i].textContent;
                            liElem.classList.add('e-list-nrt');
                            liElem.setAttribute('role', 'option');
                            ele.appendChild(liElem);
                        }
                        else {
                            noDataElement[i].classList.add('e-list-nr-template');
                            ele.appendChild(noDataElement[i]);
                        }
                    }
                    else {
                        if (noDataElement[i] instanceof HTMLElement || ((noDataElement[i] instanceof Text) && (noDataElement[i]).textContent !== '')) {
                            ele.appendChild(noDataElement[i]);
                        }
                    }
                }
            }
            this.renderReactTemplates();
        }
        else {
            const l10nLocale = { noRecordsTemplate: 'No records found', actionFailureTemplate: 'Request failed' };
            const componentLocale = new L10n(this.getLocaleName(), {}, this.locale);
            if (componentLocale.getConstant('actionFailureTemplate') !== '' || componentLocale.getConstant('noRecordsTemplate') !== '') {
                this.l10n = componentLocale;
            }
            else {
                this.l10n = new L10n(this.getModuleName() === 'listbox' ? 'listbox' :
                    this.getModuleName() === 'mention' ? 'mention' : 'dropdowns', l10nLocale, this.locale);
            }
            const content = actionFailure ?
                this.l10n.getConstant('actionFailureTemplate') : this.l10n.getConstant('noRecordsTemplate');
            if (this.getModuleName() === 'listbox') {
                const liElem = this.createElement('li');
                liElem.textContent = content;
                ele.appendChild(liElem);
                liElem.classList.add('e-list-nrt');
                liElem.setAttribute('role', 'option');
            }
            else {
                if (!isNullOrUndefined(ele)) {
                    ele.innerHTML = content;
                }
            }
        }
    }
    checkAndResetCache() {
        if (this.isVirtualizationEnabled) {
            this.generatedDataObject = {};
            this.virtualItemStartIndex = this.virtualItemEndIndex = 0;
            this.viewPortInfo = {
                currentPageNumber: null,
                direction: null,
                sentinelInfo: {},
                offsets: {},
                startIndex: 0,
                endIndex: this.itemCount
            };
            this.selectedValueInfo = null;
        }
    }
    updateIncrementalInfo(startIndex, endIndex) {
        this.viewPortInfo.startIndex = startIndex;
        this.viewPortInfo.endIndex = endIndex;
        this.updateVirtualItemIndex();
        this.isIncrementalRequest = true;
        this.resetList(this.dataSource, this.fields, this.query);
        this.isIncrementalRequest = false;
    }
    updateIncrementalView(startIndex, endIndex) {
        this.viewPortInfo.startIndex = startIndex;
        this.viewPortInfo.endIndex = endIndex;
        this.updateVirtualItemIndex();
        this.resetList(this.dataSource, this.fields, this.query);
        this.UpdateSkeleton();
        this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
        this.ulElement = this.list.querySelector('ul');
    }
    updateVirtualItemIndex() {
        this.virtualItemStartIndex = this.viewPortInfo.startIndex;
        this.virtualItemEndIndex = this.viewPortInfo.endIndex;
        this.virtualListInfo = this.viewPortInfo;
    }
    getFilteringSkeletonCount() {
        const currentSkeletonCount = this.skeletonCount;
        this.getSkeletonCount(true);
        this.skeletonCount = this.dataCount < this.itemCount * 2 && ((!(this.dataSource instanceof DataManager)) ||
            ((this.dataSource instanceof DataManager) && (this.totalItemCount <= this.itemCount))) ? 0 : this.skeletonCount;
        let skeletonUpdated = true;
        if ((this.getModuleName() === 'autocomplete' || this.getModuleName() === 'multiselect') && (this.totalItemCount < (this.itemCount * 2)) && ((!(this.dataSource instanceof DataManager)) || ((this.dataSource instanceof DataManager) && (this.totalItemCount <= this.itemCount)))) {
            this.skeletonCount = 0;
            skeletonUpdated = false;
        }
        if (!this.list.classList.contains(dropDownBaseClasses.noData)) {
            if (currentSkeletonCount !== this.skeletonCount && skeletonUpdated) {
                this.UpdateSkeleton(true, Math.abs(currentSkeletonCount - this.skeletonCount));
            }
            else {
                this.UpdateSkeleton();
            }
            this.liCollections = this.list.querySelectorAll('.e-list-item');
            if ((this.list.getElementsByClassName('e-virtual-ddl').length > 0)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.list.getElementsByClassName('e-virtual-ddl')[0].style = this.GetVirtualTrackHeight();
            }
            else if (!this.list.querySelector('.e-virtual-ddl') && this.skeletonCount > 0 && this.list.querySelector('.e-dropdownbase')) {
                const virualElement = this.createElement('div', {
                    id: this.element.id + '_popup', className: 'e-virtual-ddl', styles: this.GetVirtualTrackHeight()
                });
                this.list.querySelector('.e-dropdownbase').appendChild(virualElement);
            }
            if (this.list.getElementsByClassName('e-virtual-ddl-content').length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.list.getElementsByClassName('e-virtual-ddl-content')[0].style = this.getTransformValues();
            }
        }
    }
    getSkeletonCount(retainSkeleton) {
        this.virtualListHeight = this.listContainerHeight != null ? parseInt(this.listContainerHeight, 10) : this.virtualListHeight;
        const actualCount = this.virtualListHeight > 0 && this.listItemHeight > 0 ?
            Math.floor(this.virtualListHeight / this.listItemHeight) : 0;
        this.skeletonCount = actualCount * 4 < this.itemCount ? this.itemCount : actualCount * 4;
        this.itemCount = retainSkeleton ? this.itemCount : this.skeletonCount;
        this.virtualItemCount = this.itemCount;
        this.skeletonCount = Math.floor(this.skeletonCount / 2);
    }
    GetVirtualTrackHeight() {
        let height = this.totalItemCount === this.viewPortInfo.endIndex ?
            this.totalItemCount * this.listItemHeight - this.itemCount * this.listItemHeight : this.totalItemCount * this.listItemHeight;
        height = this.isVirtualTrackHeight ? 0 : height;
        const heightDimension = `height: ${height - this.itemCount * this.listItemHeight}px;`;
        if ((this.getModuleName() === 'autocomplete' || this.getModuleName() === 'multiselect') && this.skeletonCount === 0) {
            return 'height: 0px;';
        }
        return heightDimension;
    }
    getTransformValues() {
        let translateY = this.viewPortInfo.startIndex * this.listItemHeight;
        translateY = translateY - (this.skeletonCount * this.listItemHeight);
        translateY = ((this.viewPortInfo.startIndex === 0 && this.listData && this.listData.length === 0) ||
            this.skeletonCount === 0) ? 0 : translateY;
        const styleText = `transform: translate(0px, ${translateY}px);`;
        return styleText;
    }
    UpdateSkeleton(isSkeletonCountChange, skeletonCount) {
        const isContainSkeleton = this.list.querySelector('.e-virtual-ddl-content');
        const isContainVirtualList = this.list.querySelector('.e-virtual-list');
        if (isContainSkeleton && (!isContainVirtualList || isSkeletonCountChange) && this.isVirtualizationEnabled) {
            const totalSkeletonCount = isSkeletonCountChange ? skeletonCount : this.skeletonCount;
            for (let i = 0; i < totalSkeletonCount; i++) {
                const liElement = this.createElement('li', { className: dropDownBaseClasses.virtualList, styles: 'overflow: inherit' });
                if (this.isVirtualizationEnabled && this.itemTemplate) {
                    liElement.style.height = (this.listItemHeight - parseInt(window.getComputedStyle(this.getItems()[1]).marginBottom, 10)) + 'px';
                }
                const skeleton = new Skeleton({
                    shape: 'Text',
                    height: '10px',
                    width: '95%',
                    cssClass: 'e-skeleton-text'
                });
                skeleton.appendTo(this.createElement('div'));
                liElement.appendChild(skeleton.element);
                if (isContainSkeleton.firstChild) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    isContainSkeleton.firstChild.insertBefore(liElement, isContainSkeleton.firstChild.children[0]);
                }
            }
            if (this.getModuleName() === 'multiselect' && !this.isVirtualReorder && !isContainSkeleton.firstChild.classList.contains('e-reorder')) {
                for (let i = 0; i < totalSkeletonCount && this.totalItemCount !== this.viewPortInfo.endIndex; i++) {
                    const liElement = this.createElement('li', { className: `${dropDownBaseClasses.virtualList} e-virtual-list-end`, styles: 'overflow: inherit' });
                    if (this.isVirtualizationEnabled && this.itemTemplate) {
                        liElement.style.height = (this.listItemHeight - parseInt(window.getComputedStyle(this.getItems()[1]).marginBottom, 10)) + 'px';
                    }
                    const skeleton = new Skeleton({
                        shape: 'Text',
                        height: '10px',
                        width: '95%',
                        cssClass: 'e-skeleton-text-end'
                    });
                    skeleton.appendTo(this.createElement('div'));
                    liElement.appendChild(skeleton.element);
                    if (isContainSkeleton.firstChild) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        isContainSkeleton.firstChild.appendChild(liElement);
                    }
                }
                if (this.totalItemCount === this.viewPortInfo.endIndex) {
                    isContainSkeleton.querySelectorAll('.e-virtual-list-end').forEach((el) => el.remove());
                }
            }
        }
    }
    getLocaleName() {
        return 'drop-down-base';
    }
    getTextByValue(value) {
        const text = this.checkValueCase(value, false, false, true);
        return text;
    }
    getFormattedValue(value) {
        if (this.listData && this.listData.length) {
            let item;
            if (this.properties.allowCustomValue &&
                this.properties.value &&
                this.properties.value instanceof Array &&
                this.properties.value.length > 0) {
                item = this.typeOfData(this.properties.value);
            }
            else {
                item = this.typeOfData(this.listData);
            }
            if (typeof getValue((this.fields.value ? this.fields.value : 'value'), item.item) === 'number' ||
                item.typeof === 'number') {
                return parseFloat(value);
            }
            if (typeof getValue((this.fields.value ? this.fields.value : 'value'), item.item) === 'boolean' ||
                item.typeof === 'boolean') {
                return ((value === 'true') || ('' + value === 'true'));
            }
        }
        return value;
    }
    /**
     * Sets RTL to dropdownbase wrapper
     *
     * @returns {void}
     */
    setEnableRtl() {
        if (!isNullOrUndefined(this.enableRtlElements)) {
            if (this.list) {
                this.enableRtlElements.push(this.list);
            }
            if (this.enableRtl) {
                addClass(this.enableRtlElements, dropDownBaseClasses.rtl);
            }
            else {
                removeClass(this.enableRtlElements, dropDownBaseClasses.rtl);
            }
        }
    }
    /**
     * Initialize the Component.
     *
     * @param {MouseEvent | KeyboardEventArgs | TouchEvent} e - The event object.
     * @returns {void}
     */
    initialize(e) {
        this.bindEvent = true;
        this.preventPopupOpen = true;
        this.actionFailureTemplateId = `${this.element.id}${ACTIONFAILURETEMPLATE_PROPERTY}`;
        if (this.element.tagName === 'UL') {
            const jsonElement = ListBase.createJsonFromElement(this.element);
            this.setProperties({ fields: { text: 'text', value: 'text' } }, true);
            this.resetList(jsonElement, this.fields);
        }
        else if (this.element.tagName === 'SELECT') {
            const dataSource = this.dataSource instanceof Array ? (this.dataSource.length > 0 ? true : false)
                : !isNullOrUndefined(this.dataSource) ? true : false;
            if (!dataSource) {
                this.renderItemsBySelect();
            }
            else if (this.isDynamicDataChange) {
                this.setListData(this.dataSource, this.fields, this.query);
            }
        }
        else {
            this.setListData(this.dataSource, this.fields, this.query, e);
        }
    }
    /**
     * Get the properties to be maintained in persisted state.
     *
     * @returns {string} Returns the persisted data of the component.
     */
    getPersistData() {
        return this.addOnPersist([]);
    }
    /**
     * Sets the enabled state to DropDownBase.
     *
     * @param {string} value - Specifies the attribute values to add on the input element.
     * @returns {void}
     */
    updateDataAttribute(value) {
        const invalidAttr = ['class', 'style', 'id', 'type', 'aria-expanded', 'aria-autocomplete', 'aria-readonly'];
        const attr = {};
        for (let a = 0; a < this.element.attributes.length; a++) {
            if (invalidAttr.indexOf(this.element.attributes[a].name) === -1 &&
                !(this.getModuleName() === 'dropdownlist' && this.element.attributes[a].name === 'readonly')) {
                attr[this.element.attributes[a].name] = this.element.getAttribute(this.element.attributes[a].name);
            }
        }
        extend(attr, value, attr);
        this.setProperties({ htmlAttributes: attr }, true);
    }
    renderItemsBySelect() {
        const element = this.element;
        const group = element.querySelectorAll('select>optgroup');
        let fields;
        const isSelectGroupCheck = this.getModuleName() === 'multiselect' && this.isGroupChecking && group.length > 0;
        fields = isSelectGroupCheck ? { value: 'value', text: 'text', groupBy: 'categeory' } : fields = { value: 'value', text: 'text' };
        const jsonElement = [];
        const option = element.querySelectorAll('select>option');
        this.getJSONfromOption(jsonElement, option, fields);
        if (group.length) {
            for (let i = 0; i < group.length; i++) {
                const item = group[i];
                const optionGroup = {};
                optionGroup[fields.text] = item.label;
                optionGroup.isHeader = true;
                const child = item.querySelectorAll('option');
                if (isSelectGroupCheck) {
                    this.getJSONfromOption(jsonElement, child, fields, item.label);
                }
                else {
                    jsonElement.push(optionGroup);
                    this.getJSONfromOption(jsonElement, child, fields);
                }
            }
            element.querySelectorAll('select>option');
        }
        this.updateFields(fields.text, fields.value, isSelectGroupCheck ? fields.groupBy : this.fields.groupBy, this.fields.htmlAttributes, this.fields.iconCss, this.fields.disabled);
        this.resetList(jsonElement, fields);
    }
    updateFields(text, value, groupBy, htmlAttributes, iconCss, disabled) {
        const field = {
            'fields': {
                text: text,
                value: value,
                groupBy: !isNullOrUndefined(groupBy) ? groupBy : this.fields && this.fields.groupBy,
                htmlAttributes: !isNullOrUndefined(htmlAttributes) ? htmlAttributes : this.fields && this.fields.htmlAttributes,
                iconCss: !isNullOrUndefined(iconCss) ? iconCss : this.fields && this.fields.iconCss,
                disabled: !isNullOrUndefined(disabled) ? disabled : this.fields && this.fields.disabled
            }
        };
        this.setProperties(field, true);
    }
    getJSONfromOption(items, options, fields, category = null) {
        for (const option of options) {
            const json = {};
            json[fields.text] = option.innerText;
            json[fields.value] = !isNullOrUndefined(option.getAttribute(fields.value)) ?
                option.getAttribute(fields.value) : option.innerText;
            if (!isNullOrUndefined(category)) {
                json[fields.groupBy] = category;
            }
            items.push(json);
        }
    }
    /**
     * Execute before render the list items
     *
     * @private
     * @returns {void}
     */
    preRender() {
        // there is no event handler
        this.scrollTimer = -1;
        this.enableRtlElements = [];
        this.isRequested = false;
        this.isDataFetched = false;
        this.itemTemplateId = `${this.element.id}${ITEMTEMPLATE_PROPERTY}`;
        this.displayTemplateId = `${this.element.id}${DISPLAYTEMPLATE_PROPERTY}`;
        this.spinnerTemplateId = `${this.element.id}${SPINNERTEMPLATE_PROPERTY}`;
        this.valueTemplateId = `${this.element.id}${VALUETEMPLATE_PROPERTY}`;
        this.groupTemplateId = `${this.element.id}${GROUPTEMPLATE_PROPERTY}`;
        this.headerTemplateId = `${this.element.id}${HEADERTEMPLATE_PROPERTY}`;
        this.footerTemplateId = `${this.element.id}${FOOTERTEMPLATE_PROPERTY}`;
        this.noRecordsTemplateId = `${this.element.id}${NORECORDSTEMPLATE_PROPERTY}`;
    }
    /**
     * Creates the list items of DropDownBase component.
     *
     * @param {Object[] | string[] | number[] | DataManager | boolean[]} dataSource - Specifies the data to generate the list.
     * @param {FieldSettingsModel} fields - Maps the columns of the data table and binds the data to the component.
     * @param {Query} query - Accepts the external Query that execute along with data processing.
     * @param {MouseEvent | KeyboardEventArgs | TouchEvent} event - Specifies the event which is the reason for the invocation of this method.
     * @returns {void}
     */
    setListData(dataSource, fields, query, event) {
        fields = fields ? fields : this.fields;
        let ulElement;
        this.isActive = true;
        const eventArgs = { cancel: false, data: dataSource, query: query };
        this.isPreventChange = this.isAngular && this.preventChange ? true : this.isPreventChange;
        if (!this.isRequesting) {
            this.trigger('actionBegin', eventArgs, (eventArgs) => {
                if (!eventArgs.cancel) {
                    this.isRequesting = true;
                    this.showSpinner();
                    if (dataSource instanceof DataManager) {
                        this.isRequested = true;
                        let isWhereExist = false;
                        if (this.isDataFetched) {
                            this.emptyDataRequest(fields);
                            return;
                        }
                        const query = this.getQuery(eventArgs.query);
                        eventArgs.data.executeQuery(query).then((e) => {
                            this.isPreventChange = this.isAngular && this.preventChange ? true : this.isPreventChange;
                            let isReOrder = true;
                            if (!this.virtualSelectAll) {
                                const newQuery = query.clone();
                                for (let queryElements = 0; queryElements < newQuery.queries.length; queryElements++) {
                                    if (newQuery.queries[queryElements].fn === 'onWhere') {
                                        isWhereExist = true;
                                    }
                                }
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                if (this.isVirtualizationEnabled && (e.count !== 0 && e.count < (this.itemCount * 2))) {
                                    if (newQuery) {
                                        for (let queryElements = 0; queryElements < newQuery.queries.length; queryElements++) {
                                            if (newQuery.queries[queryElements].fn === 'onTake') {
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                newQuery.queries[queryElements].e.nos = e.count;
                                            }
                                            if (this.getModuleName() === 'multiselect' && (newQuery.queries[queryElements].e.condition === 'or' || newQuery.queries[queryElements].e.operator === 'equal') && !this.isCustomFiltering) {
                                                isReOrder = false;
                                            }
                                        }
                                    }
                                }
                                else {
                                    this.isVirtualTrackHeight = false;
                                    if (newQuery) {
                                        for (let queryElements = 0; queryElements < newQuery.queries.length; queryElements++) {
                                            if (this.getModuleName() === 'multiselect' && ((newQuery.queries[queryElements].e && newQuery.queries[queryElements].e.condition === 'or') || (newQuery.queries[queryElements].e && newQuery.queries[queryElements].e.operator === 'equal'))) {
                                                isReOrder = false;
                                            }
                                        }
                                    }
                                }
                            }
                            if (isReOrder) {
                                // eslint-disable @typescript-eslint/no-explicit-any
                                this.dataCount = this.totalItemCount = e.count;
                            }
                            this.trigger('actionComplete', e, (e) => {
                                if (!e.cancel) {
                                    this.isRequesting = false;
                                    this.isCustomFiltering = false;
                                    const listItems = e.result;
                                    if (this.isIncrementalRequest) {
                                        ulElement = this.renderItems(listItems, fields);
                                        return;
                                    }
                                    if ((!this.isVirtualizationEnabled && listItems.length === 0) ||
                                        (this.isVirtualizationEnabled && listItems.length === 0 && !isWhereExist)) {
                                        this.isDataFetched = true;
                                    }
                                    if (!isWhereExist) {
                                        this.remoteDataCount = e.count;
                                    }
                                    this.dataCount = !this.virtualSelectAll ? e.count : this.dataCount;
                                    this.totalItemCount = !this.virtualSelectAll ? e.count : this.totalItemCount;
                                    ulElement = this.renderItems(listItems, fields);
                                    this.appendUncheckList = false;
                                    this.isUpdateGroupTemplate = false;
                                    this.onActionComplete(ulElement, listItems, e);
                                    if (this.groupTemplate) {
                                        if (this.isAngular && this.getModuleName() === 'multiselect') {
                                            this.updateGroupHeaderItems(ulElement);
                                        }
                                        this.renderGroupTemplate(ulElement);
                                    }
                                    this.isUpdateGroupTemplate = true;
                                    this.isRequested = false;
                                    this.bindChildItems(listItems, ulElement, fields, e);
                                    if (this.getInitialData) {
                                        this.getInitialData = false;
                                        this.preventPopupOpen = false;
                                        return;
                                    }
                                    let isSetCurrentcall = false;
                                    if (this.isVirtualizationEnabled && this.setCurrentView) {
                                        isSetCurrentcall = true;
                                        this.notify('setCurrentViewDataAsync', {
                                            module: 'VirtualScroll'
                                        });
                                    }
                                    if (this.keyboardEvent != null) {
                                        this.handleVirtualKeyboardActions(this.keyboardEvent, this.pageCount);
                                    }
                                    const preventSkeleton = this.getModuleName() !== 'multiselect' || (this.getModuleName() === 'multiselect' && (!(this.dataSource instanceof DataManager) || (this.dataSource instanceof DataManager && !isSetCurrentcall)));
                                    if (this.isVirtualizationEnabled && preventSkeleton) {
                                        this.getFilteringSkeletonCount();
                                        this.updatePopupPosition();
                                    }
                                    if (this.virtualSelectAll && this.virtualSelectAllData) {
                                        this.virtualSelectionAll(this.virtualSelectAllState, this.liCollections, this.CurrentEvent);
                                        this.virtualSelectAllState = false;
                                        this.CurrentEvent = null;
                                        this.virtualSelectAll = false;
                                    }
                                }
                            });
                        }).catch((e) => {
                            this.isRequested = false;
                            this.isRequesting = false;
                            this.onActionFailure(e);
                            this.hideSpinner();
                        });
                    }
                    else {
                        this.isRequesting = false;
                        let isReOrder = true;
                        let listItems;
                        if (this.isVirtualizationEnabled && !this.virtualGroupDataSource && this.fields.groupBy) {
                            const data = new DataManager(this.dataSource).executeLocal(new Query().group(this.fields.groupBy));
                            this.virtualGroupDataSource = data.records;
                        }
                        const dataManager = this.isVirtualizationEnabled &&
                            this.virtualGroupDataSource
                            && !this.isCustomDataUpdated ? new DataManager(this.virtualGroupDataSource) :
                            new DataManager(eventArgs.data);
                        listItems = (this.getQuery(eventArgs.query)).executeLocal(dataManager);
                        if (!this.virtualSelectAll) {
                            const newQuery = this.getQuery(eventArgs.query);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            if (this.isVirtualizationEnabled && (listItems.count !== 0 &&
                                listItems.count < (this.itemCount * 2)) && !this.appendUncheckList) {
                                if (newQuery) {
                                    for (let queryElements = 0; queryElements < newQuery.queries.length; queryElements++) {
                                        if (newQuery.queries[queryElements].fn === 'onTake') {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            newQuery.queries[queryElements].e.nos = listItems.count;
                                            listItems = (newQuery).executeLocal(dataManager);
                                        }
                                        if (this.getModuleName() === 'multiselect' && (newQuery.queries[queryElements].e.condition === 'or' || newQuery.queries[queryElements].e.operator === 'equal') && !this.isCustomFiltering) {
                                            isReOrder = false;
                                        }
                                    }
                                    if (isReOrder) {
                                        listItems = (newQuery).executeLocal(dataManager);
                                        this.isVirtualTrackHeight = (!(this.dataSource instanceof DataManager) &&
                                            !this.isCustomDataUpdated) ? true : false;
                                    }
                                }
                            }
                            else {
                                this.isVirtualTrackHeight = false;
                                if (newQuery) {
                                    for (let queryElements = 0; queryElements < newQuery.queries.length; queryElements++) {
                                        if (this.getModuleName() === 'multiselect' && ((newQuery.queries[queryElements].e && newQuery.queries[queryElements].e.condition === 'or') || (newQuery.queries[queryElements].e && newQuery.queries[queryElements].e.operator === 'equal'))) {
                                            isReOrder = false;
                                        }
                                    }
                                }
                            }
                        }
                        if (isReOrder && (!(this.dataSource instanceof DataManager) && !this.isCustomDataUpdated) &&
                            !this.virtualSelectAll) {
                            // eslint-disable @typescript-eslint/no-explicit-any
                            this.dataCount = this.totalItemCount = this.virtualSelectAll ? listItems.length :
                                listItems.count;
                        }
                        listItems = this.isVirtualizationEnabled ? listItems.result : listItems;
                        // eslint-enable @typescript-eslint/no-explicit-any
                        const localDataArgs = { cancel: false, result: listItems };
                        this.isPreventChange = this.isAngular && this.preventChange ? true : this.isPreventChange;
                        this.trigger('actionComplete', localDataArgs, (localDataArgs) => {
                            this.isCustomFiltering = false;
                            if (this.isIncrementalRequest) {
                                ulElement = this.renderItems(localDataArgs.result, fields);
                                return;
                            }
                            if (!localDataArgs.cancel) {
                                ulElement = this.renderItems(localDataArgs.result, fields);
                                this.isUpdateGroupTemplate = false;
                                this.onActionComplete(ulElement, localDataArgs.result, event);
                                if (this.groupTemplate) {
                                    if (this.isAngular && this.getModuleName() === 'multiselect') {
                                        this.updateGroupHeaderItems(ulElement);
                                    }
                                    this.renderGroupTemplate(ulElement);
                                }
                                this.isUpdateGroupTemplate = true;
                                this.bindChildItems(localDataArgs.result, ulElement, fields);
                                if (this.getInitialData) {
                                    this.getInitialData = false;
                                    this.preventPopupOpen = false;
                                    return;
                                }
                                setTimeout(() => {
                                    if (this.getModuleName() === 'multiselect' && this.itemTemplate != null && (ulElement.childElementCount > 0 && (ulElement.children[0].childElementCount > 0 || (this.fields.groupBy && ulElement.children[1] && ulElement.children[1].childElementCount > 0)))) {
                                        this.updateDataList();
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    }
    updateGroupHeaderItems(ulElement) {
        const headerElements = ulElement.querySelectorAll('.' + dropDownBaseClasses.group);
        const clonedHeaders = [];
        for (let i = 0; i < headerElements.length; i++) {
            clonedHeaders.push(headerElements[i].cloneNode ? headerElements[i].cloneNode(true) :
                headerElements[i]);
        }
        if (!this.isFilterAction) {
            this.groupHeaderItems = clonedHeaders;
        }
        else {
            this.fiteredGroupHeaderItems = clonedHeaders;
        }
    }
    setCustomListData(dataSource, fields, query, event) {
        fields = fields ? fields : this.fields;
        let ulElement;
        this.isActive = true;
        this.isPreventChange = this.isAngular && this.preventChange ? true : this.isPreventChange;
        if (!this.isRequesting) {
            this.isRequesting = true;
            this.showSpinner();
            this.isRequesting = false;
            let isReOrder = true;
            let listItems;
            if (this.isVirtualizationEnabled && !this.virtualGroupDataSource && this.fields.groupBy) {
                const data = new DataManager(this.dataSource).executeLocal(new Query().group(this.fields.groupBy));
                this.virtualGroupDataSource = data.records;
            }
            const dataManager = this.isVirtualizationEnabled &&
                this.virtualGroupDataSource
                && !this.isCustomDataUpdated ? new DataManager(this.virtualGroupDataSource) :
                new DataManager(dataSource);
            listItems = (this.getQuery(query)).executeLocal(dataManager);
            if (!this.virtualSelectAll) {
                const newQuery = this.getQuery(query);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (this.isVirtualizationEnabled && (listItems.count !== 0 &&
                    listItems.count < (this.itemCount * 2)) && !this.appendUncheckList) {
                    if (newQuery) {
                        for (let queryElements = 0; queryElements < newQuery.queries.length; queryElements++) {
                            if (newQuery.queries[queryElements].fn === 'onTake') {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                newQuery.queries[queryElements].e.nos = listItems.count;
                                listItems = (newQuery).executeLocal(dataManager);
                            }
                            if (this.getModuleName() === 'multiselect' && (newQuery.queries[queryElements].e.condition === 'or' || newQuery.queries[queryElements].e.operator === 'equal') && !this.isCustomFiltering) {
                                isReOrder = false;
                            }
                        }
                        if (isReOrder) {
                            listItems = (newQuery).executeLocal(dataManager);
                            this.isVirtualTrackHeight = (!(this.dataSource instanceof DataManager) &&
                                !this.isCustomDataUpdated) ? true : false;
                        }
                    }
                }
                else {
                    this.isVirtualTrackHeight = false;
                    if (newQuery) {
                        for (let queryElements = 0; queryElements < newQuery.queries.length; queryElements++) {
                            if (this.getModuleName() === 'multiselect' && ((newQuery.queries[queryElements].e && newQuery.queries[queryElements].e.condition === 'or') || (newQuery.queries[queryElements].e && newQuery.queries[queryElements].e.operator === 'equal'))) {
                                isReOrder = false;
                            }
                        }
                    }
                }
            }
            if (isReOrder && (!(this.dataSource instanceof DataManager) && !this.isCustomDataUpdated) &&
                !this.virtualSelectAll) {
                // eslint-disable @typescript-eslint/no-explicit-any
                this.dataCount = this.totalItemCount = this.virtualSelectAll ? listItems.length :
                    listItems.count;
            }
            listItems = this.isVirtualizationEnabled ? listItems.result : listItems;
            this.isPreventChange = this.isAngular && this.preventChange ? true : this.isPreventChange;
            this.isCustomFiltering = false;
            if (this.isIncrementalRequest) {
                ulElement = this.renderItems(listItems, fields);
                return;
            }
            ulElement = this.renderItems(listItems, fields);
            this.onActionComplete(ulElement, listItems, event);
            if (this.groupTemplate) {
                this.renderGroupTemplate(ulElement);
            }
            this.bindChildItems(listItems, ulElement, fields);
            setTimeout(() => {
                if (this.getModuleName() === 'multiselect' && this.itemTemplate != null && (ulElement.childElementCount > 0 && (ulElement.children[0].childElementCount > 0 || (this.fields.groupBy && ulElement.children[1] && ulElement.children[1].childElementCount > 0)))) {
                    this.updateDataList();
                }
            });
        }
    }
    handleVirtualKeyboardActions(e, pageCount) {
        // Used this method in component side.
    }
    updatePopupState() {
        // Used this method in component side.
    }
    updatePopupPosition() {
        // Used this method in component side.
    }
    virtualSelectionAll(state, li, event) {
        // Used this method in component side.
    }
    updateRemoteData() {
        this.setListData(this.dataSource, this.fields, this.query);
    }
    bindChildItems(listItems, ulElement, fields, e) {
        if (listItems.length >= 100 && this.getModuleName() === 'autocomplete') {
            setTimeout(() => {
                const childNode = this.remainingItems(this.sortedData, fields);
                append(childNode, ulElement);
                this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
                this.updateListValues();
                this.raiseDataBound(listItems, e);
            }, 0);
        }
        else {
            this.raiseDataBound(listItems, e);
        }
    }
    isObjectInArray(objectToFind, array) {
        return array.some((item) => {
            return Object.keys(objectToFind).every((key) => {
                return Object.prototype.hasOwnProperty.call(item, key) && item[key] === objectToFind[key];
            });
        });
    }
    updateListValues() {
        // Used this method in component side.
    }
    findListElement(list, findNode, attribute, value) {
        let liElement = null;
        if (list) {
            const listArr = [].slice.call(list.querySelectorAll(findNode));
            for (let index = 0; index < listArr.length; index++) {
                if (listArr[index].getAttribute(attribute) === (value + '')) {
                    liElement = listArr[index];
                    break;
                }
            }
        }
        return liElement;
    }
    raiseDataBound(listItems, e) {
        this.hideSpinner();
        const dataBoundEventArgs = {
            items: listItems,
            e: e
        };
        this.trigger('dataBound', dataBoundEventArgs);
    }
    remainingItems(dataSource, fields) {
        const spliceData = new DataManager(dataSource).executeLocal(new Query().skip(100));
        if (this.itemTemplate) {
            const listElements = this.templateListItem(spliceData, fields);
            return [].slice.call(listElements.childNodes);
        }
        const type = this.typeOfData(spliceData).typeof;
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return ListBase.createListItemFromArray(this.createElement, spliceData, true, this.listOption(spliceData, fields), this);
        }
        return ListBase.createListItemFromJson(this.createElement, spliceData, this.listOption(spliceData, fields), 1, true, this);
    }
    emptyDataRequest(fields) {
        const listItems = [];
        this.onActionComplete(this.renderItems(listItems, fields), listItems);
        this.isRequested = false;
        this.isRequesting = false;
        this.hideSpinner();
    }
    showSpinner() {
        // Used this method in component side.
    }
    hideSpinner() {
        // Used this method in component side.
    }
    onActionFailure(e) {
        this.liCollections = [];
        this.trigger('actionFailure', e);
        this.l10nUpdate(true);
        if (!isNullOrUndefined(this.list)) {
            addClass([this.list], dropDownBaseClasses.noData);
        }
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    onActionComplete(ulElement, list, e) {
        /* eslint-enable @typescript-eslint/no-unused-vars */
        this.listData = list;
        if (this.isVirtualizationEnabled && !this.isCustomDataUpdated && !this.virtualSelectAll) {
            this.notify('setGeneratedData', {
                module: 'VirtualScroll'
            });
        }
        if (this.getModuleName() !== 'listbox') {
            ulElement.setAttribute('tabindex', '0');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.isReact) {
            this.clearTemplate(['itemTemplate', 'groupTemplate', 'actionFailureTemplate', 'noRecordsTemplate']);
        }
        if (!this.isVirtualizationEnabled) {
            this.fixedHeaderElement = isNullOrUndefined(this.fixedHeaderElement) ? this.fixedHeaderElement : null;
        }
        if (this.getModuleName() === 'multiselect' && this.properties.allowCustomValue && this.fields.groupBy) {
            for (let i = 0; i < ulElement.childElementCount; i++) {
                if (ulElement.children[i].classList.contains('e-list-group-item')) {
                    if (isNullOrUndefined(ulElement.children[i].innerHTML) || ulElement.children[i].innerHTML === '') {
                        addClass([ulElement.children[i]], HIDE_GROUPLIST);
                    }
                }
                if (ulElement.children[0].classList.contains('e-hide-group-header')) {
                    setStyleAttribute(ulElement.children[1], { zIndex: 11 });
                }
            }
        }
        if (this.getModuleName() === 'multiselect' && this.isAngular && this.ngEle) {
            const popupHolder = this.list;
            if (popupHolder) {
                const prevHeight = popupHolder.offsetHeight + 'px';
                popupHolder.style.height = prevHeight;
            }
        }
        if (!isNullOrUndefined(this.list)) {
            if (!this.isVirtualizationEnabled) {
                this.list.innerHTML = '';
                if (this.isUpdateGroupTemplate && this.isAngular && this.groupTemplate && this.getModuleName() === 'multiselect') {
                    const headerItems = ulElement.querySelectorAll('.' + dropDownBaseClasses.group);
                    if (headerItems.length > 0 && this.groupHeaderItems.length > 0) {
                        const groupHeaderMap = {};
                        for (let i = 0; i < this.groupHeaderItems.length; i++) {
                            groupHeaderMap[this.groupHeaderItems[i].id] = this.groupHeaderItems[i].innerHTML;
                        }
                        for (let i = 0; i < headerItems.length; i++) {
                            if (Object.prototype.hasOwnProperty.call(groupHeaderMap, headerItems[i].id)) {
                                headerItems[i].innerHTML = groupHeaderMap[headerItems[i].id];
                            }
                        }
                    }
                    this.renderGroupTemplate(ulElement);
                }
                this.list.appendChild(ulElement);
                this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
                this.ulElement = this.list.querySelector('ul');
                this.postRender(this.list, list, this.bindEvent);
            }
        }
        if (this.getModuleName() === 'multiselect' && this.isAngular && this.ngEle) {
            const popupHolder = this.list;
            if (popupHolder) {
                setTimeout(() => {
                    popupHolder.style.height = '';
                    this.refreshPopup();
                }, 0);
            }
        }
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    postRender(listElement, list, bindEvent) {
        if (this.fields.disabled) {
            const liCollections = listElement.querySelectorAll('.' + dropDownBaseClasses.li);
            const data = this.sortOrder !== 'None' ? !isNullOrUndefined(this.fields.groupBy) ?
                this.sortedData.filter((item) => !('isHeader' in item) || item.isHeader !== true) : this.sortedData : this.listData;
            for (let index = 0; index < liCollections.length; index++) {
                if (JSON.parse(JSON.stringify(data[index]))[this.fields.disabled]) {
                    if (!isNullOrUndefined(this.fields.groupBy)) {
                        const item = data[index];
                        const value = getValue((this.fields.value ? this.fields.value : 'value'), item);
                        const li = listElement.querySelector('li[data-value="' + value + '"]');
                        if (!isNullOrUndefined(li)) {
                            this.disableListItem(li);
                        }
                    }
                    else {
                        this.disableListItem(liCollections[index]);
                    }
                }
            }
        }
        /* eslint-enable @typescript-eslint/no-unused-vars */
        let focusItem = this.fields.disabled ? listElement.querySelector('.' + dropDownBaseClasses.li + ':not(.e-disabled') : listElement.querySelector('.' + dropDownBaseClasses.li);
        const selectedItem = listElement.querySelector('.' + dropDownBaseClasses.selected);
        if (focusItem && !selectedItem) {
            if (this.isVirtualizationEnabled && this.viewPortInfo.startIndex !== 0) {
                const elements = this.ulElement.querySelectorAll('li.' + dropDownBaseClasses.li + ':not(.e-virtual-list)' + ':not(.e-hide-listitem)');
                focusItem = elements && elements.length > 0 ? elements[2] : focusItem;
            }
            if (focusItem) {
                focusItem.classList.add(dropDownBaseClasses.focus);
            }
        }
        if (list.length <= 0) {
            this.l10nUpdate();
            addClass([listElement], dropDownBaseClasses.noData);
        }
        else {
            listElement.classList.remove(dropDownBaseClasses.noData);
        }
    }
    /**
     * Get the query to do the data operation before list item generation.
     *
     * @param {Query} query - Accepts the external Query that execute along with data processing.
     * @returns {Query} Returns the query to do the data query operation.
     */
    getQuery(query) {
        return query ? query : this.query ? this.query : new Query();
    }
    performFiltering(e) {
        // this is for component wise
    }
    debouncedFiltering(e, debounceDelay) {
        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.performFiltering(e);
        }, debounceDelay);
    }
    updateVirtualizationProperties(itemCount, filtering, isCheckbox) {
        this.isVirtualizationEnabled = true;
        this.virtualizedItemsCount = itemCount;
        this.isAllowFiltering = filtering;
        this.isCheckBoxSelection = isCheckbox;
    }
    /**
     * To render the template content for group header element.
     *
     * @param {HTMLElement} listEle - Specifies the group list elements.
     * @returns {void}
     */
    renderGroupTemplate(listEle) {
        if (this.fields.groupBy !== null && this.dataSource || this.element.querySelector('.' + dropDownBaseClasses.group)) {
            const dataSource = this.dataSource;
            const option = { groupTemplateID: this.groupTemplateId, isStringTemplate: this.isStringTemplate };
            const headerItems = this.isAngular && this.getModuleName() === 'multiselect' && !isNullOrUndefined(listEle) &&
                listEle.classList.contains(dropDownBaseClasses.fixedHead) ? [listEle] :
                listEle.querySelectorAll('.' + dropDownBaseClasses.group);
            const groupcheck = this.templateCompiler(this.groupTemplate);
            if (typeof this.groupTemplate !== 'function' && groupcheck) {
                const groupValue = select(this.groupTemplate, document).innerHTML.trim();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const tempHeaders = ListBase.renderGroupTemplate(groupValue, dataSource, this.fields.properties, headerItems, option, this);
                //EJ2-55168- Group checkbox is not working with group template
                if (this.isGroupChecking) {
                    for (let i = 0; i < tempHeaders.length; i++) {
                        this.notify('addItem', { module: 'CheckBoxSelection', item: tempHeaders[i] });
                    }
                }
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const tempHeaders = ListBase.renderGroupTemplate(this.groupTemplate, dataSource, this.fields.properties, headerItems, option, this);
                //EJ2-55168- Group checkbox is not working with group template
                if (this.isGroupChecking) {
                    for (let i = 0; i < tempHeaders.length; i++) {
                        this.notify('addItem', { module: 'CheckBoxSelection', item: tempHeaders[i] });
                    }
                }
            }
            this.renderReactTemplates();
        }
    }
    /**
     * To create the ul li list items
     *
     * @param {object []} dataSource - Specifies the data to generate the list.
     * @param {FieldSettingsModel} fields - Maps the columns of the data table and binds the data to the component.
     * @returns {HTMLElement} Return the ul li list items.
     */
    createListItems(dataSource, fields) {
        if (dataSource) {
            if (fields.groupBy || this.element.querySelector('optgroup')) {
                if (fields.groupBy) {
                    if (this.sortOrder !== 'None') {
                        dataSource = this.getSortedDataSource(dataSource);
                    }
                    const fieldSet = fields.properties ||
                        fields;
                    dataSource = ListBase.groupDataSource(dataSource, fieldSet, this.sortOrder);
                }
                addClass([this.list], dropDownBaseClasses.grouping);
            }
            else if (this.getModuleName() !== 'listbox' || (this.getModuleName() === 'listbox' && !this.preventDefActionFilter)) {
                dataSource = this.getSortedDataSource(dataSource);
            }
            const options = this.listOption(dataSource, fields);
            const spliceData = (dataSource.length > 100) ?
                new DataManager(dataSource).executeLocal(new Query().take(100))
                : dataSource;
            this.sortedData = dataSource;
            return ListBase.createList(this.createElement, (this.getModuleName() === 'autocomplete') ? spliceData : dataSource, options, true, this);
        }
        return null;
    }
    listOption(dataSource, fields) {
        const iconCss = isNullOrUndefined(fields.iconCss) ? false : true;
        const fieldValues = !isNullOrUndefined(fields.properties) ?
            fields.properties : fields;
        const options = (fields.text !== null || fields.value !== null) ? {
            fields: fieldValues,
            showIcon: iconCss, ariaAttributes: { groupItemRole: 'presentation' }
        } : { fields: { value: 'text' } };
        return extend({}, options, fields, true);
    }
    setFloatingHeader(e) {
        if (!isNullOrUndefined(this.list) && !this.list.classList.contains(dropDownBaseClasses.noData)) {
            if (isNullOrUndefined(this.fixedHeaderElement)) {
                this.fixedHeaderElement = this.createElement('div', { className: dropDownBaseClasses.fixedHead });
                if (!isNullOrUndefined(this.list) && !this.list.querySelector('li').classList.contains(dropDownBaseClasses.group)) {
                    this.fixedHeaderElement.style.display = 'none';
                }
                if (!isNullOrUndefined(this.fixedHeaderElement) && !isNullOrUndefined(this.list)) {
                    prepend([this.fixedHeaderElement], this.list);
                }
                this.setFixedHeader();
            }
            if (!isNullOrUndefined(this.fixedHeaderElement) && this.fixedHeaderElement.style.zIndex === '0') {
                this.setFixedHeader();
            }
            this.scrollStop(e);
        }
    }
    scrollStop(e, isDownkey) {
        const target = !isNullOrUndefined(e) ? e.target : this.list;
        const computedHeight = getComputedStyle(this.getValidLi(), null).getPropertyValue('height');
        const computedMarginValue = getComputedStyle(this.getValidLi(), null).getPropertyValue('margin-bottom');
        const marginValue = parseInt(computedMarginValue, 10);
        const liHeight = this.getModuleName() === 'multiselect' ? parseFloat(computedHeight) : parseInt(computedHeight, 10);
        const topIndex = Math.round(target.scrollTop / (liHeight + marginValue));
        const liCollections = this.list.querySelectorAll('li' + ':not(.e-hide-listitem)');
        const virtualListCount = this.list.querySelectorAll('.e-virtual-list').length;
        for (let i = topIndex; i > -1; i--) {
            const index = this.isVirtualizationEnabled ? i + virtualListCount : i;
            if (this.isVirtualizationEnabled) {
                if (this.fixedHeaderElement && this.updateGroupHeader(index, liCollections, target)) {
                    break;
                }
                if (isDownkey) {
                    if ((!isNullOrUndefined(liCollections[index]) && liCollections[index].classList.contains(dropDownBaseClasses.selected) && this.getModuleName() !== 'autocomplete') || (!isNullOrUndefined(liCollections[index]) && liCollections[index].classList.contains(dropDownBaseClasses.focus) && this.getModuleName() === 'autocomplete')) ;
                }
            }
            else {
                if (this.updateGroupHeader(index, liCollections, target)) {
                    break;
                }
            }
        }
    }
    getPageCount(returnExactCount) {
        if (this.list) {
            const liHeight = this.list.classList.contains(dropDownBaseClasses.noData) ? null :
                getComputedStyle(this.getItems()[0], null).getPropertyValue('height');
            const pageCount = Math.round(this.list.getBoundingClientRect().height / parseInt(liHeight, 10));
            return returnExactCount ? pageCount : Math.round(pageCount);
        }
        else {
            return 0;
        }
    }
    updateGroupHeader(index, liCollections, target) {
        if (!isNullOrUndefined(liCollections[index]) &&
            liCollections[index].classList.contains(dropDownBaseClasses.group)) {
            this.updateGroupFixedHeader(liCollections[index], target);
            return true;
        }
        else {
            this.fixedHeaderElement.style.display = 'none';
            this.fixedHeaderElement.style.top = 'none';
            return false;
        }
    }
    updateFixedGroupTemplateHader(element) {
        const groupData = element.cloneNode ? element.cloneNode(true) : element;
        let isGroupDataUpdated = false;
        if (this.groupHeaderItems && this.groupHeaderItems.length > 0) {
            for (let i = 0; i < this.groupHeaderItems.length; i++) {
                if (groupData.id === this.groupHeaderItems[i].id) {
                    groupData.innerHTML = this.groupHeaderItems[i].innerHTML;
                    isGroupDataUpdated = true;
                    break;
                }
            }
        }
        if (!isGroupDataUpdated && this.fiteredGroupHeaderItems && this.fiteredGroupHeaderItems.length > 0) {
            for (let i = 0; i < this.fiteredGroupHeaderItems.length; i++) {
                if (groupData.id === this.fiteredGroupHeaderItems[i].id) {
                    groupData.innerHTML = this.fiteredGroupHeaderItems[i].innerHTML;
                    break;
                }
            }
        }
        this.fixedHeaderElement.innerHTML = groupData.innerHTML;
        this.renderGroupTemplate(this.fixedHeaderElement);
    }
    updateGroupFixedHeader(element, target) {
        if (this.fixedHeaderElement) {
            if (!isNullOrUndefined(element.innerHTML)) {
                if (this.groupTemplate && this.isAngular && this.getModuleName() === 'multiselect') {
                    this.updateFixedGroupTemplateHader(element);
                }
                else {
                    this.fixedHeaderElement.innerHTML = element.innerHTML;
                }
            }
            this.fixedHeaderElement.style.position = 'fixed';
            this.fixedHeaderElement.style.top = (this.list.parentElement.offsetTop + this.list.offsetTop) - window.scrollY + 'px';
            this.fixedHeaderElement.style.display = 'block';
        }
    }
    getValidLi() {
        if (this.isVirtualizationEnabled) {
            return this.liCollections[0].classList.contains('e-virtual-list') ? this.liCollections[this.skeletonCount] : this.liCollections[0];
        }
        return this.liCollections[0];
    }
    /**
     * To render the list items
     *
     * @param {object[]} listData - Specifies the list of array of data.
     * @param {FieldSettingsModel} fields - Maps the columns of the data table and binds the data to the component.
     * @param {boolean} isCheckBoxUpdate - Specifies whether the list item is updated with checkbox.
     * @param {boolean} isClearAll - Specifies whether the current action is clearAll.
     * @returns {HTMLElement} Return the list items.
     */
    renderItems(listData, fields, isCheckBoxUpdate, isClearAll) {
        let ulElement;
        if (this.itemTemplate && listData) {
            if (this.getModuleName() === 'multiselect' && this.virtualSelectAll) {
                this.virtualSelectAllData = listData;
                listData = listData.slice(this.virtualItemStartIndex, this.virtualItemEndIndex);
            }
            let dataSource = listData;
            if (dataSource && fields.groupBy) {
                if (this.sortOrder !== 'None') {
                    dataSource = this.getSortedDataSource(dataSource);
                }
                dataSource = ListBase.groupDataSource(dataSource, fields.properties, this.sortOrder);
            }
            else if (this.getModuleName() !== 'listbox' || (this.getModuleName() === 'listbox' && !this.preventDefActionFilter)) {
                dataSource = this.getSortedDataSource(dataSource);
            }
            this.sortedData = dataSource;
            const spliceData = (dataSource.length > 100) ?
                new DataManager(dataSource).executeLocal(new Query().take(100))
                : dataSource;
            ulElement = this.templateListItem((this.getModuleName() === 'autocomplete') ? spliceData : dataSource, fields);
            if (this.isIncrementalRequest) {
                this.incrementalLiCollections = ulElement.querySelectorAll('.' + dropDownBaseClasses.li);
                this.incrementalUlElement = ulElement;
                this.incrementalListData = listData;
                return ulElement;
            }
            if (this.isVirtualizationEnabled) {
                const oldUlElement = this.list.querySelector('.e-list-parent');
                const virtualUlElement = this.list.querySelector('.e-virtual-ddl-content');
                if ((listData.length >= this.virtualizedItemsCount && oldUlElement && virtualUlElement) || (oldUlElement && virtualUlElement && this.isAllowFiltering) || (oldUlElement && virtualUlElement && this.getModuleName() === 'autocomplete')) {
                    if (this.getModuleName() === 'multiselect' && this.isCheckBoxSelection && this.appendUncheckList && this.list && this.list.querySelector('.e-active')) {
                        virtualUlElement.appendChild(ulElement);
                        isCheckBoxUpdate = true;
                    }
                    else {
                        virtualUlElement.replaceChild(ulElement, oldUlElement);
                    }
                    const reOrderList = this.list.querySelectorAll('.e-reorder');
                    if (this.list.querySelector('.e-virtual-ddl-content') && reOrderList && reOrderList.length > 0 && !isCheckBoxUpdate) {
                        this.list.querySelector('.e-virtual-ddl-content').removeChild(reOrderList[0]);
                    }
                    this.updateListElements(listData);
                }
                else if (!virtualUlElement) {
                    this.list.innerHTML = '';
                    this.createVirtualContent();
                    this.list.querySelector('.e-virtual-ddl-content').appendChild(ulElement);
                    this.updateListElements(listData);
                }
            }
        }
        else {
            if (this.getModuleName() === 'multiselect' && (this.virtualSelectAll && !isClearAll)) {
                this.virtualSelectAllData = listData;
                listData = listData.slice(this.virtualItemStartIndex, this.virtualItemEndIndex);
            }
            ulElement = this.createListItems(listData, fields);
            if (this.isIncrementalRequest) {
                this.incrementalLiCollections = ulElement.querySelectorAll('.' + dropDownBaseClasses.li);
                this.incrementalUlElement = ulElement;
                this.incrementalListData = listData;
                return ulElement;
            }
            if (this.isVirtualizationEnabled) {
                let oldUlElement = this.list.querySelector('.e-list-parent' + ':not(.e-reorder)');
                const virtualUlElement = this.list.querySelector('.e-virtual-ddl-content');
                const isRemovedUlelement = false;
                if ((!oldUlElement && this.list.querySelector('.e-list-parent' + '.e-reorder')) || (oldUlElement && this.isVirtualReorder && this.list.querySelector('.e-list-parent' + '.e-reorder'))) {
                    oldUlElement = this.list.querySelector('.e-list-parent' + '.e-reorder');
                }
                if ((listData.length >= this.virtualizedItemsCount && oldUlElement && virtualUlElement) || (oldUlElement && virtualUlElement && this.isAllowFiltering) || (oldUlElement && virtualUlElement && (this.getModuleName() === 'autocomplete' || this.getModuleName() === 'multiselect')) || isRemovedUlelement) {
                    if (this.getModuleName() !== 'multiselect' || (this.getModuleName() === 'multiselect' && (!(this.dataSource instanceof DataManager) || (this.dataSource instanceof DataManager && !this.setCurrentView)))) {
                        if (!this.appendUncheckList) {
                            virtualUlElement.replaceChild(ulElement, oldUlElement);
                        }
                        else {
                            virtualUlElement.appendChild(ulElement);
                        }
                    }
                    this.updateListElements(listData);
                }
                else if ((!virtualUlElement) || (!virtualUlElement.firstChild)) {
                    this.list.innerHTML = '';
                    this.createVirtualContent();
                    this.list.querySelector('.e-virtual-ddl-content').appendChild(ulElement);
                    this.updateListElements(listData);
                }
            }
        }
        return ulElement;
    }
    createVirtualContent() {
        if (!this.list.querySelector('.e-virtual-ddl-content')) {
            this.list.appendChild(this.createElement('div', {
                className: 'e-virtual-ddl-content'
            }));
        }
    }
    updateListElements(listData) {
        this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
        this.ulElement = this.list.querySelector('ul');
        this.listData = listData;
        this.postRender(this.list, listData, this.bindEvent);
    }
    templateListItem(dataSource, fields) {
        const option = this.listOption(dataSource, fields);
        option.templateID = this.itemTemplateId;
        option.isStringTemplate = this.isStringTemplate;
        const itemcheck = this.templateCompiler(this.itemTemplate);
        let ulElement;
        if (typeof this.itemTemplate !== 'function' && itemcheck) {
            const itemValue = select(this.itemTemplate, document).innerHTML.trim();
            ulElement = ListBase.renderContentTemplate(this.createElement, itemValue, dataSource, fields.properties, option, this);
            if (this.isVirtualizationEnabled && this.isReact) {
                this.renderReactTemplates();
            }
            return ulElement;
        }
        else {
            ulElement = ListBase.renderContentTemplate(this.createElement, this.itemTemplate, dataSource, fields.properties, option, this);
            if (this.isVirtualizationEnabled && this.isReact) {
                this.renderReactTemplates();
            }
            return ulElement;
        }
    }
    typeOfData(items) {
        let item = { typeof: null, item: null };
        for (let i = 0; (!isNullOrUndefined(items) && i < items.length); i++) {
            if (!isNullOrUndefined(items[i])) {
                const listDataType = typeof (items[i]) === 'string' ||
                    typeof (items[i]) === 'number' || typeof (items[i]) === 'boolean';
                const isNullData = listDataType ? isNullOrUndefined(items[i]) :
                    isNullOrUndefined(getValue((this.fields.value ? this.fields.value : 'value'), items[i]));
                if (!isNullData) {
                    return item = { typeof: typeof items[i], item: items[i] };
                }
            }
        }
        return item;
    }
    setFixedHeader() {
        if (!isNullOrUndefined(this.list)) {
            this.list.parentElement.style.display = 'block';
        }
        let borderWidth = 0;
        if (this.list && this.list.parentElement) {
            borderWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-width'), 10);
            /*Shorthand property not working in Firefox for getComputedStyle method.
            Refer bug report https://bugzilla.mozilla.org/show_bug.cgi?id=137688
            Refer alternate solution https://stackoverflow.com/a/41696234/9133493*/
            if (isNaN(borderWidth)) {
                const borderTopWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-top-width'), 10);
                const borderBottomWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-bottom-width'), 10);
                const borderLeftWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-left-width'), 10);
                const borderRightWidth = parseInt(document.defaultView.getComputedStyle(this.list.parentElement, null).getPropertyValue('border-right-width'), 10);
                borderWidth = (borderTopWidth + borderBottomWidth + borderLeftWidth + borderRightWidth);
            }
        }
        if (!isNullOrUndefined(this.liCollections)) {
            const liWidth = this.getValidLi().offsetWidth - borderWidth;
            this.fixedHeaderElement.style.width = liWidth.toString() + 'px';
        }
        setStyleAttribute(this.fixedHeaderElement, { zIndex: 10 });
        const firstLi = this.ulElement.querySelector('.' + dropDownBaseClasses.group + ':not(.e-hide-listitem)');
        if (!isNullOrUndefined(firstLi)) {
            if (this.groupTemplate && this.isAngular && this.getModuleName() === 'multiselect') {
                this.updateFixedGroupTemplateHader(firstLi);
            }
            else {
                this.fixedHeaderElement.innerHTML = firstLi.innerHTML;
            }
        }
    }
    getSortedDataSource(dataSource) {
        if (dataSource && this.sortOrder !== 'None') {
            let textField = this.fields.text ? this.fields.text : 'text';
            if (this.typeOfData(dataSource).typeof === 'string' || this.typeOfData(dataSource).typeof === 'number'
                || this.typeOfData(dataSource).typeof === 'boolean') {
                textField = '';
            }
            dataSource = ListBase.getDataSource(dataSource, ListBase.addSorting(this.sortOrder, textField));
        }
        return dataSource;
    }
    /**
     * Return the index of item which matched with given value in data source
     *
     * @param {string | number | boolean} value - Specifies given value.
     * @returns {number} Returns the index of the item.
     */
    getIndexByValue(value) {
        let index;
        let listItems = [];
        if (this.fields.disabled && this.getModuleName() === 'multiselect' && this.liCollections) {
            listItems = this.liCollections;
        }
        else {
            listItems = this.getItems();
        }
        for (let i = 0; i < listItems.length; i++) {
            if (!isNullOrUndefined(value) && listItems[i].getAttribute('data-value') === value.toString()) {
                index = i;
                break;
            }
        }
        return index;
    }
    /**
     * Return the index of item which matched with given value in data source
     *
     * @param {string | number | boolean} value - Specifies given value.
     * @param {HTMLElement} ulElement - Specifies given value.
     * @returns {number} Returns the index of the item.
     */
    getIndexByValueFilter(value, ulElement) {
        let index;
        if (!ulElement) {
            return null;
        }
        const listItems = ulElement.querySelectorAll('li' + ':not(.e-list-group-item)');
        if (listItems) {
            for (let i = 0; i < listItems.length; i++) {
                if (!isNullOrUndefined(value) && listItems[i].getAttribute('data-value') === value.toString()) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }
    /**
     * To dispatch the event manually
     *
     * @param {HTMLElement} element - Specifies the element to dispatch the event.
     * @param {string} type - Specifies the name of the event.
     * @returns {void}
     */
    dispatchEvent(element, type) {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent(type, false, true);
        if (element) {
            element.dispatchEvent(evt);
        }
    }
    /**
     * To set the current fields
     *
     * @returns {void}
     */
    setFields() {
        if (this.fields.value && !this.fields.text) {
            this.updateFields(this.fields.value, this.fields.value);
        }
        else if (!this.fields.value && this.fields.text) {
            this.updateFields(this.fields.text, this.fields.text);
        }
        else if (!this.fields.value && !this.fields.text) {
            this.isPrimitiveData = true;
            this.updateFields('text', 'text');
        }
    }
    /**
     * reset the items list.
     *
     * @param {Object[] | string[] | number[] | DataManager | boolean[]} dataSource - Specifies the data to generate the list.
     * @param {FieldSettingsModel} fields - Maps the columns of the data table and binds the data to the component.
     * @param {Query} query - Accepts the external Query that execute along with data processing.
     * @param {MouseEvent | KeyboardEventArgs | TouchEvent} e - Specifies the event.
     * @returns {void}
     */
    resetList(dataSource, fields, query, e) {
        if (this.list) {
            if ((this.element.tagName === 'SELECT' && this.element.options.length > 0)
                || (this.element.tagName === 'UL' && this.element.childNodes.length > 0)) {
                const data = dataSource instanceof Array ? (dataSource.length > 0)
                    : !isNullOrUndefined(dataSource);
                if (!data && this.selectData && this.selectData.length > 0) {
                    dataSource = this.selectData;
                }
            }
            dataSource = this.getModuleName() === 'combobox' && this.selectData && dataSource instanceof Array && dataSource.length < this.selectData.length && this.addedNewItem ? this.selectData : dataSource;
            this.addedNewItem = false;
            if (this.isCustomReset && this.getModuleName() === 'multiselect') {
                this.setCustomListData(dataSource, fields, query, e);
            }
            else {
                this.setListData(dataSource, fields, query, e);
            }
        }
    }
    updateSelectElementData(isFiltering) {
        if ((isFiltering || this.isVirtualizationEnabled) &&
            isNullOrUndefined(this.selectData) && this.listData && this.listData.length > 0) {
            this.selectData = this.listData;
        }
    }
    updateSelection() {
        // This is for after added the item, need to update the selected index values.
    }
    renderList() {
        // This is for render the list items.
        this.render();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateDataSource(props, oldProps) {
        this.resetList(this.dataSource);
        this.totalItemCount = this.dataSource instanceof DataManager ? this.dataSource.dataSource.json.length : 0;
    }
    setUpdateInitial(props, newProp, oldProp) {
        this.isDataFetched = false;
        this.isPrimitiveData = false;
        const updateData = {};
        for (let j = 0; props.length > j; j++) {
            if (newProp[props[j]] && props[j] === 'fields') {
                this.setFields();
                updateData[props[j]] = newProp[props[j]];
            }
            else if (newProp[props[j]]) {
                updateData[props[j]] = newProp[props[j]];
            }
        }
        if (Object.keys(updateData).length > 0) {
            if (Object.keys(updateData).indexOf('dataSource') === -1) {
                updateData.dataSource = this.dataSource;
            }
            if (this.getModuleName() === 'listbox') {
                if (!this.isReact || (this.isReact && (!isNullOrUndefined(newProp.dataSource) || !isNullOrUndefined(newProp.sortOrder)))) {
                    this.updateDataSource(updateData, oldProp);
                }
            }
            else {
                this.isDynamicData = true;
                this.updateDataSource(updateData, oldProp);
            }
        }
    }
    /**
     * When property value changes happened, then onPropertyChanged method will execute the respective changes in this component.
     *
     * @param {DropDownBaseModel} newProp - Returns the dynamic property value of the component.
     * @param {DropDownBaseModel} oldProp - Returns the previous property value of the component.
     * @private
     * @returns {void}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPropertyChanged(newProp, oldProp) {
        if (this.getModuleName() === 'dropdownbase') {
            this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp);
        }
        this.setUpdateInitial(['sortOrder', 'itemTemplate'], newProp);
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'query':
                case 'sortOrder':
                case 'dataSource':
                case 'itemTemplate':
                    break;
                case 'enableRtl':
                    this.setEnableRtl();
                    break;
                case 'groupTemplate':
                    this.renderGroupTemplate(this.list);
                    if (this.ulElement && this.fixedHeaderElement) {
                        const firstLi = this.ulElement.querySelector('.' + dropDownBaseClasses.group);
                        this.fixedHeaderElement.innerHTML = firstLi.innerHTML;
                    }
                    break;
                case 'locale':
                    if (this.list && (!isNullOrUndefined(this.liCollections) && this.liCollections.length === 0)) {
                        this.l10nUpdate();
                    }
                    break;
                case 'zIndex':
                    this.setProperties({ zIndex: newProp.zIndex }, true);
                    this.setZIndex();
                    break;
            }
        }
    }
    /**
     * Build and render the component
     *
     * @param {MouseEvent | KeyboardEventArgs | TouchEvent} e - Specifies the event.
     * @param {boolean} isEmptyData - Specifies the component to initialize with list data or not.
     * @private
     * @returns {void}
     */
    render(e, isEmptyData) {
        if (this.getModuleName() === 'listbox') {
            this.list = this.createElement('div', { className: dropDownBaseClasses.content, attrs: { 'tabindex': '0' } });
        }
        else {
            this.list = this.createElement('div', { className: dropDownBaseClasses.content });
        }
        this.list.classList.add(dropDownBaseClasses.root);
        this.setFields();
        const rippleModel = { duration: 300, selector: '.' + dropDownBaseClasses.li };
        this.rippleFun = rippleEffect(this.list, rippleModel);
        const group = this.element.querySelector('select>optgroup');
        if ((this.fields.groupBy || !isNullOrUndefined(group)) && !this.isGroupChecking) {
            EventHandler.add(this.list, 'scroll', this.setFloatingHeader, this);
            const elements = this.getScrollableParent();
            for (let i = 0; i < elements.length; i++) {
                const ele = elements[i];
                EventHandler.add(ele, 'scroll', this.updateGroupFixedHeader, this);
            }
        }
        if (this.getModuleName() === 'dropdownbase') {
            if (this.element.getAttribute('tabindex')) {
                this.list.setAttribute('tabindex', this.element.getAttribute('tabindex'));
            }
            removeClass([this.element], dropDownBaseClasses.root);
            this.element.style.display = 'none';
            const wrapperElement = this.createElement('div');
            this.element.parentElement.insertBefore(wrapperElement, this.element);
            wrapperElement.appendChild(this.element);
            wrapperElement.appendChild(this.list);
        }
        this.setEnableRtl();
        if (!isEmptyData) {
            this.initialize(e);
        }
    }
    getScrollableParent() {
        const eleStyle = getComputedStyle(this.element);
        const scrollParents = [];
        const overflowRegex = /(auto|scroll)/;
        let parent = this.element.parentElement;
        while (parent && parent.tagName !== 'HTML') {
            const parentStyle = getComputedStyle(parent);
            if (!(eleStyle.position === 'absolute' && parentStyle.position === 'static')
                && overflowRegex.test(parentStyle.overflow + parentStyle.overflowY + parentStyle.overflowX)) {
                scrollParents.push(parent);
            }
            parent = parent.parentElement;
        }
        scrollParents.push(document);
        return scrollParents;
    }
    removeScrollEvent() {
        if (this.list) {
            EventHandler.remove(this.list, 'scroll', this.setFloatingHeader);
        }
    }
    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */
    getModuleName() {
        return 'dropdownbase';
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Gets all the list items bound on this component.
     *
     * @returns {Element[]}
     */
    getItems() {
        return this.ulElement.querySelectorAll('.' + dropDownBaseClasses.li);
    }
    /* eslint-enable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Adds a new item to the popup list. By default, new item appends to the list as the last item,
     * but you can insert based on the index parameter.
     *
     * @param { Object[] } items - Specifies an array of JSON data or a JSON data.
     * @param { number } itemIndex - Specifies the index to place the newly added item in the popup list.
     * @returns {void}
     * @deprecated
     */
    addItem(items, itemIndex) {
        if (!this.list || (this.list.textContent === this.noRecordsTemplate && this.getModuleName() !== 'listbox')) {
            this.renderList();
        }
        if (this.sortOrder !== 'None' && isNullOrUndefined(itemIndex)) {
            let newList = [].slice.call(this.listData);
            newList.push(items);
            newList = this.getSortedDataSource(newList);
            if (this.fields.groupBy) {
                newList = ListBase.groupDataSource(newList, this.fields.properties, this.sortOrder);
                itemIndex = newList.indexOf(items);
            }
            else {
                itemIndex = newList.indexOf(items);
            }
        }
        const itemsCount = this.getItems().length;
        const isListboxEmpty = itemsCount === 0;
        const selectedItemValue = this.list.querySelector('.' + dropDownBaseClasses.selected);
        items = (items instanceof Array ? items : [items]);
        let index;
        index = (isNullOrUndefined(itemIndex) || itemIndex < 0 || itemIndex > itemsCount - 1) ? itemsCount : itemIndex;
        const fields = this.fields;
        if (items && fields.groupBy) {
            items = ListBase.groupDataSource(items, fields.properties);
        }
        const liCollections = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const isHeader = item.isHeader;
            const li = this.createElement('li', { className: isHeader ? dropDownBaseClasses.group : dropDownBaseClasses.li, id: 'option-add-' + i });
            const itemText = item instanceof Object ? getValue(fields.text, item) : item;
            if (isHeader) {
                li.innerText = itemText;
            }
            if (this.itemTemplate && !isHeader) {
                const itemCheck = this.templateCompiler(this.itemTemplate);
                const compiledString = typeof this.itemTemplate !== 'function' &&
                    itemCheck ? compile(select(this.itemTemplate, document).innerHTML.trim()) : compile(this.itemTemplate);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const addItemTemplate = compiledString(item, this, 'itemTemplate', this.itemTemplateId, this.isStringTemplate, null, li);
                if (addItemTemplate) {
                    append(addItemTemplate, li);
                }
            }
            else if (!isHeader) {
                li.appendChild(document.createTextNode(itemText));
            }
            li.setAttribute('data-value', item instanceof Object ? getValue(fields.value, item) : item);
            li.setAttribute('role', 'option');
            this.notify('addItem', { module: 'CheckBoxSelection', item: li });
            liCollections.push(li);
            if (this.getModuleName() === 'listbox') {
                this.listData.splice(isListboxEmpty ?
                    this.listData.length : index, 0, item);
                if (this.listData.length !== this.sortedData.length) {
                    this.sortedData = this.listData;
                }
            }
            else {
                this.listData.push(item);
            }
            if (this.sortOrder === 'None' && isNullOrUndefined(itemIndex) && index === 0) {
                index = null;
            }
            if (this.getModuleName() === 'listbox') {
                this.updateActionCompleteData(li, item, isListboxEmpty ? null : index + i);
            }
            else {
                this.updateActionCompleteData(li, item, index);
            }
            //Listbox event
            this.trigger('beforeItemRender', { element: li, item: item });
        }
        if (itemsCount === 0 && isNullOrUndefined(this.list.querySelector('ul'))) {
            if (!isNullOrUndefined(this.list)) {
                this.list.innerHTML = '';
                this.list.classList.remove(dropDownBaseClasses.noData);
                this.isAddNewItemTemplate = true;
                if (!isNullOrUndefined(this.ulElement)) {
                    this.list.appendChild(this.ulElement);
                }
            }
            this.liCollections = liCollections;
            if (!isNullOrUndefined(liCollections) && !isNullOrUndefined(this.ulElement)) {
                append(liCollections, this.ulElement);
            }
            this.updateAddItemList(this.list, itemsCount);
        }
        else {
            if (this.getModuleName() === 'listbox' && itemsCount === 0) {
                this.ulElement.innerHTML = '';
            }
            const attr = [];
            for (let i = 0; i < items.length; i++) {
                const listGroupItem = this.ulElement.querySelectorAll('.e-list-group-item');
                for (let j = 0; j < listGroupItem.length; j++) {
                    attr[j] = listGroupItem[j].innerText;
                }
                if (attr.indexOf(liCollections[i].innerText) > -1 && fields.groupBy) {
                    for (let j = 0; j < listGroupItem.length; j++) {
                        if (attr[j] === liCollections[i].innerText) {
                            if (this.sortOrder === 'None') {
                                this.ulElement.insertBefore(liCollections[i + 1], listGroupItem[j + 1]);
                            }
                            else {
                                this.ulElement.insertBefore(liCollections[i + 1], this.ulElement.childNodes[itemIndex]);
                            }
                            i = i + 1;
                            break;
                        }
                    }
                }
                else {
                    if (this.liCollections[index] && this.liCollections[index].parentNode) {
                        this.liCollections[index].parentNode.
                            insertBefore(liCollections[i], this.liCollections[index]);
                    }
                    else {
                        if (itemIndex && this.getModuleName() === 'listbox') {
                            this.ulElement.insertBefore(liCollections[i], this.ulElement.childNodes[itemIndex + i]);
                        }
                        else {
                            this.ulElement.appendChild(liCollections[i]);
                        }
                    }
                }
                const tempLi = [].slice.call(this.liCollections);
                tempLi.splice(index, 0, liCollections[i]);
                this.liCollections = tempLi;
                index += 1;
                if (this.getModuleName() === 'multiselect') {
                    this.updateDataList();
                }
            }
        }
        if (this.getModuleName() === 'listbox' && this.isReact) {
            this.renderReactTemplates();
        }
        if (selectedItemValue || itemIndex === 0) {
            this.updateSelection();
        }
        this.addedNewItem = true;
    }
    /**
     * Checks if the given HTML element is disabled.
     *
     * @param {HTMLElement} li - The HTML element to check.
     * @returns {boolean} - Returns true if the element is disabled, otherwise false.
     */
    isDisabledElement(li) {
        if (li && li.classList.contains('e-disabled')) {
            return true;
        }
        return false;
    }
    /**
     * Checks whether the list item at the specified index is disabled.
     *
     * @param {number} index - The index of the list item to check.
     * @returns {boolean} True if the list item is disabled, false otherwise.
     */
    isDisabledItemByIndex(index) {
        if (this.fields.disabled && this.liCollections) {
            return this.isDisabledElement(this.liCollections[index]);
        }
        return false;
    }
    /**
     * Disables the given list item.
     *
     * @param { HTMLLIElement } li - The list item to disable.
     * @returns {void}
     */
    disableListItem(li) {
        li.classList.add('e-disabled');
        li.setAttribute('aria-disabled', 'true');
        li.setAttribute('aria-selected', 'false');
    }
    validationAttribute(target, hidden) {
        const name = target.getAttribute('name') ? target.getAttribute('name') : target.getAttribute('id');
        hidden.setAttribute('name', name);
        target.removeAttribute('name');
        const attributes = ['required', 'aria-required', 'form'];
        for (let i = 0; i < attributes.length; i++) {
            if (!target.getAttribute(attributes[i])) {
                continue;
            }
            const attr = target.getAttribute(attributes[i]);
            hidden.setAttribute(attributes[i], attr);
            target.removeAttribute(attributes[i]);
        }
    }
    setZIndex() {
        // this is for component wise
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateActionCompleteData(li, item, index) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateAddItemList(list, itemCount) {
        // this is for multiselect add item
    }
    updateDataList() {
        // this is for multiselect update list items
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Gets the data Object that matches the given value.
     *
     * @param { string | number } value - Specifies the value of the list item.
     * @returns {Object}
     */
    getDataByValue(value) {
        if (!isNullOrUndefined(this.listData)) {
            const type = this.typeOfData(this.listData).typeof;
            if (type === 'string' || type === 'number' || type === 'boolean') {
                for (const item of this.listData) {
                    if (!isNullOrUndefined(item) && item === value) {
                        return item;
                    }
                }
            }
            else {
                for (const item of this.listData) {
                    if (!isNullOrUndefined(item) && getValue((this.fields.value ? this.fields.value : 'value'), item) === value) {
                        return item;
                    }
                }
            }
        }
        return null;
    }
    /* eslint-enable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Removes the component from the DOM and detaches all its related event handlers. It also removes the attributes and classes.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        if (document) {
            EventHandler.remove(document, 'scroll', this.updateGroupFixedHeader);
            if (document.body.contains(this.list)) {
                EventHandler.remove(this.list, 'scroll', this.setFloatingHeader);
                if (!isNullOrUndefined(this.rippleFun)) {
                    this.rippleFun();
                }
                detach(this.list);
            }
        }
        this.liCollections = null;
        this.ulElement = null;
        this.list = null;
        this.enableRtlElements = null;
        this.groupHeaderItems = null;
        this.fiteredGroupHeaderItems = null;
        this.rippleFun = null;
        super.destroy();
    }
};
__decorate([
    Complex({ text: null, value: null, iconCss: null, groupBy: null, disabled: null }, FieldSettings)
], DropDownBase.prototype, "fields", void 0);
__decorate([
    Property(null)
], DropDownBase.prototype, "itemTemplate", void 0);
__decorate([
    Property(null)
], DropDownBase.prototype, "groupTemplate", void 0);
__decorate([
    Property('No records found')
], DropDownBase.prototype, "noRecordsTemplate", void 0);
__decorate([
    Property('Request failed')
], DropDownBase.prototype, "actionFailureTemplate", void 0);
__decorate([
    Property('None')
], DropDownBase.prototype, "sortOrder", void 0);
__decorate([
    Property([])
], DropDownBase.prototype, "dataSource", void 0);
__decorate([
    Property(null)
], DropDownBase.prototype, "query", void 0);
__decorate([
    Property('StartsWith')
], DropDownBase.prototype, "filterType", void 0);
__decorate([
    Property(true)
], DropDownBase.prototype, "ignoreCase", void 0);
__decorate([
    Property(1000)
], DropDownBase.prototype, "zIndex", void 0);
__decorate([
    Property(false)
], DropDownBase.prototype, "ignoreAccent", void 0);
__decorate([
    Property()
], DropDownBase.prototype, "locale", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "actionBegin", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "actionComplete", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "actionFailure", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "select", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "dataBound", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "created", void 0);
__decorate([
    Event()
], DropDownBase.prototype, "destroyed", void 0);
DropDownBase = __decorate([
    NotifyPropertyChanges
], DropDownBase);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// don't use space in classnames
const dropDownListClasses = {
    root: 'e-dropdownlist',
    hover: dropDownBaseClasses.hover,
    selected: dropDownBaseClasses.selected,
    rtl: dropDownBaseClasses.rtl,
    li: dropDownBaseClasses.li,
    disable: dropDownBaseClasses.disabled,
    base: dropDownBaseClasses.root,
    focus: dropDownBaseClasses.focus,
    content: dropDownBaseClasses.content,
    input: 'e-input-group',
    inputFocus: 'e-input-focus',
    icon: 'e-input-group-icon e-ddl-icon',
    iconAnimation: 'e-icon-anim',
    value: 'e-input-value',
    device: 'e-ddl-device',
    backIcon: 'e-input-group-icon e-back-icon e-icons',
    filterBarClearIcon: 'e-input-group-icon e-clear-icon e-icons',
    filterInput: 'e-input-filter',
    resizeIcon: 'e-resizer-right e-icons',
    filterParent: 'e-filter-parent',
    mobileFilter: 'e-ddl-device-filter',
    footer: 'e-ddl-footer',
    header: 'e-ddl-header',
    clearIcon: 'e-clear-icon',
    clearIconHide: 'e-clear-icon-hide',
    popupFullScreen: 'e-popup-full-page',
    disableIcon: 'e-ddl-disable-icon',
    hiddenElement: 'e-ddl-hidden',
    virtualList: 'e-list-item e-virtual-list'
};
const inputObject = {
    container: null,
    buttons: []
};
/**
 * The DropDownList component contains a list of predefined values from which you can
 * choose a single value.
 * ```html
 * <input type="text" tabindex="1" id="list"> </input>
 * ```
 * ```typescript
 *   let dropDownListObj:DropDownList = new DropDownList();
 *   dropDownListObj.appendTo("#list");
 * ```
 */
let DropDownList = class DropDownList extends DropDownBase {
    /**
     * * Constructor for creating the DropDownList component.
     *
     * @param {DropDownListModel} options - Specifies the DropDownList model.
     * @param {string | HTMLElement} element - Specifies the element to render as component.
     * @private
     */
    constructor(options, element) {
        super(options, element);
        this.isListSearched = false;
        this.preventChange = false;
        this.isTouched = false;
        this.isFocused = false;
        this.autoFill = false;
        this.isUpdateHeaderHeight = false;
        this.isUpdateFooterHeight = false;
        this.isReactTemplateUpdate = false;
    }
    /**
     * Initialize the event handler.
     *
     * @private
     * @returns {void}
     */
    preRender() {
        this.valueTempElement = null;
        this.element.style.opacity = '0';
        this.initializeData();
        super.preRender();
        this.activeIndex = this.index;
        this.queryString = '';
    }
    initializeData() {
        this.isPopupOpen = false;
        this.isDocumentClick = false;
        this.isPopupRender = false;
        this.isInteracted = false;
        this.isFilterFocus = false;
        this.beforePopupOpen = false;
        this.initial = true;
        this.initialRemoteRender = false;
        this.isNotSearchList = false;
        this.isTyped = false;
        this.isSelected = false;
        this.preventFocus = false;
        this.preventAutoFill = false;
        this.isValidKey = false;
        this.typedString = '';
        this.isEscapeKey = false;
        this.isPreventBlur = false;
        this.isTabKey = false;
        this.actionCompleteData = { isUpdated: false };
        this.actionData = { isUpdated: false };
        this.prevSelectPoints = {};
        this.isSelectCustom = false;
        this.isDropDownClick = false;
        this.preventAltUp = false;
        this.isCustomFilter = false;
        this.isSecondClick = false;
        this.previousValue = null;
        this.keyConfigure = {
            tab: 'tab',
            enter: '13',
            escape: '27',
            end: '35',
            home: '36',
            down: '40',
            up: '38',
            pageUp: '33',
            pageDown: '34',
            open: 'alt+40',
            close: 'shift+tab',
            hide: 'alt+38',
            space: '32'
        };
        this.viewPortInfo = {
            currentPageNumber: null,
            direction: null,
            sentinelInfo: {},
            offsets: {},
            startIndex: 0,
            endIndex: this.itemCount
        };
    }
    setZIndex() {
        if (this.popupObj) {
            this.popupObj.setProperties({ 'zIndex': this.zIndex });
        }
    }
    requiredModules() {
        const modules = [];
        if (this.enableVirtualization) {
            modules.push({ args: [this], member: 'VirtualScroll' });
        }
        return modules;
    }
    renderList(e, isEmptyData) {
        super.render(e, isEmptyData);
        if (!(this.dataSource instanceof DataManager)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.totalItemCount = this.dataSource && this.dataSource.length ? this.dataSource.length : 0;
        }
        if (this.enableVirtualization && this.isFiltering() && this.getModuleName() === 'combobox') {
            this.UpdateSkeleton();
            this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
            this.ulElement = this.list.querySelector('ul');
        }
        this.unWireListEvents();
        this.wireListEvents();
    }
    floatLabelChange() {
        if (this.getModuleName() === 'dropdownlist' && this.floatLabelType === 'Auto') {
            const floatElement = this.inputWrapper.container.querySelector('.e-float-text');
            if (this.inputElement.value !== '' || this.isInteracted) {
                classList(floatElement, ['e-label-top'], ['e-label-bottom']);
            }
            else {
                classList(floatElement, ['e-label-bottom'], ['e-label-top']);
            }
        }
    }
    resetHandler(e) {
        e.preventDefault();
        this.clearAll(e);
        if (this.enableVirtualization) {
            this.list.scrollTop = 0;
            this.virtualListInfo = null;
            this.previousStartIndex = 0;
            this.previousEndIndex = 0;
        }
    }
    resetFocusElement() {
        this.removeHover();
        this.removeSelection();
        this.removeFocus();
        this.list.scrollTop = 0;
        if (this.getModuleName() !== 'autocomplete' && !isNullOrUndefined(this.ulElement)) {
            let li = this.fields.disabled ? this.ulElement.querySelector('.' + dropDownListClasses.li + ':not(.e-disabled)') : this.ulElement.querySelector('.' + dropDownListClasses.li);
            if (this.enableVirtualization) {
                li = this.liCollections[this.skeletonCount];
            }
            if (li) {
                li.classList.add(dropDownListClasses.focus);
            }
        }
    }
    clearAll(e, properties) {
        this.previousItemData = (!isNullOrUndefined(this.itemData)) ? this.itemData : null;
        if (isNullOrUndefined(properties) || (!isNullOrUndefined(properties) &&
            (isNullOrUndefined(properties.dataSource) ||
                (!(properties.dataSource instanceof DataManager) && properties.dataSource.length === 0)))) {
            this.isActive = true;
            this.resetSelection(properties);
        }
        const dataItem = this.getItemData();
        if ((!this.allowObjectBinding && (this.previousValue === dataItem.value)) ||
            (this.allowObjectBinding && this.previousValue &&
                this.isObjectInArray(this.previousValue, [this.allowCustom ? this.value ? this.value : dataItem :
                        dataItem.value ? this.getDataByValue(dataItem.value) : dataItem]))) {
            this.checkAndResetCache();
            if (this.enableVirtualization && this.list) {
                this.updateInitialData();
            }
            return;
        }
        this.onChangeEvent(e);
        this.checkAndResetCache();
        if (this.enableVirtualization) {
            this.updateInitialData();
        }
    }
    resetSelection(properties) {
        if (this.list) {
            if ((!isNullOrUndefined(properties) &&
                (isNullOrUndefined(properties.dataSource) ||
                    (!(properties.dataSource instanceof DataManager) && properties.dataSource.length === 0)))) {
                this.selectedLI = null;
                this.actionCompleteData.isUpdated = false;
                this.actionCompleteData.ulElement = null;
                this.actionCompleteData.list = null;
                this.resetList(properties.dataSource);
            }
            else {
                if (this.allowFiltering && this.getModuleName() !== 'autocomplete'
                    && !isNullOrUndefined(this.actionCompleteData.ulElement) && !isNullOrUndefined(this.actionCompleteData.list) &&
                    this.actionCompleteData.list.length > 0) {
                    this.onActionComplete(this.actionCompleteData.ulElement.cloneNode(true), this.actionCompleteData.list);
                }
                this.resetFocusElement();
            }
        }
        if (!isNullOrUndefined(this.hiddenElement)) {
            this.hiddenElement.innerHTML = '';
        }
        if (!isNullOrUndefined(this.inputElement)) {
            this.inputElement.value = '';
        }
        this.value = null;
        this.itemData = null;
        this.text = null;
        this.index = null;
        this.activeIndex = null;
        this.item = null;
        this.queryString = '';
        if (this.valueTempElement) {
            detach(this.valueTempElement);
            this.inputElement.style.display = 'block';
            this.valueTempElement = null;
        }
        this.setSelection(null, null);
        this.isSelectCustom = false;
        this.updateIconState();
        this.cloneElements();
    }
    setHTMLAttributes() {
        if (Object.keys(this.htmlAttributes).length) {
            for (const htmlAttr of Object.keys(this.htmlAttributes)) {
                if (htmlAttr === 'class') {
                    const updatedClassValue = (this.htmlAttributes[`${htmlAttr}`].replace(/\s+/g, ' ')).trim();
                    if (updatedClassValue !== '') {
                        addClass([this.inputWrapper.container], updatedClassValue.split(' '));
                    }
                }
                else if (htmlAttr === 'disabled' && this.htmlAttributes[`${htmlAttr}`] === 'disabled') {
                    this.enabled = false;
                    this.setEnable();
                }
                else if (htmlAttr === 'readonly' && !isNullOrUndefined(this.htmlAttributes[`${htmlAttr}`])) {
                    this.readonly = true;
                    this.dataBind();
                }
                else if (htmlAttr === 'style') {
                    this.inputWrapper.container.setAttribute('style', this.htmlAttributes[`${htmlAttr}`]);
                }
                else if (htmlAttr === 'aria-label') {
                    if ((this.getModuleName() === 'autocomplete' || this.getModuleName() === 'combobox') && !this.readonly) {
                        this.inputElement.setAttribute('aria-label', this.htmlAttributes[`${htmlAttr}`]);
                    }
                    else if (this.getModuleName() === 'dropdownlist') {
                        this.inputWrapper.container.setAttribute('aria-label', this.htmlAttributes[`${htmlAttr}`]);
                    }
                }
                else {
                    const defaultAttr = ['title', 'id', 'placeholder',
                        'role', 'autocomplete', 'autocapitalize', 'spellcheck', 'minlength', 'maxlength'];
                    const validateAttr = ['name', 'required'];
                    if (this.getModuleName() === 'autocomplete' || this.getModuleName() === 'combobox') {
                        defaultAttr.push('tabindex');
                    }
                    if (validateAttr.indexOf(htmlAttr) > -1 || htmlAttr.indexOf('data') === 0) {
                        this.hiddenElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    }
                    else if (defaultAttr.indexOf(htmlAttr) > -1) {
                        if (htmlAttr === 'placeholder' && this.element.getAttribute('placeholder') !== this.htmlAttributes[`${htmlAttr}`]) {
                            Input.setPlaceholder(this.htmlAttributes[`${htmlAttr}`], this.inputElement);
                        }
                        else if (htmlAttr !== 'placeholder') {
                            this.inputElement.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                        }
                    }
                    else {
                        this.inputWrapper.container.setAttribute(htmlAttr, this.htmlAttributes[`${htmlAttr}`]);
                    }
                }
            }
        }
        if (this.getModuleName() === 'autocomplete' || this.getModuleName() === 'combobox') {
            this.inputWrapper.container.removeAttribute('tabindex');
        }
    }
    getAriaAttributes() {
        return {
            'aria-disabled': 'false',
            'role': 'combobox',
            'aria-expanded': 'false',
            'aria-live': 'polite',
            'aria-labelledby': this.hiddenElement.id
        };
    }
    setEnableRtl() {
        if (!isNullOrUndefined(this.inputElement) && !isNullOrUndefined(this.inputElement.parentElement)) {
            Input.setEnableRtl(this.enableRtl, [this.inputElement.parentElement]);
        }
        if (this.popupObj) {
            this.popupObj.enableRtl = this.enableRtl;
            this.popupObj.dataBind();
        }
    }
    setEnable() {
        Input.setEnabled(this.enabled, this.inputElement);
        if (this.enabled) {
            removeClass([this.inputWrapper.container], dropDownListClasses.disable);
            this.inputElement.setAttribute('aria-disabled', 'false');
            this.targetElement().setAttribute('tabindex', this.tabIndex);
            if (this.inputWrapper && this.inputWrapper.container) {
                this.inputWrapper.container.setAttribute('aria-disabled', 'false');
                this.inputWrapper.container.removeAttribute('disabled');
            }
        }
        else {
            this.hidePopup();
            addClass([this.inputWrapper.container], dropDownListClasses.disable);
            this.inputElement.setAttribute('aria-disabled', 'true');
            this.targetElement().tabIndex = -1;
            if (this.inputWrapper && this.inputWrapper.container) {
                this.inputWrapper.container.setAttribute('aria-disabled', 'true');
                this.inputWrapper.container.setAttribute('disabled', '');
            }
        }
    }
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} Returns the persisted data of the component.
     */
    getPersistData() {
        return this.addOnPersist(['value']);
    }
    getLocaleName() {
        return 'drop-down-list';
    }
    preventTabIndex(element) {
        if (this.getModuleName() === 'dropdownlist') {
            element.tabIndex = -1;
        }
    }
    targetElement() {
        return !isNullOrUndefined(this.inputWrapper) ? this.inputWrapper.container : null;
    }
    getNgDirective() {
        return 'EJS-DROPDOWNLIST';
    }
    getElementByText(text) {
        return this.getElementByValue(this.getValueByText(text));
    }
    getElementByValue(value) {
        let item;
        const listItems = this.getItems();
        for (const liItem of listItems) {
            if (this.getFormattedValue(liItem.getAttribute('data-value')) === value) {
                item = liItem;
                break;
            }
        }
        return item;
    }
    initValue() {
        this.viewPortInfo.startIndex = this.virtualItemStartIndex = 0;
        this.viewPortInfo.endIndex = this.virtualItemEndIndex = this.itemCount;
        this.renderList();
        if (this.dataSource instanceof DataManager) {
            this.initialRemoteRender = true;
        }
        else {
            this.updateValues();
        }
    }
    /**
     * Checks if the given value is disabled.
     *
     * @param { string | number | boolean | object } value - The value to check for disablement. Can be a string, number, boolean, or object.
     * @returns { boolean } A boolean indicating whether the value is disabled.
     */
    isDisableItemValue(value) {
        if (typeof (value) === 'object') {
            const objectValue = JSON.parse(JSON.stringify(value))[this.fields.value];
            return this.isDisabledItemByIndex(this.getIndexByValue(objectValue));
        }
        return this.isDisabledItemByIndex(this.getIndexByValue(value));
    }
    updateValues() {
        if (this.fields.disabled) {
            if (this.value != null) {
                this.value = !this.isDisableItemValue(this.value) ? this.value : null;
            }
            if (this.text != null) {
                this.text = !this.isDisabledItemByIndex(this.getIndexByValue(this.getValueByText(this.text))) ? this.text : null;
            }
            if (this.index != null) {
                this.index = !this.isDisabledItemByIndex(this.index) ? this.index : null;
                this.activeIndex = this.index;
            }
        }
        this.selectedValueInfo = this.viewPortInfo;
        if (!isNullOrUndefined(this.value)) {
            const value = this.allowObjectBinding && !isNullOrUndefined(this.value) ? getValue(((this.fields.value) ? this.fields.value : ''), this.value) : this.value;
            this.setSelection(this.getElementByValue(value), null);
        }
        else if (this.text && isNullOrUndefined(this.value)) {
            const element = this.getElementByText(this.text);
            if (isNullOrUndefined(element)) {
                this.setProperties({ text: null });
                return;
            }
            else {
                this.setSelection(element, null);
            }
        }
        else {
            this.setSelection(this.liCollections[this.activeIndex], null);
        }
        this.setHiddenValue();
        Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
    }
    onBlurHandler(e) {
        if (!this.enabled) {
            return;
        }
        const target = e.relatedTarget;
        const currentTarget = e.target;
        const isPreventBlur = this.isPreventBlur;
        this.isPreventBlur = false;
        //IE 11 - issue
        if (isPreventBlur && !this.isDocumentClick && this.isPopupOpen && (!isNullOrUndefined(currentTarget) ||
            !this.isFilterLayout() && isNullOrUndefined(target))) {
            if (this.getModuleName() === 'dropdownlist' && this.allowFiltering && this.isPopupOpen) {
                this.filterInput.focus();
            }
            else {
                this.targetElement().focus();
            }
            return;
        }
        if (this.isDocumentClick || (!isNullOrUndefined(this.popupObj)
            && document.body.contains(this.popupObj.element) &&
            this.popupObj.element.classList.contains(dropDownListClasses.mobileFilter))) {
            if (!this.beforePopupOpen) {
                this.isDocumentClick = false;
            }
            return;
        }
        if (((this.getModuleName() === 'dropdownlist' && !this.isFilterFocus && target !== this.inputElement)
            && (document.activeElement !== target || (document.activeElement === target &&
                currentTarget.classList.contains(dropDownListClasses.inputFocus)))) ||
            (isNullOrUndefined(target) && this.getModuleName() === 'dropdownlist' && this.allowFiltering &&
                currentTarget !== this.inputWrapper.container) || this.getModuleName() !== 'dropdownlist' &&
            !this.inputWrapper.container.contains(target) || this.isTabKey) {
            this.isDocumentClick = this.isPopupOpen ? true : false;
            this.focusOutAction(e);
            this.isTabKey = false;
        }
        if (this.isRequested && !this.isPopupOpen && !this.isPreventBlur) {
            this.isActive = false;
            this.beforePopupOpen = false;
        }
        this.isFocused = false;
    }
    focusOutAction(e) {
        this.isInteracted = false;
        this.focusOut(e);
        this.onFocusOut(e);
    }
    onFocusOut(e) {
        if (!this.enabled) {
            return;
        }
        if (this.isSelected) {
            this.isSelectCustom = false;
            this.onChangeEvent(e);
        }
        this.floatLabelChange();
        this.dispatchEvent(this.hiddenElement, 'change');
        if (this.getModuleName() === 'dropdownlist' && this.element.tagName !== 'INPUT') {
            this.dispatchEvent(this.inputElement, 'blur');
        }
        if (this.inputWrapper.clearButton) {
            addClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
        }
        this.trigger('blur');
    }
    onFocus(e) {
        if (!this.isInteracted) {
            this.isInteracted = true;
            const args = { isInteracted: e ? true : false, event: e };
            this.trigger('focus', args);
        }
        this.updateIconState();
        this.isFocused = true;
    }
    resizingWireEvent() {
        // Mouse events
        EventHandler.add(document, 'mousemove', this.resizePopup, this);
        EventHandler.add(document, 'mouseup', this.stopResizing, this);
        // Touch events
        EventHandler.add(document, 'touchmove', this.resizePopup, this);
        EventHandler.add(document, 'touchend', this.stopResizing, this);
    }
    resizingUnWireEvent() {
        // Mouse events
        EventHandler.remove(document, 'mousemove', this.resizePopup);
        EventHandler.remove(document, 'mouseup', this.stopResizing);
        // Touch events
        EventHandler.remove(document, 'touchmove', this.resizePopup);
        EventHandler.remove(document, 'touchend', this.stopResizing);
    }
    resetValueHandler(e) {
        const formElement = closest(this.inputElement, 'form');
        if (formElement && e.target === formElement) {
            const val = (this.element.tagName === this.getNgDirective()) ? null : this.inputElement.getAttribute('value');
            this.text = val;
        }
    }
    wireEvent() {
        EventHandler.add(this.inputWrapper.container, 'mousedown', this.dropDownClick, this);
        EventHandler.add(this.inputWrapper.container, 'focus', this.focusIn, this);
        EventHandler.add(this.inputWrapper.container, 'keypress', this.onSearch, this);
        EventHandler.add(window, 'resize', this.windowResize, this);
        this.bindCommonEvent();
    }
    bindCommonEvent() {
        EventHandler.add(this.targetElement(), 'blur', this.onBlurHandler, this);
        const formElement = closest(this.inputElement, 'form');
        if (formElement) {
            EventHandler.add(formElement, 'reset', this.resetValueHandler, this);
        }
        if (!Browser.isDevice) {
            this.keyboardModule = new KeyboardEvents(this.targetElement(), {
                keyAction: this.keyActionHandler.bind(this), keyConfigs: this.keyConfigure, eventName: 'keydown'
            });
        }
        else {
            this.keyboardModule = new KeyboardEvents(this.targetElement(), {
                keyAction: this.mobileKeyActionHandler.bind(this), keyConfigs: this.keyConfigure, eventName: 'keydown'
            });
        }
        this.bindClearEvent();
    }
    windowResize() {
        if (this.isPopupOpen) {
            this.popupObj.refreshPosition(this.inputWrapper.container);
        }
    }
    bindClearEvent() {
        if (this.showClearButton) {
            EventHandler.add(this.inputWrapper.clearButton, 'mousedown', this.resetHandler, this);
        }
    }
    unBindCommonEvent() {
        if (!isNullOrUndefined(this.inputWrapper) && this.targetElement()) {
            EventHandler.remove(this.targetElement(), 'blur', this.onBlurHandler);
        }
        const formElement = this.inputElement && closest(this.inputElement, 'form');
        if (formElement) {
            EventHandler.remove(formElement, 'reset', this.resetValueHandler);
        }
        if (!Browser.isDevice) {
            this.keyboardModule.destroy();
        }
        if (this.showClearButton) {
            EventHandler.remove(this.inputWrapper.clearButton, 'mousedown', this.resetHandler);
        }
    }
    updateIconState() {
        if (this.showClearButton) {
            if (this.inputElement.value !== '' && !this.readonly) {
                removeClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
            }
            else {
                addClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
            }
        }
    }
    /**
     * Event binding for list
     *
     * @returns {void}
     */
    wireListEvents() {
        if (!isNullOrUndefined(this.list)) {
            EventHandler.add(this.list, 'click', this.onMouseClick, this);
            EventHandler.add(this.list, 'mouseover', this.onMouseOver, this);
            EventHandler.add(this.list, 'mouseout', this.onMouseLeave, this);
        }
    }
    onSearch(e) {
        if (e.charCode !== 32 && e.charCode !== 13) {
            if (this.list === undefined) {
                this.renderList();
            }
            this.searchKeyEvent = e;
            this.onServerIncrementalSearch(e);
        }
    }
    onServerIncrementalSearch(e) {
        if (!this.isRequested && !isNullOrUndefined(this.list) &&
            !isNullOrUndefined(this.list.querySelector('li')) && this.enabled && !this.readonly) {
            this.incrementalSearch(e);
        }
    }
    startResizing(event) {
        this.isResizing = true;
        this.trigger('resizeStart', event);
        // Get initial touch or mouse coordinates
        const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
        const clientY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
        // Store the initial dimensions of the popup
        if (this.list && this.list.parentElement) {
            this.originalWidth = this.list.parentElement.offsetWidth;
            this.originalHeight = this.list.parentElement.offsetHeight;
            this.originalMouseX = clientX;
            this.originalMouseY = clientY;
        }
        // Wire up events for resizing
        this.resizingWireEvent();
        if (event) {
            event.preventDefault(); // Prevent selection behavior if event exists
        }
    }
    resizePopup(event) {
        if (!this.isResizing) {
            return;
        }
        this.trigger('resizing', event);
        // Get the current touch or mouse position
        const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
        const clientY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
        // Calculate the new width and height based on drag
        const dx = clientX - this.originalMouseX;
        const dy = clientY - this.originalMouseY;
        if (this.list && this.list.parentElement) {
            // Minimum width and height (100px)
            let minWidth = parseInt(window.getComputedStyle(this.list.parentElement).minWidth, 10);
            let minHeight = parseInt(window.getComputedStyle(this.list.parentElement).minHeight, 10);
            minWidth = minWidth || 100;
            minHeight = minHeight || 120;
            // Ensure the new width and height are not less than the minimum
            this.resizeWidth = Math.max(this.originalWidth + dx, minWidth);
            this.resizeHeight = Math.max(this.originalHeight + dy, minHeight);
            this.list.parentElement.style.width = `${this.resizeWidth}px`;
            this.list.parentElement.style.height = `${this.resizeHeight}px`;
            this.list.parentElement.style.maxHeight = `${this.resizeHeight}px`;
            this.list.style.maxHeight = `${this.resizeHeight}px`;
            if (this.fixedHeaderElement && this.ulElement) {
                this.fixedHeaderElement.style.width = `${this.ulElement.offsetWidth}px`;
            }
        }
        if (event) {
            event.preventDefault(); // Prevent selection behavior if event exists
        }
    }
    stopResizing(event) {
        if (this.isResizing) {
            this.isResizing = false;
            this.trigger('resizeStop', event);
            // Unwire the resize event listeners
            this.resizingUnWireEvent();
        }
        if (event) {
            event.preventDefault(); // Prevent selection behavior if event exists
        }
    }
    onMouseClick(e) {
        const target = e.target;
        this.keyboardEvent = null;
        const li = closest(target, '.' + dropDownBaseClasses.li);
        if (!this.isValidLI(li) || this.isDisabledElement(li)) {
            return;
        }
        this.setSelection(li, e);
        if (Browser.isDevice && this.isFilterLayout()) {
            history.back();
        }
        else {
            const delay = 100;
            this.closePopup(delay, e);
        }
    }
    onMouseOver(e) {
        const currentLi = closest(e.target, '.' + dropDownBaseClasses.li);
        this.setHover(currentLi);
    }
    setHover(li) {
        if (this.enabled && this.isValidLI(li) && !li.classList.contains(dropDownBaseClasses.hover)) {
            this.removeHover();
            addClass([li], dropDownBaseClasses.hover);
        }
    }
    onMouseLeave() {
        this.removeHover();
    }
    removeHover() {
        if (this.list) {
            const hoveredItem = this.list.querySelectorAll('.' + dropDownBaseClasses.hover);
            if (hoveredItem && hoveredItem.length) {
                removeClass(hoveredItem, dropDownBaseClasses.hover);
            }
        }
    }
    isValidLI(li) {
        return (li && li.hasAttribute('role') && li.getAttribute('role') === 'option');
    }
    updateIncrementalItemIndex(startIndex, endIndex) {
        this.incrementalStartIndex = startIndex;
        this.incrementalEndIndex = endIndex;
    }
    incrementalSearch(e) {
        if (this.liCollections.length > 0) {
            if (this.enableVirtualization) {
                let updatingincrementalindex = false;
                let queryStringUpdated = false;
                const activeElement = this.ulElement.getElementsByClassName('e-active')[0];
                const currentValue = activeElement ? activeElement.textContent : null;
                if (this.incrementalQueryString === '') {
                    this.incrementalQueryString = String.fromCharCode(e.charCode);
                    this.incrementalPreQueryString = this.incrementalQueryString;
                }
                else if (String.fromCharCode(e.charCode).toLocaleLowerCase() === this.incrementalPreQueryString.toLocaleLowerCase()) {
                    queryStringUpdated = true;
                }
                else {
                    this.incrementalQueryString = String.fromCharCode(e.charCode);
                }
                if ((this.viewPortInfo.endIndex >= this.incrementalEndIndex && this.incrementalEndIndex <= this.totalItemCount) ||
                    this.incrementalEndIndex === 0) {
                    updatingincrementalindex = true;
                    this.incrementalStartIndex = this.incrementalEndIndex;
                    if (this.incrementalEndIndex === 0) {
                        this.incrementalEndIndex = 100 > this.totalItemCount ? this.totalItemCount : 100;
                    }
                    else {
                        this.incrementalEndIndex = this.incrementalEndIndex + 100 > this.totalItemCount ? this.totalItemCount :
                            this.incrementalEndIndex + 100;
                    }
                    this.updateIncrementalInfo(this.incrementalStartIndex, this.incrementalEndIndex);
                    updatingincrementalindex = true;
                }
                if (this.viewPortInfo.startIndex !== 0 || updatingincrementalindex) {
                    this.updateIncrementalView(0, this.itemCount);
                }
                let li = incrementalSearch(e.charCode, this.incrementalLiCollections, this.activeIndex, true, this.element.id, queryStringUpdated, currentValue, true);
                while (isNullOrUndefined(li) && this.incrementalEndIndex < this.totalItemCount) {
                    this.updateIncrementalItemIndex(this.incrementalEndIndex, this.incrementalEndIndex + 100 > this.totalItemCount ?
                        this.totalItemCount : this.incrementalEndIndex + 100);
                    this.updateIncrementalInfo(this.incrementalStartIndex, this.incrementalEndIndex);
                    updatingincrementalindex = true;
                    if (this.viewPortInfo.startIndex !== 0 || updatingincrementalindex) {
                        this.updateIncrementalView(0, this.itemCount);
                    }
                    li = incrementalSearch(e.charCode, this.incrementalLiCollections, 0, true, this.element.id, queryStringUpdated, currentValue, true, true);
                    if (!isNullOrUndefined(li)) {
                        break;
                    }
                    if (isNullOrUndefined(li) && this.incrementalEndIndex >= this.totalItemCount) {
                        this.updateIncrementalItemIndex(0, 100 > this.totalItemCount ? this.totalItemCount : 100);
                        break;
                    }
                }
                if (isNullOrUndefined(li) && this.incrementalEndIndex >= this.totalItemCount) {
                    this.updateIncrementalItemIndex(0, 100 > this.totalItemCount ? this.totalItemCount : 100);
                    this.updateIncrementalInfo(this.incrementalStartIndex, this.incrementalEndIndex);
                    updatingincrementalindex = true;
                    if (this.viewPortInfo.startIndex !== 0 || updatingincrementalindex) {
                        this.updateIncrementalView(0, this.itemCount);
                    }
                    li = incrementalSearch(e.charCode, this.incrementalLiCollections, 0, true, this.element.id, queryStringUpdated, currentValue, true, true);
                }
                let index = li && this.getIndexByValue(li.getAttribute('data-value'));
                if (!index) {
                    for (let i = 0; i < this.incrementalLiCollections.length; i++) {
                        if (!isNullOrUndefined(li) && !isNullOrUndefined(li.getAttribute('data-value')) &&
                            this.incrementalLiCollections[i].getAttribute('data-value') === li.getAttribute('data-value').toString()) {
                            index = i;
                            index = this.incrementalStartIndex + index;
                            break;
                        }
                    }
                }
                else {
                    index = index - this.skeletonCount;
                }
                if (index) {
                    if ((!(this.viewPortInfo.startIndex >= index)) || (!(index >= this.viewPortInfo.endIndex))) {
                        const startIndex = index - ((this.itemCount / 2) - 2) > 0 ? index - ((this.itemCount / 2) - 2) : 0;
                        const endIndex = this.viewPortInfo.startIndex + this.itemCount > this.totalItemCount ?
                            this.totalItemCount : this.viewPortInfo.startIndex + this.itemCount;
                        this.updateIncrementalView(startIndex, endIndex);
                    }
                }
                if (!isNullOrUndefined(li)) {
                    const index = this.getIndexByValue(li.getAttribute('data-value')) - this.skeletonCount;
                    if (index > this.itemCount / 2) {
                        const startIndex = this.viewPortInfo.startIndex + ((this.itemCount / 2) - 2) < this.totalItemCount ?
                            this.viewPortInfo.startIndex + ((this.itemCount / 2) - 2) : this.totalItemCount;
                        const endIndex = this.viewPortInfo.startIndex + this.itemCount > this.totalItemCount ?
                            this.totalItemCount : this.viewPortInfo.startIndex + this.itemCount;
                        this.updateIncrementalView(startIndex, endIndex);
                    }
                    li = this.getElementByValue(li.getAttribute('data-value'));
                    this.setSelection(li, e);
                    this.setScrollPosition();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.list.getElementsByClassName('e-virtual-ddl-content')[0].style = this.getTransformValues();
                    if (this.enableVirtualization && !this.fields.groupBy) {
                        const selectedLiOffsetTop = this.virtualListInfo && this.virtualListInfo.startIndex ?
                            this.selectedLI.offsetTop +
                                (this.virtualListInfo.startIndex * this.selectedLI.offsetHeight) : this.selectedLI.offsetTop;
                        this.list.scrollTop = selectedLiOffsetTop -
                            (this.list.querySelectorAll('.e-virtual-list').length * this.selectedLI.offsetHeight);
                    }
                    this.incrementalPreQueryString = this.incrementalQueryString;
                }
                else {
                    this.updateIncrementalView(0, this.itemCount);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.list.getElementsByClassName('e-virtual-ddl-content')[0].style = this.getTransformValues();
                    this.list.scrollTop = 0;
                }
            }
            else {
                let li;
                if (this.fields.disabled) {
                    const enableLiCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li + ':not(.e-disabled)');
                    li = incrementalSearch(e.charCode, enableLiCollections, this.activeIndex, true, this.element.id);
                }
                else {
                    li = incrementalSearch(e.charCode, this.liCollections, this.activeIndex, true, this.element.id);
                }
                if (!isNullOrUndefined(li)) {
                    this.setSelection(li, e);
                    this.setScrollPosition();
                }
            }
        }
    }
    /**
     * Hides the spinner loader.
     *
     * @returns {void}
     */
    hideSpinner() {
        if (!isNullOrUndefined(this.spinnerElement)) {
            hideSpinner(this.spinnerElement);
            removeClass([this.spinnerElement], dropDownListClasses.disableIcon);
            this.spinnerElement.innerHTML = '';
            this.spinnerElement = null;
        }
    }
    /**
     * Shows the spinner loader.
     *
     * @returns {void}
     */
    showSpinner() {
        if (isNullOrUndefined(this.spinnerElement)) {
            this.spinnerElement = Browser.isDevice && !isNullOrUndefined(this.filterInputObj) && this.filterInputObj.buttons[1] ||
                !isNullOrUndefined(this.filterInputObj) && this.filterInputObj.buttons[0] || this.inputWrapper.buttons[0];
            addClass([this.spinnerElement], dropDownListClasses.disableIcon);
            createSpinner({
                target: this.spinnerElement,
                width: Browser.isDevice ? '16px' : '14px'
            }, this.createElement);
            showSpinner(this.spinnerElement);
        }
    }
    keyActionHandler(e) {
        if (!this.enabled) {
            return;
        }
        this.keyboardEvent = e;
        if (this.isPreventKeyAction && this.enableVirtualization) {
            e.preventDefault();
        }
        const preventAction = e.action === 'pageUp' || e.action === 'pageDown';
        const preventHomeEnd = this.getModuleName() !== 'dropdownlist' && (e.action === 'home' || e.action === 'end');
        this.isEscapeKey = e.action === 'escape';
        this.isTabKey = !this.isPopupOpen && e.action === 'tab';
        const isNavigation = (e.action === 'down' || e.action === 'up' || e.action === 'pageUp' || e.action === 'pageDown'
            || e.action === 'home' || e.action === 'end');
        if ((this.isEditTextBox() || preventAction || preventHomeEnd) && !this.isPopupOpen) {
            return;
        }
        if (!this.readonly) {
            const isTabAction = e.action === 'tab' || e.action === 'close';
            if (isNullOrUndefined(this.list) && !this.isRequested && !isTabAction && e.action !== 'escape') {
                this.searchKeyEvent = e;
                if (!this.enableVirtualization || (this.enableVirtualization && this.getModuleName() !== 'autocomplete' && e.type !== 'mousedown' && (e.keyCode === 40 || e.keyCode === 38))) {
                    this.renderList(e);
                    this.UpdateSkeleton();
                    this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
                    this.ulElement = this.list.querySelector('ul');
                }
            }
            if (isNullOrUndefined(this.list) || (!isNullOrUndefined(this.liCollections) &&
                isNavigation && this.liCollections.length === 0) || this.isRequested) {
                return;
            }
            if ((isTabAction && this.getModuleName() !== 'autocomplete') && this.isPopupOpen
                || e.action === 'escape') {
                e.preventDefault();
            }
            this.isSelected = e.action === 'escape' ? false : this.isSelected;
            this.isTyped = (isNavigation || e.action === 'escape') ? false : this.isTyped;
            switch (e.action) {
                case 'down':
                case 'up':
                    this.updateUpDownAction(e);
                    break;
                case 'pageUp':
                    this.pageUpSelection(this.activeIndex - this.getPageCount(), e);
                    e.preventDefault();
                    break;
                case 'pageDown':
                    this.pageDownSelection(this.activeIndex + this.getPageCount(), e);
                    e.preventDefault();
                    break;
                case 'home':
                    this.isMouseScrollAction = true;
                    this.updateHomeEndAction(e);
                    break;
                case 'end':
                    this.isMouseScrollAction = true;
                    this.updateHomeEndAction(e);
                    break;
                case 'space':
                    if (this.getModuleName() === 'dropdownlist') {
                        if (!this.beforePopupOpen) {
                            this.showPopup();
                            e.preventDefault();
                        }
                    }
                    break;
                case 'open':
                    this.showPopup(e);
                    break;
                case 'hide':
                    this.preventAltUp = this.isPopupOpen;
                    this.hidePopup(e);
                    this.focusDropDown(e);
                    break;
                case 'enter':
                    this.selectCurrentItem(e);
                    break;
                case 'tab':
                    this.selectCurrentValueOnTab(e);
                    break;
                case 'escape':
                case 'close':
                    if (this.isPopupOpen) {
                        this.hidePopup(e);
                        this.focusDropDown(e);
                    }
                    break;
            }
        }
    }
    updateUpDownAction(e, isVirtualKeyAction) {
        if (this.fields.disabled && this.list && this.list.querySelectorAll('.e-list-item:not(.e-disabled)').length === 0) {
            return;
        }
        if (this.allowFiltering && !this.enableVirtualization && this.getModuleName() !== 'autocomplete') {
            let value = this.getItemData().value;
            if (isNullOrUndefined(value)) {
                value = 'null';
            }
            const filterIndex = this.getIndexByValue(value);
            if (!isNullOrUndefined(filterIndex)) {
                this.activeIndex = filterIndex;
            }
        }
        const focusEle = this.list.querySelector('.' + dropDownListClasses.focus);
        if (this.isSelectFocusItem(focusEle) && !isVirtualKeyAction) {
            this.setSelection(focusEle, e);
            if (this.enableVirtualization) {
                let selectedLiOffsetTop = this.virtualListInfo && this.virtualListInfo.startIndex ? this.selectedLI.offsetTop +
                    (this.virtualListInfo.startIndex * this.selectedLI.offsetHeight) : this.selectedLI.offsetTop;
                if (this.fields.groupBy) {
                    selectedLiOffsetTop = this.virtualListInfo && this.virtualListInfo.startIndex === 0 ?
                        this.selectedLI.offsetHeight - selectedLiOffsetTop : selectedLiOffsetTop - this.selectedLI.offsetHeight;
                }
                this.list.scrollTop = selectedLiOffsetTop -
                    (this.list.querySelectorAll('.e-virtual-list').length * this.selectedLI.offsetHeight);
            }
        }
        else if (!isNullOrUndefined(this.liCollections)) {
            const virtualIndex = this.activeIndex;
            let index = e.action === 'down' ? this.activeIndex + 1 : this.activeIndex - 1;
            index = isVirtualKeyAction ? virtualIndex : index;
            let startIndex = 0;
            if (this.getModuleName() === 'autocomplete') {
                startIndex = e.action === 'down' && isNullOrUndefined(this.activeIndex) ? 0 : this.liCollections.length - 1;
                index = index < 0 ? this.liCollections.length - 1 : index === this.liCollections.length ? 0 : index;
            }
            let nextItem;
            if (this.getModuleName() !== 'autocomplete' || this.getModuleName() === 'autocomplete' && this.isPopupOpen) {
                if (!this.enableVirtualization) {
                    nextItem = isNullOrUndefined(this.activeIndex) ? this.liCollections[startIndex]
                        : this.liCollections[index];
                }
                else {
                    if (!isVirtualKeyAction) {
                        nextItem = isNullOrUndefined(this.activeIndex) ? this.liCollections[this.skeletonCount]
                            : this.liCollections[index];
                        nextItem = !isNullOrUndefined(nextItem) && !nextItem.classList.contains('e-virtual-list') ? nextItem : null;
                    }
                    else {
                        if (this.getModuleName() === 'autocomplete') {
                            const value = this.getFormattedValue(this.selectedLI.getAttribute('data-value'));
                            nextItem = this.getElementByValue(value);
                        }
                        else {
                            nextItem = this.getElementByValue(this.getItemData().value);
                        }
                    }
                }
            }
            if (!isNullOrUndefined(nextItem)) {
                const focusAtFirstElement = this.liCollections[this.skeletonCount] &&
                    this.liCollections[this.skeletonCount].classList.contains('e-item-focus');
                this.setSelection(nextItem, e);
                if (focusAtFirstElement && this.enableVirtualization && this.getModuleName() === 'autocomplete' && !isVirtualKeyAction) {
                    let selectedLiOffsetTop = this.virtualListInfo && this.virtualListInfo.startIndex ?
                        this.selectedLI.offsetTop + (this.virtualListInfo.startIndex * this.selectedLI.offsetHeight) :
                        this.selectedLI.offsetTop;
                    selectedLiOffsetTop = this.virtualListInfo && this.virtualListInfo.startIndex === 0 && this.fields.groupBy ?
                        this.selectedLI.offsetHeight - selectedLiOffsetTop : selectedLiOffsetTop - this.selectedLI.offsetHeight;
                    this.list.scrollTop = selectedLiOffsetTop - (this.list.querySelectorAll('.e-virtual-list').length * this.selectedLI.offsetHeight);
                }
            }
            else if (this.enableVirtualization && !this.isPopupOpen && this.getModuleName() !== 'autocomplete' && ((this.viewPortInfo.endIndex !== this.totalItemCount && e.action === 'down') || (this.viewPortInfo.startIndex !== 0 && e.action === 'up'))) {
                if (e.action === 'down') {
                    this.viewPortInfo.startIndex = (this.viewPortInfo.startIndex + this.itemCount) <
                        (this.totalItemCount - this.itemCount) ? this.viewPortInfo.startIndex + this.itemCount :
                        this.totalItemCount - this.itemCount;
                    this.viewPortInfo.endIndex = this.viewPortInfo.startIndex + this.itemCount;
                    this.updateVirtualItemIndex();
                    this.isCustomFilter = this.getModuleName() === 'combobox' ? true : this.isCustomFilter;
                    this.resetList(this.dataSource, this.fields, this.query);
                    this.isCustomFilter = this.getModuleName() === 'combobox' ? false : this.isCustomFilter;
                    const value = this.liCollections[0].getAttribute('data-value') !== 'null' ?
                        this.getFormattedValue(this.liCollections[0].getAttribute('data-value')) : null;
                    const selectedData = this.getDataByValue(value);
                    if (selectedData) {
                        this.itemData = selectedData;
                    }
                }
                else if (e.action === 'up') {
                    this.viewPortInfo.startIndex = (this.viewPortInfo.startIndex - this.itemCount) > 0 ?
                        this.viewPortInfo.startIndex - this.itemCount : 0;
                    this.viewPortInfo.endIndex = this.viewPortInfo.startIndex + this.itemCount;
                    this.updateVirtualItemIndex();
                    this.isCustomFilter = this.getModuleName() === 'combobox' ? true : this.isCustomFilter;
                    this.resetList(this.dataSource, this.fields, this.query);
                    this.isCustomFilter = this.getModuleName() === 'combobox' ? false : this.isCustomFilter;
                    const value = this.liCollections[this.liCollections.length - 1].getAttribute('data-value') !== 'null' ? this.getFormattedValue(this.liCollections[this.liCollections.length - 1].getAttribute('data-value')) : null;
                    const selectedData = this.getDataByValue(value);
                    if (selectedData) {
                        this.itemData = selectedData;
                    }
                }
                this.UpdateSkeleton();
                this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
                this.ulElement = this.list.querySelector('ul');
                this.handleVirtualKeyboardActions(e, this.pageCount);
            }
        }
        if (this.allowFiltering && !this.enableVirtualization && this.getModuleName() !== 'autocomplete') {
            const value = this.getItemData().value;
            const filterIndex = this.getIndexByValueFilter(value, this.actionCompleteData.ulElement);
            if (!isNullOrUndefined(filterIndex)) {
                this.activeIndex = filterIndex;
            }
        }
        if (this.allowFiltering && this.getModuleName() === 'dropdownlist' && this.filterInput) {
            if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
                attributes(this.filterInput, { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
            }
            else if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-active')[0])) {
                attributes(this.filterInput, { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-active')[0].id });
            }
        }
        let itemIndex;
        for (let index = 0; index < this.liCollections.length; index++) {
            if (this.liCollections[index].classList.contains(dropDownListClasses.focus)
                || this.liCollections[index].classList.contains(dropDownListClasses.selected)) {
                itemIndex = index;
                break;
            }
        }
        if (itemIndex != null && this.isDisabledElement(this.liCollections[itemIndex])) {
            if (this.getModuleName() !== 'autocomplete') {
                if (this.liCollections.length - 1 === itemIndex && e.action === 'down') {
                    e.action = 'up';
                }
                if (itemIndex === 0 && e.action === 'up') {
                    e.action = 'down';
                }
            }
            this.updateUpDownAction(e);
        }
        e.preventDefault();
    }
    updateHomeEndAction(e, isVirtualKeyAction) {
        if (this.getModuleName() === 'dropdownlist') {
            let findLi = 0;
            if (e.action === 'home') {
                findLi = 0;
                if (this.enableVirtualization && this.isPopupOpen) {
                    findLi = this.skeletonCount;
                }
                else if (this.enableVirtualization && !this.isPopupOpen && this.viewPortInfo.startIndex !== 0) {
                    this.viewPortInfo.startIndex = 0;
                    this.viewPortInfo.endIndex = this.itemCount;
                    this.updateVirtualItemIndex();
                    this.resetList(this.dataSource, this.fields, this.query);
                }
            }
            else {
                if (this.enableVirtualization && !this.isPopupOpen && this.viewPortInfo.endIndex !== this.totalItemCount) {
                    this.viewPortInfo.startIndex = this.totalItemCount - this.itemCount;
                    this.viewPortInfo.endIndex = this.totalItemCount;
                    this.updateVirtualItemIndex();
                    this.resetList(this.dataSource, this.fields, this.query);
                }
                findLi = this.getItems().length - 1;
            }
            e.preventDefault();
            if (this.activeIndex === findLi) {
                if (isVirtualKeyAction) {
                    this.setSelection(this.liCollections[findLi], e);
                }
                return;
            }
            if (!this.enableVirtualization && this.liCollections[findLi] && this.liCollections[findLi].classList.contains('e-disabled')) {
                return;
            }
            this.setSelection(this.liCollections[findLi], e);
        }
    }
    selectCurrentValueOnTab(e) {
        if (this.getModuleName() === 'autocomplete') {
            this.selectCurrentItem(e);
        }
        else {
            if (this.isPopupOpen) {
                this.hidePopup(e);
                this.focusDropDown(e);
            }
        }
    }
    mobileKeyActionHandler(e) {
        if (!this.enabled) {
            return;
        }
        if ((this.isEditTextBox()) && !this.isPopupOpen) {
            return;
        }
        if (!this.readonly) {
            if (this.list === undefined && !this.isRequested) {
                this.searchKeyEvent = e;
                this.renderList();
            }
            if (isNullOrUndefined(this.list) || (!isNullOrUndefined(this.liCollections) &&
                this.liCollections.length === 0) || this.isRequested) {
                return;
            }
            if (e.action === 'enter') {
                this.selectCurrentItem(e);
            }
        }
    }
    handleVirtualKeyboardActions(e, pageCount) {
        switch (e.action) {
            case 'down':
            case 'up':
                if (this.itemData != null || this.getModuleName() === 'autocomplete') {
                    this.updateUpDownAction(e, true);
                }
                break;
            case 'pageUp':
                this.activeIndex = this.getModuleName() === 'autocomplete' ?
                    this.getIndexByValue(this.selectedLI.getAttribute('data-value')) + this.getPageCount() - 1 :
                    this.getIndexByValue(this.previousValue);
                this.pageUpSelection(this.activeIndex - this.getPageCount(), e, true);
                e.preventDefault();
                break;
            case 'pageDown':
                this.activeIndex = this.getModuleName() === 'autocomplete' ?
                    this.getIndexByValue(this.selectedLI.getAttribute('data-value')) - this.getPageCount() :
                    this.getIndexByValue(this.previousValue);
                this.pageDownSelection(!isNullOrUndefined(this.activeIndex) ?
                    (this.activeIndex + this.getPageCount()) : (2 * this.getPageCount()), e, true);
                e.preventDefault();
                break;
            case 'home':
                this.isMouseScrollAction = true;
                this.updateHomeEndAction(e, true);
                break;
            case 'end':
                this.isMouseScrollAction = true;
                this.updateHomeEndAction(e, true);
                break;
        }
        this.keyboardEvent = null;
    }
    selectCurrentItem(e) {
        if (this.isPopupOpen) {
            const li = this.list.querySelector('.' + dropDownListClasses.focus);
            if (this.isDisabledElement(li)) {
                return;
            }
            if (li) {
                this.setSelection(li, e);
                this.isTyped = false;
            }
            if (this.isSelected) {
                this.isSelectCustom = false;
                this.onChangeEvent(e);
            }
            this.hidePopup(e);
            this.focusDropDown(e);
        }
        else {
            this.showPopup();
        }
    }
    isSelectFocusItem(element) {
        return !isNullOrUndefined(element);
    }
    pageUpSelection(steps, event, isVirtualKeyAction) {
        let previousItem = steps >= 0 ? this.liCollections[steps + 1] : this.liCollections[0];
        if (!this.enableVirtualization && previousItem && previousItem.classList.contains('e-disabled')) {
            let validIndex = steps >= 0 ? steps + 1 : 0;
            while (validIndex < this.liCollections.length) {
                previousItem = this.liCollections[validIndex];
                if (previousItem && !previousItem.classList.contains('e-disabled')) {
                    break;
                }
                validIndex--;
                if (validIndex < 0) {
                    return;
                }
            }
        }
        if ((this.enableVirtualization && this.activeIndex == null)) {
            previousItem = (this.liCollections.length >= steps && steps >= 0) ?
                this.liCollections[steps + this.skeletonCount + 1] : this.liCollections[0];
        }
        if (!isNullOrUndefined(previousItem) && previousItem.classList.contains('e-virtual-list')) {
            previousItem = this.liCollections[this.skeletonCount];
        }
        this.PageUpDownSelection(previousItem, event);
        if (this.allowFiltering && this.getModuleName() === 'dropdownlist') {
            if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
                attributes(this.filterInput, { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
            }
            else if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-active')[0])) {
                attributes(this.filterInput, { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-active')[0].id });
            }
        }
    }
    PageUpDownSelection(previousItem, event) {
        if (this.enableVirtualization) {
            if (!isNullOrUndefined(previousItem) && ((this.getModuleName() !== 'autocomplete' &&
                !previousItem.classList.contains('e-active')) || (this.getModuleName() === 'autocomplete' &&
                !previousItem.classList.contains('e-item-focus')))) {
                this.setSelection(previousItem, event);
            }
        }
        else {
            this.setSelection(previousItem, event);
        }
    }
    pageDownSelection(steps, event, isVirtualKeyAction) {
        const list = this.getItems();
        let previousItem = steps <= list.length ? this.liCollections[steps - 1] : this.liCollections[list.length - 1];
        if (!this.enableVirtualization && previousItem && previousItem.classList.contains('e-disabled')) {
            while (steps >= 0 && steps < this.liCollections.length) {
                previousItem = steps <= list.length ? this.liCollections[steps - 1] : this.liCollections[list.length - 1];
                if (previousItem && !previousItem.classList.contains('e-disabled')) {
                    break;
                }
                steps++;
            }
        }
        if (this.enableVirtualization && this.skeletonCount > 0) {
            steps = this.getModuleName() === 'dropdownlist' && this.allowFiltering ? steps + 1 : steps;
            previousItem = steps < list.length ? this.liCollections[steps] : this.liCollections[list.length - 1];
        }
        if ((this.enableVirtualization && this.activeIndex == null)) {
            previousItem = steps <= list.length ? this.liCollections[steps + this.skeletonCount - 1] : this.liCollections[list.length - 1];
        }
        this.PageUpDownSelection(previousItem, event);
        if (this.allowFiltering && this.getModuleName() === 'dropdownlist') {
            if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
                attributes(this.filterInput, { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
            }
            else if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-active')[0])) {
                attributes(this.filterInput, { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-active')[0].id });
            }
        }
    }
    unWireEvent() {
        if (!isNullOrUndefined(this.inputWrapper)) {
            EventHandler.remove(this.inputWrapper.container, 'mousedown', this.dropDownClick);
            EventHandler.remove(this.inputWrapper.container, 'keypress', this.onSearch);
            EventHandler.remove(this.inputWrapper.container, 'focus', this.focusIn);
            EventHandler.remove(window, 'resize', this.windowResize);
        }
        this.unBindCommonEvent();
    }
    /**
     * Event un binding for list items.
     *
     * @returns {void}
     */
    unWireListEvents() {
        if (this.list) {
            EventHandler.remove(this.list, 'click', this.onMouseClick);
            EventHandler.remove(this.list, 'mouseover', this.onMouseOver);
            EventHandler.remove(this.list, 'mouseout', this.onMouseLeave);
        }
    }
    checkSelector(id) {
        return '[id="' + id.replace(/(:|\.|\[|\]|,|=|@|\\|\/|#)/g, '\\$1') + '"]';
    }
    onDocumentClick(e) {
        const target = e.target;
        if (!(!isNullOrUndefined(this.popupObj) && closest(target, this.checkSelector(this.popupObj.element.id))) &&
            !isNullOrUndefined(this.inputWrapper) && !this.inputWrapper.container.contains(e.target)) {
            if (this.inputWrapper.container.classList.contains(dropDownListClasses.inputFocus) || this.isPopupOpen) {
                this.isDocumentClick = true;
                const isActive = this.isRequested;
                if (this.getModuleName() === 'combobox' && this.isTyped) {
                    this.isInteracted = false;
                }
                this.hidePopup(e);
                this.isInteracted = false;
                if (!isActive) {
                    this.onFocusOut(e);
                    this.inputWrapper.container.classList.remove(dropDownListClasses.inputFocus);
                }
            }
        }
        else if (target !== this.inputElement && !(this.allowFiltering && target === this.filterInput)
            && !(this.getModuleName() === 'combobox' &&
                !this.allowFiltering && Browser.isDevice && target === this.inputWrapper.buttons[0])) {
            this.isPreventBlur = (Browser.isIE || Browser.info.name === 'edge') && (document.activeElement === this.targetElement() ||
                document.activeElement === this.filterInput);
            e.preventDefault();
        }
    }
    activeStateChange() {
        if (this.isDocumentClick) {
            this.hidePopup();
            this.onFocusOut();
            this.inputWrapper.container.classList.remove(dropDownListClasses.inputFocus);
        }
    }
    focusDropDown(e) {
        if (!this.initial && this.isFilterLayout()) {
            this.focusIn(e);
        }
    }
    dropDownClick(e) {
        if (e.which === 3 || e.button === 2) {
            return;
        }
        this.keyboardEvent = null;
        if (this.targetElement().classList.contains(dropDownListClasses.disable) || this.inputWrapper.clearButton === e.target) {
            return;
        }
        const target = e.target;
        if (target !== this.inputElement && !(this.allowFiltering && target === this.filterInput) && this.getModuleName() !== 'combobox') {
            e.preventDefault();
        }
        if (!this.readonly) {
            if (this.isPopupOpen || (this.popupObj && document.body.contains(this.popupObj.element) &&
                this.beforePopupOpen && this.isPopupRender)) {
                this.hidePopup(e);
                if (this.isFilterLayout()) {
                    this.focusDropDown(e);
                }
            }
            else {
                this.focusIn(e);
                this.floatLabelChange();
                this.queryString = this.inputElement.value.trim() === '' ? null : this.inputElement.value;
                this.isDropDownClick = true;
                this.showPopup(e);
            }
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const proxy = this;
            // eslint-disable-next-line max-len
            const duration = ((this.dataSource instanceof DataManager) && this.groupTemplate) ? 700 :
                (this.element.tagName === this.getNgDirective() && this.itemTemplate) ? 500 : 100;
            if (!this.isSecondClick) {
                setTimeout(() => {
                    proxy.cloneElements();
                    proxy.isSecondClick = true;
                    proxy.isSecondClick = proxy.isReact && proxy.isFiltering() && proxy.dataSource instanceof DataManager && !proxy.list.querySelector('ul') ? false : true;
                }, duration);
            }
        }
        else {
            this.focusIn(e);
        }
    }
    cloneElements() {
        if (this.list) {
            let ulElement = this.list.querySelector('ul');
            if (ulElement) {
                ulElement = ulElement.cloneNode ? ulElement.cloneNode(true) : ulElement;
                this.actionCompleteData.ulElement = ulElement;
            }
        }
    }
    updateSelectedItem(li, e, preventSelect, isSelection) {
        this.removeSelection();
        li.classList.add(dropDownBaseClasses.selected);
        this.removeHover();
        const value = li.getAttribute('data-value') !== null ?
            this.getFormattedValue(li.getAttribute('data-value')) : null;
        const selectedData = this.getDataByValue(value);
        if (!this.initial && !preventSelect && !isNullOrUndefined(e)) {
            const items = this.detachChanges(selectedData);
            this.isSelected = true;
            const eventArgs = {
                e: e,
                item: li,
                itemData: items,
                isInteracted: e ? true : false,
                cancel: false
            };
            this.trigger('select', eventArgs, (eventArgs) => {
                if (eventArgs.cancel) {
                    li.classList.remove(dropDownBaseClasses.selected);
                }
                else {
                    this.selectEventCallback(li, e, preventSelect, selectedData, value);
                    if (isSelection) {
                        this.setSelectOptions(li, e);
                    }
                }
            });
        }
        else {
            this.selectEventCallback(li, e, preventSelect, selectedData, value);
            if (isSelection) {
                this.setSelectOptions(li, e);
            }
        }
    }
    selectEventCallback(li, e, preventSelect, selectedData, value) {
        this.previousItemData = (!isNullOrUndefined(this.itemData)) ? this.itemData : null;
        if (this.itemData !== selectedData) {
            this.previousValue = (!isNullOrUndefined(this.itemData)) ? typeof this.itemData == 'object' &&
                !this.allowObjectBinding ? this.checkFieldValue(this.itemData, this.fields.value.split('.')) : this.itemData : null;
        }
        this.item = li;
        this.itemData = selectedData;
        const focusedItem = this.list.querySelector('.' + dropDownBaseClasses.focus);
        if (focusedItem) {
            removeClass([focusedItem], dropDownBaseClasses.focus);
        }
        li.setAttribute('aria-selected', 'true');
        if (isNullOrUndefined(value)) {
            value = 'null';
        }
        if (this.allowFiltering && !this.enableVirtualization && this.getModuleName() !== 'autocomplete') {
            const filterIndex = this.getIndexByValueFilter(value, this.actionCompleteData.ulElement);
            if (!isNullOrUndefined(filterIndex)) {
                this.activeIndex = filterIndex;
            }
            else {
                this.activeIndex = this.getIndexByValue(value);
            }
        }
        else {
            if (this.enableVirtualization && this.activeIndex == null && this.dataSource instanceof DataManager) {
                this.UpdateSkeleton();
                this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
                this.ulElement = this.list.querySelector('ul');
            }
            this.activeIndex = this.getIndexByValue(value);
        }
    }
    activeItem(li) {
        if (this.isValidLI(li) && !li.classList.contains(dropDownBaseClasses.selected)) {
            this.removeSelection();
            li.classList.add(dropDownBaseClasses.selected);
            this.removeHover();
            li.setAttribute('aria-selected', 'true');
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setValue(e) {
        const dataItem = this.getItemData();
        this.isTouched = !isNullOrUndefined(e);
        if (dataItem.value === null) {
            Input.setValue(null, this.inputElement, this.floatLabelType, this.showClearButton);
        }
        else {
            Input.setValue(dataItem.text, this.inputElement, this.floatLabelType, this.showClearButton);
        }
        if (this.valueTemplate && this.itemData !== null) {
            this.setValueTemplate();
        }
        else if (!isNullOrUndefined(this.valueTempElement) && this.inputElement.previousSibling === this.valueTempElement) {
            detach(this.valueTempElement);
            this.inputElement.style.display = 'block';
        }
        if (!isNullOrUndefined(dataItem.value) && !this.enableVirtualization && this.allowFiltering) {
            this.activeIndex = this.getIndexByValueFilter(dataItem.value, this.actionCompleteData.ulElement);
            if (isNullOrUndefined(this.activeIndex)) {
                this.activeIndex = this.getIndexByValue(dataItem.value);
            }
        }
        const clearIcon = dropDownListClasses.clearIcon;
        const isFilterElement = this.isFiltering() && this.filterInput && (this.getModuleName() === 'combobox');
        const clearElement = isFilterElement && this.filterInput.parentElement.querySelector('.' + clearIcon);
        if (this.isFiltering() && clearElement) {
            clearElement.style.removeProperty('visibility');
        }
        if ((!this.allowObjectBinding && (this.previousValue === dataItem.value)) || (this.allowObjectBinding &&
            (this.previousValue != null && this.isObjectInArray(this.previousValue, [this.allowCustom &&
                    this.isObjectCustomValue ? this.value ? this.value : dataItem : dataItem.value ?
                    this.getDataByValue(dataItem.value) : dataItem])))) {
            this.isSelected = false;
            return true;
        }
        else {
            this.isSelected = !this.initial ? true : false;
            this.isSelectCustom = false;
            if (this.getModuleName() === 'dropdownlist') {
                this.updateIconState();
            }
            return false;
        }
    }
    setSelection(li, e) {
        if (this.isValidLI(li) && (!li.classList.contains(dropDownBaseClasses.selected) || (this.isPopupOpen && this.isSelected
            && li.classList.contains(dropDownBaseClasses.selected)))) {
            this.updateSelectedItem(li, e, false, true);
        }
        else {
            this.setSelectOptions(li, e);
            if (this.enableVirtualization && this.value) {
                const fields = !this.isPrimitiveData ? this.fields.value : '';
                const currentValue = this.allowObjectBinding && !isNullOrUndefined(this.value) ?
                    getValue((this.fields.value) ? this.fields.value : '', this.value) : this.value;
                if (this.dataSource instanceof DataManager) {
                    const getItem = new DataManager(this.virtualGroupDataSource).executeLocal(new Query().where(new Predicate(fields, 'equal', currentValue)));
                    if (getItem && getItem.length > 0) {
                        this.itemData = getItem[0];
                        const dataItem = this.getItemData();
                        const value = this.allowObjectBinding ?
                            this.getDataByValue(dataItem.value) : dataItem.value;
                        if ((this.value === dataItem.value && this.text !== dataItem.text) ||
                            (this.value !== dataItem.value && this.text === dataItem.text)) {
                            this.setProperties({ 'text': dataItem.text ? dataItem.text.toString() : dataItem.text, 'value': value });
                        }
                    }
                }
                else {
                    const getItem = new DataManager(this.dataSource).executeLocal(new Query().where(new Predicate(fields, 'equal', currentValue)));
                    if (getItem && getItem.length > 0) {
                        this.itemData = getItem[0];
                        const dataItem = this.getItemData();
                        const value = this.allowObjectBinding ?
                            this.getDataByValue(dataItem.value) : dataItem.value;
                        if ((this.value === dataItem.value && this.text !== dataItem.text) ||
                            (this.value !== dataItem.value && this.text === dataItem.text)) {
                            this.setProperties({ 'text': dataItem.text ? dataItem.text.toString() : dataItem.text, 'value': value });
                            if (isNullOrUndefined(li)) {
                                this.previousValue = this.value;
                            }
                        }
                    }
                }
            }
        }
    }
    setSelectOptions(li, e) {
        if (this.list) {
            this.removeHover();
        }
        this.previousSelectedLI = (!isNullOrUndefined(this.selectedLI)) ? this.selectedLI : null;
        this.selectedLI = li;
        if (this.setValue(e)) {
            return;
        }
        if ((!this.isPopupOpen && !isNullOrUndefined(li)) || (this.isPopupOpen && !isNullOrUndefined(e) &&
            (e.type !== 'keydown' || e.type === 'keydown' && e.action === 'enter'))) {
            this.isSelectCustom = false;
            this.onChangeEvent(e);
        }
        if (this.isPopupOpen && !isNullOrUndefined(this.selectedLI) && this.itemData !== null && (!e || e.type !== 'click')) {
            this.setScrollPosition(e);
        }
        if (Browser.info.name !== 'mozilla') {
            if (this.targetElement()) {
                attributes(this.targetElement(), { 'aria-describedby': this.inputElement.id !== '' ? this.inputElement.id : this.element.id });
                this.targetElement().removeAttribute('aria-live');
            }
        }
        if (this.isPopupOpen && !isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
            attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
        }
        else if (this.isPopupOpen && !isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-active')[0])) {
            attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-active')[0].id });
        }
    }
    dropdownCompiler(dropdownTemplate) {
        let checkTemplate = false;
        if (typeof dropdownTemplate !== 'function' && dropdownTemplate) {
            try {
                checkTemplate = (document.querySelectorAll(dropdownTemplate).length) ? true : false;
            }
            catch (exception) {
                checkTemplate = false;
            }
        }
        return checkTemplate;
    }
    setValueTemplate() {
        let compiledString;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.isReact) {
            this.clearTemplate(['valueTemplate']);
            if (this.valueTempElement) {
                detach(this.valueTempElement);
                this.inputElement.style.display = 'block';
                this.valueTempElement = null;
            }
        }
        if (!this.valueTempElement) {
            this.valueTempElement = this.createElement('span', { className: dropDownListClasses.value });
            this.inputElement.parentElement.insertBefore(this.valueTempElement, this.inputElement);
            this.inputElement.style.display = 'none';
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!this.isReact) {
            this.valueTempElement.innerHTML = '';
        }
        const valuecheck = this.dropdownCompiler(this.valueTemplate);
        if (typeof this.valueTemplate !== 'function' && valuecheck) {
            compiledString = compile(document.querySelector(this.valueTemplate).innerHTML.trim());
        }
        else {
            compiledString = compile(this.valueTemplate);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valueCompTemp = compiledString(this.itemData, this, 'valueTemplate', this.valueTemplateId, this.isStringTemplate, null, this.valueTempElement);
        if (valueCompTemp && valueCompTemp.length > 0) {
            append(valueCompTemp, this.valueTempElement);
        }
        this.renderReactTemplates();
    }
    removeSelection() {
        if (this.list) {
            const selectedItems = this.list.querySelectorAll('.' + dropDownBaseClasses.selected);
            if (selectedItems.length) {
                removeClass(selectedItems, dropDownBaseClasses.selected);
                selectedItems[0].removeAttribute('aria-selected');
            }
        }
    }
    getItemData() {
        const fields = this.fields;
        let dataItem = null;
        dataItem = this.itemData;
        let dataValue;
        let dataText;
        if (!isNullOrUndefined(dataItem)) {
            dataValue = getValue(fields.value, dataItem);
            dataText = getValue(fields.text, dataItem);
        }
        const value = (!isNullOrUndefined(dataItem) &&
            !isUndefined(dataValue) ? dataValue : dataItem);
        const text = (!isNullOrUndefined(dataItem) &&
            !isUndefined(dataValue) ? dataText : dataItem);
        return { value: value, text: text };
    }
    /**
     * To trigger the change event for list.
     *
     * @param {MouseEvent | KeyboardEvent | TouchEvent} eve - Specifies the event arguments.
     * @param {boolean} isCustomValue - Specifies whether the value is custom value or not.
     * @returns {void}
     */
    onChangeEvent(eve, isCustomValue) {
        const dataItem = this.getItemData();
        let index = this.isSelectCustom ? null : this.activeIndex;
        if (this.enableVirtualization) {
            const datas = this.dataSource instanceof DataManager ? this.virtualGroupDataSource : this.dataSource;
            if (dataItem.value && datas && datas.length > 0) {
                const foundIndex = datas.findIndex((data) => !isNullOrUndefined(dataItem.value) && getValue(this.fields.value, data) === dataItem.value);
                if (foundIndex !== -1) {
                    index = foundIndex;
                }
            }
        }
        const value = this.allowObjectBinding ? isCustomValue ?
            this.value : this.getDataByValue(dataItem.value) : dataItem.value;
        this.setProperties({ 'index': index, 'text': dataItem.text ? dataItem.text.toString() : dataItem.text, 'value': value }, true);
        this.detachChangeEvent(eve);
    }
    detachChanges(value) {
        let items;
        if (typeof value === 'string' ||
            typeof value === 'boolean' ||
            typeof value === 'number') {
            items = Object.defineProperties({}, {
                value: {
                    value: value,
                    enumerable: true
                },
                text: {
                    value: value,
                    enumerable: true
                }
            });
        }
        else {
            items = value;
        }
        return items;
    }
    detachChangeEvent(eve) {
        this.isSelected = false;
        this.previousValue = this.value;
        this.activeIndex = this.enableVirtualization ? this.getIndexByValue(this.value) : this.index;
        this.typedString = !isNullOrUndefined(this.text) ? this.text : '';
        if (!this.initial) {
            const items = this.detachChanges(this.itemData);
            let preItems;
            if (typeof this.previousItemData === 'string' ||
                typeof this.previousItemData === 'boolean' ||
                typeof this.previousItemData === 'number') {
                preItems = Object.defineProperties({}, {
                    value: {
                        value: this.previousItemData,
                        enumerable: true
                    },
                    text: {
                        value: this.previousItemData,
                        enumerable: true
                    }
                });
            }
            else {
                preItems = this.previousItemData;
            }
            this.setHiddenValue();
            const eventArgs = {
                e: eve,
                item: this.item,
                itemData: items,
                previousItem: this.previousSelectedLI,
                previousItemData: preItems,
                isInteracted: eve ? true : false,
                value: this.value,
                element: this.element,
                event: eve
            };
            if (this.isAngular && this.preventChange) {
                this.preventChange = false;
            }
            else {
                this.trigger('change', eventArgs);
            }
        }
        if ((isNullOrUndefined(this.value) || this.value === '') && this.floatLabelType !== 'Always') {
            removeClass([this.inputWrapper.container], 'e-valid-input');
        }
    }
    setHiddenValue() {
        if (!isNullOrUndefined(this.value)) {
            const value = this.allowObjectBinding && !isNullOrUndefined(this.value) ? getValue((this.fields.value) ? this.fields.value : '', this.value) : this.value;
            if (this.hiddenElement.querySelector('option')) {
                const selectedElement = this.hiddenElement.querySelector('option');
                selectedElement.textContent = this.text;
                selectedElement.setAttribute('value', value.toString());
            }
            else {
                if (!isNullOrUndefined(this.hiddenElement)) {
                    const option = document.createElement('option');
                    option.text = this.text;
                    option.setAttribute('selected', '');
                    this.hiddenElement.appendChild(option);
                    const selectedElement = this.hiddenElement.querySelector('option');
                    selectedElement.setAttribute('value', value.toString());
                }
            }
        }
        else {
            this.hiddenElement.innerHTML = '';
        }
    }
    /**
     * Filter bar implementation
     *
     * @param {KeyboardEventArgs} e - Specifies the event arguments.
     * @returns {void}
     */
    onFilterUp(e) {
        if (!(e.ctrlKey && e.keyCode === 86) && (this.isValidKey || e.keyCode === 40 || e.keyCode === 38)) {
            this.isValidKey = false;
            this.filterArgs = e;
            this.firstItem = this.dataSource && this.dataSource.length > 0 ? this.dataSource[0] : null;
            switch (e.keyCode) {
                case 38: //up arrow
                case 40: //down arrow
                    if (this.getModuleName() === 'autocomplete' && !this.isPopupOpen && !this.preventAltUp && !this.isRequested) {
                        this.preventAutoFill = true;
                        this.searchLists(e);
                    }
                    else {
                        this.preventAutoFill = false;
                    }
                    this.preventAltUp = false;
                    if (this.getModuleName() === 'autocomplete' && !isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
                        attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
                    }
                    e.preventDefault();
                    break;
                case 46: //delete
                case 8: //backspace
                    this.typedString = this.filterInput.value;
                    if (!this.isPopupOpen && this.typedString !== '' || this.isPopupOpen && this.queryString.length > 0) {
                        this.preventAutoFill = true;
                        this.searchLists(e);
                    }
                    else if (this.typedString === '' && this.queryString === '' && this.getModuleName() !== 'autocomplete') {
                        this.preventAutoFill = true;
                        this.searchLists(e);
                    }
                    else if (this.typedString === '') {
                        if (this.list) {
                            this.resetFocusElement();
                        }
                        this.activeIndex = null;
                        if (this.getModuleName() !== 'dropdownlist') {
                            this.preventAutoFill = true;
                            this.searchLists(e);
                            if (this.getModuleName() === 'autocomplete') {
                                this.hidePopup();
                            }
                        }
                    }
                    e.preventDefault();
                    break;
                default:
                    if (this.isFiltering() && this.getModuleName() === 'combobox' && isNullOrUndefined(this.list)) {
                        this.getInitialData = true;
                        this.renderList();
                        if (!this.isSecondClick && !this.isDropDownClick) {
                            this.executeCloneElements();
                        }
                    }
                    this.typedString = this.filterInput.value;
                    this.preventAutoFill = false;
                    if (!this.getInitialData) {
                        this.searchLists(e);
                    }
                    if ((this.enableVirtualization && this.getModuleName() !== 'autocomplete') || (this.getModuleName() === 'autocomplete' && !(this.dataSource instanceof DataManager)) || (this.getModuleName() === 'autocomplete' && (this.dataSource instanceof DataManager) && this.totalItemCount !== 0)) {
                        this.getFilteringSkeletonCount();
                    }
                    break;
            }
        }
        else {
            this.isValidKey = false;
        }
    }
    onFilterDown(e) {
        switch (e.keyCode) {
            case 13: //enter
                break;
            case 40: //down arrow
            case 38: //up arrow
                this.queryString = this.filterInput.value;
                e.preventDefault();
                break;
            case 9: //tab
                if (this.isPopupOpen && this.getModuleName() !== 'autocomplete') {
                    e.preventDefault();
                }
                break;
            default:
                this.prevSelectPoints = this.getSelectionPoints();
                this.queryString = this.filterInput.value;
                break;
        }
    }
    removeFillSelection() {
        if (this.isInteracted) {
            const selection = this.getSelectionPoints();
            this.inputElement.setSelectionRange(selection.end, selection.end);
        }
    }
    getQuery(query) {
        let filterQuery;
        if (!this.isCustomFilter && this.allowFiltering && this.filterInput) {
            filterQuery = query ? query.clone() : this.query ? this.query.clone() : new Query();
            const filterType = this.typedString === '' ? 'contains' : this.filterType;
            const dataType = this.typeOfData(this.dataSource).typeof;
            if (!(this.dataSource instanceof DataManager) && dataType === 'string' || dataType === 'number') {
                filterQuery.where('', filterType, this.typedString, this.ignoreCase, this.ignoreAccent);
            }
            else if (((this.getModuleName() !== 'combobox')) || (this.isFiltering() && this.getModuleName() === 'combobox' && this.typedString !== '')) {
                const fields = (this.fields.text) ? this.fields.text : '';
                filterQuery.where(fields, filterType, this.typedString, this.ignoreCase, this.ignoreAccent);
            }
        }
        else {
            filterQuery = (this.enableVirtualization && !isNullOrUndefined(this.customFilterQuery)) ?
                this.customFilterQuery.clone() : query ? query.clone() : this.query ? this.query.clone() : new Query();
        }
        if (this.enableVirtualization && this.viewPortInfo.endIndex !== 0) {
            const takeValue = this.getTakeValue();
            let alreadySkipAdded = false;
            if (filterQuery) {
                for (let queryElements = 0; queryElements < filterQuery.queries.length; queryElements++) {
                    if (filterQuery.queries[queryElements].fn === 'onSkip') {
                        alreadySkipAdded = true;
                        break;
                    }
                }
            }
            let queryTakeValue = 0;
            let querySkipValue = 0;
            if (filterQuery && filterQuery.queries.length > 0) {
                for (let queryElements = 0; queryElements < filterQuery.queries.length; queryElements++) {
                    if (filterQuery.queries[queryElements].fn === 'onSkip') {
                        querySkipValue = filterQuery.queries[queryElements].e.nos;
                    }
                    if (filterQuery.queries[queryElements].fn === 'onTake') {
                        queryTakeValue = takeValue <= filterQuery.queries[queryElements].e.nos ?
                            filterQuery.queries[queryElements].e.nos : takeValue;
                    }
                }
            }
            if (queryTakeValue <= 0 && this.query && this.query.queries.length > 0) {
                for (let queryElements = 0; queryElements < this.query.queries.length; queryElements++) {
                    if (this.query.queries[queryElements].fn === 'onTake') {
                        queryTakeValue = takeValue <= this.query.queries[queryElements].e.nos ?
                            this.query.queries[queryElements].e.nos : takeValue;
                    }
                }
            }
            if (filterQuery && filterQuery.queries.length > 0) {
                for (let queryElements = 0; queryElements < filterQuery.queries.length; queryElements++) {
                    if (filterQuery.queries[queryElements].fn === 'onSkip') {
                        querySkipValue = filterQuery.queries[queryElements].e.nos;
                        filterQuery.queries.splice(queryElements, 1);
                        alreadySkipAdded = false;
                        --queryElements;
                        continue;
                    }
                    if (filterQuery.queries[queryElements].fn === 'onTake') {
                        queryTakeValue = filterQuery.queries[queryElements].e.nos <= queryTakeValue ?
                            queryTakeValue : filterQuery.queries[queryElements].e.nos;
                        filterQuery.queries.splice(queryElements, 1);
                        --queryElements;
                    }
                }
            }
            if ( (this.allowFiltering || !this.isPopupOpen || !alreadySkipAdded)) {
                if (querySkipValue > 0) {
                    filterQuery.skip(querySkipValue);
                }
                else {
                    filterQuery.skip(this.virtualItemStartIndex);
                }
            }
            if (this.isIncrementalRequest) {
                filterQuery.take(this.incrementalEndIndex);
            }
            else {
                if (queryTakeValue > 0) {
                    filterQuery.take(queryTakeValue);
                }
                else {
                    filterQuery.take(takeValue);
                }
            }
            filterQuery.requiresCount();
        }
        return filterQuery;
    }
    getSelectionPoints() {
        const input = this.inputElement;
        return { start: Math.abs(input.selectionStart), end: Math.abs(input.selectionEnd) };
    }
    performFiltering(e) {
        this.checkAndResetCache();
        this.isRequesting = false;
        const eventArgs = {
            preventDefaultAction: false,
            text: this.filterInput.value,
            updateData: (dataSource, query, fields) => {
                if (eventArgs.cancel) {
                    return;
                }
                this.isCustomFilter = true;
                this.customFilterQuery = query ? query.clone() : query;
                this.filteringAction(dataSource, query, fields);
            },
            baseEventArgs: e,
            cancel: false
        };
        this.trigger('filtering', eventArgs, (eventArgs) => {
            if (!eventArgs.cancel && !this.isCustomFilter && !eventArgs.preventDefaultAction) {
                this.filteringAction(this.dataSource, null, this.fields);
            }
        });
    }
    searchLists(e) {
        this.isTyped = true;
        this.activeIndex = null;
        this.isListSearched = true;
        if (this.filterInput.parentElement.querySelector('.' + dropDownListClasses.clearIcon)) {
            const clearElement = this.filterInput.parentElement.querySelector('.' + dropDownListClasses.clearIcon);
            clearElement.style.visibility = this.filterInput.value === '' ? 'hidden' : 'visible';
        }
        this.isDataFetched = false;
        if (this.isFiltering()) {
            if (this.typedString !== '' && this.debounceDelay > 0) {
                this.debouncedFiltering(e, this.debounceDelay);
            }
            else {
                this.performFiltering(e);
            }
        }
    }
    /**
     * To filter the data from given data source by using query
     *
     * @param {Object[] | DataManager } dataSource - Set the data source to filter.
     * @param {Query} query - Specify the query to filter the data.
     * @param {FieldSettingsModel} fields - Specify the fields to map the column in the data table.
     * @returns {void}
     * @deprecated
     */
    filter(dataSource, query, fields) {
        this.isCustomFilter = true;
        this.filteringAction(dataSource, query, fields);
    }
    filteringAction(dataSource, query, fields) {
        if (!isNullOrUndefined(this.filterInput)) {
            this.beforePopupOpen = ((!this.isPopupOpen && this.getModuleName() === 'combobox' && this.filterInput.value === '') ||
                this.getInitialData) ? false : true;
            const isNoData = this.list.classList.contains(dropDownBaseClasses.noData);
            if (this.filterInput.value.trim() === '' && !this.itemTemplate) {
                this.actionCompleteData.isUpdated = false;
                this.isTyped = false;
                if (!isNullOrUndefined(this.actionCompleteData.ulElement) && !isNullOrUndefined(this.actionCompleteData.list)) {
                    if (this.enableVirtualization) {
                        if (this.isFiltering()) {
                            this.isPreventScrollAction = true;
                            this.list.scrollTop = 0;
                            this.previousStartIndex = 0;
                            this.virtualListInfo = null;
                        }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.totalItemCount = this.dataSource && this.dataSource.length ? this.dataSource.length : 0;
                        this.resetList(dataSource, fields, query);
                        if (isNoData && !this.list.classList.contains(dropDownBaseClasses.noData)) {
                            if (!this.list.querySelector('.e-virtual-ddl-content')) {
                                const virtualContentElement = this.createElement('div', {
                                    className: 'e-virtual-ddl-content'
                                });
                                virtualContentElement.style.cssText = this.getTransformValues();
                                this.list.appendChild(virtualContentElement).appendChild(this.list.querySelector('.e-list-parent'));
                            }
                            if (!this.list.querySelector('.e-virtual-ddl')) {
                                const virtualElement = this.createElement('div', {
                                    id: this.element.id + '_popup',
                                    className: 'e-virtual-ddl'
                                });
                                virtualElement.style.cssText = this.GetVirtualTrackHeight();
                                this.list.parentElement.querySelector('.e-dropdownbase').appendChild(virtualElement);
                            }
                        }
                    }
                    this.onActionComplete(this.actionCompleteData.ulElement, this.actionCompleteData.list);
                }
                this.isTyped = true;
                if (!isNullOrUndefined(this.itemData) && this.getModuleName() === 'dropdownlist') {
                    this.focusIndexItem();
                    this.setScrollPosition();
                }
                this.isNotSearchList = true;
            }
            else {
                this.isNotSearchList = false;
                query = (this.filterInput.value.trim() === '') ? null : query;
                if (this.enableVirtualization && this.isFiltering() && this.isTyped) {
                    this.isPreventScrollAction = true;
                    this.list.scrollTop = 0;
                    this.previousStartIndex = 0;
                    this.virtualListInfo = null;
                }
                this.resetList(dataSource, fields, query);
                if (this.getModuleName() === 'dropdownlist' && this.list.classList.contains(dropDownBaseClasses.noData)) {
                    this.popupContentElement.setAttribute('role', 'status');
                    this.popupContentElement.setAttribute('id', 'no-record');
                    attributes(this.filterInputObj.container, { 'aria-activedescendant': 'no-record' });
                }
                if (this.enableVirtualization && isNoData && !this.list.classList.contains(dropDownBaseClasses.noData)) {
                    if (!this.list.querySelector('.e-virtual-ddl-content')) {
                        const virtualContentElement = this.createElement('div', {
                            className: 'e-virtual-ddl-content'
                        });
                        virtualContentElement.style.cssText = this.getTransformValues();
                        this.list.appendChild(virtualContentElement).appendChild(this.list.querySelector('.e-list-parent'));
                    }
                    if (!this.list.querySelector('.e-virtual-ddl')) {
                        const virtualElement = this.createElement('div', {
                            id: this.element.id + '_popup',
                            className: 'e-virtual-ddl'
                        });
                        virtualElement.style.cssText = this.GetVirtualTrackHeight();
                        this.list.parentElement.querySelector('.e-dropdownbase').appendChild(virtualElement);
                    }
                }
            }
            if (this.enableVirtualization) {
                this.getFilteringSkeletonCount();
            }
            this.renderReactTemplates();
            if (this.filterInput && this.filterInput.value === '' && this.getModuleName() === 'combobox') {
                this.executeCloneElements();
            }
        }
    }
    setSearchBox(popupElement) {
        if (this.isFiltering()) {
            const parentElement = popupElement.querySelector('.' + dropDownListClasses.filterParent) ?
                popupElement.querySelector('.' + dropDownListClasses.filterParent) : this.createElement('span', {
                className: dropDownListClasses.filterParent
            });
            this.filterInput = this.createElement('input', {
                attrs: { type: 'text' },
                className: dropDownListClasses.filterInput
            });
            this.element.parentNode.insertBefore(this.filterInput, this.element);
            let backIcon = false;
            if (Browser.isDevice && this.isDeviceFullScreen) {
                backIcon = true;
            }
            this.filterInputObj = Input.createInput({
                element: this.filterInput,
                buttons: backIcon ?
                    [dropDownListClasses.backIcon, dropDownListClasses.filterBarClearIcon] : [dropDownListClasses.filterBarClearIcon],
                properties: { placeholder: this.filterBarPlaceholder }
            }, this.createElement);
            if (!isNullOrUndefined(this.cssClass)) {
                if (this.cssClass.split(' ').indexOf('e-outline') !== -1) {
                    addClass([this.filterInputObj.container], 'e-outline');
                }
                else if (this.cssClass.split(' ').indexOf('e-filled') !== -1) {
                    addClass([this.filterInputObj.container], 'e-filled');
                }
            }
            append([this.filterInputObj.container], parentElement);
            prepend([parentElement], popupElement);
            attributes(this.filterInput, {
                'aria-disabled': 'false',
                'role': 'combobox',
                'autocomplete': 'off',
                'autocapitalize': 'off',
                'spellcheck': 'false'
            });
            this.clearIconElement = this.filterInput.parentElement.querySelector('.' + dropDownListClasses.clearIcon);
            if (!Browser.isDevice && this.clearIconElement) {
                EventHandler.add(this.clearIconElement, 'click', this.clearText, this);
                this.clearIconElement.style.visibility = 'hidden';
            }
            if (!Browser.isDevice) {
                this.searchKeyModule = new KeyboardEvents(this.filterInput, {
                    keyAction: this.keyActionHandler.bind(this),
                    keyConfigs: this.keyConfigure,
                    eventName: 'keydown'
                });
            }
            else {
                this.searchKeyModule = new KeyboardEvents(this.filterInput, {
                    keyAction: this.mobileKeyActionHandler.bind(this),
                    keyConfigs: this.keyConfigure,
                    eventName: 'keydown'
                });
            }
            EventHandler.add(this.filterInput, 'input', this.onInput, this);
            EventHandler.add(this.filterInput, 'keyup', this.onFilterUp, this);
            EventHandler.add(this.filterInput, 'keydown', this.onFilterDown, this);
            EventHandler.add(this.filterInput, 'blur', this.onBlurHandler, this);
            EventHandler.add(this.filterInput, 'paste', this.pasteHandler, this);
            return this.filterInputObj;
        }
        else {
            return inputObject;
        }
    }
    onInput(e) {
        if (!isNullOrUndefined(e) && !isNullOrUndefined(e.data) && e.data.length > 1 && this.autoFill && (this.getModuleName() === 'combobox' || this.getModuleName() === 'autocomplete')) {
            this.inputElement.value = e.data;
        }
        this.isValidKey = true;
        if (this.getModuleName() === 'combobox') {
            this.updateIconState();
        }
        // For filtering works in mobile firefox.
        if (Browser.isDevice && Browser.info.name === 'mozilla') {
            this.typedString = this.filterInput.value;
            this.preventAutoFill = true;
            this.searchLists(e);
        }
    }
    pasteHandler(e) {
        setTimeout(() => {
            this.typedString = this.filterInput.value;
            if (this.getModuleName() === 'combobox' && this.isFiltering() && isNullOrUndefined(this.list)) {
                this.renderList();
            }
            this.searchLists(e);
        });
    }
    onActionFailure(e) {
        super.onActionFailure(e);
        if (this.beforePopupOpen) {
            this.renderPopup();
        }
    }
    getTakeValue() {
        return this.allowFiltering && this.getModuleName() === 'dropdownlist' && Browser.isDevice ? Math.round(window.outerHeight / this.listItemHeight) : this.itemCount;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onActionComplete(ulElement, list, e, isUpdated) {
        if (this.dataSource instanceof DataManager && !isNullOrUndefined(e) && !this.virtualGroupDataSource) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.totalItemCount = e.count;
        }
        if (this.isNotSearchList && !this.enableVirtualization) {
            this.isNotSearchList = false;
            return;
        }
        if (this.getInitialData) {
            if (this.itemTemplate && this.element.tagName === 'EJS-COMBOBOX' && this.allowFiltering) {
                setTimeout(() => {
                    this.updateActionCompleteDataValues(ulElement, list);
                }, 0);
            }
            else {
                this.updateActionCompleteDataValues(ulElement, list);
            }
            if (this.enableVirtualization) {
                this.updateSelectElementData(this.allowFiltering);
            }
            this.getInitialData = false;
            this.isReactTemplateUpdate = true;
            this.typedString = this.filterInput.value;
            this.searchLists(this.filterArgs);
            return;
        }
        const tempItemCount = this.itemCount;
        if (this.isActive || !isNullOrUndefined(ulElement)) {
            const selectedItem = this.selectedLI ? this.selectedLI.cloneNode(true) : null;
            super.onActionComplete(ulElement, list, e);
            this.skeletonCount = this.totalItemCount !== 0 && this.totalItemCount < (this.itemCount * 2) &&
                ((!(this.dataSource instanceof DataManager)) ||
                    ((this.dataSource instanceof DataManager) && (this.totalItemCount <= this.itemCount))) ? 0 : this.skeletonCount;
            this.updateSelectElementData(this.allowFiltering);
            if (this.isRequested && !isNullOrUndefined(this.searchKeyEvent) && this.searchKeyEvent.type === 'keydown') {
                this.isRequested = false;
                this.keyActionHandler(this.searchKeyEvent);
                this.searchKeyEvent = null;
            }
            if (this.isRequested && !isNullOrUndefined(this.searchKeyEvent)) {
                this.incrementalSearch(this.searchKeyEvent);
                this.searchKeyEvent = null;
            }
            if (!this.enableVirtualization) {
                this.list.scrollTop = 0;
            }
            if (!isNullOrUndefined(ulElement)) {
                attributes(ulElement, { 'id': this.element.id + '_options', 'role': 'listbox', 'aria-hidden': 'false', 'aria-label': 'listbox' });
            }
            if (this.initialRemoteRender) {
                this.initial = true;
                this.activeIndex = this.index;
                this.initialRemoteRender = false;
                if (this.value && this.dataSource instanceof DataManager) {
                    const checkField = isNullOrUndefined(this.fields.value) ? this.fields.text : this.fields.value;
                    const value = this.allowObjectBinding && !isNullOrUndefined(this.value) ?
                        getValue(checkField, this.value) : this.value;
                    const fieldValue = this.fields.value.split('.');
                    let checkVal = list.some((x) => isNullOrUndefined(x[checkField]) && fieldValue.length > 1 ?
                        this.checkFieldValue(x, fieldValue) === value : x[checkField] === value);
                    if (this.enableVirtualization && this.virtualGroupDataSource) {
                        checkVal = this.virtualGroupDataSource.some((x) => isNullOrUndefined(x[checkField]) && fieldValue.length > 1 ?
                            this.checkFieldValue(x, fieldValue) === value : x[checkField] === value);
                    }
                    if (!checkVal) {
                        this.dataSource.executeQuery(this.getQuery(this.query).where(new Predicate(checkField, 'equal', value)))
                            .then((e) => {
                            if (e.result.length > 0) {
                                if (!this.enableVirtualization) {
                                    this.addItem(e.result, list.length);
                                }
                                this.updateValues();
                            }
                            else {
                                this.updateValues();
                            }
                        });
                    }
                    else {
                        this.updateValues();
                    }
                }
                else {
                    this.updateValues();
                }
                this.initial = false;
            }
            else if (this.getModuleName() === 'autocomplete' && this.value) {
                this.setInputValue();
            }
            if (this.getModuleName() !== 'autocomplete' && this.isFiltering() && !this.isTyped) {
                if (!this.actionCompleteData.isUpdated || ((!this.isCustomFilter
                    && !this.isFilterFocus) || (isNullOrUndefined(this.itemData) && this.allowFiltering)
                    && ((this.dataSource instanceof DataManager)
                        || (!isNullOrUndefined(this.dataSource) && !isNullOrUndefined(this.dataSource.length) &&
                            this.dataSource.length !== 0)))) {
                    if (this.itemTemplate && (this.element.tagName === 'EJS-COMBOBOX' || this.isReact) && this.allowFiltering) {
                        setTimeout(() => {
                            this.updateActionCompleteDataValues(ulElement, list);
                        }, 0);
                    }
                    else {
                        this.updateActionCompleteDataValues(ulElement, list);
                    }
                }
                if (this.isDynamicData) {
                    const currentValue = this.allowObjectBinding && !isNullOrUndefined(this.value) ?
                        getValue((this.fields.value) ? this.fields.value : '', this.value) : this.value;
                    this.itemData = this.getDataByValue(currentValue);
                    this.selectedLI = this.getElementByValue(currentValue);
                    this.isDynamicData = false;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((this.allowCustom || (this.allowFiltering && !this.isValueInList(list, this.value) &&
                    this.dataSource instanceof DataManager)) && !this.enableVirtualization) {
                    this.addNewItem(list, selectedItem);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                else if ((this.allowCustom || (this.allowFiltering && this.isValueInList(list, this.value))) &&
                    !this.enableVirtualization) {
                    const value = this.allowObjectBinding && !isNullOrUndefined(this.value) ? getValue((this.fields.value) ? this.fields.value : '', this.value) : this.value;
                    const isValidAddition = !isNullOrUndefined(this.value) && selectedItem && selectedItem.getAttribute('data-value') === value.toString();
                    if (isValidAddition) {
                        this.addNewItem(list, selectedItem);
                    }
                }
                if (!isNullOrUndefined(this.itemData) || (isNullOrUndefined(this.itemData) && this.enableVirtualization)) {
                    this.getSkeletonCount();
                    this.skeletonCount = this.totalItemCount !== 0 && this.totalItemCount < (this.itemCount * 2) &&
                        ((!(this.dataSource instanceof DataManager)) ||
                            ((this.dataSource instanceof DataManager) && (this.totalItemCount <= this.itemCount))) ? 0 : this.skeletonCount;
                    this.UpdateSkeleton();
                    this.focusIndexItem();
                }
                if (this.enableVirtualization) {
                    this.updateActionCompleteDataValues(ulElement, list);
                }
            }
            else if (this.enableVirtualization && this.getModuleName() !== 'autocomplete' && !this.isFiltering()) {
                const value = this.getItemData().value;
                this.activeIndex = this.getIndexByValue(value);
                const element = this.findListElement(this.list, 'li', 'data-value', value);
                this.selectedLI = element;
            }
            else if (this.enableVirtualization && this.getModuleName() === 'autocomplete') {
                this.activeIndex = this.skeletonCount;
            }
            if (this.beforePopupOpen) {
                this.renderPopup(e);
                if (this.enableVirtualization) {
                    if (!this.list.querySelector('.e-virtual-list')) {
                        this.UpdateSkeleton();
                        this.liCollections = this.list.querySelectorAll('.e-list-item');
                    }
                }
                if (this.enableVirtualization && tempItemCount !== this.itemCount) {
                    this.resetList(this.dataSource, this.fields);
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isValueInList(list, valueToFind) {
        if (Array.isArray(list)) {
            for (let i = 0; i < list.length; i++) {
                if (list[i] === valueToFind) {
                    return true;
                }
            }
        }
        else if (typeof list === 'object' && list !== null) {
            for (const key in list) {
                if (Object.prototype.hasOwnProperty.call(list, key) && list[key] === valueToFind) {
                    return true;
                }
            }
        }
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkFieldValue(list, fieldValue) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let checkField = list;
        fieldValue.forEach((value) => {
            checkField = checkField[value];
        });
        return checkField;
    }
    updateActionCompleteDataValues(ulElement, list) {
        this.actionCompleteData = { ulElement: ulElement.cloneNode(true), list: list, isUpdated: true };
        if (this.actionData.list !== this.actionCompleteData.list && this.actionCompleteData.ulElement && this.actionCompleteData.list) {
            this.actionData = this.actionCompleteData;
        }
    }
    addNewItem(listData, newElement) {
        if (!isNullOrUndefined(this.itemData) && !isNullOrUndefined(newElement)) {
            const value = this.getItemData().value;
            const isExist = listData.some((data) => {
                return (((typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') && data === value) ||
                    (getValue(this.fields.value, data) === value));
            });
            if (!isExist) {
                this.addItem(this.itemData);
            }
        }
    }
    updateActionCompleteData(li, item, index) {
        if (this.getModuleName() !== 'autocomplete' && this.actionCompleteData.ulElement) {
            if (this.itemTemplate && this.element.tagName === 'EJS-COMBOBOX' && this.allowFiltering) {
                setTimeout(() => {
                    this.actionCompleteDataUpdate(li, item, index);
                }, 0);
            }
            else {
                this.actionCompleteDataUpdate(li, item, index);
            }
        }
    }
    actionCompleteDataUpdate(li, item, index) {
        if (index !== null) {
            this.actionCompleteData.ulElement.
                insertBefore(li.cloneNode(true), this.actionCompleteData.ulElement.childNodes[index]);
        }
        else {
            this.actionCompleteData.ulElement.appendChild(li.cloneNode(true));
        }
        if (this.isFiltering() && this.actionCompleteData.list && this.actionCompleteData.list.indexOf(item) < 0) {
            this.actionCompleteData.list.push(item);
        }
    }
    focusIndexItem() {
        const value = this.getItemData().value;
        this.activeIndex = ((this.enableVirtualization && !isNullOrUndefined(value)) || !this.enableVirtualization) ?
            this.getIndexByValue(value) : this.activeIndex;
        const element = this.findListElement(this.list, 'li', 'data-value', value);
        this.selectedLI = element;
        this.activeItem(element);
        if (!(this.enableVirtualization && isNullOrUndefined(element))) {
            this.removeFocus();
        }
    }
    updateSelection() {
        const selectedItem = this.list.querySelector('.' + dropDownBaseClasses.selected);
        if (selectedItem) {
            this.setProperties({ 'index': this.getIndexByValue(selectedItem.getAttribute('data-value')) });
            this.activeIndex = this.index;
        }
        else {
            this.removeFocus();
            if (this.allowFiltering && this.actionCompleteData && this.actionCompleteData.ulElement &&
                this.dataSource instanceof DataManager) {
                const focus = this.actionCompleteData.ulElement.querySelector('.e-item-focus');
                if (focus) {
                    removeClass(focus, dropDownListClasses.focus);
                }
            }
            this.list.querySelector('.' + dropDownBaseClasses.li).classList.add(dropDownListClasses.focus);
        }
    }
    updateSelectionList() {
        const selectedItem = this.list && this.list.querySelector('.' + 'e-active');
        if (!selectedItem && !isNullOrUndefined(this.value) && this.getModuleName() !== 'autocomplete') {
            const value = this.allowObjectBinding ? getValue((this.fields.value) ? this.fields.value : '', this.value) : this.value;
            const findEle = this.findListElement(this.list, 'li', 'data-value', value);
            if (findEle) {
                findEle.classList.add('e-active');
            }
        }
    }
    removeFocus() {
        const highlightedItem = this.list.querySelectorAll('.' + dropDownListClasses.focus);
        if (highlightedItem && highlightedItem.length) {
            removeClass(highlightedItem, dropDownListClasses.focus);
        }
    }
    renderPopup(e) {
        if (this.popupObj && document.body.contains(this.popupObj.element)) {
            this.refreshPopup();
            return;
        }
        const args = { cancel: false };
        this.trigger('beforeOpen', args, (args) => {
            let initialPopupHeight;
            if (!args.cancel) {
                const popupEle = this.createElement('div', {
                    id: this.element.id + '_popup', className: 'e-ddl e-popup ' + (this.cssClass !== null ? this.cssClass : '')
                });
                popupEle.setAttribute('aria-label', this.element.id);
                popupEle.setAttribute('role', 'dialog');
                const searchBox = this.setSearchBox(popupEle);
                this.listContainerHeight = this.allowFiltering && this.getModuleName() === 'dropdownlist' && Browser.isDevice && this.isDeviceFullScreen ?
                    formatUnit(Math.round(window.outerHeight).toString() + 'px') : formatUnit(this.popupHeight);
                if (this.headerTemplate) {
                    this.setHeaderTemplate(popupEle);
                    this.isUpdateHeaderHeight = this.header.offsetHeight !== 0;
                }
                append([this.list], popupEle);
                if (this.footerTemplate) {
                    this.setFooterTemplate(popupEle);
                    this.isUpdateFooterHeight = this.footer.offsetHeight !== 0;
                }
                document.body.appendChild(popupEle);
                popupEle.style.top = '0px';
                initialPopupHeight = popupEle.clientHeight;
                if (this.enableVirtualization && (this.itemTemplate || this.isAngular)) {
                    const listitems = popupEle.querySelectorAll('li.e-list-item:not(.e-virtual-list)');
                    const virtualListitems = popupEle.querySelectorAll('li.e-virtual-list');
                    const listitemsHeight = listitems && listitems.length > 0 ?
                        Math.ceil(listitems[0].getBoundingClientRect().height) +
                            parseInt(window.getComputedStyle(listitems[0]).marginBottom, 10) : 0;
                    const VirtualLiHeight = virtualListitems && virtualListitems.length > 0 ?
                        Math.ceil(virtualListitems[0].getBoundingClientRect().height) +
                            parseInt(window.getComputedStyle(virtualListitems[0]).marginBottom, 10) : 0;
                    if (listitemsHeight !== VirtualLiHeight && virtualListitems && virtualListitems.length > 0) {
                        virtualListitems.forEach((item) => {
                            item.parentNode.removeChild(item);
                        });
                    }
                    this.listItemHeight = listitemsHeight;
                }
                if (this.enableVirtualization && !this.list.classList.contains(dropDownBaseClasses.noData)) {
                    this.getSkeletonCount();
                    this.skeletonCount = this.totalItemCount < (this.itemCount * 2) && ((!(this.dataSource instanceof DataManager)) ||
                        ((this.dataSource instanceof DataManager) && (this.totalItemCount <= this.itemCount))) ? 0 : this.skeletonCount;
                    if (!this.list.querySelector('.e-virtual-ddl-content')) {
                        const virtualContentElement = this.createElement('div', {
                            className: 'e-virtual-ddl-content'
                        });
                        virtualContentElement.style.cssText = this.getTransformValues();
                        this.list.appendChild(virtualContentElement).appendChild(this.list.querySelector('.e-list-parent'));
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.list.getElementsByClassName('e-virtual-ddl-content')[0].style = this.getTransformValues();
                    }
                    this.UpdateSkeleton();
                    this.liCollections = this.list.querySelectorAll('.' + dropDownBaseClasses.li);
                    this.virtualItemCount = this.itemCount;
                    if (!this.list.querySelector('.e-virtual-ddl')) {
                        const virtualElement = this.createElement('div', {
                            id: this.element.id + '_popup',
                            className: 'e-virtual-ddl'
                        });
                        virtualElement.style.cssText = this.GetVirtualTrackHeight();
                        popupEle.querySelector('.e-dropdownbase').appendChild(virtualElement);
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.list.getElementsByClassName('e-virtual-ddl')[0].style = this.GetVirtualTrackHeight();
                    }
                }
                popupEle.style.visibility = 'hidden';
                if (this.popupHeight !== 'auto') {
                    this.searchBoxHeight = 0;
                    if (!isNullOrUndefined(searchBox.container) &&
                        this.getModuleName() !== 'combobox' && this.getModuleName() !== 'autocomplete') {
                        this.searchBoxHeight = (searchBox.container.parentElement).getBoundingClientRect().height;
                        this.listContainerHeight = (parseInt(this.listContainerHeight, 10) - (this.searchBoxHeight)).toString() + 'px';
                    }
                    if (this.headerTemplate) {
                        this.header = this.header ? this.header : popupEle.querySelector('.e-ddl-header');
                        const height = Math.round(this.header.getBoundingClientRect().height);
                        this.listContainerHeight = (parseInt(this.listContainerHeight, 10) -
                            (height + this.searchBoxHeight)).toString() + 'px';
                    }
                    if (this.footerTemplate) {
                        this.footer = this.footer ? this.footer : popupEle.querySelector('.e-ddl-footer');
                        const height = Math.round(this.footer.getBoundingClientRect().height);
                        this.listContainerHeight = (parseInt(this.listContainerHeight, 10) -
                            (height + this.searchBoxHeight)).toString() + 'px';
                    }
                    this.list.style.maxHeight = (parseInt(this.listContainerHeight, 10) - 2).toString() + 'px'; // due to box-sizing property
                    popupEle.style.maxHeight = formatUnit(this.popupHeight);
                }
                else {
                    popupEle.style.height = 'auto';
                }
                let offsetValue = 0;
                let left;
                this.isPreventScrollAction = true;
                if (!isNullOrUndefined(this.selectedLI) && (!isNullOrUndefined(this.activeIndex) && this.activeIndex >= 0)) {
                    this.setScrollPosition();
                }
                else if (this.enableVirtualization) {
                    this.setScrollPosition();
                }
                else {
                    this.list.scrollTop = 0;
                }
                if (Browser.isDevice && this.isDeviceFullScreen && (!this.allowFiltering && (this.getModuleName() === 'dropdownlist' ||
                    (this.isDropDownClick && this.getModuleName() === 'combobox')))) {
                    offsetValue = this.getOffsetValue(popupEle);
                    const firstItem = this.isEmptyList() ? this.list : this.liCollections[0];
                    if (!isNullOrUndefined(this.inputElement)) {
                        left = -(parseInt(getComputedStyle(firstItem).textIndent, 10) -
                            parseInt(getComputedStyle(this.inputElement).paddingLeft, 10) +
                            parseInt(getComputedStyle(this.inputElement.parentElement).borderLeftWidth, 10));
                    }
                }
                this.createPopup(popupEle, offsetValue, left);
                this.popupContentElement = this.popupObj.element.querySelector('.e-content');
                this.getFocusElement();
                this.checkCollision(popupEle);
                if (Browser.isDevice) {
                    if ((parseInt(this.popupWidth.toString(), 10) > window.outerWidth) &&
                        !(this.getModuleName() === 'dropdownlist' && this.allowFiltering)) {
                        this.popupObj.element.classList.add('e-wide-popup');
                    }
                    this.popupObj.element.classList.add(dropDownListClasses.device);
                    if (this.getModuleName() === 'dropdownlist' || (this.getModuleName() === 'combobox'
                        && !this.allowFiltering && this.isDropDownClick)) {
                        this.popupObj.collision = { X: 'fit', Y: 'fit' };
                    }
                    if (this.isFilterLayout() && this.isDeviceFullScreen) {
                        this.popupObj.element.classList.add(dropDownListClasses.mobileFilter);
                        this.popupObj.position = { X: 0, Y: 0 };
                        this.popupObj.dataBind();
                        attributes(this.popupObj.element, { style: 'left:0px;right:0px;top:0px;bottom:0px;' });
                        addClass([document.body, this.popupObj.element], dropDownListClasses.popupFullScreen);
                        this.setSearchBoxPosition();
                        this.backIconElement = searchBox.container.querySelector('.e-back-icon');
                        this.clearIconElement = searchBox.container.querySelector('.' + dropDownListClasses.clearIcon);
                        EventHandler.add(this.backIconElement, 'click', this.clickOnBackIcon, this);
                        EventHandler.add(this.clearIconElement, 'click', this.clearText, this);
                    }
                }
                popupEle.style.visibility = 'visible';
                addClass([popupEle], 'e-popup-close');
                const scrollParentElements = this.popupObj.getScrollableParent(this.inputWrapper.container);
                for (const element of scrollParentElements) {
                    EventHandler.add(element, 'scroll', this.scrollHandler, this);
                }
                if (!isNullOrUndefined(this.list)) {
                    this.unWireListEvents();
                    this.wireListEvents();
                }
                this.selectedElementID = this.selectedLI ? this.selectedLI.id : null;
                if (this.enableVirtualization) {
                    this.notify('bindScrollEvent', {
                        module: 'VirtualScroll',
                        component: this.getModuleName(),
                        enable: this.enableVirtualization
                    });
                    setTimeout(() => {
                        if (this.value || this.list.querySelector('.e-active')) {
                            this.updateSelectionList();
                            if (this.selectedValueInfo && this.viewPortInfo && this.viewPortInfo.offsets.top) {
                                this.list.scrollTop = this.viewPortInfo.offsets.top;
                            }
                            else {
                                this.scrollBottom(true, true);
                            }
                        }
                    }, 5);
                }
                attributes(this.targetElement(), { 'aria-expanded': 'true', 'aria-owns': this.element.id + '_popup', 'aria-controls': this.element.id });
                if (this.getModuleName() !== 'dropdownlist' && this.list.classList.contains('e-nodata')) {
                    attributes(this.targetElement(), { 'aria-activedescendant': 'no-record' });
                    this.popupContentElement.setAttribute('role', 'status');
                    this.popupContentElement.setAttribute('id', 'no-record');
                }
                this.inputElement.setAttribute('aria-expanded', 'true');
                this.inputElement.setAttribute('aria-controls', this.element.id + '_popup');
                const inputParent = this.isFiltering() ? this.filterInput.parentElement : this.inputWrapper.container;
                addClass([inputParent], [dropDownListClasses.inputFocus]);
                const animModel = { name: 'FadeIn', duration: 100 };
                this.beforePopupOpen = true;
                const popupInstance = this.popupObj;
                const eventArgs = { popup: popupInstance, event: e, cancel: false, animation: animModel };
                this.trigger('open', eventArgs, (eventArgs) => {
                    if (!eventArgs.cancel) {
                        if (!isNullOrUndefined(this.inputWrapper)) {
                            addClass([this.inputWrapper.container], [dropDownListClasses.iconAnimation]);
                        }
                        this.renderReactTemplates();
                        if (this.isReact && this.isFiltering() && this.dataSource instanceof DataManager && this.list.querySelector('ul') && !this.isSecondClick) {
                            this.executeCloneElements();
                        }
                        if (!isNullOrUndefined(this.popupObj)) {
                            this.popupObj.show(new Animation(eventArgs.animation), (this.zIndex === 1000) ? this.element : null);
                            this.isPopupRender = true;
                        }
                        if (this.isReact) {
                            setTimeout(() => {
                                if (this.popupHeight && this.list && this.popupHeight !== 'auto' && !(this.getModuleName() === 'dropdownlist' && this.allowFiltering)) {
                                    const popupHeightValue = typeof this.popupHeight === 'string' ? parseInt(this.popupHeight, 10) : this.popupHeight;
                                    if (!this.isUpdateHeaderHeight && this.headerTemplate && this.header) {
                                        const listHeight = this.list.style.maxHeight === '' ? popupHeightValue : parseInt(this.list.style.maxHeight, 10);
                                        this.list.style.maxHeight = (listHeight - this.header.offsetHeight).toString() + 'px';
                                        this.isUpdateHeaderHeight = true;
                                    }
                                    if (!this.isUpdateFooterHeight && this.footerTemplate && this.footer) {
                                        const listHeight = this.list.style.maxHeight === '' ? popupHeightValue : parseInt(this.list.style.maxHeight, 10);
                                        this.list.style.maxHeight = (listHeight - this.footer.offsetHeight).toString() + 'px';
                                        this.isUpdateFooterHeight = true;
                                    }
                                }
                            }, 15);
                        }
                    }
                    else {
                        this.beforePopupOpen = false;
                        this.destroyPopup();
                    }
                });
                if (this.allowResize && (this.getModuleName() !== 'dropdownlist' || !(Browser.isDevice && this.isDeviceFullScreen && this.allowFiltering))) {
                    const resizePaddingBottom = 16;
                    // Create the resizer div
                    this.resizer = this.createElement('div', {
                        id: this.element.id + '_resize-popup',
                        className: dropDownListClasses.resizeIcon // Adding class for styling
                    });
                    // Add the resizer div to the popup
                    if (this.list && this.list.parentElement) {
                        this.list.parentElement.classList.add('e-resize');
                        if (this.popupHeight.toString().toLowerCase() !== 'auto' && initialPopupHeight >= (parseInt(this.popupHeight.toString(), 10) - 2)) {
                            this.list.parentElement.style.height = '100%';
                        }
                        this.list.parentElement.style.paddingBottom = (this.getModuleName() === 'dropdownlist' && this.allowFiltering && this.searchBoxHeight) ? (this.searchBoxHeight + resizePaddingBottom).toString() + 'px' : resizePaddingBottom.toString() + 'px';
                        if (this.header || this.footer || this.itemTemplate) {
                            this.list.parentElement.style.paddingBottom = ((parseInt(this.list.parentElement.style.maxHeight, 10) - parseInt(this.list.style.maxHeight, 10)) + resizePaddingBottom).toString() + 'px';
                        }
                        this.list.parentElement.appendChild(this.resizer);
                        //hold the popup resize
                        this.list.parentElement.style.width = `${this.resizeWidth}px`;
                        this.list.parentElement.style.height = `${this.resizeHeight}px`;
                        this.list.parentElement.style.maxHeight = `${this.resizeHeight}px`;
                        this.list.style.maxHeight = `${this.resizeHeight}px`;
                    }
                    // Attach mouse and touch events to the resizer
                    EventHandler.add(this.resizer, 'mousedown', this.startResizing, this);
                    EventHandler.add(this.resizer, 'touchstart', this.startResizing, this);
                }
            }
            else {
                this.beforePopupOpen = false;
            }
        });
    }
    checkCollision(popupEle) {
        if (!Browser.isDevice || (Browser.isDevice && !(this.getModuleName() === 'dropdownlist' || this.isDropDownClick))) {
            const collision = isCollide(popupEle);
            if (collision.length > 0) {
                popupEle.style.marginTop = -parseInt(getComputedStyle(popupEle).marginTop, 10) + 'px';
            }
            this.popupObj.resolveCollision();
        }
    }
    getOffsetValue(popupEle) {
        const popupStyles = getComputedStyle(popupEle);
        const borderTop = parseInt(popupStyles.borderTopWidth, 10);
        const borderBottom = parseInt(popupStyles.borderBottomWidth, 10);
        return this.setPopupPosition(borderTop + borderBottom);
    }
    createPopup(element, offsetValue, left) {
        this.popupObj = new Popup(element, {
            width: this.setWidth(), targetType: 'relative',
            relateTo: this.inputWrapper.container,
            collision: this.enableRtl ? { X: 'fit', Y: 'flip' } : { X: 'flip', Y: 'flip' }, offsetY: offsetValue,
            enableRtl: this.enableRtl, offsetX: left,
            position: this.enableRtl ? { X: 'right', Y: 'bottom' } : { X: 'left', Y: 'bottom' },
            zIndex: this.zIndex,
            close: () => {
                if (!this.isDocumentClick) {
                    this.focusDropDown();
                }
                // eslint-disable-next-line
                if (this.isReact) {
                    this.clearTemplate(['headerTemplate', 'footerTemplate']);
                }
                this.isNotSearchList = false;
                this.isDocumentClick = false;
                this.destroyPopup();
                if (this.isFiltering() && this.actionCompleteData.list && this.actionCompleteData.list.length > 0) {
                    this.isActive = true;
                    if (this.isReactTemplateUpdate && this.isReact && this.itemTemplate && !this.enableVirtualization) {
                        this.actionCompleteData.ulElement = this.renderItems(this.actionCompleteData.list, this.fields);
                        this.isReactTemplateUpdate = false;
                    }
                    if (this.enableVirtualization) {
                        this.onActionComplete(this.ulElement, this.listData, null, true);
                    }
                    else {
                        this.onActionComplete(this.actionCompleteData.ulElement, this.actionCompleteData.list, null, true);
                    }
                }
                else if (this.enableVirtualization) {
                    this.focusIndexItem();
                }
            },
            open: () => {
                EventHandler.add(document, 'mousedown', this.onDocumentClick, this);
                this.isPopupOpen = true;
                const actionList = this.actionCompleteData && this.actionCompleteData.ulElement &&
                    this.actionCompleteData.ulElement.querySelector('li');
                const ulElement = this.list.querySelector('ul li');
                if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-item-focus')[0])) {
                    attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-item-focus')[0].id });
                }
                else if (!isNullOrUndefined(this.ulElement) && !isNullOrUndefined(this.ulElement.getElementsByClassName('e-active')[0])) {
                    attributes(this.targetElement(), { 'aria-activedescendant': this.ulElement.getElementsByClassName('e-active')[0].id });
                }
                if (this.isFiltering() && this.itemTemplate && (this.element.tagName === this.getNgDirective()) &&
                    (actionList && ulElement && actionList.textContent !== ulElement.textContent) &&
                    this.element.tagName !== 'EJS-COMBOBOX') {
                    this.cloneElements();
                }
                if (this.isFilterLayout()) {
                    removeClass([this.inputWrapper.container], [dropDownListClasses.inputFocus]);
                    this.isFilterFocus = true;
                    this.filterInput.focus();
                    if (this.inputWrapper.clearButton) {
                        addClass([this.inputWrapper.clearButton], dropDownListClasses.clearIconHide);
                    }
                }
                this.activeStateChange();
            },
            targetExitViewport: () => {
                if (!Browser.isDevice) {
                    this.hidePopup();
                }
            }
        });
    }
    isEmptyList() {
        return !isNullOrUndefined(this.liCollections) && this.liCollections.length === 0;
    }
    getFocusElement() {
        // combo-box used this method
    }
    isFilterLayout() {
        return this.getModuleName() === 'dropdownlist' && this.allowFiltering;
    }
    scrollHandler() {
        if (Browser.isDevice && ((this.getModuleName() === 'dropdownlist' &&
            !this.isFilterLayout()) || (this.getModuleName() === 'combobox' && !this.allowFiltering && this.isDropDownClick))) {
            if (this.element && !(this.isElementInViewport(this.element))) {
                this.hidePopup();
            }
        }
    }
    isElementInViewport(element) {
        const elementRect = element.getBoundingClientRect();
        return (elementRect.top >= 0 && elementRect.left >= 0 && elementRect.bottom <= window.innerHeight &&
            elementRect.right <= window.innerWidth);
    }
    setSearchBoxPosition() {
        const searchBoxHeight = this.filterInput.parentElement.getBoundingClientRect().height;
        this.popupObj.element.style.maxHeight = '100%';
        this.popupObj.element.style.width = '100%';
        this.list.style.maxHeight = (window.innerHeight - searchBoxHeight) + 'px';
        this.list.style.height = (window.innerHeight - searchBoxHeight) + 'px';
        const clearElement = this.filterInput.parentElement.querySelector('.' + dropDownListClasses.clearIcon);
        detach(this.filterInput);
        clearElement.parentElement.insertBefore(this.filterInput, clearElement);
    }
    setPopupPosition(border) {
        let offsetValue;
        const popupOffset = border;
        const selectedLI = this.list.querySelector('.' + dropDownListClasses.focus) || this.selectedLI;
        const firstItem = this.isEmptyList() ? this.list : this.liCollections[0];
        const lastItem = this.isEmptyList() ? this.list : this.liCollections[this.getItems().length - 1];
        const liHeight = firstItem.getBoundingClientRect().height;
        this.listItemHeight = liHeight + parseInt(window.getComputedStyle(firstItem).marginBottom, 10);
        const listHeight = this.list.offsetHeight / 2;
        const height = isNullOrUndefined(selectedLI) ? firstItem.offsetTop : selectedLI.offsetTop;
        const lastItemOffsetValue = lastItem.offsetTop;
        if (lastItemOffsetValue - listHeight < height && !isNullOrUndefined(this.liCollections) &&
            this.liCollections.length > 0 && !isNullOrUndefined(selectedLI)) {
            const count = this.list.offsetHeight / liHeight;
            const paddingBottom = parseInt(getComputedStyle(this.list).paddingBottom, 10);
            offsetValue = (count - (this.liCollections.length - this.activeIndex)) * liHeight - popupOffset + paddingBottom;
            this.list.scrollTop = selectedLI.offsetTop;
        }
        else if (height > listHeight && !this.enableVirtualization) {
            offsetValue = listHeight - liHeight / 2;
            this.list.scrollTop = height - listHeight + liHeight / 2;
        }
        else {
            offsetValue = height;
        }
        const inputHeight = this.inputWrapper.container.offsetHeight;
        offsetValue = offsetValue + liHeight + popupOffset - ((liHeight - inputHeight) / 2);
        return -offsetValue;
    }
    setWidth() {
        let width = formatUnit(this.popupWidth);
        if (width.indexOf('%') > -1) {
            const inputWidth = this.inputWrapper.container.offsetWidth * parseFloat(width) / 100;
            width = inputWidth.toString() + 'px';
        }
        if (Browser.isDevice && (width.indexOf('px') > -1) && (!this.allowFiltering && (this.getModuleName() === 'dropdownlist' ||
            (this.isDropDownClick && this.getModuleName() === 'combobox')))) {
            const firstItem = this.isEmptyList() ? this.list : this.liCollections[0];
            width = (parseInt(width, 10) + (parseInt(getComputedStyle(firstItem).textIndent, 10) -
                parseInt(getComputedStyle(this.inputElement).paddingLeft, 10) +
                parseInt(getComputedStyle(this.inputElement.parentElement).borderLeftWidth, 10)) * 2) + 'px';
        }
        return width;
    }
    scrollBottom(isInitial, isInitialSelection = false, keyAction = null) {
        if (isNullOrUndefined(this.selectedLI) && this.enableVirtualization) {
            this.selectedLI = this.list.querySelector('.' + dropDownBaseClasses.li);
            if (!isNullOrUndefined(this.selectedLI) && this.selectedLI.classList.contains('e-virtual-list')) {
                this.selectedLI = this.liCollections[this.skeletonCount];
            }
        }
        if (!isNullOrUndefined(this.selectedLI)) {
            const selectedListMargin = this.selectedLI &&
                !isNaN(parseInt(window.getComputedStyle(this.selectedLI).marginBottom, 10)) ?
                parseInt(window.getComputedStyle(this.selectedLI).marginBottom, 10) : 0;
            this.isUpwardScrolling = false;
            const virtualListCount = this.list.querySelectorAll('.e-virtual-list').length;
            const lastElementValue = this.list.querySelector('li:last-of-type') ?
                this.list.querySelector('li:last-of-type').getAttribute('data-value') : null;
            const selectedLiOffsetTop = this.virtualListInfo && this.virtualListInfo.startIndex ?
                this.selectedLI.offsetTop + (this.virtualListInfo.startIndex * (this.selectedLI.offsetHeight +
                    selectedListMargin)) : this.selectedLI.offsetTop;
            const currentOffset = this.list.offsetHeight;
            const nextBottom = selectedLiOffsetTop - (virtualListCount * (this.selectedLI.offsetHeight + selectedListMargin)) +
                (this.selectedLI.offsetHeight + selectedListMargin) - this.list.scrollTop;
            let nextOffset = this.list.scrollTop + nextBottom - currentOffset;
            let isScrollerCHanged = false;
            nextOffset = isInitial ? nextOffset + parseInt(getComputedStyle(this.list).paddingTop, 10) * 2 :
                nextOffset + parseInt(getComputedStyle(this.list).paddingTop, 10);
            let boxRange = selectedLiOffsetTop - (virtualListCount * (this.selectedLI.offsetHeight + selectedListMargin)) +
                (this.selectedLI.offsetHeight + selectedListMargin) - this.list.scrollTop;
            boxRange = this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
                boxRange - this.fixedHeaderElement.offsetHeight : boxRange;
            if (this.activeIndex === 0 && !this.enableVirtualization) {
                this.list.scrollTop = 0;
                isScrollerCHanged = this.isKeyBoardAction;
            }
            else if (nextBottom > currentOffset || !(boxRange > 0 && this.list.offsetHeight > boxRange)) {
                const currentElementValue = this.selectedLI ? this.selectedLI.getAttribute('data-value') : null;
                let liCount = keyAction === 'pageDown' ? this.getPageCount() - 2 : 1;
                if (!this.enableVirtualization || this.isKeyBoardAction || isInitialSelection) {
                    if (this.isKeyBoardAction && this.enableVirtualization && lastElementValue &&
                        currentElementValue === lastElementValue && keyAction !== 'end' && !this.isVirtualScrolling) {
                        this.isPreventKeyAction = true;
                        if (this.enableVirtualization && this.itemTemplate) {
                            this.list.scrollTop += nextOffset;
                        }
                        else {
                            if (this.enableVirtualization) {
                                liCount = keyAction === 'pageDown' ? this.getPageCount() + 1 : liCount;
                            }
                            this.list.scrollTop += (this.selectedLI.offsetHeight + selectedListMargin) * liCount;
                        }
                        this.isPreventKeyAction = this.IsScrollerAtEnd() ? false : this.isPreventKeyAction;
                        this.isKeyBoardAction = false;
                        this.isPreventScrollAction = false;
                    }
                    else if (this.enableVirtualization && keyAction === 'end') {
                        this.isPreventKeyAction = false;
                        this.isKeyBoardAction = false;
                        this.isPreventScrollAction = false;
                        this.list.scrollTop = this.list.scrollHeight;
                    }
                    else {
                        if (keyAction === 'pageDown' && this.enableVirtualization && !this.isVirtualScrolling) {
                            this.isPreventKeyAction = false;
                            this.isKeyBoardAction = false;
                            this.isPreventScrollAction = false;
                        }
                        this.list.scrollTop = nextOffset;
                    }
                }
                else {
                    this.list.scrollTop = this.virtualListInfo && this.virtualListInfo.startIndex ?
                        isInitial && this.virtualListInfo.startIndex ? this.virtualListInfo.startIndex * this.listItemHeight +
                            (this.listItemHeight * 2) : this.virtualListInfo.startIndex * this.listItemHeight : 0;
                }
                isScrollerCHanged = this.isKeyBoardAction;
            }
            this.isKeyBoardAction = isScrollerCHanged;
            if (this.enableVirtualization && this.fields.groupBy && this.fixedHeaderElement && (keyAction === 'down')) {
                setTimeout(() => {
                    this.scrollStop(null, true);
                }, 100);
            }
        }
    }
    scrollTop(keyAction = null) {
        if (!isNullOrUndefined(this.selectedLI)) {
            const selectedListMargin = this.selectedLI &&
                !isNaN(parseInt(window.getComputedStyle(this.selectedLI).marginBottom, 10)) ?
                parseInt(window.getComputedStyle(this.selectedLI).marginBottom, 10) : 0;
            const virtualListCount = this.list.querySelectorAll('.e-virtual-list').length;
            const selectedLiOffsetTop = (this.virtualListInfo && this.virtualListInfo.startIndex) ?
                this.selectedLI.offsetTop + (this.virtualListInfo.startIndex * (this.selectedLI.offsetHeight +
                    selectedListMargin)) : this.selectedLI.offsetTop;
            let nextOffset = selectedLiOffsetTop - (virtualListCount * (this.selectedLI.offsetHeight +
                selectedListMargin)) - this.list.scrollTop;
            const firstElementValue = this.list.querySelector('li.e-list-item:not(.e-virtual-list)') ?
                this.list.querySelector('li.e-list-item:not(.e-virtual-list)').getAttribute('data-value') : null;
            nextOffset = this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
                nextOffset - this.fixedHeaderElement.offsetHeight : nextOffset;
            const boxRange = (selectedLiOffsetTop - (virtualListCount * (this.selectedLI.offsetHeight + selectedListMargin)) +
                (this.selectedLI.offsetHeight + selectedListMargin) - this.list.scrollTop);
            const isPageUpKeyAction = this.enableVirtualization && this.getModuleName() === 'autocomplete' && nextOffset <= 0;
            if (this.activeIndex === 0 && !this.enableVirtualization) {
                this.list.scrollTop = 0;
            }
            else if (nextOffset < 0 || isPageUpKeyAction) {
                const currentElementValue = this.selectedLI ? this.selectedLI.getAttribute('data-value') : null;
                let liCount = keyAction === 'pageUp' ? this.getPageCount() - 2 : 1;
                if (this.enableVirtualization) {
                    liCount = keyAction === 'pageUp' ? this.getPageCount() : liCount;
                }
                if (this.enableVirtualization && this.isKeyBoardAction && firstElementValue &&
                    currentElementValue === firstElementValue && keyAction !== 'home' && !this.isVirtualScrolling) {
                    this.isUpwardScrolling = true;
                    this.isPreventKeyAction = true;
                    this.list.scrollTop -= (this.selectedLI.offsetHeight + selectedListMargin) * liCount;
                    this.isPreventKeyAction = this.list.scrollTop !== 0 ? this.isPreventKeyAction : false;
                    this.isKeyBoardAction = false;
                    this.isPreventScrollAction = false;
                }
                else if (this.enableVirtualization && keyAction === 'home') {
                    this.isPreventScrollAction = false;
                    this.isPreventKeyAction = true;
                    this.isKeyBoardAction = false;
                    this.list.scrollTo(0, 0);
                }
                else {
                    if (keyAction === 'pageUp' && this.enableVirtualization && !this.isVirtualScrolling) {
                        this.isPreventKeyAction = false;
                        this.isKeyBoardAction = false;
                        this.isPreventScrollAction = false;
                    }
                    this.list.scrollTop = this.list.scrollTop + nextOffset;
                }
            }
            else if (!(boxRange > 0 && this.list.offsetHeight > boxRange)) {
                this.list.scrollTop = this.selectedLI.offsetTop - (this.fields.groupBy && !isNullOrUndefined(this.fixedHeaderElement) ?
                    this.fixedHeaderElement.offsetHeight : 0);
            }
        }
    }
    IsScrollerAtEnd() {
        return this.list && this.list.scrollTop + this.list.clientHeight >= this.list.scrollHeight;
    }
    isEditTextBox() {
        return false;
    }
    isFiltering() {
        return this.allowFiltering;
    }
    isPopupButton() {
        return true;
    }
    setScrollPosition(e) {
        this.isPreventScrollAction = true;
        if (!isNullOrUndefined(e)) {
            switch (e.action) {
                case 'pageDown':
                case 'down':
                case 'end':
                    this.isKeyBoardAction = true;
                    this.scrollBottom(false, false, e.action);
                    break;
                default:
                    this.isKeyBoardAction = e.action === 'up' || e.action === 'pageUp' || e.action === 'open';
                    this.scrollTop(e.action);
                    break;
            }
        }
        else {
            this.scrollBottom(true);
        }
        this.isKeyBoardAction = false;
    }
    clearText() {
        this.filterInput.value = this.typedString = '';
        this.searchLists(null);
        if (this.enableVirtualization) {
            this.list.scrollTop = 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.totalItemCount = this.dataCount = this.dataSource && this.dataSource.length ?
                this.dataSource.length : 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (this.list.getElementsByClassName('e-virtual-ddl')[0]) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.list.getElementsByClassName('e-virtual-ddl')[0].style = this.GetVirtualTrackHeight();
            }
            this.getSkeletonCount();
            this.UpdateSkeleton();
            this.liCollections = this.list.querySelectorAll('.e-list-item');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (this.list.getElementsByClassName('e-virtual-ddl-content')[0]) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.list.getElementsByClassName('e-virtual-ddl-content')[0].style = this.getTransformValues();
            }
        }
    }
    setEleWidth(width) {
        if (!isNullOrUndefined(width)) {
            if (typeof width === 'number') {
                this.inputWrapper.container.style.width = formatUnit(width);
            }
            else if (typeof width === 'string') {
                this.inputWrapper.container.style.width = (width.match(/px|%|em/)) ? (width) : (formatUnit(width));
            }
        }
    }
    closePopup(delay, e) {
        const isFilterValue = !isNullOrUndefined(this.filterInput) &&
            !isNullOrUndefined(this.filterInput.value) && this.filterInput.value !== '';
        const typedString = this.getModuleName() === 'combobox' ? this.typedString : null;
        this.isTyped = false;
        this.isVirtualTrackHeight = false;
        if (!(this.popupObj && document.body.contains(this.popupObj.element) && this.beforePopupOpen)) {
            return;
        }
        this.keyboardEvent = null;
        EventHandler.remove(document, 'mousedown', this.onDocumentClick);
        this.isActive = false;
        this.isDropDownClick = false;
        this.preventAutoFill = false;
        const scrollableParentElements = this.popupObj.getScrollableParent(this.inputWrapper.container);
        for (const element of scrollableParentElements) {
            EventHandler.remove(element, 'scroll', this.scrollHandler);
        }
        if (Browser.isDevice && this.isFilterLayout() && this.isDeviceFullScreen) {
            removeClass([document.body, this.popupObj.element], dropDownListClasses.popupFullScreen);
        }
        if (this.isFilterLayout()) {
            if (!Browser.isDevice) {
                this.searchKeyModule.destroy();
                if (this.clearIconElement) {
                    EventHandler.remove(this.clearIconElement, 'click', this.clearText);
                }
            }
            if (this.backIconElement) {
                EventHandler.remove(this.backIconElement, 'click', this.clickOnBackIcon);
                EventHandler.remove(this.clearIconElement, 'click', this.clearText);
            }
            if (!isNullOrUndefined(this.filterInput)) {
                EventHandler.remove(this.filterInput, 'input', this.onInput);
                EventHandler.remove(this.filterInput, 'keyup', this.onFilterUp);
                EventHandler.remove(this.filterInput, 'keydown', this.onFilterDown);
                EventHandler.remove(this.filterInput, 'blur', this.onBlurHandler);
                EventHandler.remove(this.filterInput, 'paste', this.pasteHandler);
            }
            if (this.allowFiltering && this.getModuleName() === 'dropdownlist') {
                this.filterInput.removeAttribute('aria-activedescendant');
                this.filterInput.removeAttribute('aria-disabled');
                this.filterInput.removeAttribute('role');
                this.filterInput.removeAttribute('autocomplete');
                this.filterInput.removeAttribute('autocapitalize');
                this.filterInput.removeAttribute('spellcheck');
            }
            this.filterInput = null;
        }
        attributes(this.targetElement(), { 'aria-expanded': 'false' });
        this.inputElement.setAttribute('aria-expanded', 'false');
        this.targetElement().removeAttribute('aria-owns');
        this.targetElement().removeAttribute('aria-activedescendant');
        this.inputWrapper.container.classList.remove(dropDownListClasses.iconAnimation);
        if (this.isFiltering()) {
            this.actionCompleteData.isUpdated = false;
        }
        if (this.enableVirtualization) {
            if ((this.value == null || this.isTyped)) {
                this.viewPortInfo.endIndex = this.viewPortInfo && this.viewPortInfo.endIndex > 0 ?
                    this.viewPortInfo.endIndex : this.itemCount;
                if (this.getModuleName() === 'autocomplete' || (this.getModuleName() === 'dropdownlist' &&
                    !isNullOrUndefined(this.typedString) && this.typedString !== '') || (this.getModuleName() === 'combobox' &&
                    this.allowFiltering && !isNullOrUndefined(this.typedString) && this.typedString !== '')) {
                    this.checkAndResetCache();
                }
            }
            else if (this.getModuleName() === 'autocomplete') {
                this.checkAndResetCache();
            }
            if ((this.getModuleName() === 'dropdownlist' || this.getModuleName() === 'combobox') && !(this.skeletonCount === 0)) {
                this.getSkeletonCount(true);
            }
        }
        this.beforePopupOpen = false;
        const animModel = {
            name: 'FadeOut',
            duration: 100,
            delay: delay ? delay : 0
        };
        const popupInstance = this.popupObj;
        const eventArgs = { popup: popupInstance, cancel: false, animation: animModel, event: e || null };
        this.trigger('close', eventArgs, (eventArgs) => {
            if (this.getModuleName() === 'dropdownlist') {
                Input.destroy({
                    element: this.filterInput,
                    floatLabelType: this.floatLabelType,
                    properties: { placeholder: this.filterBarPlaceholder },
                    buttons: this.clearIconElement
                }, this.clearIconElement);
            }
            this.filterInputObj = null;
            if (!isNullOrUndefined(this.popupObj) &&
                !isNullOrUndefined(this.popupObj.element.querySelector('.e-fixed-head'))) {
                const fixedHeader = this.popupObj.element.querySelector('.e-fixed-head');
                fixedHeader.parentNode.removeChild(fixedHeader);
                this.fixedHeaderElement = null;
            }
            if (!eventArgs.cancel) {
                if (this.getModuleName() === 'autocomplete') {
                    this.rippleFun();
                }
                if (this.isPopupOpen) {
                    this.isPopupRender = false;
                    this.popupObj.hide(new Animation(eventArgs.animation));
                }
                else {
                    this.destroyPopup();
                }
            }
        });
        if (Browser.isDevice && !eventArgs.cancel && this.popupObj.element.classList.contains('e-wide-popup')) {
            this.popupObj.element.classList.remove('e-wide-popup');
        }
        let dataSourceCount;
        if (this.dataSource instanceof DataManager) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dataSourceCount = this.virtualGroupDataSource && this.virtualGroupDataSource.length ?
                this.virtualGroupDataSource.length : 0;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dataSourceCount = this.dataSource && this.dataSource.length ? this.dataSource.length : 0;
        }
        this.customFilterQuery = null;
        if (this.enableVirtualization && this.isFiltering() && isFilterValue && this.totalItemCount !== dataSourceCount) {
            this.updateInitialData();
            this.checkAndResetCache();
        }
    }
    updateInitialData() {
        const currentData = this.selectData;
        if (isNullOrUndefined(currentData)) {
            return;
        }
        const ulElement = this.renderItems(currentData, this.fields);
        this.list.scrollTop = 0;
        this.virtualListInfo = {
            currentPageNumber: null,
            direction: null,
            sentinelInfo: {},
            offsets: {},
            startIndex: 0,
            endIndex: this.itemCount
        };
        if (this.getModuleName() === 'combobox') {
            this.typedString = '';
        }
        this.previousStartIndex = 0;
        this.previousEndIndex = 0;
        if (this.dataSource instanceof DataManager) {
            if (this.remoteDataCount >= 0) {
                this.totalItemCount = this.dataCount = this.remoteDataCount;
            }
            else {
                this.resetList(this.dataSource);
            }
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.totalItemCount = this.dataCount = this.dataSource && this.dataSource.length ? this.dataSource.length : 0;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.list.getElementsByClassName('e-virtual-ddl')[0]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.list.getElementsByClassName('e-virtual-ddl')[0].style = this.GetVirtualTrackHeight();
        }
        else if (!this.list.querySelector('.e-virtual-ddl') && this.list.parentElement) {
            const virualElement = this.createElement('div', {
                id: this.element.id + '_popup',
                className: 'e-virtual-ddl'
            });
            virualElement.style.cssText = this.GetVirtualTrackHeight();
            this.list.parentElement.querySelector('.e-dropdownbase').appendChild(virualElement);
        }
        if (this.getModuleName() !== 'autocomplete' && this.totalItemCount !== 0 && this.totalItemCount > (this.itemCount * 2)) {
            this.getSkeletonCount();
        }
        this.UpdateSkeleton();
        this.listData = currentData;
        this.updateActionCompleteDataValues(ulElement, currentData);
        this.liCollections = this.list.querySelectorAll('.e-list-item');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.list.getElementsByClassName('e-virtual-ddl-content')[0]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.list.getElementsByClassName('e-virtual-ddl-content')[0].style = this.getTransformValues();
        }
    }
    destroyPopup() {
        this.isPopupOpen = false;
        this.isFilterFocus = false;
        this.inputElement.removeAttribute('aria-controls');
        if (this.popupObj) {
            if (this.resizer) {
                EventHandler.remove(this.resizer, 'mousedown', this.startResizing);
                EventHandler.remove(this.resizer, 'touchstart', this.startResizing);
            }
            this.popupObj.destroy();
            detach(this.popupObj.element);
        }
    }
    clickOnBackIcon() {
        this.hidePopup();
        this.focusIn();
    }
    /**
     * To Initialize the control rendering
     *
     * @private
     * @returns {void}
     */
    render() {
        this.preselectedIndex = !isNullOrUndefined(this.index) ? this.index : null;
        if (this.element.tagName === 'INPUT') {
            this.inputElement = this.element;
            if (isNullOrUndefined(this.inputElement.getAttribute('role'))) {
                this.inputElement.setAttribute('role', 'combobox');
            }
            if (isNullOrUndefined(this.inputElement.getAttribute('type'))) {
                this.inputElement.setAttribute('type', 'text');
            }
            this.inputElement.setAttribute('aria-expanded', 'false');
        }
        else {
            this.inputElement = this.createElement('input', { attrs: { role: 'combobox', type: 'text' } });
            if (this.element.tagName !== this.getNgDirective()) {
                this.element.style.display = 'none';
            }
            this.element.parentElement.insertBefore(this.inputElement, this.element);
            this.preventTabIndex(this.inputElement);
        }
        let updatedCssClassValues = this.cssClass;
        if (!isNullOrUndefined(this.cssClass) && this.cssClass !== '') {
            updatedCssClassValues = (this.cssClass.replace(/\s+/g, ' ')).trim();
        }
        if (!isNullOrUndefined(closest(this.element, 'fieldset')) &&
            closest(this.element, 'fieldset').disabled) {
            this.enabled = false;
        }
        this.inputWrapper = Input.createInput({
            element: this.inputElement,
            buttons: this.isPopupButton() ? [dropDownListClasses.icon] : null,
            floatLabelType: this.floatLabelType,
            properties: {
                readonly: this.getModuleName() === 'dropdownlist' ? true : this.readonly,
                placeholder: this.placeholder,
                cssClass: updatedCssClassValues,
                enabled: this.enabled,
                enableRtl: this.enableRtl,
                showClearButton: this.showClearButton
            }
        }, this.createElement);
        if (this.element.tagName === this.getNgDirective()) {
            this.element.appendChild(this.inputWrapper.container);
        }
        else {
            this.inputElement.parentElement.insertBefore(this.element, this.inputElement);
        }
        this.hiddenElement = this.createElement('select', {
            attrs: {
                'aria-hidden': 'true',
                'tabindex': '-1',
                'class': dropDownListClasses.hiddenElement
            }
        });
        prepend([this.hiddenElement], this.inputWrapper.container);
        if (!this.hiddenElement.hasAttribute('aria-label')) {
            this.hiddenElement.setAttribute('aria-label', this.getModuleName());
        }
        this.validationAttribute(this.element, this.hiddenElement);
        this.setReadOnly();
        this.setFields();
        this.inputWrapper.container.style.width = formatUnit(this.width);
        this.inputWrapper.container.classList.add('e-ddl');
        if (this.floatLabelType !== 'Never') {
            Input.calculateWidth(this.inputElement, this.inputWrapper.container);
        }
        if (!isNullOrUndefined(this.inputWrapper.buttons[0]) &&
            this.inputWrapper.container.getElementsByClassName('e-float-text-content')[0] && this.floatLabelType !== 'Never') {
            this.inputWrapper.container.getElementsByClassName('e-float-text-content')[0].classList.add('e-icon');
        }
        this.wireEvent();
        this.tabIndex = this.element.hasAttribute('tabindex') ? this.element.getAttribute('tabindex') : '0';
        this.element.removeAttribute('tabindex');
        const id = this.element.getAttribute('id') ? this.element.getAttribute('id') : getUniqueID('ej2_dropdownlist');
        this.element.id = id;
        this.hiddenElement.id = id + '_hidden';
        this.targetElement().setAttribute('tabindex', this.tabIndex);
        if ((this.getModuleName() === 'autocomplete' || this.getModuleName() === 'combobox') && !this.readonly) {
            if (!this.inputElement.hasAttribute('aria-label')) {
                this.inputElement.setAttribute('aria-label', this.getModuleName());
            }
        }
        else if (this.getModuleName() === 'dropdownlist') {
            if (!this.targetElement().hasAttribute('aria-label')) {
                attributes(this.targetElement(), { 'aria-label': this.getModuleName() });
            }
            if (!this.inputElement.hasAttribute('aria-label')) {
                this.inputElement.setAttribute('aria-label', this.getModuleName());
            }
            this.inputElement.setAttribute('aria-expanded', 'false');
        }
        attributes(this.targetElement(), this.getAriaAttributes());
        this.updateDataAttribute(this.htmlAttributes);
        this.setHTMLAttributes();
        if (this.targetElement() === this.inputElement) {
            this.inputElement.removeAttribute('aria-labelledby');
        }
        if (this.value !== null || this.activeIndex !== null || this.text !== null) {
            if (this.enableVirtualization) {
                this.listItemHeight = this.getListHeight();
                this.getSkeletonCount();
                this.updateVirtualizationProperties(this.itemCount, this.allowFiltering);
                if (this.index !== null) {
                    this.activeIndex = this.index + this.skeletonCount;
                }
            }
            this.initValue();
            this.selectedValueInfo = this.viewPortInfo;
            if (this.enableVirtualization) {
                this.activeIndex = this.activeIndex + this.skeletonCount;
            }
        }
        else if (this.element.tagName === 'SELECT' && this.element.options[0]) {
            const selectElement = this.element;
            this.value = this.allowObjectBinding ? this.getDataByValue(selectElement.options[selectElement.selectedIndex].value) :
                selectElement.options[selectElement.selectedIndex].value;
            this.text = isNullOrUndefined(this.value) ? null : selectElement.options[selectElement.selectedIndex].textContent;
            this.initValue();
        }
        this.setEnabled();
        this.preventTabIndex(this.element);
        if (!this.enabled) {
            this.targetElement().tabIndex = -1;
        }
        this.initial = false;
        this.element.style.opacity = '';
        this.inputElement.onselect = (e) => {
            e.stopImmediatePropagation();
        };
        this.inputElement.onchange = (e) => {
            e.stopImmediatePropagation();
        };
        if (this.element.hasAttribute('autofocus')) {
            this.focusIn();
        }
        if (!isNullOrUndefined(this.text)) {
            this.inputElement.setAttribute('value', this.text);
        }
        if (this.element.hasAttribute('data-val')) {
            this.element.setAttribute('data-val', 'false');
        }
        const floatLabelElement = this.inputWrapper.container.getElementsByClassName('e-float-text')[0];
        if (!isNullOrUndefined(this.element.id) && this.element.id !== '' && !isNullOrUndefined(floatLabelElement)) {
            floatLabelElement.id = 'label_' + this.element.id.replace(/ /g, '_');
            attributes(this.inputElement, { 'aria-labelledby': floatLabelElement.id });
        }
        this.renderComplete();
        this.listItemHeight = this.getListHeight();
        this.getSkeletonCount();
        if (this.enableVirtualization) {
            this.updateVirtualizationProperties(this.itemCount, this.allowFiltering);
        }
        this.viewPortInfo.startIndex = this.virtualItemStartIndex = 0;
        this.viewPortInfo.endIndex = this.virtualItemEndIndex = this.viewPortInfo.startIndex > 0 ?
            this.viewPortInfo.endIndex : this.itemCount;
    }
    getListHeight() {
        const listParent = this.createElement('div', {
            className: 'e-dropdownbase'
        });
        const item = this.createElement('li', {
            className: 'e-list-item'
        });
        const listParentHeight = formatUnit(this.popupHeight);
        listParent.style.height = (parseInt(listParentHeight, 10)).toString() + 'px';
        listParent.appendChild(item);
        document.body.appendChild(listParent);
        this.virtualListHeight = listParent.getBoundingClientRect().height;
        const listItemHeight = Math.ceil(item.getBoundingClientRect().height) +
            parseInt(window.getComputedStyle(item).marginBottom, 10);
        listParent.remove();
        return listItemHeight;
    }
    setFooterTemplate(popupEle) {
        let compiledString;
        if (this.footer) {
            if (this.isReact && typeof this.footerTemplate === 'function') {
                this.clearTemplate(['footerTemplate']);
            }
            else {
                this.footer.innerHTML = '';
            }
        }
        else {
            this.footer = this.createElement('div');
            addClass([this.footer], dropDownListClasses.footer);
        }
        const footercheck = this.dropdownCompiler(this.footerTemplate);
        if (typeof this.footerTemplate !== 'function' && footercheck) {
            compiledString = compile(select(this.footerTemplate, document).innerHTML.trim());
        }
        else {
            compiledString = compile(this.footerTemplate);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const footerCompTemp = compiledString({}, this, 'footerTemplate', this.footerTemplateId, this.isStringTemplate, null, this.footer);
        if (footerCompTemp && footerCompTemp.length > 0) {
            append(footerCompTemp, this.footer);
        }
        append([this.footer], popupEle);
    }
    setHeaderTemplate(popupEle) {
        let compiledString;
        if (this.header) {
            this.header.innerHTML = '';
        }
        else {
            this.header = this.createElement('div');
            addClass([this.header], dropDownListClasses.header);
        }
        const headercheck = this.dropdownCompiler(this.headerTemplate);
        if (typeof this.headerTemplate !== 'function' && headercheck) {
            compiledString = compile(select(this.headerTemplate, document).innerHTML.trim());
        }
        else {
            compiledString = compile(this.headerTemplate);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const headerCompTemp = compiledString({}, this, 'headerTemplate', this.headerTemplateId, this.isStringTemplate, null, this.header);
        if (headerCompTemp && headerCompTemp.length) {
            append(headerCompTemp, this.header);
        }
        const contentEle = popupEle.querySelector('div.e-content');
        popupEle.insertBefore(this.header, contentEle);
    }
    /**
     * Sets the enabled state to DropDownBase.
     *
     * @returns {void}
     */
    setEnabled() {
        this.element.setAttribute('aria-disabled', (this.enabled) ? 'false' : 'true');
    }
    setOldText(text) {
        this.text = text;
    }
    setOldValue(value) {
        this.value = value;
    }
    refreshPopup() {
        if (!isNullOrUndefined(this.popupObj) && document.body.contains(this.popupObj.element) &&
            ((this.allowFiltering && !(Browser.isDevice && this.isFilterLayout())) || this.getModuleName() === 'autocomplete')) {
            removeClass([this.popupObj.element], 'e-popup-close');
            this.popupObj.refreshPosition(this.inputWrapper.container);
            this.popupObj.resolveCollision();
        }
    }
    checkData(newProp) {
        if (newProp.dataSource && !isNullOrUndefined(Object.keys(newProp.dataSource)) && this.itemTemplate && this.allowFiltering &&
            !(this.isListSearched && (newProp.dataSource instanceof DataManager))) {
            if (this.list && !(this.isReact)) {
                this.list.innerHTML = '';
            }
            else {
                this.list = null;
            }
            this.actionCompleteData = { ulElement: null, list: null, isUpdated: false };
        }
        this.isListSearched = false;
        const isChangeValue = Object.keys(newProp).indexOf('value') !== -1 && isNullOrUndefined(newProp.value);
        const isChangeText = Object.keys(newProp).indexOf('text') !== -1 && isNullOrUndefined(newProp.text);
        if (this.getModuleName() !== 'autocomplete' && this.allowFiltering && (isChangeValue || isChangeText)) {
            this.itemData = null;
        }
        if (this.allowFiltering && newProp.dataSource && !isNullOrUndefined(Object.keys(newProp.dataSource))) {
            this.actionCompleteData = { ulElement: null, list: null, isUpdated: false };
            this.actionData = this.actionCompleteData;
        }
        else if (this.allowFiltering && newProp.query && !isNullOrUndefined(Object.keys(newProp.query))) {
            this.actionCompleteData = this.getModuleName() === 'combobox' ?
                { ulElement: null, list: null, isUpdated: false } : this.actionCompleteData;
            this.actionData = this.actionCompleteData;
        }
    }
    updateDataSource(props, oldProps) {
        if (this.inputElement.value !== '' || (!isNullOrUndefined(props) && (isNullOrUndefined(props.dataSource)
            || (!(props.dataSource instanceof DataManager) && props.dataSource.length === 0)))) {
            this.clearAll(null, props);
        }
        if ((this.fields.groupBy && props.fields) && !this.isGroupChecking && this.list) {
            EventHandler.remove(this.list, 'scroll', this.setFloatingHeader);
            EventHandler.add(this.list, 'scroll', this.setFloatingHeader, this);
        }
        if (!(!isNullOrUndefined(props) && (isNullOrUndefined(props.dataSource)
            || (!(props.dataSource instanceof DataManager) && props.dataSource.length === 0))) ||
            ((props.dataSource instanceof DataManager) || (!isNullOrUndefined(props) && Array.isArray(props.dataSource) &&
                !isNullOrUndefined(oldProps) && Array.isArray(oldProps.dataSource) && props.dataSource.length !== oldProps.dataSource.length))) {
            this.typedString = '';
            this.resetList(this.dataSource);
        }
        if (!this.isCustomFilter && !this.isFilterFocus && document.activeElement !== this.filterInput) {
            this.checkCustomValue();
        }
    }
    checkCustomValue() {
        const currentValue = this.allowObjectBinding && !isNullOrUndefined(this.value) ?
            getValue((this.fields.value) ? this.fields.value : '', this.value) : this.value;
        this.itemData = this.getDataByValue(currentValue);
        const dataItem = this.getItemData();
        const value = this.allowObjectBinding ? this.itemData : dataItem.value;
        const index = isNullOrUndefined(value) ? null : this.index;
        if ((isNullOrUndefined(index) && (currentValue === value)) || this.isAngular) {
            this.setProperties({ 'text': dataItem.text ? dataItem.text.toString() : dataItem.text, 'value': value });
        }
        else {
            this.setProperties({ 'text': dataItem.text ? dataItem.text.toString() : dataItem.text, 'index': index, 'value': value });
        }
    }
    updateInputFields() {
        if (this.getModuleName() === 'dropdownlist') {
            Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
        }
    }
    /**
     * Dynamically change the value of properties.
     *
     * @private
     * @param {DropDownListModel} newProp - Returns the dynamic property value of the component.
     * @param {DropDownListModel} oldProp - Returns the previous previous value of the component.
     * @returns {void}
     */
    onPropertyChanged(newProp, oldProp) {
        if (!isNullOrUndefined(newProp.dataSource) && !this.isTouched && (isNullOrUndefined(newProp.value) &&
            isNullOrUndefined(newProp.index)) && !isNullOrUndefined(this.preselectedIndex) && !isNullOrUndefined(this.index)) {
            newProp.index = this.index;
        }
        if (!isNullOrUndefined(newProp.value) || !isNullOrUndefined(newProp.index)) {
            this.isTouched = true;
        }
        if (this.getModuleName() === 'dropdownlist') {
            this.checkData(newProp);
            this.setUpdateInitial(['fields', 'query', 'dataSource'], newProp);
        }
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'query':
                case 'dataSource':
                    this.getSkeletonCount();
                    this.checkAndResetCache();
                    break;
                case 'htmlAttributes':
                    this.setHTMLAttributes();
                    break;
                case 'width':
                    this.setEleWidth(newProp.width);
                    Input.calculateWidth(this.inputElement, this.inputWrapper.container);
                    break;
                case 'placeholder':
                    Input.setPlaceholder(newProp.placeholder, this.inputElement);
                    break;
                case 'filterBarPlaceholder':
                    if (this.filterInput) {
                        Input.setPlaceholder(newProp.filterBarPlaceholder, this.filterInput);
                    }
                    break;
                case 'readonly':
                    if (this.getModuleName() !== 'dropdownlist') {
                        Input.setReadonly(newProp.readonly, this.inputElement);
                    }
                    this.setReadOnly();
                    break;
                case 'cssClass':
                    this.setCssClass(newProp.cssClass, oldProp.cssClass);
                    Input.calculateWidth(this.inputElement, this.inputWrapper.container);
                    break;
                case 'enableRtl':
                    this.setEnableRtl();
                    break;
                case 'enabled':
                    this.setEnable();
                    break;
                case 'text':
                    if (this.fields.disabled) {
                        newProp.text = newProp.text && !this.isDisabledItemByIndex(this.getIndexByValue(this.getValueByText(newProp.text)))
                            ? newProp.text : null;
                    }
                    if (newProp.text === null) {
                        this.clearAll();
                        break;
                    }
                    if (this.enableVirtualization) {
                        this.updateValues();
                        this.updateInputFields();
                        this.notify('setCurrentViewDataAsync', {
                            module: 'VirtualScroll'
                        });
                        break;
                    }
                    if (!this.list) {
                        if (this.dataSource instanceof DataManager) {
                            this.initialRemoteRender = true;
                        }
                        this.renderList();
                    }
                    if (!this.initialRemoteRender) {
                        const li = this.getElementByText(newProp.text);
                        if (!this.checkValidLi(li)) {
                            if (this.liCollections && this.liCollections.length === 100 &&
                                this.getModuleName() === 'autocomplete' && this.listData.length > 100) {
                                this.setSelectionData(newProp.text, oldProp.text, 'text');
                            }
                            else if (newProp.text && this.dataSource instanceof DataManager) {
                                const listLength = this.getItems().length;
                                const checkField = isNullOrUndefined(this.fields.text) ? this.fields.value : this.fields.text;
                                this.typedString = '';
                                this.dataSource.executeQuery(this.getQuery(this.query).where(new Predicate(checkField, 'equal', newProp.text)))
                                    .then((e) => {
                                    if (e.result.length > 0) {
                                        this.addItem(e.result, listLength);
                                        this.updateValues();
                                    }
                                    else {
                                        this.setOldText(oldProp.text);
                                    }
                                });
                            }
                            else if (this.getModuleName() === 'autocomplete') {
                                this.setInputValue(newProp, oldProp);
                            }
                            else {
                                this.setOldText(oldProp.text);
                            }
                        }
                        this.updateInputFields();
                    }
                    break;
                case 'value':
                    if (this.fields.disabled) {
                        newProp.value = newProp.value != null && !this.isDisableItemValue(newProp.value) ? newProp.value : null;
                    }
                    if (newProp.value === null) {
                        this.clearAll();
                        break;
                    }
                    if (this.allowObjectBinding && !isNullOrUndefined(newProp.value) && !isNullOrUndefined(oldProp.value) &&
                        this.isObjectInArray(newProp.value, [oldProp.value])) {
                        return;
                    }
                    if (this.enableVirtualization) {
                        this.updateValues();
                        this.updateInputFields();
                        this.notify('setCurrentViewDataAsync', {
                            module: 'VirtualScroll'
                        });
                        this.preventChange = this.isAngular && this.preventChange ? !this.preventChange : this.preventChange;
                        break;
                    }
                    this.notify('beforeValueChange', { newProp: newProp }); // gird component value type change
                    if (!this.list) {
                        if (this.dataSource instanceof DataManager) {
                            this.initialRemoteRender = true;
                        }
                        this.renderList();
                    }
                    if (!this.initialRemoteRender) {
                        const value = this.allowObjectBinding && !isNullOrUndefined(newProp.value) ?
                            getValue((this.fields.value) ? this.fields.value : '', newProp.value) : newProp.value;
                        const item = this.getElementByValue(value);
                        if (!this.checkValidLi(item)) {
                            if (this.liCollections && this.liCollections.length === 100 &&
                                this.getModuleName() === 'autocomplete' && this.listData.length > 100) {
                                this.setSelectionData(newProp.value, oldProp.value, 'value');
                            }
                            else if (newProp.value && this.dataSource instanceof DataManager) {
                                const listLength = this.getItems().length;
                                const checkField = isNullOrUndefined(this.fields.value) ? this.fields.text : this.fields.value;
                                this.typedString = '';
                                const value = this.allowObjectBinding && !isNullOrUndefined(newProp.value) ?
                                    getValue(checkField, newProp.value) : newProp.value;
                                this.dataSource.executeQuery(this.getQuery(this.query).where(new Predicate(checkField, 'equal', value)))
                                    .then((e) => {
                                    if (e.result.length > 0) {
                                        this.addItem(e.result, listLength);
                                        this.updateValues();
                                    }
                                    else {
                                        this.setOldValue(oldProp.value);
                                    }
                                });
                            }
                            else if (this.getModuleName() === 'autocomplete') {
                                this.setInputValue(newProp, oldProp);
                            }
                            else {
                                this.setOldValue(oldProp.value);
                            }
                        }
                        this.updateInputFields();
                        this.preventChange = this.isAngular && this.preventChange ? !this.preventChange : this.preventChange;
                    }
                    break;
                case 'index':
                    if (this.fields.disabled) {
                        newProp.index = newProp.index != null && !this.isDisabledItemByIndex(newProp.index) ? newProp.index : null;
                    }
                    if (newProp.index === null) {
                        this.clearAll();
                        break;
                    }
                    if (!this.list) {
                        if (this.dataSource instanceof DataManager) {
                            this.initialRemoteRender = true;
                        }
                        this.renderList();
                    }
                    if (!this.initialRemoteRender && this.liCollections) {
                        const element = this.liCollections[newProp.index];
                        if (!this.checkValidLi(element)) {
                            if (this.liCollections && this.liCollections.length === 100 &&
                                this.getModuleName() === 'autocomplete' && this.listData.length > 100) {
                                this.setSelectionData(newProp.index, oldProp.index, 'index');
                            }
                            else {
                                this.index = oldProp.index;
                            }
                        }
                        this.updateInputFields();
                    }
                    break;
                case 'footerTemplate':
                    if (this.popupObj) {
                        this.setFooterTemplate(this.popupObj.element);
                    }
                    break;
                case 'headerTemplate':
                    if (this.popupObj) {
                        this.setHeaderTemplate(this.popupObj.element);
                    }
                    break;
                case 'valueTemplate':
                    if (!isNullOrUndefined(this.itemData) && this.valueTemplate !== null) {
                        this.setValueTemplate();
                    }
                    break;
                case 'allowFiltering':
                    if (this.allowFiltering) {
                        this.actionCompleteData = {
                            ulElement: this.ulElement,
                            list: this.listData, isUpdated: true
                        };
                        this.actionData = this.actionCompleteData;
                        this.updateSelectElementData(this.allowFiltering);
                    }
                    break;
                case 'floatLabelType':
                    Input.removeFloating(this.inputWrapper);
                    Input.addFloating(this.inputElement, newProp.floatLabelType, this.placeholder, this.createElement);
                    if (!isNullOrUndefined(this.inputWrapper.buttons[0]) &&
                        this.inputWrapper.container.getElementsByClassName('e-float-text-overflow')[0] && this.floatLabelType !== 'Never') {
                        this.inputWrapper.container.getElementsByClassName('e-float-text-overflow')[0].classList.add('e-icon');
                    }
                    break;
                case 'showClearButton':
                    if (!this.inputWrapper.clearButton) {
                        Input.setClearButton(newProp.showClearButton, this.inputElement, this.inputWrapper, null, this.createElement);
                        this.bindClearEvent();
                    }
                    break;
                default:
                    {
                        // eslint-disable-next-line max-len
                        const ddlProps = this.getPropObject(prop, newProp, oldProp);
                        super.onPropertyChanged(ddlProps.newProperty, ddlProps.oldProperty);
                    }
                    break;
            }
        }
    }
    checkValidLi(element) {
        if (this.isValidLI(element)) {
            this.setSelection(element, null);
            return true;
        }
        return false;
    }
    setSelectionData(newProp, oldProp, prop) {
        let li;
        this.updateListValues = () => {
            if (prop === 'text') {
                li = this.getElementByText(newProp);
                if (!this.checkValidLi(li)) {
                    this.setOldText(oldProp);
                }
            }
            else if (prop === 'value') {
                const fields = (this.fields.value) ? this.fields.value : '';
                const value = this.allowObjectBinding && !isNullOrUndefined(newProp) ?
                    getValue(fields, newProp) : newProp;
                li = this.getElementByValue(newProp);
                if (!this.checkValidLi(li)) {
                    this.setOldValue(oldProp);
                }
            }
            else if (prop === 'index') {
                li = this.liCollections[newProp];
                if (!this.checkValidLi(li)) {
                    this.index = oldProp;
                }
            }
        };
    }
    updatePopupState() {
        if (this.beforePopupOpen) {
            this.beforePopupOpen = false;
            this.showPopup();
        }
    }
    setReadOnly() {
        if (this.readonly) {
            addClass([this.inputWrapper.container], ['e-readonly']);
        }
        else {
            removeClass([this.inputWrapper.container], ['e-readonly']);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
    setInputValue(newProp, oldProp) {
    }
    setCssClass(newClass, oldClass) {
        if (!isNullOrUndefined(oldClass)) {
            oldClass = (oldClass.replace(/\s+/g, ' ')).trim();
        }
        if (!isNullOrUndefined(newClass)) {
            newClass = (newClass.replace(/\s+/g, ' ')).trim();
        }
        Input.setCssClass(newClass, [this.inputWrapper.container], oldClass);
        if (this.popupObj) {
            Input.setCssClass(newClass, [this.popupObj.element], oldClass);
        }
    }
    /**
     * Return the module name of this component.
     *
     * @private
     * @returns {string} Return the module name of this component.
     */
    getModuleName() {
        return 'dropdownlist';
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Opens the popup that displays the list of items.
     *
     * @returns {void}
     */
    showPopup(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        if (!this.enabled) {
            return;
        }
        if (this.getModuleName() === 'dropdownlist' && this.beforePopupOpen && !this.isPopupOpen) {
            this.beforePopupOpen = false;
        }
        this.firstItem = this.dataSource && this.dataSource.length > 0 ? this.dataSource[0] : null;
        if (this.isReact && this.getModuleName() === 'combobox' && this.itemTemplate && this.isCustomFilter && this.isAddNewItemTemplate) {
            this.renderList();
            this.isAddNewItemTemplate = false;
        }
        if (this.isFiltering() && this.dataSource instanceof DataManager && (this.actionData.list !== this.actionCompleteData.list) &&
            this.actionData.list && this.actionData.ulElement) {
            this.actionCompleteData = this.actionData;
            this.onActionComplete(this.actionCompleteData.ulElement, this.actionCompleteData.list, null, true);
        }
        if (this.beforePopupOpen) {
            this.refreshPopup();
            return;
        }
        this.beforePopupOpen = true;
        if (this.isFiltering() && !this.isActive && this.actionCompleteData.list && this.actionCompleteData.list[0]) {
            this.isActive = true;
            this.onActionComplete(this.actionCompleteData.ulElement, this.actionCompleteData.list, null, true);
        }
        else if (isNullOrUndefined(this.list) || !isUndefined(this.list) && (this.list.classList.contains(dropDownBaseClasses.noData) ||
            this.list.querySelectorAll('.' + dropDownBaseClasses.li).length <= 0)) {
            if (this.isReact && this.isFiltering() && this.itemTemplate != null) {
                this.isSecondClick = false;
            }
            this.renderList(e);
        }
        if (this.enableVirtualization && this.listData && this.listData.length) {
            if (!isNullOrUndefined(this.value) && (this.getModuleName() === 'dropdownlist' || this.getModuleName() === 'combobox')) {
                this.removeHover();
            }
            if (!this.beforePopupOpen) {
                this.notify('setCurrentViewDataAsync', {
                    module: 'VirtualScroll'
                });
            }
        }
        if (this.beforePopupOpen) {
            this.invokeRenderPopup(e);
        }
        if (this.enableVirtualization && !this.allowFiltering && this.selectedValueInfo != null &&
            this.selectedValueInfo.startIndex > 0 && this.value != null) {
            this.notify('dataProcessAsync', {
                module: 'VirtualScroll',
                isOpen: true
            });
        }
        if (!this.isSecondClick && !this.isDropDownClick) {
            this.executeCloneElements();
        }
    }
    executeCloneElements() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const proxy = this;
        const duration = (this.element.tagName === this.getNgDirective() && this.itemTemplate) ? 500 : 100;
        if (this.isReact && this.isFiltering() && this.itemTemplate != null) {
            setTimeout(() => {
                proxy.cloneElements();
                proxy.isSecondClick = proxy.isReact && proxy.isFiltering() && proxy.dataSource instanceof DataManager && !proxy.list.querySelector('ul') ? false : true;
            }, duration);
        }
    }
    invokeRenderPopup(e) {
        if (Browser.isDevice && this.isFilterLayout()) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const proxy = this;
            window.onpopstate = () => {
                proxy.hidePopup();
            };
            history.pushState({}, '');
        }
        if (!isNullOrUndefined(this.list) && (!isNullOrUndefined(this.list.children[0]) ||
            this.list.classList.contains(dropDownBaseClasses.noData))) {
            this.renderPopup(e);
        }
    }
    renderHightSearch() {
        // update high light search
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Hides the popup if it is in an open state.
     *
     * @returns {void}
     */
    hidePopup(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        if (this.isEscapeKey && this.getModuleName() === 'dropdownlist') {
            if (!isNullOrUndefined(this.inputElement)) {
                Input.setValue(this.text, this.inputElement, this.floatLabelType, this.showClearButton);
            }
            this.isEscapeKey = false;
            if (!isNullOrUndefined(this.index)) {
                const value = this.allowObjectBinding ? getValue((this.fields.value) ? this.fields.value : '', this.value) : this.value;
                const element = this.findListElement(this.ulElement, 'li', 'data-value', value);
                this.selectedLI = this.liCollections[this.index] || element;
                if (this.selectedLI) {
                    this.updateSelectedItem(this.selectedLI, null, true);
                    if (this.valueTemplate && this.itemData !== null) {
                        this.setValueTemplate();
                    }
                }
            }
            else {
                this.resetSelection();
            }
        }
        this.isVirtualTrackHeight = false;
        this.customFilterQuery = null;
        this.closePopup(0, e);
        const dataItem = this.getItemData();
        let isSelectVal = !isNullOrUndefined(this.selectedLI);
        if (isSelectVal && this.enableVirtualization && this.selectedLI.classList) {
            isSelectVal = this.selectedLI.classList.contains('e-active');
        }
        if (this.inputElement && this.inputElement.value === '' && !this.isInteracted && (this.isSelectCustom ||
            isSelectVal && this.inputElement.value !== dataItem.text)) {
            this.isSelectCustom = false;
            this.clearAll(e);
        }
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-param */
    /**
     * Sets the focus on the component for interaction.
     *
     * @returns {void}
     */
    focusIn(e) {
        if (!this.enabled) {
            return;
        }
        if (this.targetElement().classList.contains(dropDownListClasses.disable)) {
            return;
        }
        let isFocused = false;
        if (this.preventFocus && Browser.isDevice) {
            this.inputWrapper.container.tabIndex = 1;
            this.inputWrapper.container.focus();
            this.preventFocus = false;
            isFocused = true;
        }
        if (!isFocused) {
            this.targetElement().focus();
        }
        addClass([this.inputWrapper.container], [dropDownListClasses.inputFocus]);
        this.onFocus(e);
        if (this.floatLabelType !== 'Never') {
            Input.calculateWidth(this.inputElement, this.inputWrapper.container);
        }
    }
    /**
     * Moves the focus from the component if the component is already focused.
     *
     * @returns {void}
     */
    focusOut(e) {
        /* eslint-enable valid-jsdoc, jsdoc/require-param */
        if (!this.enabled) {
            return;
        }
        if (!this.enableVirtualization && (this.getModuleName() === 'combobox' || this.getModuleName() === 'autocomplete')) {
            this.isTyped = true;
        }
        this.hidePopup(e);
        if (this.targetElement()) {
            this.targetElement().blur();
        }
        removeClass([this.inputWrapper.container], [dropDownListClasses.inputFocus]);
        if (this.floatLabelType !== 'Never') {
            Input.calculateWidth(this.inputElement, this.inputWrapper.container);
        }
    }
    /**
     * Method to disable specific item in the popup.
     *
     * @param {string | number | object | HTMLLIElement} item - Specifies the item to be disabled.
     * @returns {void}
     * @deprecated
     */
    disableItem(item) {
        if (this.fields.disabled) {
            if (!this.list) {
                this.renderList();
            }
            let itemIndex = -1;
            if (this.liCollections && this.liCollections.length > 0 && this.listData && this.fields.disabled) {
                if (typeof (item) === 'string') {
                    itemIndex = this.getIndexByValue(item);
                }
                else if (typeof item === 'object') {
                    if (item instanceof HTMLLIElement) {
                        for (let index = 0; index < this.liCollections.length; index++) {
                            if (this.liCollections[index] === item) {
                                itemIndex = this.getIndexByValue(item.getAttribute('data-value'));
                                break;
                            }
                        }
                    }
                    else {
                        const value = JSON.parse(JSON.stringify(item))[this.fields.value];
                        for (let index = 0; index < this.listData.length; index++) {
                            if (JSON.parse(JSON.stringify(this.listData[index]))[this.fields.value] === value) {
                                itemIndex = this.getIndexByValue(value);
                                break;
                            }
                        }
                    }
                }
                else {
                    itemIndex = item;
                }
                const isValidIndex = itemIndex < this.liCollections.length && itemIndex > -1;
                if (isValidIndex && !(JSON.parse(JSON.stringify(this.listData[itemIndex]))[this.fields.disabled])) {
                    const li = this.liCollections[itemIndex];
                    if (li) {
                        this.disableListItem(li);
                        const parsedData = JSON.parse(JSON.stringify(this.listData[itemIndex]));
                        parsedData[this.fields.disabled] = true;
                        this.listData[itemIndex] = parsedData;
                        this.dataSource = this.listData;
                        if (li.classList.contains(dropDownListClasses.focus)) {
                            this.removeFocus();
                        }
                        if (li.classList.contains(dropDownListClasses.selected)) {
                            this.clear();
                        }
                    }
                }
            }
        }
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers. Also it removes the attributes and classes.
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        this.isActive = false;
        if (this.showClearButton) {
            this.clearButton = document.getElementsByClassName('e-clear-icon')[0];
        }
        resetIncrementalSearchValues(this.element.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this.isReact) {
            this.clearTemplate();
        }
        this.hidePopup();
        if (this.popupObj) {
            this.isPopupRender = false;
            this.popupObj.hide();
        }
        this.unWireEvent();
        if (this.list) {
            this.unWireListEvents();
        }
        if (this.element && !this.element.classList.contains('e-' + this.getModuleName())) {
            return;
        }
        if (this.inputElement) {
            const attrArray = ['readonly', 'aria-disabled', 'placeholder', 'aria-labelledby',
                'aria-expanded', 'autocomplete', 'aria-readonly', 'autocapitalize',
                'spellcheck', 'aria-autocomplete', 'aria-live', 'aria-describedby', 'aria-label'];
            for (let i = 0; i < attrArray.length; i++) {
                this.inputElement.removeAttribute(attrArray[i]);
            }
            this.inputElement.setAttribute('tabindex', this.tabIndex);
            this.inputElement.classList.remove('e-input');
            Input.setValue('', this.inputElement, this.floatLabelType, this.showClearButton);
        }
        this.element.removeAttribute('tabindex');
        this.element.style.display = 'block';
        if (this.inputWrapper.container && this.inputWrapper.container.parentElement) {
            if (this.inputWrapper.container.parentElement.tagName === this.getNgDirective()) {
                detach(this.inputWrapper.container);
            }
            else {
                this.inputWrapper.container.parentElement.insertBefore(this.element, this.inputWrapper.container);
                detach(this.inputWrapper.container);
            }
        }
        delete this.hiddenElement;
        this.filterInput = null;
        this.keyboardModule = null;
        this.ulElement = null;
        this.list = null;
        this.clearIconElement = null;
        this.popupObj = null;
        this.popupContentElement = null;
        this.rippleFun = null;
        this.selectedLI = null;
        this.liCollections = null;
        this.item = null;
        this.footer = null;
        this.header = null;
        this.previousSelectedLI = null;
        this.valueTempElement = null;
        this.actionData.ulElement = null;
        if (this.inputElement && !isNullOrUndefined(this.inputElement.onchange)) {
            this.inputElement.onchange = null;
        }
        if (this.inputElement && !isNullOrUndefined(this.inputElement.onselect)) {
            this.inputElement.onselect = null;
        }
        Input.destroy({
            element: this.inputElement,
            floatLabelType: this.floatLabelType,
            properties: this.properties,
            buttons: this.inputWrapper.container.querySelectorAll('.e-input-group-icon')[0]
        }, this.clearButton);
        this.clearButton = null;
        this.inputElement = null;
        this.inputWrapper = null;
        super.destroy();
    }
    /* eslint-disable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Gets all the list items bound on this component.
     *
     * @returns {Element[]}
     */
    getItems() {
        if (!this.list) {
            if (this.dataSource instanceof DataManager) {
                this.initialRemoteRender = true;
            }
            this.renderList();
        }
        return this.ulElement ? super.getItems() : [];
    }
    /**
     * Gets the data Object that matches the given value.
     *
     * @param { string | number } value - Specifies the value of the list item.
     * @returns {Object}
     */
    getDataByValue(value) {
        return super.getDataByValue(value);
    }
    /* eslint-enable valid-jsdoc, jsdoc/require-returns-description */
    /**
     * Allows you to clear the selected values from the component.
     *
     * @returns {void}
     */
    clear() {
        this.value = null;
    }
};
__decorate$1([
    Property(null)
], DropDownList.prototype, "cssClass", void 0);
__decorate$1([
    Property('100%')
], DropDownList.prototype, "width", void 0);
__decorate$1([
    Property(true)
], DropDownList.prototype, "enabled", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "enablePersistence", void 0);
__decorate$1([
    Property('300px')
], DropDownList.prototype, "popupHeight", void 0);
__decorate$1([
    Property('100%')
], DropDownList.prototype, "popupWidth", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "placeholder", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "filterBarPlaceholder", void 0);
__decorate$1([
    Property({})
], DropDownList.prototype, "htmlAttributes", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "query", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "valueTemplate", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "headerTemplate", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "footerTemplate", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "allowFiltering", void 0);
__decorate$1([
    Property(300)
], DropDownList.prototype, "debounceDelay", void 0);
__decorate$1([
    Property(true)
], DropDownList.prototype, "isDeviceFullScreen", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "readonly", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "enableVirtualization", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "allowResize", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "text", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "value", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "allowObjectBinding", void 0);
__decorate$1([
    Property(null)
], DropDownList.prototype, "index", void 0);
__decorate$1([
    Property('Never')
], DropDownList.prototype, "floatLabelType", void 0);
__decorate$1([
    Property(false)
], DropDownList.prototype, "showClearButton", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "filtering", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "change", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "beforeOpen", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "open", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "close", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "blur", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "focus", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "resizeStop", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "resizing", void 0);
__decorate$1([
    Event()
], DropDownList.prototype, "resizeStart", void 0);
DropDownList = __decorate$1([
    NotifyPropertyChanges
], DropDownList);

dropDownListClasses.root = 'e-combobox';
dropDownListClasses.root = 'e-autocomplete';
dropDownListClasses.icon = 'e-input-group-icon e-ddl-icon e-search-icon';

export {DropDownBase, DropDownList};
