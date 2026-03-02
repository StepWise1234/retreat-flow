import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';
import { useApplication } from './useApplication';

export interface ParticipantQuestion {
  id: string;
  application_id: string;
  user_id: string;
  question: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
}

export function useParticipantQuestions() {
  const { user } = usePortalAuth();
  const { application } = useApplication();

  const { data: questions, isLoading } = useQuery({
    queryKey: ['participant_questions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('participant_questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ParticipantQuestion[];
    },
    enabled: !!user,
  });

  return { questions: questions || [], isLoading };
}

export function useSubmitQuestion() {
  const { user } = usePortalAuth();
  const { application } = useApplication();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: string) => {
      if (!user || !application) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('participant_questions')
        .insert({
          application_id: application.id,
          user_id: user.id,
          question,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant_questions', user?.id] });
    },
  });
}
