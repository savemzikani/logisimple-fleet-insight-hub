import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/lib/api';
import { Vehicle } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export const useVehicles = (filters: Record<string, any> = {}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch all vehicles
  const {
    data: vehicles,
    isLoading,
    error,
    refetch,
  } = useQuery<any[]>({
    queryKey: ['vehicles', profile?.company_id, filters],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      
      const { data, error } = await vehicleService.getAll({
        ...filters,
        company_id: profile.company_id,
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.company_id,
  });

  // Create a new vehicle
  const createVehicle = useMutation({
    mutationFn: async (vehicleData: any) => {
      const { data, error } = await vehicleService.create(vehicleData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Update an existing vehicle
  const updateVehicle = useMutation({
    mutationFn: async ({ id, ...updates }: any & { id: string }) => {
      const { data, error } = await vehicleService.update(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Delete a vehicle
  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await vehicleService.delete(id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Get vehicle status counts
  const { data: statusCounts } = useQuery({
    queryKey: ['vehicleStatusCounts', profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      
      const { data, error } = await vehicleService.getVehicleStatusCounts(profile.company_id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.company_id,
  });

  return {
    vehicles: vehicles || [],
    isLoading,
    error,
    refetch,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    statusCounts,
  };
};
