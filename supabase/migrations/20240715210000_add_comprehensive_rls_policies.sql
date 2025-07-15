-- ===============================================
-- Comprehensive RLS Policies for LogiSimple
-- ===============================================

-- ===============================================
-- 1. COMPANIES TABLE POLICIES
-- ===============================================

-- Company admins can manage their company
CREATE POLICY "Company admins can manage their company" 
ON public.companies
FOR ALL
USING (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ===============================================
-- 2. VEHICLES TABLE POLICIES
-- ===============================================

-- Users can view vehicles in their company
CREATE POLICY "Users can view vehicles in their company" 
ON public.vehicles
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Company admins can insert/update/delete vehicles
CREATE POLICY "Company admins can manage vehicles" 
ON public.vehicles
FOR ALL
USING (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ===============================================
-- 3. DRIVERS TABLE POLICIES
-- ===============================================

-- Users can view drivers in their company
CREATE POLICY "Users can view drivers in their company" 
ON public.drivers
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Company admins can manage drivers
CREATE POLICY "Company admins can manage drivers" 
ON public.drivers
FOR ALL
USING (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ===============================================
-- 4. VEHICLE_TRACKING TABLE POLICIES
-- ===============================================

-- Users can view tracking for vehicles in their company
CREATE POLICY "Users can view tracking for company vehicles" 
ON public.vehicle_tracking
FOR SELECT
USING (
  vehicle_id IN (
    SELECT id 
    FROM public.vehicles 
    WHERE company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- System can insert tracking data (using service role key)
CREATE POLICY "Service role can insert tracking data"
ON public.vehicle_tracking
FOR INSERT
TO service_role
WITH CHECK (true);

-- ===============================================
-- 5. TRIPS TABLE POLICIES
-- ===============================================

-- Users can view trips for their company
CREATE POLICY "Users can view company trips" 
ON public.trips
FOR SELECT
USING (
  vehicle_id IN (
    SELECT id 
    FROM public.vehicles 
    WHERE company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Company admins can manage trips
CREATE POLICY "Company admins can manage trips" 
ON public.trips
FOR ALL
USING (
  vehicle_id IN (
    SELECT id 
    FROM public.vehicles 
    WHERE company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
)
WITH CHECK (
  vehicle_id IN (
    SELECT id 
    FROM public.vehicles 
    WHERE company_id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- ===============================================
-- 6. CUSTOMERS TABLE POLICIES
-- ===============================================

-- Users can view customers in their company
CREATE POLICY "Users can view company customers" 
ON public.customers
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Company admins can manage customers
CREATE POLICY "Company admins can manage customers" 
ON public.customers
FOR ALL
USING (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ===============================================
-- 7. ADDITIONAL SECURITY MEASURES
-- ===============================================

-- Prevent direct updates to timestamps
CREATE OR REPLACE FUNCTION public.prevent_timestamp_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    NEW.created_at = OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with created_at
CREATE TRIGGER prevent_vehicles_timestamp_update
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_timestamp_update();

CREATE TRIGGER prevent_drivers_timestamp_update
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.prevent_timestamp_update();

CREATE TRIGGER prevent_customers_timestamp_update
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.prevent_timestamp_update();

-- ===============================================
-- 8. ADD COMMENTS FOR BETTER DOCUMENTATION
-- ===============================================

COMMENT ON TABLE public.vehicles IS 'Stores vehicle information and status';
COMMENT ON TABLE public.drivers IS 'Stores driver information and credentials';
COMMENT ON TABLE public.vehicle_tracking IS 'Tracks real-time vehicle locations and status';
COMMENT ON TABLE public.trips IS 'Records trip information and routes';
COMMENT ON TABLE public.customers IS 'Stores customer information and preferences';

-- Add column comments for important fields
COMMENT ON COLUMN public.vehicles.status IS 'Current status of the vehicle (active, maintenance, out_of_service)';
COMMENT ON COLUMN public.drivers.status IS 'Current status of the driver (active, on_leave, inactive, suspended)';
COMMENT ON COLUMN public.trips.status IS 'Current status of the trip (planned, in_progress, completed, cancelled)';

-- ===============================================
-- 9. CREATE HELPER FUNCTIONS
-- ===============================================

-- Function to get current user's company ID
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id 
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user is company admin
CREATE OR REPLACE FUNCTION public.is_company_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
