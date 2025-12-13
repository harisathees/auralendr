import{
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import http from "../api/http";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branch_id: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const res = await http.post("/login", { email, password });

      if (!res.data?.token || !res.data?.user) {
        throw new Error("Invalid response from server");
      }

      const userData: User = {
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

  const logout = (): void => {
    http.post("/logout"); // no need await
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
