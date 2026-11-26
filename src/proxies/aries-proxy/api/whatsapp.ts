import ariesServicesClient from '~/clients/aries-services-client';

import { SearchMetadata } from '~/types/aries-proxy/shared';
import {
  WhatsappConversation,
  WhatsappConversationReply,
  WhatsappReceivedMessageList,
  WhatsappReceivedMessageSearchRequest,
  WhatsappSentMessageList,
  WhatsappSentMessageSearchRequest,
  WhatsappSettings,
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

/** Messages we sent (campaign templates and operator replies), newest first. */
export const getWhatsappSentMessages = (req?: WhatsappSentMessageSearchRequest) => {
  return ariesServicesClient.get<WhatsappSentMessageList>('whatsapp/sent-messages', { params: req });
};

export const getWhatsappSentMessagesMetadata = (req?: WhatsappSentMessageSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('whatsapp/sent-messages/metadata', { params: req });
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

export const getWhatsappSettings = () => {
  return ariesServicesClient.get<WhatsappSettings>('whatsapp/settings');
};

export const saveWhatsappSettings = (data: WhatsappSettings) => {
  return ariesServicesClient.put<WhatsappSettings>('whatsapp/settings', data);
};

/** Messages and replies of one number (the phone is the conversation). */
export const getWhatsappConversation = (phone: string) => {
  return ariesServicesClient.get<WhatsappConversation>(`whatsapp/conversations/${encodeURIComponent(phone)}`);
};

/** Free text reply: refused by the server after 24 hours from the last message of the customer. */
export const sendWhatsappReply = (phone: string, data: WhatsappConversationReply) => {
  return ariesServicesClient.post<WhatsappConversation>(
    `whatsapp/conversations/${encodeURIComponent(phone)}/messages`,
    data,
  );
};
