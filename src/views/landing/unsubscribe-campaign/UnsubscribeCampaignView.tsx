import {
  Alert,
  AlertColor,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { EmailOutlined, NotificationsOffOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingAccessToken from '~/components/Landing/LandingAccessToken';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import Logo from '~/components/Layout/Logo';
import { useCampaignUnsubscribeInfo, useUnsubscribeCampaign } from '~/proxies/aries-proxy/landing';
import { RouteConfig } from '~/routes/routeConfig';
import { KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';

const PageShell = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `radial-gradient(circle at top left, ${alpha(theme.palette.error.main, 0.1)}, transparent 28%), linear-gradient(180deg, #fffaf8 0%, ${theme.palette.grey[100]} 100%)`,
  paddingBottom: theme.spacing(8),
}));

const TopBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backdropFilter: 'blur(12px)',
  backgroundColor: alpha(theme.palette.common.white, 0.8),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
  marginBottom: theme.spacing(4),
}));

const HeroCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  border: `1px solid ${alpha(theme.palette.error.main, 0.08)}`,
  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)',
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
}));

const SummaryItem = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.common.white,
}));

const UnsubscribeCampaignContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasCompleted, setHasCompleted] = useState(false);
  const campaignAriesEmailId = Number(searchParams.get('campaignAriesEmailId'));
  const {
    data: unsubscribeInfo,
    isLoading: isLoadingInfo,
    error: infoError,
  } = useCampaignUnsubscribeInfo(campaignAriesEmailId, {
    enabled: Number.isFinite(campaignAriesEmailId) && campaignAriesEmailId > 0,
  });
  const { mutateAsync: unsubscribe, isPending: isUnsubscribing, error: unsubscribeError } = useUnsubscribeCampaign();

  useEffect(() => {
    if (infoError) {
      setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
      navigate(RouteConfig.LandingLinkExpired.buildLink(), { replace: true });
    }
  }, [infoError, navigate]);

  useEffect(() => {
    if (unsubscribeInfo?.isAlreadyUnsubscribed) {
      setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
    }
  }, [unsubscribeInfo]);

  const handleUnsubscribe = async () => {
    await unsubscribe({ campaignAriesEmailId });
    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
    setHasCompleted(true);
  };

  if (isLoadingInfo) {
    return <LoadingScreen />;
  }

  if (!unsubscribeInfo) {
    return null;
  }

  const isDone = hasCompleted || unsubscribeInfo.isAlreadyUnsubscribed;
  const statusSeverity: AlertColor = unsubscribeInfo.isAlreadyUnsubscribed ? 'info' : 'success';
  let statusMessage = 'La disiscrizione vale per la combinazione email + tipo campagna.';

  if (unsubscribeInfo.isAlreadyUnsubscribed) {
    statusMessage = 'Questa email risulta gia disiscritta per questo tipo di campagna.';
  } else if (hasCompleted) {
    statusMessage = 'Disiscrizione registrata correttamente.';
  }

  return (
    <PageShell>
      <TopBar>
        <Container maxWidth="md">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            py={2}
            alignItems={{ md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={3} alignItems="center">
              <Logo sx={{ height: 60 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Gestione disiscrizione email
                </Typography>
                <Typography color="text.secondary">Comunicazioni per tipo campagna</Typography>
              </Box>
            </Stack>
            <Chip color="error" variant="outlined" label="Disiscrizione mirata" />
          </Stack>
        </Container>
      </TopBar>

      <Container maxWidth="md">
        <Stack spacing={3}>
          <HeroCard>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Chip
                  icon={<NotificationsOffOutlined />}
                  color="error"
                  variant="filled"
                  label={unsubscribeInfo.campaignTypeName || 'Comunicazioni campagna'}
                  sx={{ alignSelf: 'flex-start' }}
                />

                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
                    Disiscrivi questa email dalle future comunicazioni
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    Confermando la richiesta, l&apos;indirizzo <strong>{unsubscribeInfo.email}</strong> non ricevera piu
                    campagne relative a <strong>{unsubscribeInfo.campaignTypeName}</strong>.
                  </Typography>
                </Box>

                <Alert severity={statusSeverity}>{statusMessage}</Alert>

                {unsubscribeError ? (
                  <Alert severity="error">Non siamo riusciti a registrare la disiscrizione. Riprova tra poco.</Alert>
                ) : null}

                {!isDone ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      onClick={handleUnsubscribe}
                      disabled={isUnsubscribing}
                    >
                      Disiscrivimi
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            </CardContent>
          </HeroCard>

          <SummaryCard>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Typography variant="h6" fontWeight={700}>
                  Ambito della richiesta
                </Typography>
                <Divider />
                <Stack spacing={2}>
                  <SummaryItem>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <EmailOutlined color="action" fontSize="small" />
                        <Typography fontWeight={600}>{unsubscribeInfo.email}</Typography>
                      </Stack>
                    </Stack>
                  </SummaryItem>

                  <SummaryItem>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Tipo campagna
                      </Typography>
                      <Typography fontWeight={600}>{unsubscribeInfo.campaignTypeName}</Typography>
                    </Stack>
                  </SummaryItem>

                  <SummaryItem>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Cliente / contesto
                      </Typography>
                      <Typography fontWeight={600}>{unsubscribeInfo.companyName || '-'}</Typography>
                      <Typography color="text.secondary">
                        {[unsubscribeInfo.systemType, unsubscribeInfo.systemDescription].filter(Boolean).join(' - ') ||
                          '-'}
                      </Typography>
                    </Stack>
                  </SummaryItem>
                </Stack>
              </Stack>
            </CardContent>
          </SummaryCard>
        </Stack>
      </Container>
    </PageShell>
  );
};

const UnsubscribeCampaignView: React.FC = () => {
  return (
    <LandingAccessToken>
      <UnsubscribeCampaignContent />
    </LandingAccessToken>
  );
};

export default UnsubscribeCampaignView;
