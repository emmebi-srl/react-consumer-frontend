import { Chip } from '@mui/material';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import { CustomerStatusEntry } from '~/types/aries-proxy/customers';

interface Props {
  statusId?: string | null;
  status?: CustomerStatusEntry | null;
}

// The customer status id (stato_clienti.Id_stato) is itself the Delphi color of the status.
const CustomerStatusChip: React.FC<Props> = ({ statusId, status }) => {
  if (!statusId && !status) {
    return <Chip size="small" label="N/D" variant="outlined" />;
  }

  const label = status?.name ?? statusId ?? '';

  return <DelphiColorChip label={label} delphiColor={status?.id ?? statusId} />;
};

export default CustomerStatusChip;
