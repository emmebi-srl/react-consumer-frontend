export interface SupplierInvoiceList {
  supplierInvoices: SupplierInvoice[];
}

export interface SupplierInvoicePeriodicConfigurationList {
  periodicConfigurations: SupplierInvoicePeriodicConfiguration[];
}

export interface SupplierInvoiceStatusList {
  statuses: SupplierInvoiceStatus[];
}

export interface SupplierInvoiceTypeList {
  types: SupplierInvoiceType[];
}

export interface SupplierInvoiceCausalList {
  causals: SupplierInvoiceCausal[];
}

export interface SupplierInvoiceStatus {
  id: number;
  name?: string | null;
  description?: string | null;
  color?: string | null;
}

export interface SupplierInvoiceType {
  id: number;
  name?: string | null;
  description?: string | null;
}

export interface SupplierInvoiceCausal {
  id: number;
  name?: string | null;
  description?: string | null;
}

export interface PaymentCondition {
  id: number;
  name?: string | null;
  description?: string | null;
}

export interface ActivityType {
  id: number;
  name?: string | null;
  description?: string | null;
}

export interface SupplierInvoicePeriodicConfiguration {
  id: number;
  supplierId: number;
  supplier?: Supplier;
  defaultAmount: number;
  useLastSupplierInvoiceAmount: boolean;
  rowDescription?: string | null;
  startDate: string;
  endDate?: string | null;
  periodUnit: SupplierInvoicePeriodicUnit;
  periodInterval: number;
  enabled: boolean;
  insertionDate: string;
  insertionUserId?: number | null;
  updateDate?: string | null;
  updateUserId?: number | null;
}

export type SupplierInvoicePeriodicUnit = 'week' | 'month' | 'year';

export interface SupplierInvoicePeriodicConfigurationCreateRequest {
  supplierId: number;
  defaultAmount: number;
  useLastSupplierInvoiceAmount: boolean;
  rowDescription?: string | null;
  startDate: string;
  endDate?: string | null;
  periodUnit: SupplierInvoicePeriodicUnit;
  periodInterval: number;
  enabled: boolean;
}

export interface SupplierInvoicePeriodicConfigurationUpdateRequest extends Partial<SupplierInvoicePeriodicConfigurationCreateRequest> {}

export interface SupplierInvoicePeriodicConfigurationSearchRequest {
  search?: string;
  supplierId?: number;
  enabled?: boolean;
  includes?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface Supplier {
  id: number;
  companyName?: string | null;
  companyName2?: string | null;
  vatNumber?: string | null;
  fiscalCode?: string | null;
  statusId?: string | null;
  status?: string | null;
  paymentConditionId?: number | null;
  paymentCondition?: string | null;
  supplierTypeId: number;
  supplierType?: string | null;
  supplierCode?: string | null;
}

export interface SupplierInvoice {
  id: number;
  year: number;
  supplierId: number;
  registrationDate: string;
  editDate: string;
  invoiceDate: string;
  paymentConditionId: number;
  annotations?: string | null;
  statusId: number;
  causalId: number;
  internalNote?: string | null;
  typeId: number;
  collectionCosts: number;
  stampDuty: number;
  transportCosts: number;
  received: number;
  paidAt?: string | null;
  means?: number | null;
  isUnsolved: boolean;
  supplierInvoiceCode: string;
  bodyNetAmount: number;
  bodyAmount: number;
  totalAmount: number;
  isScanned: boolean;
  dateChange: string;
  cablesCost: number;
  useAndConsumption: number;
  activityId?: number | null;
  hasCollectionCostsVat: boolean;
  hasStampDutyVat: boolean;
  btiVat: number;
  btiVatValue: number;
  transmissionFormat?: string | null;
  recipientCode?: string | null;
  recipientPec?: string | null;
  progressiveSending?: string | null;
  eInvoiceType?: string | null;
  documentSource?: string | null;
  eInvoiceFileName?: string | null;
  periodicConfigurationId?: number | null;
  supplier?: Supplier;
  status?: SupplierInvoiceStatus;
  type?: SupplierInvoiceType;
  causal?: SupplierInvoiceCausal;
  paymentCondition?: PaymentCondition;
  activity?: ActivityType;
  products?: SupplierInvoiceProduct[];
}

export interface SupplierInvoiceProduct {
  invoiceId: number;
  year: number;
  tabId: number;
  description?: string | null;
  unitOfMeasure?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  discount?: number | null;
  cost?: number | null;
  serialNumber?: string | null;
  materialId?: string | null;
  vatId?: number | null;
  supplierCode?: string | null;
  referenceYear?: number | null;
  referenceId?: number | null;
  type?: string | null;
  anomalous: boolean;
  corrected: boolean;
  noteId?: number | null;
  corrected2: boolean;
  repair: boolean;
}

export interface SupplierInvoiceSearchRequest {
  search?: string;
  year?: number;
  supplierId?: number;
  statusId?: number;
  typeId?: number;
  causalId?: number;
  fromDate?: string;
  toDate?: string;
  includes?: string;
  pageIndex?: number;
  pageSize?: number;
}
