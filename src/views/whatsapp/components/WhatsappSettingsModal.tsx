import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useSaveWhatsappSettings, useWhatsappSettings } from '~/proxies/aries-proxy/whatsapp';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { emailAddressListSchema } from '~/views/campaigns/emailAddressListSchema';

/**
 * Fallback recipients of the received WhatsApp messages: used for the messages not linked to a campaign
 * and for campaigns without their own notification addresses.
 */
const WhatsappSettingsModal = ({ closeModal }: ModalProps) => {
  const snackbar = useSnackbar();
  const settingsQuery = useWhatsappSettings();
  const saveMutation = useSaveWhatsappSettings();
  const [addresses, setAddresses] = useState('');
  const [error, setError] = useState<string | null>(null);
  const close = () => closeModal({ action: 'CLOSE' });

  useEffect(() => {
    if (settingsQuery.data) setAddresses(settingsQuery.data.fallbackNotificationAddresses ?? '');
  }, [settingsQuery.data]);

  const save = async () => {
    const parsed = emailAddressListSchema.safeParse(addresses);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Indirizzi non validi');
      return;
    }
    try {
      await saveMutation.mutateAsync({ fallbackNotificationAddresses: parsed.data });
      snackbar.success('Impostazioni salvate.');
      close();
    } catch (saveError) {
      snackbar.error(getApiErrorMessage(saveError, 'Non è stato possibile salvare le impostazioni.'));
    }
  };

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>Impostazioni WhatsApp</DialogTitle>
      <DialogContent>
        {settingsQuery.isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : settingsQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(settingsQuery.error, 'Non sono riuscito a caricare le impostazioni.')}
          </Alert>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Ogni messaggio ricevuto viene inoltrato per email. Se il messaggio non è legato a una campagna (o la
              campagna non ha destinatari per le risposte), va a questi indirizzi.
            </Typography>
            <TextField
              label="Destinatari messaggi senza campagna"
              fullWidth
              multiline
              value={addresses}
              onChange={(event) => {
                setAddresses(event.target.value);
                setError(null);
              }}
              error={!!error}
              helperText={
                error ??
                'Indirizzi separati da ";". Se vuoto, usa l\'indirizzo di risposta dell\'account email campagne.'
              }
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Annulla</Button>
        <Button
          variant="contained"
          onClick={() => void save()}
          disabled={!settingsQuery.data || saveMutation.isPending}
        >
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WhatsappSettingsModal;
