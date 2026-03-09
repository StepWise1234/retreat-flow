import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApplicationRetreat {
  id: string;
  retreat_name: string;
  start_date: string;
  end_date: string;
  location: string;
  is_full: boolean;
}

// Special ID for "Request Information" fallback option
export const REQUEST_INFO_ID = '__request_info__';
// Waitlist training ID - this is a real training in the database
export const WAITLIST_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

export function useApplicationRetreats() {
  return useQuery({
    queryKey: ['application-retreats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      // Get trainings with capacity info (exclude workshops/events - those are portal-only)
      const { data: trainings, error: trainingsError } = await supabase
        .from('trainings')
        .select('id, name, start_date, end_date, location, max_capacity, spots_filled, training_type')
        .eq('show_on_apply', true)
        .gte('start_date', today) // Only future trainings
        .order('start_date', { ascending: true });

      if (!trainingsError && trainings && trainings.length > 0) {
        // Filter out Workshop and Online types (keep null and Standard)
        const filtered = trainings.filter(t =>
          t.training_type !== 'Workshop' && t.training_type !== 'Online'
        );

        const mapped = filtered.map(t => {
          const maxCapacity = t.max_capacity || 6;
          const spotsFilled = t.spots_filled || 0;
          const isFull = spotsFilled >= maxCapacity;

          return {
            id: t.id,
            retreat_name: isFull ? `${t.name} (Waitlisted)` : t.name,
            start_date: t.start_date,
            end_date: t.end_date,
            // Override location to British Columbia for public Apply page
            location: 'British Columbia, Canada',
            is_full: isFull,
          };
        }) as ApplicationRetreat[];

        // Add waitlist option at the end
        mapped.push({
          id: WAITLIST_ID,
          retreat_name: 'Join waitlist for next training',
          start_date: '',
          end_date: '',
          location: '',
          is_full: false,
        });

        return mapped;
      }

      // Fall back to retreats table
      const { data: retreats, error: retreatsError } = await supabase
        .from('retreats')
        .select('id, retreat_name, start_date, end_date, location')
        .gte('start_date', today)
        .order('start_date', { ascending: true });

      if (!retreatsError && retreats && retreats.length > 0) {
        const mapped = retreats.map(r => ({
          ...r,
          // Override location to British Columbia for public Apply page
          location: 'British Columbia, Canada',
          is_full: false,
        })) as ApplicationRetreat[];

        mapped.push({
          id: WAITLIST_ID,
          retreat_name: 'Join waitlist for next training',
          start_date: '',
          end_date: '',
          location: '',
          is_full: false,
        });

        return mapped;
      }

      // No trainings available - return waitlist option only
      return [{
        id: WAITLIST_ID,
        retreat_name: 'Join waitlist for next training',
        start_date: '',
        end_date: '',
        location: '',
        is_full: false,
      }] as ApplicationRetreat[];
    },
  });
}
