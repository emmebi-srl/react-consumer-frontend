import z from 'zod';
import {
  toUserEmailSettingsFormValues,
  toUserEmailSettingsRequest,
  userEmailSettingsSchema,
} from '~/components/Users/userEmailSettingsForm';
import { USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from '~/components/Users/userPasswordRules';
import { UserAccount, UserAccountSaveRequest } from '~/types/aries-proxy/users';

export type UserFormMode = 'create' | 'edit';

/** On edit an empty password keeps the current one. */
export const getUserFormSchema = (mode: UserFormMode) =>
  userEmailSettingsSchema.extend({
    // utente.Nome is VARCHAR(60) and unique (checked by the server).
    username: z.string().trim().min(1, 'Nome utente obbligatorio').max(60, 'Massimo 60 caratteri'),
    password: z
      .string()
      .max(USER_PASSWORD_MAX_LENGTH, `Massimo ${USER_PASSWORD_MAX_LENGTH} caratteri`)
      .refine((value) => (mode === 'edit' && value === '') || value.length >= USER_PASSWORD_MIN_LENGTH, {
        message: `Almeno ${USER_PASSWORD_MIN_LENGTH} caratteri`,
      }),
    userTypeId: z.number().int().positive('Selezionare la tipologia'),
    roleIds: z.array(z.number().int()),
  });

export type UserFormValues = z.infer<ReturnType<typeof getUserFormSchema>>;

export const toUserFormValues = (user: UserAccount | undefined): UserFormValues => ({
  ...toUserEmailSettingsFormValues(user),
  username: user?.username ?? '',
  password: '',
  userTypeId: user?.userTypeId ?? 0,
  roleIds: user?.roleIds ?? [],
});

export const toUserAccountSaveRequest = (values: UserFormValues): UserAccountSaveRequest => ({
  ...toUserEmailSettingsRequest(values),
  username: values.username,
  password: values.password,
  userTypeId: values.userTypeId,
  roleIds: values.roleIds,
});
