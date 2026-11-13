import { Add, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import PasskeyNameModal from '~/components/Modals/PasskeyNameModal';
import PasskeyList from '~/components/Users/PasskeyList';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import useAddPasskey from '~/hooks/useAddPasskey';
import { useDeleteMyPasskey, useMyPasskeys, useRenameMyPasskey } from '~/proxies/aries-proxy/users';
import { UserPasskey } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { isPasskeyEnabled } from '~/utils/passkey-utils';

/**
 * Passkeys of the logged-in user. A passkey is created on this device (or on a phone through the QR code of the
 * browser) and is then offered by "Accedi con passkey" on the login page.
 */
const ProfilePasskeysCard: React.FC = () => {
  const snackbar = useSnackbar();
  const modal = useModal();
  const passkeysQuery = useMyPasskeys();
  const { addPasskey, isPending: isAddingPasskey } = useAddPasskey();
  const renamePasskey = useRenameMyPasskey();
  const deletePasskey = useDeleteMyPasskey();
  const canAdd = isPasskeyEnabled();

  const rename = async (passkey: UserPasskey) => {
    const result = await modal.showModal({
      component: PasskeyNameModal,
      props: { title: 'Rinomina passkey', initialName: passkey.name, confirmLabel: 'Salva' },
    });
    if (result.action !== 'CONFIRM') return;

    try {
      await renamePasskey.mutateAsync({ passkeyId: passkey.id, name: result.name });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile rinominare la passkey.'));
    }
  };

  const remove = async (passkey: UserPasskey) => {
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina passkey',
        text: `Eliminare la passkey "${passkey.name}"? Non potrai più usarla per accedere ad Aries.`,
        alertText:
          'Toglila anche dal gestore delle password del dispositivo, altrimenti il browser continuerà a proporla.',
        alertSeverity: 'info',
      },
    });
    if (result.action !== 'YES') return;

    try {
      await deletePasskey.mutateAsync(passkey.id);
      snackbar.success('Passkey eliminata');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile eliminare la passkey.'));
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Passkey"
        subheader="Accedi senza password, con impronta, volto o PIN del dispositivo"
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
        action={
          canAdd ? (
            <Button startIcon={<Add />} variant="contained" loading={isAddingPasskey} onClick={() => addPasskey()}>
              Aggiungi passkey
            </Button>
          ) : null
        }
      />
      <CardContent>
        {!canAdd ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Questo browser non supporta le passkey.
          </Alert>
        ) : null}
        {passkeysQuery.isError ? (
          <Alert severity="error">Non è stato possibile caricare le passkey.</Alert>
        ) : (
          <PasskeyList
            passkeys={passkeysQuery.data?.passkeys ?? []}
            emptyText={
              passkeysQuery.isLoading ? 'Caricamento…' : 'Nessuna passkey: aggiungine una per accedere più velocemente.'
            }
            renderActions={(passkey) => (
              <Box sx={{ display: 'flex' }}>
                <Tooltip title="Rinomina">
                  <IconButton aria-label="Rinomina" onClick={() => rename(passkey)}>
                    <EditOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Elimina">
                  <IconButton aria-label="Elimina" color="error" onClick={() => remove(passkey)}>
                    <DeleteOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePasskeysCard;
