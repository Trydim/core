'use strict';

/**
 * Global variables and simple functions
 */
window.CMS_CONST = JSON.parse(window.CMS_CONST) || {};

export const c = {
  DEBUG        : window.CMS_CONST['DEBUG'] || false,
  CSV_DEVELOP  : !!window.CMS_CONST['CSV_DEVELOP'] || false,
  OUTSIDE      : window.CMS_CONST['CL_OUTSIDE'],
  SITE_PATH    : window.CMS_CONST['SITE_PATH'] || '/',
  MAIN_PHP_PATH: (window.CMS_CONST['SITE_PATH'] || '/') + 'index.php',
  PATH_IMG     : (window.CMS_CONST['PATH_IMG'] || 'public/images/'),
  AUTH_STATUS  : window.CMS_CONST['AUTH_STATUS'] || false,
  INIT_SETTING : window.CMS_CONST['INIT_SETTING'] || false,

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

  CLASS_NAME: {
    // css класс который добавляется активным элементам
    ACTIVE: 'active',
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
