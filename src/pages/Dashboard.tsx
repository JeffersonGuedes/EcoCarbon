import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Leaf, Zap, Factory, TrendingUp } from 'lucide-react';

const emissionsData = [
  { escopo: 'Escopo 1', valor: 150.0, unidade: 'tCO2e', icon: Factory, color: 'hsl(142, 76%, 36%)' },
  { escopo: 'Escopo 2', valor: 75.0, unidade: 'tCO2e', icon: Zap, color: 'hsl(217, 91%, 60%)' },
  { escopo: 'Escopo 3', valor: 220.0, unidade: 'tCO2e', icon: Leaf, color: 'hsl(271, 91%, 65%)' },
];

const distributionData = [
  { name: 'Escopo 1', value: 33.7, fill: 'hsl(142, 76%, 36%)' },
  { name: 'Escopo 2', value: 16.9, fill: 'hsl(217, 91%, 60%)' },
  { name: 'Escopo 3', value: 49.4, fill: 'hsl(271, 91%, 65%)' },
];

const categoryData = [
  { categoria: 'Energia', emissoes: 85 },
  { categoria: 'Transporte', emissoes: 65 },
  { categoria: 'Processos', emissoes: 120 },
  { categoria: 'Resíduos', emissoes: 45 },
  { categoria: 'Água', emissoes: 30 },
];

const fontesData = [
  'Combustão de combustíveis fósseis',
  'Consumo de energia elétrica',
  'Transporte de funcionários',
  'Geração de resíduos sólidos',
  'Tratamento de águas residuais'
];

export default function Dashboard() {
  const total = emissionsData.reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className="space-y-6">
      {/* Cards de Escopos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {emissionsData.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <p className="text-sm text-muted-foreground">{item.escopo}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{item.valor}</span>
                    <span className="text-sm text-muted-foreground">{item.unidade}</span>
                  </div>
                </div>
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon 
                    className="h-5 w-5" 
                    style={{ color: item.color }}
                  />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fontes por Escopo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Fontes Escopo 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fontesData.map((fonte, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                • {fonte}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Fontes Escopo 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fontesData.map((fonte, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                • {fonte}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Fontes Escopo 3</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fontesData.map((fonte, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                • {fonte}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição Percentual</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                'Escopo 1': { label: 'Escopo 1', color: 'hsl(142, 76%, 36%)' },
                'Escopo 2': { label: 'Escopo 2', color: 'hsl(217, 91%, 60%)' },
                'Escopo 3': { label: 'Escopo 3', color: 'hsl(271, 91%, 65%)' },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {distributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Emissões por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Emissões por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              emissoes: { label: 'Emissões (tCO2e)', color: 'hsl(var(--primary))' },
            }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis 
                  dataKey="categoria" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="emissoes" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}