import { describe, expect, it } from 'vitest';
import {
  buildOutputTypeIds,
  getReportOutputsState,
  needsSystemWarrantyConfirmation,
  toggleReportOutput,
} from './reportOutputs';

describe('report outputs', () => {
  it('splits the warranty from the other outputs and keeps codes without a checkbox', () => {
    expect(getReportOutputsState([3, 6, 8, 13])).toEqual({ outputTypeIds: [3, 8, 13], underWarranty: true });
    expect(getReportOutputsState([7, 9])).toEqual({ outputTypeIds: [9], underWarranty: false });
    expect(getReportOutputsState(undefined)).toEqual({ outputTypeIds: [], underWarranty: false });
  });

  it('always saves exactly one of 6 and 7', () => {
    expect(buildOutputTypeIds({ outputTypeIds: [], underWarranty: false })).toEqual([7]);
    expect(buildOutputTypeIds({ outputTypeIds: [13, 1], underWarranty: true })).toEqual([1, 6, 13]);
  });

  it('toggles a checkbox without duplicates', () => {
    const state = { outputTypeIds: [1], underWarranty: false };
    expect(toggleReportOutput(state, 1, true).outputTypeIds).toEqual([1]);
    expect(toggleReportOutput(state, 4, true).outputTypeIds).toEqual([1, 4]);
    expect(toggleReportOutput(state, 1, false).outputTypeIds).toEqual([]);
  });
});

describe('needsSystemWarrantyConfirmation', () => {
  const now = new Date('2026-11-23T10:00:00Z');
  const future = Date.parse('2027-01-01T00:00:00Z') / 1000;
  const past = Date.parse('2026-01-01T00:00:00Z') / 1000;

  it('asks for a new report on a system still under warranty', () => {
    expect(
      needsSystemWarrantyConfirmation({ isNewReport: true, underWarranty: false, warrantyDeadline: future, now }),
    ).toBe(true);
  });

  it('does not ask for an expired or missing warranty', () => {
    expect(
      needsSystemWarrantyConfirmation({ isNewReport: true, underWarranty: false, warrantyDeadline: past, now }),
    ).toBe(false);
    expect(needsSystemWarrantyConfirmation({ isNewReport: true, underWarranty: false, warrantyDeadline: 0, now })).toBe(
      false,
    );
  });

  it('does not ask when editing or when already under warranty', () => {
    expect(
      needsSystemWarrantyConfirmation({ isNewReport: false, underWarranty: false, warrantyDeadline: future, now }),
    ).toBe(false);
    expect(
      needsSystemWarrantyConfirmation({ isNewReport: true, underWarranty: true, warrantyDeadline: future, now }),
    ).toBe(false);
  });
});
