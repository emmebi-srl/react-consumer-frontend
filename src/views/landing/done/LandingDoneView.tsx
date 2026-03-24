import { Box, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';

const LandingDoneView: React.FC = () => {
  useEffect(() => {
    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
  }, []);

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `radial-gradient(circle at top left, rgba(25, 118, 210, 0.1), transparent 25%), linear-gradient(180deg, #f8fbff 0%, ${theme.palette.grey[100]} 100%)`,
      })}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Typography variant="h4" fontWeight={700}>
                Flusso completato
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                La richiesta e stata completata correttamente. Puoi chiudere questa pagina in qualsiasi momento.
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Se sara necessario, verrai ricontattato dal nostro team per eventuali approfondimenti o conferme.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LandingDoneView;
