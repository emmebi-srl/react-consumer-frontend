import { format } from 'date-fns';
import {
  INVOICE_ROW_TYPE_DDT_PRODUCT,
  INVOICE_ROW_TYPE_DDT_REFERENCE,
  INVOICE_ROW_TYPE_NOTE,
  INVOICE_ROW_TYPE_REPORT_GROUP_PRODUCT,
  INVOICE_ROW_TYPE_REPORT_GROUP_REFERENCE,
  INVOICE_ROW_TYPE_REPORT_PRODUCT,
  INVOICE_ROW_TYPE_REPORT_REFERENCE,
  INVOICE_ROW_TYPE_REPORT_SYSTEM,
  INVOICE_TEXT_ROW_TYPES,
  INVOICE_TYPE_DEBIT_NOTE_ONLY_TAX,
  Invoice,
  InvoiceDocumentKey,
  InvoiceDocumentType,
  InvoiceEditorDefaults,
  InvoiceRow,
  InvoiceSaveRequest,
  VatType,
} from '~/types/aries-proxy/invoices';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { decodeRtf, encodeRtfText } from '~/utils/rtf-utils';
import { roundCents, rowTaxableAmount } from '../invoiceHelpers';

export interface InvoiceCustomer {
  id: number;
  name: string;
}

export interface InvoiceBankValues {
  id: number;
  name: string;
  abi: string;
  cab: string;
}

export interface InvoiceRowValues {
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
  discount: string;
  /** Rate %, '' = none (text rows). */
  vatRate: number | '';
  /** fattura_articoli.tipo, kept as loaded. */
  rowType: string;
  referenceId: string | null;
  referenceYear: string | null;
  noteId: number | null;
}

export interface InvoiceFormValues {
  /** Only on create. */
  isPreinvoice: boolean;
  /** Empty on create for the next number; changing it renumbers an existing invoice. */
  invoiceNumber: string;
  invoiceDate: string;
  customer: InvoiceCustomer | null;
  destinationId: number | '';
  typeId: number | '';
  causalId: number | '';
  paymentConditionId: number | '';
  vatId: number | '';
  vatNatureTypeId: number | '';
  bank: InvoiceBankValues | null;
  iban: string;
  isOurBank: boolean;
  annotations: string;
  /** Annotations as loaded (can be RTF). */
  originalAnnotations: string | null;
  internalNote: string;
  receptionDocumentId: string;
  collectionCost: string;
  stampDuty: string;
  transportCost: string;
  productsDiscount: string;
  isSubcontract: boolean;
  shouldMoveDepot: boolean;
  interventionTypeId: number | '';
  systemTypeId: number | '';
  hasPurchaseOrder: boolean;
  purchaseOrderDocumentId: string;
  purchaseOrderDate: string;
  purchaseOrderCig: string;
  purchaseOrderCup: string;
  rows: InvoiceRowValues[];
  /** Imported in this session (Delphi ReportsToAdd / DDTsToAdd / ReportGroupsToAdd). */
  documentsToAdd: InvoiceDocumentKey[];
  /** Linked when loaded and removed in this session (ReportsToRemove / DDTsToRemove). */
  documentsToRemove: InvoiceDocumentKey[];
}

/** Reference row and product rows of each kind of document. */
const DOCUMENT_ROW_TYPES: Record<InvoiceDocumentType, { reference: string; rows: string[] }> = {
  report: { reference: INVOICE_ROW_TYPE_REPORT_REFERENCE, rows: [INVOICE_ROW_TYPE_REPORT_PRODUCT] },
  ddt: { reference: INVOICE_ROW_TYPE_DDT_REFERENCE, rows: [INVOICE_ROW_TYPE_DDT_PRODUCT] },
  report_group: { reference: INVOICE_ROW_TYPE_REPORT_GROUP_REFERENCE, rows: [INVOICE_ROW_TYPE_REPORT_GROUP_PRODUCT] },
};

export const sameDocument = (a: InvoiceDocumentKey, b: InvoiceDocumentKey) =>
  a.type === b.type && a.id === b.id && a.year === b.year;

/** The document a reference row points to, null for the other rows. */
export const rowDocument = (row: Pick<InvoiceRowValues, 'rowType' | 'referenceId' | 'referenceYear'>) => {
  const type = (Object.keys(DOCUMENT_ROW_TYPES) as InvoiceDocumentType[]).find(
    (key) => DOCUMENT_ROW_TYPES[key].reference === row.rowType,
  );
  const id = Number(row.referenceId);
  const year = Number(row.referenceYear);
  if (!type || !row.referenceId || !row.referenceYear || Number.isNaN(id) || Number.isNaN(year)) return null;
  return { type, id, year };
};

