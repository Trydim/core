<?php


namespace Helpers;

class ParameterBag
{
  /**
   * Parameter storage.
   */
  protected $parameters;

  public function __construct(array $parameters = [])
  {
    $this->parameters = $parameters;
  }

  /**
   * Returns the parameters.
   *
   * @param string|null $key The name of the parameter to return or null to get them all
   *
   * @return array An array of parameters
   */
  public function all(/*string $key = null*/)
  {
    $key = func_num_args() > 0 ? func_get_arg(0) : null;

    if (null === $key) {
      return $this->parameters;
    }

    if (!is_array($value = $this->parameters[$key] ?? [])) {
      die(sprintf('Unexpected value for parameter "%s": expecting "array", got "%s".', $key, $value));
    }

    return $value;
  }

  /**
   * Returns the parameter keys.
   *
   * @return array An array of parameter keys
   */
  public function keys()
  {
    return array_keys($this->parameters);
  }

  /**
   * Replaces the current parameters by a new set.
   * @param array $parameters
   */
  public function replace(array $parameters = [])
  {
    $this->parameters = $parameters;
  }

  /**
   * Adds parameters.
   * @param array $parameters
   */
  public function add(array $parameters = [])
  {
    $this->parameters = array_replace($this->parameters, $parameters);
  }

  /**
   * Returns a parameter by name.
   *
   * @param string $key
   * @param mixed $default The default value if the parameter key does not exist
   *
   * @return mixed
   */
  public function get(string $key, $default = null)
  {
    return array_key_exists($key, $this->parameters) ? $this->parameters[$key] : $default;
  }

  /**
   * Sets a parameter by name.
   *
   * @param string $key
   * @param mixed $value The value
   */
  public function set(string $key, $value)
  {
    $this->parameters[$key] = $value;
  }

  /**
   * Returns true if the parameter is defined.
   *
   * @param string $key
   * @return bool true if the parameter exists, false otherwise
   */
  public function has(string $key)
  {
    return \array_key_exists($key, $this->parameters);
  }

  /**
   * Removes a parameter.
   * @param string $key
   */
  public function remove(string $key)
  {
    unset($this->parameters[$key]);
  }

  /**
   * Returns the alphabetic characters of the parameter value.
   *
   * @param string $key
   * @param string $default
   * @return string The filtered value
   */
  public function getAlpha(string $key, string $default = '')
  {
    return preg_replace('/[^[:alpha:]]/', '', $this->get($key, $default));
  }

  /**
   * Returns the alphabetic characters and digits of the parameter value.
   *
   * @param string $key
   * @param string $default
   * @return string The filtered value
   */
  public function getAlnum(string $key, string $default = '')
  {
    return preg_replace('/[^[:alnum:]]/', '', $this->get($key, $default));
  }

  /**
   * Returns the digits of the parameter value.
   *
   * @param string $key
   * @param string $default
   * @return string The filtered value
   */
  public function getDigits(string $key, string $default = '')
  {
    // we need to remove - and + because they're allowed in the filter
    return str_replace(['-', '+'], '', $this->filter($key, $default, \FILTER_SANITIZE_NUMBER_INT));
  }

  /**
   * Returns the parameter value converted to integer.
   *
   * @param string $key
   * @param int $default
   * @return int The filtered value
   */
  public function getInt(string $key, int $default = 0)
  {
    return (int) $this->get($key, $default);
  }

  /**
   * Returns the parameter value converted to boolean.
   *
   * @param string $key
   * @param bool $default
   * @return bool The filtered value
   */
  public function getBoolean(string $key, bool $default = false)
  {
    return $this->filter($key, $default, \FILTER_VALIDATE_BOOLEAN);
  }

  /**
   * Filter key.
   *
   * @param string $key
   * @param mixed $default Default = null
   * @param int $filter FILTER_* constant
   * @param mixed $options Filter options
   *
   * @return mixed
   * @see https://php.net/filter-var
   *
   */
  public function filter(string $key, $default = null, int $filter = \FILTER_DEFAULT, $options = [])
  {
    $value = $this->get($key, $default);

    // Always turn $options into an array - this allows filter_var option shortcuts.
    if (!\is_array($options) && $options) {
      $options = ['flags' => $options];
    }

    // Add a convenience check for arrays.
    if (\is_array($value) && !isset($options['flags'])) {
      $options['flags'] = \FILTER_REQUIRE_ARRAY;
    }

    if ((\FILTER_CALLBACK & $filter) && !(($options['options'] ?? null) instanceof \Closure)) {
      trigger_deprecation('symfony/http-foundation', '5.2', 'Not passing a Closure together with FILTER_CALLBACK to "%s()" is deprecated. Wrap your filter in a closure instead.', __METHOD__);
    }

    return filter_var($value, $filter, $options);
  }

  /**
   * Returns an iterator for parameters.
   *
   * @return \ArrayIterator An \ArrayIterator instance
   */
  #[\ReturnTypeWillChange]
  public function getIterator()
  {
    return new \ArrayIterator($this->parameters);
  }

  /**
   * Returns the number of parameters.
   *
   * @return int The number of parameters
   */
  #[\ReturnTypeWillChange]
  public function count()
  {
    return \count($this->parameters);
  }

}
