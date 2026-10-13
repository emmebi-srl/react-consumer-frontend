import { useState } from 'react';
import {
  Autocomplete,
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
import { Controller, useForm } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useCreateCustomerDestination } from '~/proxies/aries-proxy/customers';
import { useComuneSearch, useFrazioniByComune } from '~/proxies/aries-proxy/geo';
import { Comune } from '~/types/aries-proxy/geo';

interface CustomerDestinationCreateModalProps extends Omit<ModalProps, 'closeModal'> {
  customerId: number;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'CREATED' }) => void;
}

interface FormValues {
  description: string;
  street: string;
  houseNumber: number | '';
  other: string;
  province: string;
  comuneId: number | '';
  frazioneId: number | '';
  km: number | '';
  minutes: number | '';
}

const CustomerDestinationCreateModal = (props: CustomerDestinationCreateModalProps) => {
  const { customerId } = props;
  const snackbar = useSnackbar();
  const createMutation = useCreateCustomerDestination();
  const [comuneSearchText, setComuneSearchText] = useState('');
  const [selectedComune, setSelectedComune] = useState<Comune | null>(null);

  const comuneQuery = useComuneSearch(comuneSearchText);
  const frazioniQuery = useFrazioniByComune(selectedComune?.id ?? null);
  const comuneOptions = comuneQuery.data?.comuni ?? [];
  const frazioniOptions = frazioniQuery.data?.frazioni ?? [];

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      description: '',
      street: '',
      houseNumber: '',
      other: '',
      province: '',
      comuneId: '',
      frazioneId: '',
      km: '',
      minutes: '',
    },
  });

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = handleSubmit(async (values) => {
    if (!values.description.trim() || values.comuneId === '') {
      snackbar.error('Descrizione e comune sono obbligatori');
      return;
    }

    try {
      await createMutation.mutateAsync({
        customerId,
        data: {
          description: values.description,
          street: values.street,
          houseNumber: values.houseNumber === '' ? undefined : values.houseNumber,
          other: values.other,
          province: values.province,
          comuneId: values.comuneId,
          frazioneId: values.frazioneId === '' ? undefined : values.frazioneId,
          km: values.km === '' ? undefined : values.km,
          minutes: values.minutes === '' ? undefined : values.minutes,
        },
      });
      snackbar.success('Destinazione aggiunta');
      props.closeModal({ action: 'CREATED' });
    } catch {
      snackbar.error('Non è stato possibile aggiungere la destinazione');
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Nuova destinazione</DialogTitle>
      <DialogContent>
        <Stack component="form" id="customer-destination-create-form" spacing={2.5} onSubmit={submit} sx={{ pt: 1 }}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth required label="Descrizione" />}
          />

          <Controller
            name="comuneId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={comuneOptions}
                value={selectedComune}
                loading={comuneQuery.isLoading}
                filterOptions={(options) => options}
                getOptionLabel={(option) => `${option.name}${option.province ? ` (${option.province})` : ''}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_event, value) => {
                  setSelectedComune(value);
                  field.onChange(value?.id ?? '');
                  setValue('frazioneId', '');
                  if (value?.province) setValue('province', value.province);
                }}
                onInputChange={(_event, value, reason) => {
                  if (reason !== 'reset') setComuneSearchText(value);
                }}
                renderInput={(params) => <TextField {...params} required label="Comune" />}
              />
            )}
          />

          {frazioniOptions.length > 0 && (
            <Controller
              name="frazioneId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Frazione">
                  <MenuItem value="">Nessuna</MenuItem>
                  {frazioniOptions.map((frazione) => (
                    <MenuItem key={frazione.id} value={frazione.id}>
                      {frazione.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

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
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={createMutation.isPending}>
          Annulla
        </Button>
        <Button
          type="submit"
          form="customer-destination-create-form"
          variant="contained"
          disabled={createMutation.isPending}
        >
          Aggiungi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDestinationCreateModal;
