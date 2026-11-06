import ariesServicesClient from '~/clients/aries-services-client';
import {
  EmailList,
  EmailSearchRequest,
  EmailSenderList,
  EmailSendRequest,
  EmailStatusList,
} from '~/types/aries-proxy/emails';
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

export const getEmailSenders = () => {
  return ariesServicesClient.get<EmailSenderList>('email/senders');
};

/**
 * Multipart: FormData is not mapped by the client, so the JSON payload is written in snake_case here.
 * The response is the saved email: with the Failed status when the mail server refused it.
 */
export const sendEmail = (request: EmailSendRequest, files: File[]) => {
  const formData = new FormData();
  formData.append(
    'payload',
    JSON.stringify({
      sender_id: request.senderId,
      to: request.to,
      bcc: request.bcc ?? '',
      subject: request.subject,
      body: request.body,
      pec: request.pec,
      read_confirmation: request.readConfirmation,
      forwarded_email_id: request.forwardedEmailId ?? null,
    }),
  );
  files.forEach((file) => formData.append('files', file, file.name));
  return ariesServicesClient.post<EmailList>('email/send', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** Sends the saved eml again, like "REINVIA" in Delphi. */
export const resendEmail = (id: number) => {
  return ariesServicesClient.post<EmailList>(`email/${id}/resend`);
};
