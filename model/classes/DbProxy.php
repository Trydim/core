<?php

/**
 * @mixin DbMain
 *
 * @property DbMain $db
 * @property DbMain $staticDb
 */
final class DbProxy {
  private DbMain $db;

  public static DbMain $staticDb;

  public function __construct(DbMain $db) {
    $this->db = $db;
    self::$staticDb = $db;
  }

  public function __call(string $method, mixed $args) {
    $this->db->connect();

    return $this->db->$method(...$args);
  }

  public static function __callStatic(string $method, mixed $args) {
    return self::$staticDb::$method(...$args);

    //return forward_static_call_array([self::$staticDb, $method], $args);
  }
}
