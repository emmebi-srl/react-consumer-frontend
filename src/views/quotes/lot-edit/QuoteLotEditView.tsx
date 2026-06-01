import { useEffect } from 'react';
import { ArrowBack, Delete, Save } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import {
  useCreateQuoteLot,
  useDeleteQuoteItem,
  useQuoteItems,
  useQuoteLotById,
  useUpdateQuoteLot,
} from '~/proxies/aries-proxy/quotes';
import { RouteConfig } from '~/routes/routeConfig';
import { QuoteLotCreate, QuoteLotUpdate } from '~/types/aries-proxy/quotes';

interface FormValues {
  chargePercentage: string;
  chargeType: string;
  costHours: string;
  discount: string;
  lotId: string;
  lotName: string;
  note: string;
  optional: boolean;
  plannedHours: string;
  preface: string;
  subscriptionId: string;
  systemId: string;
  vatId: string;
}

const defaultValues: FormValues = {
  chargePercentage: '',
  chargeType: '',
  costHours: '',
  discount: '',
  lotId: '',
  lotName: '',
  note: '',
  optional: false,
  plannedHours: '',
  preface: '',
  subscriptionId: '',
  systemId: '',
  vatId: '',
};

const toNullableNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
};

const QuoteLotEditView = () => {
  const navigate = useNavigate();
  const params = useParams<{ lotPosition?: string; quoteId?: string; revisionId?: string; year?: string }>();
  const year = Number(params.year);
  const quoteId = Number(params.quoteId);
  const revisionId = Number(params.revisionId);
  const lotPosition = Number(params.lotPosition ?? 0);
  const isNew = !params.lotPosition;

  const lotQuery = useQuoteLotById(year, quoteId, revisionId, lotPosition);
  const itemsQuery = useQuoteItems(year, quoteId, revisionId, lotPosition);
  const createLot = useCreateQuoteLot();
  const updateLot = useUpdateQuoteLot();
  const deleteItem = useDeleteQuoteItem();

  const form = useForm<FormValues>({
    defaultValues,
  });

  const lot = lotQuery.data?.lots.at(0);

  useEffect(() => {
    if (!lot || isNew) return;

    form.reset({
      chargePercentage: lot.chargePercentage == null ? '' : String(lot.chargePercentage),
      chargeType: lot.chargeType == null ? '' : String(lot.chargeType),
      costHours: lot.costHours == null ? '' : String(lot.costHours),
      discount: lot.discount == null ? '' : String(lot.discount),
      lotId: String(lot.lotId),
      lotName: lot.lotName ?? '',
      note: lot.note ?? '',
      optional: lot.optional,
      plannedHours: lot.plannedHours == null ? '' : String(lot.plannedHours),
      preface: lot.preface ?? '',
      subscriptionId: lot.subscriptionId == null ? '' : String(lot.subscriptionId),
      systemId: lot.systemId == null ? '' : String(lot.systemId),
      vatId: lot.vatId == null ? '' : String(lot.vatId),
    });
  }, [form, isNew, lot]);

  const buildPayload = (values: FormValues): QuoteLotCreate | QuoteLotUpdate => ({
    chargePercentage: toNullableNumber(values.chargePercentage),
    chargeType: toNullableNumber(values.chargeType),
    costHours: toNullableNumber(values.costHours),
    discount: toNullableNumber(values.discount),
    lotId: toNullableNumber(values.lotId),
    lotName: values.lotName.trim(),
    note: values.note || null,
    optional: values.optional,
    plannedHours: toNullableNumber(values.plannedHours),
    preface: values.preface || null,
    subscriptionId: toNullableNumber(values.subscriptionId),
    systemId: toNullableNumber(values.systemId),
    vatId: toNullableNumber(values.vatId),
  });

  const handleSubmit = async (values: FormValues) => {
    if (isNew) {
      await createLot.mutateAsync({
        data: buildPayload(values) as QuoteLotCreate,
        id: quoteId,
        revisionId,
        year,
      });
    } else {
      await updateLot.mutateAsync({
        data: buildPayload(values) as QuoteLotUpdate,
        id: quoteId,
        position: lotPosition,
        revisionId,
        year,
      });
    }

    navigate(RouteConfig.QuoteDetail.buildLink({ quoteId: String(quoteId), year: String(year) }));
  };

  const handleDeleteItem = async (tabId: number) => {
    const confirmed = window.confirm(`Eliminare la riga ${tabId}?`);
    if (!confirmed) return;

    await deleteItem.mutateAsync({
      id: quoteId,
      position: lotPosition,
      revisionId,
      tabId,
      year,
    });
  };

  const isSaving = createLot.isPending || updateLot.isPending;
  const items = itemsQuery.data?.items ?? [];
  const isInvalidRoute =
    year <= 0 || quoteId <= 0 || revisionId < 0 || Number.isNaN(revisionId) || (!isNew && lotPosition <= 0);

  return (
    <PageContainer>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Stack spacing={0.5}>
              <Typography variant="h5">{isNew ? 'Nuovo lotto' : 'Modifica lotto'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Preventivo #{quoteId} / {year} - Rev. {revisionId}
                {isNew ? '' : ` - Lotto ${lotPosition}`}
              </Typography>
            </Stack>
            <Button
              component={RouterLink}
              to={RouteConfig.QuoteDetail.buildLink({ quoteId: String(quoteId), year: String(year) })}
              startIcon={<ArrowBack />}
              variant="outlined"
            >
              Dettaglio
            </Button>
          </Stack>

          {isInvalidRoute ? <Alert severity="error">Riferimento lotto non valido.</Alert> : null}
          {!isNew && lotQuery.isLoading ? <CircularProgress size={28} /> : null}
          {lotQuery.error ? <Alert severity="error">Impossibile caricare il lotto.</Alert> : null}
          {createLot.error || updateLot.error ? <Alert severity="error">Impossibile salvare il lotto.</Alert> : null}
          {deleteItem.error ? <Alert severity="error">Impossibile eliminare la riga.</Alert> : null}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField {...form.register('lotName', { required: true })} fullWidth label="Nome lotto" required />
            <TextField {...form.register('lotId')} fullWidth inputMode="numeric" label="Id lotto" />
            <TextField {...form.register('vatId')} fullWidth inputMode="numeric" label="IVA" />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField {...form.register('discount')} fullWidth inputMode="decimal" label="Sconto" />
            <TextField {...form.register('plannedHours')} fullWidth inputMode="decimal" label="Ore previste" />
            <TextField {...form.register('costHours')} fullWidth inputMode="decimal" label="Ore costo" />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField {...form.register('systemId')} fullWidth inputMode="numeric" label="Impianto" />
            <TextField {...form.register('subscriptionId')} fullWidth inputMode="numeric" label="Abbonamento" />
            <TextField {...form.register('chargeType')} fullWidth inputMode="numeric" label="Tipo ricarico" />
            <TextField {...form.register('chargePercentage')} fullWidth inputMode="decimal" label="Ricarico %" />
          </Stack>

          <Controller
            control={form.control}
            name="optional"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                label="Opzionale"
              />
            )}
          />

          <TextField {...form.register('note')} fullWidth label="Nota" minRows={3} multiline />
          <TextField {...form.register('preface')} fullWidth label="Prefazione" minRows={5} multiline />

          {!isNew ? (
            <Stack spacing={1}>
              <Typography variant="h6">Righe lotto</Typography>
              {itemsQuery.isLoading ? <CircularProgress size={24} /> : null}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Riga</TableCell>
                    <TableCell>Articolo</TableCell>
                    <TableCell>Descrizione</TableCell>
                    <TableCell align="right">Q.ta</TableCell>
                    <TableCell align="right">Prezzo</TableCell>
                    <TableCell align="right">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.tabId}>
                      <TableCell>{item.tabId}</TableCell>
                      <TableCell>{item.articleId ?? '-'}</TableCell>
                      <TableCell>{item.shortDescription ?? '-'}</TableCell>
                      <TableCell align="right">{item.quantity ?? 0}</TableCell>
                      <TableCell align="right">{item.price ?? 0}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Elimina riga">
                          <span>
                            <IconButton
                              aria-label="Elimina riga"
                              disabled={deleteItem.isPending}
                              onClick={() => handleDeleteItem(item.tabId)}
                              size="small"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && !itemsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography color="text.secondary" variant="body2">
                          Nessuna riga presente.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </Stack>
          ) : null}

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={() => navigate(-1)} variant="outlined">
              Annulla
            </Button>
            <Button loading={isSaving} startIcon={<Save />} type="submit" variant="contained">
              Salva
            </Button>
          </Stack>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default QuoteLotEditView;
