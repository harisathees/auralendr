import axios, { type AxiosResponse } from "axios";

// 🔒 Single Source of Truth (NO fallback)
const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Request Interceptor
 * - Attach Bearer token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global Response Interceptor
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 419) {
      const hasSession =
        localStorage.getItem("token") || localStorage.getItem("user");

      if (hasSession && !window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
