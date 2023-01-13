<?php


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
  protected $charset;

  /**
   * The original content of the response.
   *
   * @var mixed
   */
  public $original;

  /**
   * @var string
   */
  private $content;
  /**
   * @var ResponseHeaderBag
   */
  private $headers;

  /**
   * @param Main  $main The response content, see setContent()
   * @param int   $status  The response status code
   * @param array $headers An array of response headers
   *
   * @throws \InvalidArgumentException When the HTTP status code is not valid
   */
  public function __construct(Main $main, $status = 200, $headers = []) {
    $this->main = $main;

    $this->headers = new ResponseHeaderBag($headers);
    $this->setStatusCode($status);
    $this->setProtocolVersion('1.0');
  }

  /**
   * Check if there is an error
   * Deep search for all error messages and return as an array
   * @param array $result
   */
  private function checkError(array &$result): void {
    $error = [];
    if (!empty($result['error'])) {
      if (is_array($result['error'])) {
        array_walk_recursive($result['error'], function ($v, $k) use (&$error) {
          if (empty($v)) return;
          $error[] = [$k => $v];
        });
      } else $error = true;
    }

    if ($result['status'] = empty($error)) unset($result['error']);
    else $result['error'] = $error;
  }

  /**
   * Retrieves the status code for the current web response.
   *
   * @return int Status code

   */
  public function getStatusCode() {
    return $this->statusCode;
  }

  /**
   * Set a header on the Response.
   *
   * @param  string  $key
   * @param  array|string  $values
   * @param  bool    $replace
   * @return $this
   */
  public function header($key, $values, $replace = true)
  {
    $this->headers->set($key, $values, $replace);

    return $this;
  }

  /**
   * Set the content on the response.
   *
   * @param  mixed  $content
   * @return $this
   */
  public function setContent($content) {
    $this->original = $content;

    // If the content is "JSONable" we will set the appropriate header and convert
    // the content to JSON. This is useful when returning something like models
    // from routes that will be automatically transformed to their JSON form.
    if ($this->shouldBeJson($content)) {
      $this->header('Content-Type', 'application/json');

      $content = $this->morphToJson($content);
    }

    // If this content implements the "Renderable" interface then we will call the
    // render method on the object so we will avoid any "__toString" exceptions
    // that might be thrown and have their errors obscured by PHP's handling.
    elseif ($content instanceof Renderable) {
      $content = $content->render();
    }

    return $this;
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
   * Sends content for the current web response.
   *
   * @return $this
   */
  public function sendContent()
  {
    echo $this->content;

    return $this;
  }
}
