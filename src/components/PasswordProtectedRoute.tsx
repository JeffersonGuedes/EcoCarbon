import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PasswordProtectedRouteProps {
  children: React.ReactNode;
}

export const PasswordProtectedRoute: React.FC<PasswordProtectedRouteProps> = ({ children }) => {
  const { requiresPasswordChange, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && requiresPasswordChange) {
      navigate('/change-password');
    }
  }, [isAuthenticated, requiresPasswordChange, navigate]);

  // Se precisa trocar senha, não renderiza nada (vai redirecionar)
  if (requiresPasswordChange) {
    return null;
  }

  return <>{children}</>;
};
