import { useState } from 'react';
import { addDays, format } from 'date-fns';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useEmployees } from '~/proxies/aries-proxy/employees';
import { useScheduleTicketEvent } from '~/proxies/aries-proxy/tickets';
import { Employee } from '~/types/aries-proxy/employees';
import { Ticket } from '~/types/aries-proxy/tickets';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface Props extends ModalProps {
  ticket: Ticket;
}

/**
 * "Fissa a calendario" of the Delphi ticket list: an appointment of the customer/system with the technicians.
 * Like Delphi it proposes a week from today.
 */
const TicketEventModal = ({ ticket, closeModal }: Props) => {
  const snackbar = useSnackbar();
  const { data: employees, isLoading } = useEmployees();
  const mutation = useScheduleTicketEvent();
  const [date, setDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [note, setNote] = useState('');
  const invalidTimes = !!startTime && !!endTime && endTime <= startTime;

  const save = async () => {
    try {
      await mutation.mutateAsync({
        id: ticket.id,
        data: {
          date,
          startTime,
          endTime,
          employeeIds: technicians.map((employee) => employee.employeeId),
          note: note.trim() || null,
        },
      });
      snackbar.success('Ticket fissato a calendario');
      closeModal();
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare l’evento.'));
    }
  };

  return (
    <Dialog open onClose={() => closeModal()} maxWidth="sm" fullWidth>
      <DialogTitle>Fissa a calendario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              size="small"
              type="date"
              label="Data"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="time"
              label="Dalle"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              type="time"
              label="Alle"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              error={invalidTimes}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          {invalidTimes ? (
            <Alert severity="warning">L’ora di fine deve essere successiva all’ora di inizio.</Alert>
          ) : null}
          <Autocomplete
            multiple
            size="small"
            options={employees ?? []}
            loading={isLoading}
            value={technicians}
            getOptionLabel={(employee) => employee.companyName ?? `Tecnico ${employee.employeeId}`}
            isOptionEqualToValue={(option, value) => option.employeeId === value.employeeId}
            onChange={(_, value) => setTechnicians(value)}
            renderInput={(params) => <TextField {...params} label="Tecnici" />}
          />
          <TextField
            label="Note per l’evento"
            multiline
            minRows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            helperText="Oggetto e descrizione vengono composti dal ticket (cliente, impianto, descrizione)."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeModal()}>Annulla</Button>
        <Button
          variant="contained"
          onClick={() => void save()}
          loading={mutation.isPending}
          disabled={!date || !startTime || !endTime || invalidTimes}
        >
          Fissa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketEventModal;
