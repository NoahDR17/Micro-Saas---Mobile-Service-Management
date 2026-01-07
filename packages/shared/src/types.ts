// Base entity types
export interface Business {
  id: string;
  name: string;
  timezone: string;
  identifierLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type Role = 'ADMIN' | 'SUPERVISOR' | 'USER';

export interface User {
  id: string;
  businessId: string;
  email: string;
  name: string;
  role: Role;
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

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
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

// Service types
export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  priceCents: number;
  durationMinutes: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  priceCents?: number;
  durationMinutes?: number;
  active?: boolean;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string | null;
  priceCents?: number;
  durationMinutes?: number;
  active?: boolean;
}

// Add-on types
export interface AddOn {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  priceCents: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddOnRequest {
  name: string;
  description?: string;
  priceCents?: number;
  active?: boolean;
}

export interface UpdateAddOnRequest {
  name?: string;
  description?: string | null;
  priceCents?: number;
  active?: boolean;
}

// Booking types
export type BookingStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  businessId: string;
  clientId: string;
  serviceId: string | null;
  scheduledAt: Date;
  status: BookingStatus;
  notes: string | null;
  totalCents: number | null;
  createdAt: Date;
  updatedAt: Date;
  // Expanded when included
  client?: Client;
  service?: Service | null;
  addOns?: AddOn[];
}

export interface CreateBookingRequest {
  clientId: string;
  serviceId?: string;
  addOnIds?: string[];
  scheduledAt: string; // ISO string
  notes?: string;
}

export interface UpdateBookingRequest {
  clientId?: string;
  serviceId?: string | null;
  addOnIds?: string[];
  scheduledAt?: string; // ISO string
  notes?: string | null;
}

export interface BookingsQuery {
  status?: BookingStatus;
  from?: string; // ISO
  to?: string;   // ISO
}

export interface SetBookingStatusRequest {
  status: BookingStatus;
}
