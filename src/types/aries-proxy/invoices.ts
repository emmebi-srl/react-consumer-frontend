import { DdtDestination } from './ddts';
import { PaymentCondition } from './supplier-invoices';
import { InterventionType } from './tickets';

/** stato_fattura ids. "Da incassare" = waiting for payment + not paid. */
export const INVOICE_STATUS_WAITING_PAYMENT = 1;
export const INVOICE_STATUS_PAID = 3;
export const INVOICE_STATUS_NOT_PAID = 4;
export const INVOICE_STATUS_PREINVOICE = 5;
export const INVOICE_OPEN_STATUS_IDS = [INVOICE_STATUS_WAITING_PAYMENT, INVOICE_STATUS_NOT_PAID];

/** tipo_fattura ids with a special behaviour in the Delphi editor. */
export const INVOICE_TYPE_CREDIT_NOTE = 2;
/** Only the tax of the rows is charged. */
export const INVOICE_TYPE_DEBIT_NOTE_ONLY_TAX = 4;

/** fattura_articoli.tipo, as written by the Delphi editor. */
export const INVOICE_ROW_TYPE_PRODUCT = '';
export const INVOICE_ROW_TYPE_NOTE = 'N';
export const INVOICE_ROW_TYPE_REPORT_REFERENCE = '!';
export const INVOICE_ROW_TYPE_DDT_REFERENCE = '?';
export const INVOICE_ROW_TYPE_REPORT_GROUP_REFERENCE = '(';
export const INVOICE_ROW_TYPE_REPORT_SYSTEM = 'I';
/** Rows that are only text on the invoice: they have no price. */
export const INVOICE_TEXT_ROW_TYPES = [
  INVOICE_ROW_TYPE_NOTE,
  INVOICE_ROW_TYPE_REPORT_REFERENCE,
  INVOICE_ROW_TYPE_DDT_REFERENCE,
  INVOICE_ROW_TYPE_REPORT_GROUP_REFERENCE,
  INVOICE_ROW_TYPE_REPORT_SYSTEM,
];

/** inviato. */
export const INVOICE_SENT_TYPES = [
  { id: 0, label: 'Non inviata' },
  { id: 1, label: 'Email / SDI' },
  { id: 2, label: 'A mano' },
  { id: 3, label: 'Posta' },
  { id: 4, label: 'Fax' },
];

export type InvoiceKind = 'invoice' | 'preinvoice';

export interface InvoiceStatus {
  id: number;
  name: string;
  description?: string | null;
  /** Raw Delphi color. */
  color?: string | null;
}

export interface InvoiceType {
  id: number;
  name: string;
  description?: string | null;
  /** TipoDocumento of the e-invoice. */
  eInvoiceType?: string | null;
  shouldMoveDepot: boolean;
}

export interface InvoiceCausal {
  id: number;
  name: string;
  description?: string | null;
}

export interface VatType {
  id: number;
  name?: string | null;
  description?: string | null;
  rate: number;
  isDefault: boolean;
  inUse: boolean;
  message?: string | null;
}

export interface VatNatureType {
  id: number;
  name: string;
  description?: string | null;
  eInvoiceCode?: string | null;
  invoiceNote?: string | null;
  isEnabled: boolean;
}

export interface InvoiceSystemType {
  id: number;
  name: string;
}

export interface InvoiceLookups {
  statuses: InvoiceStatus[];
  types: InvoiceType[];
  causals: InvoiceCausal[];
  vatTypes: VatType[];
  vatNatureTypes: VatNatureType[];
  paymentConditions: PaymentCondition[];
  interventionTypes: InterventionType[];
  systemTypes: InvoiceSystemType[];
}

export interface BankBranch {
  id: number;
  name?: string | null;
  abi?: string | null;
  cab?: string | null;
  iban?: string | null;
}

export interface BankBranchList {
  banks: BankBranch[];
}

export interface InvoiceRow {
  position?: number;
  productCode?: string | null;
  /** Can be RTF when written by Delphi. */
  description?: string | null;
  supplierCode?: string | null;
  serialNumber?: string | null;
  quantity?: number | null;
  measureUnit?: string | null;
  price?: number | null;
  cost?: number | null;
  /** Discount %. */
  discount?: number | null;
  /** VAT rate %, not the tipo_iva id. */
  vatRate?: number | null;
  rowType: string;
  referenceId?: string | null;
  referenceYear?: string | null;
  noteId?: number | null;
}

