import { createContext, useState, useEffect } from 'react';
import { loginAdmin } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  const login = async (credentials) => {
    const { data } = await loginAdmin(credentials);
    setAdmin(data);
  };

  const logout = () => setAdmin(null);

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
