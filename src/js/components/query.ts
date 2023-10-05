// Query Object -----------------------------------------------------------------------------------------------------------------

const checkJSON = (data: string) => {
  try {
    const response = JSON.parse(data);
    if (response['error']) throw response['error'];
    return response;
  }
  catch (e) {
    const msg = e['xdebug_message'] || e.message || e;
    msg && f.showMsg(msg, 'error', false);
    data && f.showMsg(data, 'error', false);
    return {status: false};
  }
};

const getFileName = (data: any) => {
  let fileName = data.headers.get('Content-Disposition');

  if (typeof fileName === 'string') {
    const match = /(?:filename=")\w+\.\w+(?=")/i.exec(fileName); // safari error
    fileName = Array.isArray(match) && match.length === 1 && match[0];
    if (fileName.replace) fileName = fileName.replace('filename="', '');
  }

  return fileName || JSON.parse(data.headers.get('fileName')) || '';
}
const downloadBody = async (data: any) => {
  const fileName = getFileName(data),
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

const query = (url: string, body: BodyInit | null, type = 'json') => {
  const headers = {'Cookie': document.cookie} as any;

  if (body && ['object', 'string'].includes(typeof body) && !(body instanceof FormData)) {
    let data = new FormData();

    if (typeof body === 'object') {
      Object.entries(body).forEach(([k, v]) => {
        data.set(k, typeof v === 'object' ? JSON.stringify(v) : v.toString());
      });
    }
    else data.set('content', body);

    body = data;
  }

  type === 'file' && (type = 'body');
  return fetch(url, {method: 'post', headers, credentials: "same-origin", body})
    .then((res: Response | Promise<string> | any) => type === 'json' ? res.text() : res).then(
      data => {
        if (type === 'json') return checkJSON(data);
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
  Get: ({url = f.MAIN_PHP_PATH, data, type = 'json'}: {url: string, data?: string, type?: string}) => query(url + '?' + data, null, type),

  /**
   * Fetch Post
   * @param {object} obj
   * @param {string?|any?: c.MAIN_PHP_PATH} obj.url - link to index.php.
   * @param {BodyInit} obj.data -
   * Any body that you want to add to your request object.
   * Note that a request using the GET or HEAD method cannot have a body.
   * @param {string?: 'json'} obj.type - return type.
   * @return {Promise<Response>}
   */
  Post: ({url = f.MAIN_PHP_PATH, data, type = 'json'}: {url: string, data: BodyInit, type?: string}) => query(url, data, type),
};
