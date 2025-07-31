import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Mostrar notificação de página não encontrada
    toast.error(`Página não encontrada: ${location.pathname}`, {
      description: "Você tentou acessar uma página que não existe.",
      duration: 5000,
    });
  }, [location.pathname]);

  const handleGoBack = () => {
    // Voltar para página anterior
    window.history.length > 1 ? navigate(-1) : navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Página não encontrada
          </CardTitle>
          <CardDescription className="text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              URL tentada: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{location.pathname}</code>
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para página anterior
            </Button>
            
            <Button onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Ir para página inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
