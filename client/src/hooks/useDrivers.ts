import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/lib/api';
import { Driver } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export const useDrivers = (filters: Record<string, any> = {}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch all drivers
  const {
    data: drivers,
    isLoading,
    error,
    refetch,
  } = useQuery<any[]>({
    queryKey: ['drivers', profile?.company_id, filters],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      
      const { data, error } = await driverService.getAll({
        ...filters,
        company_id: profile.company_id,
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.company_id,
  });

  // Create a new driver
  const createDriver = useMutation({
    mutationFn: async (driverData: any) => {
      const { data, error } = await driverService.create(driverData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  // Update an existing driver
  const updateDriver = useMutation({
    mutationFn: async ({ id, ...updates }: any & { id: string }) => {
      const { data, error } = await driverService.update(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  // Delete a driver
  const deleteDriver = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await driverService.delete(id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  // Get drivers by status
  const getDriversByStatus = async (status: string) => {
    if (!profile?.company_id) return [];
    
    const { data, error } = await driverService.getDriversByStatus(profile.company_id, status);
    if (error) throw error;
    return data || [];
  };

  // Get drivers with expiring licenses
  const getDriversWithExpiringLicenses = async (daysThreshold: number = 30) => {
    if (!profile?.company_id) return [];
    
    const { data, error } = await driverService.getDriversWithExpiringLicenses(
      profile.company_id, 
      daysThreshold
    );
    
    if (error) throw error;
    return data || [];
  };

  return {
    drivers: drivers || [],
    isLoading,
    error,
    refetch,
    createDriver,
    updateDriver,
    deleteDriver,
    getDriversByStatus,
    getDriversWithExpiringLicenses,
  };
};
