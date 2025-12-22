import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true, // ✅ REQUIRED for Sanctum
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000, // prevent hanging requests
});

/**
 * Request Interceptor
 * - No Bearer token (Sanctum uses cookies)
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor (GLOBAL)
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;

    // 🔐 Unauthorized → logout
    if (status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // 🚫 Forbidden
    if (status === 403) {
      console.warn("Access denied");
    }

    // 🧯 Server error
    if (status >= 500) {
      console.error("Server error");
    }

    return Promise.reject(error);
  }
);

export default api;
