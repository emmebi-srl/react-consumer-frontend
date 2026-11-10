import { MouseEvent, useState } from 'react';
import { MoreVert, ReceiptLong } from '@mui/icons-material';
import { CircularProgress, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Customer } from '~/types/aries-proxy/customers';
import useCustomerInvoicesStatement from '../../components/useCustomerInvoicesStatement';

interface Props {
  customer: Customer;
}

/** Quick actions at the end of the row. Clicks must not reach the row, which navigates to the detail. */
const CustomerTableRowActions: React.FC<Props> = ({ customer }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const statement = useCustomerInvoicesStatement(customer.id, customer.companyName);

  const stop = (event: MouseEvent) => event.stopPropagation();
  const closeMenu = () => setAnchorEl(null);
  const choose = (action: () => Promise<void>) => () => {
    closeMenu();
    void action();
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="Azioni"
        disabled={statement.busy}
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
        onAuxClick={stop}
      >
        {statement.busy ? <CircularProgress size={18} /> : <MoreVert fontSize="small" />}
      </IconButton>
      {/* The menu is in a portal, but React events still bubble to the row through it. */}
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu} onClick={stop} onAuxClick={stop}>
        <MenuItem onClick={choose(statement.preview)}>
          <ListItemIcon>
            <ReceiptLong fontSize="small" />
          </ListItemIcon>
          <ListItemText>Vedi estratto conto</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CustomerTableRowActions;
