import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/lib/api';
import { Company } from '@/lib/types';
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

  // Update company 
  const updateCompany = useMutation({
    mutationFn: async (updates: Partial<Company>) => {
      if (!profile?.company_id) throw new Error('No company ID found');
      
      const { data, error } = await companyService.update(
        profile.company_id, 
        updates
      );
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });

  return {
    company,
    isLoading,
    error,
    refetch,
    updateCompany,
  };
};
