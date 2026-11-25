import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { getInvoiceCustomerDefaults } from '~/proxies/aries-proxy/api/invoices';
import { useCustomerById, useCustomersSearch } from '~/proxies/aries-proxy/customers';
import { useInvoiceLookups } from '~/proxies/aries-proxy/invoices';
import { INVOICE_TYPE_CREDIT_NOTE } from '~/types/aries-proxy/invoices';
import { formatDestination } from '../../invoiceHelpers';
import { InvoiceCustomer, InvoiceFormValues, isTextRow, parseDecimal } from '../invoiceFormValues';

interface Props {
  isNew: boolean;
  /** Key of the saved invoice: a different number or year renumbers it. */
  year?: number;
  /** Date of the last invoice (yyyy-MM-dd): a new invoice of that year can't be dated before it. */
  lastInvoiceDate?: string;
}

/** Customer, destination, number and date, type, causal, payment, VAT, like the top of TFInvoiceEditor. */
const InvoiceHeaderCard: React.FC<Props> = ({ isNew, year, lastInvoiceDate }) => {
  const { control, setValue, getValues } = useFormContext<InvoiceFormValues>();
  const modal = useModal();
  const snackbar = useSnackbar();
  const customer = useWatch({ control, name: 'customer' });
  const isPreinvoice = useWatch({ control, name: 'isPreinvoice' });
  const invoiceDate = useWatch({ control, name: 'invoiceDate' });
  const vatId = useWatch({ control, name: 'vatId' });
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);
  const customersQuery = useCustomersSearch({ search: search || undefined, pageSize: 20 });
  const customerQuery = useCustomerById(customer?.id ?? 0, { includes: 'destinations' });
  const { data: lookups } = useInvoiceLookups();

  const options = useMemo<InvoiceCustomer[]>(
    () =>
      (customersQuery.data?.pages.flatMap((page) => page.customers) ?? []).map((item) => ({
        id: item.id,
        name: item.companyName,
      })),
    [customersQuery.data],
  );
  const destinations = useMemo(() => customerQuery.data?.customers.at(0)?.destinations ?? [], [customerQuery.data]);
  const vatTypes = useMemo(
    () => (lookups?.vatTypes ?? []).filter((vat) => vat.inUse || vat.isDefault || vat.id === vatId),
    [lookups, vatId],
  );
  const selectedVat = lookups?.vatTypes.find((vat) => vat.id === vatId);
  const needsNature = !!selectedVat && Math.round(selectedVat.rate) === 0;

  // A destination no longer of the customer is cleared, the main one is proposed.
  useEffect(() => {
    if (!customer || !destinations.length) return;
    const current = getValues('destinationId');
    if (current !== '' && destinations.some((destination) => destination.destinationId === current)) return;
    const main = destinations.find((destination) => destination.mainDestination) ?? destinations[0];
    setValue('destinationId', main?.destinationId ?? '', { shouldDirty: true });
  }, [customer, destinations, getValues, setValue]);

  /** TFInvoiceEditor.Cli: payment condition and VAT of the customer, brand discounts as a warning. */
  const applyCustomer = async (value: InvoiceCustomer | null) => {
    setValue('customer', value, { shouldDirty: true });
    setValue('destinationId', '', { shouldDirty: true });
    if (!value) return;
    try {
      const defaults = (await getInvoiceCustomerDefaults(value.id, getValues('invoiceDate'))).data;
      if (defaults.paymentConditionId)
        setValue('paymentConditionId', defaults.paymentConditionId, { shouldDirty: true });
      if (defaults.vatId && lookups?.vatTypes.some((vat) => vat.id === defaults.vatId))
        setValue('vatId', defaults.vatId, { shouldDirty: true });
      if (defaults.brandDiscounts.length)
        snackbar.warning(`Attenzione, il cliente ha i seguenti sconti: ${defaults.brandDiscounts.join(', ')}`);
    } catch {
      // Only suggestions: the invoice can still be filled by hand.
    }
  };

  /** DbIvaCloseUp: the new rate can be applied to every row. */
  const changeVat = async (newVatId: number | '') => {
    setValue('vatId', newVatId, { shouldDirty: true });
    const vat = lookups?.vatTypes.find((item) => item.id === newVatId);
    if (!vat) return;
    if (vat.rate !== 0) setValue('vatNatureTypeId', '', { shouldDirty: true });
    const rows = getValues('rows');
    if (rows.some((row) => !isTextRow(row))) {
      const answer = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: 'Cambia IVA',
          text: `Applicare l'IVA ${vat.name ?? `${vat.rate}%`} a tutte le righe?`,
          alertText: isNew ? undefined : 'Controlla eventuali note IVA da rimuovere dal corpo fattura.',
          alertSeverity: 'warning',
        },
      });
      if (answer.action === 'YES') {
        setValue(
          'rows',
          rows.map((row) => (isTextRow(row) ? row : { ...row, vatRate: Math.round(vat.rate) })),
          { shouldDirty: true },
        );
      }
    }
    if (vat.message?.trim()) snackbar.info(vat.message);
  };

  /** CmbBoxInvoiceTypeCloseUp: a credit note can turn the prices negative; the depot flag follows the type. */
  const changeType = async (newTypeId: number | '') => {
    setValue('typeId', newTypeId, { shouldDirty: true });
    const type = lookups?.types.find((item) => item.id === newTypeId);
    if (!type) return;
    setValue('shouldMoveDepot', type.shouldMoveDepot, { shouldDirty: true });
    if (type.id !== INVOICE_TYPE_CREDIT_NOTE) return;
    const rows = getValues('rows');
    if (!rows.some((row) => (parseDecimal(row.price) ?? 0) > 0)) return;
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: { title: 'Nota di accredito', text: "Cambiare il segno dell'importo delle righe (prezzi negativi)?" },
    });
    if (answer.action !== 'YES') return;
    setValue(
      'rows',
      rows.map((row) => {
        const price = parseDecimal(row.price) ?? 0;
        return price > 0 ? { ...row, price: String(-price) } : row;
      }),
      { shouldDirty: true },
    );
  };

  const dateWarning = (() => {
    if (!invoiceDate) return undefined;
    if (!isNew && !isPreinvoice && year && !invoiceDate.startsWith(String(year)))
      return `La fattura passa dal ${year} al ${invoiceDate.slice(0, 4)}`;
    if (
      isNew &&
      !isPreinvoice &&
      lastInvoiceDate &&
      invoiceDate < lastInvoiceDate &&
      invoiceDate.slice(0, 4) === lastInvoiceDate.slice(0, 4)
    )
      return `Precede l'ultima fattura (${lastInvoiceDate.split('-').reverse().join('/')})`;
    return undefined;
  })();

  return (
    <Card variant="outlined">
      <CardHeader title="Intestazione" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-start' } }}>
            {isNew ? (
              <Controller
                name="isPreinvoice"
                control={control}
                render={({ field }) => (
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={field.value ? 'preinvoice' : 'invoice'}
                    onChange={(_, value: string | null) => value && field.onChange(value === 'preinvoice')}
                  >
                    <ToggleButton value="invoice">Fattura</ToggleButton>
                    <ToggleButton value="preinvoice">Prefattura</ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            ) : null}
            <Controller
              name="customer"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  value={field.value}
                  options={options}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterOptions={(items) => items}
                  loading={customersQuery.isFetching}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input') setSearchText(value);
                  }}
                  onChange={(_, value) => void applyCustomer(value)}
                  sx={{ flexGrow: 1, minWidth: 260 }}
                  renderInput={(params) => <TextField {...params} required label="Cliente" size="small" />}
                />
              )}
            />
            <Controller
              name="invoiceNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label={isPreinvoice ? 'Prefattura nr.' : 'Fattura nr.'}
                  required={!isNew}
                  helperText={isNew ? 'Vuoto: prossimo numero' : 'Cambiandolo la fattura viene rinumerata'}
                  sx={{ width: 150 }}
                  slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                />
              )}
            />
            <Controller
              name="invoiceDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  type="date"
                  size="small"
                  label="Data"
                  helperText={dateWarning}
                  error={!!dateWarning && isNew}
                  sx={{ width: 170 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Stack>

          {customerQuery.data?.customers.at(0)?.isInsolvent ? (
            <Alert severity="error">Attenzione: il cliente è segnato come insolvente.</Alert>
          ) : null}

          <Controller
            name="destinationId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select required size="small" label="Destinazione" disabled={!customer}>
                {destinations.map((destination) => (
                  <MenuItem key={destination.destinationId} value={destination.destinationId}>
                    {formatDestination(destination) || `Destinazione ${destination.destinationId}`}
                    {destination.mainDestination ? ' (principale)' : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="typeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(event) => void changeType(event.target.value === '' ? '' : Number(event.target.value))}
                  select
                  required
                  size="small"
                  label="Tipo documento"
                  sx={{ flexGrow: 1, minWidth: 220 }}
                >
                  {(lookups?.types ?? []).map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name} {type.eInvoiceType ? `(${type.eInvoiceType})` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="causalId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select required size="small" label="Causale" sx={{ minWidth: 220 }}>
                  {(lookups?.causals ?? []).map((causal) => (
                    <MenuItem key={causal.id} value={causal.id}>
                      {causal.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="paymentConditionId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Condizione di pagamento"
                  sx={{ flexGrow: 1, minWidth: 220 }}
                >
                  {(lookups?.paymentConditions ?? []).map((condition) => (
                    <MenuItem key={condition.id} value={condition.id}>
                      {condition.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="vatId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(event) => void changeVat(event.target.value === '' ? '' : Number(event.target.value))}
                  select
                  required
                  size="small"
                  label="IVA"
                  sx={{ minWidth: 200 }}
                >
                  {vatTypes.map((vat) => (
                    <MenuItem key={vat.id} value={vat.id}>
                      {vat.name ?? `${vat.rate}%`}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="vatNatureTypeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Natura IVA"
                  required={needsNature}
                  disabled={!needsNature}
                  helperText={needsNature ? 'Obbligatoria con IVA 0% per la fattura elettronica' : undefined}
                  sx={{ flexGrow: 1, minWidth: 260 }}
                >
                  <MenuItem value="">Nessuna</MenuItem>
                  {(lookups?.vatNatureTypes ?? [])
                    .filter((nature) => nature.isEnabled || nature.id === field.value)
                    .map((nature) => (
                      <MenuItem key={nature.id} value={nature.id}>
                        {nature.eInvoiceCode} - {nature.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
            <Controller
              name="receptionDocumentId"
              control={control}
              render={({ field }) => (
                <TextField {...field} size="small" label="Id documento ricezione" sx={{ minWidth: 200 }} />
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <Controller
              name="interventionTypeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Tipo intervento (studi di settore)"
                  sx={{ minWidth: 260 }}
                >
                  <MenuItem value="">Nessuno</MenuItem>
                  {(lookups?.interventionTypes ?? []).map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="systemTypeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Tipo impianto (studi di settore)"
                  sx={{ minWidth: 260 }}
                >
                  <MenuItem value="">Nessuno</MenuItem>
                  {(lookups?.systemTypes ?? []).map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="isSubcontract"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                  }
                  label="Subappalto"
                />
              )}
            />
            <Controller
              name="shouldMoveDepot"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                  }
                  label="Movimenta magazzino"
                />
              )}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default InvoiceHeaderCard;
