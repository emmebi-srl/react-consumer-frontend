import { Alert, Box, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';

const LinkExpiredView: React.FC = () => {
  useEffect(() => {
    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
  }, []);

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(180deg, #fbfdff 0%, ${theme.palette.grey[100]} 100%)`,
      })}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Typography variant="h4" fontWeight={700}>
                Link non piu disponibile
              </Typography>
              <Alert severity="warning">
                La pagina non e piu disponibile perche il link utilizzato e scaduto oppure non e valido.
              </Alert>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Se hai ancora bisogno di completare il flusso, ti chiediamo di contattare il nostro team per ricevere un
                nuovo link.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LinkExpiredView;
