import { useMemo, useState } from 'react';
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  CallMerge,
  Delete,
  FileDownload,
  LinkOff,
  NoteAdd,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Menu,
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
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { getInvoiceProductDefaults, importInvoiceDocument } from '~/proxies/aries-proxy/api/invoices';
import { useInvoiceLookups } from '~/proxies/aries-proxy/invoices';
import { useMeasurementUnits, useProductsAutocomplete } from '~/proxies/aries-proxy/products';
import { InvoiceDocumentKey } from '~/types/aries-proxy/invoices';
import { Product } from '~/types/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { formatMoney, newMoney } from '~/utils/money';
import { useCustomerById } from '~/proxies/aries-proxy/customers';
import { RouteConfig } from '~/routes/routeConfig';
import { formatDestination, rowTaxableAmount } from '../../invoiceHelpers';
import {
  addDocuments,
  documentsInRows,
  emptyProductRow,
  groupRows,
  groupSystems,
  InvoiceFormValues,
  InvoiceRowValues,
  isAnyDocumentRow,
  isDocumentRow,
  isReportRow,
  isTextRow,
  newRowKey,
  noteRow,
  parseDecimal,
  removeDocument,
  rowDocument,
  sameDocument,
} from '../invoiceFormValues';
import InvoiceGroupDocumentsDialog, { GroupableDocument } from './InvoiceGroupDocumentsDialog';
import InvoiceImportDialog from './InvoiceImportDialog';

const DOCUMENT_LABELS: Record<InvoiceDocumentKey['type'], string> = {
  report: 'il rapporto',
  ddt: 'il DDT',
  report_group: 'il resoconto',
};

const toEuro = (amount: number) => formatMoney(newMoney(amount, 'EUR'));

const ROW_TYPE_LABELS: Record<string, string> = {
  N: 'Nota',
  '!': 'Rif. rapporto',
  '?': 'Rif. DDT',
  '(': 'Rif. resoconto',
  I: 'Impianto',
  '-': 'Da rapporto',
  '+': 'Da DDT',
  ':': 'Da resoconto',
  R: 'Raggruppamento',
};

const decimalInput = { htmlInput: { inputMode: 'decimal' as const, style: { textAlign: 'right' as const } } };

interface Props {
  showCosts: boolean;
}

/**
 * Body of the invoice, like the Delphi GridAssociatedDocuments: product rows, free rows and notes. Rows imported by
 * Delphi from reports and DDTs keep their type and reference. Extra costs (collection, stamp duty, transport) below.
 */
