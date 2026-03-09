-- Allow authenticated users to insert rooms
-- This enables auto-creation of rooms when trainings are selected

-- First check what policies exist
DROP POLICY IF EXISTS "rooms_insert_authenticated" ON public.rooms;
DROP POLICY IF EXISTS "rooms_select_authenticated" ON public.rooms;

-- Allow everyone to read rooms
CREATE POLICY "rooms_select_authenticated"
ON public.rooms FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert rooms (for auto-population)
CREATE POLICY "rooms_insert_authenticated"
ON public.rooms FOR INSERT
TO authenticated
WITH CHECK (true);
