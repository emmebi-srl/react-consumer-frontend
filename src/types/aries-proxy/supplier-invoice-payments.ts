export interface SupplierInvoicePayment {
  paymentId: number;
  invoiceId: number;
  invoiceYear: number;
  supplierId?: number | null;
  totalPayment?: number | null;
  totalPrepayment?: number | null;
  paymentDate: number;
  paymentCondition?: string | null;
  paymentType?: string | null;
  paymentTypeId?: number | null;
  notes?: string | null;
  unsolved?: boolean | null;
  isPaid?: boolean | null;
  firstNoteEmployeeId?: number | null;
  addTransferTo?: boolean | null;
}

export interface SupplierInvoicePaymentSaveRequest {
  paidAt: string;
  paymentTypeId: number;
  notes?: string | null;
  unsolved?: boolean | null;
  employeeId?: number | null;
  addTransferTo?: boolean | null;
}
