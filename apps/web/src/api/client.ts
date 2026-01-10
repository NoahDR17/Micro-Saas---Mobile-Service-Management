import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientsQuery,
  Client,
  ApiError,
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  AddOn,
  CreateAddOnRequest,
  UpdateAddOnRequest,
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingsQuery,
  SetBookingStatusRequest,
  Business,
  UpdateBusinessRequest,
  MessageTemplate,
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  MessageLog,
  MessageLogsQuery,
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
      try {
        const error: ApiError = await response.json();
        throw new Error(error.error.message);
      } catch (e) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    // Handle empty responses (like 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
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
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore errors during logout (e.g., already logged out)
      console.warn('Logout error:', error);
    }
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

  // Service endpoints
  async getServices(params: { search?: string; active?: boolean } = {}): Promise<Service[]> {
    const usp = new URLSearchParams();
    if (params.search) usp.set('search', params.search);
    if (params.active !== undefined) usp.set('active', String(params.active));
    const qs = usp.toString();
    return this.request<Service[]>(`/services${qs ? `?${qs}` : ''}`);
  }

  async createService(data: CreateServiceRequest): Promise<Service> {
    return this.request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: UpdateServiceRequest): Promise<Service> {
    return this.request<Service>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Add-on endpoints
  async getAddOns(params: { search?: string; active?: boolean } = {}): Promise<AddOn[]> {
    const usp = new URLSearchParams();
    if (params.search) usp.set('search', params.search);
    if (params.active !== undefined) usp.set('active', String(params.active));
    const qs = usp.toString();
    return this.request<AddOn[]>(`/addons${qs ? `?${qs}` : ''}`);
  }

  async createAddOn(data: CreateAddOnRequest): Promise<AddOn> {
    return this.request<AddOn>('/addons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddOn(id: string, data: UpdateAddOnRequest): Promise<AddOn> {
    return this.request<AddOn>(`/addons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Booking endpoints
  async getBookings(query: BookingsQuery = {}): Promise<Booking[]> {
    const usp = new URLSearchParams();
    if (query.status) usp.set('status', query.status);
    if (query.from) usp.set('from', query.from);
    if (query.to) usp.set('to', query.to);
    const qs = usp.toString();
    return this.request<Booking[]>(`/bookings${qs ? `?${qs}` : ''}`);
  }

  async getBooking(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    }

  async updateBooking(id: string, data: UpdateBookingRequest): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async setBookingStatus(id: string, status: SetBookingStatusRequest): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}/status`, {
      method: 'POST',
      body: JSON.stringify(status),
    });
  }

  // Business endpoints
  async getBusiness(): Promise<Business> {
    return this.request<Business>('/businesses/me');
  }

  async updateBusiness(data: UpdateBusinessRequest): Promise<Business> {
    return this.request<Business>('/businesses/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<{
    todayBookings: number;
    upcomingBookings: number;
    dueToRebookCount: number;
    automationActivityToday: number;
    weeklyIncomeEstimate: number;
  }> {
    return this.request('/dashboard');
  }

  async getDashboardBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/dashboard/bookings');
  }

  async getDueToRebookClients(): Promise<Client[]> {
    return this.request<Client[]>('/dashboard/due-to-rebook');
  }

  // Template endpoints
  async getTemplates(): Promise<MessageTemplate[]> {
    return this.request<MessageTemplate[]>('/templates');
  }

  async getTemplate(id: string): Promise<MessageTemplate> {
    return this.request<MessageTemplate>(`/templates/${id}`);
  }

  async createTemplate(data: CreateMessageTemplateRequest): Promise<MessageTemplate> {
    return this.request<MessageTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, data: UpdateMessageTemplateRequest): Promise<MessageTemplate> {
    return this.request<MessageTemplate>(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.request(`/templates/${id}`, { method: 'DELETE' });
  }

  async previewTemplate(id: string, variables: Record<string, string>): Promise<{ subject: string | null; body: string }> {
    return this.request(`/templates/${id}/preview`, {
      method: 'POST',
      body: JSON.stringify({ variables }),
    });
  }

  // Message log endpoints
  async getMessageLogs(query: MessageLogsQuery = {}): Promise<MessageLog[]> {
    const usp = new URLSearchParams();
    if (query.status) usp.set('status', query.status);
    if (query.from) usp.set('from', query.from);
    if (query.to) usp.set('to', query.to);
    const qs = usp.toString();
    return this.request<MessageLog[]>(`/message-logs${qs ? `?${qs}` : ''}`);
  }

  async getMessageLog(id: string): Promise<MessageLog> {
    return this.request<MessageLog>(`/message-logs/${id}`);
  }
}

export const apiClient = new ApiClient();
