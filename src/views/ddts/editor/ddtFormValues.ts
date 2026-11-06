import { format, getUnixTime, parse } from 'date-fns';
import {
  Ddt,
  DDT_ROW_TYPE_ECONOMY,
  DDT_ROW_TYPE_NOTE,
  DdtJobLink,
  DdtKitComponent,
  DdtPickListLink,
  DdtReportLink,
  DdtRow,
  DdtSaveRequest,
} from '~/types/aries-proxy/ddts';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { decodeRtf, encodeRtfText } from '~/utils/rtf-utils';

export interface DdtRecipient {
  id: number;
  name: string;
}

export interface DdtRowValues {
  /** Stable key for the list, rows have no id. */
  key: string;
  productCode: string;
  /** Plain text shown and edited. */
  text: string;
  /** Description as loaded: re-sent as is when the text didn't change, so the Delphi RTF survives. */
  originalDescription: string | null;
  supplierCode: string;
  serialNumber: string;
  quantity: string;
  measureUnit: string;
  price: string;
  cost: string;
  depotId: number | '';
  /** Kept as loaded or imported: '+' report, '-' pick list, '?' reference, 'E' all in economy, 'Y' kit. */
  rowType: string;
  noteId: number | null;
  referenceId: number | null;
  referenceYear: number | null;
  discount: number;
  /** Quantity in economy (job DDTs). */
  economy: string;
  /** Components of a kit, with their serial numbers. */
  kitComponents: DdtKitComponent[];
  /** Stock of the product in the row depot, when known. */
  stock: number | null;
}

export interface DdtFormValues {
  isCustomer: boolean;
  recipient: DdtRecipient | null;
  destinationId: number | '';
  systemId: number | '';
  paymentConditionId: number | '';
  deliveryMethodId: number | '';
  /** Empty on create for the automatic number; changing it renumbers an existing DDT. */
  ddtNumber: string;
  documentDate: string;
  deliveryCareId: number | '';
  carrierId: number | '';
  causalId: string;
  /** Depot proposed for the new product rows (causale_trasporto.id_maga_default). */
  defaultDepotId: number | '';
  packages: string;
  weight: string;
  transportDate: string;
  transportTime: string;
  printTransportTime: boolean;
  pickupDate: string;
  pickupTime: string;
  printPickupDateTime: boolean;
  aspects: number;
  description: string;
  footerNote: string;
  rows: DdtRowValues[];
  reportLinks: DdtReportLink[];
  /** Job lot of the rows. */
  jobLink: DdtJobLink | null;
  pickLists: DdtPickListLink[];
  /** New DDT: report whose signatures are copied, like Delphi when it imports a report. */
  signatureReport: { reportId: number; reportYear: number } | null;
}

let rowKey = 0;
export const newRowKey = () => `row-${++rowKey}`;

/** Accepts the Italian decimal comma. */
export const parseDecimal = (value: string) => {
  const parsed = Number(value.trim().replace(',', '.'));
  return value.trim() === '' || Number.isNaN(parsed) ? null : parsed;
};

const toInputNumber = (value?: number | null) => (value === null || value === undefined ? '' : String(value));

const toDateInput = (unix?: number | null) =>
  unix ? format(getDateByUnixtimestamp({ unixTimestamp: unix }), 'yyyy-MM-dd') : '';

const toTimeInput = (unix?: number | null) =>
  unix ? format(getDateByUnixtimestamp({ unixTimestamp: unix }), 'HH:mm') : '';

const toUnix = (date: string, time: string) => {
  if (!date) return null;
  const parsed = parse(`${date} ${time || '00:00'}`, 'yyyy-MM-dd HH:mm', new Date());
  return Number.isNaN(parsed.getTime()) ? null : getUnixTime(parsed);
};

export const isNoteRow = (row: Pick<DdtRowValues, 'productCode' | 'rowType'>) =>
  !row.productCode.trim() || row.rowType === DDT_ROW_TYPE_NOTE;

