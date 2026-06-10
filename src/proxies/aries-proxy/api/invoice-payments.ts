import ariesServicesClient from '~/clients/aries-services-client';
import { InvoicePayment, InvoicePaymentSaveRequest } from '~/types/aries-proxy/invoice-payments';

export const getInvoicePayment = (year: number, id: number, paymentId: number) => {
  return ariesServicesClient.get<InvoicePayment>(`invoice/payment/${year}/${id}/${paymentId}`);
};

export const saveInvoicePayment = (year: number, id: number, paymentId: number, req: InvoicePaymentSaveRequest) => {
  return ariesServicesClient.patch(`invoice/payment/${year}/${id}/${paymentId}`, req);
};
