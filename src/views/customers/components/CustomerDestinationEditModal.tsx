import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useUpdateCustomerDestination } from '~/proxies/aries-proxy/customers';
import { CustomerDestination } from '~/types/aries-proxy/customers';

interface CustomerDestinationEditModalProps extends Omit<ModalProps, 'closeModal'> {
  customerId: number;
  destination: CustomerDestination;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
}

interface FormValues {
  street: string;
  houseNumber: number;
  other: string;
  province: string;
  km: number;
  minutes: number;
}

const CustomerDestinationEditModal = (props: CustomerDestinationEditModalProps) => {
  const { customerId, destination } = props;
  const snackbar = useSnackbar();
  const updateMutation = useUpdateCustomerDestination();

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      street: destination.street,
      houseNumber: destination.houseNumber,
      other: destination.other,
      province: destination.province ?? '',
      km: destination.km,
      minutes: destination.minutes,
    },
  });

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ customerId, destinationId: destination.destinationId, data: values });
      snackbar.success('Destinazione aggiornata');
      props.closeModal({ action: 'SAVED' });
    } catch {
      snackbar.error('Non è stato possibile aggiornare la destinazione');
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Modifica destinazione</DialogTitle>
      <DialogContent>
        <Stack component="form" id="customer-destination-edit-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 8 }}>
              <Controller
                name="street"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="Indirizzo" />}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Controller
                name="houseNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Civico"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 8 }}>
              <Controller
                name="other"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="Altro" />}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Controller
                name="province"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="Provincia" />}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="km"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Km"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="minutes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Tempo viaggio (min)"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>
          </Grid>
          <TextField label="Comune" value={destination.municipality || 'N/D'} disabled fullWidth />
          <TextField label="Frazione" value={destination.fraction || 'N/D'} disabled fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={updateMutation.isPending}>
          Annulla
        </Button>
        <Button
          type="submit"
          form="customer-destination-edit-form"
          variant="contained"
          disabled={updateMutation.isPending}
        >
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDestinationEditModal;
