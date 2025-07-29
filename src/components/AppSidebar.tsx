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
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Histórico", url: "/history", icon: History },
  { title: "Notificações", url: "/notifications", icon: Bell },
  { title: "Relatórios", url: "/reports", icon: FileText },
  { title: "Administração", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCompany, setSelectedCompany } = useCompany();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

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
                {menuItems.map((item) => (
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