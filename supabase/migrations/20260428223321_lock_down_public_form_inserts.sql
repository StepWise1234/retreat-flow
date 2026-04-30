-- lock_down_public_form_inserts
-- Move remaining public PII form writes behind Edge Functions.
-- Public browser inserts are no longer needed for facilitator inquiries or
-- simple public feedback submissions.

BEGIN;

ALTER TABLE public.public_feedback
  ADD COLUMN IF NOT EXISTS training_attended text;

ALTER TABLE public.public_feedback
  ALTER COLUMN training_id DROP NOT NULL;

DROP POLICY IF EXISTS "Allow public insert" ON public.facilitator_inquiries;
DROP POLICY IF EXISTS "Allow public insert" ON public.public_feedback;

COMMIT;
