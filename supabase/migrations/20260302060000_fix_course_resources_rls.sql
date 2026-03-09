-- Fix course_resources RLS policies for admin access
-- The existing policy may not cover INSERT properly

-- Drop existing admin policy if it exists
DROP POLICY IF EXISTS "Admins can manage resources" ON public.course_resources;

-- Create separate policies for each operation
CREATE POLICY "Admins can select course resources"
ON public.course_resources
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert course resources"
ON public.course_resources
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update course resources"
ON public.course_resources
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete course resources"
ON public.course_resources
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Also add the lesson_id column if not exists
ALTER TABLE public.course_resources
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_course_resources_lesson_id ON public.course_resources(lesson_id);
