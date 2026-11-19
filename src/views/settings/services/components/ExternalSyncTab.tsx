import { Alert, Stack } from '@mui/material';
import { useExternalSyncConfiguration } from '~/proxies/aries-proxy/external-sync';
import { ExternalSyncProvider } from '~/types/aries-proxy/external-sync';
import ExternalSyncStatusCard from './ExternalSyncStatusCard';
import GoogleTasksSyncCard from './GoogleTasksSyncCard';

/** Ticket sync with Google Tasks, run by the ExternalSyncService Windows service. */
const ExternalSyncTab = () => {
  const { data, isLoading, error } = useExternalSyncConfiguration(ExternalSyncProvider.Google);

  if (error) return <Alert severity="error">Non è stato possibile caricare la configurazione.</Alert>;
  if (isLoading || !data) return <Alert severity="info">Caricamento...</Alert>;

  return (
    <Stack spacing={2.5}>
      <GoogleTasksSyncCard config={data} />
      <ExternalSyncStatusCard config={data} />
    </Stack>
  );
};

export default ExternalSyncTab;
