import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile } from '../services/auth';

export type UserRole = 'admin' | 'employee' | 'client';
export type UserPermission = 'read' | 'write' | 'admin';

interface AuthContextType {
  user: UserProfile | null;
  userRole: UserRole | null;
  userPermission: UserPermission | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userPermission, setUserPermission] = useState<UserPermission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const determineUserRoleAndPermission = (profile: UserProfile): { role: UserRole; permission: UserPermission } => {
    // Admin tem todas as permissões
    if (profile.is_admin || profile.role === 'admin') {
      return { role: 'admin', permission: 'admin' };
    } 
    // Employee sempre tem permissão write (pode fazer upload)
    else if (profile.is_employee || profile.role === 'employee') {
      return { role: 'employee', permission: 'write' };
    } 
    // Client só tem permissão read
    else {
      return { role: 'client', permission: 'read' };
    }
  };

  const refreshUserData = async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setUserRole(null);
      setUserPermission(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getUserProfile();
      const { role, permission } = determineUserRoleAndPermission(profile);
      
      setUser(profile);
      setUserRole(role);
      setUserPermission(permission);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      authService.logout();
      setUser(null);
      setUserRole(null);
      setUserPermission(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    await authService.login(credentials);
    await refreshUserData();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserRole(null);
    setUserPermission(null);
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      userPermission,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};
