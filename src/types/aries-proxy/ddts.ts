export interface DdtStatus {
  id: number;
  name: string;
  description?: string | null;
  /** Raw Delphi color: convert it with DelphiColorChip / color-utils. */
  color: string;
}

export interface DdtStatusList {
  statuses: DdtStatus[];
}

export enum TransportCausalOperation {
  Load = 1,
  Unload = 2,
  /** Loads the row depot, unloading `depotId`. */
  LoadFromDepot = 3,
  /** Unloads the row depot, loading `depotId`. */
  UnloadToDepot = 4,
}

export interface TransportCausal {
  /** Short text code, e.g. "VI". */
  id: string;
  name: string;
  description?: string | null;
  operation: TransportCausalOperation;
  depotId?: number | null;
  defaultDepotId: number;
  /** Used by the received DDTs: not offered in the editor. */
  isForReceivedDdts: boolean;
  isClosed: boolean;
  /** 2 = "autoconvalida": the DDT is closed at once and stays out of the totals. */
  warranty: number;
}

export interface TransportCausalList {
  causals: TransportCausal[];
}

/** porto_resa */
export interface DeliveryMethod {
  id: number;
  name: string;
  description?: string | null;
}

export interface DeliveryMethodList {
  deliveryMethods: DeliveryMethod[];
}

/** trasporto_cura: 3 = VETTORE, the only one that saves the carrier. */
export interface DeliveryCare {
  id: number;
  name: string;
  description?: string | null;
}

export interface DeliveryCareList {
  deliveryCares: DeliveryCare[];
}

export const DELIVERY_CARE_CARRIER = 3;

/** vettore */
export interface Carrier {
  id: number;
  name?: string | null;
  code?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  fax?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  note?: string | null;
}

export interface CarrierList {
  carriers: Carrier[];
}

/** tipo_magazzino */
export interface DepotType {
  id: number;
  name: string;
  description?: string | null;
  isDisabled: boolean;
}

export interface DepotTypeList {
  depotTypes: DepotType[];
}

/** Bits of the "aspetto esteriore dei beni", same order as sp_ddtInsert. */
export const DDT_ASPECTS = [
  { bit: 1, label: 'Alla rinfusa' },
  { bit: 2, label: 'A vista' },
  { bit: 4, label: 'Matasse' },
  { bit: 8, label: 'Scatola' },
  { bit: 16, label: 'Sacco' },
  { bit: 32, label: 'Busta' },
] as const;

export interface DdtAspects {
  /** Bits whose code exists in the aspetto table. */
  availableMask: number;
  /** Aspect of a new DDT (Delphi DDT settings). */
  defaultMask: number;
  defaultPrintTransportTime: boolean;
}

export interface DdtDestination {
  destinationId?: number;
  province?: string | null;
  municipality?: string | null;
  postalCode?: string | null;
  street?: string | null;
  houseNumber?: number | null;
  mainDestination?: boolean;
  isMain?: boolean;
}

export interface SupplierDestinationList {
  destinations: DdtDestination[];
}

export interface DdtSystem {
  id: number;
  description?: string | null;
}

export interface DdtSystemList {
  systems: DdtSystem[];
}

export type DdtRecipientType = 'customer' | 'supplier';

/**
 * articoli_ddt.tipo: '' or null product, 'N' note (with or without price), '?' reference to a document,
 * 'E' all in economy, '+' from a report, '-' from a pick list, 'Y' kit.
 */
export const DDT_ROW_TYPE_NOTE = 'N';
export const DDT_ROW_TYPE_REFERENCE = '?';
export const DDT_ROW_TYPE_ECONOMY = 'E';

export interface DdtKitComponent {
  productCode: string;
  supplierCode?: string | null;
  serialNumber?: string | null;
  description?: string | null;
  /** Quantity of the component in one kit. */
  quantityPerKit?: number | null;
}

/** Lot of a job (commessa / sottocommessa / lotto). */
export interface DdtJobLink {
  jobId: number;
  jobYear: number;
  subJobId: number;
  lotId: number;
  customerId?: number | null;
  jobDescription?: string | null;
  subJobName?: string | null;
  lotDescription?: string | null;
  systemId?: number | null;
}

export interface DdtJobLotList {
  lots: DdtJobLink[];
}

export interface DdtJobRemainingList {
  /** remaining: still to bring, -1 when the product is not in the lot. */
  items: { productCode: string; remaining: number }[];
}

export interface DdtPickListLink {
  listId: number;
  year: number;
  date?: number | null;
}

export type DdtDocumentType = 'report' | 'pick_list';

export interface DdtDocument {
  type: DdtDocumentType;
  id: number;
  year: number;
  number?: string | null;
  date?: number | null;
  causal?: string | null;
  address?: string | null;
  system?: string | null;
  note?: string | null;
}

export interface DdtDocumentList {
  documents: DdtDocument[];
}

/** Rows of an imported report or pick list, with the header values for a new DDT. */
export interface DdtImport {
  document: DdtDocument;
  rows: DdtRow[];
  customerId?: number | null;
  customerName?: string | null;
  destinationId?: number | null;
  systemId?: number | null;
  documentDate?: number | null;
  causalId?: string | null;
  jobLink?: DdtJobLink | null;
  hasSignatures: boolean;
}

export type DdtSignatureKind = 'recipient' | 'driver';

