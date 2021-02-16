// Модальное окно
//----------------------------------------------------------------------------------------------------------------------

import {c} from "../../const.js";
import {f} from "../func.js";

// Модальное окно
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

  /**
   * Show modal window
   * @param title Nodes | string[]
   * @param content Nodes | string[]
   */
  modal.show = function (title = '', content = '') {
    this.title && title && f.eraseNode(this.title).append(title);
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
          <span class="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
              <path d="M2.2,1.19l3.3,3.3L8.8,1.2C8.9314,1.0663,9.1127,0.9938,9.3,1C9.6761,1.0243,9.9757,1.3239,10,1.7&#xA;&#x9;c0.0018,0.1806-0.0705,0.3541-0.2,0.48L6.49,5.5L9.8,8.82C9.9295,8.9459,10.0018,9.1194,10,9.3C9.9757,9.6761,9.6761,9.9757,9.3,10&#xA;&#x9;c-0.1873,0.0062-0.3686-0.0663-0.5-0.2L5.5,6.51L2.21,9.8c-0.1314,0.1337-0.3127,0.2062-0.5,0.2C1.3265,9.98,1.02,9.6735,1,9.29&#xA;&#x9;C0.9982,9.1094,1.0705,8.9359,1.2,8.81L4.51,5.5L1.19,2.18C1.0641,2.0524,0.9955,1.8792,1,1.7C1.0243,1.3239,1.3239,1.0243,1.7,1&#xA;&#x9;C1.8858,0.9912,2.0669,1.06,2.2,1.19z"/>
            </svg>
           </span>
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
