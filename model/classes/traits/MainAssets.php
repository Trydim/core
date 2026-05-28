<?php

/**
 * Trait Assets
 * @package cms
 */
trait Assets
{
  /**
   * Adds CSS or JS assets to the base template.
   *
   * @param string|string[] $assets
   * @param 'before'|'after' $position
   * @param 'mtime'|'time'|bool $version
   * @return Main
   */
  public function addAssets(string|array $assets, string $position = 'after', string|bool $version = 'mtime'): Main
  {
    foreach ((array)$assets as $asset) {
      if (!is_string($asset) || trim($asset) === '') continue;

      $asset = trim(str_replace('\\', '/', $asset));
      $assetPath = $this->getAssetPathWithoutSuffix($asset);
      $extension = strtolower(pathinfo($assetPath, PATHINFO_EXTENSION));

      $fieldKey = match ($extension) {
        'css' => VC::BASE_CSS_LINKS,
        'js'  => VC::BASE_JS_LINKS,
        default => null,
      };

      if ($fieldKey === null) continue;

      if (!isset($this->controllerField[$fieldKey])) $this->controllerField[$fieldKey] = [];

      $this->addControllerField($fieldKey, $this->resolveAssetUrl($asset, $extension, $version), $position);
    }

    return $this;
  }

  private function resolveAssetUrl(string $asset, string $extension, string|bool $version): string
  {
    if ($this->isAbsoluteAssetUrl($asset)) return $asset;

    $assetPathWithoutSuffix = $this->getAssetPathWithoutSuffix($asset);
    $assetPath = ltrim($assetPathWithoutSuffix, '/');
    $assetSuffix = substr($asset, strlen($assetPathWithoutSuffix));

    $publicUri = $this->getAssetPublicUri($extension);
    $candidates = [
      [
        'path' => $this->url->getBasePath(true) . $assetPath,
        'url'  => $this->url->getBaseUri() . $assetPath,
      ],
      [
        'path' => $this->getAssetAbsolutePathByUri($publicUri, $assetPath),
        'url'  => $publicUri . $assetPath,
      ],
      [
        'path' => $this->url->getCorePath(true) . 'assets/' . $extension . '/' . $assetPath,
        'url'  => $this->url->getBaseUri() . 'core/assets/' . $extension . '/' . $assetPath,
      ],
    ];

    foreach ($candidates as $candidate) {
      if ($candidate['path'] && file_exists($candidate['path'])) {
        return $this->addAssetVersion($candidate['url'] . $assetSuffix, $candidate['path'], $version);
      }
    }

    return $this->url->getBaseUri() . ltrim($asset, '/');
  }

  private function addAssetVersion(string $assetUrl, string $assetPath, string|bool $version): string
  {
    $versionValue = match ($version) {
      'time', true => time(),
      'mtime' => filemtime($assetPath),
      default => null,
    };

    if (!$versionValue) return $assetUrl;

    return $assetUrl . (str_contains($assetUrl, '?') ? '&' : '?') . 'ver=' . $versionValue;
  }

  private function getAssetPublicUri(string $extension): string
  {
    $uri = $this->getCmsParam($extension === 'css' ? VC::URI_CSS : VC::URI_JS, '');

    return $uri ? rtrim($uri, '/') . '/' : '';
  }

  private function getAssetAbsolutePathByUri(string $uri, string $assetPath): ?string
  {
    $baseUri = $this->url->getBaseUri();

    if (!str_starts_with($uri, $baseUri)) return null;

    return $this->url->getBasePath(true) . substr($uri, strlen($baseUri)) . $assetPath;
  }

  private function getAssetPathWithoutSuffix(string $asset): string
  {
    return preg_replace('/[?#].*$/', '', $asset);
  }

  private function isAbsoluteAssetUrl(string $asset): bool
  {
    return str_starts_with($asset, '//') || str_contains($asset, '://');
  }
}
