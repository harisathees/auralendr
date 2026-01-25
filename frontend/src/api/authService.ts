import api from "./apiClient";


export const login = async (data: {
  email: string;
  password: string;
}) => {
  // await csrf(); // 🔐 NOT NEEDED for PAT
  return api.post("/login", data);
};

export const logout = () => api.post("/logout");


export const me = () => api.get("/me");
