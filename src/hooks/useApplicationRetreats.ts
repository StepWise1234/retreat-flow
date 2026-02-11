import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApplicationRetreat {
  id: string;
  retreat_name: string;
  start_date: string;
  end_date: string;
  location: string;
}

export function useApplicationRetreats() {
  return useQuery({
    queryKey: ['application-retreats'],
    queryFn: async () => {
      // RLS filters to show_on_application=true AND status='Open'
      const { data, error } = await supabase
        .from('retreats')
        .select('id, retreat_name, start_date, end_date, location')
        .order('start_date', { ascending: true });

      if (error) throw error;
      return (data ?? []) as ApplicationRetreat[];
    },
  });
}
