import { zodResolver } from '@hookform/resolvers/zod';
import { CloudSync, Save, UploadFile } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import useSnackbar from '~/hooks/useSnackbar';
import { useSaveExternalSyncConfiguration, useTestExternalSyncConnection } from '~/proxies/aries-proxy/external-sync';
import { useTicketStatuses } from '~/proxies/aries-proxy/tickets';
import { useUserAccounts } from '~/proxies/aries-proxy/user-accounts';
import { ExternalSyncConfiguration, ExternalSyncProvider } from '~/types/aries-proxy/external-sync';
import { getApiErrorMessage } from '~/utils/api-error-utils';

const MAX_KEY_FILE_SIZE = 20_000;

const FormSchema = z
  .object({
    isEnabled: z.boolean(),
    serviceAccountJson: z.string().nullable(),
    defaultUserId: z.number().nullable(),
    closingStatusId: z.number().nullable(),
    taskListName: z.string().trim().min(1, 'Obbligatorio').max(100, 'Massimo 100 caratteri'),
    pastExpirationDays: z
      .number({ message: 'Numero non valido' })
      .int('Numero non valido')
      .min(0, 'Minimo 0')
      .max(365, 'Massimo 365'),
  })
  .superRefine((values, ctx) => {
    if (!values.isEnabled) return;
    if (values.defaultUserId === null)
      ctx.addIssue({
        code: 'custom',
        path: ['defaultUserId'],
        message: 'Obbligatorio per attivare la sincronizzazione',
      });
    if (values.closingStatusId === null)
      ctx.addIssue({
        code: 'custom',
        path: ['closingStatusId'],
        message: 'Obbligatorio per attivare la sincronizzazione',
      });
  });

type FormValues = z.infer<typeof FormSchema>;

interface GoogleTasksSyncCardProps {
  config: ExternalSyncConfiguration;
}

