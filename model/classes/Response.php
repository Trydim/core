<?php

use Helpers\ResponseHeaderBag;

class Response {
  /**
   * @var Main
   */
  private $main;

  /**
   * @var int
   */
  protected $statusCode;

  /**
   * @var string
   */
  protected $statusText;

  /**
   * @var string
   */
  protected $charset = 'UTF-8';

  /**
   * The original content of the response.
   *
   * @var mixed
   */
  public $original;

  /**
   * The content of the response after checked errors
   *
   * @var string
   */
  private $content = '';
  /**
   * @var ResponseHeaderBag
   */
  private $headers;

  /**
   * @param Main  $main The response content, see setContent()
   * @param int   $status  The response status code
   * @param array $headers An array of response headers
   *
   * @throws InvalidArgumentException When the HTTP status code is not valid
   */
  public function __construct(Main $main, int $status = 200, array $headers = []) {
    $this->main = $main;

    $this->headers = new ResponseHeaderBag($headers);
    $this->setStatusCode($status);
  }

  /**
   * Returns the Response as an HTTP string.
   *
   * The string representation of the Response is the same as the
   * one that will be sent to the client only if the prepare() method
   * has been called before.
   *
   * @return string The Response as an HTTP string
   *
   * @see prepare()
   */
  public function __toString() {
    return
      sprintf('HTTP/%s %s %s', '1.0', $this->statusCode, $this->statusText) . "\r\n" .
      $this->headers . "\r\n" .
      $this->original;//$this->getContent();
  }

  /**
   * Check if there is an error
   * Deep search for all error messages and return as an array
   *
   * @param array $result
   * @param array|null $error
   * @param bool $insideError
   */
  private function checkError(array &$result, ?array &$error = [], ?bool $insideError = false): void {
    $error = $error ?? [];

    foreach ($result as $k => $v) {
      if ($k === 'error' || $insideError) {
        if (is_array($v)) $this->checkError($v, $error, true);
        else if (!empty($v)) $error[] = ($insideError ? $k . ': ' : '') . $v;
      }
      else if (is_array($v)) $this->checkError($v, $error);
    }

    if ($result['status'] = empty($error)) unset($result['error']);
    else $result['error'] = $error;
  }

  /**
   * Set a header on the Response.
   *
   * @param string        $key
   * @param  array|string $values
   * @param bool          $replace
   * @return $this
   */
  public function header(string $key, $values, bool $replace = true): Response {
    $this->headers->set($key, $values, $replace);

    return $this;
  }

  /**
   * Sets the response status code.
   *
   * If the status text is null it will be automatically populated for the known
   * status codes and left empty otherwise.
   *
   * @param int   $code HTTP status code
   * @param mixed $text HTTP status text
   *
   * @return $this
   *
   * @throws InvalidArgumentException When the HTTP status code is not valid
   */
  public function setStatusCode(int $code, $text = null): Response {
    $this->statusCode = $code = (int)$code;
    if ($this->isInvalid()) {
      throw new InvalidArgumentException(sprintf('The HTTP status code "%s" is not valid.', $code));
    }

    if ($text === null) {
      $this->statusText = self::$statusTexts[$code] ?? 'unknown status';

      return $this;
    }

    if ($text === false) {
      $this->statusText = '';

      return $this;
    }

    $this->statusText = $text;

    return $this;
  }

  /**
   * Retrieves the status code for the current web response.
   *
   * @return int Status code
   */
  public function getStatusCode(): int {
    return $this->statusCode;
  }

  /**
   * Marks the response as "private".
   *
   * It makes the response ineligible for serving other clients.
   *
   * @return $this
   */
  public function setPrivate(): Response {
    $this->headers->removeCacheControlDirective('public');
    $this->headers->addCacheControlDirective('private');

    return $this;
  }

