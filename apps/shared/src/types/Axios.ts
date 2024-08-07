import { AxiosResponse } from "axios";

export type ApiError = {
  message: string;

  /**
   * Mostly for DTO validation errors
   */
  additionalInfo?: Array<{ parameters: string; message: string }>;

  /**
   * Provided by DTO validation
   */
  statusCode?: number;
};

export type ApiResponse<T = any> = ({ success: true } & AxiosResponse<T>) | ({ success: false } & AxiosResponse<ApiError>);