const InvoiceRowsCard: React.FC<Props> = ({ showCosts }) => {
  const { control, getValues, setValue } = useFormContext<InvoiceFormValues>();
  const modal = useModal();
  const snackbar = useSnackbar();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'rows', keyName: 'fieldKey' });
  const rows = useWatch({ control, name: 'rows' });
  const vatId = useWatch({ control, name: 'vatId' });
  const { data: lookups } = useInvoiceLookups();
  const { data: unitData } = useMeasurementUnits();
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);
  const productsQuery = useProductsAutocomplete(search);
  const [adding, setAdding] = useState(false);
  const customer = useWatch({ control, name: 'customer' });
  const documentsToAdd = useWatch({ control, name: 'documentsToAdd' });
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [groupMenu, setGroupMenu] = useState<HTMLElement | null>(null);
  const [groupSelectOpen, setGroupSelectOpen] = useState(false);
  const customerQuery = useCustomerById(customer?.id ?? 0, { includes: 'destinations' });
  const destinations = useMemo(() => customerQuery.data?.customers.at(0)?.destinations ?? [], [customerQuery.data]);

  const invoiceRate = useMemo(() => {
    const vat = lookups?.vatTypes.find((item) => item.id === vatId);
    return vat ? Math.round(vat.rate) : '';
  }, [lookups, vatId]);
  const rates = useMemo(
    () =>
      [
        ...new Set(
          (lookups?.vatTypes ?? []).filter((vat) => vat.inUse || vat.isDefault).map((vat) => Math.round(vat.rate)),
        ),
      ].sort((a, b) => a - b),
    [lookups],
  );

  const productsDiscount = () => {
    const discount = parseDecimal(getValues('productsDiscount')) ?? 0;
    return discount ? String(discount) : '';
  };

  const addProduct = async (product: Product | null) => {
    if (!product) return;
    setAdding(true);
    try {
      const defaults = (await getInvoiceProductDefaults(product.productCode, getValues('customer')?.id)).data;
      append({
        ...emptyProductRow(invoiceRate, productsDiscount()),
        key: newRowKey(),
        productCode: defaults.productCode,
        text: defaults.description ?? '',
        supplierCode: defaults.supplierCode ?? '',
        quantity: String(defaults.quantity),
        measureUnit: defaults.measureUnit ?? '',
        price: String(defaults.price),
        cost: String(defaults.cost),
      });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile aggiungere l'articolo."));
    } finally {
      setAdding(false);
      setSearchText('');
    }
  };

  /** E_scontExit: the discount of the header can be applied to every priced row. */
  const applyDiscount = async () => {
    const discount = parseDecimal(getValues('productsDiscount'));
    if (discount === null) return;
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: { title: 'Sconto', text: `Applicare lo sconto ${discount}% a tutte le righe?` },
    });
    if (answer.action !== 'YES') return;
    setValue(
      'rows',
      getValues('rows').map((row) => (isTextRow(row) ? row : { ...row, discount: String(discount) })),
      { shouldDirty: true },
    );
  };

  const setDocumentValues = (next: Pick<InvoiceFormValues, 'rows' | 'documentsToAdd' | 'documentsToRemove'>) => {
    setValue('rows', next.rows, { shouldDirty: true });
    setValue('documentsToAdd', next.documentsToAdd, { shouldDirty: true });
    setValue('documentsToRemove', next.documentsToRemove, { shouldDirty: true });
  };

  /** ImportReport / ImportDDT / ImportReportGroup: rows appended, DDT of a report offered, study types set if missing. */
  const importDocument = async (document: InvoiceDocumentKey, offerLinkedDdts = true) => {
    const values = getValues();
    const result = (
      await importInvoiceDocument({
        type: document.type,
        id: document.id,
        year: document.year,
        customerId: values.customer?.id ?? null,
        vatRate: invoiceRate === '' ? null : invoiceRate,
        productsDiscount: parseDecimal(values.productsDiscount) ?? 0,
      })
    ).data;

    // ImportDDT: a kit can take the extended description of the product (articolo_nota "GENERALE").
    const importedRows = [...result.rows];
    for (const kit of result.kitDescriptions) {
      const row = importedRows[kit.rowIndex];
      if (!row) continue;
      const answer = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: 'Articolo composto',
          text: `Utilizzare la descrizione estesa dell'articolo composto ${kit.description || kit.productCode}?`,
        },
      });
      if (answer.action === 'YES') importedRows[kit.rowIndex] = { ...row, description: kit.extendedDescription };
    }

    setDocumentValues(addDocuments(getValues(), importedRows, result.documents));
    if (getValues('interventionTypeId') === '' && result.interventionTypeId)
      setValue('interventionTypeId', result.interventionTypeId, { shouldDirty: true });
    if (getValues('systemTypeId') === '' && result.systemTypeId)
      setValue('systemTypeId', result.systemTypeId, { shouldDirty: true });
    result.warnings.forEach((warning) => snackbar.warning(warning));
    if (!offerLinkedDdts) return;
    for (const ddt of result.linkedDdts) {
      if (documentsInRows(getValues('rows')).some((item) => sameDocument(item, ddt))) continue;
      const answer = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: 'DDT del rapporto',
          text: `Importare anche il DDT ${ddt.id}/${ddt.year} associato al rapporto?`,
        },
      });
      if (answer.action === 'YES') await importDocument(ddt, false);
    }

    // ImportReport: "Nessun ddt associato al rapporto, vuoi inserirlo adesso?". The DDT editor opens in a new tab
    // with the customer and the report material, so the invoice being written is not lost.
    for (const report of result.reportsWithoutDdt) {
      const answer = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: 'DDT del rapporto',
          text: `Nessun DDT associato al rapporto ${report.id}/${report.year}: vuoi crearlo adesso?`,
          alertText: 'Il DDT si apre in una nuova scheda: salvalo, poi importalo qui con "Importa documenti".',
          alertSeverity: 'info',
        },
      });
      if (answer.action !== 'YES') continue;
      const query = new URLSearchParams({
        customerId: String(result.customerId),
        customerName: getValues('customer')?.name ?? '',
        reportId: String(report.id),
        reportYear: String(report.year),
      });
      window.open(`${RouteConfig.DdtNew.buildLink()}?${query.toString()}`, '_blank', 'noopener');
    }
  };

  const groupWith = async (matches: (row: InvoiceRowValues) => boolean, label: string, question: string) => {
    setGroupMenu(null);
    const grouped = groupRows(getValues('rows'), matches, label, invoiceRate);
    if (!grouped) {
      snackbar.info('Nessuna riga da raggruppare.');
      return;
    }
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Raggruppa',
        text: `${question} Le ${grouped.count} righe diventano una sola riga "${label}" con IVA ${invoiceRate}%.`,
        alertText: grouped.rates.some((rate) => rate !== invoiceRate)
          ? `Le righe hanno aliquote diverse (${grouped.rates.join('%, ')}%): il riepilogo IVA cambia.`
          : 'I documenti restano collegati alla fattura.',
        alertSeverity: grouped.rates.some((rate) => rate !== invoiceRate) ? 'warning' : 'info',
      },
    });
    if (answer.action === 'YES') setValue('rows', grouped.rows, { shouldDirty: true });
  };

  /** TFInvoiceEditor.Ragruppa: the system rows of the reports become one note. */
  const groupSystemRows = async () => {
    setGroupMenu(null);
    const grouped = groupSystems(getValues('rows'), (destinationId) =>
      formatDestination(destinations.find((destination) => String(destination.destinationId) === destinationId)),
    );
    if (!grouped) {
      snackbar.info('Servono almeno due righe impianto dello stesso impianto o della stessa destinazione.');
      return;
    }
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Raggruppa impianti',
        text:
          grouped.kind === 'system'
            ? 'Unico impianto, vuoi raggruppare le righe impianto in una nota in testa?'
            : 'Destinazione unica, vuoi sostituire le righe impianto con una nota con l’indirizzo?',
      },
    });
    if (answer.action === 'YES') setValue('rows', grouped.rows, { shouldDirty: true });
  };

  const groupableDocuments = (): GroupableDocument[] =>
    getValues('rows')
      .map((row) => ({ document: rowDocument(row), label: row.text }))
      .filter((item): item is GroupableDocument => !!item.document && item.document.type !== 'report_group');

  const onImport = async (document: InvoiceDocumentKey) => {
    setImporting(true);
    try {
      await importDocument(document);
      setImportOpen(false);
      snackbar.success('Documento importato: le righe sono in fondo, salva la fattura per collegarlo.');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile importare il documento.'));
    } finally {
      setImporting(false);
    }
  };

  /** RemoveReportDocument / RemoveDdtDocument: the document goes back to be invoiced on save. */
  const onRemoveDocument = async (document: InvoiceDocumentKey) => {
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Rimuovi documento',
        text: `Rimuovere ${DOCUMENT_LABELS[document.type]} ${document.id}/${document.year} e le sue righe dalla fattura?`,
      },
    });
    if (answer.action === 'YES') setDocumentValues(removeDocument(getValues(), document));
  };

  const columns = showCosts ? 11 : 10;

  return (
    <Card variant="outlined">
      <CardHeader title="Righe" titleTypographyProps={{ variant: 'subtitle1' }} />
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
          <Button startIcon={<Add />} onClick={() => append(emptyProductRow(invoiceRate, productsDiscount()))}>
            Riga libera
          </Button>
          <Button startIcon={<NoteAdd />} onClick={() => append(noteRow(''))}>
            Nota
          </Button>
          <Button
            startIcon={<FileDownload />}
            onClick={() =>
              customer ? setImportOpen(true) : snackbar.error('Indicare prima il cliente della fattura.')
            }
          >
            Importa documenti
          </Button>
          <Button startIcon={<CallMerge />} onClick={(event) => setGroupMenu(event.currentTarget)}>
            Raggruppa
          </Button>
          <Menu anchorEl={groupMenu} open={!!groupMenu} onClose={() => setGroupMenu(null)}>
            <MenuItem
              onClick={() =>
                void groupWith(isAnyDocumentRow, 'DOCUMENTI RAGGRUPPATI', 'Raggruppare tutte le righe dei documenti?')
              }
            >
              Raggruppa documenti
            </MenuItem>
            <MenuItem
              onClick={() =>
                void groupWith(isReportRow, 'RAPPORTI RAGGRUPPATI', 'Raggruppare tutte le righe dei rapporti?')
              }
            >
              Raggruppa rapporti
            </MenuItem>
            <MenuItem
              onClick={() => {
                setGroupMenu(null);
                setGroupSelectOpen(true);
              }}
            >
              Raggruppa documenti selezionati…
            </MenuItem>
            <MenuItem onClick={() => void groupSystemRows()}>Raggruppa impianti</MenuItem>
          </Menu>
        </Stack>

        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Table size="small" sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 120 }}>Codice</TableCell>
                <TableCell>Descrizione</TableCell>
                <TableCell sx={{ width: 90 }} align="right">
                  Q.tà
                </TableCell>
                <TableCell sx={{ width: 80 }}>U.M.</TableCell>
                <TableCell sx={{ width: 110 }} align="right">
                  Prezzo
                </TableCell>
                <TableCell sx={{ width: 80 }} align="right">
                  Sc. %
                </TableCell>
                <TableCell sx={{ width: 80 }}>IVA %</TableCell>
                {showCosts ? (
                  <TableCell sx={{ width: 100 }} align="right">
                    Costo
                  </TableCell>
                ) : null}
                <TableCell sx={{ width: 110 }} align="right">
                  Totale
                </TableCell>
                <TableCell sx={{ width: 120 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                      Nessuna riga: aggiungi un articolo, una riga libera o una nota.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {fields.map((field, index) => {
                const row = rows[index] ?? field;
                const text = isTextRow(row);
                const typeLabel = ROW_TYPE_LABELS[row.rowType];
                const reference =
                  row.referenceId && row.referenceYear ? ` ${row.referenceId}/${row.referenceYear}` : '';
                const total = rowTaxableAmount({
                  price: parseDecimal(row.price),
                  discount: parseDecimal(row.discount),
                  quantity: parseDecimal(row.quantity),
                });
                return (
                  <TableRow key={field.fieldKey} sx={text ? { bgcolor: 'grey.50' } : undefined}>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {row.productCode ? <Typography variant="body2">{row.productCode}</Typography> : null}
                        {typeLabel ? (
                          <Chip
                            size="small"
                            variant={text ? 'filled' : 'outlined'}
                            label={`${typeLabel}${reference}`}
                          />
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell colSpan={text ? (showCosts ? 8 : 7) : 1}>
                      <Controller
                        name={`rows.${index}.text`}
                        control={control}
                        render={({ field: input }) => (
                          <TextField
                            {...input}
                            size="small"
                            fullWidth
                            multiline
                            maxRows={8}
                            placeholder={text ? 'Testo della nota' : 'Descrizione'}
                            error={!input.value.trim()}
                          />
                        )}
                      />
                    </TableCell>
                    {text ? null : (
                      <>
                        <TableCell>
                          <Controller
                            name={`rows.${index}.quantity`}
                            control={control}
                            render={({ field: input }) => (
                              <TextField {...input} size="small" fullWidth slotProps={decimalInput} />
                            )}
                          />
                        </TableCell>
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
                        <TableCell>
                          <Controller
                            name={`rows.${index}.price`}
                            control={control}
                            render={({ field: input }) => (
                              <TextField {...input} size="small" fullWidth slotProps={decimalInput} />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`rows.${index}.discount`}
                            control={control}
                            render={({ field: input }) => (
                              <TextField {...input} size="small" fullWidth slotProps={decimalInput} />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`rows.${index}.vatRate`}
                            control={control}
                            render={({ field: input }) => (
                              <TextField
                                {...input}
                                onChange={(event) =>
                                  input.onChange(event.target.value === '' ? '' : Number(event.target.value))
                                }
                                select
                                size="small"
                                fullWidth
                                error={input.value === ''}
                              >
                                {input.value !== '' && !rates.includes(input.value) ? (
                                  <MenuItem value={input.value}>{input.value}</MenuItem>
                                ) : null}
                                {rates.map((rate) => (
                                  <MenuItem key={rate} value={rate}>
                                    {rate}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </TableCell>
                        {showCosts ? (
                          <TableCell>
                            <Controller
                              name={`rows.${index}.cost`}
                              control={control}
                              render={({ field: input }) => (
                                <TextField {...input} size="small" fullWidth slotProps={decimalInput} />
                              )}
                            />
                          </TableCell>
                        ) : null}
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {toEuro(total)}
                        </TableCell>
                      </>
                    )}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Sposta su">
                        <span>
                          <IconButton size="small" disabled={index === 0} onClick={() => move(index, index - 1)}>
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Sposta giù">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === fields.length - 1}
                            onClick={() => move(index, index + 1)}
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {rowDocument(row) ? (
                        <Tooltip title="Rimuovi il documento e le sue righe">
                          <IconButton
                            size="small"
                            onClick={() => void onRemoveDocument(rowDocument(row) as InvoiceDocumentKey)}
                          >
                            <LinkOff fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      <Tooltip title="Elimina riga">
                        <IconButton size="small" color="error" onClick={() => remove(index)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            mt: 2,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 180px)) auto' },
            alignItems: 'start',
          }}
        >
          <Controller
            name="collectionCost"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Spese incasso"
                helperText="Imponibile, IVA ordinaria"
                slotProps={decimalInput}
              />
            )}
          />
          <Controller
            name="stampDuty"
            control={control}
            render={({ field }) => (
              <TextField {...field} size="small" label="Bollo" helperText="Su IVA 0%" slotProps={decimalInput} />
            )}
          />
          <Controller
            name="transportCost"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Spese trasporto"
                helperText="Imponibile, IVA ordinaria"
                slotProps={decimalInput}
              />
            )}
          />
          <Controller
            name="productsDiscount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Sconto righe %"
                helperText="Proposto per le nuove righe"
                slotProps={decimalInput}
              />
            )}
          />
          <Button sx={{ alignSelf: 'center', justifySelf: 'start' }} onClick={() => void applyDiscount()}>
            Applica lo sconto a tutte le righe
          </Button>
        </Box>
        {groupSelectOpen ? (
          <InvoiceGroupDocumentsDialog
            documents={groupableDocuments()}
            onClose={() => setGroupSelectOpen(false)}
            onConfirm={(selected) => {
              setGroupSelectOpen(false);
              void groupWith(
                (row) => selected.some((document) => isDocumentRow(row, document)),
                'DOCUMENTI RAGGRUPPATI',
                'Raggruppare i documenti selezionati?',
              );
            }}
          />
        ) : null}
        {importOpen && customer ? (
          <InvoiceImportDialog
            customerId={customer.id}
            excluded={[...documentsInRows(rows), ...documentsToAdd]}
            importing={importing}
            onImport={(document) => void onImport(document)}
            onClose={() => setImportOpen(false)}
          />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default InvoiceRowsCard;
