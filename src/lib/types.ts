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