import { zodResolver } from '@hookform/resolvers/zod';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useRef } from 'react';
import z from 'zod';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import {
  useCreateSystemSubscription,
  useSystemSubscriptionProposalAcceptances,
  useSystemSubscriptionsBySystemId,
} from '~/proxies/aries-proxy/system-subscriptions';
import { useSubscriptions } from '~/proxies/aries-proxy/subscriptions';
import { Campaign, CampaignMail } from '~/types/aries-proxy/campaigns';
import {
  SystemSubscription,
  SystemSubscriptionOperationResult,
  SystemSubscriptionProposalAcceptance,
} from '~/types/aries-proxy/system-subscriptions';
import { getReadableTextColor, normalizeToHexColor } from '~/utils/color-utils';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';
import { getMonthName } from '~/utils/months-utils';
import { formatMoney, newMoney } from '~/utils/money';

interface CreateSystemSubscriptionModalProps extends ModalProps {
  campaign?: Campaign | null;
  mail: CampaignMail;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'CREATED'; result: SystemSubscriptionOperationResult }) => void;
}

const monthOptions = Array.from({ length: 12 }, (_value, index) => {
  const monthIndex = index + 1;
  return {
    value: monthIndex,
    label: getMonthName(monthIndex),
  };
});

const FormSchema = z.object({
  subscriptionId: z.number().int().positive('Seleziona un abbonamento'),
  year: z.number().int().min(2000, 'Anno non valido').max(2100, 'Anno non valido'),
  subscriptionAmount: z.number().min(0, 'Inserisci un importo valido'),
  maintenanceAmount: z.number().min(0, 'Inserisci un importo valido'),
  callRightAmount: z.number().min(0, 'Inserisci un importo valido'),
  firstHourAmount: z.number().min(0, 'Inserisci un importo valido'),
  months: z.array(z.number().int().min(1).max(12)).min(1, 'Seleziona almeno un mese'),
  createForEntireDuration: z.boolean(),
  createCallRightPreinvoice: z.boolean(),
});

type FormValues = z.infer<typeof FormSchema>;

const sortMonthIndexes = (values: number[]) => [...new Set(values)].sort((left, right) => left - right);

const formatMonthList = (months: number[]) => {
  if (months.length === 0) {
    return 'Nessun mese selezionato';
  }

  return sortMonthIndexes(months)
    .map((month) => getMonthName(month))
    .join(', ');
};

const sanitizePhoneLink = (value: string) => value.replace(/\s+/g, '');

const positiveOutcomeApplicationReference = 'positive_outcome';

const getSuggestedYear = (currentYear: number, latestSystemSubscription?: SystemSubscription) => {
  if (!latestSystemSubscription) {
    return currentYear;
  }

  return Math.max(currentYear, latestSystemSubscription.year + 1);
};

const getTemplateFromSystemSubscription = (
  subscription: SystemSubscription | undefined,
  year: number,
  fallbackSubscriptionId?: number | null,
  fallbackSubscriptionAmount = 0,
): Partial<FormValues> | null => {
  if (!subscription) {
    return null;
  }

  return {
    subscriptionId: subscription.subscriptionId || fallbackSubscriptionId || undefined,
    year,
    subscriptionAmount: subscription.exit?.subscriptionAmount ?? fallbackSubscriptionAmount,
    maintenanceAmount: subscription.exit?.maintenanceAmount ?? 0,
    callRightAmount: Number(subscription.exit?.callRightAmount ?? 0),
    firstHourAmount: Number(subscription.exit?.firstHourAmount ?? 0),
    months: sortMonthIndexes((subscription.months ?? []).map((month) => month.month)),
  };
};

