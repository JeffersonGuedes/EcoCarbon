import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw, Shield, Users, Filter, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiService, UserList, UserCreate, UserUpdate, Company } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const UserManagement: React.FC = () => {
  const { getCompanyName, getCompanyRole } = useAuth();
  const [users, setUsers] = useState<UserList[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserList | null>(null);
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState<UserCreate>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    cpf: "",
    password: "",
    confirm_password: "",
    company_role: "",
    company_id: undefined,
    is_active: true,
  });

  const [updateForm, setUpdateForm] = useState<Partial<UserUpdate>>({});

  const roleOptions = [
    { value: "company_admin", label: "Administrador da Empresa" },
    { value: "employee", label: "Funcionário" },
    { value: "client", label: "Cliente" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Pré-definir a empresa do usuário logado quando as empresas forem carregadas
  useEffect(() => {
    if (companies.length > 0 && !createForm.company_id) {
      setCreateForm(prev => ({
        ...prev,
        company_id: companies[0].id // Definir automaticamente a empresa do usuário
      }));
    }
  }, [companies, createForm.company_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, companiesResponse] = await Promise.all([
        apiService.getUsersByCompany(), // Buscar usuários da empresa do usuário logado
        apiService.getCompaniesByUser() // Buscar empresa do usuário logado
      ]);
      
      setUsers(usersResponse.results || []);
      setCompanies(companiesResponse.results || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!createForm.company_id) {
        toast({
          title: "Erro",
          description: "Empresa é obrigatória",
          variant: "destructive",
        });
        return;
      }

      await apiService.createUser(createForm);
      setCreateForm({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        cpf: "",
        password: "",
        confirm_password: "",
        company_role: "",
        company_id: companies[0]?.id || undefined,
        is_active: true,
      });
      setIsCreateDialogOpen(false);
      await loadData();
      
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await apiService.updateUser(editingUser.id, updateForm);
      setUpdateForm({});
      setEditingUser(null);
      setIsEditDialogOpen(false);
      await loadData();
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await apiService.deleteUser(userId);
      await loadData();
      
      toast({
        title: "Sucesso",
        description: "Usuário deletado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar usuário",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: number) => {
    try {
      await apiService.resetUserPassword(userId);
      
      toast({
        title: "Sucesso",
        description: "Nova senha foi enviada por email para o usuário",
      });
    } catch (error: any) {
      console.error("Erro ao resetar senha:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao resetar senha",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: UserList) => {
    setEditingUser(user);
    setUpdateForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      cpf: user.cpf,
      company_role: user.company_roles?.[0]?.role || '',
      is_active: user.is_active,
    });
    setIsEditDialogOpen(true);
  };

  // Filtros de usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRole = user.company_roles?.[0]?.role || '';
    const matchesRole = filterRole === "all" || userRole === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserRoleLabel = (role: string) => {
    switch (role) {
      case 'company_admin': return 'Administrador da Empresa';
      case 'employee': return 'Funcionário';
      case 'client': return 'Cliente';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <div className="text-gray-600 space-y-1">
            <p>Gerencie usuários, permissões e acessos do sistema</p>
            <div className="flex items-center gap-4 text-sm">
              <span><strong>Empresa:</strong> {getCompanyName() || 'N/A'}</span>
              <span><strong>Seu Perfil:</strong> {getCompanyRole() === 'company_admin' ? 'Administrador da Empresa' : getCompanyRole() === 'employee' ? 'Funcionário' : 'Cliente'}</span>
            </div>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Nome de Usuário *</Label>
                  <Input
                    id="username"
                    value={createForm.username}
                    onChange={(e) => setCreateForm(prev => ({...prev, username: e.target.value}))}
                    placeholder="nome_usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({...prev, email: e.target.value}))}
                    placeholder="usuario@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Nome *</Label>
                  <Input
                    id="first_name"
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm(prev => ({...prev, first_name: e.target.value}))}
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Sobrenome *</Label>
                  <Input
                    id="last_name"
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm(prev => ({...prev, last_name: e.target.value}))}
                    placeholder="Sobrenome"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={createForm.cpf}
                  onChange={(e) => setCreateForm(prev => ({...prev, cpf: e.target.value}))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({...prev, password: e.target.value}))}
                    placeholder="Senha"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirmar Senha *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={createForm.confirm_password}
                    onChange={(e) => setCreateForm(prev => ({...prev, confirm_password: e.target.value}))}
                    placeholder="Confirmar Senha"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company_role">Perfil na Empresa *</Label>
                <Select
                  value={createForm.company_role}
                  onValueChange={(value) => setCreateForm(prev => ({...prev, company_role: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={createForm.is_active}
                  onCheckedChange={(checked) => setCreateForm(prev => ({...prev, is_active: checked}))}
                />
                <Label htmlFor="is_active">Usuário Ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>
                  Criar Usuário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(user => user.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(user => !user.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(user => user.company_roles?.[0]?.role === 'company_admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Perfis</SelectItem>
                {roleOptions.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Todos os usuários da empresa (Administradores, Funcionários e Clientes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.company_roles?.[0]?.role === 'company_admin' ? 'default' :
                          user.company_roles?.[0]?.role === 'employee' ? 'secondary' : 'outline'
                        }>
                          {getUserRoleLabel(user.company_roles?.[0]?.role || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.date_joined).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                            title="Resetar senha e enviar por email"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o usuário {user.first_name} {user.last_name}?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">Nome</Label>
                  <Input
                    id="edit_first_name"
                    value={updateForm.first_name || ""}
                    onChange={(e) => setUpdateForm(prev => ({...prev, first_name: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Sobrenome</Label>
                  <Input
                    id="edit_last_name"
                    value={updateForm.last_name || ""}
                    onChange={(e) => setUpdateForm(prev => ({...prev, last_name: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={updateForm.email || ""}
                  onChange={(e) => setUpdateForm(prev => ({...prev, email: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="edit_cpf">CPF</Label>
                <Input
                  id="edit_cpf"
                  value={updateForm.cpf || ""}
                  onChange={(e) => setUpdateForm(prev => ({...prev, cpf: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="edit_company_role">Perfil na Empresa</Label>
                <Select
                  value={updateForm.company_role || ""}
                  onValueChange={(value) => setUpdateForm(prev => ({...prev, company_role: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={updateForm.is_active || false}
                  onCheckedChange={(checked) => setUpdateForm(prev => ({...prev, is_active: checked}))}
                />
                <Label htmlFor="edit_is_active">Usuário Ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateUser}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
