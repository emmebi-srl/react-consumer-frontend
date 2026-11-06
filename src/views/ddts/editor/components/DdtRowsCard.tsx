import { Fragment, useState } from 'react';
import { ArrowDownward, ArrowUpward, Delete, NoteAdd, WarningAmber } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import useSnackbar from '~/hooks/useSnackbar';
import { getDdtProductDefaults } from '~/proxies/aries-proxy/api/ddts';
import { useDdtJobRemaining, useDepotTypes } from '~/proxies/aries-proxy/ddts';
import { useMeasurementUnits, useProductsAutocomplete } from '~/proxies/aries-proxy/products';
import { DDT_ROW_TYPE_ECONOMY } from '~/types/aries-proxy/ddts';
import { Product } from '~/types/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { formatMoney, newMoney } from '~/utils/money';
import {
  DdtFormValues,
  DdtRowValues,
  emptyNoteRow,
  getRowTotals,
  isNoteRow,
  newRowKey,
  parseDecimal,
} from '../ddtFormValues';

const toEuro = (amount: number) => formatMoney(newMoney(amount, 'EUR'));

const formatQuantity = (value: number) => value.toLocaleString('it-IT', { maximumFractionDigits: 2 });

const ROW_TYPE_LABELS: Record<string, string> = {
  N: 'Nota',
  E: 'Tutto in economia',
  '?': 'Riferimento',
  '+': 'Da rapporto',
  '-': 'Da lista prelievo',
  Y: 'Kit',
};

const decimalInput = { htmlInput: { inputMode: 'decimal' as const, style: { textAlign: 'right' as const } } };

interface Props {
  /** Number and year of the saved DDT: its rows are given back to the job when computing what is left. */
  ddtId?: number;
  ddtYear?: number;
  showPrices: boolean;
  showTotals: boolean;
}

/**
 * Body of the DDT, like the Delphi GridDdtBody: product, kit and note rows. On save the triggers move the stock
 * and, with a job lot, the quantities of the job (economy included).
 */
