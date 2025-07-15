import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import { vehicleService } from '@/lib/api/vehicleService';
import { Vehicle, VehicleStatus, VehicleType, MaintenanceRecord } from '@/types';

interface UseVehicleManagementProps {
  companyId: string;
  initialStatus?: VehicleStatus;
  pageSize?: number;
}

export function useVehicleManagement({ 
  companyId, 
  initialStatus,
  pageSize = 10 
}: UseVehicleManagementProps) {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState({
    status: initialStatus,
    type: undefined as VehicleType | undefined,
    search: ''
  });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [vehiclesDueForMaintenance, setVehiclesDueForMaintenance] = useState<Vehicle[]>([]);

  // Load vehicles with pagination and filters
  const loadVehicles = useCallback(async (page = 1, reset = false) => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const { data, count, error } = await vehicleService.getVehicles(companyId, {
        status: filters.status,
        type: filters.type,
        search: filters.search,
        page,
        limit: pageSize
      });

      if (error) throw error;

      setVehicles(prev => reset ? (data || []) : [...prev, ...(data || [])]);
      setPagination(prev => ({
        page,
        total: count || 0,
        hasMore: !!data?.length && (count || 0) > page * pageSize
      }));
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, filters, pageSize, toast]);

  // Load a single vehicle by ID
  const loadVehicle = useCallback(async (vehicleId: string) => {
    if (!companyId) return null;
    
    try {
      setLoading(true);
      const { data, error } = await vehicleService.getVehicleById(companyId, vehicleId);
      
      if (error) throw error;
      setSelectedVehicle(data);
      return data;
    } catch (error) {
      console.error('Error loading vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicle details. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [companyId, toast]);

  // Create a new vehicle
  const createVehicle = useCallback(async (vehicleData: Omit<Vehicle, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) return null;
    
    try {
      setLoading(true);
      const { data, error } = await vehicleService.createVehicle(companyId, vehicleData);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Vehicle created successfully!',
      });
      
      await loadVehicles(1, true); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to create vehicle. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [companyId, loadVehicles, toast]);

  // Update an existing vehicle
  const updateVehicle = useCallback(async (vehicleId: string, updates: Partial<Vehicle>) => {
    if (!companyId) return null;
    
    try {
      setLoading(true);
      const { data, error } = await vehicleService.updateVehicle(companyId, vehicleId, updates);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Vehicle updated successfully!',
      });
      
      // Update the vehicle in the local state
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, ...updates } : v));
      
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle(prev => prev ? { ...prev, ...updates } : null);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vehicle. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [companyId, selectedVehicle]);

  // Delete a vehicle
  const deleteVehicle = useCallback(async (vehicleId: string) => {
    if (!companyId) return false;
    
    try {
      setLoading(true);
      const { error } = await vehicleService.deleteVehicle(companyId, vehicleId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully!',
      });
      
      // Remove the vehicle from the local state
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [companyId, selectedVehicle, toast]);

  // Load maintenance history for a vehicle
  const loadMaintenanceHistory = useCallback(async (vehicleId: string) => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const { data, error } = await vehicleService.getMaintenanceHistory(companyId, vehicleId);
      
      if (error) throw error;
      
      setMaintenanceHistory(data || []);
    } catch (error) {
      console.error('Error loading maintenance history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load maintenance history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, toast]);

  // Add a maintenance record
  const addMaintenanceRecord = useCallback(async (vehicleId: string, recordData: Omit<MaintenanceRecord, 'id' | 'company_id' | 'vehicle_id' | 'created_at'>) => {
    if (!companyId) return null;
    
    try {
      setLoading(true);
      const { data, error } = await vehicleService.createMaintenanceRecord(companyId, vehicleId, recordData);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Maintenance record added successfully!',
      });
      
      // Refresh the maintenance history
      await loadMaintenanceHistory(vehicleId);
      
      return data;
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      toast({
        title: 'Error',
        description: 'Failed to add maintenance record. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [companyId, loadMaintenanceHistory, toast]);

  // Update vehicle status
  const updateStatus = useCallback(async (vehicleId: string, status: VehicleStatus, notes?: string) => {
    if (!companyId) return null;
    
    try {
      setLoading(true);
      const { data, error } = await vehicleService.updateVehicleStatus(companyId, vehicleId, status, notes);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Vehicle status updated to ${status}.`,
      });
      
      // Update the vehicle in the local state
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId 
          ? { 
              ...v, 
              status, 
              status_notes: notes || v.status_notes,
              status_updated_at: new Date().toISOString()
            } 
          : v
      ));
      
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle(prev => prev ? { 
          ...prev, 
          status, 
          status_notes: notes || prev.status_notes,
          status_updated_at: new Date().toISOString()
        } : null);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vehicle status. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [companyId, selectedVehicle, toast]);

  // Load vehicles due for maintenance
  const loadVehiclesDueForMaintenance = useCallback(async (daysThreshold: number = 30) => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const { data, error } = await vehicleService.getVehiclesDueForMaintenance(companyId, daysThreshold);
      
      if (error) throw error;
      
      setVehiclesDueForMaintenance(data || []);
    } catch (error) {
      console.error('Error loading vehicles due for maintenance:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicles due for maintenance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, toast]);

  // Apply filters and reset to first page
  const applyFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Load initial data
  useEffect(() => {
    loadVehicles(1, true);
    loadVehiclesDueForMaintenance();
  }, [loadVehicles, loadVehiclesDueForMaintenance]);

  // Load next page of vehicles
  const loadNextPage = useCallback(() => {
    if (pagination.hasMore) {
      loadVehicles(pagination.page + 1, false);
    }
  }, [pagination, loadVehicles]);

  return {
    // State
    vehicles,
    loading,
    pagination,
    filters,
    selectedVehicle,
    maintenanceHistory,
    vehiclesDueForMaintenance,
    
    // Actions
    loadVehicles,
    loadVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    loadMaintenanceHistory,
    addMaintenanceRecord,
    updateStatus,
    loadVehiclesDueForMaintenance,
    applyFilters,
    loadNextPage,
    setSelectedVehicle,
  };
}
