import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, MicroCompany } from '../services/api';
import { authService } from '../services/auth';
import { toast } from "sonner";

export interface Company {
  id: number;
  name: string;
  logo?: string;
  description?: string;
}

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  companies: Company[];
  isLoading: boolean;
  addCompany: (formData: FormData) => Promise<void>;
  updateCompany: (id: number, formData: FormData) => Promise<void>;
  removeCompany: (id: number) => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mapMicroCompanyToCompany = (micro: MicroCompany): Company => ({
    id: micro.id,
    name: micro.name,
    logo: micro.logo,
    description: micro.description || '',
  });

  const refreshCompanies = async () => {
    if (!authService.isAuthenticated()) return;

    setIsLoading(true);
    try {
      const response = await apiService.getMicroCompanies();
      const mappedCompanies = response.results?.map(mapMicroCompanyToCompany) || [];
      setCompanies(mappedCompanies);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const addCompany = async (formData: FormData) => {
    try {
      // CRÍTICO: Adicionar company_id para o backend
      const profile = await apiService.getUserProfile();
      if (profile.company_id) {
        formData.append('company', profile.company_id.toString());
        console.log('🏭 Company ID adicionado:', profile.company_id);
      }
      
      const newMicroCompany = await apiService.createMicroCompany(formData);
      const newCompany = mapMicroCompanyToCompany(newMicroCompany);
      setCompanies(prev => [...prev, newCompany]);
      toast.success('Empresa criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa');
      throw error;
    }
  };

  const updateCompany = async (id: number, formData: FormData) => {
    try {
      const updatedMicroCompany = await apiService.updateMicroCompany(id, formData);
      const updatedCompany = mapMicroCompanyToCompany(updatedMicroCompany);
      setCompanies(prev => 
        prev.map(company => 
          company.id === id ? updatedCompany : company
        )
      );
      
      if (selectedCompany?.id === id) {
        setSelectedCompany(updatedCompany);
      }
      
      toast.success('Empresa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa');
      throw error;
    }
  };

  const removeCompany = async (id: number) => {
    try {
      await apiService.deleteMicroCompany(id);
      setCompanies(prev => prev.filter(company => company.id !== id));
      
      if (selectedCompany?.id === id) {
        setSelectedCompany(null);
      }
      
      toast.success('Empresa removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover empresa:', error);
      toast.error('Erro ao remover empresa');
      throw error;
    }
  };

  useEffect(() => {
    if (authService.isAuthenticated()) {
      refreshCompanies();
    }
  }, []);

  return (
    <CompanyContext.Provider value={{
      selectedCompany,
      setSelectedCompany,
      companies,
      isLoading,
      addCompany,
      updateCompany,
      removeCompany,
      refreshCompanies
    }}>
      {children}
    </CompanyContext.Provider>
  );
};