import { createContext, useState, useEffect } from "react";
import { loginAdmin } from "../api/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(
    () => JSON.parse(localStorage.getItem("admin")) || null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (admin) {
      localStorage.setItem("admin", JSON.stringify(admin));
    } else {
      localStorage.removeItem("admin");
    }
  }, [admin]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const user = await loginAdmin(credentials);
      setAdmin(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
