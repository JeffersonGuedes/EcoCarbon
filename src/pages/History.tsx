import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { File, Eye, Download, Calendar } from 'lucide-react';

interface HistoryItem {
  id: string;
  filename: string;
  type: 'csv' | 'pdf' | 'xlsx' | 'image';
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  result?: string;
  fileSize: string;
}

const historyData: HistoryItem[] = [
  {
    id: '1',
    filename: 'inventario_2024.csv',
    type: 'csv',
    uploadDate: '15/03/2024',
    status: 'completed',
    result: '145.2 tCO2e',
    fileSize: '2.5 MB'
  },
  {
    id: '2',
    filename: 'inventario_2023.csv',
    type: 'csv',
    uploadDate: '20/12/2023',
    status: 'error',
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    filename: 'dados_energia.xlsx',
    type: 'xlsx',
    uploadDate: '10/03/2024',
    status: 'processing',
    fileSize: '3.2 MB'
  },
  {
    id: '4',
    filename: 'relatorio_transporte.pdf',
    type: 'pdf',
    uploadDate: '05/03/2024',
    status: 'completed',
    result: '67.8 tCO2e',
    fileSize: '4.1 MB'
  }
];

export default function History() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Concluído</Badge>;
      case 'processing':
        return <Badge className="bg-warning text-warning-foreground">Processando</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5" />
            Histórico de Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Arquivo</TableHead>
                  <TableHead className="text-muted-foreground">Pré-visualização</TableHead>
                  <TableHead className="text-muted-foreground">Enviado por</TableHead>
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Resultado</TableHead>
                  <TableHead className="text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((item) => (
                  <TableRow key={item.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(item.type)}
                        <div>
                          <p className="font-medium text-foreground">{item.filename}</p>
                          <p className="text-sm text-muted-foreground">{item.fileSize}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">-</TableCell>
                    <TableCell className="text-muted-foreground">{item.uploadDate}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-foreground font-medium">
                      {item.result || '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" disabled={item.status !== 'completed'}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}