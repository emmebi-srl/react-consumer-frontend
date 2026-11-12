import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardContent, CardHeader, Grid, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from '~/components/Users/userPasswordRules';
import useSnackbar from '~/hooks/useSnackbar';
import { useChangeMyPassword } from '~/proxies/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';

const FormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Inserire la password attuale'),
    newPassword: z
      .string()
      .min(USER_PASSWORD_MIN_LENGTH, `Almeno ${USER_PASSWORD_MIN_LENGTH} caratteri`)
      .max(USER_PASSWORD_MAX_LENGTH, `Massimo ${USER_PASSWORD_MAX_LENGTH} caratteri`),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Le password non coincidono',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof FormSchema>;

const emptyValues: FormValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** The same password is used by the Delphi client and the Android app. */
const ProfilePasswordCard: React.FC = () => {
  const snackbar = useSnackbar();
  const changePassword = useChangeMyPassword();
  const form = useForm<FormValues>({ resolver: zodResolver(FormSchema), defaultValues: emptyValues });
  const { errors, isSubmitting, isDirty } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      form.reset(emptyValues);
      snackbar.success('Password cambiata');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile cambiare la password.'));
    }
  });

  return (
    <Card variant="outlined">
      <CardHeader
        title="Password"
        subheader="Vale anche per Aries desktop e per l'app"
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
      />
      <CardContent component="form" onSubmit={submit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              {...form.register('currentPassword')}
              label="Password attuale"
              type="password"
              autoComplete="current-password"
              fullWidth
              size="small"
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              {...form.register('newPassword')}
              label="Nuova password"
              type="password"
              autoComplete="new-password"
              fullWidth
              size="small"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              {...form.register('confirmPassword')}
              label="Ripeti la nuova password"
              type="password"
              autoComplete="new-password"
              fullWidth
              size="small"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={!isDirty} loading={isSubmitting}>
              Cambia password
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProfilePasswordCard;
