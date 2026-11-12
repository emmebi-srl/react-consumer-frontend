import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from '@mui/icons-material';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import z from 'zod';
import useSnackbar from '~/hooks/useSnackbar';
import { useCustomerReminderCampaigns, useSaveCustomerReminder } from '~/proxies/aries-proxy/service-settings';
import {
  CUSTOMER_INVOICES_STATEMENT_REMINDER_ID,
  CustomerReminderConfig,
  CustomerReminderDeliveryMode,
  ServiceIntervalType,
} from '~/types/aries-proxy/service-settings';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { CUSTOMER_REMINDER_INTERVAL_TYPES } from '../serviceSettingsLabels';
import IntervalFields from './IntervalFields';
import { intervalFields, refineInterval } from './intervalSchema';

/**
 * Campaign delivery hides the schedule (the campaign sender decides when), except for the invoices statement,
 * which is sent by campaign on the configured day of the month. Same rule as Delphi UpdateCustReminderDeliveryControls.
 */
export const showsSchedule = (reminderId: number, deliveryMode: number) =>
  deliveryMode !== CustomerReminderDeliveryMode.Campaign || reminderId === CUSTOMER_INVOICES_STATEMENT_REMINDER_ID;

const buildSchema = (reminderId: number) =>
  z
    .object({
      ...intervalFields,
      deliveryMode: z.number().int(),
      campaignId: z.number().int().nullable(),
      emailEnabled: z.boolean(),
      emailSubject: z.string().trim().max(150, 'Massimo 150 caratteri'),
      emailBody: z.string(),
      smsEnabled: z.boolean(),
      smsText: z.string(),
    })
    .superRefine((values, ctx) => {
      if (showsSchedule(reminderId, values.deliveryMode)) refineInterval(values, ctx);
      if (values.deliveryMode === CustomerReminderDeliveryMode.Campaign && !values.campaignId) {
        ctx.addIssue({ code: 'custom', path: ['campaignId'], message: 'Seleziona la campagna' });
      }
    });

type CustomerReminderFormValues = z.infer<ReturnType<typeof buildSchema>>;

