import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Chip, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from '@mui/material';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useDeleteCustomerDestination } from '~/proxies/aries-proxy/customers';
import { CustomerDestination } from '~/types/aries-proxy/customers';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import CustomerDestinationEditModal from './CustomerDestinationEditModal';

interface Props {
  customerId: number;
  destination: CustomerDestination;
}

const CustomerDestinationRowActions: React.FC<Props> = ({ customerId, destination }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const deleteMutation = useDeleteCustomerDestination();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const closeMenu = () => setAnchorEl(null);

  const handleDelete = async () => {
    closeMenu();
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina destinazione',
        text: `Eliminare la destinazione "${destination.street} ${destination.houseNumber}"? L'operazione non può essere annullata.`,
        alertSeverity: 'error',
      },
    });
    if (result.action !== 'YES') return;

    try {
      await deleteMutation.mutateAsync({ customerId, destinationId: destination.destinationId });
      snackbar.success('Destinazione eliminata');
    } catch {
      snackbar.error('Non è stato possibile eliminare la destinazione');
    }
  };

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      {destination.mainDestination && <Chip size="small" label="Principale" color="primary" />}
      <IconButton
        size="small"
        onClick={() =>
          modal.showModal({
            component: CustomerDestinationEditModal,
            props: { customerId, destination },
          })
        }
      >
        <EditIcon fontSize="small" />
      </IconButton>
      {!destination.mainDestination && (
        <>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Elimina</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </Stack>
  );
};

export default CustomerDestinationRowActions;
