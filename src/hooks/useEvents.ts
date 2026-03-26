import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';

export interface Event {
  id: string;
  name: string;
  training_level: string | null;
  training_type: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  max_capacity: number | null;
  spots_filled: number | null;
  status: string | null;
  notes: string | null;
  description: string | null;
  is_visible: boolean;
  price_cents: number | null;
  max_guests: number | null;
}

export interface EventGuest {
  id: string;
  enrollment_id: string;
  name: string;
  email: string;
  created_at: string;
}

// Level hierarchy for filtering (index determines rank)
const LEVEL_HIERARCHY = ['Beginning', 'Intermediate', 'Advanced'] as const;
type CourseLevel = typeof LEVEL_HIERARCHY[number];

function getLevelIndex(level: string | null): number {
  if (!level) return -1;
  return LEVEL_HIERARCHY.indexOf(level as CourseLevel);
}

export interface EventRegistration {
  id: string;
  training_id: string;
  participant_id: string;
  current_stage: string;
  payment_status: string | null;
  created_at: string;
  selected_tier?: string | null;
  training?: Event;
  guests?: EventGuest[];
}

// Get the user's highest enrolled course level
export function useUserCourseLevel() {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['user-course-level', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's course access
      const { data: courseAccess, error: accessError } = await supabase
        .from('user_course_access')
        .select('course_id, courses(slug)')
        .eq('user_id', user.id);

      if (accessError || !courseAccess || courseAccess.length === 0) {
        return null;
      }

      // Determine highest level from course slugs
      let highestLevel: CourseLevel | null = null;
      let highestIndex = -1;

      for (const access of courseAccess) {
        const course = access.courses as { slug: string } | null;
        if (!course) continue;

        const slug = course.slug.toLowerCase();
        let level: CourseLevel | null = null;

        if (slug.includes('beginning') || slug === 'beginning') {
          level = 'Beginning';
        } else if (slug.includes('intermediate') || slug === 'intermediate') {
          level = 'Intermediate';
        } else if (slug.includes('advanced') || slug === 'advanced') {
          level = 'Advanced';
        }

        if (level) {
          const levelIndex = getLevelIndex(level);
          if (levelIndex > highestIndex) {
            highestIndex = levelIndex;
            highestLevel = level;
          }
        }
      }

      return highestLevel;
    },
    enabled: !!user?.id,
  });
}

// Get all visible upcoming events filtered by user's level
export function useEvents() {
  const { user } = usePortalAuth();
  const { data: userLevel } = useUserCourseLevel();

  return useQuery({
    queryKey: ['portal-events', userLevel],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('is_visible', true)
        .or(`start_date.gte.${today},start_date.is.null`)
        .order('start_date', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const userLevelIndex = getLevelIndex(userLevel || null);

      // Filter events based on user's level
      // - Workshops/Online: always visible to everyone
      // - Trainings: only show levels HIGHER than user's current level
      const events = (data as Event[])
        .filter(event => {
          const isFull = (event.spots_filled || 0) >= (event.max_capacity || 999);
          const isWorkshop = event.training_type === 'Workshop';
          const isOnline = event.training_type === 'Online';

          // Workshops and Online events always visible (unless full)
          if (isWorkshop || isOnline) return true;

          // Hide full trainings
          if (isFull) return false;

          // Filter by level - only show higher levels than user's current
          const eventLevelIndex = getLevelIndex(event.training_level);

          // If user has no level yet, show all trainings
          if (userLevelIndex < 0) return true;

          // Only show events with higher level than user's current level
          return eventLevelIndex > userLevelIndex;
        })
        .sort((a, b) => {
          // Sort order: Workshops first, then Online, then Trainings
          const aIsWorkshop = a.training_type === 'Workshop';
          const bIsWorkshop = b.training_type === 'Workshop';
          const aIsOnline = a.training_type === 'Online';
          const bIsOnline = b.training_type === 'Online';

          // Workshops first
          if (aIsWorkshop && !bIsWorkshop) return -1;
          if (!aIsWorkshop && bIsWorkshop) return 1;

          // Online second (after workshops)
          if (aIsOnline && !bIsOnline && !bIsWorkshop) return -1;
          if (!aIsOnline && !aIsWorkshop && bIsOnline) return 1;
          // Then by date
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });

      return events;
    },
    enabled: !!user?.id,
  });
}

