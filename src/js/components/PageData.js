let pageData = Object.freeze(Object.create(null));
let pageDataInitialized = false;

const clonePageDataValue = value => {
  if (value == null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const deepFreezePageData = (value, seen = new WeakSet()) => {
  if (value == null || typeof value !== 'object' || seen.has(value)) return value;

  seen.add(value);
  Object.keys(value).forEach(key => deepFreezePageData(value[key], seen));
  return Object.freeze(value);
};

const getPageDataByPath = (data, key) => {
  if (!key) return data;

  return key.split('.').reduce((result, part) => {
    if (result == null || part === '') return undefined;
    return Object.prototype.hasOwnProperty.call(result, part) ? result[part] : undefined;
  }, data);
};

const initPageData = () => {
  if (pageDataInitialized) return;

  const node = document.getElementById(f.PAGE_DATA_ID || 'pageData');
  let data = Object.create(null);

  if (node && node.textContent.trim()) {
    data = JSON.parse(node.textContent);
  }

  node && node.remove();
  pageData = deepFreezePageData(data && typeof data === 'object' ? data : Object.create(null));
  pageDataInitialized = true;
};

export default Object.freeze({
  get(key = '', defaultValue = null) {
    initPageData();

    const value = getPageDataByPath(pageData, key);
    return clonePageDataValue(value === undefined ? defaultValue : value);
  },

  has(key) {
    initPageData();

    return getPageDataByPath(pageData, key) !== undefined;
  },
});
