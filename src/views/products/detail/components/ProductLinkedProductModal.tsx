import { useState } from 'react';
import {
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
import {
  useAddProductLinkedProduct,
  useProductsAutocomplete,
  useUpdateProductLinkedProduct,
} from '~/proxies/aries-proxy/products';
import { Product, ProductLinkedProduct, ProductLinkedProductKind } from '~/types/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';

const KIND_LABEL: Record<ProductLinkedProductKind, string> = {
  'spare-parts': 'ricambio',
  equipment: 'attrezzatura',
};

interface ProductLinkedProductModalProps extends Omit<ModalProps, 'closeModal'> {
  productCode: string;
  kind: ProductLinkedProductKind;
  // Undefined = new row (the linked product can only be chosen on create).
  row?: ProductLinkedProduct;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
}

interface FormValues {
  product: Product | null;
  quantity: number | '';
  description: string;
}

const productLabel = (product: Product) =>
  [product.productCode, product.description].filter(Boolean).join(' - ') || product.productCode;

const ProductLinkedProductModal = (props: ProductLinkedProductModalProps) => {
  const { productCode, kind, row } = props;
  const snackbar = useSnackbar();
  const addMutation = useAddProductLinkedProduct();
  const updateMutation = useUpdateProductLinkedProduct();
  const pending = addMutation.isPending || updateMutation.isPending;
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounce(searchText, 400);
  const productsQuery = useProductsAutocomplete(debouncedSearch);

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { product: null, quantity: row?.quantity ?? 1, description: row?.description ?? '' },
  });

  const label = KIND_LABEL[kind];
  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    const data = {
      code: row?.code ?? values.product?.productCode ?? '',
      quantity: values.quantity === '' ? 0 : values.quantity,
      description: values.description,
    };
    try {
      if (row) await updateMutation.mutateAsync({ productCode, kind, code: row.code, data });
      else await addMutation.mutateAsync({ productCode, kind, data });
      snackbar.success(row ? 'Riga aggiornata' : 'Riga aggiunta');
      props.closeModal({ action: 'SAVED' });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, `Non è stato possibile salvare il ${label}`));
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>{row ? `Modifica ${label}` : `Nuovo ${label}`}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="product-linked-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          {row ? (
            <TextField
              label="Articolo"
              value={[row.code, row.productDescription].filter(Boolean).join(' - ')}
              disabled
              fullWidth
            />
          ) : (
            <Controller
              name="product"
              control={control}
              rules={{ validate: (value) => !!value || "L'articolo è obbligatorio" }}
              render={({ field, fieldState }) => (
                <Autocomplete
                  options={(productsQuery.data ?? []).filter((product) => product.productCode !== productCode)}
                  value={field.value}
                  loading={productsQuery.isFetching}
                  filterOptions={(options) => options}
                  getOptionLabel={productLabel}
                  isOptionEqualToValue={(option, value) => option.productCode === value.productCode}
                  onChange={(_event, value) => field.onChange(value)}
                  onInputChange={(_event, value, reason) => {
                    if (reason === 'input') setSearchText(value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Articolo"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? 'Codice, descrizione o barcode (almeno 2 caratteri)'}
                    />
                  )}
                />
              )}
            />
          )}
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Quantità"
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} label="Descrizione" />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={pending}>
          Annulla
        </Button>
        <Button type="submit" form="product-linked-form" variant="contained" disabled={pending}>
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductLinkedProductModal;
