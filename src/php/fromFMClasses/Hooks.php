<?php

namespace cms;

if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * Hooks Class
 *
 * Provides a mechanism to extend the base system without hacking.
 *
 * @package    CodeIgniter
 * @subpackage  Libraries
 * @category  Libraries
 * @author    EllisLab Dev Team
 * @link    https://codeigniter.com/user_guide/general/hooks.html
 */
class NHooks {

  /**
   * Determines whether hooks are enabled
   *
   * @var  bool
   */
  public $enabled = false;

  /**
   * List of all hooks set in config/hooks.php
   *
   * @var  array
   */
  public $hooks = [];

  /**
   * Array with class objects to use hooks methods
   *
   * @var array
   */
  protected $_objects = array();

  /**
   * In progress flag
   *
   * Determines whether hook is in progress, used to prevent infinte loops
   *
   * @var  bool
   */
  protected $_in_progress = false;

  /**
   * Class constructor
   *
   * @return  void
   */
  public function __construct() {
    $CFG = loadClass('Config', 'core');
    log_message('info', 'Hooks Class Initialized');

    // If hooks are not enabled in the config file
    // there is nothing else to do
    if ($CFG->item('enable_hooks') === false) {
      return;
    }

    // Grab the "hooks" definition file.
    if (file_exists(APPPATH . 'config/hooks.php')) {
      include(APPPATH . 'config/hooks.php');
    }

    if (file_exists(APPPATH . 'config/' . ENVIRONMENT . '/hooks.php')) {
      include(APPPATH . 'config/' . ENVIRONMENT . '/hooks.php');
    }

    // If there are no hooks, we're done.
    if (!isset($hook) or !is_array($hook)) {
      return;
    }

    $this->hooks =& $hook;
    $this->enabled = true;
  }

  // --------------------------------------------------------------------

  /**
   * Call Hook
   *
   * Calls a particular hook. Called by CodeIgniter.php.
   *
   * @param string $hookName - Hook name
   * @return  bool  TRUE on success or FALSE on failure
   * @uses CI_Hooks::fireHook()
   *
   */
  public function callHook(string $hookName = '') {
    if (!$this->enabled || !isset($this->hooks[$hookName])) return false;

    if (is_array($this->hooks[$hookName]) && !isset($this->hooks[$hookName]['function'])) {
      foreach ($this->hooks[$hookName] as $val) {
        $this->fireHook($val);
      }
    } else {
      $this->fireHook($this->hooks[$hookName]);
    }

    return true;
  }

  // --------------------------------------------------------------------

  /**
   * Run Hook
   *
   * Runs a particular hook
   *
   * @param array $data Hook details
   * @return bool TRUE on success or FALSE on failure
   */
  protected function fireHook(array $data) {
    // Closures/lambda functions and array($object, 'method') callables
    if (is_callable($data)) {
      is_array($data) ? $data[0]->{$data[1]}() : $data();

      return true;
    } elseif (!is_array($data)) {
      return false;
    }

    // -----------------------------------
    // Safety - Prevents run-away loops
    // -----------------------------------

    // If the script being called happens to have the same
    // hook call within it a loop can happen
    if ($this->_in_progress === true) {
      return;
    }

    // -----------------------------------
    // Set file path
    // -----------------------------------

    if (!isset($data['filepath'], $data['filename'])) return false;

    $filepath = APPPATH . $data['filepath'] . '/' . $data['filename'];

    if (!file_exists($filepath)) return false;

    // Determine and class and/or function names
    $class = empty($data['class']) ? false : $data['class'];
    $function = empty($data['function']) ? false : $data['function'];
    $params = isset($data['params']) ? $data['params'] : '';

    if (empty($function)) return false;

    // Set the _in_progress flag
    $this->_in_progress = true;

    // Call the requested class and/or function
    if ($class !== false) {
      // The object is stored?
      if (isset($this->_objects[$class])) {
        if (method_exists($this->_objects[$class], $function)) {
          $this->_objects[$class]->$function($params);
        } else {
          return $this->_in_progress = false;
        }
      } else {
        class_exists($class, false) or require_once($filepath);

        if (!class_exists($class, false) or !method_exists($class, $function)) {
          return $this->_in_progress = false;
        }

        // Store the object and execute the method
        $this->_objects[$class] = new $class();
        $this->_objects[$class]->$function($params);
      }
    } else {
      function_exists($function) or require_once($filepath);

      if (!function_exists($function)) {
        return $this->_in_progress = false;
      }

      $function($params);
    }

    $this->_in_progress = false;
    return true;
  }

}
