import { Box, Chip, Stack, Typography } from '@mui/material';
import { TicketEvent, TicketEventKind } from '~/types/aries-proxy/tickets';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';

const KIND_LABELS: Record<TicketEventKind, string> = {
  ticket: 'Intervento',
  reminder: 'Promemoria',
  expiration: 'Scadenza',
};

/** Calendar events of the ticket with their technicians ("Tecnici" grid of the Delphi screen). */
const TicketEventsList: React.FC<{ events: TicketEvent[] }> = ({ events }) => {
  if (!events.length)
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Nessun evento a calendario
      </Typography>
    );
  return (
    <Stack spacing={1.5}>
      {events.map((event) => (
        <Box key={event.id}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              size="small"
              variant="outlined"
              color={event.kind === 'ticket' ? 'primary' : 'default'}
              label={KIND_LABELS[event.kind]}
            />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {getStringDateByUnixtimestamp(event.executionDate)} {event.startTime}–{event.endTime}
            </Typography>
            {event.wasPerformed ? <Chip size="small" color="success" variant="outlined" label="Eseguito" /> : null}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {event.subject}
          </Typography>
          {event.employees.length ? (
            <Typography variant="body2">
              Tecnici: {event.employees.map((employee) => employee.name ?? `#${employee.employeeId}`).join(', ')}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Stack>
  );
};

export default TicketEventsList;