  /**
   * Marks the response as "public".
   *
   * It makes the response eligible for serving other clients.
   *
   * @return $this
   */
  public function setPublic(): Response {
    $this->headers->addCacheControlDirective('public');
    $this->headers->removeCacheControlDirective('private');

    return $this;
  }

  /**
   * Marks the response as "immutable".
   *
   * @param bool $immutable enables or disables the immutable directive
   *
   * @return $this
   */
  public function setImmutable(bool $immutable = true): Response {
    if ($immutable) {
      $this->headers->addCacheControlDirective('immutable');
    } else {
      $this->headers->removeCacheControlDirective('immutable');
    }

    return $this;
  }
  /**
   * Returns true if the response is marked as "immutable".
   *
   * @return bool returns true if the response is marked as "immutable"; otherwise false
   */
  public function isImmutable(): bool {
    return $this->headers->hasCacheControlDirective('immutable');
  }

  /**
   * Set the content on the response.
   *
   * @param mixed $content
   * @return $this
   */
  public function setContent($content): Response {
    if ($content !== null && !is_string($content) && !is_array($content) && !is_object($content) && !is_callable([$content, '__toString'])) {
      die(sprintf('The Response content must be a string or object implementing __toString(), "%s" given.', gettype($content)));
    }

    $this->original = $content;

    // If the content is "JSON" we will set the appropriate header and convert
    // the content to JSON. This is useful when returning something like models
    // from routes that will be automatically transformed to their JSON form.
    if (is_object($content) || is_array($content)) {
      $this->header('Content-Type', 'application/json');

      $this->checkError($content);
      $content = json_encode($content);
    }

    /*// If this content implements the "Renderable" interface then we will call the
    // render method on the object, so we will avoid any "__toString" exceptions
    // that might be thrown and have their errors obscured by PHP's handling.
    elseif ($content instanceof Renderable) {
      $content = $content->render();
    }*/

    $this->content = (string) $content;

    return $this;
  }

  /**
   * Gets the current response content.
   */
  public function getContent() {
    $content = json_decode($this->content, true);

    return json_last_error() === JSON_ERROR_NONE ? $content : $this->content;
  }

  /**
   * Get the original response content.
   *
   * @return mixed
   */
  public function getOriginalContent()
  {
    $original = $this->original;

    return $original instanceof self ? $original->{__FUNCTION__}() : $original;
  }

  /**
   * Sends HTTP headers.
   *
   * @return $this
   */
  public function sendHeaders(): Response {
    // headers have already been sent by the developer
    if (headers_sent()) {
      return $this;
    }

    // headers
    foreach ($this->headers->allPreserveCaseWithoutCookies() as $name => $values) {
      $replace = 0 === strcasecmp($name, 'Content-Type');
      foreach ($values as $value) {
        header($name . ': ' . $value, $replace, $this->statusCode);
      }
    }

    // cookies
    foreach ($this->headers->getCookies() as $cookie) {
      header('Set-Cookie: ' . $cookie, false, $this->statusCode);
    }

    // status
    header(sprintf('HTTP/%s %s %s', '1.1', $this->statusCode, $this->statusText), true, $this->statusCode);

    return $this;
  }

  /**
   * Sends content for the current web response.
   *
   * @return $this
   */
  public function sendContent(): Response {
    echo $this->content;

    return $this;
  }

  /**
   * Sends HTTP headers and content.
   *
   * @return $this
   */
  public function send(): Response {
    $this->sendHeaders();
    $this->sendContent();

    if (function_exists('fastcgi_finish_request')) {
      fastcgi_finish_request();
    } // elseif (!in_array(PHP_SAPI, ['cli', 'phpdbg'], true)) {
      // Bitrix errors
      //static::closeOutputBuffers(0, true);
    //}

    return $this;
  }

  //--------------------------------------------------------------------------------------------------------------

