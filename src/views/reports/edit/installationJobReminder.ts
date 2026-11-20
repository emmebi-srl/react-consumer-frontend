import { INSTALLATION_INTERVENTION_TYPE_ID, ReportJobLink, ReportStatus } from '~/types/aries-proxy/reports';

export const INSTALLATION_WITHOUT_JOB_QUESTION =
  'Attenzione, il rapporto di installazione non è stato associato a nessuna commessa. Continuare?';

interface InstallationJobReminderInput {
  interventionTypeId?: number;
  statusId?: number;
  statuses?: ReportStatus[];
  jobLink?: ReportJobLink | null;
}

/**
 * Same rule as the Delphi report editor (`ConfirmInstallationWithoutJob`): an INSTALLAZIONE report whose status
 * is not invoiced (`stato_rapporto.fatturato = 0`) and has no job lot linked asks for confirmation before saving.
 * An unknown status counts as not invoiced.
 */
export const needsInstallationJobConfirmation = ({
  interventionTypeId,
  statusId,
  statuses,
  jobLink,
}: InstallationJobReminderInput) => {
  if (interventionTypeId !== INSTALLATION_INTERVENTION_TYPE_ID) return false;
  if (jobLink) return false;

  const status = statuses?.find((item) => item.id === statusId);
  return !status?.isInvoiced;
};
