// Report output types (`rapporto_uscita` / `tipo_uscita`) handled like the Delphi report editor.
export const UNDER_WARRANTY_OUTPUT_TYPE_ID = 6;
export const NOT_UNDER_WARRANTY_OUTPUT_TYPE_ID = 7;

export const SYSTEM_UNDER_WARRANTY_QUESTION = 'Impianto in garanzia, vuoi considerarlo tale?';

/** Checkboxes of the editor, labels as in Delphi. 8 and 9 have no Delphi control: they come from the mobile report. */
export const REPORT_OUTPUT_OPTIONS: { id: number; label: string }[] = [
  { id: 1, label: 'Notturno' },
  { id: 2, label: 'Festivo' },
  { id: 13, label: 'In giornata' },
  { id: 4, label: 'Sostituzione' },
  { id: 10, label: 'Riparazione' },
  { id: 8, label: 'Abbonamento' },
  { id: 9, label: 'Fuori abbonamento' },
];

export interface ReportOutputsState {
  /** Every output except 6/7, including codes without a checkbox, which are kept as they are. */
  outputTypeIds: number[];
  underWarranty: boolean;
}

export const getReportOutputsState = (outputTypeIds?: number[] | null): ReportOutputsState => {
  const ids = outputTypeIds ?? [];
  return {
    outputTypeIds: ids.filter((id) => id !== UNDER_WARRANTY_OUTPUT_TYPE_ID && id !== NOT_UNDER_WARRANTY_OUTPUT_TYPE_ID),
    underWarranty: ids.includes(UNDER_WARRANTY_OUTPUT_TYPE_ID),
  };
};

export const toggleReportOutput = (state: ReportOutputsState, id: number, checked: boolean): ReportOutputsState => ({
  ...state,
  outputTypeIds: checked
    ? [...new Set([...state.outputTypeIds, id])]
    : state.outputTypeIds.filter((current) => current !== id),
});

/** The ids to save: always exactly one of 6 and 7, like Aries. */
export const buildOutputTypeIds = (state: ReportOutputsState) =>
  [
    ...new Set([
      ...state.outputTypeIds,
      state.underWarranty ? UNDER_WARRANTY_OUTPUT_TYPE_ID : NOT_UNDER_WARRANTY_OUTPUT_TYPE_ID,
    ]),
  ].sort((a, b) => a - b);

interface SystemWarrantyInput {
  isNewReport: boolean;
  underWarranty: boolean;
  /** `warrantly_deadline` of the system, Unix seconds; 0 or missing = no warranty. */
  warrantyDeadline?: number | null;
  now?: Date;
}

/**
 * Same question as the Delphi editor when a system is chosen for a new report: the system warranty is still valid
 * (`scadenza_garanzia > NOW()`) and the report is not already marked as under warranty.
 */
export const needsSystemWarrantyConfirmation = ({
  isNewReport,
  underWarranty,
  warrantyDeadline,
  now = new Date(),
}: SystemWarrantyInput) => {
  if (!isNewReport || underWarranty) return false;
  if (!warrantyDeadline) return false;
  return warrantyDeadline * 1000 > now.getTime();
};
