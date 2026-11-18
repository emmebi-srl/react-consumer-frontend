import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useCustomersSearch } from '~/proxies/aries-proxy/customers';
import { useTicketCustomerMainContact, useTicketCustomerSystems } from '~/proxies/aries-proxy/tickets';
import { TicketCustomerOption, TicketFormValues } from '../ticketFormValues';

interface Props {
  disabled: boolean;
}

/** "Cliente" and "Impianto" boxes of the Delphi form: customer search, contacts, system of the customer. */
const TicketCustomerCard: React.FC<Props> = ({ disabled }) => {
  const { control, setValue, getValues } = useFormContext<TicketFormValues>();
  const customer = useWatch({ control, name: 'customer' });
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);

  const customersQuery = useCustomersSearch({ search: search || undefined, pageSize: 20 });
  const options = useMemo<TicketCustomerOption[]>(
    () =>
      (customersQuery.data?.pages.flatMap((page) => page.customers) ?? []).map((item) => ({
        id: item.id,
        name: item.companyName,
      })),
    [customersQuery.data],
  );
  const systemsQuery = useTicketCustomerSystems(customer?.id);
  const { data: contact } = useTicketCustomerMainContact(customer?.id);
  const systems = useMemo(() => systemsQuery.data ?? [], [systemsQuery.data]);

  // Like Delphi RefreshCustomerData: a customer just picked with a single system gets it at once. Only after a pick,
  // so opening a saved ticket without system doesn't change it.
  const [pickedCustomerId, setPickedCustomerId] = useState<number | null>(null);
  useEffect(() => {
    const single = systems.length === 1 ? systems[0] : undefined;
    if (disabled || !single || pickedCustomerId !== customer?.id || getValues('systemId') !== '') return;
    setValue('systemId', single.id, { shouldDirty: true });
  }, [disabled, systems, pickedCustomerId, customer, getValues, setValue]);

  const phones = [contact?.phone, contact?.mobilePhone].filter(Boolean).join(' · ');

  return (
    <Card variant="outlined">
      <CardHeader title="Cliente e impianto" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>
          <Controller
            name="customer"
            control={control}
            render={({ field }) => (
              <Autocomplete
                value={field.value}
                options={options}
                disabled={disabled}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterOptions={(items) => items}
                loading={customersQuery.isFetching}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') setSearchText(value);
                }}
                onChange={(_, value) => {
                  field.onChange(value);
                  setValue('systemId', '', { shouldDirty: true });
                  setPickedCustomerId(value?.id ?? null);
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Cod. {option.id}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} required label="Cliente" size="small" />}
              />
            )}
          />

          {customer ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Tel: {phones || '-'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
                Email: {contact?.email || '-'}
              </Typography>
            </Stack>
          ) : null}

          <Controller
            name="systemId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                size="small"
                label="Impianto"
                disabled={disabled || !customer}
                helperText={customer && !systemsQuery.isLoading && !systems.length ? 'Il cliente non ha impianti' : ' '}
              >
                <MenuItem value="">Nessun impianto</MenuItem>
                {systems.map((system) => (
                  <MenuItem key={system.id} value={system.id}>
                    {system.description || `Impianto ${system.id}`} ({system.id})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TicketCustomerCard;
