/* eslint-disable @typescript-eslint/no-explicit-any */
export const LocalStorageGetItem = (name: any) => {
  if (typeof window !== "undefined" && localStorage) {
    const user = localStorage.getItem(name);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const LocalStorageSetItem = (name: any, value: any) => {
  if (typeof window !== "undefined" && localStorage) {
    localStorage.setItem(name, JSON.stringify(value));
    return true;
  }
  return false;
};