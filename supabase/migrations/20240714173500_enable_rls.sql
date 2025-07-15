-- Enable Row Level Security on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create policies for companies table
CREATE POLICY "Users can view their own company" 
ON public.companies FOR SELECT 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'company_id' = id::text
));

-- Create policies for vehicles table
CREATE POLICY "Users can view their company's vehicles" 
ON public.vehicles FOR SELECT 
USING (company_id IN (
  SELECT (raw_user_meta_data->>'company_id')::uuid 
  FROM auth.users 
  WHERE id = auth.uid()
));

CREATE POLICY "Users can manage their company's vehicles" 
ON public.vehicles FOR ALL 
USING (company_id IN (
  SELECT (raw_user_meta_data->>'company_id')::uuid 
  FROM auth.users 
  WHERE id = auth.uid()
));

-- Create policies for drivers table
CREATE POLICY "Users can view their company's drivers" 
ON public.drivers FOR SELECT 
USING (company_id IN (
  SELECT (raw_user_meta_data->>'company_id')::uuid 
  FROM auth.users 
  WHERE id = auth.uid()
));

CREATE POLICY "Users can manage their company's drivers" 
ON public.drivers FOR ALL 
USING (company_id IN (
  SELECT (raw_user_meta_data->>'company_id')::uuid 
  FROM auth.users 
  WHERE id = auth.uid()
));

-- Create a function to get the current user's company ID
CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS uuid AS $$
  SELECT (raw_user_meta_data->>'company_id')::uuid 
  FROM auth.users 
  WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
