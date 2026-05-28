/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  theme: "dark" | "light";
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Load auth parameters
    const storedToken = localStorage.getItem("futuristic_token");
    const storedUser = localStorage.getItem("futuristic_user");
    const storedTheme = localStorage.getItem("futuristic_theme") as "dark" | "light" | null;

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme("dark"); // Default dark cyber vibe
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("futuristic_token", newToken);
    localStorage.setItem("futuristic_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("futuristic_token");
    localStorage.removeItem("futuristic_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("futuristic_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("futuristic_theme", nextTheme);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        login,
        logout,
        updateUser,
        toggleTheme
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be called inside an AuthProvider component");
  }
  return context;
}
