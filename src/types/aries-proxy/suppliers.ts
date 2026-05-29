export interface SupplierList {
  suppliers: Supplier[];
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

export interface SupplierSearchRequest {
  search?: string;
  pageIndex?: number;
  pageSize?: number;
  includes?: string;
}
