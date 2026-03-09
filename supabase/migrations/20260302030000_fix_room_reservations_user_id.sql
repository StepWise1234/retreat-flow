-- ============================================================================
-- FIX ROOM_RESERVATIONS USER_ID CONSTRAINT
-- Allow user_id to be NULL so admins can assign rooms before users have accounts
-- ============================================================================

-- Make user_id nullable (in case it has NOT NULL constraint)
ALTER TABLE public.room_reservations
ALTER COLUMN user_id DROP NOT NULL;

-- Drop foreign key constraint on user_id if it exists
-- (This allows assigning rooms without a valid auth.users entry)
ALTER TABLE public.room_reservations
DROP CONSTRAINT IF EXISTS room_reservations_user_id_fkey;
