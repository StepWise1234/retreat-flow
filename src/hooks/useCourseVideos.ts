import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCourseVideos(trainingLevel: string) {
  return useQuery({
    queryKey: ['course-videos', trainingLevel],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_videos')
        .select('*')
        .eq('training_level', trainingLevel)
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!trainingLevel,
  });
}
