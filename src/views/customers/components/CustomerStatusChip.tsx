import { Chip } from '@mui/material';
import { CustomerStatusEntry } from '~/types/aries-proxy/customers';
import { getStatusChipColor } from '../customerHelpers';

interface Props {
  statusId?: string | null;
  status?: CustomerStatusEntry | null;
}

const CustomerStatusChip: React.FC<Props> = ({ statusId, status }) => {
  if (!statusId && !status) {
    return <Chip size="small" label="N/D" variant="outlined" />;
  }

  const label = status?.name ?? statusId ?? '';

  return <Chip size="small" label={label} color={getStatusChipColor(label)} />;
};

export default CustomerStatusChip;
