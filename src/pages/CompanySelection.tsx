import { useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowRight, Trash2, LogOut, Edit, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanySelection() {
  const { companies, selectedCompany, setSelectedCompany, addCompany, updateCompany, removeCompany } = useCompany();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    logo: '🏢',
    description: ''
  });

  const handleSelectCompany = (company: any) => {
    setSelectedCompany(company);
    navigate('/dashboard');
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
      
      setNewCompany({ name: '', logo: '🏢', description: '' });
      setIsDialogOpen(false);
    } catch (error) {
      // O erro já é tratado no contexto
    }
  };

  const handleEditCompany = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      logo: company.logo,
      description: company.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleRemoveCompany = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeCompany(id);
    } catch (error) {
      // O erro já é tratado no contexto
    }
  };

  const emojiOptions = ['🏢', '🌱', '⚡', '🔬', '🏭', '💼', '🌍', '⚙️', '🚀', '💡'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Selecionar Empresa</h1>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground"
                onClick={() => navigate('/')}
                title="Ir para Configurações"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Bem-vindo, auditor@empresa.com!
          </p>
          <p className="text-sm text-muted-foreground">
            Escolha uma empresa para visualizar o inventário de emissões.
          </p>
        </div>

        <div className="space-y-4">
          {companies.map((company) => (
            <Card 
              key={company.id}
              className="cursor-pointer transition-all hover:bg-accent group"
              onClick={() => handleSelectCompany(company)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{company.logo}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{company.name}</h3>
                      {company.description && (
                        <p className="text-sm text-muted-foreground">{company.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleEditCompany(company, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleRemoveCompany(company.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer transition-all hover:bg-accent border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Plus className="h-5 w-5" />
                    <span>Adicionar nova empresa</span>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa</Label>
                  <Input
                    id="name"
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
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Textarea
                    id="description"
                    value={newCompany.description}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Breve descrição da empresa"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCompany(null);
                      setNewCompany({ name: '', logo: '🏢', description: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCompany}>
                    {editingCompany ? 'Atualizar Empresa' : 'Adicionar Empresa'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}