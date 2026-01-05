import api from "./apiClient";


export const login = async (data: {
  email: string;
  password: string;
}) => {
  // await csrf(); // 🔐 NOT NEEDED for PAT
  return api.post("/api/login", data);
};

export const logout = () => api.post("/api/logout");


export const me = () => api.get("/api/me");
