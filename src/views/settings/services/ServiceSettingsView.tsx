import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import PageContainer from '~/components/Layout/PageContainer';
import AlertServicesTab from './components/AlertServicesTab';
import CustomerRemindersTab from './components/CustomerRemindersTab';

/**
 * Services settings (Delphi TFSettingsServicesConfig, admin only): the internal alert services and the
 * customer reminders run by the Windows services. Every save goes straight to the server, like Delphi.
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
            Configurazione dei servizi automatici: avvisi interni e promemoria ai clienti.
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="Alert interni" />
          <Tab label="Promemoria cliente" />
        </Tabs>

        {tab === 0 ? <AlertServicesTab /> : <CustomerRemindersTab />}
      </Box>
    </PageContainer>
  );
};

export default ServiceSettingsView;
