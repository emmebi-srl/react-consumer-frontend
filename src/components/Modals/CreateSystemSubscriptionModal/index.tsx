import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { ModalProps } from '~/modals/Modal';

interface CreateSystemSubscriptionModalProps extends ModalProps {
  closeModal: (props?: { action: 'CLOSE' }) => void;
}

const CreateSystemSubscriptionModal = (props: CreateSystemSubscriptionModalProps) => {
  const close = () =>
    props.closeModal({
      action: 'CLOSE',
    });

  return (
    <Dialog maxWidth="sm" open onClose={close} fullWidth>
      <DialogTitle>Crea Abbonamento Impianto</DialogTitle>
      <DialogContent>
        <Typography>Lavori in corso</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Annulla</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSystemSubscriptionModal;
