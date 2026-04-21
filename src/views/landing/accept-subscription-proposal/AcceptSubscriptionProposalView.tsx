import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import {
  BuildOutlined,
  Inventory2Outlined,
  PhoneInTalkOutlined,
  RequestQuoteOutlined,
  ScheduleOutlined,
  SupportAgentOutlined,
} from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import z from 'zod';
import LandingAccessToken from '~/components/Landing/LandingAccessToken';
import LandingFooter from '~/components/Landing/LandingFooter';
import LandingPageHeader from '~/components/Landing/LandingPageHeader';
import LandingServiceCards, { LandingServiceCardItem } from '~/components/Landing/LandingServiceCards';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { useAcceptSubscriptionProposal, useSubscriptionProposal } from '~/proxies/aries-proxy/landing';
import { RouteConfig } from '~/routes/routeConfig';
import { KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';
import AcceptanceCheckboxField from './components/AcceptanceCheckboxField';
import { getSuggestedSecondMaintenanceMonth } from './utils';
import { formatMoney } from '~/utils/money';

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

const serviceCards: LandingServiceCardItem[] = [
  {
    description: 'priorità nelle urgenze, con gestione in giornata quando necessario.',
    icon: <SupportAgentOutlined color="primary" fontSize="large" />,
    title: 'Reperibilità telefonica h24',
    value: 'H24 7/7',
  },
  {
    description: 'Prezzo vantaggioso e gestione con priorità rispetto ai servizi fuori abbonamento.',
    icon: <RequestQuoteOutlined color="primary" fontSize="large" />,
    title: 'Costo per interventi',
    value: 'Prezzo vantaggioso scontato',
  },
  {
    description: 'Check-up e manutenzioni pianificati secondo le scadenze programmate nella proposta.',
    icon: <BuildOutlined color="primary" fontSize="large" />,
    title: 'Costo per manutenzione',
    value: 'Prezzo vantaggioso e bloccato',
  },
  {
    description: 'Disponibilità e fornitura gestite secondo magazzino, con condizioni agevolate.',
    icon: <Inventory2Outlined color="primary" fontSize="large" />,
    title: 'Costo materiale ricambio',
    value: 'Prezzo vantaggioso scontato',
  },
];

const formatCurrency = (value: number) => formatMoney({ amount: value.toString(), currency: 'EUR' });

const FormSchema = z.object({
  maintenanceCount: z.number().min(1).max(2),
  preferredMonth1: z.number({
    message: 'Seleziona il mese preferito della prima manutenzione',
  }),
  preferredMonth2: z.number().optional(),
  notes: z.string().optional(),
  acceptFee: z.boolean().refine((value) => value, "Devi confermare la presa visione dell'addebito iniziale"),
  acceptSubscriptionTerms: z.boolean().refine((value) => value, "Devi accettare i termini dell'abbonamento"),
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

const MainCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
  overflow: 'hidden',
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
      acceptSubscriptionTerms: false,
      acceptProposal: false,
      maintenanceCount: proposal?.maintenanceCount ?? 1,
    },
  });

  const maintenanceCount = form.watch('maintenanceCount');
  const preferredMonth1 = form.watch('preferredMonth1');

  useEffect(() => {
    if (maintenanceCount !== 2 && form.getValues('preferredMonth2')) {
      form.setValue('preferredMonth2', undefined);
    }
  }, [form, maintenanceCount]);

  useEffect(() => {
    if (maintenanceCount !== 2) {
      return;
    }

    if (form.getValues('preferredMonth2')) {
      return;
    }

    const suggestedMonth = getSuggestedSecondMaintenanceMonth(preferredMonth1);

    if (!suggestedMonth) {
      return;
    }

    form.setValue('preferredMonth2', suggestedMonth, { shouldValidate: true });
    form.clearErrors('preferredMonth2');
  }, [form, maintenanceCount, preferredMonth1]);

  useEffect(() => {
    if (proposal) {
      form.reset({
        preferredMonth1: undefined,
        preferredMonth2: undefined,
        notes: '',
        acceptFee: false,
        acceptSubscriptionTerms: false,
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

  useEffect(() => {
    if (proposal?.isInFinalState) {
      setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
      navigate(RouteConfig.LandingSubscriptionProposalAlreadyHandled.buildLink(), { replace: true });
    }
  }, [navigate, proposal]);

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

    const acceptanceDate = Math.floor(Date.now() / 1000);

    await acceptProposal({
      campaignAriesEmailId,
      model: {
        termsAndConditionsAcceptanceDate: acceptanceDate,
        subscriptionTermsAcceptanceDate: acceptanceDate,
        immediateCallRightInvoicingAcceptanceDate: acceptanceDate,
        note: values.notes || null,
        selectedMonthIndexes:
          values.maintenanceCount === 2 && values.preferredMonth2
            ? [values.preferredMonth1, values.preferredMonth2]
            : [values.preferredMonth1],
      },
    });

    setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
    navigate(RouteConfig.LandingDoneSubscriptionActivated.buildLink(), {
      replace: true,
      state: { companyInfo: proposal.companyInfo ?? null },
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

  const systemLabel = [proposal.systemType, proposal.systemDescription].filter(Boolean).join(' - ');

  return (
    <PageShell>
      <TopBar>
        <LandingPageHeader
          title="Proteggi cio che conta di più"
          subtitle="Proposta di abbonamento, con informazioni chiare"
        />
      </TopBar>

      <Container maxWidth="lg">
        <Stack spacing={3}>
          <MainCard>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.08, mb: 1.5 }}>
                      SIAMO FELICI CHE TU STIA VALUTANDO DI ABBONARTI
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 980 }}>
                      Qui puoi consultare il riepilogo della proposta ricevuta e indicare i mesi preferiti per le
                      manutenzioni previste.
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      MASSIMA TRASPARENZA
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 920, lineHeight: 1.7 }}>
                      Ti mostriamo in modo chiaro cosa include l&apos;abbonamento, cosi da poter confermare la proposta
                      con tutte le informazioni utili.
                    </Typography>
                  </Box>

                  <LandingServiceCards items={serviceCards} />

                  <Divider />

                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Dati impianto
                    </Typography>
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
                      {[
                        ['Ragione sociale', proposal.companyName],
                        ['Descrizione', systemLabel],
                        ['Indirizzo', proposal.systemAddress],
                      ].map(([label, value], index) => {
                        const isFirstColumn = index % 3 === 0;
                        const isMiddleColumn = index % 3 === 1;
                        const isLastColumn = index % 3 === 2;

                        return (
                          <Box
                            key={label}
                            sx={{
                              py: 2,
                              ...(isMiddleColumn ? { px: { md: 3 } } : {}),
                              ...(isLastColumn ? { pl: { md: 3 } } : {}),
                              ...(isFirstColumn ? { pr: { md: 3 } } : {}),
                              borderBottom: {
                                xs: index < 2 ? (theme) => `1px solid ${theme.palette.divider}` : 'none',
                                md: 'none',
                              },
                              borderLeft: {
                                md: isFirstColumn ? 'none' : (theme) => `1px solid ${theme.palette.divider}`,
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textTransform: 'uppercase', letterSpacing: 0.7 }}
                            >
                              {label}
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ mt: 0.75 }}>
                              {value}
                            </Typography>
                          </Box>
                        );
                      })}
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
                            <Typography fontWeight={700}>Manutenzioni periodiche</Typography>
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
                          <PhoneInTalkOutlined color="primary" />
                          <Box>
                            <Typography fontWeight={700}>Supporto telefonico incluso</Typography>
                            <Typography color="text.secondary">
                              reperibilità telefonica inclusa h24, 7 giorni su 7.
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </InfoCard>
                  </Box>

                  <SectionBox>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={700}>
                        Selezione mesi manutenzione
                      </Typography>
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
                                    : 'Se scegli una sola manutenzione, questo campo non è necessario.')
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
                      <Typography variant="h6" fontWeight={700}>
                        Condizioni generali
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(220px, 0.8fr)' },
                        }}
                      >
                        {[
                          ['Reperibilità telefonica h24', `${formatCurrency(proposal.callRightPrice)} / anno`],
                          [
                            'Costo per interventi',
                            `${formatCurrency(proposal.subscriberInterventionPrice)} anzichè ${formatCurrency(proposal.nonSubscriberInterventionPrice)}`,
                          ],
                          [
                            'Costo per manutenzione',
                            `${formatCurrency(proposal.singleMaintenancePrice)} cad. - ${maintenanceCount} manutenzioni`,
                          ],
                          ['Automezzo / trasferta', '0,75 €/Km a piè di lista'],
                          ['Costo materiale ricambio', 'A listino con sconto 10%'],
                        ].map(([label, value], index) => (
                          <React.Fragment key={label}>
                            <Box
                              sx={{
                                py: 1.5,
                                pr: { md: 3 },
                                borderTop: index === 0 ? 'none' : (theme) => `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Typography fontWeight={600}>{label}</Typography>
                            </Box>
                            <Box
                              sx={{
                                py: 1.5,
                                color: 'text.secondary',
                                borderTop: index === 0 ? 'none' : (theme) => `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Typography>{value}</Typography>
                            </Box>
                          </React.Fragment>
                        ))}
                      </Box>
                    </Stack>
                  </SectionBox>

                  <Divider />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Confermo la mia volonta di abbonarmi
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.75, mb: 2.5 }}>
                      Bene, puoi confermare la proposta e inviarci eventuali note aggiuntive.
                    </Typography>

                    <Stack spacing={2}>
                      <TextField {...form.register('notes')} label="Note aggiuntive" fullWidth multiline minRows={4} />

                      <Alert severity="warning" sx={{ alignItems: 'flex-start' }}>
                        <Typography fontWeight={700} sx={{ mb: 0.75 }}>
                          Informazione importante
                        </Typography>
                        <Typography sx={{ lineHeight: 1.7 }}>
                          Con l&apos;adesione all&apos;abbonamento verra attivato il servizio di reperibilità telefonica
                          H24 al costo di <strong>{formatCurrency(proposal.callRightPrice)}</strong> con fatturazione
                          immediata. In caso di accettazione successiva al mese di gennaio, l&apos;importo verra ridotto
                          proporzionalmente.
                        </Typography>
                      </Alert>

                      <Controller
                        control={form.control}
                        name="acceptFee"
                        render={({ field }) => (
                          <AcceptanceCheckboxField
                            checked={field.value}
                            errorMessage={form.formState.errors.acceptFee?.message}
                            label="Confermo di aver letto e accettato l'addebito iniziale relativo alla reperibilità telefonica h24."
                            onChange={field.onChange}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="acceptSubscriptionTerms"
                        render={({ field }) => (
                          <AcceptanceCheckboxField
                            checked={field.value}
                            errorMessage={form.formState.errors.acceptSubscriptionTerms?.message}
                            label="Accetto i termini dell'abbonamento e confermo di averne preso piena visione."
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
                            label="Accetto la proposta di abbonamento selezionata e autorizzo il contatto da parte vostra per completare l'attivazione."
                            onChange={field.onChange}
                          />
                        )}
                      />

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                        <Button type="submit" variant="contained" size="large" loading={isAccepting}>
                          Conferma e aderisci
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>

                  {acceptError ? (
                    <Alert severity="error">
                      Non siamo riusciti a registrare l&apos;accettazione della proposta. Riprova tra qualche istante.
                    </Alert>
                  ) : null}
                </Stack>
              </form>
            </CardContent>
          </MainCard>
          <LandingFooter hideLogo companyInfo={proposal.companyInfo} />
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
