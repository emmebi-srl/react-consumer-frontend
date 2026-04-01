import { Alert, AlertColor, Box, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import Logo from '~/components/Layout/Logo';
import { CompanyInfo } from '~/types/aries-proxy/landing';
import { KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';
import LandingFooter from './LandingFooter';

interface LandingOutcomePageProps {
  alertText?: string;
  companyInfo?: CompanyInfo | null;
  messages: string[];
  severity: AlertColor;
  title: string;
}

const LandingOutcomePage: React.FC<LandingOutcomePageProps> = ({
  alertText,
  companyInfo,
  messages,
  severity,
  title,
}) => {
  useEffect(() => {
    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
  }, []);

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `radial-gradient(circle at top left, rgba(25, 118, 210, 0.1), transparent 24%), linear-gradient(180deg, #f8fbff 0%, ${theme.palette.grey[100]} 100%)`,
        py: 6,
      })}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Logo sx={{ height: 52 }} />
              <Typography variant="h4" fontWeight={700}>
                {title}
              </Typography>
              {alertText ? <Alert severity={severity}>{alertText}</Alert> : null}
              {messages.map((message) => (
                <Typography key={message} color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {message}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
        {companyInfo ? <LandingFooter companyInfo={companyInfo} hideLogo /> : null}
      </Container>
    </Box>
  );
};

export default LandingOutcomePage;