// Get user's event enrollments
export function useMyEventRegistrations() {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['my-event-enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get enrollments with training info and guests
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          training_id,
          user_id,
          status,
          payment_status,
          registered_at,
          selected_tier,
          training:trainings(*),
          guests:event_guests(*)
        `)
        .eq('user_id', user.id)
        .neq('status', 'cancelled');

      if (error) throw error;

      // Map to expected format
      return (data || []).map(e => ({
        id: e.id,
        training_id: e.training_id,
        participant_id: e.user_id,
        current_stage: e.status,
        payment_status: e.payment_status,
        created_at: e.registered_at,
        selected_tier: e.selected_tier,
        training: e.training,
        guests: e.guests || []
      })) as EventRegistration[];
    },
    enabled: !!user?.id,
  });
}

// Guest input for registration
export interface GuestInput {
  name: string;
  email: string;
}

// Payment options: pay for all guests yourself, or guests pay separately
export type PaymentOption = 'self_only' | 'all_including_self';

// Send payment email to a guest
export async function sendGuestPaymentEmail(
  enrollmentId: string,
  guestEmail: string,
  guestName: string,
  eventId: string,
  registrantName: string
) {
  const response = await supabase.functions.invoke('send-guest-payment-email', {
    body: { enrollmentId, guestEmail, guestName, eventId, registrantName },
  });

  if (response.error) {
    console.error('Failed to send guest payment email:', response.error);
    throw new Error(response.error.message || 'Failed to send email');
  }

  return response.data;
}

// Register for an event with optional guests
export function useRegisterForEvent() {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, guests, paymentOption, selectedTier }: { eventId: string; guests?: GuestInput[]; paymentOption?: PaymentOption; selectedTier?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if already enrolled
      const { data: existingList } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('training_id', eventId)
        .neq('status', 'cancelled');

      if (existingList && existingList.length > 0) {
        throw new Error('Already registered for this event');
      }

      // Check if event is full (for waitlist)
      const { data: eventData } = await supabase
        .from('trainings')
        .select('max_capacity, spots_filled')
        .eq('id', eventId)
        .single();

      const isFull = eventData && (eventData.spots_filled || 0) >= (eventData.max_capacity || 999);
      const status = isFull ? 'waitlist' : 'registered';

      // Create enrollment with payment option stored in notes for now
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          training_id: eventId,
          user_id: user.id,
          status,
          payment_status: 'unpaid',
          notes: paymentOption && guests && guests.length > 0 ? `payment_option:${paymentOption}` : null,
          selected_tier: selectedTier || null
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create enrollment:', error);
        throw new Error(`Registration failed: ${error.message}`);
      }

      // Add guests if provided
      if (guests && guests.length > 0) {
        const guestRecords = guests
          .filter(g => g.name.trim() && g.email.trim())
          .map(g => ({
            enrollment_id: data.id,
            name: g.name.trim(),
            email: g.email.trim().toLowerCase()
          }));

        if (guestRecords.length > 0) {
          const { error: guestError } = await supabase
            .from('event_guests')
            .insert(guestRecords);

          if (guestError) {
            console.error('Failed to add guests:', guestError);
            // Don't fail registration, just log
          }
        }
      }

      // Update spots_filled on training (only for confirmed registrations, not waitlist)
      if (status === 'registered') {
        const totalSpots = 1 + (guests?.filter(g => g.name.trim() && g.email.trim()).length || 0);
        for (let i = 0; i < totalSpots; i++) {
          await supabase.rpc('increment_spots_filled', { p_training_id: eventId });
        }
      }

      return { ...data, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-event-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['portal-events'] });
      queryClient.invalidateQueries({ queryKey: ['case-consult-tier-counts'] });
    },
  });
}

// Cancel event enrollment
export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, eventId }: { registrationId: string; eventId: string }) => {
      // First, count how many guests this enrollment has
      const { data: guestData } = await supabase
        .from('event_guests')
        .select('id')
        .eq('enrollment_id', registrationId);

      const guestCount = guestData?.length || 0;

      // Update enrollment status to cancelled instead of deleting
      const { error } = await supabase
        .from('enrollments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', registrationId);

      if (error) throw error;

      // Decrement spots_filled for registrant + all guests
      const totalSpots = 1 + guestCount;
      for (let i = 0; i < totalSpots; i++) {
        await supabase.rpc('decrement_spots_filled', { p_training_id: eventId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-event-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['portal-events'] });
      queryClient.invalidateQueries({ queryKey: ['case-consult-tier-counts'] });
    },
  });
}

// Get enrollment counts per tier for Case Consult
export function useCaseConsultTierCounts(eventId: string | undefined) {
  return useQuery({
    queryKey: ['case-consult-tier-counts', eventId],
    queryFn: async () => {
      if (!eventId) return { monday: 0, tuesday: 0 };

      const { data, error } = await supabase
        .from('enrollments')
        .select('selected_tier')
        .eq('training_id', eventId)
        .neq('status', 'cancelled');

      if (error) throw error;

      const counts = { monday: 0, tuesday: 0 };
      (data || []).forEach(e => {
        if (e.selected_tier === 'monday') counts.monday++;
        if (e.selected_tier === 'tuesday') counts.tuesday++;
      });

      return counts;
    },
    enabled: !!eventId,
  });
}
