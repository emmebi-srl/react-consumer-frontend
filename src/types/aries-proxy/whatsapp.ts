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

export const WhatsappMessageDirection = {
  /** Written by the customer. */
  Inbound: 'inbound',
  /** Free text reply of an operator. */
  Outbound: 'outbound',
} as const;

export type WhatsappMessageDirection = (typeof WhatsappMessageDirection)[keyof typeof WhatsappMessageDirection];

export const WhatsappReplyStatus = {
  Sent: 'sent',
  Delivered: 'delivered',
  Read: 'read',
  Failed: 'failed',
} as const;

export type WhatsappReplyStatus = (typeof WhatsappReplyStatus)[keyof typeof WhatsappReplyStatus];

/** Outbound message sent by a campaign (its text is not stored). */
export const WhatsappTemplateMessageType = 'template';

export interface WhatsappConversationMessage {
  /** Unique together with `direction` and `type`. */
  id: number;
  direction: WhatsappMessageDirection;
  /** Inbound: "text", "button", "image", ...; outbound: "text" (operator reply) or "template" (campaign). */
  type: string;
  /** Template only. */
  templateName?: string | null;
  campaignId?: number | null;
  campaignName?: string | null;
  text?: string | null;
  buttonPayload?: string | null;
  date: number;
  /** Outbound only; templates can also be "skipped". */
  status?: WhatsappSentStatus;
  error?: string | null;
  userId?: number | null;
  userName?: string | null;
}

/** Messages of the customer and replies of the operators with one number, oldest first. */
export interface WhatsappConversation {
  /** Digits only, as Meta sends it (e.g. 393331234567). */
  phone: string;
  senderName?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  /** To answer by email after the 24 hours: contacts with this phone first, then the main contact. */
  customerEmails?: string[] | null;
  lastReceivedDate?: number | null;
  /** 24 hours after the last message of the customer: free text replies only until then. */
  replyWindowEnd?: number | null;
  canReply: boolean;
  messages: WhatsappConversationMessage[];
}

export interface WhatsappConversationReply {
  text: string;
}

// ==============================
// WhatsApp sent messages: campaign templates (campagna_aries_whatsapp) and operator replies
// ==============================
export const WhatsappSentMessageKind = {
  Template: 'template',
  Reply: 'reply',
} as const;

export type WhatsappSentMessageKind = (typeof WhatsappSentMessageKind)[keyof typeof WhatsappSentMessageKind];

/** Status of a message we sent: replies use the first four, campaign templates also "skipped". */
export const WhatsappSentStatus = {
  ...WhatsappReplyStatus,
  /** Template not sent because the number unsubscribed from the campaign type. */
  Skipped: 'skipped',
} as const;

export type WhatsappSentStatus = (typeof WhatsappSentStatus)[keyof typeof WhatsappSentStatus];

export interface WhatsappSentMessage {
  /** Unique together with `id`. */
  kind: WhatsappSentMessageKind;
  id: number;
  /** Digits only (e.g. 393331234567). */
  phone: string;
  /** Reply only: the template text is not stored. */
  text?: string | null;
  templateName?: string | null;
  status: WhatsappSentStatus;
  error?: string | null;
  sendDate: number;
  deliveryDate?: number | null;
  readDate?: number | null;
  /** Reply only: operator who wrote it. */
  userName?: string | null;
  campaignDispatchId?: number | null;
  campaignId?: number | null;
  campaignName?: string | null;
  customerId?: number | null;
  customerName?: string | null;
}

export interface WhatsappSentMessageList {
  whatsappSentMessages: WhatsappSentMessage[];
}

export interface WhatsappSentMessageSearchRequest {
  search?: string;
  status?: WhatsappSentStatus;
  kind?: WhatsappSentMessageKind;
  pageSize?: number;
  pageIndex?: number;
}

/** Settings of the campaign WhatsApp account. */
export interface WhatsappSettings {
  /**
   * Where received messages are forwarded when their campaign gives no recipient (above all messages not
   * linked to a campaign). ";" separated; empty = the reply-to of the campaign email account.
   */
  fallbackNotificationAddresses?: string | null;
}
