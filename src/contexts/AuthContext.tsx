import LoadingSpinner from "@/components/LoadingSpinner";
import { useGetUserData } from "@/hooks/useSiteData";
import api from "@/services/api";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfileModel {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_status: string;
  gender: string;
  last_login: string;
  user_role: string;
  date_joined: string;
  nationality: string;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: UserProfileModel | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const { data: user, isLoading: isUserLoading, error, refetch } = useGetUserData();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (token && !isUserLoading) {
      if (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
      setLoading(false);
    } else if (!token) {
      setLoading(false);
    }
  }, [token, isUserLoading, error]);

  const login = async (phone: string, password: string): Promise<void> => {
    try {
      const response = await api.post("/admin_apis/users/login/", { phone, password });
      const token = response.data.data.access;
      localStorage.setItem("token", token);
      const refreshToken = response.data.data.refresh;
      localStorage.setItem("refresh_token", refreshToken);
      setIsAuthenticated(true);
      await refetch();
    } catch (error: any) {
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      const errorMessage = error.response?.data.data || "Login failed. Please try again.";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
    const refresh_token = localStorage.getItem("refresh_token");
      await api.post("admin_apis/users/logout/", { refresh_token });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
  };

  const value = {
    isAuthenticated,
    user: user || null,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center h-screen text-lg font-semibold">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};