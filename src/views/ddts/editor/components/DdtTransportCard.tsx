import { useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  useCarriers,
  useDdtAspects,
  useDeliveryCares,
  useDepotTypes,
  useTransportCausals,
} from '~/proxies/aries-proxy/ddts';
import {
  DDT_ASPECTS,
  DELIVERY_CARE_CARRIER,
  TransportCausal,
  TransportCausalOperation,
} from '~/types/aries-proxy/ddts';
import { DdtFormValues } from '../ddtFormValues';

/** Same texts as Settrasporto2AfterScroll in the Delphi editor. */
const describeOperation = (causal: TransportCausal | undefined, depotName?: string) => {
  if (!causal) return null;
  switch (causal.operation) {
    case TransportCausalOperation.Load:
      return 'Carico della merce nel magazzino indicato su ogni riga.';
    case TransportCausalOperation.Unload:
      return 'Scarico della merce dal magazzino indicato su ogni riga.';
    case TransportCausalOperation.LoadFromDepot:
      return `Carico nel magazzino di ogni riga scaricando da ${depotName ?? 'il magazzino collegato'}.`;
    case TransportCausalOperation.UnloadToDepot:
      return `Scarico dal magazzino di ogni riga caricando ${depotName ?? 'il magazzino collegato'}.`;
    default:
      return null;
  }
};

/** Bottom of the Delphi editor: transport, causal, packages, dates, aspect and notes. */
const DdtTransportCard: React.FC = () => {
  const { control, setValue } = useFormContext<DdtFormValues>();
  const deliveryCareId = useWatch({ control, name: 'deliveryCareId' });
  const causalId = useWatch({ control, name: 'causalId' });
  const { data: careData } = useDeliveryCares();
  const { data: carrierData } = useCarriers();
  const { data: causalData } = useTransportCausals();
  const { data: depotData } = useDepotTypes();
  const { data: aspectData } = useDdtAspects();
  const causals = causalData?.causals ?? [];
  const selectedCausal = causals.find((causal) => causal.id.toUpperCase() === causalId.toUpperCase());
  const depotName = (id?: number | null) => depotData?.depotTypes.find((depot) => depot.id === id)?.name;
  const availableMask = aspectData?.availableMask ?? 0;
  const lastCausal = useRef(causalId);

  // Changing causal proposes its default depot for the new rows (Setmaga in Delphi).
  useEffect(() => {
    if (!selectedCausal || lastCausal.current === causalId) return;
    lastCausal.current = causalId;
    setValue('defaultDepotId', selectedCausal.defaultDepotId, { shouldDirty: true });
  }, [causalId, selectedCausal, setValue]);

  return (
    <Card variant="outlined">
      <CardHeader title="Trasporto" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="deliveryCareId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select size="small" label="Trasporto a cura" sx={{ minWidth: 180 }}>
                  <MenuItem value="">-</MenuItem>
                  {(careData?.deliveryCares ?? []).map((care) => (
                    <MenuItem key={care.id} value={care.id}>
                      {care.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="carrierId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Vettore"
                  disabled={deliveryCareId !== DELIVERY_CARE_CARRIER}
                  helperText={
                    deliveryCareId !== DELIVERY_CARE_CARRIER ? 'Solo con trasporto a cura del vettore' : undefined
                  }
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">-</MenuItem>
                  {(carrierData?.carriers ?? []).map((carrier) => (
                    <MenuItem key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="causalId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  required
                  size="small"
                  label="Causale trasporto"
                  helperText={describeOperation(selectedCausal, depotName(selectedCausal?.depotId))}
                  sx={{ flexGrow: 1, minWidth: 240 }}
                >
                  {causalId && !selectedCausal ? <MenuItem value={causalId}>{causalId}</MenuItem> : null}
                  {causals.map((causal) => (
                    <MenuItem key={causal.id} value={causal.id}>
                      {causal.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="defaultDepotId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Magazzino di default"
                  helperText="Proposto sulle nuove righe articolo"
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">Nessuno</MenuItem>
                  {(depotData?.depotTypes ?? [])
                    .filter((depot) => !depot.isDisabled || depot.id === field.value)
                    .map((depot) => (
                      <MenuItem key={depot.id} value={depot.id}>
                        {depot.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <Controller
              name="packages"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Colli"
                  sx={{ width: 100 }}
                  slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                />
              )}
            />
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Peso (kg)"
                  sx={{ width: 120 }}
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
              )}
            />
            <Controller
              name="transportDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  size="small"
                  label="Data trasporto"
                  sx={{ width: 170 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="transportTime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="time"
                  size="small"
                  label="Ora"
                  sx={{ width: 120 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="printTransportTime"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                  label="Stampa ora"
                />
              )}
            />
            <Controller
              name="pickupDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  size="small"
                  label="Data ritiro"
                  sx={{ width: 170 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="pickupTime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="time"
                  size="small"
                  label="Ora ritiro"
                  sx={{ width: 120 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="printPickupDateTime"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                  label="Stampa ritiro"
                />
              )}
            />
          </Stack>

          <Controller
            name="aspects"
            control={control}
            render={({ field }) => (
              <div>
                <FormLabel sx={{ fontSize: 13 }}>Aspetto esteriore dei beni</FormLabel>
                <FormGroup row>
                  {DDT_ASPECTS.filter(
                    (aspect) => (availableMask & aspect.bit) !== 0 || (field.value & aspect.bit) !== 0,
                  ).map((aspect) => (
                    <FormControlLabel
                      key={aspect.bit}
                      label={aspect.label}
                      control={
                        <Checkbox
                          checked={(field.value & aspect.bit) !== 0}
                          onChange={(_, checked) =>
                            field.onChange(checked ? field.value | aspect.bit : field.value & ~aspect.bit)
                          }
                        />
                      }
                    />
                  ))}
                </FormGroup>
                {aspectData && !availableMask ? (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Nessun aspetto configurato.
                  </Typography>
                ) : null}
              </div>
            )}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Note interne" helperText="Non stampate" fullWidth multiline minRows={2} />
              )}
            />
            <Controller
              name="footerNote"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Note piè DDT"
                  helperText="Stampate sul documento"
                  fullWidth
                  multiline
                  minRows={2}
                />
              )}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DdtTransportCard;
