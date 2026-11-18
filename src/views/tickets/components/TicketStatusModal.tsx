import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useSetTicketStatus, useTicketStatuses } from '~/proxies/aries-proxy/tickets';
import { Ticket, TICKET_SENT_TYPE_LABELS, TicketSentType } from '~/types/aries-proxy/tickets';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { toDateInput } from '../ticketHelpers';

interface Props extends ModalProps {
  ticket: Ticket;
}

const SENT_TYPES = [
  TicketSentType.None,
  TicketSentType.Email,
  TicketSentType.ByHand,
  TicketSentType.Post,
  TicketSentType.Fax,
];

/** "Cambia stato/inviato con" of the Delphi ticket list: status, sending and solution date. */
const TicketStatusModal = ({ ticket, closeModal }: Props) => {
  const snackbar = useSnackbar();
  const { data: statuses } = useTicketStatuses();
  const mutation = useSetTicketStatus();
  const [statusId, setStatusId] = useState(ticket.statusId);
  const [sentTypeId, setSentTypeId] = useState<TicketSentType>(ticket.sentTypeId ?? TicketSentType.None);
  const [solutionDate, setSolutionDate] = useState(toDateInput(ticket.solutionDate));

  const selectedStatus = statuses?.find((status) => status.id === statusId);

  const save = async () => {
    try {
      await mutation.mutateAsync({
        id: ticket.id,
        data: { statusId, sentTypeId, solutionDate: solutionDate || null },
      });
      snackbar.success('Stato aggiornato');
      closeModal();
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile cambiare lo stato.'));
    }
  };

  return (
    <Dialog open onClose={() => closeModal()} maxWidth="xs" fullWidth>
      <DialogTitle>Cambia stato</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Stato
            </Typography>
            <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              {(statuses ?? []).map((status) => (
                <DelphiColorChip
                  key={status.id}
                  label={status.name}
                  delphiColor={status.color}
                  onClick={() => setStatusId(status.id)}
                  variant={status.id === statusId ? 'filled' : 'outlined'}
                  sx={
                    status.id === statusId ? { outline: '2px solid', outlineColor: 'primary.main' } : { opacity: 0.6 }
                  }
                />
              ))}
            </Stack>
            {selectedStatus?.description ? (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                {selectedStatus.description}
              </Typography>
            ) : null}
          </Box>
          <TextField
            select
            size="small"
            label="Inviato con"
            value={sentTypeId}
            onChange={(event) => setSentTypeId(Number(event.target.value))}
          >
            {SENT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {TICKET_SENT_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="date"
            label="Data soluzione"
            value={solutionDate}
            onChange={(event) => setSolutionDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeModal()}>Annulla</Button>
        <Button variant="contained" onClick={() => void save()} loading={mutation.isPending}>
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketStatusModal;