  /**
   * Status codes translation table.
   *
   * The list of codes is complete according to the
   * {@link https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml Hypertext Transfer Protocol (HTTP) Status Code Registry}
   * (last updated 2016-03-01).
   *
   * Unless otherwise noted, the status code is defined in RFC2616.
   *
   * @var array
   */
  public static $statusTexts = [
    100 => 'Continue',
    101 => 'Switching Protocols',
    102 => 'Processing',            // RFC2518
    103 => 'Early Hints',
    200 => 'OK',
    201 => 'Created',
    202 => 'Accepted',
    203 => 'Non-Authoritative Information',
    204 => 'No Content',
    205 => 'Reset Content',
    206 => 'Partial Content',
    207 => 'Multi-Status',          // RFC4918
    208 => 'Already Reported',      // RFC5842
    226 => 'IM Used',               // RFC3229
    300 => 'Multiple Choices',
    301 => 'Moved Permanently',
    302 => 'Found',
    303 => 'See Other',
    304 => 'Not Modified',
    305 => 'Use Proxy',
    307 => 'Temporary Redirect',
    308 => 'Permanent Redirect',    // RFC7238
    400 => 'Bad Request',
    401 => 'Unauthorized',
    402 => 'Payment Required',
    403 => 'Forbidden',
    404 => 'Not Found',
    405 => 'Method Not Allowed',
    406 => 'Not Acceptable',
    407 => 'Proxy Authentication Required',
    408 => 'Request Timeout',
    409 => 'Conflict',
    410 => 'Gone',
    411 => 'Length Required',
    412 => 'Precondition Failed',
    413 => 'Payload Too Large',
    414 => 'URI Too Long',
    415 => 'Unsupported Media Type',
    416 => 'Range Not Satisfiable',
    417 => 'Expectation Failed',
    418 => 'I\'m a teapot',                                               // RFC2324
    421 => 'Misdirected Request',                                         // RFC7540
    422 => 'Unprocessable Entity',                                        // RFC4918
    423 => 'Locked',                                                      // RFC4918
    424 => 'Failed Dependency',                                           // RFC4918
    425 => 'Too Early',                                                   // RFC-ietf-httpbis-replay-04
    426 => 'Upgrade Required',                                            // RFC2817
    428 => 'Precondition Required',                                       // RFC6585
    429 => 'Too Many Requests',                                           // RFC6585
    431 => 'Request Header Fields Too Large',                             // RFC6585
    451 => 'Unavailable For Legal Reasons',                               // RFC7725
    500 => 'Internal Server Error',
    501 => 'Not Implemented',
    502 => 'Bad Gateway',
    503 => 'Service Unavailable',
    504 => 'Gateway Timeout',
    505 => 'HTTP Version Not Supported',
    506 => 'Variant Also Negotiates',                                     // RFC2295
    507 => 'Insufficient Storage',                                        // RFC4918
    508 => 'Loop Detected',                                               // RFC5842
    510 => 'Not Extended',                                                // RFC2774
    511 => 'Network Authentication Required',                             // RFC6585
  ];

  /**
   * Returns true if the response may safely be kept in a shared (surrogate) cache.
   *
   * Responses marked "private" with an explicit Cache-Control directive are
   * considered uncacheable.
   *
   * Responses with neither a freshness lifetime (Expires, max-age) nor cache
   * validator (Last-Modified, ETag) are considered uncacheable because there is
   * no way to tell when or how to remove them from the cache.
   *
   * Note that RFC 7231 and RFC 7234 possibly allow for a more permissive implementation,
   * for example "status codes that are defined as cacheable by default [...]
   * can be reused by a cache with heuristic expiration unless otherwise indicated"
   * (https://tools.ietf.org/html/rfc7231#section-6.1)
   *
   * @return bool true if the response is worth caching, false otherwise
   */
  public function isCacheable(): bool {
    if (!in_array($this->statusCode, [200, 203, 300, 301, 302, 404, 410])) {
      return false;
    }

    if ($this->headers->hasCacheControlDirective('no-store') || $this->headers->getCacheControlDirective('private')) {
      return false;
    }

    return $this->isValidateable() || $this->isFresh();
  }

