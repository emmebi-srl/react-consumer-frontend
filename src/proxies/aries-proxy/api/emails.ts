import ariesServicesClient from '~/clients/aries-services-client';
import { EmailList, EmailSearchRequest, EmailStatusList } from '~/types/aries-proxy/emails';
import { SearchMetadata } from '~/types/aries-proxy/shared';

/** Emails the current user can see, like the Delphi list, newest first. */
export const searchEmails = (req?: EmailSearchRequest) => {
  return ariesServicesClient.get<EmailList>('email', { params: req });
};

export const getEmailsMetadata = (req?: EmailSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('email/metadata', { params: req });
};

export const getEmailStatuses = () => {
  return ariesServicesClient.get<EmailStatusList>('email/status');
};

export const getEmailById = (id: number) => {
  return ariesServicesClient.get<EmailList>(`email/${id}`);
};

export const getEmailEml = (id: number) => {
  return ariesServicesClient.get<ArrayBuffer>(`email/${id}/eml`, {
    responseType: 'arraybuffer',
  });
};
