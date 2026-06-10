import ariesServicesClient from '~/clients/aries-services-client';
import {
  SupplierInvoicePayment,
  SupplierInvoicePaymentSaveRequest,
} from '~/types/aries-proxy/supplier-invoice-payments';

export const getSupplierInvoicePayment = (year: number, id: number, paymentId: number) => {
  return ariesServicesClient.get<SupplierInvoicePayment>(`supplier-invoice/payment/${year}/${id}/${paymentId}`);
};

export const saveSupplierInvoicePayment = (
  year: number,
  id: number,
  paymentId: number,
  req: SupplierInvoicePaymentSaveRequest,
) => {
  return ariesServicesClient.patch(`supplier-invoice/payment/${year}/${id}/${paymentId}`, req);
};
