import { browserSupportsWebAuthn, WebAuthnError } from '@simplewebauthn/browser';
import { getLocalStorageItem, KEY_PASSKEY_PROMPT_SHOWN, setLocalStorageItem } from '~/utils/local-storage';

/**
 * Passkey login is configured per company with `VITE_PASSKEY_ENABLED` (today only `.env.emmebi`), and needs a
 * browser with WebAuthn on HTTPS (or localhost). The API has its own switch (`Authentication:Passkey`).
 */
export const isPasskeyConfigured = () => import.meta.env.VITE_PASSKEY_ENABLED === 'true';

/** Configured and usable in this browser: the login button and "Aggiungi passkey" need both. */
export const isPasskeyEnabled = () => isPasskeyConfigured() && browserSupportsWebAuthn();

/** The user closed the browser/password manager dialog, or it timed out: not an error to show. */
export const isPasskeyCancelled = (error: unknown) =>
  (error instanceof Error && error.name === 'NotAllowedError') ||
  (error instanceof WebAuthnError && error.code === 'ERROR_CEREMONY_ABORTED');

/** The authenticator already holds a passkey of this user (excludeCredentials). */
export const isPasskeyAlreadyRegistered = (error: unknown) =>
  error instanceof WebAuthnError && error.code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED';

const readPromptedUserIds = (): number[] => {
  try {
    const value = getLocalStorageItem<unknown>(KEY_PASSKEY_PROMPT_SHOWN);
    return Array.isArray(value) ? value.filter((id): id is number => typeof id === 'number') : [];
  } catch {
    return [];
  }
};

/** The suggestion to add a passkey is shown once per user on each device. */
export const wasPasskeyPromptShown = (userId: number) => readPromptedUserIds().includes(userId);

export const markPasskeyPromptShown = (userId: number) => {
  try {
    const ids = readPromptedUserIds();
    if (!ids.includes(userId)) setLocalStorageItem(KEY_PASSKEY_PROMPT_SHOWN, [...ids, userId]);
  } catch {
    // Storage blocked (private mode): the suggestion may come back, nothing else breaks.
  }
};

/** Default name of a new passkey, from the browser platform: the user can change it. */
export const getDefaultPasskeyName = () => {
  const userAgent = navigator.userAgent;
  if (/iPhone/i.test(userAgent)) return 'iPhone';
  if (/iPad/i.test(userAgent)) return 'iPad';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac';
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return 'Passkey';
};
