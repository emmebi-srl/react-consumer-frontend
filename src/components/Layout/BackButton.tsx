import { ArrowBack } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface Props {
  to: string;
  ariaLabel?: string;
}

const BackButton: React.FC<Props> = ({ to, ariaLabel = 'Torna alla lista' }) => {
  return (
    <IconButton component={RouterLink} to={to} color="primary" aria-label={ariaLabel}>
      <ArrowBack />
    </IconButton>
  );
};

export default BackButton;
