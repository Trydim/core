<?php


namespace Helpers;

use ArrayIterator;
use Closure;

class ParameterBag {
  /**
   * Parameters storage.
   */
  protected array $parameters;

  public function __construct(array $parameters = []) {
    $this->parameters = $parameters;
  }

  /**
   * Returns the parameters.
   */
  public function all(): array
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
  public function keys(): array
  {
    return array_keys($this->parameters);
  }

  public function replace(array $parameters = []): void
  {
    $this->parameters = $parameters;
  }

  public function add(array $parameters = []): void
  {
    $this->parameters = array_replace($this->parameters, $parameters);
  }

  /**
   * Returns a parameter by name.
   */
  public function get(string $key, mixed $default = null): mixed
  {
    return array_key_exists($key, $this->parameters) ? $this->parameters[$key] : $default;
  }

  /**
   * Sets a parameter by name.
   */
  public function set(string $key, mixed $value): void
  {
    $this->parameters[$key] = $value;
  }

  /**
   * Returns true if the parameter is defined.
   *
   * @return bool true if the parameter exists, false otherwise
   */
  public function has(string $key): bool
  {
    return array_key_exists($key, $this->parameters);
  }

  /**
   * Removes a parameter.
   */
  public function remove(string $key): void
  {
    unset($this->parameters[$key]);
  }

  /**
   * Returns the alphabetic characters of the parameter value.
   *
   * @param string $default The default value if the parameter key does not exist
   *
   * @return string The filtered value
   */
  public function getAlpha(string $key, string $default = ''): string
  {
    return preg_replace('/[^[:alpha:]]/', '', $this->get($key, $default));
  }

  /**
   * Returns the alphabetic characters and digits of the parameter value.
   *
   * @param string $default The default value if the parameter key does not exist
   *
   * @return string The filtered value
   */
  public function getAlnum(string $key, string $default = ''): string
  {
    return preg_replace('/[^[:alnum:]]/', '', $this->get($key, $default));
  }

  /**
   * Returns the digits of the parameter value.
   *
   * @param string $default The default value if the parameter key does not exist
   *
   * @return string The filtered value
   */
  public function getDigits(string $key, string $default = ''): string
  {
    // we need to remove - and + because they're allowed in the filter
    return str_replace(['-', '+'], '', $this->filter($key, $default, FILTER_SANITIZE_NUMBER_INT));
  }

  /**
   * Returns the parameter value converted to integer.
   *
   * @param int $default The default value if the parameter key does not exist
   *
   * @return int The filtered value
   */
  public function getInt(string $key, int $default = 0): int
  {
    return (int)$this->get($key, $default);
  }

  /**
   * Filter key.
   *
   * @param int $filter FILTER_* constant
   * @param null|array $options Filter options
   *
   * @see https://php.net/filter-var
   */
  public function filter(string $key, mixed $default = null, int $filter = FILTER_DEFAULT, null|array $options = []): mixed
  {
    $value = $this->get($key, $default);

    // Always turn $options into an array - this allows filter_var option shortcuts.
    if (!is_array($options) && $options) {
      $options = ['flags' => $options];
    }

    // Add a convenience check for arrays.
    if (is_array($value) && !isset($options['flags'])) {
      $options['flags'] = FILTER_REQUIRE_ARRAY;
    }

    if ((FILTER_CALLBACK & $filter) && !(($options['options'] ?? null) instanceof Closure)) {
      trigger_deprecation('symfony/http-foundation', '5.2', 'Not passing a Closure together with FILTER_CALLBACK to "%s()" is deprecated. Wrap your filter in a closure instead.', __METHOD__);
    }

    return filter_var($value, $filter, $options);
  }

  /**
   * Returns the parameter value converted to boolean.
   *
   * @param bool $default The default value if the parameter key does not exist
   * @return bool The filtered value
   */
  public function getBoolean(string $key, bool $default = false): bool
  {
    return $this->filter($key, $default, FILTER_VALIDATE_BOOLEAN);
  }

  /**
   * Returns an iterator for parameters.
   *
   * @return ArrayIterator An \ArrayIterator instance
   */
  #[\ReturnTypeWillChange]
  public function getIterator(): ArrayIterator
  {
    return new ArrayIterator($this->parameters);
  }

  /**
   * Returns the number of parameters.
   *
   * @return int The number of parameters
   */
  #[\ReturnTypeWillChange]
  public function count(): int
  {
    return count($this->parameters);
  }
}
