import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from '@mui/icons-material';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import useSnackbar from '~/hooks/useSnackbar';
import { CustomerReminderGeneralConfig } from '~/types/aries-proxy/service-settings';
import { getApiErrorMessage } from '~/utils/api-error-utils';

// The general config columns (and procedure parameters) are VARCHAR(50).
const text50 = z.string().trim().max(50, 'Massimo 50 caratteri');

const SmtpFormSchema = z.object({
  emailHost: text50,
  emailPort: z.number({ message: 'Porta non valida' }).int().min(0).max(65535, 'Porta non valida'),
  emailSsl: z.boolean(),
  emailUsername: text50,
  emailPassword: z.string().max(50, 'Massimo 50 caratteri'),
  emailFrom: text50,
  smsHost: text50,
});

type SmtpFormValues = z.infer<typeof SmtpFormSchema>;

interface SmtpConfigCardProps {
  title: string;
  subheader: string;
  /** Only the customer reminders have an SMS gateway. */
  withSmsHost?: boolean;
  config: Partial<CustomerReminderGeneralConfig> | undefined;
  isLoading: boolean;
  onSave: (values: CustomerReminderGeneralConfig) => Promise<unknown>;
}

const SmtpConfigCard: React.FC<SmtpConfigCardProps> = ({
  title,
  subheader,
  withSmsHost,
  config,
  isLoading,
  onSave,
}) => {
  const snackbar = useSnackbar();
  const form = useForm<SmtpFormValues>({
    resolver: zodResolver(SmtpFormSchema),
    values: {
      emailHost: config?.emailHost ?? '',
      emailPort: config?.emailPort ?? 0,
      emailSsl: config?.emailSsl ?? false,
      emailUsername: config?.emailUsername ?? '',
      emailPassword: config?.emailPassword ?? '',
      emailFrom: config?.emailFrom ?? '',
      smsHost: config?.smsHost ?? '',
    },
    resetOptions: { keepDirtyValues: true },
  });
  const { errors, isDirty, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSave(values);
      form.reset(values);
      snackbar.success('Impostazioni salvate');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare le impostazioni.'));
    }
  });

  return (
    <Card variant="outlined">
      <CardHeader
        title={title}
        subheader={subheader}
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
        action={
          <Button
            startIcon={<Save />}
            variant="contained"
            disabled={!isDirty || isSubmitting || isLoading}
            onClick={submit}
          >
            Salva
          </Button>
        }
      />
      <CardContent component="form" onSubmit={submit}>
        <Stack spacing={2}>
          {!isLoading && !config?.emailHost ? (
            <Alert severity="info">Server email non ancora configurato.</Alert>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...form.register('emailHost')}
                label="Host email"
                fullWidth
                size="small"
                error={!!errors.emailHost}
                helperText={errors.emailHost?.message}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                {...form.register('emailPort', { valueAsNumber: true })}
                label="Porta"
                type="number"
                fullWidth
                size="small"
                error={!!errors.emailPort}
                helperText={errors.emailPort?.message}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller
                control={form.control}
                name="emailSsl"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                    label="SSL"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...form.register('emailUsername')}
                label="Username"
                fullWidth
                size="small"
                autoComplete="off"
                error={!!errors.emailUsername}
                helperText={errors.emailUsername?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...form.register('emailPassword')}
                label="Password"
                type="password"
                fullWidth
                size="small"
                autoComplete="new-password"
                error={!!errors.emailPassword}
                helperText={errors.emailPassword?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...form.register('emailFrom')}
                label="Mittente"
                fullWidth
                size="small"
                error={!!errors.emailFrom}
                helperText={errors.emailFrom?.message}
              />
            </Grid>
            {withSmsHost ? (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...form.register('smsHost')}
                  label="Host SMS"
                  fullWidth
                  size="small"
                  error={!!errors.smsHost}
                  helperText={errors.smsHost?.message}
                />
              </Grid>
            ) : null}
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SmtpConfigCard;
