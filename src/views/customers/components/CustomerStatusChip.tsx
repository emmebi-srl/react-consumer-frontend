import { Chip } from '@mui/material';
import { useCustomerStatuses } from '~/proxies/aries-proxy/customers';
import { getStatusChipColor } from '../customerHelpers';

interface Props {
  statusId?: string | null;
}

const CustomerStatusChip: React.FC<Props> = ({ statusId }) => {
  const { data } = useCustomerStatuses();

  if (!statusId) {
    return <Chip size="small" label="N/D" variant="outlined" />;
  }

  const status = data?.statuses.find((entry) => entry.id === statusId);
  const label = status?.name ?? statusId;

  return <Chip size="small" label={label} color={getStatusChipColor(label)} />;
};

export default CustomerStatusChip;
