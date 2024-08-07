export const ACCESS_TOKEN_EXPIRATION_IGNORED_URLS: { [key: string]: boolean } = {
  "/stats": true,

  "/users/me": true,

  "/auth/login": true,
  "/auth/settings": true,
};
