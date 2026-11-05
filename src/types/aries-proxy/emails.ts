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
