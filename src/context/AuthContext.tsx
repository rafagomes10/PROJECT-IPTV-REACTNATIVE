import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserCredentials } from '../types';

interface AuthContextData {
  credentials: UserCredentials | null;
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);

  const login = useCallback((newCredentials: UserCredentials) => {
    setCredentials(newCredentials);
  }, []);

  const logout = useCallback(() => {
    setCredentials(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        credentials,
        isAuthenticated: !!credentials,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
