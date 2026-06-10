import { useEffect, useState } from 'react';
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
  useUpdateQuoteItem,
  useUpdateQuoteLot,
} from '~/proxies/aries-proxy/quotes';
import { RouteConfig } from '~/routes/routeConfig';
import { QuoteItem, QuoteLotCreate, QuoteLotUpdate } from '~/types/aries-proxy/quotes';

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

const rtfControlDestinations = new Set(['colortbl', 'fonttbl', 'info', 'pict', 'stylesheet']);

const decodeRtf = (value?: string | null) => {
  if (!value) return '';
  if (!value.trimStart().startsWith('{\\rtf')) return value;

  const stack: boolean[] = [];
  let ignore = false;
  let result = '';

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === '{') {
      const groupStart = /^\\\*?([a-zA-Z]+)/.exec(value.slice(index + 1));
      const destination = groupStart?.[1] ?? '';
      stack.push(ignore);
      ignore = ignore || rtfControlDestinations.has(destination);
      continue;
    }

    if (char === '}') {
      ignore = stack.pop() ?? false;
      continue;
    }

    if (ignore) continue;

    if (char !== '\\') {
      if (char !== '\r' && char !== '\n') result += char;
      continue;
    }

    const next = value[index + 1];
    if (next === '\\' || next === '{' || next === '}') {
      result += next;
      index += 1;
      continue;
    }

    if (next === "'") {
      const hex = value.slice(index + 2, index + 4);
      const code = Number.parseInt(hex, 16);
      if (!Number.isNaN(code)) result += String.fromCharCode(code);
      index += 3;
      continue;
    }

    const match = /^([a-zA-Z]+)(-?\d+)? ?/.exec(value.slice(index + 1));
    if (!match) {
      index += 1;
      continue;
    }

    const [, word, parameter] = match;
    if (word === 'par' || word === 'line') result += '\n';
    if (word === 'tab') result += '\t';
    if (word === 'u' && parameter) result += String.fromCharCode(Number(parameter));

    index += match[0].length;
  }

  return result
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
};

const encodeRtfText = (value: string) => {
  const encodeChar = (char: string) => {
    if (char === '\\' || char === '{' || char === '}') return `\\${char}`;

    const code = char.charCodeAt(0);
    if (code > 127) {
      const signedCode = code > 32767 ? code - 65536 : code;
      return `\\u${signedCode}?`;
    }

    return char;
  };

  const body = value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.split('').map(encodeChar).join(''))
    .join('\\par\n');

  return `{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0\\fnil Arial;}}\\viewkind4\\uc1\\f0\\fs20 ${body}}`;
};

interface ItemRowProps {
  deletePending: boolean;
  item: QuoteItem;
  lotPosition: number;
  onDelete: (tabId: number) => void;
  quoteId: number;
  revisionId: number;
  year: number;
}

const QuoteLotItemRow: React.FC<ItemRowProps> = ({
  deletePending,
  item,
  lotPosition,
  onDelete,
  quoteId,
  revisionId,
  year,
}) => {
  const updateItem = useUpdateQuoteItem();
  const [description, setDescription] = useState(() => decodeRtf(item.shortDescription));

  useEffect(() => {
    setDescription(decodeRtf(item.shortDescription));
  }, [item.shortDescription]);

  const originalDescription = decodeRtf(item.shortDescription);
  const hasChanges = description !== originalDescription;

  const handleSave = async () => {
    await updateItem.mutateAsync({
      data: {
        shortDescription: encodeRtfText(description),
      },
      id: quoteId,
      position: lotPosition,
      revisionId,
      tabId: item.tabId,
      year,
    });
  };

  return (
    <TableRow>
      <TableCell>{item.tabId}</TableCell>
      <TableCell>{item.articleId ?? '-'}</TableCell>
      <TableCell sx={{ minWidth: 520 }}>
        <TextField
          fullWidth
          minRows={4}
          multiline
          onChange={(event) => setDescription(event.target.value)}
          value={description}
        />
      </TableCell>
      <TableCell align="right">{item.quantity ?? 0}</TableCell>
      <TableCell align="right">{item.price ?? 0}</TableCell>
      <TableCell align="right">
        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
          <Tooltip title="Salva descrizione">
            <span>
              <IconButton
                aria-label="Salva descrizione"
                disabled={!hasChanges || updateItem.isPending}
                onClick={handleSave}
                size="small"
              >
                <Save fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Elimina riga">
            <span>
              <IconButton
                aria-label="Elimina riga"
                disabled={deletePending || updateItem.isPending}
                onClick={() => onDelete(item.tabId)}
                size="small"
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
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
                    <QuoteLotItemRow
                      key={item.tabId}
                      deletePending={deleteItem.isPending}
                      item={item}
                      lotPosition={lotPosition}
                      onDelete={handleDeleteItem}
                      quoteId={quoteId}
                      revisionId={revisionId}
                      year={year}
                    />
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
