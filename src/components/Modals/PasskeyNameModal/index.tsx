import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { ModalProps } from '~/modals/Modal';

interface PasskeyNameModalProps extends ModalProps {
  title: string;
  text?: string;
  initialName: string;
  confirmLabel: string;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'CONFIRM'; name: string }) => void;
}

// utente_passkey.nome is VARCHAR(100).
const FormSchema = z.object({
  name: z.string().trim().min(1, 'Nome obbligatorio').max(100, 'Massimo 100 caratteri'),
});

type FormValues = z.infer<typeof FormSchema>;

/** Asks the name of a passkey (e.g. "iPhone di Mario"), before creating it or to rename it. */
const PasskeyNameModal = (props: PasskeyNameModalProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: props.initialName },
  });

  const close = () => props.closeModal({ action: 'CLOSE' });
  const submit = form.handleSubmit((values) => props.closeModal({ action: 'CONFIRM', name: values.name }));

  return (
    <Dialog open onClose={close} maxWidth="xs" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
          {props.text ? <DialogContentText sx={{ mb: 2 }}>{props.text}</DialogContentText> : null}
          <TextField
            {...form.register('name')}
            label="Nome"
            autoFocus
            fullWidth
            size="small"
            error={!!form.formState.errors.name}
            helperText={form.formState.errors.name?.message ?? 'Per riconoscerla nella lista, es. "iPhone di Mario"'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Annulla</Button>
          <Button type="submit" variant="contained">
            {props.confirmLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PasskeyNameModal;
