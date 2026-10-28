import ariesServicesClient from '~/clients/aries-services-client';

import { WhatsappTemplateCreate, WhatsappTemplateList, WhatsappTemplateSyncResult } from '~/types/aries-proxy/whatsapp';

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
