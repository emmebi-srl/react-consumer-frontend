import { useState } from 'react';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useDebounce } from 'use-debounce';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useSaveTicketTags, useTicketTagsSearch } from '~/proxies/aries-proxy/tickets';
import { Ticket } from '~/types/aries-proxy/tickets';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface Props extends ModalProps {
  ticket: Ticket;
}

const MAX_TAG_LENGTH = 50;

/** "Gestisci" tags of the Delphi form: pick existing ticket tags or type new ones (saved upper case). */
const TicketTagsModal = ({ ticket, closeModal }: Props) => {
  const snackbar = useSnackbar();
  const [tags, setTags] = useState<string[]>((ticket.tags ?? []).map((tag) => tag.name));
  const [input, setInput] = useState('');
  const [search] = useDebounce(input, 250);
  const { data: suggestions, isFetching } = useTicketTagsSearch(search);
  const mutation = useSaveTicketTags();

  const save = async () => {
    try {
      await mutation.mutateAsync({ id: ticket.id, tags });
      snackbar.success('Tag salvati');
      closeModal();
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare i tag.'));
    }
  };

  return (
    <Dialog open onClose={() => closeModal()} maxWidth="sm" fullWidth>
      <DialogTitle>Tag del ticket</DialogTitle>
      <DialogContent>
        <Autocomplete
          multiple
          freeSolo
          sx={{ mt: 1 }}
          value={tags}
          options={(suggestions ?? []).map((tag) => tag.name)}
          loading={isFetching}
          filterSelectedOptions
          inputValue={input}
          onInputChange={(_, value) => setInput(value.slice(0, MAX_TAG_LENGTH))}
          onChange={(_, value) => {
            const normalized = value.map((tag) => tag.trim().toUpperCase()).filter(Boolean);
            setTags([...new Set(normalized)]);
          }}
          renderValue={(value, getItemProps) =>
            value.map((tag, index) => {
              const { key, ...itemProps } = getItemProps({ index });
              return <Chip key={key} size="small" label={tag} {...itemProps} />;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tag"
              placeholder="Scrivi e premi Invio"
              helperText="Un nuovo tag viene creato al salvataggio."
            />
          )}
        />
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

export default TicketTagsModal;
