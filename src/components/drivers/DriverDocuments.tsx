import { useState, useCallback, useEffect } from 'react';
import { FileText, Upload, X, Download, File, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate, formatFileSize } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Document } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useDriverManagement } from '@/hooks/useDriverManagement';

interface DriverDocumentsProps {
  driverId: string;
  onDocumentUpload: (document: Document) => void;
  onDocumentDelete: (documentId: string) => Promise<void>;
  documents: Document[];
  isLoading?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'license', label: 'Driver License' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'medical_card', label: 'Medical Card' },
  { value: 'cvor_abstract', label: 'CVOR Abstract' },
  { value: 'driver_abstract', label: 'Driver Abstract' },
  { value: 'other', label: 'Other' },
];

export function DriverDocuments({
  driverId,
  onDocumentUpload,
  onDocumentDelete,
  documents = [],
  isLoading = false,
}: DriverDocumentsProps) {
  const { toast } = useToast();
  const { companyId } = useParams<{ companyId: string }>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('license');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { getDriverDocuments, uploadDriverDocument, deleteDriverDocument } = useDriverManagement({
    companyId: companyId || '',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setIsUploadDialogOpen(true);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Upload the document
      const newDocument = await uploadDriverDocument(driverId, selectedFile, {
        name: selectedFile.name,
        type: documentType,
        size: selectedFile.size,
        expiry_date: expiryDate || undefined,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Small delay to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('license');
      setExpiryDate('');
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDriverDocument(driverId, documentId);
      
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('image')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileText className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return <Badge variant="destructive" className="whitespace-nowrap">Expired</Badge>;
      case 'expiring_soon':
        return <Badge variant="warning" className="whitespace-nowrap">Expiring Soon</Badge>;
      case 'pending_upload':
        return <Badge variant="outline" className="whitespace-nowrap">Uploading</Badge>;
      case 'valid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Valid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Valid
          </span>
        );
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Manage driver's documents and certifications</CardDescription>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => document.getElementById('document-upload')?.click()}
            >
              {isUploading ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
              <input
                id="document-upload"
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setIsUploadDialogOpen(true);
                  }
                }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by uploading a document.
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{getDocumentIcon(doc.type)}</TableCell>
                    <TableCell className="font-medium">
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {doc.name}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.type}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(doc.upload_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(doc.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
