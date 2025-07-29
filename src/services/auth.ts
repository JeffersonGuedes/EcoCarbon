import { apiService } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
  company_id: number;
  company: string;
  is_admin?: boolean;
  is_employee?: boolean;
  can_write?: boolean;
  role?: string;
  permissions?: string[];
}

class AuthService {
  private tokenKey = 'access';
  private refreshTokenKey = 'refresh';

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await apiService.login(credentials.username, credentials.password);
      
      this.setTokens({
        access: response.access,
        refresh: response.refresh,
      });

      return response;
    } catch (error) {
      throw new Error('Credenciais inválidas');
    }
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('Token de refresh não encontrado');
    }

    try {
      const response = await apiService.refreshToken(refreshToken);
      this.setAccessToken(response.access);
      return response.access;
    } catch (error) {
      this.logout();
      throw new Error('Falha ao renovar token');
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    window.location.href = '/login';
  }

  getAccessToken(): string | null {
    try {
      const token = localStorage.getItem(this.tokenKey);
      return token ? JSON.parse(token) : null;
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      const token = localStorage.getItem(this.refreshTokenKey);
      return token ? JSON.parse(token) : null;
    } catch {
      return null;
    }
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.tokenKey, JSON.stringify(tokens.access));
    localStorage.setItem(this.refreshTokenKey, JSON.stringify(tokens.refresh));
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.tokenKey, JSON.stringify(token));
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async getUserProfile(): Promise<UserProfile> {
    if (!this.isAuthenticated()) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const profile = await apiService.getUserProfile();
      return profile as UserProfile;
    } catch (error) {
      throw new Error('Falha ao obter perfil do usuário');
    }
  }
}

export const authService = new AuthService();

export const getAccessToken = () => authService.getAccessToken();
export const getUserProfile = () => authService.getUserProfile();
export const refreshAccessToken = () => authService.refreshAccessToken();