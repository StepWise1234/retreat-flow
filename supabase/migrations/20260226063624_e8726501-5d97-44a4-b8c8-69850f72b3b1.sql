
-- We'll use the existing bedroom_choice column on applications to track reservations.
-- To query which rooms are taken for a given retreat, we need a view or just query applications.
-- No new table needed — we just need to query applications where bedroom_choice is set and retreat_id matches.

-- However, we need a way for participants to see other reservations. 
-- Let's create a secure function that returns taken room IDs for a retreat, without exposing who booked them.

CREATE OR REPLACE FUNCTION public.get_reserved_rooms(p_retreat_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(array_agg(bedroom_choice), '{}')
  FROM applications
  WHERE retreat_id = p_retreat_id
    AND bedroom_choice IS NOT NULL
    AND bedroom_choice != ''
$$;
