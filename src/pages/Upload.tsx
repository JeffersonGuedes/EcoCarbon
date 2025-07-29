import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { Cloud, Upload as UploadIcon, File, Camera, QrCode, Send } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export default function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simular upload
    newFiles.forEach((uploadFile, index) => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => prev.map((item, i) => {
          if (item.file.name === uploadFile.file.name) {
            const newProgress = Math.min(item.progress + 10, 100);
            return {
              ...item,
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : 'uploading'
            };
          }
          return item;
        }));
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(item => 
          item.file.name === uploadFile.file.name 
            ? { ...item, status: 'completed', progress: 100 }
            : item
        ));
        toast.success(`${uploadFile.file.name} enviado com sucesso!`);
      }, 2000);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false)
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(extension || '')) {
      return <Camera className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Upload de Arquivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
              ${isDragActive || isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <Cloud className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  Arraste ou clique para selecionar
                </h3>
                <p className="text-muted-foreground">
                  Suportado: CSV, XLSX, PNG, JPG
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Tirar Foto
                </Button>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  Ler QR Code
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Arquivos em Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(item.file.name)}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status === 'uploading' && `${item.progress}%`}
                      {item.status === 'completed' && 'Concluído'}
                      {item.status === 'error' && 'Erro'}
                    </span>
                  </div>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}