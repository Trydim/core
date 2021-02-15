'use strict'

const getCustomElements = () => {
  let element;

  customElements.define('shadow-calc', class extends HTMLElement {
    connectedCallback() {
      element = this.attachShadow({ mode: 'open' });
    }
  });

  return element;
}

export class showerCalc {

  constructor() {
    this.customElements = getCustomElements();
    this.init();
  }

  init() {
    let shadowRoot = this.customElements,
        node = f.qS('#wrapCalcNode');

    shadowRoot.innerHTML = '';
    node.querySelectorAll('link[data-href]').forEach(n => n.href = n.dataset.href);
    shadowRoot.append(node);
    node.style.display = 'block';

    /*const template     = document.createElement('template');
     template.innerHTML = `<slot></slot><slot name="styles"></slot>`;
     this.shadowRoot.append(template.content.cloneNode(true));
     const style = this.shadowRoot.querySelector('slot').assignedNodes();
     this.shadowRoot.append(style[0]);*/
  }

}
