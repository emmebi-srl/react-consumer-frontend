import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { CalendarMonthOutlined, PhoneInTalkOutlined, VerifiedOutlined } from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import z from 'zod';
import LandingAccessToken from '~/components/Landing/LandingAccessToken';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { useAcceptSubscriptionProposal, useSubscriptionProposal } from '~/proxies/aries-proxy/landing';
import { RouteConfig } from '~/routes/routeConfig';
import { KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';
import Logo from '~/components/Layout/Logo';
import AcceptanceCheckboxField from './components/AcceptanceCheckboxField';

const monthOptions = [
  { value: 1, label: 'Gennaio' },
  { value: 2, label: 'Febbraio' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Aprile' },
  { value: 5, label: 'Maggio' },
  { value: 6, label: 'Giugno' },
  { value: 7, label: 'Luglio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Settembre' },
  { value: 10, label: 'Ottobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Dicembre' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);

const FormSchema = z.object({
  maintenanceCount: z.number().min(1).max(2),
  preferredMonth1: z.number({
    message: 'Seleziona il mese preferito della prima manutenzione',
  }),
  preferredMonth2: z.number().optional(),
  notes: z.string().optional(),
  acceptFee: z.boolean().refine((value) => value, "Devi confermare la presa visione dell'addebito iniziale"),
  acceptProposal: z.boolean().refine((value) => value, 'Devi accettare la proposta per proseguire'),
});

type FormValues = z.infer<typeof FormSchema>;

const PageShell = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.14)}, transparent 28%), linear-gradient(180deg, #f7fbff 0%, #eef4fa 100%)`,
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
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
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

const SummaryItem = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.common.white,
  padding: theme.spacing(2),
}));

const SectionBox = styled(Box)(({ theme }) => ({
  borderRadius: 18,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.common.white,
}));

