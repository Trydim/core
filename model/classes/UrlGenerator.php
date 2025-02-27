<?php

use Helpers\InputBag;
use Helpers\ServerBag;
use Helpers\HeaderBag;

class UrlGenerator {
  /**
   * @var Main
   */
  private $main;
  /**
   * @var InputBag
   */
  public $request;
  /**
   * @var ServerBag
   */
  public $server;
  /**
   * @var HeaderBag
   */
  private $headers;
  /**
   * @var string
   */
  private $method;

  /**
   * absolute path set in index.php
   * @var string
   */
  private $absolutePath;

  /**
   * http or https
   * @var string
   */
  private $scheme;
  /**
   * @var string
   */
  private $host;
  /**
   * @var string
   */
  private $subDomain = '';
  /**
   * relative path from "Document Root"
   * @var string
   */
  private $baseSitePath;
  /**
   * relative path from "Document Root"
   * @var string
   */
  private $sitePath;

  /**
   * absolute core path
   * @var string
   */
  private $corePath;
  /**
   * @var string
   */
  private $coreUri;

  /**
   * @var string
   */
  private $route;
  /**
   * @var string
   */
  private $routePath;
  /**
   * @var string
   */
  private $requestUri;
  /**
   * @var string
   */
  private $baseUri;

  /**
   * UrlGenerator constructor.
   * @param Main $main
   * @param string $corePath
   */
  public function __construct(Main $main, string $corePath) {
    $this->main = $main;
    $this->request = new InputBag($_REQUEST);
    $this->server  = new ServerBag($_SERVER);
    $this->headers = new HeaderBag($this->server->getHeaders());

    $this->absolutePath = str_replace('\\', '/', ABS_SITE_PATH);
    $this->corePath = str_replace('\\', '/', $corePath);
    $this->method = $this->server->get('REQUEST_METHOD');

    $this->setScheme();
    $this->setSubDomain($this->setHost());
    $this->setBaseSitePath();
    $this->setMode();
    $this->setCoreUri();
    $this->checkDealer();
  }

