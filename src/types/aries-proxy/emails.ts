export interface EmailList {
  emails: Email[];
}

export interface Email {
  id: number;
  subject: string;
  body: string;
  senderAddress?: string | null;
  replyToAddress?: string | null;
  cc?: string | null;
  bcc?: string | null;
  sentAt?: number | null;
}
