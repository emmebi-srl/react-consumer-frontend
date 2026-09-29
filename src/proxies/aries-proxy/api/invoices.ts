import ariesServicesClient from '~/clients/aries-services-client';

export const getInvoicePdf = (year: number, id: number) =>
  ariesServicesClient.get<Blob>(`invoice/${year}/${id}/pdf`, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });
