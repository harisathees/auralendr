import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../../api/apiClient";
import * as authService from "../../api/authService";

import type { User } from "../../types/models";

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  can: (permission: string) => boolean;
  booting: boolean; // Add booting state
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

  const [booting, setBooting] = useState(true);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<User | null>(getUserFromStorage());

  const logout = (): void => {
    // Only call API if we think we have a session
    if (token || user) {
      api.post("/api/logout").catch(() => { });
    }
    setToken(null);
    setUser(null);
    localStorage.clear();
    // Force reload to clear memory state if needed, or just navigate
    // window.location.href = '/login'; 
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await authService.login({ email, password });

      if (!res.data?.user) {
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

      // 1. Set State
      setUser(userData);

      // Token is optional for Cookie auth, but we keep it for compatibility if used
      const token = res.data.token || "session";
      setToken(token);

      // 2. Persist
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
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

  // Safe User Fetching
  const fetchUser = async () => {
    try {
      const res = await authService.me();
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
    } catch (error: any) {
      // If 401, it means our session is actually dead.
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Booting Logic
  useEffect(() => {
    const initializeAuth = async () => {
      // If we have a token/user locally, verify it with the server
      if (token) {
        try {
          await fetchUser();
        } catch {
          // If fetch fails, handled inside fetchUser (logout on 401)
        }
      }
      setBooting(false);
    };

    initializeAuth();
  }, []); // Run ONCE on mount

  // 💓 Heartbeat: Check session validity every 60s
  useEffect(() => {
    if (!token || booting) return; // Don't run during boot

    const interval = setInterval(() => {
      authService.me().catch(() => {
        // Interceptor or global handler will catch 401
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [token, booting]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, can, booting }}>
      {children}
    </AuthContext.Provider>
  );
};
