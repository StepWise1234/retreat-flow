-- ============================================================================
-- FIX ROOM_RESERVATIONS RLS POLICIES
-- Allow admin users to assign rooms for any user
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view room reservations for their training" ON public.room_reservations;
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.room_reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_select" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_insert" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_delete" ON public.room_reservations;

-- Create new policies

-- Anyone authenticated can view all room reservations (needed to show which rooms are taken)
CREATE POLICY "room_reservations_select"
ON public.room_reservations FOR SELECT
TO authenticated
USING (true);

-- Users can create reservations for themselves OR admins can create for anyone
CREATE POLICY "room_reservations_insert"
ON public.room_reservations FOR INSERT
TO authenticated
WITH CHECK (
  -- User creating their own reservation
  user_id = auth.uid()
  OR
  -- Admin creating reservation for someone else
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.user_id = auth.uid()
    AND applications.role = 'admin'
  )
);

-- Users can update their own reservations OR admins can update any
CREATE POLICY "room_reservations_update"
ON public.room_reservations FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.user_id = auth.uid()
    AND applications.role = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.user_id = auth.uid()
    AND applications.role = 'admin'
  )
);

-- Users can delete their own reservations OR admins can delete any
CREATE POLICY "room_reservations_delete"
ON public.room_reservations FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.user_id = auth.uid()
    AND applications.role = 'admin'
  )
);
