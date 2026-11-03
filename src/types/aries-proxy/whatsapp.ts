import { Campaign } from './campaigns';
import { Customer } from './customers';
import { System } from './systems';

// ==============================
// WhatsApp templates (template_whatsapp)
// ==============================
export interface WhatsappTemplate {
  id: number;
  name: string;
  language: string;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  isActive: boolean;
  /** Active in Aries and approved by Meta: it can be chosen for a campaign. */
  isUsable: boolean;
  synchronizationDate?: number | null;
}

export interface WhatsappTemplateList {
  whatsappTemplates: WhatsappTemplate[];
}

export interface WhatsappTemplateSyncResult {
  added: number;
  updated: number;
  whatsappTemplates: WhatsappTemplate[];
}

/** Template already created in WhatsApp Manager, added to Aries without waiting for a sync. */
export interface WhatsappTemplateCreate {
  name: string;
  language: string;
  description?: string | null;
}

// ==============================
// WhatsApp received messages (campagna_aries_whatsapp_messaggio_ricevuto)
// ==============================
export interface WhatsappReceivedMessageList {
  whatsappReceivedMessages: WhatsappReceivedMessage[];
}

export interface WhatsappReceivedMessage {
  id: number;
  senderPhone: string;
  senderName?: string | null;
  /** "text", "button", "image", ... */
  type: string;
  /** Written text, or the label of the pressed button. */
  text?: string | null;
  buttonPayload?: string | null;
  receivedDate: number;
  /** When the reply was forwarded by email; null while pending or failed. */
  notificationDate?: number | null;
  notificationAttempts: number;
  notificationError?: string | null;
  notificationStatus: WhatsappNotificationStatus;
  campaignWhatsappId?: number | null;
  /** Null when the message cannot be linked to a campaign we sent. */
  campaignDispatchId?: number | null;
  campaignId?: number | null;
  customerId?: number | null;
  systemId?: number | null;
  /** With includes "campaign". */
  campaign?: Campaign;
  /** With includes "customer". */
  customer?: Customer;
  /** With includes "system". */
  system?: System;
}

export const WhatsappNotificationStatus = {
  Sent: 'sent',
  Pending: 'pending',
  Failed: 'failed',
} as const;

export type WhatsappNotificationStatus = (typeof WhatsappNotificationStatus)[keyof typeof WhatsappNotificationStatus];

export interface WhatsappReceivedMessageSearchRequest {
  search?: string;
  notificationStatus?: WhatsappNotificationStatus;
  pageSize?: number;
  pageIndex?: number;
  /** "customer", "system", "campaign", comma separated. */
  includes?: string;
}
