-- Harden participant portal accommodation tables after moving sensitive writes
-- behind server-side functions.
--
-- This migration keeps participant-owned portal reads/writes working while
-- blocking two dangerous browser-side capabilities:
--   1. participants self-escalating applications.role/status/admin fields;
--   2. authenticated users creating arbitrary rooms or relying on application.role
--      as room-reservation admin authority.

BEGIN;

-- ---------------------------------------------------------------------------
-- Applications: participant-owned rows may be edited by the participant, but
-- administrative/control fields must not be self-edited from the browser.
-- Server-side Edge Functions using service role are unaffected by this trigger.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_participant_application_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' AND NEW.user_id = auth.uid() AND NOT public.is_admin() THEN
      NEW.role := 'participant';
      NEW.status := COALESCE(NEW.status, 'pending');
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.admin_notes := NULL;
    ELSIF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() AND NOT public.is_admin() THEN
      IF NEW.role IS DISTINCT FROM OLD.role
        OR NEW.status IS DISTINCT FROM OLD.status
        OR NEW.user_id IS DISTINCT FROM OLD.user_id
        OR NEW.email IS DISTINCT FROM OLD.email
        OR NEW.training_id IS DISTINCT FROM OLD.training_id
        OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
        OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
        OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
      THEN
        RAISE EXCEPTION 'Application field is admin-controlled';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_participant_application_fields_trigger ON public.applications;
CREATE TRIGGER guard_participant_application_fields_trigger
  BEFORE INSERT OR UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_participant_application_fields();

-- ---------------------------------------------------------------------------
-- Rooms: no participant/browser creation of shared room inventory. Rooms must be
-- created by admin/service tooling, not by arbitrary authenticated users.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "rooms_insert_authenticated" ON public.rooms;
DROP POLICY IF EXISTS "rooms_select_authenticated" ON public.rooms;
DROP POLICY IF EXISTS "rooms_select_all" ON public.rooms;
DROP POLICY IF EXISTS "rooms_admin_all" ON public.rooms;

CREATE POLICY "rooms_select_all"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "rooms_admin_all"
  ON public.rooms FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Keep room inventory stable per training.
CREATE UNIQUE INDEX IF NOT EXISTS rooms_training_sort_order_key
  ON public.rooms (training_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS rooms_training_name_key
  ON public.rooms (training_id, name);

-- ---------------------------------------------------------------------------
-- Room reservations: remove application.role based admin bypasses. Normal
-- participants may manage only their own reservation for their own application
-- and matching room/training. Admin authority comes from public.is_admin().
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "reservations_insert_own" ON public.room_reservations;
DROP POLICY IF EXISTS "reservations_update_own" ON public.room_reservations;
DROP POLICY IF EXISTS "reservations_delete_own" ON public.room_reservations;
DROP POLICY IF EXISTS "reservations_select_all" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_select" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_insert" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_update" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_delete" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_select_for_training" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_insert_own_for_application" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_delete_own_for_application" ON public.room_reservations;
DROP POLICY IF EXISTS "room_reservations_admin_all" ON public.room_reservations;

CREATE POLICY "room_reservations_select_for_training"
  ON public.room_reservations FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.applications a
      WHERE a.user_id = auth.uid()
        AND a.training_id = room_reservations.training_id
    )
  );

CREATE POLICY "room_reservations_insert_own_for_application"
  ON public.room_reservations FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.rooms r ON r.id = room_reservations.room_id
      WHERE a.id = room_reservations.application_id
        AND a.user_id = auth.uid()
        AND a.training_id = room_reservations.training_id
        AND r.training_id = room_reservations.training_id
    )
  );

CREATE POLICY "room_reservations_delete_own_for_application"
  ON public.room_reservations FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      WHERE a.id = room_reservations.application_id
        AND a.user_id = auth.uid()
        AND a.training_id = room_reservations.training_id
    )
  );

CREATE POLICY "room_reservations_admin_all"
  ON public.room_reservations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Ensure a participant cannot reserve two rooms for the same training.
CREATE UNIQUE INDEX IF NOT EXISTS room_reservations_user_training_key
  ON public.room_reservations (user_id, training_id)
  WHERE user_id IS NOT NULL;

COMMIT;
