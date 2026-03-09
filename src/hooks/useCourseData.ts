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
  // Client-side enriched
  thumbnail_url?: string;
}

export interface CourseResource {
  id: string;
  module_id: string;
  lesson_id: string | null;
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

export interface UserLessonProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  last_viewed_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface CourseWithContent extends Course {
  modules: (CourseModule & {
    lessons: CourseLesson[];
    resources: CourseResource[];
  })[];
}

// ============================================================================
// Vimeo Thumbnail Helper
// ============================================================================

// Cache for Vimeo thumbnails to avoid repeated API calls
const vimeoThumbnailCache = new Map<string, string>();

/**
 * Fetch thumbnail URL for a Vimeo video using oEmbed API
 */
export async function getVimeoThumbnail(vimeoId: string): Promise<string | null> {
  if (vimeoThumbnailCache.has(vimeoId)) {
    return vimeoThumbnailCache.get(vimeoId) || null;
  }

  try {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=640`
    );
    if (!response.ok) return null;

    const data = await response.json();
    const thumbnailUrl = data.thumbnail_url || null;

    if (thumbnailUrl) {
      vimeoThumbnailCache.set(vimeoId, thumbnailUrl);
    }
    return thumbnailUrl;
  } catch {
    return null;
  }
}

/**
 * Hook to fetch Vimeo thumbnail for a single video
 */
export function useVimeoThumbnail(vimeoId: string | null) {
  return useQuery({
    queryKey: ['vimeo-thumbnail', vimeoId],
    queryFn: () => vimeoId ? getVimeoThumbnail(vimeoId) : null,
    enabled: !!vimeoId,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
  });
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

        // Fetch resources via the protected API endpoint (bypasses RLS with service role)
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;

          if (token) {
            const response = await fetch('https://stepwise.education/resources-api/resources-by-modules', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ module_ids: moduleIds }),
            });

            if (response.ok) {
              resources = await response.json();
            }
          }
        } catch (err) {
          console.error('Error fetching resources:', err);
          // Fallback to direct Supabase query (may return empty if RLS blocks)
          const { data: resourcesData } = await supabase
            .from('course_resources')
            .select('*')
            .in('module_id', moduleIds)
            .order('sort_order', { ascending: true });
          resources = resourcesData || [];
        }
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
 * Get user's lesson progress for a course (completed lessons + last viewed)
 */
export function useLessonProgress(courseId: string | null) {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['lesson-progress', user?.id, courseId],
    queryFn: async () => {
      if (!user || !courseId) return { completedLessons: new Set<string>(), lastViewedLessonId: null };

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .order('last_viewed_at', { ascending: false });

      if (error) {
        console.error('Error fetching lesson progress:', error);
        return { completedLessons: new Set<string>(), lastViewedLessonId: null };
      }

      const completedLessons = new Set(
        data?.filter((p: UserLessonProgress) => p.completed).map((p: UserLessonProgress) => p.lesson_id) || []
      );

      // The first item is the most recently viewed
      const lastViewedLessonId = data?.[0]?.lesson_id || null;

      return { completedLessons, lastViewedLessonId };
    },
    enabled: !!user && !!courseId,
  });
}

/**
 * Track lesson view - updates last_viewed_at timestamp
 */
export function useTrackLessonView() {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, lessonId }: { courseId: string; lessonId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            last_viewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,lesson_id',
          }
        );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', user?.id, variables.courseId] });
    },
  });
}

/**
 * Mark a lesson as completed
 */
export function useMarkLessonComplete() {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, lessonId }: { courseId: string; lessonId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
            last_viewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,lesson_id',
          }
        );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', user?.id, variables.courseId] });
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
    '#9D067A': '#7B0560', // purple -> violet
    '#7B0560': '#5C0448', // violet -> deeper violet
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
    'intermediate-ri': { label: 'RI', color: '#9D067A', gradient: 'linear-gradient(135deg, #9D067A, #7B0560)' },
    advanced: { label: 'Advanced', color: '#7B0560', gradient: 'linear-gradient(135deg, #7B0560, #5C0448)' },
  };

  return metaMap[slug] || metaMap.beginning;
}
