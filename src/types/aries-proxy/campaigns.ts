import { Customer } from './customers';
import { System } from './systems';

// ==============================
// Campaign List
// ==============================
export interface CampaignList {
  campaigns: Campaign[];
}

// ==============================
// Campaign  / Create / Update
// ==============================
export interface Campaign {
  replyToAddress?: string | null;
  whatsappReplyNotificationAddresses?: string | null;
  whatsappTemplateId?: number | null;
  /** The WhatsApp document header gets the email body as PDF (not attached to the email). */
  whatsappMailBodyPdf?: boolean;
  /** Name of that PDF, placeholders allowed; empty = the email subject. */
  whatsappMailBodyPdfFileName?: string | null;
  id: number;
  campaignTypeId: number;
  name: string;
  description: string;
  mailSubject: string;
  mailTemplatePath: string;
  activationDate?: number | null;
  deactivationDate?: number | null;
  campaignType?: CampaignType;
  active: boolean;
}

export interface CampaignCreate {
  replyToAddress?: string | null;
  whatsappReplyNotificationAddresses?: string | null;
  whatsappTemplateId?: number | null;
  whatsappMailBodyPdf?: boolean;
  whatsappMailBodyPdfFileName?: string | null;
  campaignTypeId: number;
  name: string;
  description: string;
  mailTemplate: string;
  mailSubject: string;
  activationDate?: number | null;
  deactivationDate?: number | null;
  active: boolean;
}

export interface CampaignUpdate {
  replyToAddress?: string | null;
  whatsappReplyNotificationAddresses?: string | null;
  whatsappTemplateId?: number | null;
  whatsappMailBodyPdf?: boolean | null;
  /** Empty string restores the email subject; omitted leaves it unchanged. */
  whatsappMailBodyPdfFileName?: string | null;
  campaignTypeId?: number | null;
  name?: string | null;
  description?: string | null;
  mailSubject?: string | null;
  mailTemplatePath?: string;
  activationDate?: number | null;
  deactivationDate?: number | null;
  active?: boolean | null;
}

// ==============================
// Campaign Type List / s
// ==============================
export interface CampaignTypeList {
  campaignTypes: CampaignType[];
}

export interface CampaignType {
  id: number;
  name: string;
  applicationReference: string;
}

export interface CampaignTypeCreate {
  name: string;
  applicationReference: string;
}

export interface CampaignTypeUpdate {
  name?: string | null;
}

/** Settings of a campaign type for a customer type. A pair without a row uses the defaults (every channel enabled). */
export interface CampaignTypeCustomerType {
  campaignTypeId: number;
  customerTypeId: number;
  isWhatsappEnabled: boolean;
}

export interface CampaignTypeCustomerTypeList {
  campaignTypeCustomerTypes: CampaignTypeCustomerType[];
}

export interface CampaignTypeCustomerTypeSearchRequest {
  campaignTypeId?: number;
  customerTypeId?: number;
}

/** Upsert of the row of the pair. */
export type CampaignTypeCustomerTypeSave = CampaignTypeCustomerType;

// ==============================
// Campaign Global Placeholder
// ==============================
export interface CampaignGlobalPlaceholderList {
  campaignGlobalPlaceholders: CampaignGlobalPlaceholder[];
}

export interface CampaignGlobalPlaceholder {
  name: string;
  description: string;
}

// ==============================
// Campaign Placeholder
// ==============================
export interface CampaignPlaceholderList {
  campaignPlaceholders: CampaignPlaceholder[];
}

export interface CampaignPlaceholder {
  id: number;
  campaignTypeId: number;
  name: string;
  description: string;
}

export interface CampaignPlaceholderCreate {
  campaignTypeId: number;
  name: string;
  description: string;
}

export interface CampaignPlaceholderUpdate {
  campaignTypeId?: number | null;
  name?: string | null;
  description?: string | null;
}

// ==============================
// Campaign Mail List
// ==============================
export interface CampaignMailList {
  campaignMails: CampaignMail[];
}

