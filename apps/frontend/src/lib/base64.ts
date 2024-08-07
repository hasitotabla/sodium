export const base64Encode = (str: string): string => {
  return btoa(str);
};

export const base64Decode = (str: string): string => {
  return atob(str);
};
