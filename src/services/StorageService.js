const storage = sessionStorage;

export const setStorageItem = (key, value) => {
  storage.setItem(key, value);
};

export const getStorageItem = (key) => {
  return storage.getItem(key);
};

export const removeStorageItem = (key) => {
  storage.removeItem(key);
};

export const clearStorage = () => {
    storage.clear();
}