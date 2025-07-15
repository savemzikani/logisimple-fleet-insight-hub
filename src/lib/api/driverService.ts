import { BaseService } from './baseService';
import { Driver, DriverPerformanceMetrics } from '@/types';

export class DriverService extends BaseService<Driver> {
  constructor() {
    super('drivers');
  }

  async getDriversByStatus(companyId: string, status: string) {
    return this.handleResponse<Driver[]>(
      supabase
        .from(this.tableName)
        .select('*')
        .eq('company_id', companyId)
        .eq('status', status)
    );
  }

  async updateDriverPerformance(
    driverId: string, 
    updates: Partial<DriverPerformanceMetrics>
  ) {
    return this.handleResponse<Driver>(
      supabase.rpc('update_driver_performance', {
        p_driver_id: driverId,
        p_updates: updates
      })
    );
  }

  async getDriversWithExpiringLicenses(companyId: string, daysThreshold: number = 30) {
    return this.handleResponse<Driver[]>(
      supabase
        .rpc('get_drivers_with_expiring_licenses', {
          p_company_id: companyId,
          p_days_threshold: daysThreshold
        })
    );
  }
}

export const driverService = new DriverService();
