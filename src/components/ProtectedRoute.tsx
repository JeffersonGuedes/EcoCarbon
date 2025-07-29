import { Navigate } from 'react-router-dom';
import { useAuth, UserRole, UserPermission } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: UserPermission;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, userRole, userPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar se o usuário tem o papel necessário
  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Papel necessário: {requiredRole} | Seu papel: {userRole}
          </p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário tem a permissão necessária
  if (requiredPermission && userPermission !== requiredPermission && userPermission !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Permissão necessária: {requiredPermission} | Sua permissão: {userPermission}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
