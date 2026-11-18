import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useDebounce } from 'use-debounce';
import { ModalProps } from '~/modals/Modal';
import { useQuotesSearch } from '~/proxies/aries-proxy/quotes';
import { Quote } from '~/types/aries-proxy/quotes';

interface Props extends Omit<ModalProps, 'closeModal'> {
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SELECT'; quoteId: number; quoteYear: number }) => void;
}

/** "Preventivo > Duplica esistente": picks the quote to copy (Delphi TFQuoteSelector). */
const TicketQuoteCloneModal = ({ closeModal }: Props) => {
  const [input, setInput] = useState('');
  const [search] = useDebounce(input, 300);
  const [selected, setSelected] = useState<Quote | null>(null);
  const quotesQuery = useQuotesSearch({
    search: search || undefined,
    pageSize: 20,
    includes: 'revisions,revisions.customer',
  });
  const options = useMemo(() => quotesQuery.data?.pages.flatMap((page) => page.quotes) ?? [], [quotesQuery.data]);

  const customerOf = (quote: Quote) => quote.revisions?.[0]?.customer?.companyName ?? '';

  return (
    <Dialog open onClose={() => closeModal({ action: 'CLOSE' })} maxWidth="sm" fullWidth>
      <DialogTitle>Duplica un preventivo</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Viene creata una copia dell’ultima revisione, collegata a questo ticket. I PDF allegati ai lotti non vengono
          copiati.
        </DialogContentText>
        <Autocomplete
          value={selected}
          options={options}
          loading={quotesQuery.isFetching}
          filterOptions={(items) => items}
          getOptionLabel={(quote) => `${quote.id}/${quote.year} ${customerOf(quote)}`.trim()}
          isOptionEqualToValue={(option, value) => option.id === value.id && option.year === value.year}
          onInputChange={(_, value, reason) => {
            if (reason === 'input') setInput(value);
          }}
          onChange={(_, value) => setSelected(value)}
          renderOption={(props, quote) => (
            <li {...props} key={`${quote.year}-${quote.id}`}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">
                  Preventivo {quote.id}/{quote.year} · {customerOf(quote) || '-'}
                </Typography>
                {quote.note ? (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
                    {quote.note}
                  </Typography>
                ) : null}
              </Box>
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="Cerca numero o cliente" />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeModal({ action: 'CLOSE' })}>Annulla</Button>
        <Button
          variant="contained"
          disabled={!selected}
          onClick={() => selected && closeModal({ action: 'SELECT', quoteId: selected.id, quoteYear: selected.year })}
        >
          Duplica
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketQuoteCloneModal;
