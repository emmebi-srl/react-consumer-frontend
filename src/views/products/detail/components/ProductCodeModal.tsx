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
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useAddProductCode, useUpdateProductCode } from '~/proxies/aries-proxy/products';
import { useSuppliersSearch } from '~/proxies/aries-proxy/suppliers';
import { ProductCode } from '~/types/aries-proxy/products';
import { Supplier } from '~/types/aries-proxy/suppliers';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface ProductCodeModalProps extends Omit<ModalProps, 'closeModal'> {
  productCode: string;
  // Undefined = new code.
  code?: ProductCode;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
}

interface FormValues {
  code: string;
  supplier: Supplier | null;
}

const ProductCodeModal = (props: ProductCodeModalProps) => {
  const { productCode, code } = props;
  const snackbar = useSnackbar();
  const addMutation = useAddProductCode();
  const updateMutation = useUpdateProductCode();
  const [supplierSearch, setSupplierSearch] = useState('');
  const suppliersQuery = useSuppliersSearch(supplierSearch);
  const pending = addMutation.isPending || updateMutation.isPending;

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { code: code?.code ?? '', supplier: code?.supplier ?? null },
  });

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    const data = { code: values.code.trim(), supplierId: values.supplier?.id ?? null };
    try {
      if (code) await updateMutation.mutateAsync({ productCode, code: code.code, data });
      else await addMutation.mutateAsync({ productCode, data });
      snackbar.success(code ? 'Codice aggiornato' : 'Codice aggiunto');
      props.closeModal({ action: 'SAVED' });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare il codice'));
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>{code ? 'Modifica codice' : 'Nuovo codice alternativo'}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="product-code-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          <Controller
            name="code"
            control={control}
            rules={{ validate: (value) => value.trim() !== '' || 'Il codice è obbligatorio' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Codice"
                slotProps={{ htmlInput: { maxLength: 45 } }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="supplier"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={suppliersQuery.data ?? []}
                value={field.value}
                loading={suppliersQuery.isLoading}
                filterOptions={(options) => options}
                getOptionLabel={(option) => option.companyName ?? String(option.id)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_event, value) => field.onChange(value)}
                onInputChange={(_event, value, reason) => {
                  if (reason === 'input') setSupplierSearch(value);
                }}
                renderInput={(params) => <TextField {...params} label="Fornitore" />}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={pending}>
          Annulla
        </Button>
        <Button type="submit" form="product-code-form" variant="contained" disabled={pending}>
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCodeModal;