const getTemplateFromProposalAcceptance = (
  proposalAcceptance: SystemSubscriptionProposalAcceptance | null | undefined,
  year: number,
  fallbackSubscriptionId?: number | null,
  fallbackSubscriptionAmount = 0,
  fallbackFirstHourAmount = 0,
): Partial<FormValues> | null => {
  if (!proposalAcceptance) {
    return null;
  }

  return {
    subscriptionId: fallbackSubscriptionId ?? undefined,
    year,
    subscriptionAmount: fallbackSubscriptionAmount,
    maintenanceAmount: proposalAcceptance.singleMaintenancePrice,
    callRightAmount: Number(proposalAcceptance.callRightPrice),
    firstHourAmount: fallbackFirstHourAmount,
    months: sortMonthIndexes((proposalAcceptance.months ?? []).map((month) => month.monthIndex)),
    createCallRightPreinvoice: true,
  };
};

const CreateSystemSubscriptionModal = (props: CreateSystemSubscriptionModalProps) => {
  const snackbar = useSnackbar();
  const theme = useTheme();
  const isMobileDialog = useMediaQuery(theme.breakpoints.down('sm'));
  const systemId = props.mail.systemId ?? undefined;
  const currentYear = new Date().getFullYear();
  const initializationRef = useRef(false);

  const subscriptionsQuery = useSubscriptions();
  const systemSubscriptionsQuery = useSystemSubscriptionsBySystemId(systemId ?? 0, {
    includes: 'months,exit',
    enabled: !!systemId,
  });
  const proposalAcceptancesQuery = useSystemSubscriptionProposalAcceptances(systemId ?? 0, {
    campaignMailId: props.mail.id,
    includes: 'months',
    pageIndex: 1,
    pageSize: 100,
    enabled: !!systemId,
  });
  const createSystemSubscriptionMutation = useCreateSystemSubscription();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      subscriptionId: undefined,
      year: currentYear,
      subscriptionAmount: 0,
      maintenanceAmount: 0,
      callRightAmount: 0,
      firstHourAmount: 0,
      months: [],
      createForEntireDuration: false,
      createCallRightPreinvoice: false,
    },
  });

  const subscriptions = useMemo(
    () =>
      [...(subscriptionsQuery.data ?? [])].sort((left, right) => {
        if (left.year !== right.year) {
          return right.year - left.year;
        }

        return left.name.localeCompare(right.name, 'it');
      }),
    [subscriptionsQuery.data],
  );

  const latestSystemSubscription = systemSubscriptionsQuery.data?.systemSubscriptions[0];
  const campaignProposalAcceptance = [...(proposalAcceptancesQuery.data?.systemSubscriptionProposalAcceptances ?? [])]
    .filter((proposalAcceptance) => proposalAcceptance.campaignMailId === props.mail.id)
    .sort((left, right) => right.insertionDate - left.insertionDate)[0];
  const hasPositiveOutcome = props.mail.status?.applicationReference === positiveOutcomeApplicationReference;
  const activeSubscription = subscriptions.find(
    (subscription) => subscription.id === props.mail.system?.subscriptionId,
  );
  const defaultFormSubscription = useMemo(
    () =>
      subscriptions.find((subscription) => subscription.id === props.mail.system?.subscriptionId) ??
      subscriptions.find((subscription) => subscription.isDefault),
    [props.mail.system?.subscriptionId, subscriptions],
  );
  const suggestedYear = getSuggestedYear(currentYear, latestSystemSubscription);

  const baseTemplate = useMemo<Partial<FormValues>>(
    () => ({
      subscriptionId: undefined,
      year: suggestedYear,
      subscriptionAmount:
        latestSystemSubscription?.exit?.subscriptionAmount ?? defaultFormSubscription?.subscriptionAmount ?? 0,
      maintenanceAmount: latestSystemSubscription?.exit?.maintenanceAmount ?? 0,
      callRightAmount: Number(
        latestSystemSubscription?.exit?.callRightAmount ?? defaultFormSubscription?.callRightAmount ?? 0,
      ),
      firstHourAmount: Number(latestSystemSubscription?.exit?.firstHourAmount ?? 0),
      months: sortMonthIndexes((latestSystemSubscription?.months ?? []).map((month) => month.month)),
      createForEntireDuration: false,
      createCallRightPreinvoice: false,
    }),
    [defaultFormSubscription, latestSystemSubscription, suggestedYear],
  );

  useEffect(() => {
    if (
      initializationRef.current ||
      !systemId ||
      subscriptionsQuery.isLoading ||
      systemSubscriptionsQuery.isLoading ||
      proposalAcceptancesQuery.isLoading
    ) {
      return;
    }

    const proposalTemplate = getTemplateFromProposalAcceptance(
      hasPositiveOutcome ? campaignProposalAcceptance : null,
      suggestedYear,
      props.mail.system?.subscriptionId ?? baseTemplate.subscriptionId,
      Number(baseTemplate.subscriptionAmount ?? 0),
      baseTemplate.firstHourAmount ?? 0,
    );
    const systemSubscriptionTemplate = getTemplateFromSystemSubscription(
      latestSystemSubscription,
      suggestedYear,
      props.mail.system?.subscriptionId ?? baseTemplate.subscriptionId,
      Number(baseTemplate.subscriptionAmount ?? 0),
    );

    form.reset({
      subscriptionId: undefined,
      year: proposalTemplate?.year ?? systemSubscriptionTemplate?.year ?? baseTemplate.year ?? currentYear,
      subscriptionAmount:
        proposalTemplate?.subscriptionAmount ??
        systemSubscriptionTemplate?.subscriptionAmount ??
        baseTemplate.subscriptionAmount ??
        0,
      maintenanceAmount:
        proposalTemplate?.maintenanceAmount ??
        systemSubscriptionTemplate?.maintenanceAmount ??
        baseTemplate.maintenanceAmount ??
        0,
      callRightAmount:
        proposalTemplate?.callRightAmount ??
        systemSubscriptionTemplate?.callRightAmount ??
        baseTemplate.callRightAmount ??
        0,
      firstHourAmount:
        proposalTemplate?.firstHourAmount ??
        systemSubscriptionTemplate?.firstHourAmount ??
        baseTemplate.firstHourAmount ??
        0,
      months: proposalTemplate?.months ?? systemSubscriptionTemplate?.months ?? baseTemplate.months ?? [],
      createForEntireDuration: baseTemplate.createForEntireDuration ?? false,
      createCallRightPreinvoice:
        proposalTemplate?.createCallRightPreinvoice ?? baseTemplate.createCallRightPreinvoice ?? false,
    });

    initializationRef.current = true;
  }, [
    baseTemplate,
    currentYear,
    form,
    hasPositiveOutcome,
    campaignProposalAcceptance,
    proposalAcceptancesQuery.isLoading,
    latestSystemSubscription,
    props.mail.system?.subscriptionId,
    suggestedYear,
    subscriptionsQuery.isLoading,
    systemSubscriptionsQuery.isLoading,
    systemId,
  ]);

  const close = () =>
    props.closeModal({
      action: 'CLOSE',
    });

  const applyTemplate = (template: Partial<FormValues> | null) => {
    if (!template) {
      return;
    }

    form.reset({
      subscriptionId: template.subscriptionId ?? form.getValues('subscriptionId'),
      year: template.year ?? form.getValues('year'),
      subscriptionAmount: template.subscriptionAmount ?? form.getValues('subscriptionAmount'),
      maintenanceAmount: template.maintenanceAmount ?? form.getValues('maintenanceAmount'),
      callRightAmount: template.callRightAmount ?? form.getValues('callRightAmount'),
      firstHourAmount: template.firstHourAmount ?? form.getValues('firstHourAmount'),
      months: template.months ?? form.getValues('months'),
      createForEntireDuration: template.createForEntireDuration ?? form.getValues('createForEntireDuration'),
      createCallRightPreinvoice: template.createCallRightPreinvoice ?? form.getValues('createCallRightPreinvoice'),
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!systemId) {
      return;
    }

    try {
      const result = await createSystemSubscriptionMutation.mutateAsync({
        systemId,
        subscriptionId: values.subscriptionId,
        year: values.year,
        subscriptionAmount: values.subscriptionAmount,
        maintenanceAmount: values.maintenanceAmount,
        callRightAmount: values.callRightAmount,
        firstHourAmount: values.firstHourAmount,
        months: sortMonthIndexes(values.months),
        createForEntireDuration: values.createForEntireDuration,
        createCallRightPreinvoice: values.createCallRightPreinvoice,
      });

      snackbar.success(
        result.preinvoice
          ? 'Abbonamento creato correttamente con prefattura per il diritto di chiamata.'
          : 'Abbonamento creato correttamente.',
      );
      props.closeModal({
        action: 'CREATED',
        result,
      });
    } catch {
      // The mutation hook already logs and exposes the error state.
    }
  });

  const customerName = props.mail.customer?.companyName ?? `Cliente #${props.mail.customerId}`;
  const primaryCustomerPhone =
    props.mail.system?.sims?.find((sim) => !!sim.phoneNumber)?.phoneNumber ?? props.mail.system?.gsm ?? null;
  const primaryCustomerEmail = props.mail.email || null;
  const systemDescription =
    props.mail.system?.description ?? (systemId ? `Impianto #${systemId}` : 'Nessun impianto collegato');
  const currentSubscriptionLabel = activeSubscription
    ? `${activeSubscription.name} (${activeSubscription.year})`
    : props.mail.system?.subscriptionId
      ? `#${props.mail.system.subscriptionId}`
      : 'Nessun abbonamento associato';
  const lastSystemMonths = sortMonthIndexes((latestSystemSubscription?.months ?? []).map((month) => month.month));
  const lastProposalMonths = sortMonthIndexes(
    (campaignProposalAcceptance?.months ?? []).map((month) => month.monthIndex),
  );
  const campaignStatusLabel = props.mail.status?.name ?? 'Stato non disponibile';
  const campaignStatusColor = normalizeToHexColor(props.mail.status?.color);

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      snackbar.success(successMessage);
    } catch {
      snackbar.error('Impossibile copiare il valore negli appunti.');
    }
  };

  return (
    <Dialog
      maxWidth="lg"
      open
      onClose={close}
      fullWidth
      fullScreen={isMobileDialog}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 'min(1080px, calc(100vw - 48px))' },
          maxHeight: { xs: '100%', sm: 'calc(100vh - 32px)' },
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        Crea Abbonamento Impianto
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ pt: 0.5 }}>
          {!systemId ? (
            <Alert severity="warning">
              Questa mail non ha un impianto associato, quindi non e possibile creare l&apos;abbonamento.
            </Alert>
          ) : null}

          {createSystemSubscriptionMutation.error ? (
            <Alert severity="error">Errore durante la creazione dell&apos;abbonamento.</Alert>
          ) : null}

          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cliente - #{props.mail.customerId}
                  </Typography>
                  <Typography variant="h6">{customerName}</Typography>
                </Box>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Telefono principale
                    </Typography>
                    {primaryCustomerPhone ? (
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Link href={`tel:${sanitizePhoneLink(primaryCustomerPhone)}`} underline="hover">
                          {primaryCustomerPhone}
                        </Link>
                        <Tooltip title="Copia telefono">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(primaryCustomerPhone, 'Numero di telefono copiato.')}
                          >
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Typography variant="body1">N/D</Typography>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email principale
                    </Typography>
                    {primaryCustomerEmail ? (
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Link href={`mailto:${primaryCustomerEmail}`} underline="hover">
                          {primaryCustomerEmail}
                        </Link>
                        <Tooltip title="Copia email">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(primaryCustomerEmail, 'Email copiata.')}
                          >
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Typography variant="body1">N/D</Typography>
                    )}
                  </Grid>
                </Grid>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Impianto
                  </Typography>
                  <Typography variant="body1">
                    {props.mail.system?.typeDescription ?? 'N/D'} - {systemDescription}
                  </Typography>
                </Box>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Stato impianto
                    </Typography>
                    <Typography variant="body1">{props.mail.system?.statusDescription ?? 'N/D'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Abbonamento corrente
                    </Typography>
                    <Typography variant="body1">{currentSubscriptionLabel}</Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ultima campagna abbonamento
                    </Typography>
                    <Typography variant="body1">
                      {props.campaign?.name ?? `Campagna mail #${props.mail.campaignId}`}
                    </Typography>
                  </Box>
                  <Chip
                    label={campaignStatusLabel}
                    size="small"
                    sx={
                      campaignStatusColor
                        ? {
                            bgcolor: campaignStatusColor,
                            color: getReadableTextColor(campaignStatusColor),
                            fontWeight: 600,
                          }
                        : undefined
                    }
                  />
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tipo campagna
                    </Typography>
                    <Typography variant="body1">{props.campaign?.campaignType?.name ?? 'N/D'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email destinatario
                    </Typography>
                    <Typography variant="body1">{props.mail.email}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Note campagna
                    </Typography>
                    <Typography variant="body1">{props.mail.note || 'Nessuna nota'}</Typography>
                  </Grid>
                </Grid>
                {hasPositiveOutcome ? (
                  <>
                    <Divider />
                    {proposalAcceptancesQuery.isLoading ? (
                      <Stack direction="row" justifyContent="center" alignItems="center">
                        <CircularProgress size={18} />
                      </Stack>
                    ) : null}
                    {campaignProposalAcceptance ? (
                      <>
                        <Grid container spacing={1.5}>
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Manutenzioni
                            </Typography>
                            <Typography variant="body1">{campaignProposalAcceptance.maintenanceCount}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Prezzo singola manutenzione
                            </Typography>
                            <Typography variant="body1">
                              {formatMoney(newMoney(campaignProposalAcceptance.singleMaintenancePrice))}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Prezzo diritto di chiamata
                            </Typography>
                            <Typography variant="body1">
                              {formatMoney(newMoney(campaignProposalAcceptance.callRightPrice))}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Accettata il
                            </Typography>
                            <Typography variant="body1">
                              {campaignProposalAcceptance.termsAndConditionsAcceptanceDate
                                ? getStringDateTimeByUnixtimestamp(
                                    campaignProposalAcceptance.termsAndConditionsAcceptanceDate,
                                  )
                                : 'N/D'}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 8 }}>
                            <Typography variant="body2" color="text.secondary">
                              Mesi richiesti
                            </Typography>
                            <Typography variant="body1">{formatMonthList(lastProposalMonths)}</Typography>
                          </Grid>
                        </Grid>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            applyTemplate(
                              getTemplateFromProposalAcceptance(
                                campaignProposalAcceptance,
                                suggestedYear,
                                props.mail.system?.subscriptionId ?? baseTemplate.subscriptionId,
                                Number(baseTemplate.subscriptionAmount ?? 0),
                                Number(baseTemplate.firstHourAmount ?? 0),
                              ),
                            )
                          }
                        >
                          Inizializza dai dati della proposta accettata
                        </Button>
                      </>
                    ) : (
                      <Alert severity="info">
                        La campagna ha esito positivo, ma non ci sono ancora dati di proposta accettata collegati a
                        questa campagna mail.
                      </Alert>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    I valori della proposta e l&apos;inizializzazione sono disponibili solo per campagne con esito
                    positivo.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ultimo abbonamento registrato
                    </Typography>
                    <Typography variant="body1">
                      {latestSystemSubscription
                        ? `${subscriptions.find((subscription) => subscription.id === latestSystemSubscription.subscriptionId)?.name ?? `#${latestSystemSubscription.subscriptionId}`} - ${latestSystemSubscription.year}`
                        : 'Nessun abbonamento trovato'}
                    </Typography>
                  </Box>
                  {systemSubscriptionsQuery.isLoading ? <CircularProgress size={18} /> : null}
                </Stack>

                {latestSystemSubscription ? (
                  <>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Mesi pianificati
                        </Typography>
                        <Typography variant="body1">{formatMonthList(lastSystemMonths)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Importo abbonamento
                        </Typography>
                        <Typography variant="body1">
                          {formatMoney(newMoney(latestSystemSubscription.exit?.subscriptionAmount ?? 0))}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Importo manutenzione
                        </Typography>
                        <Typography variant="body1">
                          {formatMoney(newMoney(latestSystemSubscription.exit?.maintenanceAmount ?? 0))}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Diritto di chiamata
                        </Typography>
                        <Typography variant="body1">
                          {formatMoney(newMoney(Number(latestSystemSubscription.exit?.callRightAmount ?? 0)))}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Prima ora
                        </Typography>
                        <Typography variant="body1">
                          {formatMoney(newMoney(Number(latestSystemSubscription.exit?.firstHourAmount ?? 0)))}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        applyTemplate(
                          getTemplateFromSystemSubscription(
                            latestSystemSubscription,
                            suggestedYear,
                            props.mail.system?.subscriptionId ?? baseTemplate.subscriptionId,
                          ),
                        )
                      }
                    >
                      Inizializza dal precedente abbonamento
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nessun abbonamento storico disponibile per questo impianto.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Divider />

          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle1">Dati abbonamento</Typography>

            <Controller
              control={form.control}
              name="subscriptionId"
              render={({ field, fieldState }) => (
                <Autocomplete
                  options={subscriptions}
                  loading={subscriptionsQuery.isLoading}
                  value={subscriptions.find((subscription) => subscription.id === field.value) ?? null}
                  onChange={(_event, subscription) => field.onChange(subscription?.id)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(subscription) => `${subscription.name} (${subscription.year})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Abbonamento"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                  noOptionsText="Nessun abbonamento trovato"
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  control={form.control}
                  name="year"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Anno"
                      type="number"
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  control={form.control}
                  name="subscriptionAmount"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Importo abbonamento"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  control={form.control}
                  name="maintenanceAmount"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Importo manutenzione"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  control={form.control}
                  name="callRightAmount"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Prezzo diritto di chiamata"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  control={form.control}
                  name="firstHourAmount"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Importo prima ora"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              control={form.control}
              name="months"
              render={({ field, fieldState }) => (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Mesi
                  </Typography>
                  <Grid container spacing={1}>
                    {monthOptions.map((month) => {
                      const checked = field.value.includes(month.value);
                      return (
                        <Grid key={month.value} size={{ xs: 12, sm: 6, md: 3 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={(_event, isChecked) => {
                                  const values = isChecked
                                    ? [...field.value, month.value]
                                    : field.value.filter((value) => value !== month.value);

                                  field.onChange(sortMonthIndexes(values));
                                }}
                              />
                            }
                            label={month.label}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                  {fieldState.error ? (
                    <Typography variant="caption" color="error">
                      {fieldState.error.message}
                    </Typography>
                  ) : null}
                </Stack>
              )}
            />

            <Divider />

            <Controller
              control={form.control}
              name="createCallRightPreinvoice"
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={(_event, checked) => field.onChange(checked)} />}
                  label="Genera prefattura per diritto di chiamata"
                />
              )}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: 'stretch',
          gap: 1,
        }}
      >
        <Button onClick={close} fullWidth={isMobileDialog}>
          Annulla
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!systemId || createSystemSubscriptionMutation.isPending || subscriptionsQuery.isLoading}
          fullWidth={isMobileDialog}
        >
          {createSystemSubscriptionMutation.isPending ? 'Creazione...' : 'Crea abbonamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSystemSubscriptionModal;
