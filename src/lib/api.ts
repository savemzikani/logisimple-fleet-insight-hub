import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { UserProfile } from '@/lib/types';

// Auth service
export const authService = {
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: userData
      }
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
  },

  async updatePassword(newPassword: string) {
    return supabase.auth.updateUser({ password: newPassword });
  }
};

// Driver service
export const driverService = {
  async getAll(filters: Record<string, any> = {}) {
    let query = supabase.from('drivers').select('*');
    
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    
    return query;
  },

  async create(data: any) {
    return supabase.from('drivers').insert(data).select().single();
  },

  async update(id: string, data: any) {
    return supabase.from('drivers').update(data).eq('id', id).select().single();
  },

  async delete(id: string) {
    return supabase.from('drivers').delete().eq('id', id);
  },

  async getDriversByStatus(companyId: string, status: string) {
    return supabase
      .from('drivers')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', status === 'active');
  },

  async getDriversWithExpiringLicenses(companyId: string, daysThreshold: number) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return supabase
      .from('drivers')
      .select('*')
      .eq('company_id', companyId)
      .lt('license_expiry', thresholdDate.toISOString().split('T')[0]);
  }
};

// Vehicle service
export const vehicleService = {
  async getAll(filters: Record<string, any> = {}) {
    let query = supabase.from('vehicles').select('*');
    
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    
    return query;
  },

  async create(data: any) {
    return supabase.from('vehicles').insert(data).select().single();
  },

  async update(id: string, data: any) {
    return supabase.from('vehicles').update(data).eq('id', id).select().single();
  },

  async delete(id: string) {
    return supabase.from('vehicles').delete().eq('id', id);
  },

  async getVehicleStatusCounts(companyId: string) {
    const { data } = await supabase
      .from('vehicles')
      .select('status')
      .eq('company_id', companyId);
    
    if (!data) return null;
    
    const counts = data.reduce((acc: Record<string, number>, vehicle) => {
      const status = vehicle.status || 'available';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return counts;
  }
};

// Company service
export const companyService = {
  async getById(id: string) {
    return supabase.from('companies').select('*').eq('id', id).single();
  },

  async update(id: string, data: any) {
    return supabase.from('companies').update(data).eq('id', id).select().single();
  }
};