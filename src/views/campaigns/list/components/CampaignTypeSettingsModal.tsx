import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { ModalProps } from '~/modals/Modal';
import { useCampaignTypes } from '~/proxies/aries-proxy/campaigns';
import CampaignTypeCustomerTypeSettings from './CampaignTypeCustomerTypeSettings';

interface CampaignTypeSettingsModalProps extends ModalProps {
  closeModal: (props?: { action: 'CLOSE' }) => void;
}

/**
 * Settings of the campaign types (they apply to every campaign of the type), opened from the campaign list.
 * Today: WhatsApp on/off per customer type. Every switch saves on its own.
 */
const CampaignTypeSettingsModal = (props: CampaignTypeSettingsModalProps) => {
  const { data, isLoading } = useCampaignTypes();
  const campaignTypes = data?.campaignTypes ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const campaignType = campaignTypes.find((type) => type.id === selectedId) ?? campaignTypes[0];

  const close = () => props.closeModal({ action: 'CLOSE' });

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Impostazioni tipi campagna</DialogTitle>
      <DialogContent>
        <Stack direction="column" sx={{ gap: 3, pt: 1 }}>
          <TextField
            label="Tipo campagna"
            select
            fullWidth
            disabled={isLoading}
            value={campaignType?.id ?? ''}
            onChange={(event) => setSelectedId(Number(event.target.value))}
          >
            {campaignTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          {campaignType && <CampaignTypeCustomerTypeSettings key={campaignType.id} campaignType={campaignType} />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignTypeSettingsModal;
