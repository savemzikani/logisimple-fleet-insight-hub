// User and Auth Types
export interface UserProfile {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'manager' | 'dispatcher' | 'driver';
  created_at: string;
  updated_at: string;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  company_id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  vehicle_type: string;
  status: 'active' | 'maintenance' | 'inactive';
  specifications: {
    fuel_type?: string;
    fuel_capacity?: number;
    odometer?: number;
    color?: string;
  };
  created_at: string;
  updated_at: string;
}

// Driver Types
export interface DriverPersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  hire_date: string;
}

export interface DriverLicenseInfo {
  license_number: string;
  license_class: string;
  license_expiry: string;
  license_state: string;
}

export interface DriverPerformanceMetrics {
  total_trips: number;
  miles_driven: number;
  safety_score: number;
  fuel_efficiency: number;
}

export interface Driver {
  id: string;
  company_id: string;
  employee_id: string;
  personal_info: DriverPersonalInfo;
  license_info: DriverLicenseInfo;
  certifications: Record<string, any>;
  emergency_contacts: Record<string, any>;
  performance_metrics: DriverPerformanceMetrics;
  status: 'active' | 'on-leave' | 'inactive' | 'suspended';
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
