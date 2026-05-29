import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useCreateSupplierInvoicePeriodicConfiguration } from '~/proxies/aries-proxy/supplier-invoices';
import { useSuppliersSearch } from '~/proxies/aries-proxy/suppliers';
import { SupplierInvoicePeriodicConfiguration } from '~/types/aries-proxy/supplier-invoices';
import { Supplier } from '~/types/aries-proxy/suppliers';

interface CreateSupplierInvoicePeriodicConfigurationModalProps extends ModalProps {
  closeModal: (
    props?: { action: 'CLOSE' } | { action: 'CREATED'; result: SupplierInvoicePeriodicConfiguration | null },
  ) => void;
}

const PeriodUnitOptions = [
  { value: 'week', label: 'Settimane' },
  { value: 'month', label: 'Mesi' },
  { value: 'year', label: 'Anni' },
] as const;

const getTodayInputValue = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const FormSchema = z
  .object({
    supplierId: z.number().int().positive('Seleziona un fornitore'),
    defaultAmount: z.number().min(0, 'Inserisci un importo valido'),
    useLastSupplierInvoiceAmount: z.boolean(),
    rowDescription: z.string().trim().min(1, 'Inserisci una descrizione'),
    startDate: z.string().min(1, 'Seleziona una data di inizio'),
    endDate: z.string().optional(),
    periodUnit: z.enum(['week', 'month', 'year']),
    periodInterval: z.number().int().min(1, 'Inserisci una frequenza valida'),
    enabled: z.boolean(),
  })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, {
    message: 'La data di fine deve essere successiva alla data di inizio',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof FormSchema>;

const getSupplierLabel = (supplier: Supplier) => {
  const code = supplier.supplierCode ? ` - ${supplier.supplierCode}` : '';
  return `${supplier.companyName ?? `#${supplier.id}`}${code}`;
};

const CreateSupplierInvoicePeriodicConfigurationModal = (
  props: CreateSupplierInvoicePeriodicConfigurationModalProps,
) => {
  const snackbar = useSnackbar();
  const theme = useTheme();
  const isMobileDialog = useMediaQuery(theme.breakpoints.down('sm'));
  const [supplierSearchText, setSupplierSearchText] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const suppliersQuery = useSuppliersSearch(supplierSearchText);
  const createMutation = useCreateSupplierInvoicePeriodicConfiguration();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      supplierId: 0,
      defaultAmount: 0,
      useLastSupplierInvoiceAmount: false,
      rowDescription: '',
      startDate: getTodayInputValue(),
      endDate: '',
      periodUnit: 'month',
      periodInterval: 1,
      enabled: true,
    },
  });

  const useLastSupplierInvoiceAmount = form.watch('useLastSupplierInvoiceAmount');

  const supplierOptions = useMemo(() => suppliersQuery.data ?? [], [suppliersQuery.data]);

  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await createMutation.mutateAsync({
        supplierId: values.supplierId,
        defaultAmount: values.defaultAmount,
        useLastSupplierInvoiceAmount: values.useLastSupplierInvoiceAmount,
        rowDescription: values.rowDescription,
        startDate: values.startDate,
        endDate: values.endDate || null,
        periodUnit: values.periodUnit,
        periodInterval: values.periodInterval,
        enabled: values.enabled,
      });

      snackbar.success('Configurazione periodica creata');
      props.closeModal({
        action: 'CREATED',
        result: result.periodicConfigurations[0] ?? null,
      });
    } catch {
      snackbar.error('Non è stato possibile creare la configurazione');
    }
  });

  return (
    <Dialog open onClose={close} maxWidth="md" fullWidth fullScreen={isMobileDialog}>
      <DialogTitle>Fattura fornitore periodica</DialogTitle>
      <DialogContent>
        <Stack component="form" id="supplier-invoice-periodic-form" spacing={2.5} pt={1} onSubmit={submit}>
          <Controller
            name="supplierId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Autocomplete
                options={supplierOptions}
                value={selectedSupplier}
                loading={suppliersQuery.isLoading}
                filterOptions={(options) => options}
                getOptionLabel={getSupplierLabel}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_event, value) => {
                  setSelectedSupplier(value);
                  field.onChange(value?.id ?? 0);
                }}
                onInputChange={(_event, value, reason) => {
                  if (reason !== 'reset') setSupplierSearchText(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Fornitore"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="defaultAmount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Importo predefinito"
                    disabled={useLastSupplierInvoiceAmount}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="useLastSupplierInvoiceAmount"
                control={form.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                    }
                    label="Usa importo ultima fattura"
                  />
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="rowDescription"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={2}
                label="Descrizione riga"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Data inizio"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="endDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Data fine"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="periodInterval"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Ripeti ogni"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="periodUnit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Periodo"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {PeriodUnitOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="enabled"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                label="Configurazione abilitata"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} fullWidth={isMobileDialog}>
          Annulla
        </Button>
        <Button
          type="submit"
          form="supplier-invoice-periodic-form"
          variant="contained"
          disabled={createMutation.isPending}
          fullWidth={isMobileDialog}
        >
          Crea
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSupplierInvoicePeriodicConfigurationModal;
