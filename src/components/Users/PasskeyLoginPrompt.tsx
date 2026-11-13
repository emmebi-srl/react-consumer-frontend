import { useEffect, useRef } from 'react';
import useAddPasskey from '~/hooks/useAddPasskey';
import { useMyPasskeys, useUserMe } from '~/proxies/aries-proxy/users';
import { isPasskeyEnabled, markPasskeyPromptShown, wasPasskeyPromptShown } from '~/utils/passkey-utils';

/**
 * After the login, suggests adding a passkey to the users that have none. Shown once per user on each device
 * (flag in localStorage, kept across logouts), whatever the answer: later the user adds it from "Il mio profilo".
 * Mounted in the private area layout; renders nothing.
 */
const PasskeyLoginPrompt: React.FC = () => {
  const { data: me } = useUserMe();
  const userId = me?.users.at(0)?.id;
  const shouldCheck = isPasskeyEnabled() && !!userId && !wasPasskeyPromptShown(userId);
  const { data: passkeys } = useMyPasskeys(shouldCheck);
  const { addPasskey } = useAddPasskey();
  const handled = useRef(false);

  useEffect(() => {
    if (!shouldCheck || !userId || !passkeys || handled.current) return;
    handled.current = true;
    // Marked before opening: closing the tab with the modal open counts as shown too.
    markPasskeyPromptShown(userId);
    if (passkeys.passkeys.length > 0) return;

    void addPasskey({
      title: 'Accedi più velocemente con una passkey',
      text:
        'Con una passkey entri in Aries con impronta, volto o PIN del dispositivo, senza scrivere la password. ' +
        'Scegli un nome per riconoscerla: il browser ti chiederà di confermare.',
      confirmLabel: 'Aggiungi passkey',
      cancelLabel: 'Non ora',
    });
  }, [shouldCheck, userId, passkeys, addPasskey]);

  return null;
};

export default PasskeyLoginPrompt;