  /**
   * Returns true if the response includes headers that can be used to validate
   * the response with the origin server using a conditional GET request.
   *
   * @return bool true if the response is validateable, false otherwise
   *

   */
  public function isValidateable(): bool {
    return $this->headers->has('Last-Modified') || $this->headers->has('ETag');
  }
  /**
   * Returns true if the response is "fresh".
   *
   * Fresh responses may be served from cache without any interaction with the
   * origin. A response is considered fresh when it includes a Cache-Control/max-age
   * indicator or Expires header and the calculated age is less than the freshness lifetime.
   *
   * @return bool true if the response is fresh, false otherwise
   *

   */
  public function isFresh(): bool {
    return $this->getTtl() > 0;
  }
  /**
   * Returns the response's time-to-live in seconds.
   *
   * It returns null when no freshness information is present in the response.
   *
   * When the responses TTL is <= 0, the response may not be served from cache without first
   * revalidating with the origin.
   *
   * @return int|null The TTL in seconds
   */
  public function getTtl(): ?int {
    if (null !== $maxAge = $this->getMaxAge()) {
      return $maxAge - $this->getAge();
    }

    return null;
  }

  /**
   * Sets the number of seconds after which the response should no longer be considered fresh.
   *
   * This methods sets the Cache-Control max-age directive.
   *
   * @param int $value Number of seconds
   *
   * @return $this
   */
  public function setMaxAge(int $value): Response {
    $this->headers->addCacheControlDirective('max-age', $value);

    return $this;
  }

  /**
   * Returns the number of seconds after the time specified in the response's Date
   * header when the response should no longer be considered fresh.
   *
   * First, it checks for a s-maxage directive, then a max-age directive, and then it falls
   * back on an expires header. It returns null when no maximum age can be established.
   *
   * @return int|null Number of seconds
   */
  public function getMaxAge(): ?int {
    if ($this->headers->hasCacheControlDirective('s-maxage')) {
      return (int) $this->headers->getCacheControlDirective('s-maxage');
    }

    if ($this->headers->hasCacheControlDirective('max-age')) {
      return (int) $this->headers->getCacheControlDirective('max-age');
    }

    if (null !== $this->getExpires()) {
      return (int) $this->getExpires()->format('U') - (int) $this->getDate()->format('U');
    }

    return null;
  }

  /**
   * Factory method for chainability.
   *
   * Example:
   *
   *     return Response::create($body, 200)
   *         ->setSharedMaxAge(300);
   *
   * @param mixed $content The response content, see setContent()
   * @param int   $status The response status code
   * @param array $headers An array of response headers
   *
   * @return static
   */
  public static function create($content = '', int $status = 200, array $headers = []): Response {
    return new static($content, $status, $headers);
  }

  /**
   * Returns true if the response must be revalidated by shared caches once it has become stale.
   *
   * This method indicates that the response must not be served stale by a
   * cache in any circumstance without first revalidating with the origin.
   * When present, the TTL of the response should not be overridden to be
   * greater than the value provided by the origin.
   *
   * @return bool true if the response must be revalidated by a cache, false otherwise
   *

   */
  public function mustRevalidate(): bool {
    return $this->headers->hasCacheControlDirective('must-revalidate') || $this->headers->hasCacheControlDirective('proxy-revalidate');
  }

  /**
   * Returns the Date header as a DateTime instance.
   *
   * @return DateTime A \DateTime instance
   *
   * @throws RuntimeException When the header is not parseable
   */
  public function getDate(): DateTime {
    return $this->headers->getDate('Date');
  }

  /**
   * Sets the Date header.
   *
   * @return $this
   */
  public function setDate(DateTime $date): Response {
    $date->setTimezone(new DateTimeZone('UTC'));
    $this->headers->set('Date', $date->format('D, d M Y H:i:s') . ' GMT');

    return $this;
  }