/**
 * Rows of a document (Delphi RemoveReportDocument / RemoveDdtDocument): its reference row, its product rows and, for
 * a report, the system row (reference "system|report", "destination|year").
 */
export const isDocumentRow = (row: InvoiceRowValues, document: InvoiceDocumentKey) => {
  const kind = DOCUMENT_ROW_TYPES[document.type];
  const id = String(document.id);
  const year = String(document.year);
  if (row.rowType === kind.reference || kind.rows.includes(row.rowType))
    return row.referenceId === id && row.referenceYear === year;
  return (
    document.type === 'report' &&
    row.rowType === INVOICE_ROW_TYPE_REPORT_SYSTEM &&
    row.referenceId?.split('|')[1] === id &&
    row.referenceYear?.split('|')[1] === year
  );
};

/** Removes the rows of a document and records it for the save, like Delphi. */
export const removeDocument = (
  values: Pick<InvoiceFormValues, 'rows' | 'documentsToAdd' | 'documentsToRemove'>,
  document: InvoiceDocumentKey,
) => {
  const wasAdded = values.documentsToAdd.some((item) => sameDocument(item, document));
  return {
    rows: values.rows.filter((row) => !isDocumentRow(row, document)),
    documentsToAdd: values.documentsToAdd.filter((item) => !sameDocument(item, document)),
    documentsToRemove:
      wasAdded || values.documentsToRemove.some((item) => sameDocument(item, document))
        ? values.documentsToRemove
        : [...values.documentsToRemove, document],
  };
};

/** Appends imported rows and records the documents for the save. */
export const addDocuments = (
  values: Pick<InvoiceFormValues, 'rows' | 'documentsToAdd' | 'documentsToRemove'>,
  rows: InvoiceRow[],
  documents: InvoiceDocumentKey[],
) => ({
  rows: [...values.rows, ...rows.map(toRowValues)],
  documentsToAdd: [
    ...values.documentsToAdd,
    ...documents.filter((document) => !values.documentsToAdd.some((item) => sameDocument(item, document))),
  ],
  documentsToRemove: values.documentsToRemove.filter(
    (item) => !documents.some((document) => sameDocument(item, document)),
  ),
});

/** Documents already in the rows (imported now or before). */
export const documentsInRows = (rows: InvoiceRowValues[]) =>
  rows.map(rowDocument).filter((document): document is InvoiceDocumentKey => !!document);

let rowKey = 0;
export const newRowKey = () => `invoice-row-${++rowKey}`;

/** Accepts the Italian decimal comma. */
export const parseDecimal = (value: string) => {
  const parsed = Number(value.trim().replace(',', '.'));
  return value.trim() === '' || Number.isNaN(parsed) ? null : parsed;
};

const toInputNumber = (value?: number | null) => (value === null || value === undefined ? '' : String(value));

const toDateInput = (unix?: number | null) =>
  unix ? format(getDateByUnixtimestamp({ unixTimestamp: unix }), 'yyyy-MM-dd') : '';

/** Text rows (notes, references to documents) have no price nor VAT on the invoice. */
export const isTextRow = (row: Pick<InvoiceRowValues, 'rowType'>) => INVOICE_TEXT_ROW_TYPES.includes(row.rowType);

/** A product row has a product code (Delphi splits the 10% VAT check in products and notes this way). */
export const isProductRow = (row: Pick<InvoiceRowValues, 'productCode' | 'rowType'>) =>
  !isTextRow(row) && !!row.productCode.trim();

const isRtf = (value?: string | null) => !!value?.trimStart().startsWith('{\\rtf');

export const toRowValues = (row: InvoiceRow): InvoiceRowValues => ({
  key: newRowKey(),
  productCode: row.productCode ?? '',
  text: decodeRtf(row.description ?? ''),
  originalDescription: row.description ?? null,
  supplierCode: row.supplierCode ?? '',
  serialNumber: row.serialNumber ?? '',
  quantity: toInputNumber(row.quantity),
  measureUnit: row.measureUnit ?? '',
  price: toInputNumber(row.price),
  cost: toInputNumber(row.cost),
  discount: toInputNumber(row.discount),
  vatRate: row.vatRate ?? '',
  rowType: row.rowType,
  referenceId: row.referenceId ?? null,
  referenceYear: row.referenceYear ?? null,
  noteId: row.noteId ?? null,
});

