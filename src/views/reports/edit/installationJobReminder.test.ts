import { describe, expect, it } from 'vitest';
import { ReportStatus } from '~/types/aries-proxy/reports';
import { needsInstallationJobConfirmation } from './installationJobReminder';

const statuses: ReportStatus[] = [
  { id: 1, name: 'DA FATTURARE', color: 'clyellow', isBlocked: false, isInvoiced: false },
  { id: 2, name: 'FATTURATO', color: 'cllime', isBlocked: false, isInvoiced: true },
];

const jobLink = { jobId: 5, jobYear: 2026, subJobId: 1, lotId: 1 };

describe('needsInstallationJobConfirmation', () => {
  it('asks for an installation report not invoiced and without job', () => {
    expect(needsInstallationJobConfirmation({ interventionTypeId: 1, statusId: 1, statuses })).toBe(true);
  });

  it('does not ask when the report is linked to a job', () => {
    expect(needsInstallationJobConfirmation({ interventionTypeId: 1, statusId: 1, statuses, jobLink })).toBe(false);
  });

  it('does not ask when the status is invoiced', () => {
    expect(needsInstallationJobConfirmation({ interventionTypeId: 1, statusId: 2, statuses })).toBe(false);
  });

  it('does not ask for other intervention types', () => {
    expect(needsInstallationJobConfirmation({ interventionTypeId: 2, statusId: 1, statuses })).toBe(false);
  });

  it('asks when the status is unknown or the statuses are not loaded', () => {
    expect(needsInstallationJobConfirmation({ interventionTypeId: 1, statusId: 99, statuses })).toBe(true);
    expect(needsInstallationJobConfirmation({ interventionTypeId: 1, statusId: 1 })).toBe(true);
  });
});
