import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { apiService } from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useSecurityCheck = () => {
  const { user, userPermission, logout, refreshToken } = useAuth();
  const { validateCompanyAccess } = useCompany();
  const navigate = useNavigate();

  // Verificar se usuário está em página que não precisa de token
  const isPublicPage = () => {
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/forgot-password', '/reset-password'];
    return publicPaths.includes(currentPath);
  };

  // Verificar validade do token e tentar renovar se necessário
  const verifyAndRefreshToken = async (): Promise<boolean> => {
    // Não verificar token em páginas públicas
    if (isPublicPage()) {
      console.log('🔓 Página pública, não verificando token');
      return true;
    }

    try {
      const token = localStorage.getItem('access');
      if (!token) {
        console.log('🔒 Token não encontrado, redirecionando para login');
        logout();
        navigate('/login');
        return false;
      }

      // Verificar se o token é válido
      try {
        await apiService.verifyToken(JSON.parse(token));
        console.log('✅ Token válido');
        return true;
      } catch (error: any) {
        console.log('⚠️ Token inválido, tentando renovar...');
        
        // Token inválido, tentar renovar
        try {
          const refreshed = await refreshToken();
          if (refreshed) {
            console.log('✅ Token renovado com sucesso');
            return true;
          } else {
            console.log('❌ Falha ao renovar token, redirecionando para login');
            logout();
            navigate('/login');
            return false;
          }
        } catch (refreshError) {
          console.log('❌ Erro ao renovar token, redirecionando para login');
          logout();
          navigate('/login');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Erro na verificação de token:', error);
      logout();
      navigate('/login');
      return false;
    }
  };

  // Interceptar respostas 401 e redirecionar para login
  const handleUnauthorized = async (error: any): Promise<boolean> => {
    if (error?.message?.includes('401') || error?.status === 401) {
      console.log('🔒 Acesso não autorizado (401), verificando token...');
      
      // Tentar renovar o token primeiro
      const tokenValid = await verifyAndRefreshToken();
      if (!tokenValid) {
        toast.error('Sessão expirada. Faça login novamente.');
        return false;
      }
      
      // Se renovação falhou, redirecionar para login
      toast.error('Sessão expirada. Redirecionando para login...');
      logout();
      navigate('/login');
      return false;
    }
    return true;
  };

  // Verificar se o usuário tem permissão para uma operação específica
  const checkPermission = async (requiredPermission: 'read' | 'write' | 'admin'): Promise<boolean> => {
    // Primeiro verificar se o token é válido
    const tokenValid = await verifyAndRefreshToken();
    if (!tokenValid) return false;

    if (!user) {
      toast.error('Usuário não autenticado');
      navigate('/login');
      return false;
    }

    if (userPermission === 'admin') return true;
    
    if (requiredPermission === 'admin') {
      toast.error('Acesso negado: Permissão de administrador necessária');
      return false;
    }
    
    if (requiredPermission === 'write' && userPermission === 'read') {
      toast.error('Acesso negado: Permissão de escrita necessária');
      return false;
    }

    return true;
  };

  // Verificar se o usuário pode acessar uma micro-empresa específica
  const checkCompanyAccess = async (microCompanyId: number): Promise<boolean> => {
    // Primeiro verificar se o token é válido
    const tokenValid = await verifyAndRefreshToken();
    if (!tokenValid) return false;

    if (!user) {
      toast.error('Usuário não autenticado');
      navigate('/login');
      return false;
    }

    try {
      const hasAccess = await validateCompanyAccess(microCompanyId);
      if (!hasAccess) {
        toast.error('Acesso negado: Empresa não encontrada ou sem permissão');
        console.error(`VIOLAÇÃO DE SEGURANÇA: Usuário ${user.first_name} ${user.last_name} tentou acessar micro-empresa ${microCompanyId} sem permissão`);
      }
      return hasAccess;
    } catch (error: any) {
      // Verificar se é erro 401
      await handleUnauthorized(error);
      return false;
    }
  };

  // Verificar integridade dos dados do usuário
  const checkUserIntegrity = async (): Promise<boolean> => {
    // Primeiro verificar se o token é válido
    const tokenValid = await verifyAndRefreshToken();
    if (!tokenValid) return false;

    if (!user || !user.company_id) {
      toast.error('Dados do usuário corrompidos. Fazendo logout por segurança.');
      logout();
      navigate('/login');
      return false;
    }
    return true;
  };

  // Detectar possíveis tentativas de manipulação de dados
  const detectSecurityViolation = (action: string, details: any) => {
    console.warn(`🚨 ALERTA DE SEGURANÇA: ${action}`, {
      user: user ? `${user.first_name} ${user.last_name}` : 'Desconhecido',
      company: user?.company_id || 'N/A',
      timestamp: new Date().toISOString(),
      details,
      url: window.location.href
    });
  };

  // Wrapper para chamadas da API que automaticamente lida com 401
  const secureApiCall = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      // Verificar token antes da chamada
      const tokenValid = await verifyAndRefreshToken();
      if (!tokenValid) return null;

      return await apiCall();
    } catch (error: any) {
      const handled = await handleUnauthorized(error);
      if (!handled) return null;
      
      // Re-throw outros erros que não são 401
      throw error;
    }
  };

  return {
    verifyAndRefreshToken,
    handleUnauthorized,
    checkPermission,
    checkCompanyAccess,
    checkUserIntegrity,
    detectSecurityViolation,
    secureApiCall
  };
};