export const emptyProductRow = (vatRate: number | '', discount = ''): InvoiceRowValues => ({
  key: newRowKey(),
  productCode: '',
  text: '',
  originalDescription: null,
  supplierCode: '',
  serialNumber: '',
  quantity: '1',
  measureUnit: '',
  price: '',
  cost: '',
  discount,
  vatRate,
  rowType: '',
  referenceId: null,
  referenceYear: null,
  noteId: null,
});

export const noteRow = (text: string): InvoiceRowValues => ({
  ...emptyProductRow(''),
  text,
  quantity: '',
  rowType: INVOICE_ROW_TYPE_NOTE,
});

/** Re-encoding drops the Delphi formatting: only when the user changed the text. */
const keepOrEncode = (original: string | null, text: string) => {
  if (original !== null && decodeRtf(original) === text) return original;
  return isRtf(original) ? encodeRtfText(text) : text;
};

const toRow = (values: InvoiceRowValues): InvoiceRow => {
  const text = isTextRow(values);
  return {
    productCode: values.productCode.trim() || null,
    description: keepOrEncode(values.originalDescription, values.text),
    supplierCode: values.supplierCode.trim() || null,
    serialNumber: values.serialNumber.trim() || null,
    quantity: parseDecimal(values.quantity),
    measureUnit: values.measureUnit.trim() || null,
    price: text ? null : parseDecimal(values.price),
    cost: text ? null : parseDecimal(values.cost),
    discount: text ? null : parseDecimal(values.discount),
    vatRate: text || values.vatRate === '' ? null : values.vatRate,
    rowType: values.rowType,
    referenceId: values.referenceId,
    referenceYear: values.referenceYear,
    noteId: values.noteId,
  };
};

export const newInvoiceValues = (defaults: InvoiceEditorDefaults): InvoiceFormValues => ({
  isPreinvoice: false,
  invoiceNumber: '',
  invoiceDate: format(new Date(), 'yyyy-MM-dd'),
  customer: null,
  destinationId: '',
  typeId: defaults.defaultTypeId,
  causalId: defaults.defaultCausalId,
  paymentConditionId: defaults.defaultPaymentConditionId,
  vatId: defaults.defaultVatId ?? '',
  vatNatureTypeId: '',
  bank: defaults.companyBank
    ? {
        id: defaults.companyBank.id,
        name: defaults.companyBank.name ?? '',
        abi: defaults.companyBank.abi ?? '',
        cab: defaults.companyBank.cab ?? '',
      }
    : null,
  iban: defaults.companyBank?.iban ?? '',
  isOurBank: false,
  annotations: '',
  originalAnnotations: null,
  internalNote: '',
  receptionDocumentId: '',
  collectionCost: '0',
  stampDuty: '0',
  transportCost: '0',
  productsDiscount: '0',
  isSubcontract: false,
  shouldMoveDepot: false,
  interventionTypeId: '',
  systemTypeId: '',
  hasPurchaseOrder: false,
  purchaseOrderDocumentId: '',
  purchaseOrderDate: '',
  purchaseOrderCig: '',
  purchaseOrderCup: '',
  rows: [],
  documentsToAdd: [],
  documentsToRemove: [],
});

