// User and Auth Types
export interface UserProfile {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'manager' | 'dispatcher' | 'driver';
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Vehicle Types
export type VehicleStatus = 'available' | 'assigned' | 'maintenance' | 'out_of_service';
export type VehicleType = 'truck' | 'van' | 'car' | 'motorcycle' | 'trailer';

export interface Vehicle {
  id: string;
  company_id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  status?: VehicleStatus;
  mileage?: number;
  last_service_date?: string;
  next_service_mileage?: number;
  color?: string;
  fuel_type?: string;
  fuel_efficiency?: number;
  current_mileage?: number;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  registration_expiry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Driver Types
export type DriverStatus = 'active' | 'on-leave' | 'inactive' | 'suspended';

export interface Driver {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  license_number?: string;
  license_class?: string;
  license_expiry?: string;
  hire_date?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  is_active: boolean;
  user_id?: string;
  status?: DriverStatus;
  created_at: string;
  updated_at: string;
}

// Filter Types
export interface DriverFilter {
  search?: string;
  status?: DriverStatus;
  license_expiry?: 'expiring' | 'expired';
}

// Assignment Types
export interface Assignment {
  id: string;
  vehicle_id: string;
  driver_id?: string;
  assigned_by?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Document Types
export interface Document {
  id: string;
  driver_id: string;
  type: string;
  filename: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiry_date?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  contact_info: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    distance_unit: 'miles' | 'kilometers';
    fuel_unit: 'gallons' | 'liters';
  };
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
