import z from 'zod';
import { UserAccount, UserEmailSettingsRequest } from '~/types/aries-proxy/users';

// Lengths of the `utente` columns (Delphi TFSettingsUsers): mail 100, smtp / nome_utente_mail / password_mail 45.
export const userEmailSettingsSchema = z.object({
  description: z.string().trim(),
  email: z.union([z.literal(''), z.email('Email non valida').max(100, 'Massimo 100 caratteri')]),
  signature: z.string(),
  smtpHost: z.string().trim().max(45, 'Massimo 45 caratteri'),
  smtpPort: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 65535), {
      message: 'Porta non valida',
    }),
  useSsl: z.boolean(),
  emailUsername: z.string().trim().max(45, 'Massimo 45 caratteri'),
  /** Write-only: empty keeps the stored password. */
  emailPassword: z.string().max(45, 'Massimo 45 caratteri'),
  hasConfirmationOfReading: z.boolean(),
});

export type UserEmailSettingsFormValues = z.infer<typeof userEmailSettingsSchema>;

export const toUserEmailSettingsFormValues = (user: UserAccount | undefined): UserEmailSettingsFormValues => ({
  description: user?.description ?? '',
  email: user?.email ?? '',
  signature: user?.signature ?? '',
  smtpHost: user?.smtpHost ?? '',
  smtpPort: user?.smtpPort ? String(user.smtpPort) : '',
  useSsl: user?.useSsl ?? false,
  emailUsername: user?.emailUsername ?? '',
  emailPassword: '',
  hasConfirmationOfReading: user?.hasConfirmationOfReading ?? false,
});

export const toUserEmailSettingsRequest = (values: UserEmailSettingsFormValues): UserEmailSettingsRequest => ({
  description: values.description,
  email: values.email,
  signature: values.signature,
  smtpHost: values.smtpHost,
  // The server keeps the stored port when none is sent, like Delphi.
  smtpPort: values.smtpPort === '' ? null : Number(values.smtpPort),
  useSsl: values.useSsl,
  emailUsername: values.emailUsername,
  emailPassword: values.emailPassword,
  hasConfirmationOfReading: values.hasConfirmationOfReading,
});
