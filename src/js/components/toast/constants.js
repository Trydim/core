const LIBNAME = 'awn'
const PREFIX = {
  popup: `${LIBNAME}-popup`,
  toast: `${LIBNAME}-toast`,
  btn: `${LIBNAME}-btn`,
  confirm: `${LIBNAME}-confirm`
}

// Constants for toasts
export const tConsts = {
  prefix: PREFIX.toast,
  klass: {
    label: `${PREFIX.toast}-label`,
    content: `${PREFIX.toast}-content`,
    icon: `${PREFIX.toast}-icon`,
    progressBar: `${PREFIX.toast}-progress-bar`,
    progressBarPause: `${PREFIX.toast}-progress-bar-paused`
  },
  ids: {
    container: `${PREFIX.toast}-container`
  }
}

// Constants for popups
export const mConsts = {
  prefix: PREFIX.popup,
  klass: {
    buttons: `${LIBNAME}-buttons`,
    button: PREFIX.btn,
    successBtn: `${PREFIX.btn}-success`,
    cancelBtn: `${PREFIX.btn}-cancel`,
    title: `${PREFIX.popup}-title`,
    body: `${PREFIX.popup}-body`,
    content: `${PREFIX.popup}-content`,
    dotAnimation: `${PREFIX.popup}-loading-dots`
  },
  ids: {
    wrapper: `${PREFIX.popup}-wrapper`,
    confirmOk: `${PREFIX.confirm}-ok`,
    confirmCancel: `${PREFIX.confirm}-cancel`
  }
}

export const eConsts = {
  klass: {
    hiding: `${LIBNAME}-hiding`
  },
  lib: LIBNAME
}
