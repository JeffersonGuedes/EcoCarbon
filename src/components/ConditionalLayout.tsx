import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { selectedCompany } = useCompany();
  const { user, userRole, userPermission, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  // Páginas que não devem mostrar a sidebar
  const pagesWithoutSidebar = ['/login', '/companies'];
  const shouldShowSidebar = !pagesWithoutSidebar.includes(location.pathname) && isAuthenticated;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/upload': 'Upload',
      '/history': 'Histórico',
      '/notifications': 'Notificações',
      '/reports': 'Relatórios',
      '/admin': 'Administração',
      '/': 'Configuração Geral',
      '/companies': 'Selecionar Empresa',
      '/login': 'Login'
    };
    return titles[location.pathname] || 'Sistema';
  };

  // Verificar se o usuário tem permissão para acessar a página atual
  const hasPageAccess = () => {
    if (!isAuthenticated) return location.pathname === '/login';
    
    const currentPath = location.pathname;
    
    // Administradores têm acesso a tudo
    if (userRole === 'admin') return true;
    
    // Páginas que todos os usuários autenticados podem acessar
    const publicAuthPages = ['/companies', '/dashboard', '/reports'];
    if (publicAuthPages.includes(currentPath)) return true;
    
    // Páginas que requerem permissão de escrita
    const writePages = ['/upload', '/history'];
    if (writePages.includes(currentPath)) return userPermission === 'write' || userPermission === 'admin';
    
    // Página de administração só para admins
    if (currentPath === '/admin') return userPermission === 'admin';
    
    return true;
  };

  if (!hasPageAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => navigate('/companies')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  if (!shouldShowSidebar) {
    // Layout sem sidebar para login
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // Layout com sidebar para páginas autenticadas
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {getPageTitle()}
                </h1>
                {selectedCompany && (
                  <p className="text-sm text-muted-foreground">
                    {selectedCompany.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="text-foreground"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{user.first_name} {user.last_name}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {userRole}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
