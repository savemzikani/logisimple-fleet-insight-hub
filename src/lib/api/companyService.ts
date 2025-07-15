import { BaseService } from './baseService';
import { Company } from '@/types';

export class CompanyService extends BaseService<Company> {
  constructor() {
    super('companies');
  }

  async getCompanyByUserId(userId: string): Promise<{ data: Company | null; error: Error | null; status: number }> {
    try {
      // First get the user's profile to get the company_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw profileError || new Error('User profile not found');
      }

      // Then get the company data
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (error) throw error;
      
      return { data, error: null, status: 200 };
    } catch (error: any) {
      console.error('Error in getCompanyByUserId:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to fetch company data'),
        status: 500 
      };
    }
  }

  async updateCompanySettings(companyId: string, settings: Partial<Company['settings']>) {
    return this.handleResponse<Company>(
      supabase
        .from(this.tableName)
        .update({ 
          settings,
          updated_at: new Date().toISOString() 
        })
        .eq('id', companyId)
        .select()
        .single()
    );
  }

  async getCompanyStats(companyId: string) {
    return this.handleResponse<{
      total_vehicles: number;
      active_vehicles: number;
      total_drivers: number;
      active_drivers: number;
      upcoming_maintenance: number;
      expiring_licenses: number;
    }>(
      supabase
        .rpc('get_company_stats', { p_company_id: companyId })
        .single()
    );
  }
}

export const companyService = new CompanyService();
