export interface PaymentType {
  id: number;
  name: string;
  description?: string | null;
}

export interface PaymentTypeList {
  paymentTypes: PaymentType[];
}
