import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { File, Eye, Download, Calendar, RefreshCw } from 'lucide-react';
import { apiService } from '@/services/api';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

interface HistoryItem {
  id: string;
  action: string;
  description: string;
  user_name: string;
  company_id: number;
  document_id?: number;
  timestamp: string;
  created_at?: string;
}

export default function History() {
  const { selectedCompany } = useCompany();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getHistory();
      
      // Filtrar por empresa selecionada se necessário
      let data = response.results || [];
      if (selectedCompany) {
        data = data.filter((item: HistoryItem) => item.company_id === selectedCompany.id);
      }
      
      setHistoryData(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedCompany]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'UPLOAD_DOCUMENT':
        return <Badge variant="secondary">Upload</Badge>;
      case 'CREATE_USER':
        return <Badge variant="default">Usuário</Badge>;
      case 'UPDATE_USER':
        return <Badge variant="outline">Atualização</Badge>;
      case 'DELETE_USER':
        return <Badge variant="destructive">Exclusão</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Histórico de Atividades</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadHistory}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {selectedCompany && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Mostrando atividades para: <span className="font-medium text-foreground">{selectedCompany.name}</span>
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando histórico...</span>
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atividade encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ação</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Documento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {getActionBadge(item.action)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{item.description}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.user_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.timestamp || item.created_at || '')}
                    </TableCell>
                    <TableCell>
                      {item.document_id ? (
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span className="text-sm">ID: {item.document_id}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
