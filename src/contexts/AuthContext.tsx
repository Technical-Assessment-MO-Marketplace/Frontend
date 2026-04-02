import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";

interface User {
  id?: number;
  userId?: number;
  name?: string;
  email: string;
  role_id?: number;
  roleId?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("mo_token");
    const savedUser = localStorage.getItem("mo_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveAuth = (token: string, user: User) => {
    localStorage.setItem("mo_token", token);
    localStorage.setItem("mo_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    saveAuth(data.access_token, data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await authApi.register({ name, email, password });
    saveAuth(data.access_token, data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("mo_token");
    localStorage.removeItem("mo_user");
    setToken(null);
    setUser(null);
  }, []);

  const roleId = user?.role_id ?? user?.roleId;
  const isAdmin = roleId === 1;
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
