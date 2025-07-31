import { useEffect } from 'react';
import { useSecurityCheck } from './useSecurityCheck';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook que monitora continuamente a segurança da aplicação
 * e realiza verificações automáticas de token (apenas em páginas protegidas)
 */
export const useSecurityGuard = () => {
  const { verifyAndRefreshToken } = useSecurityCheck();
  const { isAuthenticated } = useAuth();

  // Verificar se usuário está em página que não precisa de token
  const isPublicPage = () => {
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/forgot-password', '/reset-password'];
    return publicPaths.includes(currentPath);
  };

  useEffect(() => {
    // Não monitorar páginas públicas
    if (!isAuthenticated || isPublicPage()) return;

    // Verificar token a cada 5 minutos
    const interval = setInterval(() => {
      console.log('🔒 Verificação periódica de token...');
      verifyAndRefreshToken();
    }, 5 * 60 * 1000); // 5 minutos

    // Verificação inicial
    verifyAndRefreshToken();

    return () => clearInterval(interval);
  }, [isAuthenticated, verifyAndRefreshToken]);

  // Verificar quando a aba fica ativa novamente
  useEffect(() => {
    // Não monitorar páginas públicas
    if (!isAuthenticated || isPublicPage()) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔒 Aba ativa novamente, verificando token...');
        verifyAndRefreshToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, verifyAndRefreshToken]);
};
