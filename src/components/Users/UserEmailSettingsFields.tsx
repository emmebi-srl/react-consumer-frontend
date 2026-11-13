import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { Controller, FieldErrors, useFormContext } from 'react-hook-form';
import { UserEmailSettingsFormValues } from './userEmailSettingsForm';

interface Props {
  /** Tells whether a password is stored, so the empty field means "keep it". */
  hasEmailPassword: boolean;
}

/**
 * Description, email and SMTP settings of a user (Delphi TFSettingsUsers). Used inside a `FormProvider` whose values
 * extend `UserEmailSettingsFormValues`: the profile and the users management share it.
 */
const UserEmailSettingsFields: React.FC<Props> = ({ hasEmailPassword }) => {
  const { register, control, formState } = useFormContext<UserEmailSettingsFormValues>();
  const errors: FieldErrors<UserEmailSettingsFormValues> = formState.errors;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <TextField {...register('description')} label="Descrizione" fullWidth size="small" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          {...register('email')}
          label="Indirizzo email"
          type="email"
          fullWidth
          size="small"
          error={!!errors.email}
          helperText={errors.email?.message}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
        <Controller
          control={control}
          name="hasConfirmationOfReading"
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
              label="Richiedi conferma di lettura"
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          {...register('smtpHost')}
          label="Server SMTP"
          fullWidth
          size="small"
          error={!!errors.smtpHost}
          helperText={errors.smtpHost?.message}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <TextField
          {...register('smtpPort')}
          label="Porta"
          inputMode="numeric"
          fullWidth
          size="small"
          error={!!errors.smtpPort}
          helperText={errors.smtpPort?.message}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
        <Controller
          control={control}
          name="useSsl"
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
              label="SSL"
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          {...register('emailUsername')}
          label="Utente email"
          fullWidth
          size="small"
          autoComplete="off"
          error={!!errors.emailUsername}
          helperText={errors.emailUsername?.message}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          {...register('emailPassword')}
          label="Password email"
          type="password"
          fullWidth
          size="small"
          autoComplete="new-password"
          error={!!errors.emailPassword}
          helperText={
            errors.emailPassword?.message ??
            (hasEmailPassword ? 'Lascia vuoto per non cambiarla' : 'Nessuna password salvata')
          }
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField {...register('signature')} label="Firma email" fullWidth size="small" multiline minRows={3} />
      </Grid>
    </Grid>
  );
};

export default UserEmailSettingsFields;
