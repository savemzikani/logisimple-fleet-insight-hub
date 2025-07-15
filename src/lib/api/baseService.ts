import { PostgrestError, PostgrestResponse } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';

type TableName = 'companies' | 'customers' | 'drivers' | 'fuel_records' | 'vehicles' | 'maintenance_records' | 'profiles' | 'trips' | 'vehicle_tracking';

export class BaseService<T> {
  protected tableName: TableName;

  constructor(tableName: TableName) {
    this.tableName = tableName;
  }

  protected async handleResponse<D>(
    query: Promise<{ data: D | null; error: PostgrestError | null; status: number }>
  ): Promise<ApiResponse<D>> {
    try {
      const { data, error, status } = await query;
      
      if (error) {
        console.error(`Error in ${this.tableName} service:`, error);
        return { 
          data: null, 
          error: new Error(error.message), 
          status: status || 400 
        };
      }
      
      return { 
        data: data as D, 
        error: null, 
        status: status || 200 
      };
    } catch (error: any) {
      console.error(`Unexpected error in ${this.tableName} service:`, error);
      return { 
        data: null, 
        error: new Error(error.message || 'An unexpected error occurred'),
        status: 500 
      };
    }
  }

  async getAll(filters: Partial<T> = {}): Promise<ApiResponse<T[]>> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    return this.handleResponse<T[]>(
      query.then(({ data, error, status }) => ({
        data: data as T[], 
        error, 
        status: status || (error ? 400 : 200)
      }))
    );
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
      
    return this.handleResponse<T>(
      query.then(({ data, error, status }) => ({
        data: data as T | null,
        error,
        status: status || (error ? 404 : 200)
      }))
    );
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<T>> {
    return this.handleResponse<T>(
      supabase
        .from(this.tableName)
        .insert([data])
        .select()
        .single()
    );
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.handleResponse<T>(
      supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${this.tableName}:`, error);
      return { data: false, error: new Error(error.message), status: 400 };
    }

    return { data: true, error: null, status: 200 };
  }
}
