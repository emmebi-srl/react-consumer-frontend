import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import {
  useAddProductOperation,
  useProductOperationTypes,
  useUpdateProductOperation,
} from '~/proxies/aries-proxy/products';
import { ProductOperation } from '~/types/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface ProductOperationModalProps extends Omit<ModalProps, 'closeModal'> {
  productCode: string;
  // Undefined = new operation (the operation can only be chosen on create).
  operation?: ProductOperation;
  // Already linked operations, hidden from the options.
  linkedIds: number[];
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
}

interface FormValues {
  operationId: number | '';
  description: string;
}

const ProductOperationModal = (props: ProductOperationModalProps) => {
  const { productCode, operation, linkedIds } = props;
  const snackbar = useSnackbar();
  const typesQuery = useProductOperationTypes();
  const addMutation = useAddProductOperation();
  const updateMutation = useUpdateProductOperation();
  const pending = addMutation.isPending || updateMutation.isPending;

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { operationId: operation?.operationId ?? '', description: operation?.description ?? '' },
  });

  const options = (typesQuery.data?.operationTypes ?? []).filter((type) => !linkedIds.includes(type.id));
  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    if (values.operationId === '') return;
    const data = { operationId: values.operationId, description: values.description };
    try {
      if (operation) await updateMutation.mutateAsync({ productCode, operationId: operation.operationId, data });
      else await addMutation.mutateAsync({ productCode, data });
      snackbar.success(operation ? 'Operazione aggiornata' : 'Operazione aggiunta');
      props.closeModal({ action: 'SAVED' });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile salvare l'operazione"));
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>{operation ? 'Modifica operazione' : 'Nuova operazione'}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="product-operation-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          {operation ? (
            <TextField label="Operazione" value={operation.name ?? operation.operationId} disabled fullWidth />
          ) : (
            <Controller
              name="operationId"
              control={control}
              rules={{ validate: (value) => value !== '' || "L'operazione è obbligatoria" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  required
                  fullWidth
                  label="Operazione"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  {options.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
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
        <Button type="submit" form="product-operation-form" variant="contained" disabled={pending}>
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductOperationModal;
