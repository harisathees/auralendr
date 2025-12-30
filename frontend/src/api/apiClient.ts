import axios, { type AxiosResponse } from "axios";

// 1. Single Source of Truth for Base URL
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL, // e.g. "http://localhost:8000" - No /api appended automatically
  withCredentials: true, // ✅ REQUIRED for Sanctum Cookies
  headers: {
    Accept: "application/json", // Force JSON response
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Request Interceptor
 * - NO Bearer Token header needed (Sanctum uses cookies)
 * - We do NOT modify headers here anymore
 */
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor (GLOBAL)
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;

    // 🔐 Unauthorized (401) or Token Expired (419) → Global Logout
    if (status === 401 || status === 419) {
      // Prevent loop: Only logout if we actually have a user/token locally
      // AND we are not already on the login page
      const hasSession = localStorage.getItem("token") || localStorage.getItem("user");

      if (hasSession && !window.location.pathname.startsWith("/login")) {
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect
        window.location.href = "/login";
      }

      return Promise.reject(error);
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
