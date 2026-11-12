import { browserSupportsWebAuthn, WebAuthnError } from '@simplewebauthn/browser';

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
