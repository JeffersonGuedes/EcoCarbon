import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { ConditionalLayout } from "./components/ConditionalLayout";
import { PasswordProtectedRoute } from "./components/PasswordProtectedRoute";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import CompanySelection from "./pages/CompanySelection";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Administration from "./pages/Administration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CompanyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ConditionalLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ConditionalLayout>
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
