/**
 * Supabase Admin Hooks
 *
 * These hooks provide Supabase-backed data for the admin dashboard.
 * They mirror the AppContext interface to allow gradual migration.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================================================
// Types (matching AppContext types for compatibility)
// ============================================================================

export type PipelineStage =
  | 'Leads'
  | 'Chemistry Call'
  | 'Application'
  | 'Interview'
  | 'Payment'
  | 'Accommodation Selection'
  | 'Online Course Link';

export type RetreatStatus = 'Draft' | 'Open' | 'Full' | 'Closed' | 'Archived';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
export type AppointmentType = 'ChemistryCall' | 'Interview';
export type AppointmentStatus = 'Proposed' | 'Scheduled' | 'Completed' | 'NoShow' | 'Canceled';
export type SchedulingStatus = 'NotScheduled' | 'Proposed' | 'Scheduled' | 'Completed' | 'NoShow';
export type RiskLevel = 'None' | 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Open' | 'Done' | 'Snoozed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface AccommodationOption {
  label: string;
  description: string;
  priceAdjustment?: number;
}

export interface Training {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  max_capacity: number;
  spots_filled: number;
  status: RetreatStatus;
  notes: string;
  capacity_override: boolean;
  auto_mark_full: boolean;
  auto_reopen_when_below_capacity: boolean;
  chemistry_call_link: string;
  application_link: string;
  payment_link: string;
  accommodation_selection_link: string;
  online_course_link: string;
  accommodation_options: AccommodationOption[];
  is_visible: boolean;
  training_level: string;
  show_on_apply: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  full_name: string;
  email: string;
  signal_handle: string;
  phone: string;
  allergies: string;
  special_requests: string;
  user_id: string | null;
  application_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StageHistoryEntry {
  stage: PipelineStage;
  date: string;
  note: string;
}

export interface ActivityEntry {
  id: string;
  date: string;
  action: string;
  notes: string;
  performedBy: string;
}

export interface Registration {
  id: string;
  training_id: string;
  participant_id: string;
  current_stage: PipelineStage;
  stage_history: StageHistoryEntry[];
  last_touched_at: string;
  ops_notes: string;
  tags: string[];
  activities: ActivityEntry[];
  accommodation_choice: string;
  accommodation_price_adjustment: number;
  accommodation_notes: string;
  payment_status: PaymentStatus;
  amount_due: number | null;
  amount_paid: number | null;
  chemistry_call_status: SchedulingStatus;
  interview_status: SchedulingStatus;
  chemistry_call_appointment_id: string | null;
  interview_appointment_id: string | null;
  risk_level: RiskLevel;
  care_flags: string[];
  care_notes: string;
  care_flag_other_text: string;
  flagged_at: string | null;
  flagged_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  training_id: string;
  registration_id: string;
  type: AppointmentType;
  start_date_time: string;
  end_date_time: string;
  timezone: string;
  status: AppointmentStatus;
  location_or_link: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AdminTask {
  id: string;
  training_id: string;
  registration_id: string | null;
  title: string;
  description: string;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Trainings Hook
// ============================================================================

export function useTrainings() {
  const queryClient = useQueryClient();

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ['admin-trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data as Training[];
    },
  });

  const createTraining = useMutation({
    mutationFn: async (training: Omit<Training, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('trainings')
        .insert(training)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
      toast.success('Training created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create training');
    },
  });

  const updateTraining = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Training> & { id: string }) => {
      const { error } = await supabase
        .from('trainings')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update training');
    },
  });

  return { trainings, isLoading, createTraining, updateTraining };
}

// ============================================================================
// Participants Hook
// ============================================================================

export function useParticipants() {
  const queryClient = useQueryClient();

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['admin-participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Participant[];
    },
  });

  const createParticipant = useMutation({
    mutationFn: async (participant: Omit<Participant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('participants')
        .insert(participant)
        .select()
        .single();
      if (error) throw error;
      return data as Participant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-participants'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create participant');
    },
  });

  return { participants, isLoading, createParticipant };
}

// ============================================================================
// Registrations Hook
// ============================================================================

export function useRegistrations(trainingId?: string) {
  const queryClient = useQueryClient();

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['admin-registrations', trainingId],
    queryFn: async () => {
      let query = supabase
        .from('registrations')
        .select('*')
        .order('last_touched_at', { ascending: false });

      if (trainingId) {
        query = query.eq('training_id', trainingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Registration[];
    },
  });

  const createRegistration = useMutation({
    mutationFn: async (registration: {
      training_id: string;
      participant_id: string;
      current_stage?: PipelineStage;
    }) => {
      const now = new Date().toISOString();
      const initialStage = registration.current_stage || 'Leads';
      const { data, error } = await supabase
        .from('registrations')
        .insert({
          ...registration,
          current_stage: initialStage,
          stage_history: [{ stage: initialStage, date: now, note: 'Initial registration' }],
          activities: [{ id: crypto.randomUUID(), date: now, action: `Registered at ${initialStage}`, notes: '', performedBy: 'Admin' }],
        })
        .select()
        .single();
      if (error) throw error;
      return data as Registration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create registration');
    },
  });

  const moveStage = useMutation({
    mutationFn: async ({
      registrationId,
      newStage,
      note = '',
    }: {
      registrationId: string;
      newStage: PipelineStage;
      note?: string;
    }) => {
      // Get current registration
      const { data: current, error: fetchError } = await supabase
        .from('registrations')
        .select('stage_history, activities')
        .eq('id', registrationId)
        .single();
      if (fetchError) throw fetchError;

      const now = new Date().toISOString();
      const newHistory = [...(current.stage_history || []), { stage: newStage, date: now, note }];
      const newActivities = [
        ...(current.activities || []),
        { id: crypto.randomUUID(), date: now, action: `Moved to ${newStage}`, notes: note, performedBy: 'Admin' },
      ];

      const { error } = await supabase
        .from('registrations')
        .update({
          current_stage: newStage,
          stage_history: newHistory,
          activities: newActivities,
          last_touched_at: now,
        })
        .eq('id', registrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move stage');
    },
  });

  const updateRegistration = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Registration> & { id: string }) => {
      const { error } = await supabase
        .from('registrations')
        .update({ ...updates, last_touched_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update registration');
    },
  });

  const bulkMoveStage = useMutation({
    mutationFn: async ({
      registrationIds,
      newStage,
      note = '',
    }: {
      registrationIds: string[];
      newStage: PipelineStage;
      note?: string;
    }) => {
      const now = new Date().toISOString();
      // Update each registration
      for (const id of registrationIds) {
        const { data: current, error: fetchError } = await supabase
          .from('registrations')
          .select('stage_history, activities')
          .eq('id', id)
          .single();
        if (fetchError) continue;

        const newHistory = [...(current.stage_history || []), { stage: newStage, date: now, note }];
        const newActivities = [
          ...(current.activities || []),
          { id: crypto.randomUUID(), date: now, action: `Bulk moved to ${newStage}`, notes: note, performedBy: 'Admin' },
        ];

        await supabase
          .from('registrations')
          .update({
            current_stage: newStage,
            stage_history: newHistory,
            activities: newActivities,
            last_touched_at: now,
          })
          .eq('id', id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast.success('Participants moved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to bulk move');
    },
  });

  const bulkAddTag = useMutation({
    mutationFn: async ({ registrationIds, tag }: { registrationIds: string[]; tag: string }) => {
      for (const id of registrationIds) {
        const { data: current, error: fetchError } = await supabase
          .from('registrations')
          .select('tags')
          .eq('id', id)
          .single();
        if (fetchError) continue;

        const tags = current.tags || [];
        if (!tags.includes(tag)) {
          await supabase
            .from('registrations')
            .update({ tags: [...tags, tag] })
            .eq('id', id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
    },
  });

  const bulkRemoveTag = useMutation({
    mutationFn: async ({ registrationIds, tag }: { registrationIds: string[]; tag: string }) => {
      for (const id of registrationIds) {
        const { data: current, error: fetchError } = await supabase
          .from('registrations')
          .select('tags')
          .eq('id', id)
          .single();
        if (fetchError) continue;

        const tags = (current.tags || []).filter((t: string) => t !== tag);
        await supabase
          .from('registrations')
          .update({ tags })
          .eq('id', id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
    },
  });

  return {
    registrations,
    isLoading,
    createRegistration,
    moveStage,
    updateRegistration,
    bulkMoveStage,
    bulkAddTag,
    bulkRemoveTag,
  };
}

// ============================================================================
// Appointments Hook
// ============================================================================

export function useAppointments(trainingId?: string, registrationId?: string) {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['admin-appointments', trainingId, registrationId],
    queryFn: async () => {
      let query = supabase.from('appointments').select('*');

      if (trainingId) {
        query = query.eq('training_id', trainingId);
      }
      if (registrationId) {
        query = query.eq('registration_id', registrationId);
      }

      const { data, error } = await query.order('start_date_time', { ascending: true });
      if (error) throw error;
      return data as Appointment[];
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      if (error) throw error;

      // Update registration scheduling status
      const statusField = appointment.type === 'ChemistryCall' ? 'chemistry_call_status' : 'interview_status';
      const aptIdField = appointment.type === 'ChemistryCall' ? 'chemistry_call_appointment_id' : 'interview_appointment_id';
      const statusValue = appointment.status === 'Proposed' ? 'Proposed' : 'Scheduled';

      await supabase
        .from('registrations')
        .update({
          [statusField]: statusValue,
          [aptIdField]: data.id,
        })
        .eq('id', appointment.registration_id);

      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast.success('Appointment created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create appointment');
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);
      if (error) throw error;

      // If status changed, update registration
      if (updates.status) {
        const { data: apt } = await supabase
          .from('appointments')
          .select('type, registration_id')
          .eq('id', id)
          .single();

        if (apt) {
          const statusField = apt.type === 'ChemistryCall' ? 'chemistry_call_status' : 'interview_status';
          let regStatus: SchedulingStatus = 'Scheduled';
          if (updates.status === 'Completed') regStatus = 'Completed';
          else if (updates.status === 'NoShow') regStatus = 'NoShow';
          else if (updates.status === 'Canceled') regStatus = 'NotScheduled';
          else if (updates.status === 'Proposed') regStatus = 'Proposed';

          await supabase
            .from('registrations')
            .update({ [statusField]: regStatus })
            .eq('id', apt.registration_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update appointment');
    },
  });

  return { appointments, isLoading, createAppointment, updateAppointment };
}

// ============================================================================
// Admin Tasks Hook
// ============================================================================

export function useAdminTasks(trainingId?: string, registrationId?: string) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['admin-tasks', trainingId, registrationId],
    queryFn: async () => {
      let query = supabase.from('admin_tasks').select('*');

      if (trainingId) {
        query = query.eq('training_id', trainingId);
      }
      if (registrationId) {
        query = query.eq('registration_id', registrationId);
      }

      const { data, error } = await query.order('due_date', { ascending: true });
      if (error) throw error;
      return data as AdminTask[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<AdminTask, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
      const { data, error } = await supabase
        .from('admin_tasks')
        .insert(task)
        .select()
        .single();
      if (error) throw error;
      return data as AdminTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Task created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdminTask> & { id: string }) => {
      const finalUpdates = { ...updates };
      if (updates.status === 'Done') {
        finalUpdates.completed_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('admin_tasks')
        .update(finalUpdates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });

  return { tasks, isLoading, createTask, updateTask };
}

// ============================================================================
// Helper: Check if Supabase admin tables exist
// ============================================================================

export function useSupabaseAdminAvailable() {
  const { data: available = false, isLoading } = useQuery({
    queryKey: ['supabase-admin-available'],
    queryFn: async () => {
      try {
        // Try to query participants table - if it exists, migration is done
        const { error } = await supabase.from('participants').select('id').limit(1);
        return !error;
      } catch {
        return false;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return { available, isLoading };
}
