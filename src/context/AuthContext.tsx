import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, AuthUser, LoginAuditItem } from '../services/authApi';

interface AuthContextType {
  user: AuthUser | null;
  auditLog: LoginAuditItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (user: AuthUser) => void;
  logoutUser: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [auditLog, setAuditLog] = useState<LoginAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current session from server cookies
  const fetchSession = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      if (data && data.user) {
        setUser(data.user);
        setAuditLog(data.auditLog || []);
      }
    } catch {
      setUser(null);
      setAuditLog([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();

    // Listen for session expiry event from Axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setAuditLog([]);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [fetchSession]);

  const loginUser = (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    fetchSession();
  };

  const logoutUser = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout notice:', e);
    } finally {
      setUser(null);
      setAuditLog([]);
    }
  };

  const logoutAllDevices = async () => {
    try {
      await authApi.logoutAllDevices();
    } catch (e) {
      console.warn('Logout all notice:', e);
    } finally {
      setUser(null);
      setAuditLog([]);
    }
  };

  const updateName = async (newName: string) => {
    const res = await authApi.updateProfile({ name: newName });
    setUser(res.user);
  };

  const refreshUserData = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        auditLog,
        isLoading,
        isAuthenticated: Boolean(user),
        loginUser,
        logoutUser,
        logoutAllDevices,
        updateName,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