  /**
   * Returns the age of the response.
   *
   * @return int The age of the response in seconds
   */
  public function getAge(): int {
    if (null !== $age = $this->headers->get('Age')) return (int)$age;

    return max(time() - (int)$this->getDate()->format('U'), 0);
  }

  /**
   * Marks the response stale by setting the Age header to be equal to the maximum age of the response.
   *
   * @return $this
   */
  public function expire(): Response {
    if ($this->isFresh()) {
      $this->headers->set('Age', $this->getMaxAge());
      $this->headers->remove('Expires');
    }

    return $this;
  }

  /**
   * Returns the value of the Expires header as a DateTime instance.
   *
   * @return DateTime|null A DateTime instance or null if the header does not exist
   */
  public function getExpires(): ?DateTime {
    try {
      return $this->headers->getDate('Expires');
    } catch (RuntimeException $e) {
      // according to RFC 2616 invalid date formats (e.g. "0" and "-1") must be treated as in the past
      return DateTime::createFromFormat(DATE_RFC2822, 'Sat, 01 Jan 00 00:00:00 +0000');
    }
  }

  /**
   * Sets the Expires HTTP header with a DateTime instance.
   *
   * Passing null as value will remove the header.
   *
   * @param DateTime|null $date A \DateTime instance or null to remove the header
   *
   * @return $this
   */
  public function setExpires(DateTime $date = null): Response {
    if (null === $date) {
      $this->headers->remove('Expires');
    } else {
      $date = clone $date;
      $date->setTimezone(new DateTimeZone('UTC'));
      $this->headers->set('Expires', $date->format('D, d M Y H:i:s') . ' GMT');
    }

    return $this;
  }

  /**
   * Sets the number of seconds after which the response should no longer be considered fresh by shared caches.
   *
   * This methods sets the Cache-Control s-maxage directive.
   *
   * @param int $value Number of seconds
   *
   * @return $this
   */
  public function setSharedMaxAge(int $value): Response {
    $this->setPublic();
    $this->headers->addCacheControlDirective('s-maxage', $value);

    return $this;
  }

  /**
   * Sets the response's time-to-live for shared caches.
   *
   * This method adjusts the Cache-Control/s-maxage directive.
   *
   * @param int $seconds Number of seconds
   *
   * @return $this
   */
  public function setTtl(int $seconds): Response {
    $this->setSharedMaxAge($this->getAge() + $seconds);

    return $this;
  }

  /**
   * Sets the response's time-to-live for private/client caches.
   *
   * This method adjusts the Cache-Control/max-age directive.
   *
   * @param int $seconds Number of seconds
   *
   * @return $this
   */
  public function setClientTtl(int $seconds): Response {
    $this->setMaxAge($this->getAge() + $seconds);

    return $this;
  }

  /**
   * Returns the Last-Modified HTTP header as a DateTime instance.
   *
   * @return DateTime|null A DateTime instance or null if the header does not exist
   *
   * @throws RuntimeException When the HTTP header is not parseable
   */
  public function getLastModified(): ?DateTime {
    return $this->headers->getDate('Last-Modified');
  }

  /**
   * Sets the Last-Modified HTTP header with a DateTime instance.
   *
   * Passing null as value will remove the header.
   *
   * @param DateTime|null $date A \DateTime instance or null to remove the header
   *
   * @return $this
   */
  public function setLastModified(DateTime $date = null): Response {
    if (null === $date) {
      $this->headers->remove('Last-Modified');
    } else {
      $date = clone $date;
      $date->setTimezone(new DateTimeZone('UTC'));
      $this->headers->set('Last-Modified', $date->format('D, d M Y H:i:s') . ' GMT');
    }

    return $this;
  }

