import { Property, Component, isNullOrUndefined, getUniqueID, formatUnit, attributes, removeClass, NotifyPropertyChanges, addClass } from './ej2-base';

var __decorate$2 = function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const cssClassName = {
    TEXTSHAPE: 'e-skeleton-text',
    CIRCLESHAPE: 'e-skeleton-circle',
    SQUARESHAPE: 'e-skeleton-square',
    RECTANGLESHAPE: 'e-skeleton-rectangle',
    WAVEEFFECT: 'e-shimmer-wave',
    PULSEEFFECT: 'e-shimmer-pulse',
    FADEEFFECT: 'e-shimmer-fade',
    VISIBLENONE: 'e-visible-none'
};
/**
 * Defines the animation effect of Skeleton.
 */
/**
 * The Shimmer is a placeholder that animates a shimmer effect to let users know that the page’s content is loading at the moment.
 * In other terms, it simulates the layout of page content while loading the actual content.
 * ```html
 * <div id="skeletonCircle"></div>
 * ```
 * ```typescript
 * <script>
 * var skeletonObj = new Skeleton({ shape: 'Circle', width: "2rem" });
 * skeletonObj.appendTo("#skeletonCircle");
 * </script>
 * ```
 */
let Skeleton = class Skeleton extends Component {
    /**
     * Constructor for creating Skeleton component.
     *
     * @param {SkeletonModel} options - Defines the model of Skeleton class.
     * @param {HTMLElement} element - Defines the target HTML element.
     */
    constructor(options, element) {
        super(options, element);
    }
    /**
     * Get component module name.
     *
     * @returns {string} - Module name
     * @private
     */
    getModuleName() {
        return 'skeleton';
    }
    getPersistData() {
        return this.addOnPersist([]);
    }
    preRender() {
        if (!this.element.id) {
            this.element.id = getUniqueID('e-' + this.getModuleName());
        }
        this.updateCssClass();
        attributes(this.element, { role: 'alert', 'aria-busy': 'true', 'aria-live': 'polite', 'aria-label': this.label });
    }
    /**
     * Method for initialize the component rendering.
     *
     * @returns {void}
     * @private
     */
    render() {
        this.initialize();
    }
    onPropertyChanged(newProp, oldProp) {
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
                case 'width':
                case 'height':
                    this.updateDimension();
                    break;
                case 'shape':
                    this.updateShape();
                    break;
                case 'shimmerEffect':
                    this.updateEffect();
                    break;
                case 'visible':
                    this.updateVisibility();
                    break;
                case 'label':
                    this.element.setAttribute('aria-label', this.label);
                    break;
                case 'cssClass':
                    if (oldProp.cssClass) {
                        removeClass([this.element], oldProp.cssClass.split(' '));
                    }
                    this.updateCssClass();
                    break;
            }
        }
    }
    /**
     * Method to destroys the Skeleton component.
     *
     * @returns {void}
     */
    destroy() {
        super.destroy();
        const attrs = ['role', 'aria-live', 'aria-busy', 'aria-label'];
        let cssClass = [];
        if (this.cssClass) {
            cssClass = cssClass.concat(this.cssClass.split(' '));
        }
        for (let i = 0; i < attrs.length; i++) {
            this.element.removeAttribute(attrs[parseInt(i.toString(), 10)]);
        }
        cssClass = cssClass.concat(this.element.classList.value.match(/(e-skeleton-[^\s]+)/g) || []);
        cssClass = cssClass.concat(this.element.classList.value.match(/(e-shimmer-[^\s]+)/g) || []);
        removeClass([this.element], cssClass);
    }
    initialize() {
        this.updateShape();
        this.updateEffect();
        this.updateVisibility();
    }
    updateShape() {
        if (!(isNullOrUndefined(this.shape))) {
            const shapeCss = cssClassName[this.shape.toUpperCase() + 'SHAPE'];
            const removeCss = (this.element.classList.value.match(/(e-skeleton-[^\s]+)/g) || []);
            this.updateDimension();
            if (removeCss) {
                removeClass([this.element], removeCss);
            }
            addClass([this.element], [shapeCss]);
        }
    }
    updateDimension() {
        const width = (!this.width && (['Text', 'Rectangle'].indexOf(this.shape) > -1)) ? '100%' : formatUnit(this.width);
        const height = ['Circle', 'Square'].indexOf(this.shape) > -1 ? width : formatUnit(this.height);
        this.element.style.width = width;
        this.element.style.height = height;
    }
    updateEffect() {
        const removeCss = (this.element.classList.value.match(/(e-shimmer-[^\s]+)/g) || []);
        if (removeCss) {
            removeClass([this.element], removeCss);
        }
        if (!(isNullOrUndefined(this.shimmerEffect))) {
            addClass([this.element], [cssClassName[this.shimmerEffect.toUpperCase() + 'EFFECT']]);
        }
    }
    updateVisibility() {
        this.element.classList[this.visible ? 'remove' : 'add'](cssClassName.VISIBLENONE);
    }
    updateCssClass() {
        if (this.cssClass) {
            addClass([this.element], this.cssClass.split(' '));
        }
    }
};
__decorate$2([
    Property('')
], Skeleton.prototype, "width", void 0);
__decorate$2([
    Property('')
], Skeleton.prototype, "height", void 0);
__decorate$2([
    Property(true)
], Skeleton.prototype, "visible", void 0);
__decorate$2([
    Property('Text')
], Skeleton.prototype, "shape", void 0);
__decorate$2([
    Property('Wave')
], Skeleton.prototype, "shimmerEffect", void 0);
__decorate$2([
    Property('Loading...')
], Skeleton.prototype, "label", void 0);
__decorate$2([
    Property('')
], Skeleton.prototype, "cssClass", void 0);
Skeleton = __decorate$2([
    NotifyPropertyChanges
], Skeleton);

export { Skeleton };
