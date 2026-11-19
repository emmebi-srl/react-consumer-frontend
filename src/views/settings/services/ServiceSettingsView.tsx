import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import PageContainer from '~/components/Layout/PageContainer';
import AlertServicesTab from './components/AlertServicesTab';
import CustomerRemindersTab from './components/CustomerRemindersTab';
import ExternalSyncTab from './components/ExternalSyncTab';

/**
 * Services settings (Delphi TFSettingsServicesConfig, admin only): the internal alert services and the
 * customer reminders run by the Windows services. Every save goes straight to the server, like Delphi.
 * "Sincronizzazione" (ticket -> Google Tasks) has no Delphi counterpart.
 */
const ServiceSettingsView = () => {
  const [tab, setTab] = useState(0);

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Servizi
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configurazione dei servizi automatici: avvisi interni, promemoria ai clienti e sincronizzazione dei ticket.
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="Alert interni" />
          <Tab label="Promemoria cliente" />
          <Tab label="Sincronizzazione" />
        </Tabs>

        {tab === 0 ? <AlertServicesTab /> : null}
        {tab === 1 ? <CustomerRemindersTab /> : null}
        {tab === 2 ? <ExternalSyncTab /> : null}
      </Box>
    </PageContainer>
  );
};

export default ServiceSettingsView;
