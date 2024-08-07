import axios from "axios";

declare module "axios" {
  export interface AxiosResponse<T = any, D = any> {
    data: number;
    status: number;
    statusText: string;
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
    config: InternalAxiosRequestConfig<D>;
    request?: any;
  }
}
