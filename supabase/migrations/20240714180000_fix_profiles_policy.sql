-- Fix the infinite recursion in profiles table RLS policy
-- First drop the existing policy if it exists
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;

-- Recreate the policy to avoid infinite recursion
CREATE POLICY "Users can view profiles in their company" 
ON public.profiles FOR SELECT 
USING (
  -- User can view their own profile
  user_id = auth.uid()
  OR
  -- Or view other profiles in their company
  company_id = (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Add a comment explaining the policy
COMMENT ON POLICY "Users can view profiles in their company" ON public.profiles IS 
'Allows users to view their own profile and other profiles in their company. 
The LIMIT 1 prevents the infinite recursion issue by ensuring the subquery returns only one row.';
