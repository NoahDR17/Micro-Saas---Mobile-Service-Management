import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientsQuery,
  Client,
  ApiError,
} from '@msm/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async me(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/me');
  }

  // Client endpoints
  async getClients(query: ClientsQuery = {}): Promise<Client[]> {
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.archived !== undefined) params.set('archived', String(query.archived));
    
    const queryString = params.toString();
    return this.request<Client[]>(`/clients${queryString ? `?${queryString}` : ''}`);
  }

  async getClient(id: string): Promise<Client> {
    return this.request<Client>(`/clients/${id}`);
  }

  async createClient(data: CreateClientRequest): Promise<Client> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: UpdateClientRequest): Promise<Client> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async archiveClient(id: string): Promise<Client> {
    return this.request<Client>(`/clients/${id}/archive`, {
      method: 'POST',
    });
  }

  async unarchiveClient(id: string): Promise<Client> {
    return this.request<Client>(`/clients/${id}/unarchive`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
