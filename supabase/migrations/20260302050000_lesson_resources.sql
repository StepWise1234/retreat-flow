-- ============================================================================
-- ADD LESSON-LEVEL RESOURCES
-- Allow resources to be attached to specific lessons (optional)
-- ============================================================================

-- Add lesson_id column (nullable - resources can be module-level or lesson-level)
ALTER TABLE public.course_resources
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE;

-- Index for lesson-level lookups
CREATE INDEX IF NOT EXISTS idx_course_resources_lesson_id ON public.course_resources(lesson_id);
