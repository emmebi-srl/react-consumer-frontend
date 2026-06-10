export interface InvoicePayment {
  paymentId: number;
  invoiceId: number;
  invoiceYear: number;
  customerId?: number | null;
  supplierId?: number | null;
  totalPayment?: number | null;
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

export interface InvoicePaymentSaveRequest {
  paidAt: string;
  paymentTypeId: number;
  notes?: string | null;
  unsolved?: boolean | null;
  employeeId?: number | null;
  addTransferTo?: boolean | null;
}
