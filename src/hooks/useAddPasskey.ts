import PasskeyNameModal from '~/components/Modals/PasskeyNameModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useRegisterPasskey } from '~/proxies/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getDefaultPasskeyName, isPasskeyAlreadyRegistered, isPasskeyCancelled } from '~/utils/passkey-utils';

interface AddPasskeyTexts {
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel?: string;
}

const DEFAULT_TEXTS: AddPasskeyTexts = {
  title: 'Nuova passkey',
  text: 'Il browser ti chiederà di confermare con impronta, volto, PIN del dispositivo o con il telefono.',
  confirmLabel: 'Continua',
};

/**
 * Asks the passkey name, then lets the browser create it for the logged-in user. Shared by the profile and the
 * suggestion shown after the first login. Closing the browser dialog is not an error.
 */
const useAddPasskey = () => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const registerPasskey = useRegisterPasskey();

  const addPasskey = async (texts: AddPasskeyTexts = DEFAULT_TEXTS) => {
    const result = await modal.showModal({
      component: PasskeyNameModal,
      props: { ...texts, initialName: getDefaultPasskeyName() },
    });
    if (result.action !== 'CONFIRM') return;

    try {
      await registerPasskey.mutateAsync({ name: result.name });
      snackbar.success('Passkey creata: ora puoi usarla per accedere');
    } catch (error) {
      if (isPasskeyCancelled(error)) return;
      if (isPasskeyAlreadyRegistered(error)) {
        snackbar.info('Questo dispositivo ha già una tua passkey.');
        return;
      }
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare la passkey.'));
    }
  };

  return { addPasskey, isPending: registerPasskey.isPending };
};

export default useAddPasskey;