  private function setScheme() {
    $https = $this->server->get('HTTPS') ?? false;
    $this->scheme = ($https ? 'https' : 'http') . '://';
  }
  private function setHost(): string {
    if (!$host = $this->headers->get('HOST')) {
      if (!$host = $this->server->get('SERVER_NAME')) {
        $host = $this->server->get('SERVER_ADDR', '');
      }
    }

    $this->host = $this->scheme . $host;

    return $host;
  }
  private function setSubDomain(string $host) {
    $count = $this->server->get('REMOTE_ADDR') === '127.0.0.1' ? 1 : 2;
    $host = explode('.', $host);
    $subDomain  = $host[0];
    $mainDomain = count($host) > $count ? $host[1] : $host[0];

    if ($subDomain !== $mainDomain && $subDomain !== 'dev') {
      $this->subDomain = $subDomain;
    }
  }
  private function setBaseSitePath() {
    $filename = basename($this->server->get('SCRIPT_FILENAME', ''));

    if (defined('OUTSIDE')) {
      $this->baseSitePath = '/' . basename(ABS_SITE_PATH) . '/';
      //$this->requestUri = '/';
      return;
    } elseif (basename($this->server->get('SCRIPT_NAME', '')) === $filename) {
      $baseUrl = $this->server->get('SCRIPT_NAME');
    } elseif (basename($this->server->get('PHP_SELF', '')) === $filename) {
      $baseUrl = $this->server->get('PHP_SELF');
    } elseif (basename($this->server->get('ORIG_SCRIPT_NAME', '')) === $filename) {
      $baseUrl = $this->server->get('ORIG_SCRIPT_NAME'); // 1and1 shared hosting compatibility
    } else {
      // Backtrack up the script_filename to find the portion matching
      // php_self
      $path = $this->server->get('PHP_SELF', '');
      $file = $this->server->get('SCRIPT_FILENAME', '');
      $segs = explode('/', trim($file, '/'));
      $segs = array_reverse($segs);
      $index = 0;
      $last = count($segs);
      $baseUrl = '';
      do {
        $seg = $segs[$index];
        $baseUrl = '/' . $seg.$baseUrl;
        ++$index;
      } while ($last > $index && (false !== $pos = strpos($path, $baseUrl)) && 0 != $pos);
    }

    $this->baseSitePath = str_replace($filename, '', $baseUrl);
    $this->requestUri = str_replace($this->baseSitePath, '/', $this->getRequestUri());
  }
  private function setSitePath(): string {
    $dealLink = '';

    if ($this->main->isDealer()) {
      $id = $this->main->getCmsParam('dealerId');
      //if ($this->isLocalDealer($id)) $id = 'resource';
      $dealLink = 'dealer/' . $id . '/';
    }

    return $this->getBasePath() . $dealLink;
  }
  /*
   * Returns the prefix as encoded in the string when the string starts with
   * the given prefix, null otherwise.
   * @param string $string
   * @param string $prefix
   * @return string|null
   */
  /*private function getUrlencodedPrefix(string $string, string $prefix): ?string {
    if (!str_starts_with(rawurldecode($string), $prefix)) {
      return null;
    }

    $len = strlen($prefix);

    if (preg_match(sprintf('#^(%%[[:xdigit:]]{2}|.){%d}#', $len), $string, $match)) {
      return $match[0];
    }

    return null;
  }*/
  private function setBaseUri(): string {
    /*$subdomain = $this->getSubDomain();
    if (!empty($subdomain)) $subdomain = str_replace("$subdomain.", '', $this->getHost());

    return $subdomain . $this->getBasePath();*/
    return $this->getHost() . $this->getBasePath();
  }
  private function setRequestUri() {
    $requestUri = '';

    if ($this->server->get('IIS_WasUrlRewritten') == '1' && $this->server->get('UNENCODED_URL') != '') {
      // IIS7 with URL Rewrite: make sure we get the unencoded URL (double slash problem)
      $requestUri = $this->server->get('UNENCODED_URL');
      $this->server->remove('UNENCODED_URL');
      $this->server->remove('IIS_WasUrlRewritten');
    } elseif ($this->server->has('REQUEST_URI')) {
      $requestUri = $this->server->get('REQUEST_URI');

      if ($requestUri !== '' && $requestUri[0] === '/') {
        // To only use path and query remove the fragment.
        if (false !== $pos = strpos($requestUri, '#')) {
          $requestUri = substr($requestUri, 0, $pos);
        }
      } else {
        // HTTP proxy reqs setup request URI with scheme and host [and port] + the URL path,
        // only use URL path.
        $uriComponents = parse_url($requestUri);

        if (isset($uriComponents['path'])) {
          $requestUri = $uriComponents['path'];
        }

        if (isset($uriComponents['query'])) {
          $requestUri .= '?'.$uriComponents['query'];
        }
      }
    } elseif ($this->server->has('ORIG_PATH_INFO')) {
      // IIS 5.0, PHP as CGI
      $requestUri = $this->server->get('ORIG_PATH_INFO');
      if ('' != $this->server->get('QUERY_STRING')) {
        $requestUri .= '?'.$this->server->get('QUERY_STRING');
      }
      $this->server->remove('ORIG_PATH_INFO');
    }

    $requestUri = str_replace(basename($this->server->get('SCRIPT_FILENAME', '')), '', $requestUri);

    if (false !== $pos = strpos($requestUri, '?')) {
      $requestUri = substr($requestUri, 0, $pos);
    }

    // normalize the request URI to ease creating sub-requests from this request
    $this->server->set('REQUEST_URI', $requestUri);

    return $requestUri;
  }
  private function setMode(): void {
    if (isset($_REQUEST['mode'])) {
      $this->main->setCmsParam('mode', $_REQUEST['mode']);
      $this->route = false;
    }
  }

  private function setRoute(): string {
    $main = $this->main;

    if (OUTSIDE) return $this->request->get('targetPage') ?? 'public';

    if ($main->isDealer() && !$main->getCmsParam(VC::USE_DEAL_SUBDOMAIN)) {
      preg_match('/^\/' . DEALERS_PATH . '\/(?:\d+)\/(\w+)/', $this->getRequestUri(), $match);
    } else {
      preg_match('/^\/(\w+)/', $this->getRequestUri(), $match);
    }

    if (isset($match[1])) {
      if (in_array($match[1], [PUBLIC_PAGE, 'public'])) $match[1] = 'public';
      else if (!$main->availablePage($match[1])) $match[1] = '404';
    }
    $route = $match[1] ?? ($this->main->availablePage(PUBLIC_PAGE) ? 'public' : $this->main->getSideMenu(true));
    $this->requestUri = str_replace($route . '/', '', $this->requestUri);

    return $route;
  }
  private function setRoutePath(): string {
    $route = $this->route === 'public' ? PUBLIC_PAGE : $this->route;
    $view = CORE . 'views/';

    if ($this->main->isDealer() && file_exists($this->getPath(true) . "public/views/$route.php"))
      return $this->getPath(true) . "public/views/$route.php";

    if (file_exists($this->getBasePath(true) . "public/views/$route.php"))
      return $this->getBasePath(true) . "public/views/$route.php";

    if (file_exists($view . "$route.php"))
      return $view . "$route.php";

    if (file_exists($view . $route . "/$route.php"))
      return $view . $route . "/$route.php";

    return $view . '404.php';
  }
  private function setCoreUri() {
    // Определять автоматом.
    /*$sitePath = trim(str_replace('/', ' ', $this->sitePath));
    $siteLevel = count(explode(' ', $sitePath));
    //$corePath = trim(str_replace($_SERVER['DOCUMENT_ROOT'] . '/', ' ', $this->corePath));
    //$coreLevel = count(explode(' ', $corePath));*/
    //$coreUri = str_repeat('../', $siteLevel) . 'core/';

    $this->coreUri = $this->getBaseUri() . $this->corePath;
  }

