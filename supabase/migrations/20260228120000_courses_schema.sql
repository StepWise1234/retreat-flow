-- Create handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  color text,
  sort_order integer DEFAULT 0,
  is_default boolean DEFAULT false,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  vimeo_id text,
  duration_minutes integer,
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.course_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  resource_type text DEFAULT 'pdf',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, course_id)
);

CREATE TABLE public.course_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES public.course_discussions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX idx_course_resources_module_id ON public.course_resources(module_id);
CREATE INDEX idx_user_course_access_user_id ON public.user_course_access(user_id);
CREATE INDEX idx_user_course_access_course_id ON public.user_course_access(course_id);
CREATE INDEX idx_course_discussions_lesson_id ON public.course_discussions(lesson_id);
CREATE INDEX idx_course_discussions_user_id ON public.course_discussions(user_id);
CREATE INDEX idx_course_discussions_parent_id ON public.course_discussions(parent_id);

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER course_modules_updated_at BEFORE UPDATE ON public.course_modules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER course_lessons_updated_at BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER course_discussions_updated_at BEFORE UPDATE ON public.course_discussions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Anyone can read published modules" ON public.course_modules FOR SELECT USING (is_published = true AND EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.is_published = true));
CREATE POLICY "Admins can manage modules" ON public.course_modules FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Anyone can read published lessons" ON public.course_lessons FOR SELECT USING (is_published = true AND EXISTS (SELECT 1 FROM public.course_modules cm JOIN public.courses c ON c.id = cm.course_id WHERE cm.id = course_lessons.module_id AND cm.is_published = true AND c.is_published = true));
CREATE POLICY "Admins can manage lessons" ON public.course_lessons FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Authenticated users can read resources" ON public.course_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage resources" ON public.course_resources FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Users can read own access" ON public.user_course_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage access" ON public.user_course_access FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Authenticated users can read discussions" ON public.course_discussions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create discussions" ON public.course_discussions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own discussions" ON public.course_discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own discussions" ON public.course_discussions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage discussions" ON public.course_discussions FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

INSERT INTO public.courses (slug, name, description, color, sort_order, is_default, is_published) VALUES
  ('beginning', 'Beginning', 'Foundation course for all practitioners', '#FFA500', 1, true, true),
  ('intermediate-touch', 'Intermediate Touch', 'Advanced touch techniques and practices', '#FF6B35', 2, false, true),
  ('intermediate-nsr', 'Intermediate NSR', 'Non-stress response intermediate training', '#14B8A6', 3, false, true),
  ('intermediate-ri', 'Intermediate RI', 'Rounding intensive intermediate course', '#8B5CF6', 4, false, true),
  ('advanced', 'Advanced', 'Advanced practitioner certification', '#7C3AED', 5, false, true);

CREATE OR REPLACE FUNCTION public.user_has_course_access(p_user_id uuid, p_course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM user_course_access WHERE user_id = p_user_id AND course_id = p_course_id)
  OR EXISTS (SELECT 1 FROM courses WHERE id = p_course_id AND is_default = true)
$$;
