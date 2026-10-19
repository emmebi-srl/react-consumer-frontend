import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useAddProductNote, useUpdateProductNote } from '~/proxies/aries-proxy/products';
import { ProductNote } from '~/types/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { decodeRtf, encodeRtfText } from '~/utils/rtf-utils';

interface ProductNoteModalProps extends Omit<ModalProps, 'closeModal'> {
  productCode: string;
  // Undefined = new note.
  note?: ProductNote;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
}

interface FormValues {
  description: string;
  text: string;
}

const ProductNoteModal = (props: ProductNoteModalProps) => {
  const { productCode, note } = props;
  const snackbar = useSnackbar();
  const addMutation = useAddProductNote();
  const updateMutation = useUpdateProductNote();
  const pending = addMutation.isPending || updateMutation.isPending;

  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
  } = useForm<FormValues>({
    defaultValues: { description: note?.description ?? '', text: decodeRtf(note?.note) },
  });

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    // Re-encode the RTF only if the text changed, to keep the original Delphi formatting.
    const data = {
      description: values.description.trim(),
      note: note && !dirtyFields.text ? (note.note ?? '') : encodeRtfText(values.text),
    };
    try {
      if (note) await updateMutation.mutateAsync({ productCode, description: note.description, data });
      else await addMutation.mutateAsync({ productCode, data });
      snackbar.success(note ? 'Nota aggiornata' : 'Nota aggiunta');
      props.closeModal({ action: 'SAVED' });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare la nota'));
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="md" fullWidth>
      <DialogTitle>{note ? 'Modifica nota' : 'Nuova nota'}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="product-note-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          <Controller
            name="description"
            control={control}
            rules={{ validate: (value) => value.trim() !== '' || 'La descrizione è obbligatoria' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Descrizione"
                slotProps={{ htmlInput: { maxLength: 40 } }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="text"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth multiline minRows={8} label="Nota" />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={pending}>
          Annulla
        </Button>
        <Button type="submit" form="product-note-form" variant="contained" disabled={pending}>
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductNoteModal;
