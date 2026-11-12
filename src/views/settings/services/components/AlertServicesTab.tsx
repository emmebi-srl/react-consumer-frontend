import { Alert, Card, CardHeader, Grid, Stack } from '@mui/material';
import { useState } from 'react';
import {
  useSaveServiceAlertGeneralConfig,
  useServiceAlertGeneralConfig,
  useServiceAlerts,
} from '~/proxies/aries-proxy/service-settings';
import { ServiceAlertConfig } from '~/types/aries-proxy/service-settings';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';
import { getIntervalTypeLabel } from '../serviceSettingsLabels';
import AlertRecipientsCard from './AlertRecipientsCard';
import AlertServiceForm from './AlertServiceForm';
import ServiceConfigTable, { ServiceConfigColumn } from './ServiceConfigTable';
import SmtpConfigCard from './SmtpConfigCard';

const columns: ServiceConfigColumn<ServiceAlertConfig>[] = [
  { label: 'ID', align: 'right', render: (item) => item.id },
  { label: 'Servizio', render: (item) => item.name },
  { label: 'Ultima esecuzione', render: (item) => getStringDateTimeByUnixtimestamp(item.lastExecutionDate) },
  { label: 'Intervallo', render: (item) => getIntervalTypeLabel(item.intervalType) },
  { label: 'Valore', align: 'right', render: (item) => item.intervalValue },
  { label: 'Mesi', align: 'right', render: (item) => item.monthsNumber },
];

/** "Servizi alert interni" of the Delphi services settings. */
const AlertServicesTab = () => {
  const generalConfig = useServiceAlertGeneralConfig();
  const saveGeneralConfig = useSaveServiceAlertGeneralConfig();
  const { data, isLoading, error } = useServiceAlerts();
  const services = data?.services ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = services.find((item) => item.id === selectedId) ?? services.at(0) ?? null;

  return (
    <Stack spacing={2.5}>
      <SmtpConfigCard
        title="Server email"
        subheader="Account usato da tutti i servizi alert interni"
        config={generalConfig.data}
        isLoading={generalConfig.isLoading}
        onSave={(values) => saveGeneralConfig.mutateAsync(values)}
      />

      {error ? <Alert severity="error">Non è stato possibile caricare i servizi.</Alert> : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Servizi"
              subheader="Seleziona un servizio per modificarlo"
              slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
            />
            <ServiceConfigTable
              items={services}
              columns={columns}
              selectedId={selected?.id ?? null}
              onSelect={(item) => setSelectedId(item.id)}
              emptyText={isLoading ? 'Caricamento...' : 'Nessun servizio configurato.'}
            />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          {selected ? (
            <Stack spacing={2.5}>
              <AlertServiceForm key={selected.id} service={selected} />
              <AlertRecipientsCard key={`recipients-${selected.id}`} service={selected} />
            </Stack>
          ) : null}
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AlertServicesTab;
