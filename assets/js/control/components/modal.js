// Модальное окно
//----------------------------------------------------------------------------------------------------------------------

import {c} from "../../const.js";
import {f} from "../func.js";

/**
 * Модальное окно
 * @var param = {modalId: string, template: string, showDefaultButton: bool, btnConfig: bool}
  */
export const Modal = (param = {}) => {
  let modal = Object.create(null),
      data = Object.create(null),
      {
        modalId = 'adminPopup',
        template = '',
        showDefaultButton = true,
        btnConfig = false,
      } = param;

  const findNode = (n, role) => n.querySelector(`[data-role="${role}"]`);

  modal.bindBtn = function () {
    this.wrap.querySelectorAll('.close-modal, .confirmYes, .closeBtn')
        .forEach(n => n.onclick = () => this.hide());
  }
  modal.btnConfig = function (key, param) {
    let node = this.wrap.querySelector('.' + key.replace('.', ''));
    node && param.value && (node.value = param.value);
  }
  modal.onEvent = function () {
    let func = function (e) {
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
   * @param title Nodes | string[]
   * @param content Nodes | string[]
   */
  modal.show = function (title, content = '') {
    this.title && title !== undefined && f.eraseNode(this.title).append(title);
    this.content && content && f.eraseNode(this.content).append(content);

    if (btnConfig) this.btnConfig(btnConfig);
    else this.btnField && !showDefaultButton && f.eraseNode(this.btnField);

    data.bodyOver = document.body.style.overflow;
    data.scrollY = Math.max(window.scrollY, window.pageYOffset, document.body.scrollTop);
    document.body.style.overflow = 'hidden';

    if (document.body.scrollHeight > window.innerHeight && window.innerWidth > 800) {
      data.bodyPaddingRight = document.body.style.paddingRight;
      document.body.style.paddingRight = '16px';
    }

    this.wrap.classList.add('active');
    this.window.classList.add('active');
    modal.onEvent();
  }

  modal.hide = function () {
    this.wrap.classList.remove('active');
    this.window.classList.remove('active');

    setTimeout( () => {
      document.body.style.overflow = data.bodyOver || 'initial';
      document.body.style.cssText = 'scroll-behavior: initial';
      window.scrollTo(0, data.scrollY);
      document.body.style.cssText = '';
      //document.body.style.scrollBehavior = 'smooth';
      if (document.body.scrollHeight > window.innerHeight)
        document.body.style.paddingRight = data.bodyPaddingRight || 'initial';
    }, 300);
    //c.eraseNode(modal.content);
  }

  modal.setTemplate = function () {
    const node = document.createElement('div');
    node.insertAdjacentHTML('afterbegin', template || templatePopup());

    this.wrap     = node.children[0];
    this.window   = findNode(node, 'window');
    this.title    = findNode(node, 'title');
    this.content  = findNode(node, 'content');
    this.btnField = findNode(node, 'bottomFieldBtn');

    //document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${c.SITE_PATH}core/assets/css/libs/modal.css">`);
    document.body.append(node.children[0]);
  }

  const templatePopup = () => {
    return `
    <div class="modal-overlay" id="${modalId}">
      <div class="modal p-15" data-role="window">
        <button type="button" class="close-modal">
          <span class="close-icon">✖</span>
        </button>
        <div class="modal-title" data-role="title">Title</div>
        <div class="w-100 pt-20" data-role="content"></div>
        <div class="modal-button" data-role="bottomFieldBtn">
          <input type="button" class="confirmYes btn btn-success" value="Подтвердить" data-action="confirmYes">
          <input type="button" class="closeBtn btn btn-warning" value="Отмена" data-action="confirmNo">
        </div>
      </div>
    </div>`;
  }



  modal.setTemplate();
  //btnConfig && modal.btnConfig(btnConfig);
  modal.bindBtn();

  return modal;
}