export interface InvoiceAmountByTax {
  vatId: number;
  vat?: VatType | null;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface InvoiceStudy {
  interventionTypeId?: number | null;
  systemTypeId?: number | null;
}

export interface InvoicePurchaseOrder {
  documentId: string;
  /** Unix seconds in responses, yyyy-MM-dd in requests. */
  date: number | string;
  cigCode: string;
  cupCode: string;
}

export type InvoiceDocumentType = 'report' | 'ddt' | 'report_group';

export interface InvoiceDocument {
  type: InvoiceDocumentType;
  id: number;
  year: number;
  number: string;
  date?: number | null;
  description?: string | null;
}

export interface Invoice {
  id: number;
  /** 0 for a preinvoice. */
  year: number;
  isPreinvoice: boolean;
  invoiceDate: number;
  registrationDate: number;
  customerId: number;
  customerName?: string | null;
  customerVatNumber?: string | null;
  customerTaxCode?: string | null;
  isCustomerInsolvent?: boolean | null;
  destinationId: number;
  destination?: DdtDestination | null;
  statusId: number;
  status?: InvoiceStatus | null;
  typeId: number;
  type?: InvoiceType | null;
  causalId: number;
  causal?: InvoiceCausal | null;
  paymentConditionId: number;
  paymentCondition?: PaymentCondition | null;
  vatId?: number | null;
  vat?: VatType | null;
  vatNatureTypeId?: number | null;
  vatNatureType?: VatNatureType | null;
  bankId: number;
  bankName?: string | null;
  iban?: string | null;
  abi?: string | null;
  cab?: string | null;
  isOurBank: boolean;
  /** Printed on the invoice. */
  annotations?: string | null;
  /** Not printed ("Descrizione" in Delphi). */
  internalNote?: string | null;
  receptionDocumentId?: string | null;
  collectionCost: number;
  stampDuty: number;
  transportCost: number;
  productsDiscount: number;
  isSubcontract: boolean;
  shouldMoveDepot: boolean;
  isPrinted: boolean;
  /** See INVOICE_SENT_TYPES. */
  sentType: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  totalCost: number;
  areaActivities?: string | null;
  rows?: InvoiceRow[];
  amountsByTax?: InvoiceAmountByTax[];
  study?: InvoiceStudy;
  purchaseOrder?: InvoicePurchaseOrder | null;
  documents?: InvoiceDocument[];
}

export interface InvoiceList {
  invoices: Invoice[];
}

export interface InvoiceSearchRequest {
  search?: string;
  year?: number;
  kind?: InvoiceKind;
  statusId?: number;
  statusIds?: number[];
  customerId?: number;
  typeId?: number;
  causalId?: number;
  paymentConditionId?: number;
  isSent?: boolean;
  fromDate?: string;
  toDate?: string;
  pageIndex?: number;
  pageSize?: number;
  includes?: string;
}

export interface InvoiceTotals {
  count: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  totalCost: number;
}

export interface InvoiceEditorDefaults {
  nextInvoiceId: number;
  nextPreinvoiceId: number;
  lastInvoiceDate?: number | null;
  companyBank?: BankBranch | null;
  defaultVatId?: number | null;
  defaultPaymentConditionId: number;
  defaultCausalId: number;
  defaultTypeId: number;
}

export interface InvoiceCustomerDefaults {
  customerId: number;
  paymentConditionId?: number | null;
  vatId?: number | null;
  mainDestinationId?: number | null;
  vatNumber?: string | null;
  taxCode?: string | null;
  brandDiscounts: string[];
  intentLetterNote?: string | null;
}

export interface InvoiceProductDefaults {
  productCode: string;
  description?: string | null;
  supplierCode?: string | null;
  measureUnit?: string | null;
  quantity: number;
  price: number;
  cost: number;
}

export interface InvoiceSaveRequest {
  /** Null on create = next number of the year; a different number on save renumbers. */
  invoiceId: number | null;
  isPreinvoice: boolean;
  /** yyyy-MM-dd */
  invoiceDate: string;
  customerId: number;
  destinationId: number;
  typeId: number;
  causalId: number;
  paymentConditionId: number;
  vatId: number;
  vatNatureTypeId: number | null;
  bankId: number;
  iban: string;
  abi: string;
  cab: string;
  isOurBank: boolean;
  annotations: string;
  internalNote: string;
  receptionDocumentId: string | null;
  collectionCost: number;
  stampDuty: number;
  transportCost: number;
  productsDiscount: number;
  isSubcontract: boolean;
  shouldMoveDepot: boolean;
  rows: InvoiceRow[];
  study: InvoiceStudy;
  purchaseOrder: InvoicePurchaseOrder | null;
  /** Documents imported in the editor: they take the invoice on save. */
  documentsToAdd?: InvoiceDocumentKey[];
  /** Documents removed in the editor: they go back to be invoiced. */
  documentsToRemove?: InvoiceDocumentKey[];
}

export interface InvoiceFlagsRequest {
  isPrinted?: boolean;
  sentType?: number;
}

/** "Importa rapporto" of the Delphi settings: what a report row of an invoice says. */
export const INVOICE_IMPORT_REPORTS_OPTIONS = [
  { id: 0, label: 'Numero e data rapporto' },
  { id: 1, label: 'Descrizione lavori' },
] as const;

/** "Prezzi DDT" of the Delphi settings: prices of the DDT rows imported in an invoice. */
export const INVOICE_PRICE_SOURCE_OPTIONS = [
  { id: 0, label: 'Prezzi DDT' },
  { id: 1, label: 'Prezzi da rapporto' },
  { id: 2, label: 'Usa listino' },
] as const;

export interface SignCertificate {
  id: number;
  refName?: string | null;
  name?: string | null;
  issuerName?: string | null;
  validTo?: number | null;
  isActive: boolean;
}

/** Public data of a SDICoop certificate. */
export interface SdICoopCertificate {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: number;
  validTo: number;
  /** Negative when expired. */
  daysToExpiry: number;
}

/** State of the SDICoop channel (SdICoopService), GET invoice/sdicoop-status. */
export interface SdICoopStatus {
  /** False for installations without a SDICoop channel: nothing to show. */
  enabled: boolean;
  serviceAvailable: boolean;
  message?: string | null;
  environment?: string | null;
  clientCertificate?: SdICoopCertificate | null;
}

/** TFInvoiceSettings (fattura_configurazione, impostazioni_fattura "codcli", configurazione_loghi "FATTURA"). */
export interface InvoiceSettings {
  firstColumnIsBrand: boolean;
  thirdColumnIsSupplierCode: boolean;
  fixedNote?: string | null;
  emailNote?: string | null;
  importReports: number;
  priceSource: number;
  hideZeroDiscount: boolean;
  hideZeroPrice: boolean;
  hideSystemName: boolean;
  certificateSignId?: number | null;
  sdiEmail?: string | null;
  statementEmailText?: string | null;
  statementReplyToEmail?: string | null;
  statementSenderEmail?: string | null;
  customerCodeLabel?: string | null;
  backgroundLogo: boolean;
  /** Read only. */
  certificates?: SignCertificate[];
}

/** FatturaPA XML of an invoice (also written in the invoice folder for the Delphi client). */
export interface EInvoice {
  fileName: string;
  xml: string;
  savedPath?: string | null;
  warnings: string[];
}

export const INVOICE_ROW_TYPE_DDT_PRODUCT = '+';
export const INVOICE_ROW_TYPE_REPORT_PRODUCT = '-';
export const INVOICE_ROW_TYPE_REPORT_GROUP_PRODUCT = ':';

export interface InvoiceDocumentKey {
  type: InvoiceDocumentType;
  id: number;
  year: number;
}

/** A report, DDT or report group still to invoice (Delphi "documenti disponibili"). */
export interface InvoiceAvailableDocument extends InvoiceDocumentKey {
  number?: string | null;
  date?: number | null;
  customerId: number;
  customerName?: string | null;
  causal?: string | null;
  address?: string | null;
  system?: string | null;
  note?: string | null;
  typeName?: string | null;
}

export interface InvoiceAvailableDocumentList {
  documents: InvoiceAvailableDocument[];
}

export interface InvoiceImportRequest extends InvoiceDocumentKey {
  customerId?: number | null;
  vatRate?: number | null;
  productsDiscount: number;
}

/** Rows to append to the editor and the documents the save will link. */
export interface InvoiceImportResult {
  rows: InvoiceRow[];
  documents: InvoiceDocumentKey[];
  customerId: number;
  interventionTypeId?: number | null;
  systemTypeId?: number | null;
  /** DDTs of the imported reports not invoiced yet: Delphi asks whether to import them too. */
  linkedDdts: InvoiceDocumentKey[];
  warnings: string[];
  /** Imported reports with material and no DDT: Delphi offers to make the DDT now. */
  reportsWithoutDdt: InvoiceDocumentKey[];
  /** Kit rows with an extended description (RTF): Delphi asks whether to use it. */
  kitDescriptions: InvoiceKitDescription[];
}

export interface InvoiceKitDescription {
  /** Index in the imported rows. */
  rowIndex: number;
  productCode: string;
  description?: string | null;
  extendedDescription: string;
}
