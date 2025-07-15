import { BaseService } from './baseService';
import { Vehicle, VehicleStatus, VehicleType, MaintenanceRecord } from '@/types';

export class VehicleService extends BaseService<Vehicle> {
  constructor() {
    super('vehicles');
  }

  // Enhanced CRUD operations with company scoping
  async getVehicles(companyId: string, options: {
    status?: VehicleStatus;
    type?: VehicleType;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { status, type, search, page = 1, limit = 10 } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('vehicle_type', type);
    }

    if (search) {
      query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%,license_plate.ilike.%${search}%`);
    }

    return this.handleResponse<Vehicle[]>(query);
  }

  async getVehicleById(companyId: string, vehicleId: string) {
    return this.handleResponse<Vehicle>(
      supabase
        .from(this.tableName)
        .select('*')
        .eq('company_id', companyId)
        .eq('id', vehicleId)
        .single()
    );
  }

  async createVehicle(companyId: string, vehicleData: Omit<Vehicle, 'id' | 'company_id' | 'created_at' | 'updated_at'>) {
    return this.handleResponse<Vehicle>(
      supabase
        .from(this.tableName)
        .insert([{ ...vehicleData, company_id: companyId }])
        .select()
        .single()
    );
  }

  async updateVehicle(companyId: string, vehicleId: string, vehicleData: Partial<Vehicle>) {
    return this.handleResponse<Vehicle>(
      supabase
        .from(this.tableName)
        .update(vehicleData)
        .eq('id', vehicleId)
        .eq('company_id', companyId)
        .select()
        .single()
    );
  }

  async deleteVehicle(companyId: string, vehicleId: string) {
    return this.handleResponse<{ id: string }>(
      supabase
        .from(this.tableName)
        .delete()
        .eq('id', vehicleId)
        .eq('company_id', companyId)
        .select('id')
        .single()
    );
  }

  // Fleet management specific methods
  async getVehicleStatusCounts(companyId: string) {
    const { data, error } = await this.handleResponse<Array<{ status: VehicleStatus; count: number }>>(
      supabase
        .from('vehicles')
        .select('status, count(*)')
        .eq('company_id', companyId)
        .group('status')
    );

    if (error) {
      return { data: null, error, status: 400 };
    }

    return {
      data: data?.reduce((acc, { status, count }) => ({
        ...acc,
        [status]: count
      }), {} as Record<VehicleStatus, number>),
      error: null,
      status: 200
    };
  }

  async getVehiclesByStatus(companyId: string, status: VehicleStatus) {
    return this.handleResponse<Vehicle[]>(
      supabase
        .from(this.tableName)
        .select('*')
        .eq('company_id', companyId)
        .eq('status', status)
    );
  }

  async updateVehicleOdometer(companyId: string, vehicleId: string, newOdometer: number) {
    return this.handleResponse<Vehicle>(
      supabase
        .rpc('update_vehicle_odometer', { 
          p_vehicle_id: vehicleId, 
          p_new_odometer: newOdometer,
          p_company_id: companyId
        })
        .single()
    );
  }

  // Maintenance related methods
  async getMaintenanceHistory(companyId: string, vehicleId: string) {
    return this.handleResponse<MaintenanceRecord[]>(
      supabase
        .from('maintenance_records')
        .select('*')
        .eq('company_id', companyId)
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false })
    );
  }

  async createMaintenanceRecord(
    companyId: string, 
    vehicleId: string, 
    recordData: Omit<MaintenanceRecord, 'id' | 'company_id' | 'vehicle_id' | 'created_at'>
  ) {
    return this.handleResponse<MaintenanceRecord>(
      supabase
        .from('maintenance_records')
        .insert([{ 
          ...recordData, 
          vehicle_id: vehicleId, 
          company_id: companyId 
        }])
        .select()
        .single()
    );
  }

  // Driver assignment
  async assignDriver(companyId: string, vehicleId: string, driverId: string | null) {
    return this.handleResponse<Vehicle>(
      supabase
        .from(this.tableName)
        .update({ assigned_driver_id: driverId })
        .eq('id', vehicleId)
        .eq('company_id', companyId)
        .select()
        .single()
    );
  }

  // Vehicle status updates
  async updateVehicleStatus(companyId: string, vehicleId: string, status: VehicleStatus, notes?: string) {
    return this.handleResponse<Vehicle>(
      supabase
        .from(this.tableName)
        .update({ 
          status,
          status_notes: notes || null,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)
        .eq('company_id', companyId)
        .select()
        .single()
    );
  }

  // Get vehicles due for maintenance
  async getVehiclesDueForMaintenance(companyId: string, daysThreshold: number = 30) {
    return this.handleResponse<Vehicle[]>(
      supabase
        .rpc('get_vehicles_due_for_maintenance', {
          p_company_id: companyId,
          p_days_threshold: daysThreshold
        })
    );
  }
}

export const vehicleService = new VehicleService();
