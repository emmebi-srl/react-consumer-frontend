export const KEY_ARIES_API_TOKEN = 'ARIES_API_TOKEN';
export const KEY_ARIES_LANDING_API_TOKEN = 'ARIES_LANDING_API_TOKEN';
/** Ids of the users already asked to add a passkey on this device. Kept across logouts. */
export const KEY_PASSKEY_PROMPT_SHOWN = 'ARIES_PASSKEY_PROMPT_SHOWN';

/** Keys that survive the logout (`LogoutView` clears everything else). */
export const KEYS_KEPT_ON_LOGOUT = [KEY_PASSKEY_PROMPT_SHOWN];

// Put the object into storage
export const setLocalStorageItem = <T>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value));

// Retrieve the object from storage
export const getLocalStorageItem = <T>(key: string): T | null => {
  const res = localStorage.getItem(key);
  return res ? (JSON.parse(res) as T) : null;
};
