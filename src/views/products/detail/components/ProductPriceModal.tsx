import { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { usePriceListsSearch, useSaveProductPrices } from '~/proxies/aries-proxy/products';
import { ProductPriceListEntry } from '~/types/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';

const ENTRY_TYPE_LABEL = { internal: 'Interno', supplier: 'Fornitore', brand: 'Marca' } as const;

interface ProductPriceModalProps extends Omit<ModalProps, 'closeModal'> {
  productCode: string;
  // Undefined = add a supplier / brand price list to the product.
  entry?: ProductPriceListEntry;
  // Price lists already shown for the product, hidden from the options.
  existingEntries: ProductPriceListEntry[];
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
}

interface FormValues {
  price: number | '';
  cost: number | '';
  lastPrice: number | '';
}

const toNullable = (value: number | '') => (value === '' ? null : value);

// Delphi gestListino: price / net cost / last purchase of one price list. Brand lists only have a price.
const ProductPriceModal = (props: ProductPriceModalProps) => {
  const { productCode, entry, existingEntries } = props;
  const snackbar = useSnackbar();
  const saveMutation = useSaveProductPrices();
  const [selected, setSelected] = useState<ProductPriceListEntry | null>(entry ?? null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounce(searchText, 400);
  const priceListsQuery = usePriceListsSearch(debouncedSearch);

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { price: entry?.price ?? '', cost: entry?.cost ?? '', lastPrice: entry?.lastPrice ?? '' },
  });

  const isBrand = selected?.type === 'brand';
  const options = (priceListsQuery.data ?? []).filter(
    (option) =>
      !existingEntries.some((existing) => existing.type === option.type && existing.priceListId === option.priceListId),
  );
  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    if (!selected) return;
    try {
      await saveMutation.mutateAsync({
        productCode,
        data: {
          type: selected.type,
          priceListId: selected.priceListId ?? null,
          price: toNullable(values.price),
          cost: isBrand ? null : toNullable(values.cost),
          lastPrice: isBrand ? null : toNullable(values.lastPrice),
        },
      });
      snackbar.success('Prezzi aggiornati');
      props.closeModal({ action: 'SAVED' });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare i prezzi'));
    }
  });

  const amountField = (name: keyof FormValues, label: string) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type="number"
          label={label}
          fullWidth
          slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      )}
    />
  );

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>{entry ? `Prezzi ${entry.name}` : 'Aggiungi listino'}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="product-price-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          {entry ? (
            <TextField label="Listino" value={`${entry.name} (${ENTRY_TYPE_LABEL[entry.type]})`} disabled fullWidth />
          ) : (
            <Autocomplete
              options={options}
              value={selected}
              loading={priceListsQuery.isFetching}
              filterOptions={(list) => list}
              groupBy={(option) => ENTRY_TYPE_LABEL[option.type]}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) =>
                option.type === value.type && option.priceListId === value.priceListId
              }
              onChange={(_event, value) => setSelected(value)}
              onInputChange={(_event, value, reason) => {
                if (reason === 'input') setSearchText(value);
              }}
              renderInput={(params) => <TextField {...params} required label="Listino fornitore o marca" />}
            />
          )}
          {isBrand && <Alert severity="info">I listini marca hanno solo il prezzo.</Alert>}
          <Stack direction="row" spacing={2}>
            {amountField('price', 'Prezzo')}
            {!isBrand && amountField('cost', 'Costo (netto)')}
            {!isBrand && amountField('lastPrice', 'Ultimo acquisto')}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={saveMutation.isPending}>
          Annulla
        </Button>
        <Button
          type="submit"
          form="product-price-form"
          variant="contained"
          disabled={!selected || saveMutation.isPending}
        >
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductPriceModal;
