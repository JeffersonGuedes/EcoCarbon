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

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
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
    return this.makeRequest<{access: string, refresh: string}>('/token/', {
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
    const query = companyId ? `?company=${companyId}` : '';
    return this.makeRequest<ApiResponse<MicroCompany>>(`/micro/${query}`);
  }

  async createMicroCompany(formData: FormData) {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseURL}/micro/`, {
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

  async updateMicroCompany(id: number, formData: FormData) {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseURL}/micro/${id}/`, {
      method: 'PUT',
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

// Types based on the API documentation
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
  logo?: string;
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