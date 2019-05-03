const {isObject} = require('./index');

describe('Utils -> isObject', () => {
  test('should return true if an object is passed', () => {
    expect(isObject({})).toBe(true);
  });
  test('should return false if undefined is passed', () => {
    expect(isObject(undefined)).toBe(false);
  });
  test('should return false if null is passed', () => {
    expect(isObject(null)).toBe(false);
  });
  test('should return false if a string is passed', () => {
    expect(isObject('string')).toBe(false);
  });
});