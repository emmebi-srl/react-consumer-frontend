import { ReceiptLong } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import useCustomerInvoicesStatement from './useCustomerInvoicesStatement';

interface Props {
  customerId: number;
  companyName: string;
}

/** Opens the statement preview; the preview has the "Invia via email" button. */
const CustomerInvoicesStatementButton: React.FC<Props> = ({ customerId, companyName }) => {
  const statement = useCustomerInvoicesStatement(customerId, companyName);

  return (
    <Button
      variant="outlined"
      disabled={statement.busy}
      startIcon={statement.busy ? <CircularProgress size={16} /> : <ReceiptLong />}
      onClick={() => void statement.preview()}
    >
      Estratto conto
    </Button>
  );
};

export default CustomerInvoicesStatementButton;
