import { Alert, Box, Button, Card, CardContent, Chip, Container, Stack, TextField, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { AccessTimeOutlined, InfoOutlined, LocalPhoneOutlined, MoneyOffOutlined } from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import z from 'zod';
import LandingAccessToken from '~/components/Landing/LandingAccessToken';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import Logo from '~/components/Layout/Logo';
import { useRejectSubscriptionProposal, useSubscriptionProposal } from '~/proxies/aries-proxy/landing';
import { RouteConfig } from '~/routes/routeConfig';
import { KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';

const FormSchema = z.object({
  note: z.string().trim().min(1, 'Inserisci una nota prima di continuare'),
});

type FormValues = z.infer<typeof FormSchema>;

const PageShell = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.12)}, transparent 28%), linear-gradient(180deg, #f8fbff 0%, ${theme.palette.grey[100]} 100%)`,
  paddingBottom: theme.spacing(8),
}));

const TopBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backdropFilter: 'blur(12px)',
  backgroundColor: alpha(theme.palette.common.white, 0.78),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
  marginBottom: theme.spacing(4),
}));

const HeroCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
  overflow: 'hidden',
}));

const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: '0 18px 38px rgba(15, 23, 42, 0.1)',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.primary.light, 0.08),
}));

const SectionBox = styled(Box)(({ theme }) => ({
  borderRadius: 18,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.common.white,
}));

const SummaryItem = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.common.white,
  padding: theme.spacing(2),
}));

const RejectSubscriptionProposalContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignAriesEmailId = Number(searchParams.get('campaignAriesEmailId'));
  const { mutateAsync: rejectProposal, isPending: isRejecting, error: rejectError } = useRejectSubscriptionProposal();
  const {
    data: proposal,
    isLoading: isProposalLoading,
    error: proposalError,
  } = useSubscriptionProposal(campaignAriesEmailId, {
    enabled: Number.isFinite(campaignAriesEmailId) && campaignAriesEmailId > 0,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      note: 'Non sono interessato',
    },
  });

  useEffect(() => {
    if (proposalError) {
      setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
      navigate(RouteConfig.LandingLinkExpired.buildLink(), { replace: true });
    }
  }, [navigate, proposalError]);

  const handleSubmit = async (values: FormValues) => {
    await rejectProposal({
      campaignAriesEmailId,
      model: {
        note: values.note,
      },
    });

    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
    navigate(RouteConfig.LandingDone.buildLink(), { replace: true });
  };

  if (isProposalLoading) {
    return <LoadingScreen />;
  }

  if (!proposal) {
    return null;
  }

  return (
    <PageShell>
      <TopBar>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            py={2}
            alignItems={{ md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={4} alignItems="center">
              <Logo sx={{ height: 60 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Informazioni sul servizio senza abbonamento
                </Typography>
                <Typography color="text.secondary">Scelta senza vincoli</Typography>
              </Box>
            </Stack>
            <Chip color="primary" variant="outlined" label="Informazione trasparente" />
          </Stack>
        </Container>
      </TopBar>

      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column' }} spacing={3}>
          <HeroCard>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ md: 'center' }}
                >
                  <Chip icon={<InfoOutlined />} color="primary" label="Scelta senza abbonamento" />
                  <Chip variant="outlined" label="Nessun vincolo" />
                </Stack>

                <Box>
                  <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.08, mb: 1.5 }}>
                    Nessun problema: restiamo comunque a tua disposizione
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 16, lineHeight: 1.75, mb: 1.5 }}>
                    Se in questo momento preferisci non aderire all&apos;abbonamento, continueremo comunque a essere
                    disponibili per assisterti quando ne avrai bisogno.
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 16, lineHeight: 1.75 }}>
                    Vogliamo pero spiegarti in modo chiaro cosa comporta questa scelta, cosi avrai tutte le informazioni
                    utili prima di decidere.
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  <InfoCard variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={2}>
                        <MoneyOffOutlined color="primary" />
                        <Box>
                          <Typography fontWeight={700}>Nessun prezzo agevolato per le manutenzioni</Typography>
                          <Typography color="text.secondary">
                            In caso di intervento o manutenzione futura, non verranno applicate le condizioni economiche
                            riservate agli abbonati.
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </InfoCard>

                  <InfoCard variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={2}>
                        <LocalPhoneOutlined color="primary" />
                        <Box>
                          <Typography fontWeight={700}>
                            Nessun accesso alla reperibilita telefonica 7 giorni su 7, H24
                          </Typography>
                          <Typography color="text.secondary">
                            Il servizio di reperibilita continuativa e riservato ai clienti che aderiscono
                            all&apos;abbonamento.
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </InfoCard>

                  <InfoCard variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={2}>
                        <AccessTimeOutlined color="primary" />
                        <Box>
                          <Typography fontWeight={700}>Supporto sempre disponibile in orario d&apos;ufficio</Typography>
                          <Typography color="text.secondary">
                            Per qualsiasi tipo di intervento resteremo comunque a disposizione durante i normali orari
                            lavorativi.
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </InfoCard>
                </Stack>
              </Stack>
            </CardContent>
          </HeroCard>
          <FormCard>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                <Stack spacing={3}>
                  <Box>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ md: 'center' }}
                    >
                      <Typography variant="h4" fontWeight={700}>
                        Cosa significa scegliere &quot;Non sono interessato&quot;
                      </Typography>
                      <Chip variant="outlined" label="Riepilogo" />
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 860, lineHeight: 1.7 }}>
                      La scelta di non aderire all&apos;abbonamento non blocca in alcun modo la possibilita di
                      richiedere assistenza futura. Semplicemente, gli eventuali interventi verranno gestiti fuori
                      convenzione, con le normali condizioni applicate ai servizi non in abbonamento.
                    </Typography>
                  </Box>

                  <SectionBox>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={700}>
                        Dati del tuo impianto
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(3, minmax(0, 1fr))',
                          },
                          gap: 2,
                        }}
                      >
                        <SummaryItem>
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
                        </SummaryItem>
                        <SummaryItem>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
                          >
                            Tipo impianto
                          </Typography>
                          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                            {proposal.systemType}
                          </Typography>
                        </SummaryItem>
                        <SummaryItem>
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
                        </SummaryItem>
                      </Box>
                    </Stack>
                  </SectionBox>

                  <SectionBox>
                    <Stack spacing={2}>
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
                        <SummaryItem>
                          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                            Manutenzioni future
                          </Typography>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            Se in futuro vorrai richiedere una manutenzione, il servizio sara disponibile ma senza il
                            prezzo agevolato previsto per i clienti abbonati.
                          </Typography>
                        </SummaryItem>
                        <SummaryItem>
                          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                            Supporto telefonico
                          </Typography>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            Non sara attiva la reperibilita telefonica 7 giorni su 7, H24, ma resteremo comunque
                            raggiungibili e operativi in orario d&apos;ufficio.
                          </Typography>
                        </SummaryItem>
                      </Box>

                      <Alert severity="warning" sx={{ alignItems: 'flex-start' }}>
                        <Typography fontWeight={700} sx={{ mb: 0.75 }}>
                          In ogni caso
                        </Typography>
                        <Typography sx={{ lineHeight: 1.7 }}>
                          Per qualsiasi esigenza, verifica o richiesta di intervento, il nostro team sara disponibile
                          durante l&apos;orario d&apos;ufficio per supportarti nel modo piu rapido e chiaro possibile.
                        </Typography>
                      </Alert>
                    </Stack>
                  </SectionBox>

                  <SectionBox>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={700}>
                        Lascia una nota
                      </Typography>

                      <TextField
                        {...form.register('note')}
                        label="Nota"
                        fullWidth
                        multiline
                        minRows={4}
                        error={!!form.formState.errors.note}
                        helperText={form.formState.errors.note?.message}
                      />
                    </Stack>
                  </SectionBox>

                  {rejectError ? (
                    <Alert severity="error">
                      Non siamo riusciti a registrare la tua scelta. Riprova tra qualche istante.
                    </Alert>
                  ) : null}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                    <Button type="submit" variant="contained" size="large" color="primary" loading={isRejecting}>
                      Non sono interessato
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      Siamo sempre disponibili a chiarire ogni dubbio e a supportarti nella scelta piu adatta alle tue
                      esigenze.
                    </Typography>
                  </Stack>
                </Stack>
              </form>
            </CardContent>
          </FormCard>
        </Stack>
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