const AcceptSubscriptionProposalContent: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const campaignAriesEmailId = Number(searchParams.get('campaignAriesEmailId'));

  const { mutateAsync: acceptProposal, isPending: isAccepting, error: acceptError } = useAcceptSubscriptionProposal();
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
      preferredMonth1: undefined,
      preferredMonth2: undefined,
      notes: '',
      acceptFee: false,
      acceptProposal: false,
      maintenanceCount: proposal?.maintenanceCount ?? 1,
    },
  });

  const maintenanceCount = form.watch('maintenanceCount');

  useEffect(() => {
    if (maintenanceCount !== 2 && form.getValues('preferredMonth2')) {
      form.setValue('preferredMonth2', undefined);
    }
  }, [form, maintenanceCount]);

  useEffect(() => {
    if (proposal) {
      form.reset({
        preferredMonth1: undefined,
        preferredMonth2: undefined,
        notes: '',
        acceptFee: false,
        acceptProposal: false,
        maintenanceCount: proposal.maintenanceCount,
      });
    }
  }, [form, proposal]);

  useEffect(() => {
    if (proposalError) {
      setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
      navigate(RouteConfig.LandingLinkExpired.buildLink(), { replace: true });
    }
  }, [navigate, proposalError]);

  const handleSubmit = async (values: FormValues) => {
    if (!proposal) {
      return;
    }

    if (values.maintenanceCount === 2 && !values.preferredMonth2) {
      form.setError('preferredMonth2', {
        type: 'manual',
        message: 'Seleziona il mese preferito della seconda manutenzione',
      });
      return;
    }

    if (values.maintenanceCount === 2 && values.preferredMonth1 === values.preferredMonth2) {
      form.setError('preferredMonth2', {
        type: 'manual',
        message: 'Seleziona un mese diverso per la seconda manutenzione',
      });
      return;
    }

    const acceptanceDate = new Date().toISOString();

    await acceptProposal({
      campaignAriesEmailId,
      model: {
        termsAndConditionsAcceptanceDate: acceptanceDate,
        immediateCallRightInvoicingAcceptanceDate: acceptanceDate,
        note: values.notes || null,
        selectedMonthIndexes:
          values.maintenanceCount === 2 && values.preferredMonth2
            ? [values.preferredMonth1, values.preferredMonth2]
            : [values.preferredMonth1],
      },
    });

    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
    navigate(RouteConfig.LandingDone.buildLink(), { replace: true });
  };

  if (!Number.isFinite(campaignAriesEmailId) || campaignAriesEmailId <= 0) {
    navigate(RouteConfig.LandingLinkExpired.buildLink(), { replace: true });
    return;
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
                  Proposta abbonamento manutenzione
                </Typography>
                <Typography color="text.secondary">Conferma guidata senza login</Typography>
              </Box>
            </Stack>
            <Chip color="primary" variant="outlined" label="Link riservato" />
          </Stack>
        </Container>
      </TopBar>

      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column' }} spacing={3} alignItems="stretch">
            <HeroCard sx={{ flex: 1.15 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems={{ md: 'center' }}
                  >
                    <Chip
                      icon={<VerifiedOutlined />}
                      color="primary"
                      label="Proposta personalizzabile di abbonamento"
                    />
                    <Chip variant="outlined" label="Servizio attivo" />
                  </Stack>
                  <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.08, mb: 1.5 }}>
                      Accetta la proposta di abbonamento
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 16, lineHeight: 1.75 }}>
                      Qui puoi consultare il riepilogo della proposta ricevuta e indicare i mesi preferiti per le
                      manutenzioni previste.
                    </Typography>
                  </Box>
                  <Stack spacing={1.5}>
                    <InfoCard variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={2}>
                          <VerifiedOutlined color="primary" />
                          <Box>
                            <Typography fontWeight={700}>Manutenzione programmata</Typography>
                            <Typography color="text.secondary">
                              Check-up periodici per mantenere il sistema affidabile e senza sorprese.
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </InfoCard>
                    <InfoCard variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={2}>
                          <CalendarMonthOutlined color="primary" />
                          <Box>
                            <Typography fontWeight={700}>Proposta definita</Typography>
                            <Typography color="text.secondary">
                              La proposta prevede {proposal.maintenanceCount} manutenzioni al prezzo di{' '}
                              {formatCurrency(proposal.singleMaintenancePrice)} ciascuna.
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
                            <Typography fontWeight={700}>Reperibilita telefonica inclusa 7 giorni su 7, H24</Typography>
                            <Typography color="text.secondary">
                              Servizio attivato con addebito iniziale di {formatCurrency(proposal.callRightPrice)} +
                              fattura.
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </InfoCard>
                  </Stack>
                </Stack>
              </CardContent>
            </HeroCard>

            <InfoCard sx={{ flex: 0.85, alignSelf: 'stretch' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary" sx={{ fontSize: 15, lineHeight: 1.8 }}>
                  Una volta inviata la richiesta, il nostro team potra ricontattarti per confermare i dettagli e
                  procedere con l'attivazione dell'abbonamento scelto.
                </Typography>
              </CardContent>
            </InfoCard>
          </Stack>

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
                        Personalizza e accetta la proposta
                      </Typography>
                      <Chip variant="outlined" label="Step finale" />
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 820, lineHeight: 1.7 }}>
                      Qui sotto trovi il riepilogo dei dati della proposta e puoi indicare i mesi preferiti per la
                      pianificazione.
                    </Typography>
                  </Box>

                  <SectionBox>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={700}>
                        Dati gia presenti
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
                            Descrizione impianto
                          </Typography>
                          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                            {proposal.systemDescription}
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
                        <SummaryItem>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
                          >
                            Prezzo manutenzione
                          </Typography>
                          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                            {formatCurrency(proposal.singleMaintenancePrice)}
                          </Typography>
                        </SummaryItem>
                        <SummaryItem>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
                          >
                            Numero manutenzioni consigliate
                          </Typography>
                          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                            {proposal.maintenanceCount}
                          </Typography>
                        </SummaryItem>
                        <SummaryItem>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
                          >
                            Diritto di chiamata
                          </Typography>
                          <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                            {formatCurrency(proposal.callRightPrice)}
                          </Typography>
                        </SummaryItem>
                      </Box>
                    </Stack>
                  </SectionBox>

                  <SectionBox>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                          Pianificazione manutenzioni
                        </Typography>
                        <Chip size="small" label="1" />
                      </Stack>
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
                        <Controller
                          control={form.control}
                          name="maintenanceCount"
                          render={({ field }) => (
                            <TextField
                              select
                              fullWidth
                              label="Numero manutenzioni"
                              value={field.value}
                              onChange={(event) => field.onChange(Number(event.target.value))}
                              sx={{
                                gridColumn: {
                                  xs: 'span 1',
                                  md: 'span 1',
                                },
                              }}
                            >
                              {Array.from({ length: proposal.maintenanceCount }, (_, index) => index + 1).map(
                                (count) => (
                                  <MenuItem key={count} value={count}>
                                    {count}
                                  </MenuItem>
                                ),
                              )}
                            </TextField>
                          )}
                        />

                        <Box
                          sx={{
                            display: 'grid',
                            gridColumn: '1 / -1',
                            gridTemplateColumns: {
                              xs: '1fr',
                              md: 'repeat(2, minmax(0, 1fr))',
                            },
                            gap: 2,
                          }}
                        >
                          <Controller
                            control={form.control}
                            name="preferredMonth1"
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                label="Mese preferito - 1a manutenzione"
                                value={field.value || ''}
                                onChange={(event) =>
                                  field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                                }
                                error={!!form.formState.errors.preferredMonth1}
                                helperText={form.formState.errors.preferredMonth1?.message}
                              >
                                <MenuItem value="">Seleziona un mese</MenuItem>
                                {monthOptions.map((month) => (
                                  <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                          <Controller
                            control={form.control}
                            name="preferredMonth2"
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                label="Mese preferito - 2a manutenzione"
                                disabled={maintenanceCount !== 2}
                                value={field.value ?? ''}
                                onChange={(event) =>
                                  field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                                }
                                error={!!form.formState.errors.preferredMonth2}
                                helperText={
                                  form.formState.errors.preferredMonth2?.message ??
                                  (maintenanceCount === 2
                                    ? 'Indica un mese preferito anche per la seconda manutenzione.'
                                    : 'Se scegli una sola manutenzione, questo campo non e necessario.')
                                }
                              >
                                <MenuItem value="">Seleziona un mese</MenuItem>
                                {monthOptions.map((month) => (
                                  <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </SectionBox>

                  <SectionBox>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                          Note e accettazione
                        </Typography>
                        <Chip size="small" label="2" />
                      </Stack>

                      <TextField {...form.register('notes')} label="Note aggiuntive" fullWidth multiline minRows={4} />

                      <Alert severity="warning" sx={{ alignItems: 'flex-start' }}>
                        <Typography fontWeight={700} sx={{ mb: 0.75 }}>
                          Informazione importante
                        </Typography>
                        <Typography sx={{ lineHeight: 1.7 }}>
                          Con l'adesione all'abbonamento viene attivato il servizio di reperibilita telefonica 7 giorni
                          su 7, H24, al costo di <strong>{formatCurrency(proposal.callRightPrice)} + fattura</strong>,
                          con addebito immediato e relativa fattura. In caso di accettazione successiva al mese di
                          gennaio, l'importo potra essere ridotto proporzionalmente.
                        </Typography>
                      </Alert>

                      <Controller
                        control={form.control}
                        name="acceptFee"
                        render={({ field }) => (
                          <AcceptanceCheckboxField
                            checked={field.value}
                            errorMessage={form.formState.errors.acceptFee?.message}
                            label="Confermo di aver letto e accettato l'addebito iniziale relativo alla reperibilita telefonica 7 giorni su 7, H24."
                            onChange={field.onChange}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="acceptProposal"
                        render={({ field }) => (
                          <AcceptanceCheckboxField
                            checked={field.value}
                            errorMessage={form.formState.errors.acceptProposal?.message}
                            label="Accetto la proposta di abbonamento selezionata e autorizzo il contatto da parte del vostro team per completare l'attivazione."
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Stack>
                  </SectionBox>

                  {acceptError ? (
                    <Alert severity="error">
                      Non siamo riusciti a registrare l'accettazione della proposta. Riprova tra qualche istante.
                    </Alert>
                  ) : null}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                    <Button type="submit" variant="contained" size="large" loading={isAccepting}>
                      Conferma la mia richiesta
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      Dopo l'invio verrai reindirizzato a una pagina di conferma finale.
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

const AcceptSubscriptionProposalView: React.FC = () => {
  return (
    <LandingAccessToken>
      <AcceptSubscriptionProposalContent />
    </LandingAccessToken>
  );
};

export default AcceptSubscriptionProposalView;
