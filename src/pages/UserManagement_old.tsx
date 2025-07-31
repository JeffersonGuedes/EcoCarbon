import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, UserCheck, UserX, RefreshCw, Shield, Users, Filter } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  }, [companies]);

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
      if (!createForm.username || !createForm.cpf || !createForm.password || !createForm.confirm_password) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      if (createForm.password !== createForm.confirm_password) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        return;
      }

      await apiService.createUser(createForm);
      
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });
      
      setCreateForm({
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
      setIsCreateDialogOpen(false);
      loadData();
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
      await apiService.partialUpdateUser(editingUser.id, updateForm);
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setUpdateForm({});
      loadData();
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
      
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
      });
      
      loadData();
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      await apiService.toggleUserActive(userId);
      
      toast({
        title: "Sucesso",
        description: "Status do usuário alterado com sucesso",
      });
      
      loadData();
    } catch (error: any) {
      console.error("Erro ao alterar status do usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do usuário",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: number) => {
    try {
      await apiService.resetUserPassword(userId);
      
      toast({
        title: "Sucesso",
        description: "Senha resetada com sucesso",
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
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      cpf: user.cpf,
      is_active: user.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cpf.includes(searchTerm);

    const matchesRole = filterRole === "all" || 
      user.company_roles.some(role => role.role === filterRole);

    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "company_admin": return "default";
      case "employee": return "secondary";
      case "client": return "outline";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
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
                  <Label htmlFor="first_name">Nome</Label>
                  <Input
                    id="first_name"
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm(prev => ({...prev, first_name: e.target.value}))}
                    placeholder="João"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Sobrenome</Label>
                  <Input
                    id="last_name"
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm(prev => ({...prev, last_name: e.target.value}))}
                    placeholder="Silva"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
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
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirmar Senha *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={createForm.confirm_password}
                    onChange={(e) => setCreateForm(prev => ({...prev, confirm_password: e.target.value}))}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Select 
                    value={createForm.company_id?.toString() || ""} 
                    onValueChange={(value) => setCreateForm(prev => ({...prev, company_id: parseInt(value)}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select 
                    value={createForm.company_role} 
                    onValueChange={(value) => setCreateForm(prev => ({...prev, company_role: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar função" />
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
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={createForm.is_active}
                  onCheckedChange={(checked) => setCreateForm(prev => ({...prev, is_active: checked}))}
                />
                <Label htmlFor="is_active">Usuário ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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

      {/* Usuários Section */}
      <div className="space-y-6">
          {/* Stats Cards para Usuários */}
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
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => !u.is_active).length}
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
              {users.filter(u => u.company_roles.some(r => r.role === 'company_admin')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nome, email, usuário..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filterRole">Função</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as funções</SelectItem>
                  {roleOptions.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterStatus">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {filteredUsers.length} de {users.length} usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Funções</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.company_roles.map((role) => (
                          <Badge 
                            key={role.id} 
                            variant={getRoleBadgeVariant(role.role)}
                            className="text-xs"
                          >
                            {role.role_display}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_login ? formatDate(user.last_login) : "Nunca"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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
                          onClick={() => handleToggleActive(user.id)}
                        >
                          {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário {user.username}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={updateForm.is_active || false}
                  onCheckedChange={(checked) => setUpdateForm(prev => ({...prev, is_active: checked}))}
                />
                <Label htmlFor="edit_is_active">Usuário ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
    </div>
  );
};

export default UserManagement;
          {/* Stats Cards para Funcionários */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userRoles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {userRoles.filter(r => r.role === 'company_admin').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {userRoles.filter(r => r.role === 'employee').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {userRoles.filter(r => r.role === 'client').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Funcionários */}
          <Card>
            <CardHeader>
              <CardTitle>Funcionários da Empresa</CardTitle>
              <CardDescription>
                {userRoles.length} funcionários encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Data de Entrada</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="font-medium">{role.user_name}</div>
                        </TableCell>
                        <TableCell>{role.user_email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={role.role === 'company_admin' ? 'default' : 
                                    role.role === 'employee' ? 'secondary' : 'outline'}
                          >
                            {role.role_display}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(role.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover funcionário</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover {role.user_name} da empresa?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