export const toRowValues = (row: DdtRow): DdtRowValues => ({
  key: newRowKey(),
  productCode: row.productCode ?? '',
  text: decodeRtf(row.description),
  originalDescription: row.description ?? null,
  supplierCode: row.supplierCode ?? '',
  serialNumber: row.serialNumber ?? '',
  quantity: toInputNumber(row.quantity),
  measureUnit: row.measureUnit ?? '',
  price: toInputNumber(row.price),
  cost: toInputNumber(row.cost),
  depotId: row.depotId ?? '',
  rowType: row.rowType ?? '',
  noteId: row.noteId ?? null,
  referenceId: row.referenceId ?? null,
  referenceYear: row.referenceYear ?? null,
  discount: row.discount,
  economy: row.economy ? toInputNumber(row.economy) : '',
  kitComponents: row.kitComponents ?? [],
  stock: row.stock ?? null,
});

export const emptyNoteRow = (): DdtRowValues => ({
  key: newRowKey(),
  productCode: '',
  text: '',
  originalDescription: null,
  supplierCode: '',
  serialNumber: '',
  quantity: '',
  measureUnit: '',
  price: '0',
  cost: '0',
  depotId: '',
  rowType: DDT_ROW_TYPE_NOTE,
  noteId: null,
  referenceId: null,
  referenceYear: null,
  discount: 0,
  economy: '',
  kitComponents: [],
  stock: null,
});

const toRow = (values: DdtRowValues): DdtRow => {
  const original = values.originalDescription;
  const isRtf = !!original?.trimStart().startsWith('{\\rtf');
  const unchanged = original !== null && decodeRtf(original) === values.text;
  return {
    productCode: values.productCode.trim() || null,
    // Re-encoding drops the Delphi formatting: only when the user changed the text.
    description: unchanged ? original : isRtf ? encodeRtfText(values.text) : values.text,
    supplierCode: values.supplierCode,
    serialNumber: values.serialNumber,
    quantity: parseDecimal(values.quantity),
    measureUnit: values.measureUnit || null,
    price: parseDecimal(values.price) ?? 0,
    cost: parseDecimal(values.cost) ?? 0,
    depotId: values.depotId === '' ? null : values.depotId,
    rowType: values.rowType,
    noteId: values.noteId,
    referenceId: values.referenceId,
    referenceYear: values.referenceYear,
    discount: values.discount,
    economy:
      values.rowType === DDT_ROW_TYPE_ECONOMY ? parseDecimal(values.quantity) : (parseDecimal(values.economy) ?? 0),
    kitComponents: values.kitComponents,
  };
};

export const getRowTotals = (rows: DdtRowValues[]) =>
  rows.reduce(
    (totals, row) => {
      const quantity = parseDecimal(row.quantity) ?? 0;
      return {
        price: totals.price + quantity * (parseDecimal(row.price) ?? 0),
        cost: totals.cost + quantity * (parseDecimal(row.cost) ?? 0),
      };
    },
    { price: 0, cost: 0 },
  );

export const newDdtValues = (defaults: {
  causalId: string;
  defaultDepotId: number | '';
  deliveryCareId: number | '';
  deliveryMethodId: number | '';
  aspects: number;
  printTransportTime: boolean;
}): DdtFormValues => {
  const now = new Date();
  return {
    isCustomer: true,
    recipient: null,
    destinationId: '',
    systemId: '',
    paymentConditionId: '',
    deliveryMethodId: defaults.deliveryMethodId,
    ddtNumber: '',
    documentDate: format(now, 'yyyy-MM-dd'),
    deliveryCareId: defaults.deliveryCareId,
    carrierId: '',
    causalId: defaults.causalId,
    defaultDepotId: defaults.defaultDepotId,
    packages: '1',
    weight: '',
    transportDate: format(now, 'yyyy-MM-dd'),
    transportTime: format(now, 'HH:mm'),
    printTransportTime: defaults.printTransportTime,
    pickupDate: '',
    pickupTime: '',
    printPickupDateTime: false,
    aspects: defaults.aspects,
    description: '',
    footerNote: '',
    rows: [],
    reportLinks: [],
    jobLink: null,
    pickLists: [],
    signatureReport: null,
  };
};

