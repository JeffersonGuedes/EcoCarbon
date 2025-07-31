import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { ConditionalLayout } from "./components/ConditionalLayout";
import { PasswordProtectedRoute } from "./components/PasswordProtectedRoute";
import { RouteGuard } from "./components/RouteGuard";
import { useSecurityGuard } from "./hooks/useSecurityGuard";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import CompanySelection from "./pages/CompanySelection";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Administration from "./pages/Administration";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

// Componente interno para usar os hooks de segurança
const AppContent = () => {
  useSecurityGuard(); // Monitoramento contínuo de segurança

  return (
    <RouteGuard>
      <ConditionalLayout>
        <Routes>
          {/* Redirect raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rotas públicas (não precisam de token) */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Rotas protegidas por senha */}
          <Route path="/change-password" element={<ChangePassword />} />
          
          {/* Rotas protegidas (precisam de token válido) */}
          <Route path="/companies" element={
          <PasswordProtectedRoute>
            <CompanySelection />
          </PasswordProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <PasswordProtectedRoute>
            <Dashboard />
          </PasswordProtectedRoute>
        } />
        <Route path="/upload" element={
          <PasswordProtectedRoute>
            <Upload />
          </PasswordProtectedRoute>
        } />
        <Route path="/history" element={
          <PasswordProtectedRoute>
            <History />
          </PasswordProtectedRoute>
        } />
        <Route path="/notifications" element={
          <PasswordProtectedRoute>
            <Notifications />
          </PasswordProtectedRoute>
        } />
        <Route path="/reports" element={
          <PasswordProtectedRoute>
            <Reports />
          </PasswordProtectedRoute>
        } />
        <Route path="/admin" element={
          <PasswordProtectedRoute>
            <Administration />
          </PasswordProtectedRoute>
        } />
        <Route path="/users" element={
          <PasswordProtectedRoute>
            <UserManagement />
          </PasswordProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ConditionalLayout>
    </RouteGuard>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CompanyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
