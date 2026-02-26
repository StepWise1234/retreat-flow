import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';

export function useApplication() {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateApplication = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (!user || !application) throw new Error('No application found');
      const { error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', application.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', user?.id] });
    },
  });

  return { application, isLoading, updateApplication };
}
