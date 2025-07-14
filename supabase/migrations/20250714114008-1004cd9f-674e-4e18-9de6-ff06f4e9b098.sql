-- Create companies table for multi-tenancy
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address JSONB,
  contact_info JSONB,
  subscription_tier TEXT DEFAULT 'basic',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  make TEXT,
  model TEXT,
  year INTEGER,
  vin TEXT UNIQUE,
  license_plate TEXT,
  vehicle_type TEXT,
  specifications JSONB DEFAULT '{}',
  purchase_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  employee_id TEXT,
  personal_info JSONB DEFAULT '{}',
  license_info JSONB DEFAULT '{}',
  certifications JSONB DEFAULT '{}',
  emergency_contacts JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle tracking table
CREATE TABLE public.vehicle_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed DECIMAL(5, 2),
  heading DECIMAL(5, 2),
  altitude DECIMAL(7, 2),
  accuracy DECIMAL(5, 2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers ON DELETE SET NULL,
  origin JSONB,
  destination JSONB,
  planned_route JSONB,
  actual_route JSONB,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  distance DECIMAL(8, 2),
  duration INTERVAL,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  business_name TEXT,
  contact_info JSONB DEFAULT '{}',
  billing_info JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance records table
CREATE TABLE public.maintenance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles ON DELETE CASCADE,
  maintenance_type TEXT,
  description TEXT,
  cost DECIMAL(10, 2),
  service_provider TEXT,
  scheduled_date DATE,
  completed_date DATE,
  next_service_date DATE,
  parts_used JSONB DEFAULT '{}',
  labor_hours DECIMAL(5, 2),
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fuel records table
CREATE TABLE public.fuel_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers ON DELETE SET NULL,
  fuel_type TEXT,
  quantity DECIMAL(8, 2),
  cost_per_unit DECIMAL(6, 3),
  total_cost DECIMAL(10, 2),
  odometer_reading INTEGER,
  location JSONB,
  receipt_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can view their own company" 
ON public.companies FOR SELECT 
USING (id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own company" 
ON public.companies FOR UPDATE 
USING (id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for profiles
CREATE POLICY "Users can view profiles in their company" 
ON public.profiles FOR SELECT 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for vehicles
CREATE POLICY "Users can view vehicles in their company" 
ON public.vehicles FOR SELECT 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage vehicles in their company" 
ON public.vehicles FOR ALL 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for drivers
CREATE POLICY "Users can view drivers in their company" 
ON public.drivers FOR SELECT 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage drivers in their company" 
ON public.drivers FOR ALL 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for vehicle tracking
CREATE POLICY "Users can view tracking for their company vehicles" 
ON public.vehicle_tracking FOR SELECT 
USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert tracking for their company vehicles" 
ON public.vehicle_tracking FOR INSERT 
WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));

-- Create RLS policies for trips
CREATE POLICY "Users can view trips for their company" 
ON public.trips FOR SELECT 
USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage trips for their company" 
ON public.trips FOR ALL 
USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));

-- Create RLS policies for customers
CREATE POLICY "Users can view customers in their company" 
ON public.customers FOR SELECT 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage customers in their company" 
ON public.customers FOR ALL 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for maintenance records
CREATE POLICY "Users can view maintenance for their company vehicles" 
ON public.maintenance_records FOR SELECT 
USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage maintenance for their company vehicles" 
ON public.maintenance_records FOR ALL 
USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));

-- Create RLS policies for fuel records
CREATE POLICY "Users can view fuel records for their company vehicles" 
ON public.fuel_records FOR SELECT 
USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage fuel records for their company vehicles" 
ON public.fuel_records FOR ALL 
USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_vehicles_company_id ON public.vehicles(company_id);
CREATE INDEX idx_drivers_company_id ON public.drivers(company_id);
CREATE INDEX idx_vehicle_tracking_vehicle_id ON public.vehicle_tracking(vehicle_id);
CREATE INDEX idx_vehicle_tracking_timestamp ON public.vehicle_tracking(timestamp DESC);
CREATE INDEX idx_trips_vehicle_id ON public.trips(vehicle_id);
CREATE INDEX idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX idx_customers_company_id ON public.customers(company_id);
CREATE INDEX idx_maintenance_records_vehicle_id ON public.maintenance_records(vehicle_id);
CREATE INDEX idx_fuel_records_vehicle_id ON public.fuel_records(vehicle_id);