import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { toast } from 'sonner';

export const useSecurityCheck = () => {
  const { user, userPermission, logout } = useAuth();
  const { validateCompanyAccess } = useCompany();

  // Verificar se o usuário tem permissão para uma operação específica
  const checkPermission = (requiredPermission: 'read' | 'write' | 'admin'): boolean => {
    if (!user) {
      toast.error('Usuário não autenticado');
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
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    const hasAccess = await validateCompanyAccess(microCompanyId);
    if (!hasAccess) {
      toast.error('Acesso negado: Empresa não encontrada ou sem permissão');
      // Em casos graves de violação de segurança, fazer logout
      console.error(`TENTATIVA DE VIOLAÇÃO DE SEGURANÇA: Usuário ${user.first_name} ${user.last_name} tentou acessar micro-empresa ${microCompanyId} sem permissão`);
    }

    return hasAccess;
  };

  // Verificar integridade dos dados do usuário
  const checkUserIntegrity = (): boolean => {
    if (!user || !user.company_id) {
      toast.error('Dados do usuário corrompidos. Fazendo logout por segurança.');
      logout();
      return false;
    }
    return true;
  };

  // Detectar possíveis tentativas de manipulação de dados
  const detectSecurityViolation = (action: string, details: any) => {
    console.warn(`ALERTA DE SEGURANÇA: ${action}`, {
      user: user ? `${user.first_name} ${user.last_name}` : 'Desconhecido',
      company: user?.company_id || 'N/A',
      timestamp: new Date().toISOString(),
      details
    });
  };

  return {
    checkPermission,
    checkCompanyAccess,
    checkUserIntegrity,
    detectSecurityViolation
  };
};