  /**
   * Returns the literal value of the ETag HTTP header.
   *
   * @return string|null The ETag HTTP header or null if it does not exist
   */
  public function getEtag(): ?string {
    return $this->headers->get('ETag');
  }

  /**
   * Sets the ETag value.
   *
   * @param string|null $etag The ETag unique identifier or null to remove the header
   * @param bool        $weak Whether you want a weak ETag or not
   *
   * @return $this
   */
  public function setEtag(string $etag = null, bool $weak = false): Response {
    if (null === $etag) {
      $this->headers->remove('Etag');
    } else {
      if (0 !== strpos($etag, '"')) {
        $etag = '"' . $etag . '"';
      }

      $this->headers->set('ETag', (true === $weak ? 'W/' : '') . $etag);
    }

    return $this;
  }

  /**
   * Sets the response's cache headers (validation and/or expiration).
   *
   * Available options are: etag, last_modified, max_age, s_maxage, private, public and immutable.
   *
   * @param array $options An array of cache options
   *
   * @return $this
   * @throws InvalidArgumentException
   */
  public function setCache(array $options): Response {
    if ($diff = array_diff(array_keys($options), ['etag', 'last_modified', 'max_age', 's_maxage', 'private', 'public', 'immutable'])) {
      throw new InvalidArgumentException(sprintf('Response does not support the following options: "%s".', implode('", "', $diff)));
    }

    if (isset($options['etag'])) {
      $this->setEtag($options['etag']);
    }

    if (isset($options['last_modified'])) {
      $this->setLastModified($options['last_modified']);
    }

    if (isset($options['max_age'])) {
      $this->setMaxAge($options['max_age']);
    }

    if (isset($options['s_maxage'])) {
      $this->setSharedMaxAge($options['s_maxage']);
    }

    if (isset($options['public'])) {
      if ($options['public']) {
        $this->setPublic();
      } else {
        $this->setPrivate();
      }
    }

    if (isset($options['private'])) {
      if ($options['private']) {
        $this->setPrivate();
      } else {
        $this->setPublic();
      }
    }

    if (isset($options['immutable'])) {
      $this->setImmutable((bool)$options['immutable']);
    }

    return $this;
  }

  /**
   * Modifies the response so that it conforms to the rules defined for a 304 status code.
   *
   * This sets the status, removes the body, and discards any headers
   * that MUST NOT be included in 304 responses.
   *
   * @return $this
   * @throws Exception
   */
  public function setNotModified(): Response {
    $this->setStatusCode(304);
    $this->setContent(null);

    // remove headers that MUST NOT be included with 304 Not Modified responses
    foreach (['Allow', 'Content-Encoding', 'Content-Language', 'Content-Length', 'Content-MD5', 'Content-Type', 'Last-Modified'] as $header) {
      $this->headers->remove($header);
    }

    return $this;
  }

  /**
   * Is response invalid?
   *
   * @return bool
   */
  public function isInvalid(): bool {
    return $this->statusCode < 100 || $this->statusCode >= 600;
  }

  /**
   * Is response informative?
   *
   * @return bool
   */
  public function isInformational(): bool {
    return $this->statusCode >= 100 && $this->statusCode < 200;
  }

  /**
   * Is response successful?
   *
   * @return bool
   */
  public function isSuccessful(): bool {
    return $this->statusCode >= 200 && $this->statusCode < 300;
  }

  /**
   * Is the response a redirect?
   *
   * @return bool
   */
  public function isRedirection(): bool {
    return $this->statusCode >= 300 && $this->statusCode < 400;
  }

  /**
   * Is there a client error?
   *
   * @return bool
   */
  public function isClientError(): bool {
    return $this->statusCode >= 400 && $this->statusCode < 500;
  }

  /**
   * Was there a server side error?
   *
   * @return bool
   */
  public function isServerError(): bool {
    return $this->statusCode >= 500 && $this->statusCode < 600;
  }

