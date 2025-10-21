import { describe, expect, it } from 'vitest';
import {
  absMoney,
  cloneMoney,
  formatMoney,
  formatMoneyShort,
  isLessThanZero,
  isMoneyGreaterThan,
  isMoneyLessThan,
  isMoreThanZero,
  isNotZero,
  isZero,
  maxMoney,
  minMoney,
  negateMoney,
  newMoney,
  subtractMoney,
  sumMoney,
} from '.';

describe('Money', () => {
  describe('formatMoney', () => {
    it('should format an EUR amount', () => {
      expect(formatMoney({ amount: '123.45', currency: 'EUR' })).toEqual('123,45 €');
    });
    it('should round to two decimals when formatting EUR', () => {
      expect(formatMoney({ amount: '123.456', currency: 'EUR' })).toEqual('123,46 €');
    });
  });

  describe('formatMoneyShort', () => {
    it('should format an amount less than 100k', () => {
      expect(formatMoneyShort({ amount: '123.45', currency: 'EUR' })).toEqual('123,45 €');
    });
    it('should format an amount less than 10 millions', () => {
      expect(formatMoneyShort({ amount: '1234567.89', currency: 'EUR' })).toEqual('1.234.567,89 €');
    });
    it('should format an amount more than 10 millions', () => {
      expect(formatMoneyShort({ amount: '12345678.12', currency: 'EUR' })).toEqual('12,3 M€');
    });
  });

  describe('sumMoney', () => {
    it('should throw when mixing currencies', () => {
      expect(() => sumMoney({ amount: '123.45', currency: 'EUR' }, { amount: '123.45', currency: 'USD' })).toThrow();
    });

    it('should sum values with same currency', () => {
      expect(sumMoney({ amount: '123.45', currency: 'EUR' }, { amount: '234.56', currency: 'EUR' })).toEqual({
        amount: '358.01',
        currency: 'EUR',
      });
    });
  });

  describe('subtractMoney', () => {
    it('should throw when mixing currencies', () => {
      expect(() =>
        subtractMoney({ amount: '123.45', currency: 'EUR' }, { amount: '123.45', currency: 'USD' }),
      ).toThrow();
    });

    it('should subtract values with same currency', () => {
      expect(subtractMoney({ amount: '123.45', currency: 'EUR' }, { amount: '234.56', currency: 'EUR' })).toEqual({
        amount: '-111.11',
        currency: 'EUR',
      });
    });
  });

  describe('negateMoney', () => {
    it('should negate value', () => {
      expect(negateMoney({ amount: '123.45', currency: 'EUR' })).toEqual({
        amount: '-123.45',
        currency: 'EUR',
      });
    });
  });

  describe('absMoney', () => {
    it('should negate negative value', () => {
      expect(absMoney({ amount: '-123.45', currency: 'EUR' })).toEqual({
        amount: '123.45',
        currency: 'EUR',
      });
    });

    it('should not negate positive value', () => {
      expect(absMoney({ amount: '123.45', currency: 'EUR' })).toEqual({
        amount: '123.45',
        currency: 'EUR',
      });
    });
  });

  describe('isZero', () => {
    it('should return true for 0 value', () => {
      expect(isZero({ amount: '0', currency: 'EUR' })).toBeTruthy();
    });

    it('should return false for positive non-zero value', () => {
      expect(isZero({ amount: '0.45', currency: 'EUR' })).toBeFalsy();
    });

    it('should return false for negative non-zero value', () => {
      expect(isZero({ amount: '-0.45', currency: 'EUR' })).toBeFalsy();
    });
  });

  describe('isNotZero', () => {
    it('should return false for 0 value', () => {
      expect(isNotZero({ amount: '0', currency: 'EUR' })).toBeFalsy();
    });

    it('should return true for positive non-zero value', () => {
      expect(isNotZero({ amount: '0.45', currency: 'EUR' })).toBeTruthy();
    });

    it('should return true for negative non-zero value', () => {
      expect(isNotZero({ amount: '-0.45', currency: 'EUR' })).toBeTruthy();
    });
  });

  describe('isMoreThanZero', () => {
    it('should return false for 0 value', () => {
      expect(isMoreThanZero({ amount: '0', currency: 'EUR' })).toBeFalsy();
    });

    it('should return true for positive non-zero value', () => {
      expect(isMoreThanZero({ amount: '55.45', currency: 'EUR' })).toBeTruthy();
    });

    it('should return false for negative non-zero value', () => {
      expect(isMoreThanZero({ amount: '-51.45', currency: 'EUR' })).toBeFalsy();
    });
  });

  describe('isLessThanZero', () => {
    it('should return false for 0 value', () => {
      expect(isLessThanZero({ amount: '0', currency: 'EUR' })).toBeFalsy();
    });

    it('should return false for positive non-zero value', () => {
      expect(isLessThanZero({ amount: '55.45', currency: 'EUR' })).toBeFalsy();
    });

    it('should return true for negative non-zero value', () => {
      expect(isLessThanZero({ amount: '-51.45', currency: 'EUR' })).toBeTruthy();
    });
  });

  describe('isMoneyGreaterThan', () => {
    it('should return true if first value is bigger than second value', () => {
      expect(isMoneyGreaterThan({ amount: '123.45', currency: 'EUR' }, { amount: '24.99', currency: 'EUR' })).toBe(
        true,
      );
    });

    it('should return false if first value is equals to second value', () => {
      expect(isMoneyGreaterThan({ amount: '123.45', currency: 'EUR' }, { amount: '123.45', currency: 'EUR' })).toBe(
        false,
      );
    });

    it('should return false if first value is smaller than second value', () => {
      expect(isMoneyGreaterThan({ amount: '24.99', currency: 'EUR' }, { amount: '123.45', currency: 'EUR' })).toBe(
        false,
      );
    });

    it('should throw when mixing currencies', () => {
      expect(() =>
        isMoneyGreaterThan({ amount: '24.99', currency: 'EUR' }, { amount: '123.45', currency: 'USD' }),
      ).toThrow();
    });
  });

  describe('isMoneyLessThan', () => {
    it('should return false if first value is bigger than second value', () => {
      expect(isMoneyLessThan({ amount: '123.45', currency: 'EUR' }, { amount: '24.99', currency: 'EUR' })).toBe(false);
    });

    it('should return false if first value is equals to second value', () => {
      expect(isMoneyLessThan({ amount: '123.45', currency: 'EUR' }, { amount: '123.45', currency: 'EUR' })).toBe(false);
    });

    it('should return true if first value is smaller than second value', () => {
      expect(isMoneyLessThan({ amount: '24.99', currency: 'EUR' }, { amount: '123.45', currency: 'EUR' })).toBe(true);
    });

    it('should throw when mixing currencies', () => {
      expect(() =>
        isMoneyLessThan({ amount: '24.99', currency: 'EUR' }, { amount: '123.45', currency: 'USD' }),
      ).toThrow();
    });
  });

  describe('maxMoney', () => {
    it('should return the money with higher value', () => {
      expect(
        maxMoney(
          { amount: '0', currency: 'EUR' },
          { amount: '123.45', currency: 'EUR' },
          { amount: '24.99', currency: 'EUR' },
        ),
      ).toEqual({ amount: '123.45', currency: 'EUR' });
    });

    it('should return undefined if nothing is provided', () => {
      expect(maxMoney()).toBeUndefined();
    });

    it('should throw when mixing currencies', () => {
      expect(() =>
        maxMoney(
          { amount: '0', currency: 'EUR' },
          { amount: '123.45', currency: 'USD' },
          { amount: '24.99', currency: 'EUR' },
        ),
      ).toThrow();
    });
  });

  describe('minMoney', () => {
    it('should return the money with smaller value', () => {
      expect(
        minMoney(
          { amount: '0', currency: 'EUR' },
          { amount: '-123.45', currency: 'EUR' },
          { amount: '-24.99', currency: 'EUR' },
        ),
      ).toEqual({ amount: '-123.45', currency: 'EUR' });
    });

    it('should return undefined if nothing is provided', () => {
      expect(minMoney()).toBeUndefined();
    });

    it('should throw when mixing currencies', () => {
      expect(() =>
        minMoney(
          { amount: '0', currency: 'EUR' },
          { amount: '123.45', currency: 'USD' },
          { amount: '24.99', currency: 'EUR' },
        ),
      ).toThrow();
    });
  });

  describe('cloneMoney', () => {
    it('should properly clone the money object', () => {
      const money = newMoney(10.11, 'EUR');
      expect(cloneMoney(money)).toEqual(money);
      expect(cloneMoney(money)).not.toBe(money);
    });
  });
});
