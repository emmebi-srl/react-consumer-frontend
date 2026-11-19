import { Alert, Card, CardContent, CardHeader, Grid, Stack, Typography } from '@mui/material';
import { ExternalSyncConfiguration } from '~/types/aries-proxy/external-sync';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';

interface ExternalSyncStatusCardProps {
  config: ExternalSyncConfiguration;
}

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 4 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Grid>
);

/** Result of the last run of the ExternalSyncService (every 5 minutes). */
const ExternalSyncStatusCard: React.FC<ExternalSyncStatusCardProps> = ({ config }) => (
  <Card variant="outlined">
    <CardHeader
      title="Stato"
      subheader="Il servizio di sincronizzazione gira ogni 5 minuti"
      slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
    />
    <CardContent>
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Field
            label="Ultima esecuzione"
            value={getStringDateTimeByUnixtimestamp(config.lastExecutionDate) || 'Mai'}
          />
          <Field
            label="Ultima esecuzione riuscita"
            value={getStringDateTimeByUnixtimestamp(config.lastSuccessDate) || 'Mai'}
          />
          <Field label="Task aperti su Google" value={config.syncedTaskCount} />
        </Grid>
        {config.lastError ? (
          <Alert severity="error" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {config.lastError}
          </Alert>
        ) : null}
      </Stack>
    </CardContent>
  </Card>
);

export default ExternalSyncStatusCard;
