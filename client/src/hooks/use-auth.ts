import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import type { AuthResponse } from "@shared/schema";

export interface User {
  id: number;
  username: string;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  activityLevel?: string | null;
  dietPreference?: string | null;
  gender?: string | null;
  healthIssues?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (data: any) => Promise<AuthResponse>;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const token = authClient.getToken();
    if (token) {
      // Try to fetch user data to verify token is still valid
      // For now, just set loading to false since we have a token
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: any) => {
    const response = await authClient.signup(data);
    setUser(response.user);
    return response;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authClient.login({ username, password });
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(() => {
    authClient.logout();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user || !!authClient.getToken(),
    isLoading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