export interface CampaignMail {
  id: number;
  campaignId: number;
  customerId: number;
  systemId?: number | null;
  mailId?: number | null;
  statusId?: number | null;
  email: string;
  sendDate?: number | null;
  plannedSendDate: number;
  isProcessed: boolean;
  isRead: boolean;
  hasInteracted: boolean;
  isUnsubscribed: boolean;
  processingError?: string | null;
  note?: string | null;
  insertionDate: number;
  customer?: Customer;
  system?: System;
  status?: CampaignMailStatus;
  /** Delivery status of the email channel, while `status` is the one of the dispatch. */
  emailStatus?: CampaignChannelStatus | null;
  /** Null when the dispatch is not sent on WhatsApp. */
  whatsapp?: CampaignWhatsapp | null;
}

export interface CampaignChannelStatus {
  id: number;
  name: string;
  applicationReference?: string | null;
  color?: string | null;
  isFinal: boolean;
}

export interface CampaignWhatsapp {
  id: number;
  phone: string;
  templateName?: string | null;
  templateLanguage?: string | null;
  statusId?: number | null;
  isProcessed: boolean;
  sendDate?: number | null;
  deliveryDate?: number | null;
  readDate?: number | null;
  isRead: boolean;
  isUnsubscribed: boolean;
  errorCode?: string | null;
  processingError?: string | null;
  status?: CampaignChannelStatus | null;
}

export const CampaignMailStatusReference = {
  WaitingForSend: 'waiting_for_send',
  Sent: 'sent',
  Viewed: 'viewed',
  LandingPageOpened: 'landing_page_opened',
  ResponseReceived: 'response_received',
  PositiveOutcome: 'positive_outcome',
  NegativeOutcome: 'negative_outcome',
  ProcessingError: 'processing_error',
  MoreInfoRequested: 'more_info_requested',
} as const;

export type CampaignMailStatusReference =
  (typeof CampaignMailStatusReference)[keyof typeof CampaignMailStatusReference];

export interface CampaignMailStatus {
  id: number;
  name: string;
  applicationReference?: CampaignMailStatusReference | null;
  color?: string | null;
  isFinal: boolean;
}

export interface CampaignMailStatusList {
  statuses: CampaignMailStatus[];
}

export interface CampaignMailMetadataResponse {
  metadata: CampaignMailMetadata;
}

export interface CampaignMailMetadata {
  totalCount: number;
  recipientsCount: number;
  statusCounts: CampaignMailStatusMetadata[];
}

export interface CampaignMailStatusMetadata {
  statusApplicationReference?: CampaignMailStatusReference | null;
  statusName?: string | null;
  totalCount: number;
}

export interface CampaignMailCreate {
  campaignId: number;
  customerId: number;
  systemId?: number | null;
  mailId?: number | null;
  statusId?: number | null;
  email: string;
  sendDate?: number | null;
  plannedSendDate?: number | null;
  isProcessed?: boolean | null;
  processingError?: string | null;
  note?: string | null;
}

export interface CampaignMailUpdate {
  campaignId?: number | null;
  customerId?: number | null;
  systemId?: number | null;
  mailId?: number | null;
  statusId?: number | null;
  email?: string | null;
  sendDate?: number | null;
  plannedSendDate?: number | null;
  isProcessed?: boolean | null;
  processingError?: string | null;
  note?: string | null;
}

export interface CampaignMailSearchRequest {
  search?: string;
  status?: string;
  processed?: boolean;
  fromDate?: number | null;
  toDate?: number | null;
  pageSize?: number;
  pageIndex?: number;
  includes?: string;
}

// ==============================
// Campaign Mail Data List / s
// ==============================
export interface CampaignMailDataList {
  campaignMailData: CampaignMailData[];
}

export interface CampaignMailData {
  id: number;
  campaignMailId: number;
  campaignPlaceholderId: number;
  value: string;
}

export interface CampaignMailDataCreate {
  campaignMailId: number;
  campaignPlaceholderId: number;
  value: string;
}

export interface CampaignMailDataUpdate {
  campaignMailId?: number | null;
  campaignPlaceholderId?: number | null;
  value?: string | null;
}

export interface CampaignSearchRequest {
  search?: string;
  active?: boolean;
  fromDate?: number | null;
  toDate?: number | null;
  pageSize?: number;
  pageIndex?: number;
  includes?: string;
}

export interface CampaignPlaceholderSearchRequest {
  search?: string;
  campaignTypeId?: number;
  pageSize?: number;
  pageIndex?: number;
}
