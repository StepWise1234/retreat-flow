-- Add application_role to differentiate user types
-- Roles: 'participant' (default), 'trainer', 'facilitator', 'admin'
--
-- Trainers:
-- 1. Can access portal (rooms, meals)
-- 2. Don't count against training capacity (spots_filled)
-- 3. No automated stage progression
-- 4. Do receive batch emails with everyone else
-- 5. Future: separate trainer portal at app.stepwise.education

-- Create enum for application roles
CREATE TYPE public.application_role AS ENUM ('participant', 'trainer', 'facilitator', 'admin');

-- Add role column to applications
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS role public.application_role NOT NULL DEFAULT 'participant';

-- Index for filtering by role
CREATE INDEX IF NOT EXISTS idx_applications_role ON public.applications(role);

-- Mark initial trainers
UPDATE public.applications
SET role = 'trainer'
WHERE LOWER(TRIM(first_name || ' ' || last_name)) IN (
  'laela leonard',
  'rick perales',
  'john bodine'
);
