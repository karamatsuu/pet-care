import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleAuthExpired = () => {
      api.auth.clearToken();
      setUser(null);
    };

    window.addEventListener("petjournal:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("petjournal:auth-expired", handleAuthExpired);
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const result = await api.auth.login(credentials);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (payload) => {
    const result = await api.auth.register(payload);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser, register }),
    [user, loading, login, logout, refreshUser, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
