import { Done } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { ModalProps } from '~/modals/Modal';

interface ConfirmationModalProps extends ModalProps {
  title: string;
  text: string;
  closeModal: (props?: { action: 'YES' } | { action: 'NO' } | { action: 'CLOSE' }) => void;
}

const ConfirmationModal = (props: ConfirmationModalProps) => {
  const close = () =>
    props.closeModal({
      action: 'CLOSE',
    });

  const confirm = () =>
    props.closeModal({
      action: 'YES',
    });

  const cancel = () =>
    props.closeModal({
      action: 'NO',
    });

  return (
    <Dialog maxWidth="sm" open onClose={close}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <Typography>{props.text}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancel} variant="contained" color="error">
          NO
        </Button>
        <Button onClick={confirm} variant="contained" color="primary" endIcon={<Done />}>
          SI
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
