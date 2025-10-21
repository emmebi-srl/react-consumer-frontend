import { Delete } from '@mui/icons-material';
import { Button } from '@mui/material';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

const ClearFiltersButton: React.FC<Props> = ({ onClick, disabled }) => {
  if (disabled) return null;

  return (
    <Button onClick={onClick} color="error" startIcon={<Delete />}>
      Pulisci filtri
    </Button>
  );
};

export default ClearFiltersButton;
