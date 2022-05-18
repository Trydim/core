// Query Object -----------------------------------------------------------------------------------------------------------------

const checkJSON = data => {
  try {
    const response = JSON.parse(data);
    if (response['error']) throw response['error'];
    return response;
  }
  catch (e) {
    e['xdebug_message'] && f.showMsg(e['xdebug_message'], 'error', false);
    e.message && f.showMsg(e.message, 'error', false);
    data && f.showMsg(data, 'error', false);
    return {status: false};
  }
};

const downloadBody = async data => {
  const fileName = JSON.parse(data.headers.get('fileName')),
        reader   = data.body.getReader();
  let chunks    = [],
      countSize = 0;

  while (true) {
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
 * Query namespace
 * @const
 * @type {{Post: function, Get: function}}
 * @function Post({url: String, data, type})
 */
export default {

  /**
   * Fetch Get
   * @param {object} obj
   * @param {string?|any?: c.MAIN_PHP_PATH} obj.url - link to index.php.
   * @param {string} obj.data - get params as string.
   * @param {string?: 'json'} obj.type - return type.
   * @return {Promise<Response>}
   * @constructor
   */
  Get: ({url = f.MAIN_PHP_PATH, data, type = 'json'}) => query(url + '?' + data, '', type),

  /**
   * Fetch Post
   * @param {object} obj
   * @param {string?|any?: c.MAIN_PHP_PATH} obj.url - link to index.php.
   * @param {Blob|BufferSource|FormData|URLSearchParams|ReadableStream} obj.data -
   * Any body that you want to add to your request object.
   * Note that a request using the GET or HEAD method cannot have a body.
   * @param {string?: 'json'} obj.type - return type.
   * @return {Promise<Response>}
   */
  Post: ({url = f.MAIN_PHP_PATH, data, type = 'json'}) => query(url, data, type),
};
