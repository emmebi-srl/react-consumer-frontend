import { DeleteOutlined } from '@mui/icons-material';
import { Alert, Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import PasskeyList from '~/components/Users/PasskeyList';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useDeleteUserAccountPasskey, useUserAccountPasskeys } from '~/proxies/aries-proxy/user-accounts';
import { UserPasskey } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';

/**
 * Passkeys of another user. The administrator can only revoke them (e.g. a lost phone): a passkey is created by the
 * user from their own profile, on their device.
 */
const UserPasskeysCard: React.FC<{ userId: number }> = ({ userId }) => {
  const snackbar = useSnackbar();
  const modal = useModal();
  const passkeysQuery = useUserAccountPasskeys(userId);
  const deletePasskey = useDeleteUserAccountPasskey();

  const revoke = async (passkey: UserPasskey) => {
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Revoca passkey',
        text: `Revocare la passkey "${passkey.name}"? L'utente non potrà più usarla per accedere.`,
      },
    });
    if (result.action !== 'YES') return;

    try {
      await deletePasskey.mutateAsync({ userId, passkeyId: passkey.id });
      snackbar.success('Passkey revocata');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile revocare la passkey.'));
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Passkey"
        subheader="Le crea l'utente dal suo profilo; qui puoi revocarle, ad esempio se perde il telefono"
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
      />
      <CardContent>
        {passkeysQuery.isError ? (
          <Alert severity="error">Non è stato possibile caricare le passkey.</Alert>
        ) : (
          <PasskeyList
            passkeys={passkeysQuery.data ?? []}
            emptyText={passkeysQuery.isLoading ? 'Caricamento…' : 'Nessuna passkey.'}
            renderActions={(passkey) => (
              <Tooltip title="Revoca">
                <IconButton aria-label="Revoca" color="error" onClick={() => revoke(passkey)}>
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UserPasskeysCard;
