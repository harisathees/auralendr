import api from "./apiClient";

export const csrf = () => api.get("/sanctum/csrf-cookie");

export const login = async (data: {
  email: string;
  password: string;
}) => {
  await csrf(); // 🔐 IMPORTANT
  return api.post("/login", data);
};

export const logout = () => api.post("/logout");

export const me = () => api.get("/me");
