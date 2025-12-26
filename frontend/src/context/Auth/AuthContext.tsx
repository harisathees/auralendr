import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../../api/apiClient";

import type { User } from "../../types/models";

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const getUserFromStorage = (): User | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<User | null>(getUserFromStorage());

  const logout = (): void => {
    api.post("/logout"); // no need await
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await api.post("/login", { email, password });

      if (!res.data?.token || !res.data?.user) {
        throw new Error("Invalid response from server");
      }

      const userData: User = {
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
        branch_id: res.data.user.branch_id,
        branch: res.data.user.branch,
        permissions: res.data.user.permissions || [],
      };

      setToken(res.data.token);
      setUser(userData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response) {
        throw new Error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.message || "Login failed");
      }
    }
  };

  const can = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'developer' || user.role === 'superadmin') return true;
    return user.permissions?.includes(permission) || false;
  };

  // Fetch fresh user data on mount to ensure permissions are up to date
  useEffect(() => {
    if (token) {
      api.get("/me")
        .then(res => {
          const userData: User = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
            branch_id: res.data.branch_id,
            branch: res.data.branch,
            permissions: res.data.permissions || [],
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch((err) => {
          // Only logout if 401 Unauthorized
          if (err.response && err.response.status === 401) {
            logout();
          }
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
};
