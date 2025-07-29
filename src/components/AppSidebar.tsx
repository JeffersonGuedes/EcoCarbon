import { useState } from "react";
import { 
  LayoutDashboard, 
  Upload, 
  History, 
  Bell, 
  FileText, 
  Settings,
  ArrowLeft,
  Building,
  Home
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredPermission: null, allowedRoles: null },
  { title: "Upload", url: "/upload", icon: Upload, requiredPermission: "write", allowedRoles: ["admin", "employee"] },
  { title: "Histórico", url: "/history", icon: History, requiredPermission: "write", allowedRoles: null },
  { title: "Notificações", url: "/notifications", icon: Bell, requiredPermission: null, allowedRoles: null },
  { title: "Relatórios", url: "/reports", icon: FileText, requiredPermission: null, allowedRoles: null },
  { title: "Administração", url: "/admin", icon: Settings, requiredPermission: "admin", allowedRoles: null },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCompany, setSelectedCompany } = useCompany();
  const { userPermission, userRole } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Filtrar itens do menu baseado nas permissões e roles do usuário
  const filteredMenuItems = menuItems.filter(item => {
    // Se não tem restrição de permissão nem role, pode ver
    if (!item.requiredPermission && !item.allowedRoles) return true;
    
    // Se o usuário tem permissão de admin, pode ver tudo
    if (userPermission === 'admin') return true;
    
    // Se a página requer admin e o usuário não é admin, não mostrar
    if (item.requiredPermission === 'admin') return false;
    
    // Se tem restrição de roles específicas, verificar se o usuário está na lista
    if (item.allowedRoles && !item.allowedRoles.includes(userRole!)) return false;
    
    // Se a página requer write, verificar se o usuário tem write
    if (item.requiredPermission === 'write') return userPermission === 'write';
    
    return true;
  });

  const isActive = (path: string) => currentPath === path;
  const isExpanded = menuItems.some((i) => isActive(i.url));
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    navigate('/companies');
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!collapsed && selectedCompany && (
          <div className="space-y-3">
            <button
              onClick={handleBackToCompanies}
              className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Voltar para empresas</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{selectedCompany.logo}</div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">{selectedCompany.name}</h2>
                <p className="text-xs text-sidebar-foreground/70">IAEC Carbon</p>
              </div>
            </div>
          </div>
        )}
        {collapsed && selectedCompany && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleBackToCompanies}
              className="text-sidebar-foreground hover:text-sidebar-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="text-lg">{selectedCompany.logo}</div>
          </div>
        )}
        {!selectedCompany && !collapsed && (
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-sidebar-primary" />
            <div>
              <h2 className="font-semibold text-sidebar-foreground">IAEC Carbon</h2>
              <p className="text-xs text-sidebar-foreground/70">Sistema de Gestão</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {selectedCompany && (
          <SidebarGroup>
            <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!selectedCompany && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/" className={getNavCls}>
                      <Home className="h-4 w-4" />
                      {!collapsed && <span>Configuração</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/companies" className={getNavCls}>
                      <Building className="h-4 w-4" />
                      {!collapsed && <span>Selecionar Empresa</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}