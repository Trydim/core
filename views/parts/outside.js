const html = data['css'] + data['content'];

const getCustomElements = () => new Promise((resolve) => {
  customElements.define('shadow-calc', class extends HTMLElement {
    connectedCallback() {
      resolve(this.attachShadow({mode: 'open'}));
    }
  });
});

const importJs = (node, jsArr) => {
  jsArr.forEach(src => {
    let s = document.createElement('script');
    s.type = 'module';
    s.async = false;
    s.src = src;
    node.append(s);

    //fetch(src).then(d => d.text()).then(d => d});
  });
};

node = typeof node === 'string' ? document.querySelector(node) : node;
node.innerHTML = '';

window.CMS_CONST = data['jsGlobalConst'];
if (data['isShadow']) {
  (async () => {
    const sCalc = await getCustomElements();

    sCalc.innerHTML = html;

    sCalc.querySelectorAll('link[data-href]').forEach(n => {
      if (n.dataset.global) document.head.append(n);
      n.href = n.dataset.href;
    });

    importJs(sCalc, data['js']);

    window.shadowCalc = sCalc;
  })();
  node.insertAdjacentHTML('beforeend', '<shadow-calc></shadow-calc>');
} else {
  node.innerHTML = '<div id="calcWrap">' + html + '</div>';
  importJs(document.body, data['js']);
}

setTimeout(() => document.dispatchEvent(new Event('DOMContentLoaded')), 50);
