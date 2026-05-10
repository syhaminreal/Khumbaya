import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "../config/env";
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
type ApiErrorData = {
  message?: string;
  error?: string;
};
let getToken: () => string | null = () => null;
let onUnauthorized: (() => void | Promise<void>) | null = null;

export const setAuthTokenGetter = (fn: () => string | null) => {
  getToken = fn;
};

export const setOnUnauthorizedHandler = (
  fn: (() => void | Promise<void>) | null
) => {
  onUnauthorized = fn;
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("📡 API Request:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });

    return config;
  },
  (error: AxiosError<ApiErrorData>) => {
    const message =
      error.response?.data?.message?.split(":").slice(1).join(":").trim() ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    return Promise.reject({
      ...error,
      message,
      isAxiosError: true,
    });
  }
);

// ✅ Response Interceptor (middleware for incoming responses)
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.data);
    return response;
  },
  (error: AxiosError<ApiErrorData>) => {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      onUnauthorized?.();
    }

    const message =
      error.response?.data?.message?.split(":").slice(1).join(":").trim() ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    return Promise.reject({
      ...error,
      message,
      isAxiosError: true,
    });
  }
);
//To remove the circular dependency on the authstore
export async function getMe(token: string) {
  return await axios.get(`/user/me`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
       });

}
export default api;
