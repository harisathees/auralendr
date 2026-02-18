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
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
  booting: boolean;
  refreshUser: () => Promise<void>;
  enableTransactions: boolean;
  enableTasks: boolean;
  enableReceiptPrint: boolean;
  enableEstimatedAmount: boolean;
  enableBankPledge: boolean;
  noBranchMode: boolean;
  enableApprovals: boolean;
  enableDataBackup: boolean;
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
  const [enableTransactions, setEnableTransactions] = useState<boolean>(false); // Default false
  const [enableTasks, setEnableTasks] = useState<boolean>(false); // Default false
  const [enableReceiptPrint, setEnableReceiptPrint] = useState<boolean>(false); // Default true
  const [enableEstimatedAmount, setEnableEstimatedAmount] = useState<boolean>(false); // Default false
  const [enableBankPledge, setEnableBankPledge] = useState<boolean>(false); // Default false
  const [noBranchMode, setNoBranchMode] = useState<boolean>(false); // Default false
  const [enableApprovals, setEnableApprovals] = useState<boolean>(false); // Default false
  const [enableDataBackup, setEnableDataBackup] = useState<boolean>(false); // Default false


  const logout = async (): Promise<void> => {
    // Only call API if we think we have a session
    if (token || user) {
      try {
        await api.post("/logout");
      } catch (e) { /* ignore error */ }
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
        phone_number: res.data.user.phone_number,
        photo_url: res.data.user.photo_url,
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
      const [userRes, settingsRes] = await Promise.all([
        authService.me(),
        api.get('/developer/settings/resolve').catch(() => ({ data: { enable_transactions: false, enable_tasks: false, enable_receipt_print: false, enable_estimated_amount: false, enable_bank_pledge: false, no_branch_mode: false, enable_approvals: false, enable_data_backup: false } }))
      ]);

      const res = userRes;
      const userData: User = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        phone_number: res.data.phone_number,
        photo_url: res.data.photo_url,
        role: res.data.role,
        branch_id: res.data.branch_id,
        branch: res.data.branch,
        permissions: res.data.permissions || [],
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      if (settingsRes.data) {
        setEnableTransactions(!!settingsRes.data.enable_transactions);
        setEnableTasks(!!settingsRes.data.enable_tasks);
        setEnableReceiptPrint(!!settingsRes.data.enable_receipt_print);
        setEnableEstimatedAmount(!!settingsRes.data.enable_estimated_amount);
        setEnableBankPledge(settingsRes.data.enable_bank_pledge !== undefined ? !!settingsRes.data.enable_bank_pledge : false);
        setNoBranchMode(settingsRes.data.no_branch_mode !== undefined ? !!settingsRes.data.no_branch_mode : false);
        setEnableApprovals(settingsRes.data.enable_approvals !== undefined ? !!settingsRes.data.enable_approvals : false);
        setEnableDataBackup(settingsRes.data.enable_data_backup !== undefined ? !!settingsRes.data.enable_data_backup : false);
      }

    } catch (error: any) {
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
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [token, booting]);


  return (
    <AuthContext.Provider value={{ token, user, login, logout, can, booting, refreshUser: fetchUser, enableTransactions, enableTasks, enableReceiptPrint, enableEstimatedAmount, enableBankPledge, noBranchMode, enableApprovals, enableDataBackup }}>
      {children}
    </AuthContext.Provider>
  );
};
