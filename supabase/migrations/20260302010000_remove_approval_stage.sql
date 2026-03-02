-- ============================================================================
-- REMOVE APPROVAL STAGE FROM PIPELINE
-- The approval step is redundant - after interview, participants go directly to payment.
-- ============================================================================

-- First, update any registrations currently at 'Approval' stage to 'Payment'
UPDATE public.registrations
SET current_stage = 'Payment',
    last_touched_at = NOW()
WHERE current_stage = 'Approval';

-- Note: PostgreSQL doesn't allow removing values from enums directly.
-- The 'Approval' value will remain in the enum but won't be used by the application.
-- A future migration can recreate the enum without 'Approval' if needed.

-- Add a comment to document this
COMMENT ON TYPE public.pipeline_stage IS 'Pipeline stages for participant tracking. Note: Approval stage is deprecated - participants move directly from Interview to Payment.';
