export interface EmailList {
  emails: Email[];
}

export interface EmailStatus {
  id: number;
  name: string;
}

export interface EmailStatusList {
  statuses: EmailStatus[];
}

export interface EmailGroup {
  id: number;
  name: string;
}

/** Same values as mail_stato and the Delphi TEmailStatusEnum. */
export enum EmailStatusId {
  Sending = 0,
  Sent = 1,
  Failed = 2,
  Scheduled = 3,
  Canceled = 4,
  Draft = 5,
}

export interface Email {
  id: number;
  subject: string;
  /** RTF for the emails written in Delphi, HTML for the campaign ones. Empty in the search results. */
  body: string;
  senderId?: number;
  /** Filled by the "sender" include. */
  senderUsername?: string | null;
  senderAddress?: string | null;
  replyToAddress?: string | null;
  /** Despite the name, Delphi stores here the "To" recipients. */
  cc?: string | null;
  bcc?: string | null;
  pec?: boolean;
  statusId?: number;
  /** Filled by the "status" include. */
  status?: EmailStatus | null;
  groupId?: number | null;
  /** Filled by the "group" include. */
  group?: EmailGroup | null;
  /** 0 for the drafts, which have not been sent yet. */
  sentAt?: number | null;
  /** Set by the open-tracking pixel, or manually from Delphi. */
  isRead?: boolean;
  readConfirmation?: boolean;
  errorMessage?: string | null;
}

export interface EmailSearchRequest {
  search?: string;
  statusId?: number;
  fromDate?: string;
  toDate?: string;
  includes?: string;
  pageIndex?: number;
  pageSize?: number;
}

/** A user the current user can send as (utente_mail, like the Delphi editor). */
export interface EmailSender {
  id: number;
  username: string;
  email?: string | null;
  /** Plain text, added at the bottom of the body. */
  signature?: string | null;
  readConfirmation: boolean;
  /** The user has an SMTP server and an address. */
  canSend: boolean;
}

export interface EmailSenderList {
  senders: EmailSender[];
  pecAvailable: boolean;
}

export interface EmailSendRequest {
  senderId: number;
  /** Separated by ";". */
  to: string;
  bcc?: string;
  subject: string;
  /** Plain text. */
  body: string;
  pec: boolean;
  readConfirmation: boolean;
  /** Forward: its attachments are added by the server. */
  forwardedEmailId?: number;
}
