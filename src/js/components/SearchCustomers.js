"use strict";

function lMin(d0, d1, d2, bx, ay) {
  return d0 < d1 || d2 < d1 ? d0 > d2 ? d2 + 1 : d0 + 1
                            : bx === ay ? d1 : d1 + 1;
}

function levelStein(a, b) {
  if (a === b) return 0;

  if (a.length > b.length) {
    let tmp = a;
    a = b;
    b = tmp;
    [a, b] = [b, a];
  }

  let offset = 0,
      la = a.length,
      lb = b.length;

  while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
    la--;
    lb--;
  }

  while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
    offset++;
  }

  la -= offset;
  lb -= offset;

  if (la === 0 || lb < 3) return lb;

  let x = 0, vector = [],
      y, d0, d1, d2, d3, dd, dy, ay, bx0, bx1, bx2, bx3;

  for (y = 0; y < la; y++) {
    vector.push(y + 1);
    vector.push(a.charCodeAt(offset + y));
  }

  let len = vector.length - 1;

  for (; x < lb - 3;) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    bx1 = b.charCodeAt(offset + (d1 = x + 1));
    bx2 = b.charCodeAt(offset + (d2 = x + 2));
    bx3 = b.charCodeAt(offset + (d3 = x + 3));
    dd = (x += 4);
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      ay = vector[y + 1];
      d0 = lMin(dy, d0, d1, bx0, ay);
      d1 = lMin(d0, d1, d2, bx1, ay);
      d2 = lMin(d1, d2, d3, bx2, ay);
      dd = lMin(d2, d3, dd, bx3, ay);
      vector[y] = dd;
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }

  for (; x < lb;) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    dd = ++x;
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      vector[y] = dd = lMin(dy, d0, dd, bx0, vector[y + 1]);
      d0 = dy;
    }
  }

  return dd;
}

/**
 * Поиск
 */
export const searching = () => {
  const obj = Object.create(null);

  obj.init = function (param) {
    let {popup = true, node, searchData,
          finishFunc = () => {},
          showResult = () => {}} = param,
        func = e => this.searchFocus(e);

    this.usePopup = popup; // Показывать результаты в сплывающем окне
    this.searchData = searchData;
    this.resultFunc = (index) => finishFunc(index);
    this.returnFunc = (resultIds) => showResult(this.resultTmp, resultIds);

    node.removeEventListener('focus', func);
    node.addEventListener('focus', func);
    node.dispatchEvent(new Event('focus'));
  }

  obj.setSearchData = function (data) {
    this.searchData = data;
    return this;
  }

  // Переделать когда нить. в Wordpress очень крутой поисковик
  obj.search = function (need) {
    let pattern     = /(-|_|\(|\)|@)/gm,
        cyrillic    = 'УКЕНХВАРОСМТукенхваросмт',
        latin       = 'YKEHXBAPOCMTykehxbapocmt',
        //cyrillicKey = 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮйцукенгшщзхъфывапролджэячсмитьбю',
        //latinKey    = 'QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>qwertyuiop[]asdfghjkl;\'zxcvbnm,.',
        replacerLC    = match => latin.charAt(cyrillic.indexOf(match)),
        replacerCL    = match => cyrillic.charAt(latin.indexOf(match)),
        //replacerKeyLC = match => latinKey.charAt(cyrillicKey.indexOf(match)),
        //replacerKeyCL = match => cyrillicKey.charAt(latinKey.indexOf(match)),
        lettersL = new RegExp(`(${latin.split('').join('|')})`, 'gi'),
        lettersC = new RegExp(`(${cyrillic.split('').join('|')})`, 'gi');
    //funcKeyL = new RegExp(`(${latinKey.split('').join('|')})`, 'gi'),
    //funcKeyC = new RegExp(`(${cyrillicKey.split('').join('|')})`, 'gi');

    need = need.replace(pattern, '');
    if (need.includes(' ')) need += '|' + need.split(' ').reverse().join(' ');

    let regArr = [], i, test;

    (i = need.replace(lettersL, replacerCL).replace(/ /gm, '.+')) && regArr.push(i);
    (i = need.replace(lettersC, replacerLC).replace(/ /gm, '.+')) && regArr.push(i);
    //(i = need.replace(funcKeyL, replacerKeyCL).replace(/ /gm, '.+')) && regArr.push(i);
    //(i = need.replace(funcKeyC, replacerKeyLC).replace(/ /gm, '.+')) && regArr.push(i);
    //i = `${regArr.join('|')}`;
    test = new RegExp(`${regArr.join('|')}`, 'i');

    return Object.entries(this.searchData)
                 .map(i => test.test(i[1].replace(pattern, '')) && i[0]).filter(i => i);
  }

  obj.clear = function (inputNode) {
    inputNode.removeEventListener('keyup', this.bindInputNodeEvent);
    this.usePopup && setTimeout(() => this.resultTmp.remove(), 0);
  }

  // Events
  const inputNodeEvent = function (e) {
    let value = e.target.value;
    if (value.length > 1) {
      f.show(this.resultTmp);
      this.returnFunc(this.search(value));
    } else {
      f.hide(this.resultTmp);
      this.returnFunc(Object.keys(this.searchData));
    }
    e.key === 'Enter' && e.target.dispatchEvent(new Event('blur')) && e.target.blur();
  }

  obj.searchFocus = function (e) {
    let target = e.target,
        wrap = target.parentNode;

    if (this.usePopup && !this.resultTmp) {
      this.resultTmp = f.gTNode('#searchResult');
      this.resultTmp.addEventListener('mousedown', e => this.clickResult(e, target));
    }

    this.bindInputNodeEvent = inputNodeEvent.bind(this);
    target.addEventListener('keyup', this.bindInputNodeEvent);
    target.addEventListener('blur', () => setTimeout(() => this.clear(target), 100), {once: true});

    if (this.usePopup) {
      wrap.style.position = 'relative';
      wrap.append(this.resultTmp);
    }

    //target.dispatchEvent(new Event('keyup'));
  }

  obj.clickResult = function (e, inputNode) {
    if (this.resultTmp === e.target) return;

    this.clear(inputNode);
    //inputNode.value = this.data[index].name;
    this.resultFunc(+e.target.dataset.id);
  }

  return obj;
}
