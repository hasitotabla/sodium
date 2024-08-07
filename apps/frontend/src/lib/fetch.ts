import axios, { type AxiosRequestConfig } from "axios";
import { type ApiResponse } from "$shared/types/Axios";
import { type IRequest } from "$shared/requests";
import { ACCESS_TOKEN_EXPIRATION_IGNORED_URLS } from "src/consts";

function isAccessTokenExpired() {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken || accessToken === "undefined") return true;

  try {
    const jwt = accessToken.split(".")[1];
    const jwtObject = JSON.parse(atob(jwt));

    return jwtObject.exp < Date.now() / 1000;
  } catch (error) {
    console.error("Invalid access token", error);
    return false;
  }
}

async function requestNewAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  const response = await axios.post<{ accessToken?: string }>("/auth/refresh", { refreshToken });
  if (response.status >= 400 || !response?.data?.accessToken) return false;

  const { accessToken } = response.data;
  localStorage.setItem("access_token", accessToken);

  return true;
}

export async function fetch<T = any>(url: string, config?: AxiosRequestConfig<any>): Promise<ApiResponse<T>>;
export async function fetch<K extends keyof IRequest>(url: K, config?: AxiosRequestConfig<any>): Promise<ApiResponse<IRequest[K]>> {
  if (!config) config = {};

  if (isAccessTokenExpired()) {
    const success = await requestNewAccessToken();

    if (!success) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  const csrfToken = sessionStorage.getItem("csrf_token");
  if (csrfToken) {
    config.headers = { ...config.headers, "x-csrf-token": csrfToken };
  }

  const response = (await axios(url, config)) as ApiResponse<IRequest[K]>;
  const isError = response.status >= 400;

  response.success = !isError;
  if (response.headers["x-csrf-token"]) {
    sessionStorage.setItem("csrf_token", response.headers["x-csrf-token"]);
  }

  return response;
}
