import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useRenameProduct } from '~/proxies/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface ProductRenameModalProps extends Omit<ModalProps, 'closeModal'> {
  productCode: string;
  hasUnsavedChanges: boolean;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'RENAMED'; newCode: string }) => void;
}

interface FormValues {
  newCode: string;
}

// articolo.Codice_articolo is varchar(11).
const PRODUCT_CODE_MAX_LENGTH = 11;

const ProductRenameModal = (props: ProductRenameModalProps) => {
  const { productCode, hasUnsavedChanges } = props;
  const snackbar = useSnackbar();
  const renameMutation = useRenameProduct();

  const { control, handleSubmit } = useForm<FormValues>({ defaultValues: { newCode: productCode } });
  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    const newCode = values.newCode.trim();
    if (newCode === productCode) {
      close();
      return;
    }
    try {
      const renamed = (await renameMutation.mutateAsync({ productCode, newCode })).products.at(0);
      snackbar.success(`Codice cambiato in ${renamed?.productCode ?? newCode}`);
      props.closeModal({ action: 'RENAMED', newCode: renamed?.productCode ?? newCode });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile cambiare il codice'));
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Cambia codice articolo</DialogTitle>
      <DialogContent>
        <Stack component="form" id="product-rename-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          <Alert severity="info">
            Il nuovo codice viene propagato a listini, note, ricambi, documenti collegati e a tutti i dati che usano
            l&apos;articolo; vengono spostate anche la cartella documenti e l&apos;immagine.
          </Alert>
          {hasUnsavedChanges && <Alert severity="warning">Le modifiche non salvate del form andranno perse.</Alert>}
          <Controller
            name="newCode"
            control={control}
            rules={{ validate: (value) => value.trim() !== '' || 'Il codice è obbligatorio' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Nuovo codice"
                slotProps={{ htmlInput: { maxLength: PRODUCT_CODE_MAX_LENGTH } }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={renameMutation.isPending}>
          Annulla
        </Button>
        <Button type="submit" form="product-rename-form" variant="contained" disabled={renameMutation.isPending}>
          Cambia codice
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductRenameModal;