export const fromInvoice = (invoice: Invoice): InvoiceFormValues => ({
  isPreinvoice: invoice.isPreinvoice,
  invoiceNumber: String(invoice.id),
  invoiceDate: toDateInput(invoice.invoiceDate),
  customer: { id: invoice.customerId, name: invoice.customerName ?? `Cliente ${invoice.customerId}` },
  destinationId: invoice.destinationId || '',
  typeId: invoice.typeId,
  causalId: invoice.causalId,
  paymentConditionId: invoice.paymentConditionId,
  vatId: invoice.vatId ?? '',
  vatNatureTypeId: invoice.vatNatureTypeId ?? '',
  bank: invoice.bankId
    ? { id: invoice.bankId, name: invoice.bankName ?? '', abi: invoice.abi ?? '', cab: invoice.cab ?? '' }
    : null,
  iban: invoice.iban ?? '',
  isOurBank: invoice.isOurBank,
  annotations: decodeRtf(invoice.annotations ?? ''),
  originalAnnotations: invoice.annotations ?? null,
  internalNote: invoice.internalNote ?? '',
  receptionDocumentId: invoice.receptionDocumentId ?? '',
  collectionCost: String(invoice.collectionCost),
  stampDuty: String(invoice.stampDuty),
  transportCost: String(invoice.transportCost),
  productsDiscount: String(invoice.productsDiscount),
  isSubcontract: invoice.isSubcontract,
  shouldMoveDepot: invoice.shouldMoveDepot,
  interventionTypeId: invoice.study?.interventionTypeId ?? '',
  systemTypeId: invoice.study?.systemTypeId ?? '',
  hasPurchaseOrder: !!invoice.purchaseOrder,
  purchaseOrderDocumentId: invoice.purchaseOrder?.documentId ?? '',
  purchaseOrderDate: invoice.purchaseOrder ? toDateInput(Number(invoice.purchaseOrder.date)) : '',
  purchaseOrderCig: invoice.purchaseOrder?.cigCode ?? '',
  purchaseOrderCup: invoice.purchaseOrder?.cupCode ?? '',
  rows: (invoice.rows ?? []).map(toRowValues),
  documentsToAdd: [],
  documentsToRemove: [],
});

export const toSaveRequest = (values: InvoiceFormValues): InvoiceSaveRequest => ({
  invoiceId: values.invoiceNumber.trim() ? Number(values.invoiceNumber) : null,
  isPreinvoice: values.isPreinvoice,
  invoiceDate: values.invoiceDate,
  customerId: values.customer?.id ?? 0,
  destinationId: values.destinationId === '' ? 0 : values.destinationId,
  typeId: values.typeId === '' ? 0 : values.typeId,
  causalId: values.causalId === '' ? 0 : values.causalId,
  paymentConditionId: values.paymentConditionId === '' ? 0 : values.paymentConditionId,
  vatId: values.vatId === '' ? 0 : values.vatId,
  vatNatureTypeId: values.vatNatureTypeId === '' ? null : values.vatNatureTypeId,
  bankId: values.bank?.id ?? 0,
  iban: values.iban.trim(),
  abi: values.bank?.abi ?? '',
  cab: values.bank?.cab ?? '',
  isOurBank: values.isOurBank,
  annotations: keepOrEncode(values.originalAnnotations, values.annotations),
  internalNote: values.internalNote,
  receptionDocumentId: values.receptionDocumentId.trim() || null,
  collectionCost: parseDecimal(values.collectionCost) ?? 0,
  stampDuty: parseDecimal(values.stampDuty) ?? 0,
  transportCost: parseDecimal(values.transportCost) ?? 0,
  productsDiscount: parseDecimal(values.productsDiscount) ?? 0,
  isSubcontract: values.isSubcontract,
  shouldMoveDepot: values.shouldMoveDepot,
  rows: values.rows.map(toRow),
  study: {
    interventionTypeId: values.interventionTypeId === '' ? null : values.interventionTypeId,
    systemTypeId: values.systemTypeId === '' ? null : values.systemTypeId,
  },
  purchaseOrder: values.hasPurchaseOrder
    ? {
        documentId: values.purchaseOrderDocumentId.trim(),
        date: values.purchaseOrderDate,
        cigCode: values.purchaseOrderCig.trim(),
        cupCode: values.purchaseOrderCup.trim(),
      }
    : null,
  documentsToAdd: values.documentsToAdd,
  documentsToRemove: values.documentsToRemove,
});

export interface InvoiceVatAmount {
  vat: VatType;
  taxableAmount: number;
  taxAmount: number;
}

export interface InvoiceTotalsPreview {
  amounts: InvoiceVatAmount[];
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  totalCost: number;
  /** Delphi warning: with VAT 10% the material (product rows) should cost less than the labour (other rows). */
  vat10ProductsAlert: boolean;
}

const sameRate = (vat: VatType, rate: number) => Math.round(vat.rate) === rate;

/** sp_ariesVatTypeGetByValue: the default VAT when it has that rate, else the ones in use first. */
const findVatByRate = (vatTypes: VatType[], defaultVat: VatType, rate: number) => {
  if (sameRate(defaultVat, rate)) return defaultVat;
  return [...vatTypes]
    .filter((vat) => sameRate(vat, rate))
    .sort((a, b) => Number(b.inUse) - Number(a.inUse) || a.id - b.id)
    .at(0);
};

