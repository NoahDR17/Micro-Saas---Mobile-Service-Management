// Base entity types
export interface Business {
  id: string;
  name: string;
  timezone: string;
  identifierLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  businessId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  businessId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  identifierValue: string | null;
  notes: string | null;
  doNotContact: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface RegisterRequest {
  businessName: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'createdAt' | 'updatedAt'>;
  business: Omit<Business, 'createdAt' | 'updatedAt'>;
}

// Client types
export interface CreateClientRequest {
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  identifierValue?: string;
  notes?: string;
  doNotContact?: boolean;
}

export interface UpdateClientRequest {
  fullName?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  identifierValue?: string | null;
  notes?: string | null;
  doNotContact?: boolean;
}

export interface ClientsQuery {
  search?: string;
  archived?: boolean;
}

// Error types
export interface ApiError {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
