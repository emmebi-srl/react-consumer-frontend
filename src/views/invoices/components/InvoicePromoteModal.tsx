import { useState } from 'react';
import { Done } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ModalProps } from '~/modals/Modal';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';

interface Props extends ModalProps {
  preinvoiceId: number;
  /** Unix seconds. */
  preinvoiceDate: number;
  /** Unix seconds: Delphi offers the date of the last invoice. */
  lastInvoiceDate?: number | null;
  closeModal: (props?: { action: 'YES'; invoiceDate: string } | { action: 'CLOSE' }) => void;
}

const toInput = (unix: number) => format(getDateByUnixtimestamp({ unixTimestamp: unix }), 'yyyy-MM-dd');

/**
 * "Trasforma in fattura" of the Delphi list: the preinvoice takes the next number of the year of the chosen date.
 * The date can't precede the last invoice of that year.
 */
const InvoicePromoteModal = ({ preinvoiceId, preinvoiceDate, lastInvoiceDate, closeModal }: Props) => {
  const [date, setDate] = useState(toInput(preinvoiceDate));
  const close = () => closeModal({ action: 'CLOSE' });

  return (
    <Dialog maxWidth="xs" fullWidth open onClose={close}>
      <DialogTitle>Trasforma in fattura</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2">
            La prefattura {preinvoiceId} diventa una fattura con il prossimo numero dell&apos;anno della data scelta.
          </Typography>
          <TextField
            label="Data fattura"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          {lastInvoiceDate ? (
            <Button variant="text" sx={{ alignSelf: 'flex-start' }} onClick={() => setDate(toInput(lastInvoiceDate))}>
              Usa la data dell&apos;ultima fattura (
              {format(getDateByUnixtimestamp({ unixTimestamp: lastInvoiceDate }), 'dd/MM/yyyy')})
            </Button>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Annulla</Button>
        <Button
          variant="contained"
          endIcon={<Done />}
          disabled={!date}
          onClick={() => closeModal({ action: 'YES', invoiceDate: date })}
        >
          Trasforma
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePromoteModal;
