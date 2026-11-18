import {
  Box,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useInterventionTypes, useTicketCausals, useTicketRequestChannels } from '~/proxies/aries-proxy/tickets';
import { TICKET_URGENCY_LABELS, TicketUrgency } from '~/types/aries-proxy/tickets';
import { formatWorkHours } from '../../ticketHelpers';
import { TicketFormValues } from '../ticketFormValues';

interface Props {
  disabled: boolean;
  isNew: boolean;
}

const URGENCIES = [TicketUrgency.Low, TicketUrgency.Medium, TicketUrgency.High];

const toSelectValue = (value: string) => (value === '' ? '' : Number(value));

/** "Ticket" box of the Delphi form. */
const TicketFieldsCard: React.FC<Props> = ({ disabled, isNew }) => {
  const { control, register } = useFormContext<TicketFormValues>();
  const workMinutes = useWatch({ control, name: 'workMinutes' });
  const { data: causals } = useTicketCausals();
  const { data: interventionTypes } = useInterventionTypes();
  const { data: requestChannels } = useTicketRequestChannels();
  const minutes = Number(workMinutes.replace(',', '.'));

  return (
    <Card variant="outlined">
      <CardHeader title="Ticket" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <TextField
              {...register('ticketNumber')}
              size="small"
              label="Numero"
              disabled={disabled}
              slotProps={{ htmlInput: { maxLength: 15 } }}
              helperText={isNew ? 'Vuoto = numero progressivo del ticket' : ' '}
            />
            <TextField
              {...register('ticketDate')}
              size="small"
              type="date"
              label="Data ticket"
              disabled={disabled}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText=" "
            />
            <Controller
              name="interventionTypeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(event) => field.onChange(toSelectValue(event.target.value))}
                  select
                  required
                  size="small"
                  label="Tipo intervento"
                  disabled={disabled}
                  helperText=" "
                >
                  {(interventionTypes ?? []).map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
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
                  onChange={(event) => field.onChange(toSelectValue(event.target.value))}
                  select
                  required
                  size="small"
                  label="Causale"
                  disabled={disabled}
                >
                  {(causals ?? []).map((causal) => (
                    <MenuItem key={causal.id} value={causal.id}>
                      {causal.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="requestChannelId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(event) => field.onChange(toSelectValue(event.target.value))}
                  select
                  required
                  size="small"
                  label="Richiesta pervenuta per"
                  disabled={disabled}
                >
                  {(requestChannels ?? []).map((channel) => (
                    <MenuItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              {...register('workMinutes')}
              size="small"
              label="Tempo (minuti)"
              disabled={disabled}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              helperText={Number.isFinite(minutes) && minutes > 0 ? formatWorkHours(minutes) : ' '}
            />
          </Box>

          <Controller
            name="urgency"
            control={control}
            render={({ field }) => (
              <Box>
                <FormLabel sx={{ typography: 'caption' }}>Urgenza</FormLabel>
                <RadioGroup row value={field.value} onChange={(event) => field.onChange(Number(event.target.value))}>
                  {URGENCIES.map((urgency) => (
                    <FormControlLabel
                      key={urgency}
                      value={urgency}
                      control={<Radio size="small" />}
                      label={TICKET_URGENCY_LABELS[urgency]}
                      disabled={disabled}
                    />
                  ))}
                </RadioGroup>
              </Box>
            )}
          />

          <TextField
            {...register('description')}
            label="Descrizione problema"
            multiline
            minRows={4}
            disabled={disabled}
          />

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <TextField
              {...register('expirationDate')}
              size="small"
              type="date"
              label="Data scadenza"
              disabled={disabled}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              {...register('reminderDate')}
              size="small"
              type="date"
              label="Data promemoria"
              disabled={disabled}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              {...register('solutionDate')}
              size="small"
              type="date"
              label="Data soluzione"
              disabled={disabled}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TicketFieldsCard;
