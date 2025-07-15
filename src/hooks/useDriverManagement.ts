import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { Driver, DriverStatus, DriverFilter, VehicleAssignment, Document } from '@/types';
import { format } from 'date-fns';

export const useDriverManagement = (initialFilters: DriverFilter = {}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DriverFilter>(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
  });
  const { toast } = useToast();

  // Load drivers with pagination and filters
  const loadDrivers = useCallback(async (page = 1, refresh = false) => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/drivers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const { data, total } = await response.json();
      
      setDrivers(prev => refresh ? data : [...prev, ...data]);
      setPagination(prev => ({
        ...prev,
        page,
        total,
        hasMore: page * prev.pageSize < total,
      }));
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load drivers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.pageSize, toast]);

  // Get available vehicles for assignment
  const getAvailableVehicles = useCallback(async (): Promise<Array<{
    id: string;
    name: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  }>> => {
    try {
      const response = await fetch('/api/vehicles/available');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch available vehicles');
      }
      const data = await response.json();
      return data.map((vehicle: any) => ({
        id: vehicle.id,
        name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.license_plate,
      }));
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load available vehicles',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  // Get driver's vehicle assignments
  const getDriverAssignments = useCallback(async (driverId: string, status?: 'active' | 'past'): Promise<VehicleAssignment[]> => {
    try {
      const url = new URL(`/api/drivers/${driverId}/assignments`, window.location.origin);
      if (status) {
        url.searchParams.append('status', status);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch driver assignments');
      }
      
      const data = await response.json();
      return data.map((assignment: any) => ({
        id: assignment.id,
        vehicle_id: assignment.vehicle_id,
        vehicle: assignment.vehicle ? {
          id: assignment.vehicle.id,
          name: assignment.vehicle.name,
          make: assignment.vehicle.make,
          model: assignment.vehicle.model,
          year: assignment.vehicle.year,
          license_plate: assignment.vehicle.license_plate,
          status: assignment.vehicle.status,
          type: assignment.vehicle.type,
        } : null,
        start_date: assignment.start_date,
        end_date: assignment.end_date,
        status: assignment.status,
        notes: assignment.notes,
        created_at: assignment.created_at,
        updated_at: assignment.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching driver assignments:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load driver assignments',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  // Assign vehicle to driver
  const assignVehicleToDriver = useCallback(async (
    driverId: string, 
    vehicleId: string, 
    data: { start_date: string; end_date?: string | null; notes?: string | null }
  ): Promise<VehicleAssignment> => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vehicle_id: vehicleId, 
          start_date: data.start_date,
          end_date: data.end_date || null,
          notes: data.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign vehicle');
      }

      const result = await response.json();
      
      // Update the local state if needed
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.id === driverId 
            ? { 
                ...driver, 
                current_vehicle_id: result.vehicle_id,
                current_vehicle: result.vehicle,
              } 
            : driver
        )
      );

      return result;
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign vehicle',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // End driver assignment
  const endDriverAssignment = useCallback(async (assignmentId: string, driverId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          end_date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to end assignment');
      }

      // Update the local state
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.id === driverId 
            ? { 
                ...driver, 
                current_vehicle_id: null,
                current_vehicle: null,
              } 
            : driver
        )
      );

      toast({
        title: 'Success',
        description: 'Assignment ended successfully',
      });
    } catch (error) {
      console.error('Error ending assignment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to end assignment',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Get driver documents
  const getDriverDocuments = useCallback(async (driverId: string): Promise<Document[]> => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/documents`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch driver documents');
      }
      
      const data = await response.json();
      return data.map((doc: any) => ({
        id: doc.id,
        driver_id: doc.driver_id,
        name: doc.file_name,
        type: doc.document_type,
        url: doc.download_url,
        upload_date: doc.created_at,
        expiry_date: doc.expiry_date,
        status: doc.status === 'expired' ? 'expired' : 
                doc.expiry_date && new Date(doc.expiry_date) < new Date() ? 'expired' :
                doc.expiry_date && new Date(doc.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring_soon' :
                'valid',
        metadata: {
          size: doc.file_size,
          mime_type: doc.file_type,
          uploaded_by: doc.uploaded_by,
        },
      }));
    } catch (error) {
      console.error('Error fetching driver documents:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load driver documents',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  // Upload document for driver
  const uploadDriverDocument = useCallback(async (
    driverId: string, 
    file: File, 
    metadata: { name: string; type: string; size: number, expiry_date?: string }
  ): Promise<Document> => {
    try {
      // First get a signed URL for upload
      const uploadResponse = await fetch(`/api/documents/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          driver_id: driverId,
          metadata: {
            ...metadata,
            expiry_date: metadata.expiry_date || null,
          },
        }),
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.message || 'Failed to get upload URL');
      }

      const { uploadUrl, documentId, fields } = await uploadResponse.json();
      
      // Prepare form data for S3 upload
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      // Upload the file to S3
      const s3Response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!s3Response.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // Get the uploaded document details
      const documentResponse = await fetch(`/api/documents/${documentId}`);
      if (!documentResponse.ok) {
        throw new Error('Failed to get uploaded document details');
      }

      const document = await documentResponse.json();
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      return {
        id: document.id,
        driver_id: document.driver_id,
        name: document.file_name,
        type: document.document_type,
        url: document.download_url,
        upload_date: document.created_at,
        expiry_date: document.expiry_date,
        status: document.status === 'expired' ? 'expired' : 
                document.expiry_date && new Date(document.expiry_date) < new Date() ? 'expired' :
                document.expiry_date && new Date(document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring_soon' :
                'valid',
        metadata: {
          size: document.file_size,
          mime_type: document.file_type,
          uploaded_by: document.uploaded_by,
        },
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Delete driver document
  const deleteDriverDocument = useCallback(async (driverId: string, documentId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete document');
      }

      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete document',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Load a single driver by ID
  const loadDriver = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/drivers/${id}`);
      
      if (!response.ok) {
        throw new Error('Driver not found');
      }

      const data = await response.json();
      setSelectedDriver(data);
      return data;
    } catch (error) {
      console.error('Error loading driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to load driver details.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new driver
  const createDriver = useCallback(async (driverData: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create driver');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Driver created successfully',
      });
      
      // Refresh the drivers list
      await loadDrivers(1, true);
      
      return data;
    } catch (error) {
      console.error('Error creating driver:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create driver',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadDrivers, toast]);

  // Update an existing driver
  const updateDriver = useCallback(async (id: string, driverData: Partial<Driver>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update driver');
      }

      const data = await response.json();
      
      // Update the drivers list
      setDrivers(prev => 
        prev.map(driver => driver.id === id ? { ...driver, ...data } : driver)
      );
      
      // Update selected driver if it's the one being edited
      if (selectedDriver?.id === id) {
        setSelectedDriver(prev => prev ? { ...prev, ...data } : null);
      }
      
      toast({
        title: 'Success',
        description: 'Driver updated successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error updating driver:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update driver',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedDriver?.id, toast]);

  // Delete a driver
  const deleteDriver = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete driver');
      }
      
      // Update the drivers list
      setDrivers(prev => prev.filter(driver => driver.id !== id));
      
      // Clear selected driver if it's the one being deleted
      if (selectedDriver?.id === id) {
        setSelectedDriver(null);
      }
      
      toast({
        title: 'Success',
        description: 'Driver deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete driver',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedDriver?.id, toast]);

  // Update driver status
  const updateDriverStatus = useCallback(async (id: string, status: DriverStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/drivers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update driver status');
      }

      const data = await response.json();
      
      // Update the drivers list
      setDrivers(prev => 
        prev.map(driver => driver.id === id ? { ...driver, status } : driver)
      );
      
      // Update selected driver if it's the one being updated
      if (selectedDriver?.id === id) {
        setSelectedDriver(prev => prev ? { ...prev, status } : null);
      }
      
      toast({
        title: 'Success',
        description: `Driver marked as ${status}`,
      });
      
      return data;
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update driver status',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedDriver?.id, toast]);

  // Apply filters and refresh the list
  const applyFilters = useCallback((newFilters: Partial<DriverFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    // We'll reload in the effect
  }, []);

  // Load next page of results
  const loadNextPage = useCallback(() => {
    if (pagination.hasMore && !loading) {
      loadDrivers(pagination.page + 1);
    }
  }, [loadDrivers, pagination.hasMore, pagination.page, loading]);

  // Load drivers when filters change
  useEffect(() => {
    loadDrivers(1, true);
  }, [filters, loadDrivers]);

  return {
    drivers,
    selectedDriver,
    loading,
    filters,
    pagination,
    setFilters,
    loadDrivers,
    loadDriver,
    createDriver,
    updateDriver,
    deleteDriver,
    updateDriverStatus,
    getDriverDocuments,
    uploadDriverDocument,
    deleteDriverDocument,
    getAvailableVehicles,
    getDriverAssignments,
    assignVehicleToDriver,
    endDriverAssignment,
    applyFilters,
    loadNextPage,
    setSelectedDriver,
  };
};
