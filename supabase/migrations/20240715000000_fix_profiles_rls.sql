-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- New policy: Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- New policy: Users can view other profiles in their company (if they have a company)
CREATE POLICY "Users can view company profiles" 
ON public.profiles 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    AND company_id IS NOT NULL
  )
);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid());

-- Add a comment explaining the policies
COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 'Allows users to view their own profile, even if they don''t have a company yet.';
COMMENT ON POLICY "Users can view company profiles" ON public.profiles IS 'Allows users to view profiles of users in the same company.';
COMMENT ON POLICY "Users can insert their own profile" ON public.profiles IS 'Allows users to create their own profile.';
COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 'Allows users to update their own profile.';
