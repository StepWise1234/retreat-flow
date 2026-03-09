-- ============================================================================
-- USER LESSON PROGRESS
-- Track which lesson a user last viewed and their completion status
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  last_viewed_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Each user can only have one progress record per lesson
  UNIQUE(user_id, lesson_id)
);

-- Index for fast lookups
CREATE INDEX idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_course ON public.user_lesson_progress(user_id, course_id);

-- RLS policies
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
ON public.user_lesson_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
ON public.user_lesson_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
ON public.user_lesson_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to get user's last viewed lesson for a course
CREATE OR REPLACE FUNCTION public.get_last_viewed_lesson(p_user_id UUID, p_course_id UUID)
RETURNS UUID AS $$
  SELECT lesson_id
  FROM public.user_lesson_progress
  WHERE user_id = p_user_id AND course_id = p_course_id
  ORDER BY last_viewed_at DESC
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;
