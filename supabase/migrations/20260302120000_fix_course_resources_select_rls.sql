-- Fix course_resources SELECT policy for ALL authenticated users
-- Students need to be able to read resources

-- Drop existing select policy
DROP POLICY IF EXISTS "Admins can select course resources" ON public.course_resources;

-- Create policy that allows ALL authenticated users to SELECT
CREATE POLICY "Authenticated users can read resources"
ON public.course_resources
FOR SELECT
TO authenticated
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;
