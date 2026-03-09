-- Create enrollments table for tracking all training and event registrations
-- This is separate from the applicants pipeline - used for confirmed participants
-- and returning students who don't need to go through the full pipeline

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the person (either from applicants table or participants table)
  applicant_id UUID REFERENCES applicants(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- The training or event they're enrolled in
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,

  -- Enrollment details
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'paid', 'attended', 'cancelled', 'no_show')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'deposit', 'paid', 'refunded')),
  payment_amount_cents INTEGER,
  payment_date TIMESTAMPTZ,

  -- Metadata
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,

  -- Ensure a person can only enroll once per training
  CONSTRAINT unique_enrollment UNIQUE (training_id, COALESCE(applicant_id, participant_id, user_id)),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_enrollments_training ON enrollments(training_id);
CREATE INDEX idx_enrollments_applicant ON enrollments(applicant_id) WHERE applicant_id IS NOT NULL;
CREATE INDEX idx_enrollments_participant ON enrollments(participant_id) WHERE participant_id IS NOT NULL;
CREATE INDEX idx_enrollments_user ON enrollments(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own enrollments
CREATE POLICY "Users can create own enrollments" ON enrollments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own enrollments (e.g., cancel)
CREATE POLICY "Users can update own enrollments" ON enrollments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Service role can do everything (for admin)
CREATE POLICY "Service role full access" ON enrollments
  FOR ALL TO service_role
  USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollments_updated_at();

-- Grant permissions
GRANT ALL ON enrollments TO authenticated;
GRANT ALL ON enrollments TO service_role;
