<?php

/**
 * @mixin DbMain
 *
 * @property DbMain $db
 * @property DbMain $staticDb
 */
final class DbProxy {
  /**
   * @var DbMain
   */
  private $db;

  /**
   * @var DbMain
   */
  private static $staticDb;

  /**
   * @param DbMain $db
   */
  public function __construct(DbMain $db) {
    $this->db = $db;
    self::$staticDb = $db;
  }

  /**
   * @param $method
   * @param $args
   * @return mixed
   */
  public function __call($method, $args) {
    $this->db->connect();

    return $this->db->$method(...$args);
  }

  /**
   * @param string $method
   * @param $args
   * @return mixed
   */
  public static function __callStatic(string $method, $args) {
    return forward_static_call_array([self::$staticDb, $method], $args);
  }
}
