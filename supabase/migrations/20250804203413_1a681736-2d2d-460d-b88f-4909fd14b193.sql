-- Enable full CRUD operations for companies
CREATE POLICY "Users can update their company data" 
ON public.companies 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.company_id = companies.id
));

-- Enable full CRUD operations for drivers
CREATE POLICY "Users can insert drivers in their company" 
ON public.drivers 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update drivers in their company" 
ON public.drivers 
FOR UPDATE 
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can delete drivers in their company" 
ON public.drivers 
FOR DELETE 
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

-- Enable full CRUD operations for vehicles
CREATE POLICY "Users can insert vehicles in their company" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update vehicles in their company" 
ON public.vehicles 
FOR UPDATE 
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can delete vehicles in their company" 
ON public.vehicles 
FOR DELETE 
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

-- Enable full CRUD operations for vehicle_maintenance
CREATE POLICY "Users can insert maintenance for their company vehicles" 
ON public.vehicle_maintenance 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1
  FROM vehicles v
  JOIN profiles p ON p.company_id = v.company_id
  WHERE v.id = vehicle_maintenance.vehicle_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can update maintenance for their company vehicles" 
ON public.vehicle_maintenance 
FOR UPDATE 
USING (EXISTS (
  SELECT 1
  FROM vehicles v
  JOIN profiles p ON p.company_id = v.company_id
  WHERE v.id = vehicle_maintenance.vehicle_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can delete maintenance for their company vehicles" 
ON public.vehicle_maintenance 
FOR DELETE 
USING (EXISTS (
  SELECT 1
  FROM vehicles v
  JOIN profiles p ON p.company_id = v.company_id
  WHERE v.id = vehicle_maintenance.vehicle_id AND p.user_id = auth.uid()
));

-- Enable full CRUD operations for vehicle_assignments
CREATE POLICY "Users can insert assignments for their company vehicles" 
ON public.vehicle_assignments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1
  FROM vehicles v
  JOIN profiles p ON p.company_id = v.company_id
  WHERE v.id = vehicle_assignments.vehicle_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can update assignments for their company vehicles" 
ON public.vehicle_assignments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1
  FROM vehicles v
  JOIN profiles p ON p.company_id = v.company_id
  WHERE v.id = vehicle_assignments.vehicle_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can delete assignments for their company vehicles" 
ON public.vehicle_assignments 
FOR DELETE 
USING (EXISTS (
  SELECT 1
  FROM vehicles v
  JOIN profiles p ON p.company_id = v.company_id
  WHERE v.id = vehicle_assignments.vehicle_id AND p.user_id = auth.uid()
));