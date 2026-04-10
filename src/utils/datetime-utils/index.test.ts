import { describe, expect, it } from 'vitest';
import { getDateByUnixtimestamp, getStringDateByUnixtimestamp, getStringDateTimeByUnixtimestamp } from '.';

describe('datetime-utils', () => {
  describe('getDateByUnixtimestamp', () => {
    it('should preserve the original calendar fields for a winter timestamp', () => {
      const date = getDateByUnixtimestamp({ unixTimestamp: 1704067200 });

      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });

    it('should preserve the original calendar fields for a summer timestamp', () => {
      const date = getDateByUnixtimestamp({ unixTimestamp: 1719792000 });

      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(6);
      expect(date.getDate()).toBe(1);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });
  });

  describe('getStringDateByUnixtimestamp', () => {
    it('should format the date without shifting the day', () => {
      expect(getStringDateByUnixtimestamp(1704067200)).toBe('01/01/2024');
      expect(getStringDateByUnixtimestamp(1719792000)).toBe('01/07/2024');
    });
  });

  describe('getStringDateTimeByUnixtimestamp', () => {
    it('should keep the original clock time in winter and summer', () => {
      expect(getStringDateTimeByUnixtimestamp({ unixTimestamp: 1704067200, format: 'dd/MM/yyyy HH:mm' })).toBe(
        '01/01/2024 00:00',
      );
      expect(getStringDateTimeByUnixtimestamp({ unixTimestamp: 1719792000, format: 'dd/MM/yyyy HH:mm' })).toBe(
        '01/07/2024 00:00',
      );
    });
  });
});
