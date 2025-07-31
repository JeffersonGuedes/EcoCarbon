import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import { Cloud, Upload as UploadIcon, File, Camera, QrCode, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  fileType: string;
  uploadedDocument?: any;
}

export default function Upload() {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      fileType: documentType || getFileTypeFromExtension(file.name)
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Processar upload real para cada arquivo
    newFiles.forEach((uploadFile) => {
      processRealUpload(uploadFile);
    });
  }, [documentType]);

  const getFileTypeFromExtension = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'xlsx': case 'xls': return 'EXCEL';
      case 'csv': return 'CSV';
      case 'png': case 'jpg': case 'jpeg': case 'gif': return 'IMAGE';
      default: return 'OTHER';
    }
  };

  const processRealUpload = async (uploadFile: UploadedFile) => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      if (!user?.company_id) {
        throw new Error('Usuário não possui empresa associada');
      }

      console.log('🏢 Empresa do usuário:', {id: user.company_id, name: user.company});

      setIsUploading(true);

      // Preparar FormData seguindo o padrão correto da API
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      
      // Usar a empresa do usuário logado
      formData.append('company', user.company_id.toString());
      
      console.log('📤 Dados sendo enviados para upload:', {
        file: uploadFile.file.name,
        company: user.company_id,
        company_name: user.company
      });

      // Simular progresso durante upload
      progressInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(item => 
          item.file.name === uploadFile.file.name && item.status === 'uploading'
            ? { ...item, progress: Math.min(item.progress + 15, 90) }
            : item
        ));
      }, 300);

      // Upload do documento
      const uploadedDocument = await apiService.uploadDocument(formData);
      
      // Obter micro companies da empresa do usuário
      const microCompanies = await apiService.getMicroCompanies(user.company_id);
      
      // Vincular com a primeira micro empresa (ou todas, dependendo da lógica de negócio)
      if (microCompanies.results && microCompanies.results.length > 0) {
        await apiService.linkDocumentToMicroCompany(uploadedDocument.id, microCompanies.results[0].id);
      }

      // ✅ Upload concluído com sucesso
      console.log('✅ Upload processado com sucesso:', {
        documentId: uploadedDocument.id,
        fileName: uploadFile.file.name,
        companyId: user.company_id,
        companyName: user.company
      });

      // Atualizar status do arquivo
      setUploadedFiles(prev => prev.map(item => 
        item.file.name === uploadFile.file.name 
          ? { ...item, status: 'completed', progress: 100, uploadedDocument }
          : item
      ));

      toast.success(`${uploadFile.file.name} enviado com sucesso!`);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Melhorar mensagens de erro
        if (error.message.includes('HTTP 401')) {
          errorMessage = 'Não autorizado. Faça login novamente.';
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'Acesso negado. Você não tem permissão para fazer upload.';
        } else if (error.message.includes('conexão')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e se o servidor está ativo.';
        }
      }

      // Mostrar erro para o usuário via toast
      toast.error(`Erro ao enviar ${uploadFile.file.name}: ${errorMessage}`);

      // Atualizar status do arquivo
      setUploadedFiles(prev => prev.map(item => 
        item.file.name === uploadFile.file.name 
          ? { ...item, status: 'error', progress: 0 }
          : item
      ));
      
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    disabled: !user?.company_id
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload de Documentos</h1>
      </div>

      {!user?.company_id && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Usuário sem empresa</h3>
                <p className="text-sm">Você precisa estar associado a uma empresa para fazer upload de documentos.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tipo de Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-type">Selecionar tipo</Label>
              <Select value={documentType} onValueChange={setDocumentType} disabled={!user?.company_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Nota Fiscal</SelectItem>
                  <SelectItem value="receipt">Recibo</SelectItem>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="report">Relatório</SelectItem>
                  <SelectItem value="qrcode">QR Code</SelectItem>
                  <SelectItem value="photo">Foto/Imagem</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading || !user?.company_id ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} disabled={!user?.company_id} />
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                <Cloud className="h-full w-full" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  {!user?.company_id 
                    ? 'Usuário sem empresa associada' 
                    : isUploading 
                      ? 'Enviando arquivo...' 
                      : 'Arraste ou clique para selecionar'
                  }
                </h3>
                <p className="text-muted-foreground">
                  Suportado: CSV, XLSX, PNG, JPG, PDF
                </p>
                {user?.company && (
                  <p className="text-sm text-primary">
                    Enviando para: {user.company}
                  </p>
                )}
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" disabled={isUploading || !user?.company_id}>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button variant="outline" size="sm" disabled={isUploading || !user?.company_id}>
                  <Camera className="h-4 w-4 mr-2" />
                  Tirar Foto
                </Button>
                <Button variant="outline" size="sm" disabled={isUploading || !user?.company_id}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Ler QR Code
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <File className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{uploadedFile.file.name}</span>
                      <div className="flex items-center space-x-2">
                        {uploadedFile.status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {uploadedFile.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <Progress value={uploadedFile.progress} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      {uploadedFile.status === 'uploading' && `${uploadedFile.progress}%`}
                      {uploadedFile.status === 'completed' && (
                        <span className="text-green-600">
                          ✅ Arquivo enviado com sucesso e vinculado à empresa {user?.company}
                        </span>
                      )}
                      {uploadedFile.status === 'error' && (
                        <span className="text-red-600">❌ Erro no envio</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
