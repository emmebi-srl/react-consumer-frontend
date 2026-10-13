import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useCreateCustomerContact, useCustomerContactFigures } from '~/proxies/aries-proxy/customers';

interface CustomerContactCreateModalProps extends Omit<ModalProps, 'closeModal'> {
  customerId: number;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'CREATED' }) => void;
}

interface FormValues {
  title: string;
  name: string;
  figureId: number | '';
  phone: string;
  mobilePhone: string;
  email: string;
}

const CustomerContactCreateModal = (props: CustomerContactCreateModalProps) => {
  const { customerId } = props;
  const snackbar = useSnackbar();
  const createMutation = useCreateCustomerContact();
  const { data: figuresData } = useCustomerContactFigures();

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      title: '',
      name: '',
      figureId: '',
      phone: '',
      mobilePhone: '',
      email: '',
    },
  });

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    if (values.figureId === '' || !values.name.trim()) {
      snackbar.error('Nome e figura sono obbligatori');
      return;
    }

    try {
      await createMutation.mutateAsync({
        customerId,
        data: { ...values, figureId: values.figureId },
      });
      snackbar.success('Contatto aggiunto');
      props.closeModal({ action: 'CREATED' });
    } catch {
      snackbar.error('Non è stato possibile aggiungere il contatto');
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Nuovo contatto</DialogTitle>
      <DialogContent>
        <Stack component="form" id="customer-contact-create-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth required label="Nome" />}
          />
          <Controller
            name="figureId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth required label="Figura">
                {(figuresData?.figures ?? []).map((figure) => (
                  <MenuItem key={figure.id} value={figure.id}>
                    {figure.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="title"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Titolo" />}
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={createMutation.isPending}>
          Annulla
        </Button>
        <Button
          type="submit"
          form="customer-contact-create-form"
          variant="contained"
          disabled={createMutation.isPending}
        >
          Aggiungi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerContactCreateModal;
