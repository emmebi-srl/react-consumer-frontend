import { useState } from 'react';
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useAddProductRegulation, useRegulations } from '~/proxies/aries-proxy/products';
import { Regulation } from '~/types/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface ProductRegulationAddModalProps extends Omit<ModalProps, 'closeModal'> {
  productCode: string;
  // Already linked regulations, hidden from the options.
  linkedIds: number[];
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SAVED' }) => void;
}

const ProductRegulationAddModal = (props: ProductRegulationAddModalProps) => {
  const { productCode, linkedIds } = props;
  const snackbar = useSnackbar();
  const regulationsQuery = useRegulations();
  const addMutation = useAddProductRegulation();
  const [selected, setSelected] = useState<Regulation | null>(null);

  const options = (regulationsQuery.data?.regulations ?? []).filter((regulation) => !linkedIds.includes(regulation.id));
  const close = () => props.closeModal({ action: 'CLOSE' });

  const submit = async () => {
    if (!selected) return;
    try {
      await addMutation.mutateAsync({ productCode, data: { regulationId: selected.id } });
      snackbar.success('Normativa aggiunta');
      props.closeModal({ action: 'SAVED' });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile aggiungere la normativa'));
    }
  };

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Aggiungi normativa</DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ pt: 1 }}
          options={options}
          value={selected}
          loading={regulationsQuery.isLoading}
          getOptionLabel={(option) => (option.description ? `${option.name} - ${option.description}` : option.name)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_event, value) => setSelected(value)}
          renderInput={(params) => <TextField {...params} required label="Normativa" />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={addMutation.isPending}>
          Annulla
        </Button>
        <Button variant="contained" onClick={submit} disabled={!selected || addMutation.isPending}>
          Aggiungi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductRegulationAddModal;
