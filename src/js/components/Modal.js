'use strict';

import './_modal.scss';

const findNode = (n, role) => n.querySelector(`[data-role="${role}"]`);

const getCustomElements = () => new Promise(resolve => {
  customElements.define('shadow-modal', class extends HTMLElement {
    connectedCallback() {
      resolve(this.attachShadow({mode: 'open'}));
    }
  });
});

const templatePopup = pr => {
  return `
    <div class="${pr}modal-overlay">
      <div class="${pr}modal" data-role="window">
        <div class="${pr}modal-header">
          <div class="${pr}modal-title" data-role="title">Title</div>
          <button type="button" class="${pr}modal-close" data-action="confirmNo">
            <div class="${pr}close-icon"></div>
          </button>
        </div>
        <div class="${pr}modal-content" data-role="content"></div>
        <div class="${pr}modal-footer" data-role="bottomFieldBtn">
          <input type="button" class="confirmYes btn btn-success" value="Подтвердить" data-action="confirmYes">
          <input type="button" class="closeBtn btn btn-warning" value="Отмена" data-action="confirmNo">
        </div>
      </div>
    </div>`;
};

/**
 * Модальное окно
 * @param param {{modalId: string,
 * template: string,
 * showDefaultButton: boolean,
 * btnConfig: boolean }}
 */
export const Modal = function (param = {}) {
  let modal = Object.create(null),
      data = Object.create(null),
      destroy = !(this instanceof Modal),
      {
        prefix = 'vs_',
        modalId = 'adminPopup' + f.random(),
        template = '',
        showDefaultButton = true,
        btnConfig = false,
      } = param;

  modal.setParam = function (param) {
    this.wrap.id = param.modalId || '';
    //this.window   =
    //this.title    =
    //this.content  =
    //this.btnField =

    if (this.btnConfirm && typeof param.beforeConfirm === 'function') this.btnConfirm.addEventListener('mousedown', param.beforeConfirm);
    if (this.btnCancel && typeof param.beforeCancel === 'function') this.btnCancel.addEventListener('mousedown', param.beforeCancel);
  }
  modal.bindBtn = function () {
    this.wrap.querySelectorAll(`.${prefix}modal-close, .confirmYes, .closeBtn`)
        .forEach(n => n.addEventListener('click', () => this.hide()));
  }
  modal.btnConfig = function (key, param = Object.create(null)) {
    let node = this.wrap.querySelector('.' + key.replace('.', ''));
    node && param && Object.entries(param).forEach(([k, v]) => {node[k] = v});
  }
  modal.onEvent = function () {
    const func = e => {
      if (e.key === 'Escape') {
        modal.hide();
        document.removeEventListener('keyup', func);
      }
    }
    document.addEventListener('keyup', func);
  }
  modal.querySelector = function (selector) { return this.wrap.querySelector(selector) }
  modal.querySelectorAll = function (selector) { return this.wrap.querySelectorAll(selector) }

  /**
   * Show modal window
   * @param {string|HTMLElement} title
   * @param {string|HTMLElement} content
   * @param {object} param
   * @param {string} param.modalId - add wrap id
   * @param {function} param.beforeConfirm - add wrap id
   * @param {function} param.beforeCancel - add wrap id
   */
  modal.show = function (title, content = '', param= {}) {
    if (this.title && title) {
      f.eraseNode(this.title);
      typeof title === 'string' ? this.title.insertAdjacentHTML('afterbegin', title)
                                : this.title.append(title);
    }
    if (this.content && content) {
      f.eraseNode(this.content);
      typeof content === 'string' ? this.content.insertAdjacentHTML('afterbegin', content)
                                  : this.content.append(content);
    }
    this.setParam(param);

    data.bodyOver = document.body.style.overflow;
    data.scrollY = Math.max(window.scrollY, window.pageYOffset, document.body.scrollTop);
    document.body.style.overflow = 'hidden';

    if (document.documentElement.getBoundingClientRect().height > window.innerHeight && window.innerWidth > 800) {
      data.bodyPaddingRight = document.body.style.paddingRight;
      document.body.style.paddingRight = '16px';
    }

    this.wrap.style.display = 'flex';
    setTimeout(() => {
      this.wrap.classList.add(prefix + 'active');
      this.window.classList.add(prefix + 'active');
    }, 10);

    this.onEvent();
  }

  modal.hide = function () {
    this.wrap.classList.remove(prefix + 'active');
    this.window.classList.remove(prefix + 'active');

    setTimeout(() => {
      document.body.style.overflow = data.bodyOver || 'initial';
      window.scrollTo(0, data.scrollY);
      if (document.body.style.paddingRight === '16px')
        document.body.style.paddingRight = data.bodyPaddingRight || 'initial';

      if (destroy) this.destroy();
      else this.wrap.style.display = 'none';
    }, 300);
    //f.eraseNode(modal.content);
  }

  modal.destroy = function () {
    /*this.wrap.querySelectorAll('.modal-close, .confirmYes, .closeBtn')
          .forEach(n => n.removeEventListener('click', () => this.hide()));
    */
    this.wrap.remove();
  }

  modal.setTemplate = function () {
    //const sNode = await getCustomElements();
    const node = document.createElement('div');
    node.insertAdjacentHTML('afterbegin', template || templatePopup(prefix, modalId));

    this.wrap     = node.firstElementChild;
    this.window   = findNode(node, 'window');
    this.title    = findNode(node, 'title');
    this.content  = findNode(node, 'content');
    this.btnField = findNode(node, 'bottomFieldBtn');

    if (btnConfig) this.btnConfig(btnConfig);
    else this.btnField && !showDefaultButton && f.eraseNode(this.btnField);

    let btnY = this.wrap.querySelector('.confirmYes, [data-action="confirmYes"], [data-target="confirmBtn"]'),
        btnN = this.wrap.querySelector('.closeBtn, [data-action="confirmNo"], [data-target="cancelBtn"]');
    btnY && (this.btnConfirm = btnY);
    btnN && (this.btnCancel = btnN);

    //sNode.insertAdjacentHTML('afterbegin', '');
    //sNode.append(this.wrap);
    this.bindBtn();
  }

  modal.setTemplate();
  modal.setParam(param);
  document.body.append(modal.wrap);
  //document.body.insertAdjacentHTML('beforeend', '<shadow-modal></shadow-modal>');

  return modal;
}
