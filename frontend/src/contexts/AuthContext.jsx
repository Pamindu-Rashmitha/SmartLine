import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartline_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartline_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('smartline_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('smartline_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    const res = await authApi.login({ usernameOrEmail, password });
    if (res.success && res.data) {
      const { accessToken, user: authUser } = res.data;
      setToken(accessToken);
      setUser(authUser);
      localStorage.setItem('smartline_token', accessToken);
      localStorage.setItem('smartline_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.data) {
      const { accessToken, user: authUser } = res.data;
      setToken(accessToken);
      setUser(authUser);
      localStorage.setItem('smartline_token', accessToken);
      localStorage.setItem('smartline_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smartline_token');
    localStorage.removeItem('smartline_user');
  }, []);

  const hasRole = useCallback((requiredRoles) => {
    if (!user || !user.role) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesArray.includes(user.role);
  }, [user]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    hasRole,
    isAdmin: user?.role === 'ADMIN',
    isApplicant: user?.role === 'APPLICANT',
    isLoanOfficer: user?.role === 'LOAN_OFFICER',
    isCreditManager: user?.role === 'CREDIT_MANAGER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
