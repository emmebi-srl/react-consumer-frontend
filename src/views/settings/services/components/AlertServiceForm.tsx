import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from '@mui/icons-material';
import { Button, Card, CardContent, CardHeader, Grid, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import useSnackbar from '~/hooks/useSnackbar';
import { useSaveServiceAlert } from '~/proxies/aries-proxy/service-settings';
import { ServiceAlertConfig, ServiceIntervalType } from '~/types/aries-proxy/service-settings';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { ALERT_INTERVAL_TYPES } from '../serviceSettingsLabels';
import IntervalFields from './IntervalFields';
import { intervalFields, refineInterval } from './intervalSchema';

const AlertServiceFormSchema = z
  .object({
    ...intervalFields,
    monthsNumber: z.number({ message: 'Valore obbligatorio' }).int().min(0, 'Valore non valido').max(32767),
    emailSubject: z.string().trim().max(150, 'Massimo 150 caratteri'),
    emailBody: z.string(),
  })
  .superRefine(refineInterval);

type AlertServiceFormValues = z.infer<typeof AlertServiceFormSchema>;

const AlertServiceForm: React.FC<{ service: ServiceAlertConfig }> = ({ service }) => {
  const snackbar = useSnackbar();
  const saveAlert = useSaveServiceAlert();
  const form = useForm<AlertServiceFormValues>({
    resolver: zodResolver(AlertServiceFormSchema),
    values: {
      intervalType: service.intervalType,
      intervalValue: service.intervalValue,
      monthsNumber: service.monthsNumber,
      emailSubject: service.emailSubject,
      emailBody: service.emailBody,
    },
  });
  const { errors, isDirty, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    try {
      await saveAlert.mutateAsync({
        id: service.id,
        model: { ...values, intervalType: values.intervalType as ServiceIntervalType },
      });
      snackbar.success('Servizio salvato');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare il servizio.'));
    }
  });

  return (
    <Card variant="outlined">
      <CardHeader
        title={service.name}
        subheader={service.folder ? `Cartella: ${service.folder}` : undefined}
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
        action={
          <Button startIcon={<Save />} variant="contained" disabled={!isDirty || isSubmitting} onClick={submit}>
            Salva
          </Button>
        }
      />
      <CardContent component="form" onSubmit={submit}>
        <Grid container spacing={2}>
          <IntervalFields
            control={form.control}
            typeName="intervalType"
            valueName="intervalValue"
            intervalTypes={ALERT_INTERVAL_TYPES}
          />
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              control={form.control}
              name="monthsNumber"
              render={({ field, fieldState }) => (
                <TextField
                  label="Numero mesi"
                  type="number"
                  fullWidth
                  size="small"
                  value={Number.isNaN(field.value) ? '' : field.value}
                  onChange={(event) => field.onChange(event.target.value === '' ? NaN : Number(event.target.value))}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...form.register('emailSubject')}
              label="Oggetto email"
              fullWidth
              size="small"
              error={!!errors.emailSubject}
              helperText={errors.emailSubject?.message}
            />
          </Grid>
          <Grid size={12}>
            <TextField {...form.register('emailBody')} label="Corpo email" fullWidth multiline minRows={4} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AlertServiceForm;
