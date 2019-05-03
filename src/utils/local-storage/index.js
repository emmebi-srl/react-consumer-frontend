// Put the object into storage
export const setLocalStorageItem = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// Retrieve the object from storage
export const getLocalStorageItem = (key) => {
  const res = localStorage.getItem(key);
  return res && JSON.parse(res);
}