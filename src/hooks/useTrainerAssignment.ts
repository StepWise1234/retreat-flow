import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';

interface TrainerAssignment {
  id: string;
  user_id: string;
  training_id: string;
  room_id: string | null;
  meal_selections: Record<string, { lunch?: string; dinner?: string }>;
  accommodation_choice: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function useTrainerAssignment(trainingId: string | null) {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  // Fetch trainer assignment for this training
  const { data: assignment, isLoading } = useQuery({
    queryKey: ['trainer-assignment', user?.id, trainingId],
    queryFn: async () => {
      if (!user || !trainingId) return null;
      const { data, error } = await supabase
        .from('trainer_assignments')
        .select('*')
        .eq('user_id', user.id)
        .eq('training_id', trainingId)
        .maybeSingle();
      if (error) throw error;
      return data as TrainerAssignment | null;
    },
    enabled: !!user && !!trainingId,
  });

  // Create or update trainer assignment
  const upsertAssignment = useMutation({
    mutationFn: async (updates: Partial<TrainerAssignment>) => {
      if (!user || !trainingId) throw new Error('Missing user or training');

      const { error } = await supabase
        .from('trainer_assignments')
        .upsert({
          user_id: user.id,
          training_id: trainingId,
          ...updates,
        }, {
          onConflict: 'user_id,training_id',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-assignment', user?.id, trainingId] });
    },
  });

  // Fetch ALL active/open trainings for trainers to self-select (exclude Online/Workshop events)
  const { data: assignedTrainings = [] } = useQuery({
    queryKey: ['trainer-trainings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const today = new Date().toISOString().split('T')[0];
      // Get all open/future trainings (not just assigned ones), excluding events (Online/Workshop)
      const { data, error } = await supabase
        .from('trainings')
        .select('id, name, start_date, end_date, location, training_level, training_type, status')
        .eq('status', 'Open')
        .gte('end_date', today)
        .or('training_type.is.null,and(training_type.neq.Online,training_type.neq.Workshop)')
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  return {
    assignment,
    isLoading,
    upsertAssignment,
    assignedTrainings,
  };
}