/** Settings of the ticket -> Google Tasks sync. The key file is read in the browser and sent as text. */
const GoogleTasksSyncCard: React.FC<GoogleTasksSyncCardProps> = ({ config }) => {
  const snackbar = useSnackbar();
  const save = useSaveExternalSyncConfiguration(ExternalSyncProvider.Google);
  const test = useTestExternalSyncConnection(ExternalSyncProvider.Google);
  const users = useUserAccounts();
  const statuses = useTicketStatuses();
  const fileInput = useRef<HTMLInputElement>(null);
  const [keyFileName, setKeyFileName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    values: {
      isEnabled: config.isEnabled,
      serviceAccountJson: null,
      defaultUserId: config.defaultUserId,
      closingStatusId: config.closingStatusId,
      taskListName: config.taskListName,
      pastExpirationDays: config.pastExpirationDays,
    },
    resetOptions: { keepDirtyValues: true },
  });
  const { errors, isDirty, isSubmitting } = form.formState;

  const userOptions = users.data ?? [];
  const closedStatuses = (statuses.data ?? []).filter((status) => !status.isOpen);
  const hasKey = config.hasCredentials || form.watch('serviceAccountJson') !== null;

  const submit = form.handleSubmit(async (values) => {
    if (values.isEnabled && !hasKey) {
      snackbar.error('Caricare la chiave JSON del service account prima di attivare la sincronizzazione.');
      return;
    }
    try {
      await save.mutateAsync(values);
      form.reset({ ...values, serviceAccountJson: null });
      setKeyFileName(null);
      snackbar.success('Impostazioni salvate');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare le impostazioni.'));
    }
  });

  const runTest = async () => {
    try {
      const result = await test.mutateAsync();
      snackbar.success(result.message);
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Connessione non riuscita.'));
    }
  };

  const onKeyFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_KEY_FILE_SIZE) {
      snackbar.error('Il file è troppo grande: selezionare il file JSON della chiave del service account.');
      return;
    }
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as { type?: string; client_email?: string };
      if (parsed.type !== 'service_account' || !parsed.client_email) throw new Error('not a service account key');
    } catch {
      snackbar.error('Il file non è una chiave JSON di service account Google.');
      return;
    }
    form.setValue('serviceAccountJson', text, { shouldDirty: true });
    setKeyFileName(file.name);
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Google Tasks"
        subheader="I ticket con scadenza diventano task di Google; un task completato chiude il ticket"
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
        action={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }} useFlexGap>
            <Button
              startIcon={<CloudSync />}
              variant="outlined"
              disabled={isDirty || !config.hasCredentials || config.defaultUserId === null || test.isPending}
              onClick={runTest}
            >
              {test.isPending ? 'Verifica…' : 'Prova connessione'}
            </Button>
            <Button startIcon={<Save />} variant="contained" disabled={!isDirty || isSubmitting} onClick={submit}>
              Salva
            </Button>
          </Stack>
        }
      />
      <CardContent component="form" onSubmit={submit}>
        <Stack spacing={2.5}>
          {!config.isEncryptionConfigured ? (
            <Alert severity="warning">
              Sul server manca la chiave di cifratura (<code>Secrets:EncryptionKey</code>): la chiave del service
              account non può essere salvata.
            </Alert>
          ) : null}

          <Controller
            control={form.control}
            name="isEnabled"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Sincronizzazione attiva"
              />
            )}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Chiave del service account
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              File JSON del service account Google Cloud con delega a livello di dominio per lo scope{' '}
              <code>https://www.googleapis.com/auth/tasks</code>.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
              <Button
                startIcon={<UploadFile />}
                variant="outlined"
                size="small"
                disabled={!config.isEncryptionConfigured}
                onClick={() => fileInput.current?.click()}
              >
                {config.hasCredentials ? 'Sostituisci chiave' : 'Carica chiave'}
              </Button>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {keyFileName
                  ? `Nuova chiave: ${keyFileName} (salvare per applicarla)`
                  : config.hasCredentials
                    ? `Chiave caricata: ${config.serviceAccountEmail ?? ''}`
                    : 'Nessuna chiave caricata'}
              </Typography>
            </Stack>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={onKeyFileSelected} />
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                control={form.control}
                name="defaultUserId"
                render={({ field }) => (
                  <TextField
                    select
                    label="Utente che riceve i task"
                    fullWidth
                    size="small"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
                    error={!!errors.defaultUserId}
                    helperText={
                      errors.defaultUserId?.message ??
                      'La sua email è l’account Google Workspace in cui vengono creati i task'
                    }
                  >
                    <MenuItem value="">Nessuno</MenuItem>
                    {userOptions.map((user) => {
                      const hasEmail = !!user.email && user.email.includes('@');
                      return (
                        <MenuItem key={user.id} value={user.id} disabled={!hasEmail}>
                          {user.username} {hasEmail ? `(${user.email})` : '(senza email)'}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                control={form.control}
                name="closingStatusId"
                render={({ field }) => (
                  <TextField
                    select
                    label="Stato del ticket completato su Google"
                    fullWidth
                    size="small"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
                    error={!!errors.closingStatusId}
                    helperText={errors.closingStatusId?.message}
                  >
                    <MenuItem value="">Nessuno</MenuItem>
                    {closedStatuses.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...form.register('taskListName')}
                label="Nome della lista Google"
                fullWidth
                size="small"
                error={!!errors.taskListName}
                helperText={errors.taskListName?.message ?? 'Creata automaticamente se non esiste'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...form.register('pastExpirationDays', { valueAsNumber: true })}
                label="Ticket già scaduti da al massimo (giorni)"
                type="number"
                fullWidth
                size="small"
                error={!!errors.pastExpirationDays}
                helperText={
                  errors.pastExpirationDays?.message ?? 'I ticket aperti scaduti da più giorni non vengono inviati'
                }
              />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default GoogleTasksSyncCard;
