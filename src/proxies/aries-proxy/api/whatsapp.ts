import ariesServicesClient from '~/clients/aries-services-client';

import { SearchMetadata } from '~/types/aries-proxy/shared';
import {
  WhatsappReceivedMessageList,
  WhatsappReceivedMessageSearchRequest,
  WhatsappTemplateCreate,
  WhatsappTemplateList,
  WhatsappTemplateSyncResult,
} from '~/types/aries-proxy/whatsapp';

/** Messages written by the customers, newest first. */
export const getWhatsappReceivedMessages = (req?: WhatsappReceivedMessageSearchRequest) => {
  return ariesServicesClient.get<WhatsappReceivedMessageList>('whatsapp/received-messages', { params: req });
};

export const getWhatsappReceivedMessagesMetadata = (req?: WhatsappReceivedMessageSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('whatsapp/received-messages/metadata', { params: req });
};

export const getWhatsappTemplates = () => {
  return ariesServicesClient.get<WhatsappTemplateList>('whatsapp/templates');
};

/** Adds a template of WhatsApp Manager: the server checks on Meta that it exists. */
export const createWhatsappTemplate = (data: WhatsappTemplateCreate) => {
  return ariesServicesClient.post<WhatsappTemplateList>('whatsapp/templates', data);
};

/** Reads the templates from WhatsApp Manager and updates the Aries list. */
export const syncWhatsappTemplates = () => {
  return ariesServicesClient.post<WhatsappTemplateSyncResult>('whatsapp/templates/sync');
};
