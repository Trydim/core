<?php

class VC {
  /** Cms Const */
  const PUBLIC_PAGE     = 'PUBLIC_PAGE',
        USE_DATABASE    = 'USE_DATABASE',
        CHANGE_DATABASE = 'CHANGE_DATABASE',
        URI_IMG_CONST   = 'URI_IMG';

  /** cmsParams */
  const DB_CONFIG   = 'dbConfig',
        ONLY_LOGIN  = 'onlyLogin',
        CSV_PATH    = 'csvPath',
        LEGEND_PATH = 'legendPath',
        IMG_PATH    = 'imgPath',
        URI_IMG     = 'uriImg',
        URI_CSS     = 'uriCss',
        URI_JS      = 'uriJs',
        DEAL_URI_CSS = 'dealUriCss',
        DEAL_URI_JS  = 'dealUriJs';

  /** userField */
  const USER_ID = 'id',
        USER_IS_ADMIN   = 'admin',
        USER_LOGIN      = 'login',
        USER_NAME       = 'name',
        USER_ONLY_ONE   = 'onlyOne',
        USER_PERMISSION = 'permission';

  /** Base views field */
  const BASE_GLOBAL           = 'global',
        BASE_PAGE_TITLE       = 'pageTitle',
        BASE_HEAD_CONTENT     = 'headContent',
        BASE_PAGE_HEADER      = 'pageHeader',
        BASE_SIDE_LEFT        = 'sideLeft',
        BASE_CONTENT          = 'content',
        BASE_SIDE_RIGHT       = 'sideRight',
        BASE_PAGE_FOOTER      = 'pageFooter',
        BASE_FOOTER_CONTENT   = 'footerContent',
        BASE_FOOTER_CONTENT_2 = 'footerContentBase',
        BASE_CSS_LINKS        = 'cssLinks',
        BASE_JS_LINKS         = 'jsLinks';

  const CONTROLLER_FIELD_POSITION_BEFORE = 'before',
        CONTROLLER_FIELD_POSITION_AFTER = 'after';

  /** Setting */
  const MAIL_TARGET      = 'mailTarget',
        MAIL_TARGET_COPY = 'mailTargetCopy',
        MAIL_SUBJECT     = 'mailSubject',
        MAIL_FROM_NAME   = 'mailFromName',

        MANAGER_FIELDS = 'managerFields',
        STATUS_DEFAULT = 'statusDefault',
        PHONE_MASK_GLOBAL = 'phoneMaskGlobal',
        CATALOG_IMAGE_SIZE = 'catalogImageSize',

        AUTO_REFRESH   = 'autoRefresh',
        SERVER_REFRESH = 'serverRefresh',

        OPTION_PROPERTIES = 'optionProperties',
        DEALER_PROPERTIES = 'dealersProperties';

  /**
   * Setting action
   */


  /**
   * Hooks
   */
  const HOOKS_ADMIN_DB_TEMPLATE = 'admindbTemplate',
        HOOKS_CALENDAR_TEMPLATE = 'calendarTemplate',
        HOOKS_CATALOG_TEMPLATE  = 'catalogTemplate',
        HOOKS_ORDER_TEMPLATE    = 'orderTemplate',
        HOOKS_CUSTOMERS_TEMPLATE = 'customersTemplate',
        HOOKS_DEALERS_TEMPLATE   = 'dealersTemplate',
        HOOKS_FILE_MANAGER_TEMPLATE = 'fileManagerTemplate',
        HOOKS_SETTING_TEMPLATE     = 'settingTemplate',
        HOOKS_USERS_TEMPLATE       = 'usersTemplate';

}
