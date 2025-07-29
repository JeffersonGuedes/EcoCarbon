import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useCompany } from "@/contexts/CompanyContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { selectedCompany } = useCompany();
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground" />
              {selectedCompany && (
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {location.pathname === '/dashboard' && 'Dashboard'}
                    {location.pathname === '/upload' && 'Upload'}
                    {location.pathname === '/history' && 'Histórico'}
                    {location.pathname === '/notifications' && 'Notificações'}
                    {location.pathname === '/reports' && 'Relatórios'}
                    {location.pathname === '/admin' && 'Administração'}
                    {location.pathname === '/' && 'Configuração Geral'}
                    {location.pathname === '/companies' && 'Selecionar Empresa'}
                  </h1>
                </div>
              )}
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
              
              {selectedCompany && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>auditor@empresa.com</span>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Sair
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