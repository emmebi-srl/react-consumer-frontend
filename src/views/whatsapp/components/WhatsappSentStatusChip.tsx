import { Chip, ChipProps } from '@mui/material';
import { WhatsappSentStatus } from '~/types/aries-proxy/whatsapp';

export const whatsappSentStatusLabels: Record<WhatsappSentStatus, string> = {
  sent: 'Inviato',
  delivered: 'Consegnato',
  read: 'Letto',
  failed: 'Fallito',
  skipped: 'Non inviato (disiscritto)',
};

// Partial: the server may add a status the web doesn't know yet.
const labels: Partial<Record<string, string>> = whatsappSentStatusLabels;

const statusColors: Partial<Record<string, ChipProps['color']>> = {
  sent: 'default',
  delivered: 'info',
  read: 'success',
  failed: 'error',
  skipped: 'warning',
};

/** Delivery status of a WhatsApp message we sent (campaign template or operator reply). */
const WhatsappSentStatusChip: React.FC<{ status: WhatsappSentStatus }> = ({ status }) => (
  <Chip size="small" variant="outlined" color={statusColors[status] ?? 'default'} label={labels[status] ?? status} />
);

export default WhatsappSentStatusChip;
