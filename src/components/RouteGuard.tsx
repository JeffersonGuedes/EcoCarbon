import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas verificando autenticação
 * Redireciona para login se não tiver token válido
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Páginas que não precisam de autenticação
  const publicPaths = ['/login', '/forgot-password', '/reset-password'];
  const isPublicPage = publicPaths.includes(location.pathname);

  useEffect(() => {
    // Se não é página pública e usuário não está autenticado
    if (!isPublicPage && !isAuthenticated) {
      console.log('🔒 Usuário não autenticado tentando acessar página protegida:', location.pathname);
      navigate('/login', { replace: true });
      return;
    }

    // Se usuário está autenticado e tenta acessar login, redirecionar para dashboard
    if (isPublicPage && isAuthenticated && location.pathname === '/login') {
      console.log('🏠 Usuário autenticado redirecionado para dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [isAuthenticated, location.pathname, navigate, isPublicPage]);

  return <>{children}</>;
};
