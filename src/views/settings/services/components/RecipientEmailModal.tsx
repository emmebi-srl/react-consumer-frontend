import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { ModalProps } from '~/modals/Modal';

const RecipientSchema = z.object({
  email: z.string().trim().max(50, 'Massimo 50 caratteri').pipe(z.email('Indirizzo email non valido')),
});

type RecipientFormValues = z.infer<typeof RecipientSchema>;

interface RecipientEmailModalProps extends ModalProps {
  title: string;
  email: string;
  closeModal: (props?: { action: 'SAVE'; email: string } | { action: 'CLOSE' }) => void;
}

const RecipientEmailModal = ({ title, email, closeModal }: RecipientEmailModalProps) => {
  const form = useForm<RecipientFormValues>({
    resolver: zodResolver(RecipientSchema),
    defaultValues: { email },
  });
  const { errors } = form.formState;
  const close = () => closeModal({ action: 'CLOSE' });
  const submit = form.handleSubmit((values) => closeModal({ action: 'SAVE', email: values.email }));

  return (
    <Dialog open onClose={close} maxWidth="xs" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            {...form.register('email')}
            autoFocus
            label="Email"
            type="email"
            fullWidth
            margin="dense"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Annulla</Button>
          <Button type="submit" variant="contained">
            Salva
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RecipientEmailModal;
