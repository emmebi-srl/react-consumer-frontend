import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm, useWatch } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useUpdateCustomerDestination } from '~/proxies/aries-proxy/customers';
import { useFrazioniByComune } from '~/proxies/aries-proxy/geo';
import { CustomerDestination } from '~/types/aries-proxy/customers';
import ComuneAutocomplete from './ComuneAutocomplete';

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
  comuneId: number | '';
  frazioneId: number | '';
}

const CustomerDestinationEditModal = (props: CustomerDestinationEditModalProps) => {
  const { customerId, destination } = props;
  const snackbar = useSnackbar();
  const updateMutation = useUpdateCustomerDestination();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { dirtyFields },
  } = useForm<FormValues>({
    defaultValues: {
      street: destination.street,
      houseNumber: destination.houseNumber,
      other: destination.other,
      province: destination.province ?? '',
      km: destination.km,
      minutes: destination.minutes,
      comuneId: destination.comuneId ?? '',
      frazioneId: destination.frazioneId ?? '',
    },
  });

  const comuneId = useWatch({ control, name: 'comuneId' });
  const frazioniQuery = useFrazioniByComune(comuneId === '' ? null : comuneId);
  const frazioni = frazioniQuery.data?.frazioni ?? [];
  const initialComune = destination.comuneId
    ? { id: destination.comuneId, name: destination.municipality, province: destination.province }
    : null;

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async ({ comuneId: selectedComuneId, frazioneId, ...values }) => {
    const locationDirty = dirtyFields.comuneId || dirtyFields.frazioneId;
    try {
      await updateMutation.mutateAsync({
        customerId,
        destinationId: destination.destinationId,
        data: {
          ...values,
          comuneId: dirtyFields.comuneId && selectedComuneId !== '' ? selectedComuneId : undefined,
          frazioneId: locationDirty ? (frazioneId === '' ? 0 : frazioneId) : undefined,
        },
      });
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
          <Controller
            name="comuneId"
            control={control}
            render={({ field }) => (
              <ComuneAutocomplete
                value={field.value}
                initialComune={initialComune}
                onChange={(comune) => {
                  field.onChange(comune?.id ?? '');
                  setValue('frazioneId', '', { shouldDirty: true });
                  if (comune?.province) setValue('province', comune.province, { shouldDirty: true });
                }}
                size="medium"
                fullWidth
                helperText={
                  !initialComune && destination.municipality && field.value === ''
                    ? `Attuale: ${destination.municipality}`
                    : undefined
                }
              />
            )}
          />
          {frazioni.length > 0 && (
            <Controller
              name="frazioneId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Frazione"
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <MenuItem value="">Nessuna</MenuItem>
                  {frazioni.map((frazione) => (
                    <MenuItem key={frazione.id} value={frazione.id}>
                      {frazione.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
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
