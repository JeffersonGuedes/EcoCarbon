import { UserProfile } from "./auth";

const API_BASE_URL = 'http://192.168.4.8:8080/api/v1';

interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();

    console.log(`🌐 makeRequest: ${options.method || 'GET'} ${url}`);

    const defaultHeaders: HeadersInit = {};

    // Só adicionar Content-Type se não for FormData
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
      console.log('🔐 Token de autorização adicionado');
    } else {
      console.warn('⚠️ Nenhum token de autorização encontrado');
    }

    console.log('📋 Headers:', defaultHeaders);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status}:`);
      
      let errorData;
      try {
        errorData = await response.json();
        console.error('💥 Dados do erro:', errorData);
        
        // Log específico para erro 400 com detalhes de validação
        if (response.status === 400) {
          console.error('🔍 Erro 400 - Detalhes de validação:', {
            url: url,
            payload: options.body,
            errors: errorData
          });
        }
      } catch (jsonError) {
        console.error('⚠️ Não foi possível fazer parse do erro JSON:', jsonError);
        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const errorMessage = errorData.detail || errorData.message || errorData.error || 
                        (typeof errorData === 'object' ? JSON.stringify(errorData) : errorData) ||
                        `HTTP ${response.status}: ${response.statusText}`;
      console.error('🚨 Mensagem de erro final:', errorMessage);
      
      throw new Error(errorMessage);
    }

    // Para DELETE, não tentar fazer parse do JSON se não há conteúdo
    if (response.status === 204 || options.method === 'DELETE') {
      console.log('✅ makeRequest: DELETE realizado com sucesso (sem conteúdo)');
      return {} as T;
    }

    const result = await response.json();
    console.log('✅ makeRequest: sucesso', result);
    return result;
  }

  private getAccessToken(): string | null {
    try {
      const token = localStorage.getItem('access');
      return token ? JSON.parse(token) : null;
    } catch {
      return null;
    }
  }

  // Authentication
  async login(username: string, password: string) {
    return this.makeRequest<{access: string, refresh: string}>('/auth_login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async refreshToken(refresh: string) {
    return this.makeRequest<{access: string}>('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  }

  async requestPasswordReset(email: string) {
    return this.makeRequest<{message: string}>('/auth_reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const payload = { 
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: newPassword  // Campo obrigatório pelo serializer!
    };
    
    return this.makeRequest<{message: string}>('/change_password/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // User Profile
  async getUserProfile() {
    return this.makeRequest<UserProfile>('/user/me/');
  }

  // Companies
  async getCompanies() {
    return this.makeRequest<ApiResponse<Company>>('/companies/');
  }

  async createCompany(company: Partial<Company>) {
    return this.makeRequest<Company>('/companies/', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  }

  async updateCompany(id: number, company: Partial<Company>) {
    return this.makeRequest<Company>(`/companies/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
  }

  async deleteCompany(id: number) {
    return this.makeRequest(`/companies/${id}/`, {
      method: 'DELETE',
    });
  }

  // Micro Companies
  async getMicroCompanies(companyId?: number) {
    // Sempre verificar se o usuário está autenticado
    if (!this.getAccessToken()) {
      throw new Error('Usuário não autenticado');
    }
    
    // Se um companyId for fornecido, usar ele; caso contrário, buscar o perfil do usuário
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const profile = await this.getUserProfile();
      if (!profile.company_id) {
        throw new Error('Usuário não possui empresa associada');
      }
      targetCompanyId = profile.company_id;
    }
    
    // Log de auditoria
    console.log(`API: Buscando micro-empresas da empresa ${targetCompanyId}`);
    
    const query = `?company=${targetCompanyId}`;
    return this.makeRequest<ApiResponse<MicroCompany>>(`/micro/${query}`);
  }

  async createMicroCompany(formData: FormData) {
    console.log('🌐 API: createMicroCompany iniciado');
    console.log('📤 FormData recebido na API:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }

    try {
      const result = await this.makeRequest<MicroCompany>('/micro/', {
        method: 'POST',
        body: formData,
      });
      console.log('✅ createMicroCompany: sucesso', result);
      return result;
    } catch (error) {
      console.error('❌ createMicroCompany: erro', error);
      throw error;
    }
  }

  async updateMicroCompany(id: number, formData: FormData) {
    console.log('🌐 API: updateMicroCompany iniciado para ID:', id);
    console.log('📤 FormData recebido na API:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }

    try {
      // Tentar primeiro com PATCH
      console.log('🔄 Tentando com método PATCH...');
      const result = await this.makeRequest<MicroCompany>(`/micro/${id}/`, {
        method: 'PATCH',
        body: formData,
      });
      console.log('✅ updateMicroCompany (PATCH): sucesso', result);
      return result;
    } catch (error) {
      console.warn('⚠️ PATCH falhou, tentando PUT...', error);
      try {
        const result = await this.makeRequest<MicroCompany>(`/micro/${id}/`, {
          method: 'PUT',
          body: formData,
        });
        console.log('✅ updateMicroCompany (PUT): sucesso', result);
        return result;
      } catch (putError) {
        console.error('❌ updateMicroCompany: ambos PATCH e PUT falharam');
        console.error('Erro PATCH:', error);
        console.error('Erro PUT:', putError);
        throw putError;
      }
    }
  }

  async deleteMicroCompany(id: number) {
    return this.makeRequest(`/micro/${id}/`, {
      method: 'DELETE',
    });
  }

  // Documents
  async uploadDocument(formData: FormData) {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseURL}/documents/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getDocuments() {
    return this.makeRequest<ApiResponse<Document>>('/documents/');
  }

  async getDocumentStatus(id: number) {
    return this.makeRequest<Document>(`/documents/${id}/status/`);
  }

  // Dashboard
  async getDashboardData() {
    return this.makeRequest('/dashboard/');
  }

  // Emissions
  async getEmissions() {
    return this.makeRequest<ApiResponse<Emission>>('/emissions/');
  }

  async getCompanyEmissions() {
    return this.makeRequest<ApiResponse<CompanyEmission>>('/company-emissions/');
  }

  // Categories and Scopes
  async getCategories() {
    return this.makeRequest<ApiResponse<Category>>('/categories/');
  }

  async getScopes() {
    return this.makeRequest<ApiResponse<Scope>>('/scopes/');
  }
}

export const apiService = new ApiService();

export interface Company {
  id: number;
  name: string;
  cnpj?: string;
  created_at: string;
  updated_at: string;
}

export interface MicroCompany {
  id: number;
  name: string;
  logo?: string; // URL da imagem
  logo_file?: File; // Para upload
  description?: string;
  company: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  file: string;
  file_name: string;
  file_type: 'PDF' | 'EXCEL' | 'CSV' | 'IMAGE' | 'OTHER';
  file_size: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Emission {
  id: number;
  scope: Scope;
  type: string;
  quantity: string;
  emission_factor: string;
  year: number;
  created_at: string;
}

export interface CompanyEmission {
  micro_company: number;
  emission: number;
  micro_company_name: string;
  emission_type: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  // Add other category fields based on API response
}

export interface Scope {
  id: number;
  category: number;
  name: string;
  number_scope: 1 | 2 | 3;
  created_at: string;
}