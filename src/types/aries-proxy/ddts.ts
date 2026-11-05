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

export interface TransportCausal {
  /** Short text code, e.g. "VI". */
  id: string;
  name: string;
}

export interface TransportCausalList {
  causals: TransportCausal[];
}

export interface DdtDestination {
  province?: string | null;
  municipality?: string | null;
  postalCode?: string | null;
  street?: string | null;
}

export type DdtRecipientType = 'customer' | 'supplier';

export interface Ddt {
  id: number;
  year: number;
  customerId?: number | null;
  /** Filled by the "customer" include. */
  customerName?: string | null;
  supplierId?: number | null;
  /** Filled by the "supplier" include. */
  supplierName?: string | null;
  /** Customer destination, filled by the "destination" include. */
  destination?: DdtDestination | null;
  /** Supplier destination, filled by the "destination" include. */
  supplierDestination?: DdtDestination | null;
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
  /** Shown as "Note" in Delphi. */
  description?: string | null;
  isPrinted: boolean;
}

export interface DdtList {
  ddts: Ddt[];
}

export interface DdtSearchRequest {
  search?: string;
  year?: number;
  statusId?: number;
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
