const {isFunction} = require('./index');

describe('Utils -> isFunction', () => {
  test('should return true if a function is passed', () => {
    expect(isFunction(() => {})).toBe(true);
  });

  test('should return false if undefined is passed', () => {
    expect(isFunction(undefined)).toBe(false);
  });

  test('should return false if null is passed', () => {
    expect(isFunction(null)).toBe(false);
  });

  test('should return false if an object is passed', () => {
    expect(isFunction({})).toBe(false);
  });
  test('should return false if a string is passed', () => {
    expect(isFunction('string')).toBe(false);
  });
});