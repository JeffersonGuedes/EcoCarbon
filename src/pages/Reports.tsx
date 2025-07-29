import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Download, Sparkles, FileSpreadsheet, Presentation } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Reports() {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Digite uma descrição para gerar o relatório');
      return;
    }

    setIsGenerating(true);
    // Simular geração de relatório com IA
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Relatório gerado com sucesso!');
    }, 3000);
  };

  const handleDownload = (format: string) => {
    toast.success(`Iniciando download do relatório em ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5" />
              Gerar Relatório de Emissões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => handleDownload('pdf')}
                className="flex-1"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              <Button 
                onClick={() => handleDownload('csv')}
                className="flex-1"
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Baixar CSV
              </Button>
            </div>
            <Button 
              onClick={() => handleDownload('pptx')}
              className="w-full"
              variant="outline"
            >
              <Presentation className="h-4 w-4 mr-2" />
              Baixar PowerPoint
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5" />
              Gerar Insight com IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Descreva o tipo de relatório desejado</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Ex: Gere um relatório executivo com análise das principais fontes de emissão e recomendações para redução..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar com IA'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Relatórios e Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 border border-border rounded-lg">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-foreground mb-1">Relatório Mensal</h3>
                <p className="text-sm text-muted-foreground">Análise completa das emissões do mês</p>
              </div>
              <div className="text-center p-6 border border-border rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-success mx-auto mb-2" />
                <h3 className="font-medium text-foreground mb-1">Dados Detalhados</h3>
                <p className="text-sm text-muted-foreground">Planilha com todos os dados coletados</p>
              </div>
              <div className="text-center p-6 border border-border rounded-lg">
                <Presentation className="h-8 w-8 text-info mx-auto mb-2" />
                <h3 className="font-medium text-foreground mb-1">Apresentação</h3>
                <p className="text-sm text-muted-foreground">Slides para apresentações executivas</p>
              </div>
            </div>

            <div className="bg-accent/20 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Como usar a IA para gerar relatórios:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Descreva o tipo de análise que você precisa</li>
                <li>• Especifique o período ou escopo desejado</li>
                <li>• Mencione se precisa de recomendações ou insights específicos</li>
                <li>• A IA irá gerar um relatório personalizado baseado nos seus dados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}