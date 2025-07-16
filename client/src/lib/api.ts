import type { UserProfile } from '@/lib/types';

// Helper function for API requests
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session management
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth service
export const authService = {
  async signIn(email: string, password: string) {
    try {
      const result = await apiRequest('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Sign in failed' } };
    }
  },

  async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    try {
      const result = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, userData }),
      });

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Sign up failed' } };
    }
  },

  async signOut() {
    try {
      await apiRequest('/api/auth/signout', {
        method: 'POST',
      });

      return { error: null };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Sign out failed' } };
    }
  },

  async resetPassword(email: string) {
    try {
      // For now, we'll return a success message
      // In production, you'd implement actual password reset logic
      return { error: null };
    } catch (error) {
      return { error: { message: 'Password reset failed' } };
    }
  },

  async updatePassword(newPassword: string) {
    try {
      // For now, we'll return a success message
      // In production, you'd implement actual password update logic
      return { error: null };
    } catch (error) {
      return { error: { message: 'Password update failed' } };
    }
  }
};

// Driver service
export const driverService = {
  async getAll(filters: Record<string, any> = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/drivers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const data = await apiRequest(url);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to fetch drivers' } };
    }
  },

  async create(data: any) {
    try {
      const result = await apiRequest('/api/drivers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      console.error('Error creating driver:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to create driver' } };
    }
  },

  async update(id: string, data: any) {
    try {
      const result = await apiRequest(`/api/drivers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      console.error('Error updating driver:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to update driver' } };
    }
  },

  async delete(id: string) {
    try {
      await apiRequest(`/api/drivers/${id}`, {
        method: 'DELETE',
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting driver:', error);
      return { error: { message: error instanceof Error ? error.message : 'Failed to delete driver' } };
    }
  },

  async getDriversByStatus(companyId: string, status: string) {
    try {
      const data = await apiRequest(`/api/drivers/status/${status}`);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching drivers by status:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to fetch drivers by status' } };
    }
  },

  async getDriversWithExpiringLicenses(companyId: string, daysThreshold: number) {
    try {
      // For now, return empty array
      // In production, you'd implement this endpoint
      return { data: [], error: null };
    } catch (error) {
      console.error('Error fetching drivers with expiring licenses:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to fetch drivers with expiring licenses' } };
    }
  }
};

// Vehicle service
export const vehicleService = {
  async getAll(filters: Record<string, any> = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const url = `/api/vehicles${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const data = await apiRequest(url);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to fetch vehicles' } };
    }
  },

  async create(data: any) {
    try {
      const result = await apiRequest('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to create vehicle' } };
    }
  },

  async update(id: string, data: any) {
    try {
      const result = await apiRequest(`/api/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to update vehicle' } };
    }
  },

  async delete(id: string) {
    try {
      await apiRequest(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return { error: { message: error instanceof Error ? error.message : 'Failed to delete vehicle' } };
    }
  },

  async getVehicleStatusCounts(companyId: string) {
    try {
      const counts = await apiRequest('/api/vehicles/status-counts');
      return counts;
    } catch (error) {
      console.error('Error fetching vehicle status counts:', error);
      return null;
    }
  }
};

// Company service
export const companyService = {
  async getById(id: string) {
    try {
      const data = await apiRequest(`/api/companies/${id}`);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching company:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to fetch company' } };
    }
  },

  async update(id: string, data: any) {
    try {
      const result = await apiRequest(`/api/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      console.error('Error updating company:', error);
      return { data: null, error: { message: error instanceof Error ? error.message : 'Failed to update company' } };
    }
  }
};