import { useState } from 'react';
import { AccountBalance } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import useSnackbar from '~/hooks/useSnackbar';
import { useInvoiceBanks, useInvoiceEditorDefaults } from '~/proxies/aries-proxy/invoices';
import { BankBranch } from '~/types/aries-proxy/invoices';
import { InvoiceBankValues, InvoiceFormValues } from '../invoiceFormValues';

const toBankValues = (bank: BankBranch): InvoiceBankValues => ({
  id: bank.id,
  name: bank.name ?? '',
  abi: bank.abi ?? '',
  cab: bank.cab ?? '',
});

/**
 * Bank of the payment, like the bank box of TFInvoiceEditor: any branch (customer bank) or, with "nostre banche",
 * one of the company banks with its iban. "Banca aziendale" sets the bank of the company settings.
 */
const InvoiceBankCard: React.FC = () => {
  const { control, setValue } = useFormContext<InvoiceFormValues>();
  const snackbar = useSnackbar();
  const isOurBank = useWatch({ control, name: 'isOurBank' });
  const [searchText, setSearchText] = useState('');
  const [search] = useDebounce(searchText, 300);
  const banksQuery = useInvoiceBanks(search, isOurBank);
  const defaultsQuery = useInvoiceEditorDefaults();

  const useCompanyBank = () => {
    const bank = defaultsQuery.data?.companyBank;
    if (!bank) {
      snackbar.warning('Nessuna banca nella configurazione azienda.');
      return;
    }
    setValue('bank', toBankValues(bank), { shouldDirty: true });
    setValue('iban', bank.iban ?? '', { shouldDirty: true });
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Banca d'appoggio"
        titleTypographyProps={{ variant: 'subtitle1' }}
        action={
          <Button size="small" startIcon={<AccountBalance />} onClick={useCompanyBank}>
            Banca aziendale
          </Button>
        }
      />
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-start' } }}>
          <Controller
            name="isOurBank"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.checked);
                      setSearchText('');
                    }}
                  />
                }
                label="Nostre banche"
              />
            )}
          />
          <Controller
            name="bank"
            control={control}
            render={({ field }) => (
              <Autocomplete<InvoiceBankValues>
                value={field.value}
                options={(banksQuery.data ?? []).map(toBankValues)}
                getOptionLabel={(option) => option.name || `Filiale ${option.id}`}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Stack>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ABI {option.abi || '-'} · CAB {option.cab || '-'}
                      </Typography>
                    </Stack>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterOptions={(items) => items}
                loading={banksQuery.isFetching}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') setSearchText(value);
                }}
                onChange={(_, value) => {
                  field.onChange(value);
                  const iban = value ? (banksQuery.data ?? []).find((bank) => bank.id === value.id)?.iban : '';
                  setValue('iban', iban ?? '', { shouldDirty: true });
                }}
                sx={{ flexGrow: 1, minWidth: 260 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Banca"
                    placeholder="Non conosciuta"
                    helperText={
                      field.value ? `ABI ${field.value.abi || '-'} · CAB ${field.value.cab || '-'}` : undefined
                    }
                  />
                )}
              />
            )}
          />
          <Controller
            name="iban"
            control={control}
            render={({ field }) => <TextField {...field} size="small" label="IBAN" sx={{ minWidth: 300 }} />}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default InvoiceBankCard;
