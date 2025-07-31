import { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowRight, Trash2, Edit, Users, Settings, Building, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanySelection() {
  const { companies, selectedCompany, setSelectedCompany, addCompany, updateCompany, removeCompany, isLoading } = useCompany();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    logo: '',
    logo_file: null as File | null,
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
      console.log('=== INÍCIO DA OPERAÇÃO ===');
      console.log('Dados atuais:', {
        name: newCompany.name,
        logo: newCompany.logo,
        logo_file: newCompany.logo_file?.name || null,
        description: newCompany.description,
        editing: !!editingCompany
      });

      const formData = new FormData();
      formData.append('name', newCompany.name);
      formData.append('description', newCompany.description || '');

      // Adicionar logo (apenas arquivo)
      if (newCompany.logo_file) {
        console.log('📁 Enviando arquivo de logo:', newCompany.logo_file.name);
        formData.append('logo', newCompany.logo_file);
      } else {
        console.log('⚠️ Nenhum logo definido - apenas arquivo é suportado');
      }

      // Debug: mostrar todos os dados do FormData
      console.log('📤 FormData sendo enviado:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [FILE] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: "${value}"`);
        }
      }

      if (editingCompany) {
        console.log('✏️ Atualizando empresa ID:', editingCompany.id);
        await updateCompany(editingCompany.id, formData);
        setEditingCompany(null);
      } else {
        console.log('➕ Criando nova empresa');
        await addCompany(formData);
      }
      
      setNewCompany({ name: '', logo: '', logo_file: null, description: '' });
      setIsDialogOpen(false);
      console.log('✅ Operação concluída com sucesso');
    } catch (error) {
      console.error('❌ ERRO na operação:', error);
      if (error instanceof Error) {
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
      }
      toast.error(`Erro: ${error}`);
    }
  };

  const handleEditCompany = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      logo: company.logo,
      logo_file: null,
      description: company.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleRemoveCompany = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompanyToDelete(company);
  };

  const confirmRemoveCompany = async () => {
    if (!companyToDelete) return;
    
    console.log('🗑️ Confirmando remoção da empresa:', companyToDelete.id);
    try {
      await removeCompany(companyToDelete.id);
      console.log('✅ Empresa removida com sucesso:', companyToDelete.id);
      toast.success('Empresa removida com sucesso!');
      setCompanyToDelete(null);
    } catch (error) {
      console.error('❌ Erro ao remover empresa:', error);
      toast.error('Erro ao remover empresa');
      setCompanyToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header com navegação */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Seleção de Empresas</h1>
            {userRole === 'admin' && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 hidden"
              >
                <Users className="h-4 w-4" />
                Configurar Funcionários
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-semibold text-foreground">Selecionar Empresa</h1>
          </div>
          <p className="text-muted-foreground">
            Escolha uma micro-empresa para visualizar o inventário de emissões.
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                      {company.logo && company.logo.startsWith('http') ? (
                        <img 
                          src={company.logo} 
                          alt={company.name}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                      ) : (
                        <div className="text-2xl">
                          {company.logo && !company.logo.startsWith('http') ? company.logo : <Building className="w-6 h-6 text-muted-foreground" />}
                        </div>
                      )}
                      {company.logo && company.logo.startsWith('http') && (
                        <Building className="w-6 h-6 text-muted-foreground" style={{display: 'none'}} />
                      )}
                    </div>
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
                      onClick={(e) => handleRemoveCompany(company, e)}
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
                  <Label>Logo</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Upload de imagem</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Arquivo selecionado:', file.name);
                              setNewCompany(prev => ({ ...prev, logo_file: file, logo: '' }));
                            }
                          }}
                          className="flex-1"
                        />
                        {newCompany.logo_file && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Upload className="w-4 h-4" />
                            {newCompany.logo_file.name}
                          </div>
                        )}
                      </div>
                    </div>
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
                      setNewCompany({ name: '', logo: '', logo_file: null, description: '' });
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

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa "{companyToDelete?.name}"?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}