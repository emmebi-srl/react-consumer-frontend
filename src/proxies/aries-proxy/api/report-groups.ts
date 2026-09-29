import ariesServicesClient from '~/clients/aries-services-client';

export const getReportGroupPdf = (year: number, id: number) =>
  ariesServicesClient.get<Blob>(`report-group/${year}/${id}/pdf`, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });
