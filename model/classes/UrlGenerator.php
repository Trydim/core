<?php

use Helpers\InputBag;
use Helpers\ServerBag;
use Helpers\HeaderBag;

class UrlGenerator {
  const LOCAL_IP = '127.0.0.1';
  const DEV_SUBDOMAIN = 'dev';

  private Main $main;
  public InputBag $request;
  public ServerBag $server;
  public HeaderBag $headers;

  private string $method;

  /**
   * Absolute path set in index.php
   */
  private string $absolutePath;

  /**
   * @var 'http'|'https'
   */
  private string $scheme;
  private string $host;
  private string $subDomain = '';

  /**
   * relative path from "Document Root"
   */
  private string $baseSitePath;

  /**
   * relative path from "Document Root"
   */
  private string $sitePath;

  /**
   * absolute core path
   */
  private string $corePath;

  private string $coreUrl;
  private string $route;
  private string $routePath;
  private string $requestUri;
  private string $baseUri;

  private bool|null $isLocal = null;

  public function __construct(Main $main) {
    $this->main = $main;
    $this->request = new InputBag($_REQUEST);
    $this->server  = new ServerBag($_SERVER);
    $this->headers = new HeaderBag($this->server->getHeaders());

    $this->absolutePath = str_replace('\\', '/', ABS_SITE_PATH);
    $this->corePath = str_replace('\\', '/', 'core/');
    $this->method = $this->server->get('REQUEST_METHOD');

    $this->setScheme();
    $this->setSubDomain($this->setHost());
    $this->setBaseSitePath();
    $this->setCoreUrls();
    $this->checkDealer();
    $this->setMode();
  }

  private function setScheme(): void
  {
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
  private function setSubDomain(string $host): void
  {
    if ($this->server->get('REMOTE_ADDR') === self::LOCAL_IP) return;

    $host = explode('.', $host);
    $subDomain  = $host[0];
    $mainDomain = count($host) > 2 ? $host[1] : $host[0];

    if ($subDomain !== $mainDomain && $subDomain !== self::DEV_SUBDOMAIN) {
      $this->subDomain = $subDomain;
    }
  }
  private function setBaseSitePath(): void
  {
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
  private function setCoreUrls(): void
  {
    // Определять автоматом.
    /*$sitePath = trim(str_replace('/', ' ', $this->sitePath));
    $siteLevel = count(explode(' ', $sitePath));
    //$corePath = trim(str_replace($_SERVER['DOCUMENT_ROOT'] . '/', ' ', $this->corePath));
    //$coreLevel = count(explode(' ', $corePath));*/
    //$coreUrl = str_repeat('../', $siteLevel) . 'core/';

    $this->coreUrl = $this->getBaseUri() . $this->corePath;
  }

  private function getDealerFromUri(string $uri): array
  {
    $path = parse_url($uri, PHP_URL_PATH) ?? '';
    $path = str_replace(basename($this->server->get('SCRIPT_FILENAME', '')), '', $path);

    if (!includes($path, DEALERS_PATH . '/')) return [false, null];

    preg_match('#(?:^|/)' . preg_quote(DEALERS_PATH, '#') . '/([^/]+)(?:/|$)#', $path, $match);

    return [true, $match[1] ?? null];
  }
  private function checkDealer(): void
  {
    [$isDealer, $dealerId] = $this->getDealerFromUri($this->getRequestUri());

    if (!$isDealer) {
      $referer = $this->server->get('HTTP_REFERER', '');
      if ($referer) [$isDealer, $dealerId] = $this->getDealerFromUri($referer);
    }

    if ($isDealer) {
      if (!isset($dealerId)) die('Dealer id not found!');
      if (is_numeric($dealerId)) {
        if (!$this->isLocalDealer($dealerId) && !is_dir(ABS_SITE_PATH . DEALERS_PATH . DIRECTORY_SEPARATOR . $dealerId)) $isDealer = false;
        else $this->main->setCmsParam(VC::DEALER_ID, $dealerId);
      } else {
        $this->main->setCmsParam(VC::DEALER_LINK, $dealerId);
      }
    }

    $this->main->setCmsParam(VC::IS_DEALER, $isDealer);
  }
  // Попытка сделать одну папку ресурсов для разработки дилеров
  public function isLocalQuery(): bool
  {
    if (!isset($this->isLocal)) {
      $this->isLocal = $this->server->get('REMOTE_ADDR') === '127.0.0.1';
    }

    return $this->isLocal;
  }
  public function isLocalDealer(string $id): bool {
    return false;// && $this->isLocalQuery() && $id === '1';
  }

  public function getScheme(): string {
    return $this->scheme;
  }
  public function getHost(): string { return $this->host; }
  public function getSubDomain(): string { return $this->subDomain; }
  public function getBaseUri(): string {
    if (!isset($this->baseUri)) $this->baseUri = $this->setBaseUri();

    return $this->baseUri;
  }
  public function getUri(bool $useDealerPath = false): string {
    return $this->getHost() . ($useDealerPath ? $this->getPath() : $this->getPathBySubdomain());
  }

  public function getCorePath(bool $absolute = false): string {
    return ($absolute ? $this->absolutePath : '') . $this->corePath;
  }

  public function getUrl(string $type): string {
    return match ($type) {
      VC::CORE_CSS => $this->coreUrl . 'assets/css/',
      VC::CORE_JS => $this->coreUrl . 'assets/js/',
      default => $this->coreUrl,
    };
  }

  public function getBasePath(bool $absolute = false): string {
    return $absolute ? $this->absolutePath : $this->baseSitePath;
  }
  public function getPath(bool $absolute = false): string {
    $absolutePath = $absolute ? $this->absolutePath : '';

    if (!isset($this->sitePath)) $this->sitePath = $this->setSitePath();

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
    if (!isset($this->requestUri)) $this->requestUri = $this->setRequestUri();

    return $this->requestUri;
  }

  public function getRoute(): string {
    if (!isset($this->route)) $this->route = $this->setRoute();

    return $this->route;
  }
  public function getRoutePath(): string {
    if (!isset($this->routePath)) $this->routePath = $this->setRoutePath();

    return $this->routePath;
  }
}
