<?php

/**
 * Class registry
 *
 * This function acts as a singleton. If the requested class does not
 * exist it is instantiated and set to a static variable. If it has
 * previously been instantiated the variable is returned.
 *
 * @param string $class - the class name being requested
 * @param string $directory - the directory where the class should be found
 * @param mixed $param - an optional argument to pass to the class constructor
 * @return object
 */
function loadClass(string $class, string $directory = 'libraries', $param = null): object {
  static $classes = [];

  // Does the class exist? If so, we're done...
  if (isset($classes[$class])) return $classes[$class];

  $name = false;

  // TODO заменить папку на мою core/model/classes

  // Look for the class first in the local application/libraries folder
  // then in the native system/libraries folder
  foreach (array(APPPATH, BASEPATH) as $path) {
    if (file_exists($path . $directory . '/' . $class . '.php')) {
      $name = 'CI_' . $class;

      if (class_exists($name, false) === false) {
        require_once($path . $directory . '/' . $class . '.php');
      }

      break;
    }
  }

  // Is the request a class extension? If so we load it too
  if (file_exists(APPPATH . $directory . '/' . config_item('subclass_prefix') . $class . '.php')) {
    $name = config_item('subclass_prefix') . $class;

    if (class_exists($name, false) === false) {
      require_once(APPPATH . $directory . '/' . $name . '.php');
    }
  }

  // Did we find the class?
  if ($name === false) {
    // Note: We use exit() rather than show_error() in order to avoid a
    // self-referencing loop with the Exceptions class
    set_status_header(503);
    echo 'Unable to locate the specified class: ' . $class . '.php';
    exit(5); // EXIT_UNK_CLASS
  }

  // Keep track of what we just loaded
  is_loaded($class);

  $classes[$class] = isset($param)
    ? new $name($param)
    : new $name();
  return $classes[$class];
}

/**
 * Error Logging Interface
 *
 * We use this as a simple mechanism to access the logging
 * class and send messages to be logged.
 *
 * @param string  the error level: 'error', 'debug' or 'info'
 * @param string  the error message
 * @return  void
 */
function log_message($level, $message) {
  static $_log;

  if ($_log === null) {
    // references cannot be directly assigned to static variables, so we use an array
    $_log[0] =& load_class('Log', 'core');
  }

  $_log[0]->write_log($level, $message);
}
