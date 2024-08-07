import { userStore } from "src/stores/User";

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  userStore.set(null);

  window.location.href = "/";
};
