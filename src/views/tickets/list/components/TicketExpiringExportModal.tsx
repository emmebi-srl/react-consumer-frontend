import { useState } from 'react';
import { addDays, format } from 'date-fns';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { exportExpiringTickets } from '~/proxies/aries-proxy/api/tickets';
import { getApiErrorMessage } from '~/utils/api-error-utils';

/** "In scadenza" print of the Delphi ticket screen: CSV of the open tickets expiring in a period. */
const TicketExpiringExportModal = ({ closeModal }: ModalProps) => {
  const snackbar = useSnackbar();
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [includeWithoutExpiration, setIncludeWithoutExpiration] = useState(false);
  const [busy, setBusy] = useState(false);
  const invalid = !fromDate || !toDate || toDate < fromDate;

  const download = async () => {
    setBusy(true);
    try {
      const response = await exportExpiringTickets(fromDate, toDate, includeWithoutExpiration);
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-in-scadenza-${fromDate}-${toDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      closeModal();
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile esportare i ticket.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={() => closeModal()} maxWidth="xs" fullWidth>
      <DialogTitle>Ticket in scadenza</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Esporta in CSV (apribile con Excel) i ticket aperti con la scadenza nel periodo.
        </DialogContentText>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              type="date"
              label="Dal"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              size="small"
              type="date"
              label="Al"
              value={toDate}
              error={invalid}
              onChange={(event) => setToDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeWithoutExpiration}
                onChange={(event) => setIncludeWithoutExpiration(event.target.checked)}
              />
            }
            label="Includi i ticket senza scadenza"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeModal()}>Annulla</Button>
        <Button variant="contained" onClick={() => void download()} loading={busy} disabled={invalid}>
          Esporta
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketExpiringExportModal;
