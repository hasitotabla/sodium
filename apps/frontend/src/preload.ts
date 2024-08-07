import axios from "axios";
import { navigate } from "svelte-routing";

axios.defaults.baseURL = import.meta.env.SHARED_API_URL;
axios.defaults.validateStatus = (status) => true;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

axios.interceptors.response.use((response) => {
  const pathUrl = response.config.url || "/";

  // TODO: Maybe add back later idk
  // if (response.status === 401 && !IGNORED_AUTH_REDIRECT_PATHS[pathUrl]) {
  //   localStorage.removeItem("token");
  //   navigate("/dashboard/auth");

  //   return response;
  // }

  const isError = response.status >= 400;
  if (isError) {
    console.error("Error", response);
  }

  return response;
});