  /**
   * Is the response OK?
   *
   * @return bool
   */
  public function isOk(): bool {
    return $this->statusCode === 200;
  }

  /**
   * Is the response forbidden?
   *
   * @return bool
   */
  public function isForbidden(): bool {
    return 403 === $this->statusCode;
  }

  /**
   * Is the response a not found error?
   *
   * @return bool
   */
  public function isNotFound(): bool {
    return 404 === $this->statusCode;
  }

  /**
   * Is the response a redirect of some form?
   *
   * @param string|null $location
   *
   * @return bool
   */
  public function isRedirect(string $location = null): bool {
    return in_array($this->statusCode, [201, 301, 302, 303, 307, 308]) && (null === $location || $location == $this->headers->get('Location'));
  }

  /**
   * Is the response empty?
   *
   * @return bool
   */
  public function isEmpty(): bool {
    return in_array($this->statusCode, [204, 304]);
  }

  /**
   * Cleans or flushes output buffers up to target level.
   *
   * Resulting level can be greater than target level if a non-removable buffer has been encountered.
   *
   * @param int  $targetLevel The target output buffering level
   * @param bool $flush Whether to flush or clean the buffers
   */
  public static function closeOutputBuffers(int $targetLevel, bool $flush) {
    $status = ob_get_status(true);
    $level = count($status);
    // PHP_OUTPUT_HANDLER_* are not defined on HHVM 3.3
    $flags = defined('PHP_OUTPUT_HANDLER_REMOVABLE') ? PHP_OUTPUT_HANDLER_REMOVABLE | ($flush ? PHP_OUTPUT_HANDLER_FLUSHABLE : PHP_OUTPUT_HANDLER_CLEANABLE) : -1;

    while ($level-- > $targetLevel && ($s = $status[$level]) && (!isset($s['del']) ? !isset($s['flags']) || ($s['flags'] & $flags) === $flags : $s['del'])) {
      if ($flush) ob_end_flush();
      else ob_end_clean();
    }
  }

  /**
   * Prepares the Response before it is sent to the client.
   *
   * This method tweaks the Response to ensure that it is
   * compliant with RFC 2616. Most of the changes are based on
   * the Request that is "associated" with this Response.
   *
   * @return $this
   *!/
  public function prepare(Request $request) {
    $headers = $this->headers;

    if ($this->isInformational() || $this->isEmpty()) {
      $this->setContent(null);
      $headers->remove('Content-Type');
      $headers->remove('Content-Length');
    } else {
    // Content-type based on the Request
      if (!$headers->has('Content-Type')) {
      $format = $request->getRequestFormat();
      if (null !== $format && $mimeType = $request->getMimeType($format)) {
        $headers->set('Content-Type', $mimeType);
      }
    }

    // Fix Content-Type
    $charset = $this->charset ?: 'UTF-8';
    if (!$headers->has('Content-Type')) {
      $headers->set('Content-Type', 'text/html; charset=' . $charset);
    } elseif (0 === stripos($headers->get('Content-Type'), 'text/') && false === stripos($headers->get('Content-Type'), 'charset')) {
      // add the charset
      $headers->set('Content-Type', $headers->get('Content-Type') . '; charset=' . $charset);
    }

    // Fix Content-Length
    if ($headers->has('Transfer-Encoding')) {
      $headers->remove('Content-Length');
    }

    if ($request->isMethod('HEAD')) {
    // cf. RFC2616 14.13
      $length = $headers->get('Content-Length');
      $this->setContent(null);
      if ($length) {
        $headers->set('Content-Length', $length);
      }
    }

    // Check if we need to send extra expire info headers
    if ('1.0' == $this->getProtocolVersion() && false !== strpos($headers->get('Cache-Control'), 'no-cache')) {
      $headers->set('pragma', 'no-cache');
      $headers->set('expires', -1);
    }

    return $this;
  }*/
}
