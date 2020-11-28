import {c} from "../const.js";

// Query Object -----------------------------------------------------------------------------------------------------------------

const checkJSON = (data) => {
  try { return JSON.parse(data); }
  catch (e) { document.body.innerHTML = data; }
};

const query = (url, data, type = 'json') => {
  return fetch(url, {method: 'post', body: data})
    .then(res => type === 'json' ? res.text() : res).then(
      data => {
        if (type === 'json') return checkJSON(data, type);
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
