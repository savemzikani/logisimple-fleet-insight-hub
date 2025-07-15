import { z } from 'zod';

export const driverFormSchema = z.object({
  employee_id: z.string().min(1, { message: 'Employee ID is required' }),
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  address: z.string().min(1, { message: 'Address is required' }),
  license_number: z.string().min(1, { message: 'License number is required' }),
  license_class: z.enum(['CDL-A', 'CDL-B', 'CDL-C', 'Regular']),
  license_expiry: z.string().min(1, { message: 'License expiry date is required' }),
  hire_date: z.string().min(1, { message: 'Hire date is required' }),
  status: z.enum(['active', 'on-leave', 'inactive', 'suspended']),
});

export type DriverFormValues = z.infer<typeof driverFormSchema>;

export const vehicleFormSchema = z.object({
  vin: z.string().min(17, { message: 'VIN must be 17 characters' }),
  make: z.string().min(1, { message: 'Make is required' }),
  model: z.string().min(1, { message: 'Model is required' }),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  license_plate: z.string().min(1, { message: 'License plate is required' }),
  status: z.enum(['available', 'in-use', 'maintenance', 'out-of-service']),
  vehicle_type: z.string().min(1, { message: 'Vehicle type is required' }),
  fuel_type: z.string().min(1, { message: 'Fuel type is required' }),
  fuel_efficiency: z.number().min(0, { message: 'Fuel efficiency must be a positive number' }),
  mileage: z.number().min(0, { message: 'Mileage must be a positive number' }),
  last_service_date: z.string().min(1, { message: 'Last service date is required' }),
  next_service_mileage: z.number().min(0, { message: 'Next service mileage must be a positive number' }),
  insurance_expiry: z.string().min(1, { message: 'Insurance expiry date is required' }),
  registration_expiry: z.string().min(1, { message: 'Registration expiry date is required' }),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
