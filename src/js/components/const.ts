'use strict';

/**
 * Global variables and simple functions
 */
// @ts-ignore
const cms = JSON.parse(window.CMS_CONST || '{}');

export default {
  DEBUG        : cms['DEBUG'] || false,
  CSV_DEVELOP  : !!cms['CSV_DEVELOP'] || false,
  OUTSIDE      : cms['CL_OUTSIDE'],
  SITE_PATH    : cms['SITE_PATH'] || '/',
  MAIN_PHP_PATH: (cms['SITE_PATH'] || '/') + 'index.php',

  /**
   * @var {string} PATH_IMG
   * @deprecated use URI_IMG
   */
  PATH_IMG     : (cms['URI_IMG'] || 'public/images/'), // для обратной совместимости
  URI_IMG      : (cms['URI_IMG'] || 'public/images/'),

  AUTH_STATUS  : cms['AUTH_STATUS'] || false,
  IS_DEAL      : cms['IS_DEAL'] || false,
  INIT_SETTING : cms['INIT_SETTING'] || false,

  PHONE_MASK_DEFAULT: '+_ (___) ___ __ __',

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
  },

  HOOKS: {},
  CMS_SETTING: {},
};
