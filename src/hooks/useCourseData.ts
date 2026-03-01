import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';

// ============================================================================
// Types
// ============================================================================

export interface Course {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  sort_order: number;
  is_default: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  vimeo_id: string | null;
  duration_minutes: number | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseResource {
  id: string;
  module_id: string;
  title: string;
  file_path: string;
  resource_type: string;
  sort_order: number;
  created_at: string;
}

export interface CourseDiscussion {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
  replies?: CourseDiscussion[];
}

export interface UserCourseAccess {
  id: string;
  user_id: string;
  course_id: string;
  granted_at: string;
  granted_by: string | null;
}

export interface CourseWithContent extends Course {
  modules: (CourseModule & {
    lessons: CourseLesson[];
    resources: CourseResource[];
  })[];
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Get all published courses the user has access to
 */
export function useCourses() {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['courses', user?.id],
    queryFn: async () => {
      // Get all published courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (coursesError) throw coursesError;
      if (!courses) return [];

      // If no user, only return default courses
      if (!user) {
        return courses.filter((c: Course) => c.is_default) as Course[];
      }

      // Get user's explicit access
      const { data: access } = await supabase
        .from('user_course_access')
        .select('course_id')
        .eq('user_id', user.id);

      const accessibleCourseIds = new Set(access?.map((a: { course_id: string }) => a.course_id) || []);

      // Return courses user has access to (default or explicit)
      return courses.filter(
        (c: Course) => c.is_default || accessibleCourseIds.has(c.id)
      ) as Course[];
    },
    enabled: true,
  });
}

/**
 * Get a single course with all its modules, lessons, and resources
 */
export function useCourseWithContent(courseId: string | null) {
  return useQuery({
    queryKey: ['course-content', courseId],
    queryFn: async () => {
      if (!courseId) return null;

      // Get the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      if (!course) return null;

      // Get modules
      const { data: modules, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (modulesError) throw modulesError;

      // Get lessons for all modules
      const moduleIds = modules?.map((m: CourseModule) => m.id) || [];

      let lessons: CourseLesson[] = [];
      let resources: CourseResource[] = [];

      if (moduleIds.length > 0) {
        const { data: lessonsData } = await supabase
          .from('course_lessons')
          .select('*')
          .in('module_id', moduleIds)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });

        lessons = lessonsData || [];

        const { data: resourcesData } = await supabase
          .from('course_resources')
          .select('*')
          .in('module_id', moduleIds)
          .order('sort_order', { ascending: true });

        resources = resourcesData || [];
      }

      // Assemble the nested structure
      const modulesWithContent = modules?.map((module: CourseModule) => ({
        ...module,
        lessons: lessons.filter((l: CourseLesson) => l.module_id === module.id),
        resources: resources.filter((r: CourseResource) => r.module_id === module.id),
      })) || [];

      return {
        ...course,
        modules: modulesWithContent,
      } as CourseWithContent;
    },
    enabled: !!courseId,
  });
}

/**
 * Get user's course access records
 */
export function useUserCourseAccess() {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['user-course-access', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_course_access')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserCourseAccess[];
    },
    enabled: !!user,
  });
}

/**
 * Get discussions for a lesson with user info and threaded replies
 */
export function useLessonDiscussions(lessonId: string | null) {
  return useQuery({
    queryKey: ['lesson-discussions', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];

      // Get all discussions for this lesson
      const { data, error } = await supabase
        .from('course_discussions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(data.map((d: CourseDiscussion) => d.user_id))];

      // Fetch user emails from auth (we'll use profiles if available)
      // For now, we'll just use user_id as identifier
      // In production, you'd join with a profiles table

      // Organize into threads (parent discussions with replies)
      const parentDiscussions = data.filter((d: CourseDiscussion) => !d.parent_id);
      const replies = data.filter((d: CourseDiscussion) => d.parent_id);

      const threaded = parentDiscussions.map((parent: CourseDiscussion) => ({
        ...parent,
        replies: replies.filter((r: CourseDiscussion) => r.parent_id === parent.id),
      }));

      return threaded as CourseDiscussion[];
    },
    enabled: !!lessonId,
  });
}

/**
 * Create a new discussion post
 */
export function useCreateDiscussion() {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      content,
      parentId,
    }: {
      lessonId: string;
      content: string;
      parentId?: string | null;
    }) => {
      if (!user) throw new Error('Must be logged in to post');

      const { data, error } = await supabase
        .from('course_discussions')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-discussions', variables.lessonId] });
    },
  });
}

/**
 * Delete a discussion post (only your own)
 */
export function useDeleteDiscussion() {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ discussionId, lessonId }: { discussionId: string; lessonId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('course_discussions')
        .delete()
        .eq('id', discussionId)
        .eq('user_id', user.id); // RLS also enforces this

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-discussions', variables.lessonId] });
    },
  });
}

/**
 * Update a discussion post (only your own)
 */
export function useUpdateDiscussion() {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      discussionId,
      lessonId,
      content,
    }: {
      discussionId: string;
      lessonId: string;
      content: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('course_discussions')
        .update({ content })
        .eq('id', discussionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-discussions', variables.lessonId] });
    },
  });
}

/**
 * Course color helper - generates gradient from course color
 */
export function getCourseGradient(color: string | null): string {
  if (!color) return 'linear-gradient(135deg, #FFA500, #FF4500)';

  // Parse the color and create a complementary gradient
  const baseColor = color;

  // Simple color shift for gradient end
  const colorMap: Record<string, string> = {
    '#FFA500': '#FF4500', // orange -> red-orange
    '#FF6B35': '#FF4500', // light orange -> red-orange
    '#14B8A6': '#0D9488', // teal -> darker teal
    '#8B5CF6': '#7C3AED', // purple -> violet
    '#7C3AED': '#6D28D9', // violet -> deeper violet
  };

  const endColor = colorMap[baseColor] || '#FF4500';
  return `linear-gradient(135deg, ${baseColor}, ${endColor})`;
}

/**
 * Get course meta info (label, color, gradient) by slug
 */
export function getCourseMetaBySlug(slug: string) {
  const metaMap: Record<string, { label: string; color: string; gradient: string }> = {
    beginning: { label: 'Beginning', color: '#FFA500', gradient: 'linear-gradient(135deg, #FFA500, #FF4500)' },
    'intermediate-touch': { label: 'Touch', color: '#FF6B35', gradient: 'linear-gradient(135deg, #FF6B35, #FF4500)' },
    'intermediate-nsr': { label: 'NSR', color: '#14B8A6', gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)' },
    'intermediate-ri': { label: 'RI', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
    advanced: { label: 'Advanced', color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)' },
  };

  return metaMap[slug] || metaMap.beginning;
}
