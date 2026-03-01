-- Create a Waitlist training for applicants who select "Join waitlist"
-- This training should NOT show on the apply page (show_on_apply = false)
-- and has no dates since it's a holding area

INSERT INTO public.trainings (
  id,
  name,
  start_date,
  end_date,
  location,
  max_capacity,
  status,
  training_level,
  show_on_apply,
  meal_selection_enabled,
  spots_filled
) VALUES (
  'aaaaaaaa-0000-0000-0000-waitlist0001',
  'Waitlist',
  NULL,
  NULL,
  'TBD',
  9999,
  'Open',
  'Beginning',
  false,
  false,
  0
) ON CONFLICT (id) DO NOTHING;

-- Also rename May 20-23 to include year
UPDATE public.trainings
SET name = 'May 20–23, 2026'
WHERE name LIKE 'May 20%23%' OR name LIKE 'May 20–23%';