/**
 * Same computation as the server (port of the Delphi CreateAmountsByTax + ForceTotalsRefresh): rows on their VAT
 * (the invoice VAT when the rate is the same), collection and transport costs on the default VAT, stamp duty on 0%.
 * The "only tax" debit note charges only the tax. Shown while editing; the server recomputes on save.
 */
export const computeTotals = (values: InvoiceFormValues, vatTypes: VatType[]): InvoiceTotalsPreview => {
  const defaultVat = vatTypes.find((vat) => vat.isDefault);
  const empty = {
    amounts: [],
    taxableAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    totalCost: 0,
    vat10ProductsAlert: false,
  };
  if (!defaultVat) return empty;

  const invoiceVat = values.vatId === '' ? undefined : vatTypes.find((vat) => vat.id === values.vatId);
  const onlyTax = values.typeId === INVOICE_TYPE_DEBIT_NOTE_ONLY_TAX;
  const amounts = new Map<number, InvoiceVatAmount>();
  const get = (vat: VatType) => {
    const amount = amounts.get(vat.id) ?? { vat, taxableAmount: 0, taxAmount: 0 };
    amounts.set(vat.id, amount);
    return amount;
  };
  const addTaxable = (vat: VatType, value: number) => {
    const amount = get(vat);
    amount.taxableAmount = roundCents(amount.taxableAmount + value);
    amount.taxAmount = roundCents((amount.taxableAmount * vat.rate) / 100);
  };
  const addTax = (vat: VatType, value: number) => {
    get(vat).taxAmount = roundCents(get(vat).taxAmount + value);
  };

  let vat10Products = 0;
  let vat10Notes = 0;
  let totalCost = 0;

  values.rows.forEach((row) => {
    if (isTextRow(row)) return;
    const rate = row.vatRate === '' ? 0 : row.vatRate;
    const vat = invoiceVat && sameRate(invoiceVat, rate) ? invoiceVat : findVatByRate(vatTypes, defaultVat, rate);
    const quantity = parseDecimal(row.quantity) ?? 0;
    const taxable = rowTaxableAmount({
      price: parseDecimal(row.price),
      discount: parseDecimal(row.discount),
      quantity,
    });
    totalCost += roundCents((parseDecimal(row.cost) ?? 0) * quantity);
    if (rate === 10) {
      if (isProductRow(row)) vat10Products += taxable;
      else vat10Notes += taxable;
    }
    if (!vat) return;
    if (onlyTax) addTax(vat, roundCents((taxable / 100) * rate));
    else addTaxable(vat, taxable);
  });

  const collection = parseDecimal(values.collectionCost) ?? 0;
  if (collection > 0) {
    if (onlyTax) addTax(defaultVat, roundCents((collection * defaultVat.rate) / 100));
    else addTaxable(defaultVat, collection);
  }
  const stamp = parseDecimal(values.stampDuty) ?? 0;
  if (!onlyTax && stamp > 0) {
    const zeroVat = invoiceVat && sameRate(invoiceVat, 0) ? invoiceVat : findVatByRate(vatTypes, defaultVat, 0);
    if (zeroVat) addTaxable(zeroVat, stamp);
  }
  const transport = parseDecimal(values.transportCost) ?? 0;
  if (transport > 0) {
    if (onlyTax) addTax(defaultVat, roundCents((transport * defaultVat.rate) / 100));
    else addTaxable(defaultVat, transport);
  }

  const list = [...amounts.values()].filter((amount) => amount.taxableAmount + amount.taxAmount !== 0);
  const taxableAmount = roundCents(list.reduce((sum, amount) => sum + amount.taxableAmount, 0));
  const taxAmount = roundCents(list.reduce((sum, amount) => sum + amount.taxAmount, 0));
  return {
    amounts: list.sort((a, b) => a.vat.id - b.vat.id),
    taxableAmount,
    taxAmount,
    totalAmount: roundCents(taxableAmount + taxAmount),
    totalCost: roundCents(totalCost),
    vat10ProductsAlert: vat10Notes < vat10Products,
  };
};

/** TFInvoiceEditor.CheckProductWithoutPrice: the rows with a zero price, as "riga N (codice) descrizione". */
export const getZeroPriceRows = (rows: InvoiceRowValues[]) =>
  rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !isTextRow(row) && !(parseDecimal(row.price) ?? 0))
    .map(({ row, index }) => {
      const code = row.supplierCode.trim() || row.productCode.trim();
      return `riga ${index + 1}${code ? ` (${code})` : ''}: ${row.text.trim().slice(0, 60)}`;
    });

