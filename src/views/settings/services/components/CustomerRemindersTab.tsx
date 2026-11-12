import { Alert, Card, CardHeader, Grid, Stack } from '@mui/material';
import { useState } from 'react';
import {
  useCustomerReminderGeneralConfig,
  useCustomerReminders,
  useSaveCustomerReminderGeneralConfig,
} from '~/proxies/aries-proxy/service-settings';
import { CustomerReminderConfig, CustomerReminderDeliveryMode } from '~/types/aries-proxy/service-settings';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';
import { getIntervalTypeLabel } from '../serviceSettingsLabels';
import CustomerReminderForm, { showsSchedule } from './CustomerReminderForm';
import ReminderPlaceholdersCard from './ReminderPlaceholdersCard';
import ServiceConfigTable, { ServiceConfigColumn } from './ServiceConfigTable';
import SmtpConfigCard from './SmtpConfigCard';

const columns: ServiceConfigColumn<CustomerReminderConfig>[] = [
  { label: 'ID', align: 'right', render: (item) => item.id },
  { label: 'Promemoria', render: (item) => item.name },
  { label: 'Ultima esecuzione', render: (item) => getStringDateTimeByUnixtimestamp(item.lastExecutionDate) },
  {
    label: 'Consegna',
    render: (item) => (item.deliveryMode === CustomerReminderDeliveryMode.Campaign ? 'Campagna' : 'Diretto'),
  },
  {
    label: 'Intervallo',
    render: (item) => (showsSchedule(item.id, item.deliveryMode) ? getIntervalTypeLabel(item.intervalType) : '-'),
  },
  {
    label: 'Valore',
    align: 'right',
    render: (item) => (showsSchedule(item.id, item.deliveryMode) ? item.intervalValue : '-'),
  },
];

/** "Servizi promemoria cliente" of the Delphi services settings. */
const CustomerRemindersTab = () => {
  const generalConfig = useCustomerReminderGeneralConfig();
  const saveGeneralConfig = useSaveCustomerReminderGeneralConfig();
  const { data, isLoading, error } = useCustomerReminders();
  const reminders = data?.reminders ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = reminders.find((item) => item.id === selectedId) ?? reminders.at(0) ?? null;

  return (
    <Stack spacing={2.5}>
      <SmtpConfigCard
        title="Server email e SMS"
        subheader="Account usato dai promemoria con invio diretto"
        withSmsHost
        config={generalConfig.data}
        isLoading={generalConfig.isLoading}
        onSave={(values) => saveGeneralConfig.mutateAsync(values)}
      />

      {error ? <Alert severity="error">Non è stato possibile caricare i promemoria.</Alert> : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Promemoria"
              subheader="Seleziona un promemoria per modificarlo"
              slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
            />
            <ServiceConfigTable
              items={reminders}
              columns={columns}
              selectedId={selected?.id ?? null}
              onSelect={(item) => setSelectedId(item.id)}
              emptyText={isLoading ? 'Caricamento...' : 'Nessun promemoria configurato.'}
            />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          {selected ? (
            <Stack spacing={2.5}>
              <CustomerReminderForm key={selected.id} reminder={selected} />
              {selected.deliveryMode !== CustomerReminderDeliveryMode.Campaign ? (
                <ReminderPlaceholdersCard reminderId={selected.id} />
              ) : null}
            </Stack>
          ) : null}
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CustomerRemindersTab;
