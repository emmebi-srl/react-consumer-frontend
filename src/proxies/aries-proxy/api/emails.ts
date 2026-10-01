import ariesServicesClient from '~/clients/aries-services-client';
import { EmailList } from '~/types/aries-proxy/emails';

export const getEmailById = (id: number) => {
  return ariesServicesClient.get<EmailList>(`email/${id}`);
};

export const getEmailEml = (id: number) => {
  return ariesServicesClient.get<ArrayBuffer>(`email/${id}/eml`, {
    responseType: 'arraybuffer',
  });
};