export const fromDdt = (ddt: Ddt, defaultDepotId: number | ''): DdtFormValues => ({
  isCustomer: !ddt.supplierId,
  recipient: ddt.supplierId
    ? { id: ddt.supplierId, name: ddt.supplierName ?? `Fornitore ${ddt.supplierId}` }
    : ddt.customerId
      ? { id: ddt.customerId, name: ddt.customerName ?? `Cliente ${ddt.customerId}` }
      : null,
  destinationId: (ddt.supplierId ? ddt.supplierDestinationId : ddt.destinationId) ?? '',
  systemId: ddt.systemId && ddt.systemId > 0 ? ddt.systemId : '',
  paymentConditionId: ddt.paymentConditionId ?? '',
  deliveryMethodId: ddt.deliveryMethodId ?? '',
  ddtNumber: String(ddt.id),
  documentDate: toDateInput(ddt.documentDate),
  deliveryCareId: ddt.deliveryCareId ?? '',
  carrierId: ddt.carrierId ?? '',
  causalId: ddt.causalId ?? '',
  defaultDepotId,
  packages: String(ddt.packages),
  weight: toInputNumber(ddt.weight),
  transportDate: toDateInput(ddt.transportStart),
  transportTime: toTimeInput(ddt.transportStart),
  printTransportTime: ddt.printTransportTime,
  pickupDate: toDateInput(ddt.pickupDateTime),
  pickupTime: toTimeInput(ddt.pickupDateTime),
  printPickupDateTime: ddt.printPickupDateTime,
  aspects: ddt.aspects,
  description: ddt.description ?? '',
  footerNote: ddt.footerNote ?? '',
  rows: (ddt.rows ?? []).map(toRowValues),
  reportLinks: ddt.reportLinks ?? [],
  jobLink: ddt.jobLink ?? null,
  pickLists: ddt.pickLists ?? [],
  signatureReport: null,
});

/** The rows are always sent: the server rewrites them and recomputes the job link, like Delphi. */
export const toSaveRequest = (values: DdtFormValues): DdtSaveRequest => ({
  isCustomer: values.isCustomer,
  personId: values.recipient?.id ?? 0,
  destinationId: values.destinationId === '' ? 0 : values.destinationId,
  systemId: values.isCustomer && values.systemId !== '' ? values.systemId : null,
  ddtNumber: values.ddtNumber.trim() ? Number(values.ddtNumber) : null,
  documentDate: values.documentDate,
  paymentConditionId: values.paymentConditionId === '' ? null : values.paymentConditionId,
  deliveryMethodId: values.deliveryMethodId === '' ? null : values.deliveryMethodId,
  deliveryCareId: values.deliveryCareId === '' ? null : values.deliveryCareId,
  carrierId: values.carrierId === '' ? null : values.carrierId,
  causalId: values.causalId,
  packages: Number(values.packages) || 0,
  weight: parseDecimal(values.weight),
  transportStart: toUnix(values.transportDate, values.transportTime),
  pickupDateTime: toUnix(values.pickupDate, values.pickupTime),
  printTransportTime: values.printTransportTime,
  printPickupDateTime: values.printPickupDateTime,
  aspects: values.aspects,
  description: values.description,
  footerNote: values.footerNote,
  rows: values.rows.map(toRow),
  jobLink:
    values.isCustomer && values.jobLink
      ? {
          jobId: values.jobLink.jobId,
          jobYear: values.jobLink.jobYear,
          subJobId: values.jobLink.subJobId,
          lotId: values.jobLink.lotId,
        }
      : null,
  reportLinks: values.reportLinks.map((link) => ({ reportId: link.reportId, reportYear: link.reportYear })),
  pickLists: values.isCustomer ? values.pickLists.map((list) => ({ listId: list.listId, year: list.year })) : [],
  signatureReport: values.signatureReport,
});
