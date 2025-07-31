import { UserProfile } from "./auth";

const API_BASE_URL = 'http://192.168.3.30:8080/api/v1';

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

  async verifyToken(token: string) {
    return this.makeRequest<{valid: boolean}>('/token/verify/', {
      method: 'POST',
      body: JSON.stringify({ token }),
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
  async getCompanies(companyId?: number) {
    // Se um companyId específico for fornecido, buscar apenas essa empresa
    if (companyId) {
      return this.makeRequest<Company>(`/companies/${companyId}/`);
    }
    
    // Caso contrário, buscar todas as empresas (para super admins) ou filtrar pela empresa do usuário
    return this.makeRequest<ApiResponse<Company>>('/companies/');
  }

  async getCompaniesByUser() {
    // Buscar as empresas associadas ao usuário logado
    const profile = await this.getUserProfile();
    if (profile.company_id) {
      const company = await this.getCompanies(profile.company_id);
      return { results: [company] as Company[] };
    }
    return { results: [] as Company[] };
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
    try {
      console.log('📤 Iniciando upload de documento...');
      
      // Log dos dados sendo enviados
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: "${value}"`);
        }
      }

      const response = await fetch(`${this.baseURL}/documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          // NÃO adicione Content-Type para multipart/form-data
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload realizado com sucesso:', result);
        return result;
      } else {
        const error = await response.json();
        console.error('❌ Erro no upload:', error);
        throw new Error(JSON.stringify(error));
      }
    } catch (error) {
      console.error('❌ Erro de rede:', error);
      throw error;
    }
  }

  async linkDocumentToMicroCompany(documentId: number, microCompanyId: number) {
    console.log(`🔗 Vinculando documento ${documentId} à micro empresa ${microCompanyId}`);
    return this.makeRequest(`/micro-documents/`, {
      method: 'POST',
      body: JSON.stringify({
        document: documentId,
        micro_company: microCompanyId
      }),
    });
  }

  async getDocuments() {
    return this.makeRequest<ApiResponse<Document>>('/documents/');
  }

  async getDocumentStatus(id: number) {
    return this.makeRequest<Document>(`/documents/${id}/status/`);
  }

  // History
  async addToHistory(action: string, description: string, documentId?: number) {
    const profile = await this.getUserProfile();
    const payload = {
      action,
      description,
      user_name: `${profile.first_name} ${profile.last_name}`,
      company_id: profile.company_id,
      document_id: documentId,
      timestamp: new Date().toISOString()
    };
    
    console.log('📝 Adicionando ao histórico:', payload);
    return this.makeRequest('/history/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getHistory() {
    return this.makeRequest<ApiResponse<any>>('/history/');
  }

  // Notifications
  async addNotification(type: 'success' | 'error' | 'info', title: string, message: string) {
    const profile = await this.getUserProfile();
    const payload = {
      type,
      title,
      message,
      user_name: `${profile.first_name} ${profile.last_name}`,
      company_id: profile.company_id,
      timestamp: new Date().toISOString(),
      is_read: false
    };
    
    console.log('🔔 Adicionando notificação:', payload);
    return this.makeRequest('/notifications/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getNotifications() {
    return this.makeRequest<ApiResponse<any>>('/notifications/');
  }

  async markNotificationAsRead(id: number) {
    return this.makeRequest(`/notifications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    });
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

  // User Management
  async getUsers(companyId?: number) {
    // Se um companyId for fornecido, filtrar usuários por empresa
    if (companyId) {
      const query = `?company=${companyId}`;
      return this.makeRequest<ApiResponse<UserList>>(`/users/${query}`);
    }
    
    return this.makeRequest<ApiResponse<UserList>>('/users/');
  }

  async getUsersByCompany() {
    // Buscar usuários da empresa do usuário logado
    const profile = await this.getUserProfile();
    if (profile.company_id) {
      return this.getUsers(profile.company_id);
    }
    return { results: [] };
  }

  async getUsersByUserRoles() {
    // Buscar usuários através do endpoint user-roles e depois buscar dados completos
    const profile = await this.getUserProfile();
    if (profile.company_id) {
      const query = `?company=${profile.company_id}`;
      const userRolesResponse = await this.makeRequest<ApiResponse<CompanyUserRole>>(`/user-roles/${query}`);
      
      const userRoles = userRolesResponse.results || [];
      
      if (userRoles.length === 0) {
        return { results: [] };
      }
      
      // Extrair IDs únicos dos usuários
      const userIds = [...new Set(userRoles.map(ur => ur.user))];
      
      // Buscar dados completos de cada usuário
      const usersPromises = userIds.map(id => this.getUserById(id));
      const users = await Promise.all(usersPromises);
      
      // Mapear os roles para cada usuário
      const usersWithRoles = users.map(user => {
        const userRolesForUser = userRoles.filter(ur => ur.user === user.id);
        return {
          ...user,
          company_roles: userRolesForUser
        };
      });
      
      return { results: usersWithRoles };
    }
    return { results: [] };
  }

  async getUserById(id: number) {
    return this.makeRequest<UserList>(`/users/${id}/`);
  }

  async createUser(userData: UserCreate) {
    return this.makeRequest<UserCreate>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: Partial<UserUpdate>) {
    return this.makeRequest<UserUpdate>(`/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async partialUpdateUser(id: number, userData: Partial<UserUpdate>) {
    return this.makeRequest<UserUpdate>(`/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number) {
    return this.makeRequest(`/users/${id}/`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: number) {
    return this.makeRequest<UserList>(`/users/${id}/reset_password/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async toggleUserActive(id: number) {
    return this.makeRequest<UserList>(`/users/${id}/toggle_active/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // User Roles Management
  async getUserRoles(companyId?: number) {
    // Se um companyId for fornecido, filtrar user-roles por empresa
    if (companyId) {
      const query = `?company=${companyId}`;
      return this.makeRequest<ApiResponse<CompanyUserRole>>(`/user-roles/${query}`);
    }
    
    return this.makeRequest<ApiResponse<CompanyUserRole>>('/user-roles/');
  }

  async getUserRolesByCompany() {
    // Buscar user-roles da empresa do usuário logado
    const profile = await this.getUserProfile();
    if (profile.company_id) {
      return this.getUserRoles(profile.company_id);
    }
    return { results: [] };
  }

  async createUserRole(roleData: Partial<CompanyUserRole>) {
    return this.makeRequest<CompanyUserRole>('/user-roles/', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async assignRole(roleData: Partial<CompanyUserRole>) {
    return this.makeRequest<CompanyUserRole>('/user-roles/assign_role/', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateUserRole(id: number, roleData: Partial<CompanyUserRole>) {
    return this.makeRequest<CompanyUserRole>(`/user-roles/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async updateUserRoleByUserRole(userRoleId: number, userData: { user: number; company: number; role: string }) {
    return this.makeRequest<CompanyUserRole>(`/user-roles/${userRoleId}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUserRole(id: number) {
    return this.makeRequest(`/user-roles/${id}/`, {
      method: 'DELETE',
    });
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

export interface MicroDocument {
  id: number;
  document: number;
  micro_company: number;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  description: string;
  user_name: string;
  company_id: number;
  document_id?: number;
  timestamp: string;
  created_at: string;
}

export interface NotificationEntry {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  user_name: string;
  company_id: number;
  timestamp: string;
  is_read: boolean;
  created_at: string;
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

// User management interfaces
export interface CompanyUserRole {
  id: number;
  user: number;
  company: number;
  role: 'company_admin' | 'employee' | 'client';
  user_name: string;
  user_email: string;
  company_name: string;
  role_display: string;
  created_at: string;
  updated_at: string;
}

export interface UserList {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  cpf: string;
  is_active: boolean;
  companies: string[];
  company_roles: CompanyUserRole[];
  date_joined: string;
  last_login: string | null;
}

export interface UserCreate {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  cpf: string;
  password: string;
  confirm_password: string;
  company_role: string;
  company_id?: number;
  is_active?: boolean;
}

export interface UserUpdate {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  cpf?: string;
  is_active?: boolean;
  company_role?: string;
  company_roles?: CompanyUserRole[];
  date_joined?: string;
  last_login?: string | null;
}