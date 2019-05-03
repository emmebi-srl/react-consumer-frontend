const {isArray} = require('./index');

describe('Utils -> isArray', () => {
  test('should return true if an array is passed', () => {
    expect(isArray([])).toBe(true);
  });
  test('should return false if undefined is passed', () => {
    expect(isArray(undefined)).toBe(false);
  });
  test('should return false if null is passed', () => {
    expect(isArray(null)).toBe(false);
  });
  test('should return false if a string is passed', () => {
    expect(isArray('string')).toBe(false);
  });
});