/** Row type Delphi gives to the row that replaces grouped documents ("DOCUMENTI RAGGRUPPATI"). */
export const INVOICE_ROW_TYPE_GROUPED = 'R';

export interface GroupedRows {
  rows: InvoiceRowValues[];
  /** Rows replaced. */
  count: number;
  /** VAT rates of the replaced priced rows: more than one changes the totals by VAT. */
  rates: number[];
}

/**
 * RAGRUPPADOCUMENTI / RAGRUPPARAPPORTI / RAGRUPPADOCUMENTISELEZIONATI: the matching rows become one row "label",
 * quantity 1, price = sum of their totals, on the invoice VAT. The documents stay linked to the invoice.
 * Delphi summed the unit costs and, for "documenti", applied the header discount again on the sum: here the cost is
 * the total cost (cost x quantity) and the discount 0, so the invoice totals don't change.
 */
export const groupRows = (
  rows: InvoiceRowValues[],
  matches: (row: InvoiceRowValues) => boolean,
  label: string,
  vatRate: number | '',
): GroupedRows | null => {
  const grouped = rows.filter(matches);
  if (!grouped.length) return null;
  const priced = grouped.filter((row) => !isTextRow(row));
  const price = roundCents(
    priced.reduce(
      (sum, row) =>
        sum +
        rowTaxableAmount({
          price: parseDecimal(row.price),
          discount: parseDecimal(row.discount),
          quantity: parseDecimal(row.quantity),
        }),
      0,
    ),
  );
  const cost = roundCents(
    priced.reduce((sum, row) => sum + (parseDecimal(row.cost) ?? 0) * (parseDecimal(row.quantity) ?? 0), 0),
  );
  const rates = [...new Set(priced.map((row) => row.vatRate).filter((rate): rate is number => rate !== ''))];
  return {
    rows: [
      ...rows.filter((row) => !matches(row)),
      {
        ...emptyProductRow(vatRate),
        text: label,
        serialNumber: label,
        quantity: '1',
        measureUnit: '--',
        price: String(price),
        cost: String(cost),
        discount: '0',
        rowType: INVOICE_ROW_TYPE_GROUPED,
      },
    ],
    count: grouped.length,
    rates,
  };
};

/** RAGRUPPADOCUMENTI: every row of an imported document (with a reference). */
export const isAnyDocumentRow = (row: InvoiceRowValues) => !!row.referenceId && !!row.referenceYear;

/** RAGRUPPARAPPORTI: report references, report rows and systems of the reports. */
export const isReportRow = (row: InvoiceRowValues) =>
  [INVOICE_ROW_TYPE_REPORT_REFERENCE, INVOICE_ROW_TYPE_REPORT_PRODUCT, INVOICE_ROW_TYPE_REPORT_SYSTEM].includes(
    row.rowType,
  );

/**
 * TFInvoiceEditor.Ragruppa (never triggered in Delphi: its flags start false): when the reports are all on the same
 * system, their system rows become one note at the top; when they are on different systems of the same destination,
 * one note with the destination address. Null when there is nothing to group (fewer than 2 system rows).
 */
export const groupSystems = (rows: InvoiceRowValues[], destinationAddress: (destinationId: string) => string) => {
  const systems = rows.filter((row) => row.rowType === INVOICE_ROW_TYPE_REPORT_SYSTEM);
  if (systems.length < 2) return null;
  const systemIds = new Set(systems.map((row) => row.referenceId?.split('|')[0] ?? ''));
  const destinationIds = new Set(systems.map((row) => row.referenceYear?.split('|')[0] ?? ''));
  const first = systems[0] as InvoiceRowValues;
  const sameSystem = systemIds.size === 1;
  if (!sameSystem && destinationIds.size !== 1) return null;
  const destinationId = first.referenceYear?.split('|')[0] ?? '';
  const text = sameSystem ? first.text : destinationAddress(destinationId);
  if (!text.trim()) return null;
  return {
    kind: sameSystem ? ('system' as const) : ('destination' as const),
    rows: [noteRow(text), ...rows.filter((row) => row.rowType !== INVOICE_ROW_TYPE_REPORT_SYSTEM)],
  };
};
