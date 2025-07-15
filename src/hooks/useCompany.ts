import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/lib/api';
import { Company } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useCompany = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch company data
  const {
    data: company,
    isLoading,
    error,
    refetch,
  } = useQuery<Company | null>({
    queryKey: ['company', profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      
      const { data, error } = await companyService.getById(profile.company_id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.company_id,
  });

  // Update company settings
  const updateCompanySettings = useMutation({
    mutationFn: async (settings: Partial<Company['settings']>) => {
      if (!profile?.company_id) throw new Error('No company ID found');
      
      const { data, error } = await companyService.updateCompanySettings(
        profile.company_id, 
        settings
      );
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });

  // Get company stats
  const { data: stats } = useQuery({
    queryKey: ['companyStats', profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      
      const { data, error } = await companyService.getCompanyStats(profile.company_id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.company_id,
  });

  return {
    company,
    stats,
    isLoading,
    error,
    refetch,
    updateCompanySettings,
  };
};
