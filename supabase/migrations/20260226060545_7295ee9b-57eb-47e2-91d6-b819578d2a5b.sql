
-- Applications table: stores submitted form data linked to auth user
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  retreat_id UUID REFERENCES public.retreats(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  training_level TEXT NOT NULL DEFAULT 'beginning',
  
  -- About You
  preferred_name TEXT DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  birth_month TEXT DEFAULT '',
  birth_day TEXT DEFAULT '',
  birth_year TEXT DEFAULT '',
  
  -- Contact
  phone TEXT DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  signal_handle TEXT DEFAULT '',
  
  -- Address
  street_address TEXT DEFAULT '',
  street_address_2 TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state_province TEXT DEFAULT '',
  postal_code TEXT DEFAULT '',
  country TEXT DEFAULT '',
  
  -- Emergency Contact
  emergency_first_name TEXT DEFAULT '',
  emergency_last_name TEXT DEFAULT '',
  emergency_phone TEXT DEFAULT '',
  
  -- Experience
  journey_work_experience TEXT DEFAULT '',
  medicine_experience TEXT DEFAULT '',
  serving_experience TEXT DEFAULT '',
  life_circumstances TEXT DEFAULT '',
  integration_support TEXT DEFAULT '',
  
  -- Physical Health
  physical_health_issues TEXT DEFAULT '',
  physical_medications TEXT DEFAULT '',
  supplements TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  physical_symptoms JSONB DEFAULT '[]'::jsonb,
  physical_symptoms_other TEXT DEFAULT '',
  dietary_preferences JSONB DEFAULT '[]'::jsonb,
  dietary_other TEXT DEFAULT '',
  
  -- Mental Health
  dsm_diagnosis TEXT DEFAULT '',
  mental_health_issues TEXT DEFAULT '',
  psych_medications TEXT DEFAULT '',
  recreational_drug_use TEXT DEFAULT '',
  suicide_consideration TEXT DEFAULT '',
  mental_health_professional TEXT DEFAULT '',
  
  -- Stress & Self-Care
  stress_level INTEGER DEFAULT 5,
  life_experiences JSONB DEFAULT '[]'::jsonb,
  stress_sources TEXT DEFAULT '',
  cognitive_symptoms JSONB DEFAULT '[]'::jsonb,
  cognitive_symptoms_other TEXT DEFAULT '',
  coping_mechanisms JSONB DEFAULT '[]'::jsonb,
  coping_other TEXT DEFAULT '',
  trauma_details TEXT DEFAULT '',
  self_care TEXT DEFAULT '',
  self_care_other TEXT DEFAULT '',
  support_network JSONB DEFAULT '[]'::jsonb,
  support_other TEXT DEFAULT '',
  strengths_hobbies TEXT DEFAULT '',
  training_goals TEXT DEFAULT '',
  anything_else TEXT DEFAULT '',
  
  -- Accommodation & Dietary (portal step)
  vrbo_listing_url TEXT DEFAULT '',
  bedroom_choice TEXT DEFAULT '',
  dietary_notes TEXT DEFAULT '',
  special_accommodations TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own application
CREATE POLICY "Users can read own application"
  ON public.applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own application"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage applications"
  ON public.applications FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Course videos table for admin-managed content
CREATE TABLE public.course_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_level TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  vimeo_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view published videos
CREATE POLICY "Authenticated users can view published videos"
  ON public.course_videos FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Admins can manage videos
CREATE POLICY "Admins can manage course_videos"
  ON public.course_videos FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_course_videos_updated_at
  BEFORE UPDATE ON public.course_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
