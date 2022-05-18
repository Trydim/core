
// Всплывающее сообщение
export class ToastClass {
  toastIndex = 0;
  toasts = {};
  count = 0;
  newToast = undefined;

  constructor(param = {default: 'default'}) {
    f.toastInstance = f.toastInstance || {};
    if (f.toastInstance['default']) return f.toastInstance['default'];

    this.setParam(param);
    this.createWrap();
    this.createToast(param);

    f.toastInstance[param.default || f.random] = this;
  }

  setParam(param) {
    this.prefix = param.prefix || '';
    this.duration = param.duration || 3000;
    this.wrapClass = param.wrapClass || 'position-fixed w-50 ' + this.setPosition(param.position);
    this.wrapIndex = param.wrapIndex || 1080;
  }
  setPosition(position) {
    switch (f.camelize(position || 'top')) {
      case 'tl': case 'topLeft':
        return 'top-0 start-0';
      default: case 't': case 'top': case 'topCenter':
        return 'top-0 start-50 translate-middle-x';
      case 'tr': case 'topRight':
        return 'top-0 end-0';

      case 'ml': case 'left': case 'middleLeft':
        return 'top-50 start-0 translate-middle-y';
      case 'mc': case 'center': case 'middleCenter':
        return 'top-50 start-50 translate-middle';
      case 'mr': case 'right': case 'middleRight':
        return 'top-50 end-0 translate-middle-y';

      case 'bl': case 'bottomLeft':
        return 'bottom-0 start-0';
      case 'bc':  case 'bottom': case 'bottomCenter':
        return 'bottom-0 start-50 translate-middle-x';
      case 'br': case 'bottomRight':
        return 'bottom-0 end-0';
    }
  }

  createWrap() {
    const wrap = document.createElement("div");
    wrap.classList.value = this.wrapClass;
    wrap.classList.add(this.prefix + 'toast-wrap');
    wrap.setAttribute('type', 'button');
    wrap.style.zIndex = this.wrapIndex;

    this.wrap = wrap;
  }
  createToast(param) {
    const toast = document.createElement("div"),
          msg = document.createElement('div');
    toast.setAttribute('role', 'toast');
    toast.classList.value = param['toastClass'] || 'row m-1 p-3 fade';

    msg.classList.value = param['msgClass'] || 'col-11 text-center';

    this.toast = toast;
    this.msg = msg;
  }

  setColor(toast, color) {
    switch (color) {
      default:
      case 'success': toast.classList.add('bg-success', 'pi-white'); break;
      case 'warning': toast.classList.add('bg-warning', 'pi-white'); break;
      case 'error': toast.classList.add('bg-danger', 'pi-white'); break;
    }
    setTimeout(() => toast.classList.add('show'), 50);
  }

  show(msg = 'message body', type = 'success', autoClose = true) {
    const close = (id, duration = this.duration) => {
      setTimeout(() => {
        this.toasts[id].classList.remove('show');

        setTimeout( () => {
          this.toasts[id].remove();
          delete this.toasts[id];
          this.count--;

          this.count === 0 && this.wrap.remove();
        }, 300);
      }, duration);
    }

    const t = this.toast.cloneNode(true),
          m = this.msg.cloneNode(true);

    this.count === 0 && document.body.append(this.wrap);

    m.innerHTML = msg || 'message empty';
    t.id = this.toastIndex++;
    this.setColor(t, type);
    t.append(m);
    t.insertAdjacentHTML('beforeend', '<button type="button" class="col-1 btn-close btn-close-white m-auto"></button>');

    this.toasts[t.id] = t;
    this.count++;

    if (autoClose) close(t.id);
    else t.addEventListener('click', close.bind(this, t.id, 1), {once: true});

    this.wrap.append(t);
    return this;
  }
}

export const toast = (...arg) => new ToastClass().show(...arg);