const DdtRowsCard: React.FC<Props> = ({ ddtId, ddtYear, showPrices, showTotals }) => {
  const snackbar = useSnackbar();
  const { control, getValues, setValue } = useFormContext<DdtFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'rows', keyName: 'fieldKey' });
  const rows = useWatch({ control, name: 'rows' });
  const jobLink = useWatch({ control, name: 'jobLink' });
  const isCustomer = useWatch({ control, name: 'isCustomer' });
  const { data: depotData } = useDepotTypes();
  const { data: unitData } = useMeasurementUnits();
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);
  const productsQuery = useProductsAutocomplete(search);
  const [adding, setAdding] = useState(false);
  const withJob = isCustomer && !!jobLink;
  const productCodes = rows.map((row) => row.productCode.trim()).filter(Boolean);
  const remainingQuery = useDdtJobRemaining(withJob ? jobLink : null, productCodes, ddtId, ddtYear);
  const remaining = remainingQuery.data;
  const totals = getRowTotals(rows);
  const columns = 9 + (showPrices ? 2 : 0) + (withJob ? 1 : 0);

  const addProduct = async (product: Product | null) => {
    if (!product) return;
    setAdding(true);
    try {
      const depotId = getValues('defaultDepotId');
      const recipient = getValues('recipient');
      // ProductPricesGetter: the price for the customer (brand discount, subscription), net of the discount.
      const customerId = getValues('isCustomer') ? recipient?.id : null;
      const defaults = (await getDdtProductDefaults(product.productCode, depotId === '' ? null : depotId, customerId))
        .data;
      append({
        key: newRowKey(),
        productCode: defaults.productCode,
        text: defaults.description ?? '',
        originalDescription: null,
        supplierCode: defaults.supplierCode ?? '',
        serialNumber: '',
        quantity: String(defaults.quantity),
        measureUnit: defaults.measureUnit ?? '',
        price: String(defaults.price),
        cost: String(defaults.cost),
        depotId,
        rowType: '',
        noteId: null,
        referenceId: null,
        referenceYear: null,
        discount: 0,
        economy: '',
        kitComponents: defaults.kitComponents,
        stock: defaults.stock ?? null,
      });
      if (defaults.stock !== null && defaults.stock !== undefined && defaults.stock < defaults.quantity) {
        snackbar.warning(`Giacenza in magazzino: ${defaults.stock}`);
      }
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile aggiungere l'articolo."));
    } finally {
      setAdding(false);
      setSearchText('');
    }
  };

  /** What the job says about the row: SaveDDTProductsInJob asks the same questions when Delphi saves. */
  const jobInfo = (row: DdtRowValues) => {
    if (!withJob || !remaining || !row.productCode.trim()) return null;
    const left = remaining[row.productCode.trim().toUpperCase()];
    if (left === undefined) return null;
    const quantity = parseDecimal(row.quantity) ?? 0;
    const economy = row.rowType === DDT_ROW_TYPE_ECONOMY ? quantity : (parseDecimal(row.economy) ?? 0);
    if (left < 0) {
      return { text: 'Non in commessa: verrà aggiunto al lotto', warning: economy < quantity, economy: quantity };
    }
    const excess = quantity - economy - left;
    return { text: `Residuo commessa ${formatQuantity(left)}`, warning: excess > 0, economy: economy + excess };
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Righe"
        titleTypographyProps={{ variant: 'subtitle1' }}
        action={
          showTotals ? (
            <Stack direction="row" spacing={2} sx={{ pr: 1, pt: 0.5 }}>
              <Typography variant="body2">Prezzo {toEuro(totals.price)}</Typography>
              <Typography variant="body2">Costo {toEuro(totals.cost)}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Guadagno {toEuro(totals.price - totals.cost)}
              </Typography>
            </Stack>
          ) : null
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2, alignItems: { md: 'center' } }}>
          <Autocomplete<Product>
            value={null}
            inputValue={searchText}
            options={productsQuery.data ?? []}
            loading={productsQuery.isFetching || adding}
            filterOptions={(items) => items}
            getOptionLabel={(option) => `${option.productCode} - ${option.description ?? ''}`}
            noOptionsText={search.trim().length < 2 ? 'Scrivi almeno 2 caratteri' : 'Nessun articolo'}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') setSearchText(value);
            }}
            onChange={(_, value) => void addProduct(value)}
            sx={{ flexGrow: 1 }}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Aggiungi articolo (codice, descrizione, cod. fornitore)" />
            )}
          />
          <Button startIcon={<NoteAdd />} onClick={() => append(emptyNoteRow())}>
            Aggiungi nota
          </Button>
        </Stack>

        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 120 }}>Codice</TableCell>
                <TableCell>Descrizione</TableCell>
                <TableCell sx={{ width: 120 }}>Cod. fornitore</TableCell>
                <TableCell sx={{ width: 120 }}>S/N</TableCell>
                <TableCell sx={{ width: 120 }} align="right">
                  Q.tà
                </TableCell>
                {withJob ? (
                  <TableCell sx={{ width: 100 }} align="right">
                    Economia
                  </TableCell>
                ) : null}
                <TableCell sx={{ width: 80 }}>U.M.</TableCell>
                {showPrices ? (
                  <>
                    <TableCell sx={{ width: 100 }} align="right">
                      Costo
                    </TableCell>
                    <TableCell sx={{ width: 100 }} align="right">
                      Prezzo
                    </TableCell>
                  </>
                ) : null}
                <TableCell sx={{ width: 150 }}>Magazzino</TableCell>
                <TableCell sx={{ width: 110 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => {
                const row = rows[index] ?? field;
                const note = isNoteRow(row);
                const job = jobInfo(row);
                const allEconomy = row.rowType === DDT_ROW_TYPE_ECONOMY;
                const typeLabel = ROW_TYPE_LABELS[row.rowType] ?? (row.kitComponents.length ? ROW_TYPE_LABELS.Y : null);
                return (
                  <Fragment key={field.fieldKey}>
                    <TableRow sx={row.kitComponents.length ? { '& > td': { borderBottom: 0 } } : undefined}>
                      <TableCell>
                        {note ? (
                          <Chip size="small" label={typeLabel ?? 'Nota'} />
                        ) : (
                          <Stack spacing={0.5}>
                            <Typography variant="body2">{row.productCode}</Typography>
                            {typeLabel ? <Chip size="small" variant="outlined" label={typeLabel} /> : null}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`rows.${index}.text`}
                          control={control}
                          render={({ field: input }) => (
                            <TextField {...input} size="small" fullWidth multiline maxRows={6} />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`rows.${index}.supplierCode`}
                          control={control}
                          render={({ field: input }) => <TextField {...input} size="small" fullWidth disabled={note} />}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`rows.${index}.serialNumber`}
                          control={control}
                          render={({ field: input }) => <TextField {...input} size="small" fullWidth disabled={note} />}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`rows.${index}.quantity`}
                          control={control}
                          render={({ field: input }) => (
                            <TextField {...input} size="small" fullWidth slotProps={decimalInput} />
                          )}
                        />
                        {job ? (
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                            {job.warning ? <WarningAmber color="warning" sx={{ fontSize: 16 }} /> : null}
                            <Typography
                              variant="caption"
                              sx={{ color: job.warning ? 'warning.main' : 'text.secondary', lineHeight: 1.2 }}
                            >
                              {job.text}
                            </Typography>
                          </Stack>
                        ) : null}
                        {job?.warning && !allEconomy ? (
                          <Button
                            size="small"
                            sx={{ px: 0.5, minWidth: 0, fontSize: 11 }}
                            onClick={() =>
                              setValue(`rows.${index}.economy`, String(job.economy), { shouldDirty: true })
                            }
                          >
                            {job.economy === (parseDecimal(row.quantity) ?? 0)
                              ? 'Tutto in economia'
                              : 'Eccedenza in economia'}
                          </Button>
                        ) : null}
                      </TableCell>
                      {withJob ? (
                        <TableCell>
                          {note ? null : (
                            <Controller
                              name={`rows.${index}.economy`}
                              control={control}
                              render={({ field: input }) => (
                                <TextField
                                  {...input}
                                  value={allEconomy ? row.quantity : input.value}
                                  size="small"
                                  fullWidth
                                  disabled={allEconomy}
                                  slotProps={decimalInput}
                                />
                              )}
                            />
                          )}
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <Controller
                          name={`rows.${index}.measureUnit`}
                          control={control}
                          render={({ field: input }) => (
                            <TextField {...input} select size="small" fullWidth>
                              <MenuItem value="">-</MenuItem>
                              {input.value &&
                              !(unitData?.measurementUnits ?? []).some((unit) => unit.id === input.value) ? (
                                <MenuItem value={input.value}>{input.value}</MenuItem>
                              ) : null}
                              {(unitData?.measurementUnits ?? []).map((unit) => (
                                <MenuItem key={unit.id} value={unit.id}>
                                  {unit.id}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      </TableCell>
                      {showPrices ? (
                        <>
                          <TableCell>
                            <Controller
                              name={`rows.${index}.cost`}
                              control={control}
                              render={({ field: input }) => (
                                <TextField {...input} size="small" fullWidth slotProps={decimalInput} />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`rows.${index}.price`}
                              control={control}
                              render={({ field: input }) => (
                                <TextField {...input} size="small" fullWidth slotProps={decimalInput} />
                              )}
                            />
                          </TableCell>
                        </>
                      ) : null}
                      <TableCell>
                        {note ? null : (
                          <>
                            <Controller
                              name={`rows.${index}.depotId`}
                              control={control}
                              render={({ field: input }) => (
                                <TextField
                                  {...input}
                                  select
                                  size="small"
                                  fullWidth
                                  onChange={(event) => {
                                    input.onChange(event);
                                    // The stock shown was the one of the old depot.
                                    setValue(`rows.${index}.stock`, null);
                                  }}
                                >
                                  <MenuItem value="">Nessuno (non movimenta)</MenuItem>
                                  {(depotData?.depotTypes ?? [])
                                    .filter((depot) => !depot.isDisabled || depot.id === input.value)
                                    .map((depot) => (
                                      <MenuItem key={depot.id} value={depot.id}>
                                        {depot.name}
                                      </MenuItem>
                                    ))}
                                </TextField>
                              )}
                            />
                            {row.stock !== null ? (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Giacenza {formatQuantity(row.stock)}
                              </Typography>
                            ) : null}
                          </>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" disabled={index === 0} onClick={() => move(index, index - 1)}>
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={index === fields.length - 1}
                          onClick={() => move(index, index + 1)}
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                        <Tooltip title="Elimina riga">
                          <IconButton size="small" color="error" onClick={() => remove(index)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    {row.kitComponents.length ? (
                      <TableRow>
                        <TableCell />
                        <TableCell colSpan={columns - 1} sx={{ pt: 0 }}>
                          <Stack spacing={0.75} sx={{ pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                            {row.kitComponents.map((component, componentIndex) => (
                              <Stack
                                key={`${component.productCode}-${componentIndex}`}
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1}
                                sx={{ alignItems: { sm: 'center' } }}
                              >
                                <Typography variant="body2" sx={{ minWidth: 110 }}>
                                  {component.productCode}
                                </Typography>
                                <Typography variant="body2" sx={{ flexGrow: 1, color: 'text.secondary' }}>
                                  {component.description}
                                  {component.quantityPerKit
                                    ? ` · ${formatQuantity(component.quantityPerKit * (parseDecimal(row.quantity) ?? 0))} pz`
                                    : ''}
                                </Typography>
                                <Controller
                                  name={`rows.${index}.kitComponents.${componentIndex}.serialNumber`}
                                  control={control}
                                  render={({ field: input }) => (
                                    <TextField
                                      {...input}
                                      value={input.value ?? ''}
                                      size="small"
                                      label="S/N"
                                      sx={{ width: { sm: 200 } }}
                                    />
                                  )}
                                />
                              </Stack>
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
              {!fields.length ? (
                <TableRow>
                  <TableCell colSpan={columns}>
                    <Box sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
                      Nessuna riga: aggiungi un articolo, una nota o importa un documento.
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
          Le righe articolo con un magazzino movimentano la giacenza al salvataggio, come in Delphi.
          {withJob ? ' Con una commessa le quantità vanno nel lotto, quelle in economia fuori preventivo.' : ''}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DdtRowsCard;
