import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Chip, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from '@mui/material';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useDeleteCustomerContact } from '~/proxies/aries-proxy/customers';
import { CustomerContact } from '~/types/aries-proxy/customers';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import CustomerContactEditModal from './CustomerContactEditModal';

interface Props {
  customerId: number;
  contact: CustomerContact;
}

const CustomerContactRowActions: React.FC<Props> = ({ customerId, contact }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const deleteMutation = useDeleteCustomerContact();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const closeMenu = () => setAnchorEl(null);

  const handleDelete = async () => {
    closeMenu();
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina contatto',
        text: `Eliminare il contatto "${contact.name}"? L'operazione non può essere annullata.`,
        alertSeverity: 'error',
      },
    });
    if (result.action !== 'YES') return;

    try {
      await deleteMutation.mutateAsync({ customerId, contactId: contact.contactId });
      snackbar.success('Contatto eliminato');
    } catch {
      snackbar.error('Non è stato possibile eliminare il contatto');
    }
  };

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      {contact.isMain && <Chip size="small" label="Principale" color="primary" />}
      <IconButton
        size="small"
        onClick={() =>
          modal.showModal({
            component: CustomerContactEditModal,
            props: { customerId, contact },
          })
        }
      >
        <EditIcon fontSize="small" />
      </IconButton>
      {!contact.isMain && (
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

export default CustomerContactRowActions;
