/**
 * Parse JSON response body and show backend errors via `f.showMsg`.
 * Always returns an object; on parse/error returns `{ status: false }`.
 * @param {string} data Raw response text.
 * @returns {any|{status:false}} Parsed JSON or a failure object.
 */
const checkJSON = (data: string) => {
  try {
    const response = JSON.parse(data);
    if (response['error']) throw response['error'];
    return response;
  }
  catch (e: unknown) {
    const err = e as { xdebug_message?: unknown; message?: unknown };
    let msg: unknown = err?.xdebug_message ?? err?.message ?? e;

    if (msg) {
      const messages: string[] = Array.isArray(msg) ? msg.map(String) : [String(msg)];
      messages.forEach((m) => f.showMsg(m, 'error', false));
    }

    if (data) {
      f.showMsg(window._('For more information see console'), 'error', false);
      console.error(data);
    }

    return {status: false};
  }
};

/**
 * Extract filename from response headers.
 * Supports `content-disposition: filename="..."` and custom `filename` header.
 * @param {Response} data Fetch response.
 * @returns {string} Filename.
 */
const getFilename = (data: any) => {
  let filename = data.headers.get('content-disposition');

  if (typeof filename === 'string') {
    const match = /(?:filename=")(.+)(?=")/i.exec(filename);
    filename = Array.isArray(match) && match.length === 2 && match[1];
  }

  return filename || data.headers.get('filename') || 'document.pdf';
}

/**
 * Download streamed response body into a Blob and attach filename.
 * @param {Response} data Fetch response (must have readable `body`).
 * @returns {Promise<Blob & {filename:string; fileName:string}>} File blob.
 */
const downloadBody = async (data: any) => {
  const filename = getFilename(data),
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
  return Object.assign(new Blob(chunks), {filename, fileName: filename});
}

/**
 * Rewrites cookie keys/values that contain Cyrillic chars into translit.
 * Returns current cookie string (after potential rewrite).
 * @returns {string}
 */
const translateCookie = (): string => {
  document.cookie.split(';').forEach((p: string) => {
    if (/[а-я]/i.test(p)) {
      const [key, value] = p.trim().split('=');
      document.cookie = `${f.transLit(key ?? '')}=${f.transLit(value ?? '')}`;
    }
  });

  return document.cookie;
}

/**
 * Internal fetch wrapper (always POST) with automatic body FormData conversion.
 * - `type='json'`: parses via `checkJSON(res.text())`
 * - `type='file'|'body'`: reads stream into Blob via `downloadBody(res)`
 * - other values: calls `res[type]()` (e.g. 'text', 'blob', 'arrayBuffer')
 * @param {string} url
 * @param {BodyInit|null} body
 * @param {string?} type
 * @returns {Promise<any>}
 */
const query = (url: string, body: BodyInit | null, type = 'json') => {
  const headers = {'Cookie': translateCookie()};

  if (body && ['object', 'string'].includes(typeof body) && !(body instanceof FormData)) {
    let data = new FormData();

    if (typeof body === 'object') {
      Object.entries(body).forEach(([k, v]) => {
        v !== undefined && data.set(k, typeof v === 'object' ? JSON.stringify(v) : v.toString());
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
 * Query namespace.
 * Simple wrappers for GET/POST requests to `f.MAIN_PHP_PATH` using `query()`.
 */
export default {

  /**
   * Fetch Get.
   * @param {object} obj
   * @param {string|any?} obj.url - link to index.php.
   * @param {string} obj.data - get params as string.
   * @param {string?} obj.type - return type.
   * @return {Promise<Response>}
   * @constructor
   */
  Get: ({url = f.MAIN_PHP_PATH, data, type = 'json'}: {url: string, data?: string, type?: string}) =>
    query(url + '?' + (typeof data === 'string' ? data : (new URLSearchParams(data)).toString()), null, type),

  /**
   * Fetch Post.
   * @param {object} obj
   * @param {string|any?} obj.url - link to index.php.
   * @param {BodyInit} obj.data -
   * Anybody that you want to add to your request object.
   * Note that a request using the GET or HEAD method cannot have a body.
   * @param {string?} obj.type - return type.
   * @return {Promise<Response>}
   */
  Post: ({url = f.MAIN_PHP_PATH, data, type = 'json'}: {url: string, data: BodyInit, type?: string}) => query(url, data, type),
};
