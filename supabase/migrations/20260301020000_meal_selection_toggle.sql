-- Add meal_selection_enabled column to trainings table
-- This controls whether the "Choose Your Meals" section appears in the portal

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainings' AND column_name = 'meal_selection_enabled'
  ) THEN
    ALTER TABLE public.trainings
    ADD COLUMN meal_selection_enabled BOOLEAN NOT NULL DEFAULT false;

    COMMENT ON COLUMN public.trainings.meal_selection_enabled IS
      'When true, shows meal selection UI in the portal for this training';
  END IF;
END $$;

-- Enable meal selection for the April training by default
UPDATE public.trainings
SET meal_selection_enabled = true
WHERE id = '1952aca4-ef44-4294-bd63-a467cd800497';
