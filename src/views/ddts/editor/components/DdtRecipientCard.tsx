import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useCustomerById, useCustomerPaymentConditions, useCustomersSearch } from '~/proxies/aries-proxy/customers';
import { useDdtCustomerSystems, useDeliveryMethods, useSupplierDestinations } from '~/proxies/aries-proxy/ddts';
import { useSuppliersSearch } from '~/proxies/aries-proxy/suppliers';
import { DdtDestination } from '~/types/aries-proxy/ddts';
import { DdtFormValues, DdtRecipient } from '../ddtFormValues';

const formatDestination = (destination: DdtDestination) => {
  const street = [destination.street, destination.houseNumber ? String(destination.houseNumber) : null]
    .filter(Boolean)
    .join(' ');
  const place = [destination.postalCode, destination.municipality].filter(Boolean).join(' ');
  return [street, place, destination.province ? `(${destination.province})` : null].filter(Boolean).join(' - ');
};

interface Props {
  isNew: boolean;
  /** The year of an existing DDT: the date must stay in it. */
  year?: number;
}

/** Top of the Delphi editor: customer or supplier, destination, system, payment, porto, number and date. */
const DdtRecipientCard: React.FC<Props> = ({ isNew, year }) => {
  const { control, setValue, getValues } = useFormContext<DdtFormValues>();
  const isCustomer = useWatch({ control, name: 'isCustomer' });
  const recipient = useWatch({ control, name: 'recipient' });
  const documentDate = useWatch({ control, name: 'documentDate' });
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);

  const customersQuery = useCustomersSearch({ search: search || undefined, pageSize: 20 });
  const suppliersQuery = useSuppliersSearch(search);
  const options = useMemo<DdtRecipient[]>(() => {
    if (isCustomer) {
      return (customersQuery.data?.pages.flatMap((page) => page.customers) ?? []).map((customer) => ({
        id: customer.id,
        name: customer.companyName,
      }));
    }
    return (suppliersQuery.data ?? []).map((supplier) => ({
      id: supplier.id,
      name: supplier.companyName ?? `Fornitore ${supplier.id}`,
    }));
  }, [isCustomer, customersQuery.data, suppliersQuery.data]);

  const customerQuery = useCustomerById(isCustomer && recipient ? recipient.id : 0, { includes: 'destinations' });
  const supplierDestinationsQuery = useSupplierDestinations(!isCustomer ? recipient?.id : null);
  const systemsQuery = useDdtCustomerSystems(isCustomer ? recipient?.id : null);
  const { data: paymentConditionsData } = useCustomerPaymentConditions();
  const { data: deliveryMethodsData } = useDeliveryMethods();

  const customer = customerQuery.data?.customers.at(0);
  const destinations: DdtDestination[] = useMemo(
    () => (isCustomer ? (customer?.destinations ?? []) : (supplierDestinationsQuery.data ?? [])),
    [isCustomer, customer, supplierDestinationsQuery.data],
  );

  // A new recipient proposes its main destination and, for customers, its payment condition, like ReloadCustomer.
  useEffect(() => {
    if (!recipient || !destinations.length) return;
    const current = getValues('destinationId');
    if (current !== '' && destinations.some((destination) => destination.destinationId === current)) return;
    const main =
      destinations.find((destination) => destination.mainDestination || destination.isMain) ?? destinations[0];
    setValue('destinationId', main?.destinationId ?? '', { shouldDirty: true });
  }, [recipient, destinations, getValues, setValue]);

  useEffect(() => {
    if (isNew && customer?.paymentConditionId && getValues('paymentConditionId') === '') {
      setValue('paymentConditionId', customer.paymentConditionId, { shouldDirty: true });
    }
  }, [isNew, customer, getValues, setValue]);

  return (
    <Card variant="outlined">
      <CardHeader title="Intestazione" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-start' } }}>
            <Controller
              name="isCustomer"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={field.value ? 'customer' : 'supplier'}
                  onChange={(_, value: string | null) => {
                    if (!value) return;
                    field.onChange(value === 'customer');
                    setValue('recipient', null, { shouldDirty: true });
                    setValue('destinationId', '', { shouldDirty: true });
                    setValue('systemId', '', { shouldDirty: true });
                    // The job belongs to the customer.
                    setValue('jobLink', null, { shouldDirty: true });
                  }}
                >
                  <ToggleButton value="customer">Cliente</ToggleButton>
                  <ToggleButton value="supplier">Fornitore</ToggleButton>
                </ToggleButtonGroup>
              )}
            />
            <Controller
              name="recipient"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  value={field.value}
                  options={options}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterOptions={(items) => items}
                  loading={isCustomer ? customersQuery.isFetching : suppliersQuery.isFetching}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input') setSearchText(value);
                  }}
                  onChange={(_, value) => {
                    field.onChange(value);
                    setValue('destinationId', '', { shouldDirty: true });
                    setValue('systemId', '', { shouldDirty: true });
                    // The job belongs to the customer.
                    setValue('jobLink', null, { shouldDirty: true });
                    if (isNew) setValue('paymentConditionId', '', { shouldDirty: true });
                  }}
                  sx={{ flexGrow: 1, minWidth: 260 }}
                  renderInput={(params) => (
                    <TextField {...params} required label={isCustomer ? 'Cliente' : 'Fornitore'} size="small" />
                  )}
                />
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="destinationId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  required
                  size="small"
                  label="Destinazione"
                  disabled={!recipient}
                  sx={{ flexGrow: 1, minWidth: 260 }}
                >
                  {destinations.map((destination) => (
                    <MenuItem key={destination.destinationId} value={destination.destinationId}>
                      {formatDestination(destination) || `Destinazione ${destination.destinationId}`}
                      {destination.mainDestination || destination.isMain ? ' (principale)' : ''}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {isCustomer ? (
              <Controller
                name="systemId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    size="small"
                    label="Impianto"
                    disabled={!recipient}
                    sx={{ minWidth: 240 }}
                  >
                    <MenuItem value="">Nessun impianto</MenuItem>
                    {(systemsQuery.data ?? []).map((system) => (
                      <MenuItem key={system.id} value={system.id}>
                        {system.description || `Impianto ${system.id}`}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            ) : null}
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                  <MenuItem value="">Nessuna</MenuItem>
                  {(paymentConditionsData?.paymentConditions ?? []).map((condition) => (
                    <MenuItem key={condition.id} value={condition.id}>
                      {condition.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="deliveryMethodId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select size="small" label="Porto resa" sx={{ minWidth: 180 }}>
                  <MenuItem value="">Nessuno</MenuItem>
                  {(deliveryMethodsData?.deliveryMethods ?? []).map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="ddtNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="DDT nr."
                  required={!isNew}
                  helperText={isNew ? 'Vuoto: numero automatico' : 'Cambiandolo il DDT viene rinumerato'}
                  sx={{ width: 140 }}
                  slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                />
              )}
            />
            <Controller
              name="documentDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  type="date"
                  size="small"
                  label="Data documento"
                  helperText={
                    !isNew && year && !documentDate.startsWith(String(year))
                      ? `Il DDT passa dal ${year} al ${documentDate.slice(0, 4)}`
                      : undefined
                  }
                  sx={{ width: 170 }}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              )}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DdtRecipientCard;
