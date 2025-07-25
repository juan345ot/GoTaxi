import { createContext, useState, useEffect } from "react";
import { loginAdmin } from "../api/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Lee el admin desde localStorage o sessionStorage según lo último
  const getStoredAdmin = () => {
    try {
      const l = localStorage.getItem("admin");
      if (l) return JSON.parse(l);
      const s = sessionStorage.getItem("admin");
      if (s) return JSON.parse(s);
    } catch {
      localStorage.removeItem("admin");
      sessionStorage.removeItem("admin");
    }
    return null;
  };

  const [admin, setAdmin] = useState(getStoredAdmin);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persistencia de sesión (localStorage/sessionStorage)
  const storeAdmin = (admin, remember) => {
    if (remember) {
      localStorage.setItem("admin", JSON.stringify(admin));
      sessionStorage.removeItem("admin");
    } else {
      sessionStorage.setItem("admin", JSON.stringify(admin));
      localStorage.removeItem("admin");
    }
  };

  useEffect(() => {
    if (admin) {
      storeAdmin(admin, admin.remember);
    } else {
      localStorage.removeItem("admin");
      sessionStorage.removeItem("admin");
    }
  }, [admin]);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await loginAdmin(credentials);
      if (error) {
        setError(error);
        return { error };
      }
      setAdmin({ ...data, remember: credentials.remember });
      return { data };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    sessionStorage.removeItem("admin");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      admin,
      roles: admin?.roles || [],
      login,
      logout,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}
