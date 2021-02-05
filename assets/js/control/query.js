import {c} from "../const.js";

// Query Object -----------------------------------------------------------------------------------------------------------------

const checkJSON = (data) => {
  try { return JSON.parse(data); }
  catch (e) { f.showMsg(data, 'error', false); return {status: false} }
};

const downloadBody = async (data) => {
  const fileName = JSON.parse(data.headers.get('fileName')),
        reader = data.body.getReader();
  let chunks = [],
      countSize = 0;

  while(true) {
    // done становится true в последнем фрагменте
    // value - Uint8Array из байтов каждого фрагмента
    const {done, value} = await reader.read();

    if (done) break;

    chunks.push(value);
    countSize += value.length;
  }
  return Object.assign(new Blob(chunks), {fileName});
}

const query = (url, data, type = 'json') => {
  type === 'file' && (type = 'body');
  return fetch(url, {method: 'post', body: data})
    .then(res => type === 'json' ? res.text() : res).then(
      data => {
        if (type === 'json') return checkJSON(data, type);
        else if (type === 'body') return downloadBody(data);
        else return data[type]();
      },
      error => console.log(error),
    );
};

/**
 * @type {{Post: (function({url?: *, data?: *, type?: *}): Promise),
 * Get: (function({url: *, data: *, type?: *}): Promise)}}
 */
export const q = {

  /**
   * @param url
   * @param data
   * @param type
   * @return {*}
   * @constructor
   */
  Get: ({url = c.MAIN_PHP_PATH, data, type = 'json'}) => query(url + '?' + data, '', type),

  /**
   * Fetch Post function
   * @param url
   * @param data
   * @param type
   * @returns {Promise<Response>}
   */
  Post: ({url = c.MAIN_PHP_PATH, data, type = 'json'}) => query(url, data, type),

};
