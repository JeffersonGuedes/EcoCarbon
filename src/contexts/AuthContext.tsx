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
  requiresPasswordChange: boolean;
  login: (credentials: { username: string; password: string }) => Promise<{ requiresPasswordChange?: boolean }>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  // Helper functions para acessar dados da empresa
  getCompanyId: () => number | null;
  getCompanyName: () => string | null;
  getCompanyRole: () => string | null;
  isCompanyAdmin: () => boolean;
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
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  const determineUserRoleAndPermission = (profile: UserProfile): { role: UserRole; permission: UserPermission } => {
    // Usar o company_role retornado pela API
    switch (profile.company_role) {
      case 'company_admin':
        return { role: 'admin', permission: 'admin' };
      case 'employee':
        return { role: 'employee', permission: 'write' };
      case 'client':
        return { role: 'client', permission: 'read' };
      default:
        // Fallback para o sistema antigo se company_role não estiver definido
        if (profile.is_admin || profile.role === 'admin') {
          return { role: 'admin', permission: 'admin' };
        } else if (profile.is_employee || profile.role === 'employee') {
          return { role: 'employee', permission: 'write' };
        } else {
          return { role: 'client', permission: 'read' };
        }
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
    const result = await authService.login(credentials);
    await refreshUserData();
    
    // Verificar se precisa trocar senha baseado na resposta da API
    if (result.requires_password_change) {
      setRequiresPasswordChange(true);
      return { requiresPasswordChange: true };
    }
    
    setRequiresPasswordChange(false);
    return { requiresPasswordChange: false };
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      console.log('🔄 Iniciando alteração de senha...');
      await authService.changePassword(oldPassword, newPassword);
      console.log('✅ Senha alterada com sucesso');
      setRequiresPasswordChange(false);
      await refreshUserData();
    } catch (error: any) {
      console.error('❌ Erro ao alterar senha:', error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Tentando renovar token...');
      await authService.refreshAccessToken();
      console.log('✅ Token renovado com sucesso');
      return true;
    } catch (error) {
      console.log('❌ Falha ao renovar token:', error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserRole(null);
    setUserPermission(null);
  };

  // Helper functions para acessar dados da empresa
  const getCompanyId = () => user?.company_id || null;
  const getCompanyName = () => user?.company || null;
  const getCompanyRole = () => user?.company_role || null;
  const isCompanyAdmin = () => user?.company_role === 'company_admin';

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
      requiresPasswordChange,
      login,
      logout,
      refreshUserData,
      refreshToken,
      changePassword,
      getCompanyId,
      getCompanyName,
      getCompanyRole,
      isCompanyAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