export interface DdtRow {
  position?: number;
  productCode?: string | null;
  /** Can be RTF for the note rows written by Delphi. */
  description?: string | null;
  supplierCode?: string | null;
  quantity?: number | null;
  measureUnit?: string | null;
  serialNumber?: string | null;
  price: number;
  cost: number;
  rowType?: string | null;
  noteId?: number | null;
  /** Depot loaded or unloaded by the row (tipo_magazzino), null for notes. */
  depotId?: number | null;
  referenceId?: number | null;
  referenceYear?: number | null;
  discount: number;
  /** Quantity in economy: brought to the job outside the quote. */
  economy?: number | null;
  /** Components of a kit row; the server takes the list from the kit, only the serial numbers are kept. */
  kitComponents?: DdtKitComponent[];
  /** Read only: stock in the row depot, sent for imported rows. */
  stock?: number | null;
}

export interface DdtReportLink {
  reportId: number;
  reportYear: number;
  reportNumber?: string | null;
  date?: number | null;
  systemId?: number | null;
  statusName?: string | null;
}

export interface Ddt {
  id: number;
  year: number;
  customerId?: number | null;
  /** Filled by the "customer" include. */
  customerName?: string | null;
  supplierId?: number | null;
  /** Filled by the "supplier" include. */
  supplierName?: string | null;
  destinationId?: number | null;
  /** Customer destination, filled by the "destination" include. */
  destination?: DdtDestination | null;
  supplierDestinationId?: number | null;
  /** Supplier destination, filled by the "destination" include. */
  supplierDestination?: DdtDestination | null;
  /** 0 or null when there is no system. */
  systemId?: number | null;
  /** Filled by the "system" include. */
  systemDescription?: string | null;
  documentDate?: number | null;
  causalId?: string | null;
  /** Filled by the "causal" include. */
  causal?: TransportCausal | null;
  statusId: number;
  /** Filled by the "status" include. */
  status?: DdtStatus | null;
  /** "Note interne" in Delphi, "Note" in the list. */
  description?: string | null;
  /** "Note piè DDT": printed. */
  footerNote?: string | null;
  isPrinted: boolean;
  paymentConditionId?: number | null;
  deliveryMethodId?: number | null;
  deliveryCareId?: number | null;
  carrierId?: number | null;
  transportStart?: number | null;
  pickupDateTime?: number | null;
  printTransportTime: boolean;
  printPickupDateTime: boolean;
  packages: number;
  weight?: number | null;
  /** DDT_ASPECTS bit mask. */
  aspects: number;
  invoiceId?: number | null;
  invoiceYear?: number | null;
  /** "rows" include. */
  rows?: DdtRow[];
  /** "job_link" include. */
  jobLink?: DdtJobLink | null;
  /** "report_links" include. */
  reportLinks?: DdtReportLink[];
  /** "pick_lists" include. */
  pickLists?: DdtPickListLink[];
  hasRecipientSignature: boolean;
  hasDriverSignature: boolean;
}

export interface DdtList {
  ddts: Ddt[];
}

export interface DdtSaveRequest {
  isCustomer: boolean;
  personId: number;
  destinationId: number;
  systemId?: number | null;
  /** Empty on create for the next free number; on save a different number (or a date in another year) renumbers. */
  ddtNumber?: number | null;
  /** yyyy-MM-dd */
  documentDate: string;
  paymentConditionId?: number | null;
  deliveryMethodId?: number | null;
  deliveryCareId?: number | null;
  carrierId?: number | null;
  causalId: string;
  packages: number;
  weight?: number | null;
  /** Unix seconds. */
  transportStart?: number | null;
  pickupDateTime?: number | null;
  printTransportTime: boolean;
  printPickupDateTime: boolean;
  aspects: number;
  description?: string;
  footerNote?: string;
  /** Null leaves the rows and the job link unchanged. */
  rows: DdtRow[] | null;
  /** Job lot of the rows, null for none. */
  jobLink: Pick<DdtJobLink, 'jobId' | 'jobYear' | 'subJobId' | 'lotId'> | null;
  reportLinks: { reportId: number; reportYear: number }[];
  pickLists: { listId: number; year: number }[];
  /** Create only: report whose signatures are copied on the DDT. */
  signatureReport?: { reportId: number; reportYear: number } | null;
}

export interface DdtProductDefaults {
  productCode: string;
  description?: string | null;
  supplierCode?: string | null;
  measureUnit?: string | null;
  quantity: number;
  price: number;
  cost: number;
  stock?: number | null;
  kitComponents: DdtKitComponent[];
}

/** "Aperti" tab of the list: Aperto, Parziale, In commessa (stato_ddt), i.e. every status but Chiuso. */
export const DDT_OPEN_STATUS_IDS = [1, 2, 4];

export interface DdtSearchRequest {
  search?: string;
  year?: number;
  statusId?: number;
  /** Any of these statuses (query string statusIds=1&statusIds=2). */
  statusIds?: number[];
  causalId?: string;
  recipientType?: DdtRecipientType;
  fromDate?: string;
  toDate?: string;
  includes?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface DdtTotals {
  totalPrice: number;
  totalCost: number;
  notInvoicedPrice: number;
  notInvoicedCost: number;
  invoicedPrice: number;
  invoicedCost: number;
}