  private function checkDealer() {
    $requestUri = $this->getRequestUri();
    $isDealer = includes($requestUri, DEALERS_PATH . '/');

    if (!$isDealer) {
      $httpOrigin = $this->server->get('HTTP_ORIGIN'); // ver 8 null, HTTP_REFERER too
      if ($httpOrigin) $requestUri = str_replace($httpOrigin, '', $this->server->get('HTTP_REFERER'));
      $isDealer = includes($requestUri, DEALERS_PATH . '/');
    }

    if ($isDealer) {
      preg_match('/' . DEALERS_PATH . '\/(.+?)\//', $requestUri, $match); // получить ID дилера

      if (!isset($match[1])) die('Dealer id not found!');
      if (is_numeric($match[1])) {
        if (!$this->isLocalDealer($match[1]) && !is_dir(ABS_SITE_PATH . DEALERS_PATH . DIRECTORY_SEPARATOR . $match[1])) $isDealer = false;
        else $this->main->setCmsParam(VC::DEALER_ID, $match[1]);
      } else {
        $this->main->setCmsParam(VC::DEALER_LINK, $match[1]);
      }
    }

    $this->main->setCmsParam(VC::IS_DEALER, $isDealer);
  }
  // Попытка сделать одну папку ресурсов для разработки дилеров
  public function isLocalDealer(string $id): bool {
    return false && $this->server->get('REMOTE_ADDR') === '127.0.0.1' && $id === '1';
  }

  public function getScheme(): string {
    return $this->scheme;
  }
  public function getHost(): string { return $this->host; }
  public function getSubDomain(): string { return $this->subDomain; }
  public function getBaseUri(): string {
    if ($this->baseUri === null) $this->baseUri = $this->setBaseUri();

    return $this->baseUri;
  }
  public function getUri(bool $useDealerPath = false): string {
    return $this->getHost() . ($useDealerPath ? $this->getPath() : $this->getPathBySubdomain());
  }

  public function getCorePath(bool $absolute = false): string {
    return ($absolute ? $this->absolutePath : '') . $this->corePath;
  }
  public function getCoreUri(): string { return $this->coreUri; }

  public function getBasePath(bool $absolute = false): string {
    return $absolute ? $this->absolutePath : $this->baseSitePath;
  }
  public function getPath(bool $absolute = false): string {
    $absolutePath = $absolute ? $this->absolutePath : '';

    if ($this->sitePath === null) $this->sitePath = $this->setSitePath();

    if ($absolute) {
      if ($this->baseSitePath !== '/') $absolutePath = str_replace($this->baseSitePath, '', $this->absolutePath);
      else $absolutePath = substr($absolutePath, 0, strlen($absolutePath) - 1);
    }

    return $absolutePath . $this->sitePath;
  }
  public function getPathBySubdomain(): string {
    $link = '';

    if ($this->main->isDealer() && !$this->main->getCmsParam(VC::USE_DEAL_SUBDOMAIN)) {
      $id = $this->main->getCmsParam(VC::DEALER_ID);
      $link = 'dealer/' . $id . '/';
    }

    return $this->getBasePath() . $link;
  }

  /**
   * Returns the requested URI (path and query string).
   *
   * @return string The raw URI (i.e. not URI decoded)
   */
  public function getRequestUri(): string {
    if ($this->requestUri === null) $this->requestUri = $this->setRequestUri();

    return $this->requestUri;
  }

  public function getRoute(): string {
    if ($this->route === null) $this->route = $this->setRoute();

    return $this->route;
  }
  public function getRoutePath(): string {
    if ($this->routePath === null) $this->routePath = $this->setRoutePath();

    return $this->routePath;
  }
}
