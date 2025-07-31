import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Users, UserPlus, Trash2, Shield, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';

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
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@empresa.com',
    role: 'contributor',
    status: 'inactive',
    lastAccess: '2024-03-10 16:45'
  }
];

export default function Administration() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'reader' as const
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
    setIsDialogOpen(false);
    toast.success('Usuário adicionado com sucesso!');
  };

  const handleRemoveUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    toast.success('Usuário removido com sucesso!');
  };

  const rolePermissions = {
    administrator: [
      'Gerenciar usuários',
      'Configurar sistema',
      'Visualizar relatórios',
      'Fazer upload de arquivos',
      'Gerenciar empresas'
    ],
    contributor: [
      'Visualizar relatórios',
      'Fazer upload de arquivos',
      'Visualizar histórico próprio'
    ],
    reader: [
      'Visualizar relatórios',
      'Visualizar dashboards'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header com navegação para gerenciamento de usuários */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-600">Configurações e gerenciamento do sistema</p>
        </div>
        <Button 
          onClick={() => navigate('/users')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Gerenciar Usuários
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5" />
              Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Settings className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Configuration Options</h3>
                <p className="text-sm text-muted-foreground">Enable or disable application features</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Edit className="h-5 w-5 text-success" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Theme Style Selection</h3>
                <p className="text-sm text-muted-foreground">Set the default application look and feel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5" />
                Access Control
              </CardTitle>
              <Button size="sm" className="text-primary hover:text-primary/80">
                Add User
              </Button>
            </div>
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
                <Badge variant="secondary">2</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Administrador</span>
                <Badge variant="secondary">1</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Contribuidor</span>
                <Badge variant="secondary">1</Badge>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Users</h3>
                  <p className="text-sm text-muted-foreground">Set level of access for authenticated users of this application</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Shield className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Access Control</h3>
                  <p className="text-sm text-muted-foreground">Change access control settings and disable access control</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Permissões por Função</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div key={role} className="space-y-3">
                <h3 className="font-medium text-foreground capitalize">{getRoleBadge(role)}</h3>
                <ul className="space-y-2">
                  {permissions.map((permission, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}