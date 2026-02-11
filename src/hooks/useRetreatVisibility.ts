import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DbRetreat {
  id: string;
  retreat_name: string;
  show_on_application: boolean;
  status: string;
}

export function useRetreatVisibility() {
  const queryClient = useQueryClient();

  const { data: dbRetreats = [], isLoading } = useQuery({
    queryKey: ['admin-retreats-visibility'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retreats')
        .select('id, retreat_name, show_on_application, status');
      if (error) throw error;
      return (data ?? []) as DbRetreat[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ dbId, newValue }: { dbId: string; newValue: boolean }) => {
      const { error } = await supabase
        .from('retreats')
        .update({ show_on_application: newValue })
        .eq('id', dbId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-retreats-visibility'] });
      queryClient.invalidateQueries({ queryKey: ['application-retreats'] });
    },
    onError: (err: any) => {
      toast.error('Failed to update visibility: ' + err.message);
    },
  });

  const getVisibility = (retreatName: string) => {
    const match = dbRetreats.find((r) => r.retreat_name === retreatName);
    return match ? { dbId: match.id, showOnApplication: match.show_on_application } : null;
  };

  const toggleVisibility = (retreatName: string) => {
    const match = dbRetreats.find((r) => r.retreat_name === retreatName);
    if (!match) {
      toast.error('Retreat not found in database');
      return;
    }
    toggleMutation.mutate({ dbId: match.id, newValue: !match.show_on_application });
  };

  return { dbRetreats, isLoading, getVisibility, toggleVisibility, isToggling: toggleMutation.isPending };
}
