-- ============================================================================
-- ADMIN SYSTEM MIGRATION TO SUPABASE
-- This migration adds tables needed for the admin dashboard while preserving
-- all existing portal functionality (trainings, rooms, applications, etc.)
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Pipeline stages for tracking participant progress
CREATE TYPE public.pipeline_stage AS ENUM (
  'Leads',
  'Chemistry Call',
  'Application',
  'Interview',
  'Approval',
  'Payment',
  'Accommodation Selection',
  'Online Course Link'
);

-- Payment status
CREATE TYPE public.payment_status AS ENUM ('Unpaid', 'Partial', 'Paid', 'Refunded');

-- Appointment types
CREATE TYPE public.appointment_type AS ENUM ('ChemistryCall', 'Interview');

-- Appointment status
CREATE TYPE public.appointment_status AS ENUM ('Proposed', 'Scheduled', 'Completed', 'NoShow', 'Canceled');

-- Scheduling status (on registration)
CREATE TYPE public.scheduling_status AS ENUM ('NotScheduled', 'Proposed', 'Scheduled', 'Completed', 'NoShow');

-- Risk level
CREATE TYPE public.risk_level AS ENUM ('None', 'Low', 'Medium', 'High');

-- Task status
CREATE TYPE public.task_status AS ENUM ('Open', 'Done', 'Snoozed');

-- Task priority
CREATE TYPE public.task_priority AS ENUM ('Low', 'Medium', 'High');

-- ============================================================================
-- PARTICIPANTS TABLE
-- Extracted participant info (previously embedded in applications or seed data)
-- ============================================================================

CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  signal_handle TEXT DEFAULT '',
  phone TEXT DEFAULT '',

  -- Health/care info
  allergies TEXT DEFAULT '',
  special_requests TEXT DEFAULT '',

  -- Link to auth user (if they have portal access)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Link to application (for portal users)
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Admins can manage all participants
CREATE POLICY "Admins can manage participants"
  ON public.participants FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Participants can read their own record
CREATE POLICY "Users can read own participant record"
  ON public.participants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_participants_email ON public.participants(email);
CREATE INDEX idx_participants_user_id ON public.participants(user_id);
CREATE INDEX idx_participants_application_id ON public.participants(application_id);

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ENHANCE TRAININGS TABLE
-- Add fields needed by admin system (maps to Retreat type)
-- ============================================================================

-- Add missing columns to trainings (if not exists)
DO $$
BEGIN
  -- Status field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'status') THEN
    ALTER TABLE public.trainings ADD COLUMN status TEXT NOT NULL DEFAULT 'Draft';
  END IF;

  -- Notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'notes') THEN
    ALTER TABLE public.trainings ADD COLUMN notes TEXT DEFAULT '';
  END IF;

  -- Capacity override
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'capacity_override') THEN
    ALTER TABLE public.trainings ADD COLUMN capacity_override BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Auto mark full
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'auto_mark_full') THEN
    ALTER TABLE public.trainings ADD COLUMN auto_mark_full BOOLEAN NOT NULL DEFAULT true;
  END IF;

  -- Auto reopen when below capacity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'auto_reopen_when_below_capacity') THEN
    ALTER TABLE public.trainings ADD COLUMN auto_reopen_when_below_capacity BOOLEAN NOT NULL DEFAULT true;
  END IF;

  -- Links
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'chemistry_call_link') THEN
    ALTER TABLE public.trainings ADD COLUMN chemistry_call_link TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'application_link') THEN
    ALTER TABLE public.trainings ADD COLUMN application_link TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'payment_link') THEN
    ALTER TABLE public.trainings ADD COLUMN payment_link TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'accommodation_selection_link') THEN
    ALTER TABLE public.trainings ADD COLUMN accommodation_selection_link TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'online_course_link') THEN
    ALTER TABLE public.trainings ADD COLUMN online_course_link TEXT DEFAULT '';
  END IF;

  -- Accommodation options (JSONB array)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'accommodation_options') THEN
    ALTER TABLE public.trainings ADD COLUMN accommodation_options JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Visibility
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainings' AND column_name = 'is_visible') THEN
    ALTER TABLE public.trainings ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- REGISTRATIONS TABLE
-- Links participants to trainings with pipeline tracking
-- ============================================================================

CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core links
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,

  -- Pipeline
  current_stage public.pipeline_stage NOT NULL DEFAULT 'Leads',
  stage_history JSONB DEFAULT '[]'::jsonb, -- Array of {stage, date, note}

  -- Tracking
  last_touched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ops_notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  activities JSONB DEFAULT '[]'::jsonb, -- Array of {id, date, action, notes, performedBy}

  -- Accommodation
  accommodation_choice TEXT DEFAULT '',
  accommodation_price_adjustment INTEGER DEFAULT 0, -- cents
  accommodation_notes TEXT DEFAULT '',

  -- Payment
  payment_status public.payment_status NOT NULL DEFAULT 'Unpaid',
  amount_due INTEGER, -- cents
  amount_paid INTEGER, -- cents

  -- Scheduling
  chemistry_call_status public.scheduling_status NOT NULL DEFAULT 'NotScheduled',
  interview_status public.scheduling_status NOT NULL DEFAULT 'NotScheduled',
  chemistry_call_appointment_id UUID,
  interview_appointment_id UUID,

  -- Risk & Care
  risk_level public.risk_level NOT NULL DEFAULT 'None',
  care_flags TEXT[] DEFAULT '{}',
  care_notes TEXT DEFAULT '',
  care_flag_other_text TEXT DEFAULT '',
  flagged_at TIMESTAMPTZ,
  flagged_by TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one registration per participant per training
  UNIQUE(training_id, participant_id)
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Admins can manage all registrations
CREATE POLICY "Admins can manage registrations"
  ON public.registrations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Participants can read their own registrations
CREATE POLICY "Users can read own registrations"
  ON public.registrations FOR SELECT
  TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM public.participants WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_registrations_training ON public.registrations(training_id);
CREATE INDEX idx_registrations_participant ON public.registrations(participant_id);
CREATE INDEX idx_registrations_stage ON public.registrations(current_stage);
CREATE INDEX idx_registrations_payment ON public.registrations(payment_status);

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- APPOINTMENTS TABLE
-- Chemistry calls and interviews
-- ============================================================================

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,

  type public.appointment_type NOT NULL,
  start_date_time TIMESTAMPTZ NOT NULL,
  end_date_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',

  status public.appointment_status NOT NULL DEFAULT 'Proposed',
  location_or_link TEXT DEFAULT '',
  notes TEXT DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Admins can manage all appointments
CREATE POLICY "Admins can manage appointments"
  ON public.appointments FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_appointments_training ON public.appointments(training_id);
CREATE INDEX idx_appointments_registration ON public.appointments(registration_id);
CREATE INDEX idx_appointments_type ON public.appointments(type);
CREATE INDEX idx_appointments_start ON public.appointments(start_date_time);

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ADMIN TASKS TABLE
-- Tasks for admins per registration or training
-- ============================================================================

CREATE TABLE public.admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE, -- optional

  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date DATE,

  status public.task_status NOT NULL DEFAULT 'Open',
  priority public.task_priority NOT NULL DEFAULT 'Medium',

  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

-- Admins can manage all tasks
CREATE POLICY "Admins can manage tasks"
  ON public.admin_tasks FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_admin_tasks_training ON public.admin_tasks(training_id);
CREATE INDEX idx_admin_tasks_registration ON public.admin_tasks(registration_id);
CREATE INDEX idx_admin_tasks_status ON public.admin_tasks(status);
CREATE INDEX idx_admin_tasks_due ON public.admin_tasks(due_date);

CREATE TRIGGER update_admin_tasks_updated_at
  BEFORE UPDATE ON public.admin_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- UPDATE FOREIGN KEY ON REGISTRATIONS FOR APPOINTMENTS
-- ============================================================================

ALTER TABLE public.registrations
  ADD CONSTRAINT fk_chemistry_call_appointment
  FOREIGN KEY (chemistry_call_appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;

ALTER TABLE public.registrations
  ADD CONSTRAINT fk_interview_appointment
  FOREIGN KEY (interview_appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;

-- ============================================================================
-- HELPER FUNCTION: Get enrolled count for a training
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_enrolled_count(p_training_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.registrations
  WHERE training_id = p_training_id
    AND current_stage IN ('Payment', 'Accommodation Selection', 'Online Course Link')
$$;

-- ============================================================================
-- HELPER FUNCTION: Check if stage is enrolled
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_enrolled_stage(p_stage public.pipeline_stage)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_stage IN ('Payment', 'Accommodation Selection', 'Online Course Link')
$$;

-- ============================================================================
-- TRIGGER: Auto-update training status based on capacity
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_training_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_training RECORD;
  v_enrolled INTEGER;
  v_capacity INTEGER;
BEGIN
  -- Get training details
  SELECT * INTO v_training FROM public.trainings WHERE id = COALESCE(NEW.training_id, OLD.training_id);

  IF NOT FOUND THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate enrolled count
  v_enrolled := public.get_enrolled_count(v_training.id);
  v_capacity := CASE WHEN v_training.capacity_override THEN 9 ELSE COALESCE(v_training.max_capacity, 6) END;

  -- Auto-mark full
  IF v_enrolled >= v_capacity AND v_training.status = 'Open' AND v_training.auto_mark_full THEN
    UPDATE public.trainings SET status = 'Full' WHERE id = v_training.id;
  END IF;

  -- Auto-reopen
  IF v_enrolled < v_capacity AND v_training.status = 'Full' AND v_training.auto_reopen_when_below_capacity THEN
    UPDATE public.trainings SET status = 'Open', capacity_override = false WHERE id = v_training.id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER check_capacity_on_registration_change
  AFTER INSERT OR UPDATE OF current_stage OR DELETE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.check_training_capacity();
