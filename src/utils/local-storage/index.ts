export const KEY_ARIES_API_TOKEN = 'ARIES_API_TOKEN';

// Put the object into storage
export const setLocalStorageItem = <T>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value));

// Retrieve the object from storage
export const getLocalStorageItem = <T>(key: string): T | null => {
  const res = localStorage.getItem(key);
  return res ? (JSON.parse(res) as T) : null;
};
