import { useState } from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface Props {
  // Omit to hide the edit button (rows that can only be removed).
  onEdit?: () => void;
  deleteTitle: string;
  deleteText: string;
  onDelete: () => Promise<unknown>;
}

// Row actions of the product detail tables, same shape as the customer contact/destination ones:
// edit icon + "more" menu with a confirmed delete.
const ProductDetailRowActions: React.FC<Props> = ({ onEdit, deleteTitle, deleteText, onDelete }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleDelete = async () => {
    setAnchorEl(null);
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: { title: deleteTitle, text: deleteText, alertSeverity: 'error' },
    });
    if (result.action !== 'YES') return;

    try {
      await onDelete();
      snackbar.success('Riga eliminata');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile eliminare la riga'));
    }
  };

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      {onEdit && (
        <IconButton size="small" onClick={onEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Elimina</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default ProductDetailRowActions;
