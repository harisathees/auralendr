// import axios, { type AxiosResponse } from "axios";

// // 1. Single Source of Truth for Base URL
// const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// const api = axios.create({
//   baseURL, // e.g. "http://localhost:8000" - No /api appended automatically
//   // withCredentials: true, // REMOVED: No longer using cookies
//   headers: {
//     Accept: "application/json", // Force JSON response
//     "Content-Type": "application/json",
//   },
//   timeout: 15000,
// });

// // For Sanctum routes that are NOT under /api
// export const baseApi = axios.create({
//   baseURL: "/", // Vite proxy will handle /sanctum
//   withCredentials: true,
//   headers: {
//     Accept: "application/json",
//   },
// });


// /**
//  * Request Interceptor
//  * - Attaches Bearer Token from localStorage
//  */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /**
//  * Response Interceptor (GLOBAL)
//  */
// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   (error) => {
//     const status = error.response?.status;

//     // 🔐 Unauthorized (401) or Token Expired (419) → Global Logout
//     if (status === 401 || status === 419) {
//       // Prevent loop: Only logout if we actually have a user/token locally
//       // AND we are not already on the login page
//       const hasSession = localStorage.getItem("token") || localStorage.getItem("user");

//       if (hasSession && !window.location.pathname.startsWith("/login")) {
//         // Clear local storage
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");

//         // Redirect
//         window.location.href = "/login";
//       }

//       return Promise.reject(error);
//     }

//     // 🚫 Forbidden
//     if (status === 403) {
//       console.warn("Access denied");
//     }

//     // 🧯 Server error
//     if (status >= 500) {
//       console.error("Server error");
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;



import axios, { type AxiosResponse } from "axios";

// 🔒 Single Source of Truth (NO fallback)
const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const api = axios.create({
  baseURL, // e.g. https://auralendr-production.onrender.com/api
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