const CustomerReminderForm: React.FC<{ reminder: CustomerReminderConfig }> = ({ reminder }) => {
  const snackbar = useSnackbar();
  const saveReminder = useSaveCustomerReminder();
  const campaigns = useCustomerReminderCampaigns(reminder.id, reminder.supportsCampaignDelivery);
  const campaignOptions = campaigns.data?.campaigns ?? [];
  const schema = useMemo(() => buildSchema(reminder.id), [reminder.id]);

  const form = useForm<CustomerReminderFormValues>({
    resolver: zodResolver(schema),
    values: {
      intervalType: reminder.intervalType,
      intervalValue: reminder.intervalValue,
      deliveryMode: reminder.deliveryMode,
      campaignId: reminder.campaignId,
      emailEnabled: reminder.emailEnabled,
      emailSubject: reminder.emailSubject,
      emailBody: reminder.emailBody,
      smsEnabled: reminder.smsEnabled,
      smsText: reminder.smsText,
    },
  });
  const { errors, isDirty, isSubmitting } = form.formState;
  const deliveryMode = useWatch({ control: form.control, name: 'deliveryMode' });
  const emailEnabled = useWatch({ control: form.control, name: 'emailEnabled' });
  const smsEnabled = useWatch({ control: form.control, name: 'smsEnabled' });
  const isCampaign = deliveryMode === CustomerReminderDeliveryMode.Campaign;
  // The saved campaign may have been deactivated meanwhile: keep it selectable so the value is visible.
  const savedCampaignMissing =
    !!reminder.campaignId && !campaigns.isLoading && !campaignOptions.some((item) => item.id === reminder.campaignId);

  const submit = form.handleSubmit(async (values) => {
    try {
      await saveReminder.mutateAsync({
        id: reminder.id,
        model: {
          ...values,
          intervalType: values.intervalType as ServiceIntervalType,
          deliveryMode: values.deliveryMode as CustomerReminderDeliveryMode,
          campaignId: values.deliveryMode === CustomerReminderDeliveryMode.Campaign ? values.campaignId : null,
        },
      });
      snackbar.success('Promemoria salvato');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare il promemoria.'));
    }
  });

  return (
    <Card variant="outlined">
      <CardHeader
        title={reminder.name}
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
        action={
          <Button startIcon={<Save />} variant="contained" disabled={!isDirty || isSubmitting} onClick={submit}>
            Salva
          </Button>
        }
      />
      <CardContent component="form" onSubmit={submit}>
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            {reminder.supportsCampaignDelivery ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    control={form.control}
                    name="deliveryMode"
                    render={({ field }) => (
                      <TextField
                        select
                        label="Modalità consegna"
                        fullWidth
                        size="small"
                        value={field.value}
                        onChange={(event) => {
                          const mode = Number(event.target.value);
                          field.onChange(mode);
                          if (mode === CustomerReminderDeliveryMode.Campaign && !form.getValues('campaignId')) {
                            form.setValue('campaignId', campaignOptions.at(0)?.id ?? null, { shouldDirty: true });
                          }
                        }}
                        helperText={
                          !campaigns.isLoading && campaignOptions.length === 0
                            ? 'Nessuna campagna compatibile attiva per questo promemoria.'
                            : undefined
                        }
                      >
                        <MenuItem value={CustomerReminderDeliveryMode.Direct}>Invio diretto</MenuItem>
                        <MenuItem
                          value={CustomerReminderDeliveryMode.Campaign}
                          disabled={campaignOptions.length === 0 && !isCampaign}
                        >
                          Campagna
                        </MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                {isCampaign ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={form.control}
                      name="campaignId"
                      render={({ field }) => (
                        <TextField
                          select
                          label="Campagna"
                          fullWidth
                          size="small"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(Number(event.target.value) || null)}
                          error={!!errors.campaignId}
                          helperText={
                            errors.campaignId?.message ??
                            (savedCampaignMissing
                              ? 'La campagna salvata non è più attiva: scegline un’altra.'
                              : undefined)
                          }
                        >
                          {campaignOptions.map((campaign) => (
                            <MenuItem key={campaign.id} value={campaign.id}>
                              {campaign.name}
                            </MenuItem>
                          ))}
                          {savedCampaignMissing ? (
                            <MenuItem value={reminder.campaignId ?? ''} disabled>
                              Campagna {reminder.campaignId} (non attiva)
                            </MenuItem>
                          ) : null}
                        </TextField>
                      )}
                    />
                  </Grid>
                ) : null}
              </>
            ) : null}

            {showsSchedule(reminder.id, deliveryMode) ? (
              <IntervalFields
                control={form.control}
                typeName="intervalType"
                valueName="intervalValue"
                intervalTypes={CUSTOMER_REMINDER_INTERVAL_TYPES}
              />
            ) : null}
          </Grid>

          {isCampaign ? (
            <Alert severity="info">
              Il contenuto dell’email e gli eventuali allegati sono gestiti dalla campagna selezionata.
            </Alert>
          ) : (
            <>
              <Divider />
              <Stack spacing={2}>
                <Typography variant="subtitle2">Email</Typography>
                <Controller
                  control={form.control}
                  name="emailEnabled"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                      label="Abilita promemoria email"
                    />
                  )}
                />
                <TextField
                  {...form.register('emailSubject')}
                  label="Oggetto email"
                  fullWidth
                  size="small"
                  disabled={!emailEnabled}
                  error={!!errors.emailSubject}
                  helperText={errors.emailSubject?.message}
                />
                <TextField
                  {...form.register('emailBody')}
                  label="Corpo email"
                  fullWidth
                  multiline
                  minRows={4}
                  disabled={!emailEnabled}
                />
              </Stack>
              <Divider />
              <Stack spacing={2}>
                <Typography variant="subtitle2">SMS</Typography>
                <Controller
                  control={form.control}
                  name="smsEnabled"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                      label="Abilita promemoria SMS"
                    />
                  )}
                />
                <TextField
                  {...form.register('smsText')}
                  label="Testo SMS"
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={!smsEnabled}
                />
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CustomerReminderForm;
