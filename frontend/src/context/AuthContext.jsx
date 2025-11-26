import { createContext, useContext, useState } from "react";
import http from "../api/http";

const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(getUserFromStorage());

  const login = async (email, password) => {
    try {
      const res = await http.post("/login", { email, password });
      
      if (!res.data || !res.data.token || !res.data.user) {
        throw new Error("Invalid response from server");
      }

      const userData = {
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
        branch_id: res.data.user.branch_id,
      };

      setToken(res.data.token);
      setUser(userData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        // Request made but no response
        throw new Error("Network error. Please check your connection.");
      } else {
        // Something else happened
        throw new Error(error.message || "Login failed");
      }
    }
  };

  const logout = () => {
    http.post("/logout");
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
