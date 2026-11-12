import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from '@mui/icons-material';
import { Button, Card, CardContent, CardHeader } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import UserEmailSettingsFields from '~/components/Users/UserEmailSettingsFields';
import {
  toUserEmailSettingsFormValues,
  toUserEmailSettingsRequest,
  UserEmailSettingsFormValues,
  userEmailSettingsSchema,
} from '~/components/Users/userEmailSettingsForm';
import useSnackbar from '~/hooks/useSnackbar';
import { useSaveMyAccount } from '~/proxies/aries-proxy/users';
import { UserAccount } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';

const ProfileEmailCard: React.FC<{ account: UserAccount }> = ({ account }) => {
  const snackbar = useSnackbar();
  const saveMutation = useSaveMyAccount();
  const form = useForm<UserEmailSettingsFormValues>({
    resolver: zodResolver(userEmailSettingsSchema),
    values: toUserEmailSettingsFormValues(account),
    resetOptions: { keepDirtyValues: true },
  });
  const { isDirty, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    try {
      const saved = await saveMutation.mutateAsync(toUserEmailSettingsRequest(values));
      form.reset(toUserEmailSettingsFormValues(saved));
      snackbar.success('Profilo salvato');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare il profilo.'));
    }
  });

  return (
    <Card variant="outlined">
      <CardHeader
        title="Dati ed email"
        subheader="Descrizione, indirizzo e server usati per inviare le email da Aries"
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
        action={
          <Button startIcon={<Save />} variant="contained" disabled={!isDirty || isSubmitting} onClick={submit}>
            Salva
          </Button>
        }
      />
      <CardContent component="form" onSubmit={submit}>
        <FormProvider {...form}>
          <UserEmailSettingsFields hasEmailPassword={account.hasEmailPassword} />
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default ProfileEmailCard;
