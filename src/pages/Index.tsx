import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Settings, Users, UserPlus, Trash2, Shield, Eye, Edit, Building2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'administrator' | 'reader' | 'contributor';
  status: 'active' | 'inactive';
  lastAccess: string;
}

const initialUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'administrator',
    status: 'active',
    lastAccess: '2024-03-15 14:30'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    role: 'reader',
    status: 'active',
    lastAccess: '2024-03-14 09:15'
  }
];

export default function Index() {
  const { companies, addCompany, updateCompany, removeCompany } = useCompany();
  const [users, setUsers] = useState(initialUsers);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'reader' as const
  });
  const [newCompany, setNewCompany] = useState({
    name: '',
    logo: '🏢',
    description: ''
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Badge className="bg-destructive text-destructive-foreground">Administrador</Badge>;
      case 'reader':
        return <Badge className="bg-info text-info-foreground">Leitor</Badge>;
      case 'contributor':
        return <Badge className="bg-warning text-warning-foreground">Contribuidor</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-success text-success-foreground">Ativo</Badge>
      : <Badge variant="secondary">Inativo</Badge>;
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      status: 'active',
      lastAccess: '-'
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', role: 'reader' });
    setIsUserDialogOpen(false);
    toast.success('Usuário adicionado com sucesso!');
  };

  const handleRemoveUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    toast.success('Usuário removido com sucesso!');
  };

  const handleAddCompany = async () => {
    if (!newCompany.name.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', newCompany.name);
      formData.append('description', newCompany.description || '');
      formData.append('company', '1'); // Ajuste para o ID da empresa pai

      if (editingCompany) {
        await updateCompany(editingCompany.id, formData);
        setEditingCompany(null);
      } else {
        await addCompany(formData);
      }
    } catch (error) {
      // O erro já é tratado no contexto
    }
    
    setNewCompany({ name: '', logo: '🏢', description: '' });
    setIsCompanyDialogOpen(false);
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      logo: company.logo,
      description: company.description || ''
    });
    setIsCompanyDialogOpen(true);
  };

  const handleRemoveCompany = async (id: number) => {
    try {
      await removeCompany(id);
    } catch (error) {
      // O erro já é tratado no contexto
    }
  };

  const emojiOptions = ['🏢', '🌱', '⚡', '🔬', '🏭', '💼', '🌍', '⚙️', '🚀', '💡'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Configuração Geral</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, empresas e configurações do sistema
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold text-foreground">{companies.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'administrator').length}</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@empresa.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <Select value={newUser.role} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reader">Leitor</SelectItem>
                        <SelectItem value="contributor">Contribuidor</SelectItem>
                        <SelectItem value="administrator">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddUser}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Usuário</TableHead>
                  <TableHead className="text-muted-foreground">Função</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Último Acesso</TableHead>
                  <TableHead className="text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{user.lastAccess}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Company Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Building2 className="h-5 w-5" />
              Gerenciamento de Empresas
            </CardTitle>
            <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Empresa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCompany ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome da empresa"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Logo (Emoji)</Label>
                    <div className="flex flex-wrap gap-2">
                      {emojiOptions.map((emoji) => (
                        <Button
                          key={emoji}
                          variant={newCompany.logo === emoji ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewCompany(prev => ({ ...prev, logo: emoji }))}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Descrição (Opcional)</Label>
                    <Input
                      id="companyDescription"
                      value={newCompany.description}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descrição da empresa"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCompanyDialogOpen(false);
                        setEditingCompany(null);
                        setNewCompany({ name: '', logo: '🏢', description: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCompany}>
                      {editingCompany ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id} className="relative group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{company.logo}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{company.name}</h3>
                      {company.description && (
                        <p className="text-sm text-muted-foreground">{company.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCompany(company)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCompany(company.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* System Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Settings className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Opções de Configuração</h3>
                <p className="text-sm text-muted-foreground">Habilitar ou desabilitar recursos do aplicativo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Edit className="h-5 w-5 text-success" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Seleção de Tema</h3>
                <p className="text-sm text-muted-foreground">Definir a aparência padrão do aplicativo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Controle de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-warning/10 p-4 rounded-lg mb-4">
              <p className="text-sm text-foreground">
                Todos os usuários autenticados podem acessar este aplicativo
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Leitor</span>
                <Badge variant="secondary">{users.filter(u => u.role === 'reader').length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Administrador</span>
                <Badge variant="secondary">{users.filter(u => u.role === 'administrator').length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Contribuidor</span>
                <Badge variant="secondary">{users.filter(u => u.role === 'contributor').length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}