'use strict';

/**
 * Global variables and simple functions
 */
export const c = {
  DEBUG: false,
  SITE_PATH: window['SITE_PATH'] || '/',
  MAIN_PHP_PATH: (window['SITE_PATH'] || '/') + 'index.php',
  PUBLIC_PAGE: (window['PUBLIC_PAGE'] || 'calculator'),

  CURRENT_EVENT: 'none',
  PHONE_MASK: '+7 (___) ___ __ __',

  // Global IDs
  // ------------------------------------------------------------------------------------------------
  ID: {
    AUTH_BLOCK: 'authBlock',
    POPUP: {
      title: 'popup_title',
    },
    PUBLIC_PAGE: 'publicPageLink'
  },

  CONST: {
    MODAL_DEF: 'modalDef',
  },

  CLASS_NAME: {
    SURFACE_FORM: 'active',

    // css класс который добавляется кнопкам сортировки
    SORT_BTN_CLASS: 'btn-light',
    // css класс который добавляется скрытым элементам
    HIDDEN_NODE: 'd-none',
    // css класс который добавляется неактивным элементам
    DISABLED_NODE: 'disabled',
    // css класс который добавляется при загрузке
    LOADING: 'loading-st1',
  },
};
