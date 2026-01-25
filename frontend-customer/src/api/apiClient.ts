import axios from "axios";

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
  timeout: 30000,
});

export default api;
