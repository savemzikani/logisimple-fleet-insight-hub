// Simple types that match the database schema
export type Driver = {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  license_number: string | null;
  license_expiry: string | null;
  is_active: boolean | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Vehicle = {
  id: string;
  company_id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  license_plate: string | null;
  status: string | null;
  mileage: number | null;
  last_service_date: string | null;
  next_service_mileage: number | null;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  company_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UserProfile = Profile;

// Status types
export type DriverStatus = 'active' | 'inactive' | 'on-leave' | 'suspended';
export type VehicleStatus = 'available' | 'in-use' | 'maintenance' | 'out-of-service';
export type LicenseClass = 'CDL-A' | 'CDL-B' | 'CDL-C' | 'Regular';
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic' | 'cvt';

// Additional types for UI
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

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

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'license', name: 'Driver License', description: 'Valid driver license', required: true },
  { id: 'medical', name: 'Medical Certificate', description: 'DOT medical certificate', required: true },
  { id: 'insurance', name: 'Insurance Card', description: 'Proof of insurance', required: false },
  { id: 'background', name: 'Background Check', description: 'Background check results', required: true },
  { id: 'training', name: 'Training Certificate', description: 'Training completion certificate', required: false },
];