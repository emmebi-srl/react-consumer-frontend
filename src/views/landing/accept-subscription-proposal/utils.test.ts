import { describe, expect, it } from 'vitest';
import { getSuggestedSecondMaintenanceMonth } from './utils';

describe('accept-subscription-proposal utils', () => {
  describe('getSuggestedSecondMaintenanceMonth', () => {
    it('should suggest the second maintenance month six months later when still within december', () => {
      expect(getSuggestedSecondMaintenanceMonth(1)).toBe(7);
      expect(getSuggestedSecondMaintenanceMonth(6)).toBe(12);
    });

    it('should not suggest a month when adding six months would exceed december', () => {
      expect(getSuggestedSecondMaintenanceMonth(7)).toBeUndefined();
      expect(getSuggestedSecondMaintenanceMonth(12)).toBeUndefined();
    });

    it('should not suggest a month when the first maintenance month is missing', () => {
      expect(getSuggestedSecondMaintenanceMonth(undefined)).toBeUndefined();
    });
  });
});
