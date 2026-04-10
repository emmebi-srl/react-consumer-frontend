import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import {
  ArrowForwardOutlined,
  BuildOutlined,
  Inventory2Outlined,
  PhoneInTalkOutlined,
  RequestQuoteOutlined,
  ScheduleOutlined,
  SupportAgentOutlined,
} from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import z from 'zod';
import LandingAccessToken from '~/components/Landing/LandingAccessToken';
import LandingFooter from '~/components/Landing/LandingFooter';
import LandingPageHeader from '~/components/Landing/LandingPageHeader';
import LandingServiceCards, { LandingServiceCardItem } from '~/components/Landing/LandingServiceCards';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import {
  useRejectSubscriptionProposal,
  useRequestMoreInfo,
  useSubscriptionProposal,
} from '~/proxies/aries-proxy/landing';
import { RouteConfig } from '~/routes/routeConfig';
import { KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';
import { SubscriptionProposal } from '~/types/aries-proxy/landing';
import { formatMoney } from '~/utils/money';

const FormSchema = z.object({
  note: z.string().trim().min(1, 'Inserisci una nota prima di continuare'),
});

type FormValues = z.infer<typeof FormSchema>;

const formatCurrency = (value?: number) => formatMoney({ amount: value?.toString() ?? '0', currency: 'EUR' });

const getServiceCards = (proposal: SubscriptionProposal | undefined): LandingServiceCardItem[] => [
  {
    icon: <SupportAgentOutlined color="primary" fontSize="large" />,
    description: 'Urgenze da valutare caso per caso.',
    title: 'Reperibilità telefonica h24',
    value: 'Solo orario ufficio',
  },
  {
    icon: <RequestQuoteOutlined color="primary" fontSize="large" />,
    description: 'Subordinato allo stato del momento e in coda a quelli già programmati.',
    title: 'Costo per interventi',
    value: `${formatCurrency(proposal?.nonSubscriberInterventionPrice)} anzichè ${formatCurrency(proposal?.subscriberInterventionPrice)}`,
  },
  {
    icon: <BuildOutlined color="primary" fontSize="large" />,
    description: 'Subordinato allo stato del momento e in coda a quelli già programmati.',
    title: 'Costo per manutenzione',
    value: 'Non agevolato',
  },
  {
    icon: <Inventory2Outlined color="primary" fontSize="large" />,
    description: 'Secondo disponibilità.',
    title: 'Costo materiale ricambio',
    value: 'A listino',
  },
];

const PageShell = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.14)}, transparent 30%), linear-gradient(180deg, #f8fbff 0%, ${theme.palette.grey[100]} 100%)`,
  paddingBottom: theme.spacing(8),
}));

const TopBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backdropFilter: 'blur(12px)',
  backgroundColor: alpha(theme.palette.common.white, 0.82),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
  marginBottom: theme.spacing(4),
}));

const MainCard = styled(Card)(({ theme }) => ({
  borderRadius: 28,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: '0 18px 38px rgba(15, 23, 42, 0.1)',
  overflow: 'hidden',
}));

const SectionBox = styled(Box)(({ theme }) => ({
  borderRadius: 20,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.common.white,
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.primary.light, 0.08),
}));

const ActionCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  border: `1px solid ${alpha(theme.palette.warning.main, 0.28)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.24)} 0%, ${alpha(theme.palette.common.white, 0.96)} 100%)`,
  boxShadow: 'none',
}));

const formatSystemLabel = (systemType: string, systemDescription: string) =>
  [systemType, systemDescription].filter(Boolean).join(' - ');

const RejectSubscriptionProposalContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignAriesEmailId = Number(searchParams.get('campaignAriesEmailId'));
  const { mutateAsync: rejectProposal, isPending: isRejecting, error: rejectError } = useRejectSubscriptionProposal();
  const {
    mutateAsync: requestMoreInfo,
    isPending: isRequestingMoreInfo,
    error: requestMoreInfoError,
  } = useRequestMoreInfo();
  const {
    data: proposal,
    isLoading: isProposalLoading,
    error: proposalError,
  } = useSubscriptionProposal(campaignAriesEmailId, {
    enabled: Number.isFinite(campaignAriesEmailId) && campaignAriesEmailId > 0,
  });
  const serviceCards = getServiceCards(proposal);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      note: '',
    },
  });

  useEffect(() => {
    if (proposalError) {
      setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
      navigate(RouteConfig.LandingLinkExpired.buildLink(), { replace: true });
    }
  }, [navigate, proposalError]);

  useEffect(() => {
    if (proposal?.isInFinalState) {
      setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
      navigate(RouteConfig.LandingSubscriptionProposalAlreadyHandled.buildLink(), { replace: true });
    }
  }, [navigate, proposal]);

  const handleSubmit = async (values: FormValues) => {
    await rejectProposal({
      campaignAriesEmailId,
      model: {
        note: values.note,
      },
    });

    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
    navigate(RouteConfig.LandingDoneNonSubscriber.buildLink(), {
      replace: true,
      state: { companyInfo: proposal?.companyInfo ?? null },
    });
  };

  const handleRequestFreeCheckup = async () => {
    await requestMoreInfo({
      campaignAriesEmailId,
      model: {
        note: 'Vorrei prenotare un sopralluogo gratuito',
      },
    });

    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
    navigate(RouteConfig.LandingDoneFreeCheckup.buildLink(), {
      replace: true,
      state: { companyInfo: proposal?.companyInfo ?? null },
    });
  };

  if (!Number.isFinite(campaignAriesEmailId) || campaignAriesEmailId <= 0) {
    navigate(RouteConfig.LandingLinkExpired.buildLink(), { replace: true });
    return null;
  }

  if (isProposalLoading) {
    return <LoadingScreen />;
  }

  if (!proposal) {
    return null;
  }

  return (
    <PageShell>
      <TopBar>
        <LandingPageHeader
          title="Proteggi cio che conta di più"
          subtitle="Scelta senza abbonamento, con informazioni chiare"
        />
      </TopBar>

      <Container maxWidth="lg">
        <MainCard>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.08, mb: 1.5 }}>
                    HAI SCELTO DI NON ABBONARTI
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Ci dispiace MA NESSUN PROBLEMA, resteremo comunque a disposizione. Anche se in questo momento
                    preferisci non aderire all&apos;abbonamento, continueremo comunque ad essere disponibili per
                    assisterti quando ne avrai bisogno.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    MASSIMA TRASPARENZA
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 900, lineHeight: 1.7 }}>
                    Vogliamo pero spiegarti in modo chiaro cosa comporta questa scelta, cosi da avere tutte le
                    informazioni utili prima di confermare la decisione.
                  </Typography>
                </Box>

                <LandingServiceCards items={serviceCards} />

                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Cosa significa scegliere &quot;Non essere interessato&quot;
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.75 }}>
                      La scelta di non aderire all&apos;abbonamento non blocca in alcun modo la possibilità di
                      richiedere assistenza futura. Semplicemente gli interventi verranno gestiti fuori abbonamento, con
                      le condizioni applicate ai servizi non in abbonamento.
                    </Typography>
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'repeat(3, minmax(0, 1fr))',
                        },
                        gap: { xs: 2, md: 0 },
                        py: 1,
                        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box
                        sx={{
                          py: 2,
                          borderBottom: { xs: (theme) => `1px solid ${theme.palette.divider}`, md: 'none' },
                          pr: { md: 3 },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
                        >
                          Ragione sociale
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                          {proposal.companyName}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          py: 2,
                          borderBottom: { xs: (theme) => `1px solid ${theme.palette.divider}`, md: 'none' },
                          px: { md: 3 },
                          borderLeft: { md: (theme) => `1px solid ${theme.palette.divider}` },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
                        >
                          Tipo impianto
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                          {formatSystemLabel(proposal.systemType, proposal.systemDescription)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          py: 2,
                          pl: { md: 3 },
                          borderLeft: { md: (theme) => `1px solid ${theme.palette.divider}` },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
                        >
                          Indirizzo impianto
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                          {proposal.systemAddress}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, minmax(0, 1fr))',
                      },
                      gap: 2,
                    }}
                  >
                    <InfoCard variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={2}>
                          <ScheduleOutlined color="primary" />
                          <Box>
                            <Typography fontWeight={700}>Manutenzioni future</Typography>
                            <Typography color="text.secondary">
                              Se in futuro vorrai richiedere una manutenzione, il servizio saràdisponibile ma senza il
                              prezzo agevolato previsto per i clienti abbonati.
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </InfoCard>
                    <InfoCard variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={2}>
                          <PhoneInTalkOutlined color="primary" />
                          <Box>
                            <Typography fontWeight={700}>Supporto telefonico</Typography>
                            <Typography color="text.secondary">
                              Resteremo comunque raggiungibili e operativi in orario di ufficio. Non portà essere
                              richiesta la reperibilità telefonica h24.
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </InfoCard>
                  </Box>

                  <Alert severity="info" sx={{ alignItems: 'flex-start' }}>
                    Siamo sempre disponibili a chiarire ogni dubbio e a supportare la tua scelta in base alle tue
                    esigenze.
                  </Alert>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      lg: 'minmax(0, 1.4fr) minmax(320px, 0.8fr)',
                    },
                    gap: 2.5,
                    alignItems: 'stretch',
                  }}
                >
                  <SectionBox
                    sx={{
                      order: {
                        xs: 2,
                        lg: 1,
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={700}>
                        Lascia una nota
                      </Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        Saremo interessati a conoscere i motivi della tua scelta.
                      </Typography>

                      <TextField
                        {...form.register('note')}
                        label="Nota"
                        fullWidth
                        multiline
                        minRows={5}
                        error={!!form.formState.errors.note}
                        helperText={form.formState.errors.note?.message}
                      />

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                        <Button type="submit" variant="contained" size="large" color="primary" loading={isRejecting}>
                          Confermo che non sono interessato
                        </Button>
                      </Stack>
                    </Stack>
                  </SectionBox>

                  <ActionCard
                    variant="outlined"
                    sx={{
                      order: {
                        xs: 1,
                        lg: 2,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, height: '100%' }}>
                      <Stack spacing={2} justifyContent="space-between" height="100%">
                        <Box>
                          <Chip color="warning" variant="outlined" label="Alternativa disponibile" sx={{ mb: 2 }} />
                          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                            Oppure prenota un sopralluogo gratuito
                          </Typography>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.75, mb: 1.5 }}>
                            Se preferisci non chiudere subito la proposta, puoi richiedere un sopralluogo gratuito per
                            valutare meglio il tuo impianto prima di decidere.
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            * Non è una manutenzione.
                          </Typography>
                        </Box>

                        <Button
                          variant="outlined"
                          color="warning"
                          size="large"
                          endIcon={<ArrowForwardOutlined />}
                          onClick={handleRequestFreeCheckup}
                          loading={isRequestingMoreInfo}
                        >
                          Richiedi sopralluogo gratuito
                        </Button>
                      </Stack>
                    </CardContent>
                  </ActionCard>
                </Box>

                {rejectError || requestMoreInfoError ? (
                  <Alert severity="error">
                    Non siamo riusciti a registrare la tua richiesta. Riprova tra qualche istante.
                  </Alert>
                ) : null}
              </Stack>
            </form>
          </CardContent>
        </MainCard>
        <LandingFooter companyInfo={proposal.companyInfo} hideLogo />
      </Container>
    </PageShell>
  );
};

const RejectSubscriptionProposalView: React.FC = () => {
  return (
    <LandingAccessToken>
      <RejectSubscriptionProposalContent />
    </LandingAccessToken>
  );
};

export default RejectSubscriptionProposalView;
