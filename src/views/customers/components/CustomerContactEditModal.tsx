import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useUpdateCustomerContact } from '~/proxies/aries-proxy/customers';
import { CustomerContact } from '~/types/aries-proxy/customers';

interface CustomerContactEditModalProps extends Omit<ModalProps, 'closeModal'> {
  customerId: number;
  contact: CustomerContact;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
}

interface FormValues {
  title: string;
  name: string;
  phone: string;
  mobilePhone: string;
  email: string;
}

const CustomerContactEditModal = (props: CustomerContactEditModalProps) => {
  const { customerId, contact } = props;
  const snackbar = useSnackbar();
  const updateMutation = useUpdateCustomerContact();

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      title: contact.title ?? '',
      name: contact.name,
      phone: contact.phone ?? '',
      mobilePhone: contact.mobilePhone ?? '',
      email: contact.email ?? '',
    },
  });

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ customerId, contactId: contact.contactId, data: values });
      snackbar.success('Contatto aggiornato');
      props.closeModal({ action: 'SAVED' });
    } catch {
      snackbar.error('Non è stato possibile aggiornare il contatto');
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Modifica contatto</DialogTitle>
      <DialogContent>
        <Stack component="form" id="customer-contact-edit-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Titolo" />}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Nome" />}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Telefono" />}
          />
          <Controller
            name="mobilePhone"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Cellulare" />}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Email" />}
          />
          <TextField label="Figura" value={contact.figure || 'N/D'} disabled fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={updateMutation.isPending}>
          Annulla
        </Button>
        <Button type="submit" form="customer-contact-edit-form" variant="contained" disabled={updateMutation.isPending}>
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerContactEditModal;
