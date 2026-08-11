import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  activeOutletId: string;
  setActiveOutletId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('pos_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeOutletId, setActiveOutletId] = useState<string>(() => {
    if (user?.outletId) return user.outletId;
    return localStorage.getItem('pos_active_outlet') || '00000000-0000-0000-0000-000000000001';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pos_user', JSON.stringify(user));
      localStorage.setItem('pos_token', user.token);
      if (user.outletId) {
        setActiveOutletId(user.outletId);
      }
    } else {
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pos_active_outlet', activeOutletId);
  }, [activeOutletId]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        activeOutletId,
        setActiveOutletId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
