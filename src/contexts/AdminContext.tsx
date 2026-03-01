/**
 * AdminContext - Hybrid admin data provider
 *
 * This context provides admin data from either:
 * 1. Supabase (if migration is complete)
 * 2. AppContext (fallback to in-memory seed data)
 *
 * Components use this context for admin operations.
 * The underlying data source is transparent to consumers.
 */

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useApp } from './AppContext';
import {
  useTrainings,
  useParticipants,
  useRegistrations,
  useAppointments,
  useAdminTasks,
  useSupabaseAdminAvailable,
  Training,
  Participant,
  Registration,
  Appointment,
  AdminTask,
  PipelineStage,
  PaymentStatus,
  RiskLevel,
} from '@/hooks/useSupabaseAdmin';
import {
  Retreat,
  Participant as AppParticipant,
  Registration as AppRegistration,
  Appointment as AppAppointment,
  Task as AppTask,
  PipelineStage as AppPipelineStage,
  PaymentStatus as AppPaymentStatus,
  RiskLevel as AppRiskLevel,
  CareFlag,
} from '@/lib/types';

// ============================================================================
// Unified Types (compatible with both sources)
// ============================================================================

export interface UnifiedRetreat {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  cohortSizeTarget: number;
  status: string;
  notes: string;
  capacityOverride: boolean;
  autoMarkFull: boolean;
  autoReopenWhenBelowCapacity: boolean;
  chemistryCallLink: string;
  applicationLink: string;
  paymentLink: string;
  accommodationSelectionLink: string;
  onlineCourseLink: string;
  accommodationOptions: { label: string; description: string; priceAdjustment?: number }[];
  isVisible: boolean;
}

export interface UnifiedParticipant {
  id: string;
  fullName: string;
  email: string;
  signalHandle: string;
  allergies: string;
  specialRequests: string;
  createdAt: string;
}

export interface UnifiedRegistration {
  id: string;
  retreatId: string;
  participantId: string;
  currentStage: string;
  stageHistory: { stage: string; date: string; note: string }[];
  lastTouchedAt: string;
  opsNotes: string;
  tags: string[];
  activities: { id: string; date: string; action: string; notes: string; performedBy: string }[];
  accommodationChoice: string;
  accommodationPriceAdjustment?: number;
  accommodationNotes: string;
  paymentStatus: string;
  amountDue?: number;
  amountPaid?: number;
  chemistryCallStatus: string;
  interviewStatus: string;
  chemistryCallAppointmentId?: string;
  interviewAppointmentId?: string;
  riskLevel: string;
  careFlags: string[];
  careNotes: string;
  careFlagOtherText: string;
  flaggedAt?: string;
  flaggedBy?: string;
}

// ============================================================================
// Context Type
// ============================================================================

interface AdminContextType {
  // Data source
  isSupabase: boolean;
  isLoading: boolean;

  // Retreats/Trainings
  retreats: UnifiedRetreat[];
  getRetreat: (id: string) => UnifiedRetreat | undefined;
  createRetreat: (retreat: Omit<UnifiedRetreat, 'id'>) => void;
  updateRetreat: (id: string, updates: Partial<UnifiedRetreat>) => void;

  // Participants
  participants: UnifiedParticipant[];
  getParticipant: (id: string) => UnifiedParticipant | undefined;
  addParticipant: (p: Omit<UnifiedParticipant, 'id' | 'createdAt'>) => void;

  // Registrations
  registrations: UnifiedRegistration[];
  getRegistrationsForRetreat: (retreatId: string) => UnifiedRegistration[];
  getRegistrationsForParticipant: (participantId: string) => UnifiedRegistration[];
  addRegistration: (retreatId: string, participantId: string, initialStage?: string) => void;
  moveStage: (registrationId: string, newStage: string, note?: string) => void;
  bulkMoveStage: (registrationIds: string[], newStage: string, note?: string) => void;
  updateOpsNotes: (registrationId: string, notes: string) => void;
  updateAccommodation: (regId: string, choice: string, priceAdj?: number, notes?: string) => void;
  updatePaymentInfo: (regId: string, paymentStatus: string, amountDue?: number, amountPaid?: number) => void;
  updateRiskCare: (regId: string, riskLevel: string, careFlags: string[], careNotes: string, careFlagOtherText: string) => void;
  addActivity: (registrationId: string, action: string, notes?: string) => void;
  addQuickLead: (retreatId: string, fullName: string, email: string, signalHandle: string) => void;
  bulkAddTag: (registrationIds: string[], tag: string) => void;
  bulkRemoveTag: (registrationIds: string[], tag: string) => void;

  // Appointments (Supabase-only for now, noop in fallback)
  appointments: any[];
  getAppointmentsForRetreat: (retreatId: string) => any[];
  getAppointmentsForRegistration: (registrationId: string) => any[];
  createAppointment: (apt: any) => void;
  updateAppointment: (id: string, updates: any) => void;

  // Tasks (Supabase-only for now, noop in fallback)
  tasks: any[];
  getTasksForRetreat: (retreatId: string) => any[];
  getTasksForRegistration: (registrationId: string) => any[];
  createTask: (task: any) => void;
  updateTask: (id: string, updates: any) => void;

  // Templates
  templates: any[];
  updateTemplate: (templateId: string, subject: string, body: string) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

// ============================================================================
// Converters
// ============================================================================

function retreatToUnified(r: Retreat): UnifiedRetreat {
  return {
    id: r.id,
    name: r.retreatName,
    startDate: r.startDate,
    endDate: r.endDate,
    location: r.location,
    cohortSizeTarget: r.cohortSizeTarget,
    status: r.status,
    notes: r.notes,
    capacityOverride: r.capacityOverride,
    autoMarkFull: r.autoMarkFull,
    autoReopenWhenBelowCapacity: r.autoReopenWhenBelowCapacity,
    chemistryCallLink: r.chemistryCallLink,
    applicationLink: r.applicationLink,
    paymentLink: r.paymentLink,
    accommodationSelectionLink: r.accommodationSelectionLink,
    onlineCourseLink: r.onlineCourseLink,
    accommodationOptions: r.accommodationOptions,
    isVisible: true,
  };
}

function trainingToUnified(t: Training): UnifiedRetreat {
  return {
    id: t.id,
    name: t.name,
    startDate: t.start_date,
    endDate: t.end_date,
    location: t.location,
    cohortSizeTarget: t.max_capacity,
    status: t.status || 'Open',
    notes: t.notes || '',
    capacityOverride: t.capacity_override || false,
    autoMarkFull: t.auto_mark_full ?? true,
    autoReopenWhenBelowCapacity: t.auto_reopen_when_below_capacity ?? true,
    chemistryCallLink: t.chemistry_call_link || '',
    applicationLink: t.application_link || '',
    paymentLink: t.payment_link || '',
    accommodationSelectionLink: t.accommodation_selection_link || '',
    onlineCourseLink: t.online_course_link || '',
    accommodationOptions: t.accommodation_options || [],
    isVisible: t.is_visible ?? true,
  };
}

function appParticipantToUnified(p: AppParticipant): UnifiedParticipant {
  return {
    id: p.id,
    fullName: p.fullName,
    email: p.email,
    signalHandle: p.signalHandle,
    allergies: p.allergies,
    specialRequests: p.specialRequests,
    createdAt: p.createdAt,
  };
}

function participantToUnified(p: Participant): UnifiedParticipant {
  return {
    id: p.id,
    fullName: p.full_name,
    email: p.email,
    signalHandle: p.signal_handle,
    allergies: p.allergies,
    specialRequests: p.special_requests,
    createdAt: p.created_at,
  };
}

function appRegistrationToUnified(r: AppRegistration): UnifiedRegistration {
  return {
    id: r.id,
    retreatId: r.retreatId,
    participantId: r.participantId,
    currentStage: r.currentStage,
    stageHistory: r.stageHistory,
    lastTouchedAt: r.lastTouchedAt,
    opsNotes: r.opsNotes,
    tags: r.tags,
    activities: r.activities,
    accommodationChoice: r.accommodationChoice,
    accommodationPriceAdjustment: r.accommodationPriceAdjustment,
    accommodationNotes: r.accommodationNotes,
    paymentStatus: r.paymentStatus,
    amountDue: r.amountDue,
    amountPaid: r.amountPaid,
    chemistryCallStatus: r.chemistryCallStatus,
    interviewStatus: r.interviewStatus,
    chemistryCallAppointmentId: r.chemistryCallAppointmentId,
    interviewAppointmentId: r.interviewAppointmentId,
    riskLevel: r.riskLevel,
    careFlags: r.careFlags,
    careNotes: r.careNotes,
    careFlagOtherText: r.careFlagOtherText,
    flaggedAt: r.flaggedAt,
    flaggedBy: r.flaggedBy,
  };
}

function registrationToUnified(r: Registration): UnifiedRegistration {
  return {
    id: r.id,
    retreatId: r.training_id,
    participantId: r.participant_id,
    currentStage: r.current_stage,
    stageHistory: r.stage_history,
    lastTouchedAt: r.last_touched_at,
    opsNotes: r.ops_notes,
    tags: r.tags,
    activities: r.activities,
    accommodationChoice: r.accommodation_choice,
    accommodationPriceAdjustment: r.accommodation_price_adjustment,
    accommodationNotes: r.accommodation_notes,
    paymentStatus: r.payment_status,
    amountDue: r.amount_due ?? undefined,
    amountPaid: r.amount_paid ?? undefined,
    chemistryCallStatus: r.chemistry_call_status,
    interviewStatus: r.interview_status,
    chemistryCallAppointmentId: r.chemistry_call_appointment_id ?? undefined,
    interviewAppointmentId: r.interview_appointment_id ?? undefined,
    riskLevel: r.risk_level,
    careFlags: r.care_flags,
    careNotes: r.care_notes,
    careFlagOtherText: r.care_flag_other_text,
    flaggedAt: r.flagged_at ?? undefined,
    flaggedBy: r.flagged_by ?? undefined,
  };
}

// ============================================================================
// Provider
// ============================================================================

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // Check if Supabase admin tables are available
  const { available: isSupabase, isLoading: checkingSupabase } = useSupabaseAdminAvailable();

  // AppContext fallback
  const appContext = useApp();

  // Supabase hooks (always called for hook consistency, but results ignored if not using Supabase)
  const { trainings, isLoading: trainingsLoading, createTraining, updateTraining } = useTrainings();
  const { participants: sbParticipants, isLoading: participantsLoading, createParticipant } = useParticipants();
  const {
    registrations: sbRegistrations,
    isLoading: registrationsLoading,
    createRegistration,
    moveStage: sbMoveStage,
    updateRegistration,
    bulkMoveStage: sbBulkMoveStage,
    bulkAddTag: sbBulkAddTag,
    bulkRemoveTag: sbBulkRemoveTag,
  } = useRegistrations();
  const { appointments: sbAppointments, createAppointment, updateAppointment } = useAppointments();
  const { tasks: sbTasks, createTask, updateTask } = useAdminTasks();

  const isLoading = checkingSupabase || (isSupabase && (trainingsLoading || participantsLoading || registrationsLoading));

  // Unified data
  const retreats = useMemo(() => {
    if (isSupabase) {
      return trainings.map(trainingToUnified);
    }
    return appContext.retreats.map(retreatToUnified);
  }, [isSupabase, trainings, appContext.retreats]);

  const participants = useMemo(() => {
    if (isSupabase) {
      return sbParticipants.map(participantToUnified);
    }
    return appContext.participants.map(appParticipantToUnified);
  }, [isSupabase, sbParticipants, appContext.participants]);

  const registrations = useMemo(() => {
    if (isSupabase) {
      return sbRegistrations.map(registrationToUnified);
    }
    return appContext.registrations.map(appRegistrationToUnified);
  }, [isSupabase, sbRegistrations, appContext.registrations]);

  // Getters
  const getRetreat = useCallback(
    (id: string) => retreats.find((r) => r.id === id),
    [retreats]
  );

  const getParticipant = useCallback(
    (id: string) => participants.find((p) => p.id === id),
    [participants]
  );

  const getRegistrationsForRetreat = useCallback(
    (retreatId: string) => registrations.filter((r) => r.retreatId === retreatId),
    [registrations]
  );

  const getRegistrationsForParticipant = useCallback(
    (participantId: string) => registrations.filter((r) => r.participantId === participantId),
    [registrations]
  );

  // Mutations
  const handleCreateRetreat = useCallback(
    (retreat: Omit<UnifiedRetreat, 'id'>) => {
      if (isSupabase) {
        createTraining.mutate({
          name: retreat.name,
          start_date: retreat.startDate,
          end_date: retreat.endDate,
          location: retreat.location,
          max_capacity: retreat.cohortSizeTarget,
          spots_filled: 0,
          status: retreat.status as any,
          notes: retreat.notes,
          capacity_override: retreat.capacityOverride,
          auto_mark_full: retreat.autoMarkFull,
          auto_reopen_when_below_capacity: retreat.autoReopenWhenBelowCapacity,
          chemistry_call_link: retreat.chemistryCallLink,
          application_link: retreat.applicationLink,
          payment_link: retreat.paymentLink,
          accommodation_selection_link: retreat.accommodationSelectionLink,
          online_course_link: retreat.onlineCourseLink,
          accommodation_options: retreat.accommodationOptions,
          is_visible: retreat.isVisible,
          training_level: 'Beginning',
          show_on_apply: true,
        } as any);
      } else {
        appContext.createRetreat({
          retreatName: retreat.name,
          startDate: retreat.startDate,
          endDate: retreat.endDate,
          location: retreat.location,
          cohortSizeTarget: retreat.cohortSizeTarget,
          status: retreat.status as any,
          notes: retreat.notes,
          capacityOverride: retreat.capacityOverride,
          autoMarkFull: retreat.autoMarkFull,
          autoReopenWhenBelowCapacity: retreat.autoReopenWhenBelowCapacity,
          chemistryCallLink: retreat.chemistryCallLink,
          applicationLink: retreat.applicationLink,
          paymentLink: retreat.paymentLink,
          accommodationSelectionLink: retreat.accommodationSelectionLink,
          onlineCourseLink: retreat.onlineCourseLink,
          accommodationOptions: retreat.accommodationOptions,
        });
      }
    },
    [isSupabase, createTraining, appContext]
  );

  const handleUpdateRetreat = useCallback(
    (id: string, updates: Partial<UnifiedRetreat>) => {
      if (isSupabase) {
        updateTraining.mutate({
          id,
          name: updates.name,
          start_date: updates.startDate,
          end_date: updates.endDate,
          location: updates.location,
          max_capacity: updates.cohortSizeTarget,
          status: updates.status as any,
          notes: updates.notes,
          capacity_override: updates.capacityOverride,
          auto_mark_full: updates.autoMarkFull,
          auto_reopen_when_below_capacity: updates.autoReopenWhenBelowCapacity,
          chemistry_call_link: updates.chemistryCallLink,
          application_link: updates.applicationLink,
          payment_link: updates.paymentLink,
          accommodation_selection_link: updates.accommodationSelectionLink,
          online_course_link: updates.onlineCourseLink,
          accommodation_options: updates.accommodationOptions,
          is_visible: updates.isVisible,
        } as any);
      } else {
        appContext.updateRetreat(id, {
          retreatName: updates.name,
          startDate: updates.startDate,
          endDate: updates.endDate,
          location: updates.location,
          cohortSizeTarget: updates.cohortSizeTarget,
          status: updates.status as any,
          notes: updates.notes,
          capacityOverride: updates.capacityOverride,
          autoMarkFull: updates.autoMarkFull,
          autoReopenWhenBelowCapacity: updates.autoReopenWhenBelowCapacity,
          chemistryCallLink: updates.chemistryCallLink,
          applicationLink: updates.applicationLink,
          paymentLink: updates.paymentLink,
          accommodationSelectionLink: updates.accommodationSelectionLink,
          onlineCourseLink: updates.onlineCourseLink,
          accommodationOptions: updates.accommodationOptions,
        });
      }
    },
    [isSupabase, updateTraining, appContext]
  );

  const handleAddParticipant = useCallback(
    (p: Omit<UnifiedParticipant, 'id' | 'createdAt'>) => {
      if (isSupabase) {
        createParticipant.mutate({
          full_name: p.fullName,
          email: p.email,
          signal_handle: p.signalHandle,
          allergies: p.allergies,
          special_requests: p.specialRequests,
          phone: '',
          user_id: null,
          application_id: null,
        });
      } else {
        appContext.addParticipant({
          fullName: p.fullName,
          email: p.email,
          signalHandle: p.signalHandle,
          allergies: p.allergies,
          specialRequests: p.specialRequests,
        });
      }
    },
    [isSupabase, createParticipant, appContext]
  );

  const handleAddRegistration = useCallback(
    (retreatId: string, participantId: string, initialStage?: string) => {
      if (isSupabase) {
        createRegistration.mutate({
          training_id: retreatId,
          participant_id: participantId,
          current_stage: (initialStage as PipelineStage) || 'Leads',
        });
      } else {
        appContext.addRegistration(retreatId, participantId, (initialStage as AppPipelineStage) || 'Leads');
      }
    },
    [isSupabase, createRegistration, appContext]
  );

  const handleMoveStage = useCallback(
    (registrationId: string, newStage: string, note?: string) => {
      if (isSupabase) {
        sbMoveStage.mutate({ registrationId, newStage: newStage as PipelineStage, note });
      } else {
        appContext.moveStage(registrationId, newStage as AppPipelineStage, note);
      }
    },
    [isSupabase, sbMoveStage, appContext]
  );

  const handleBulkMoveStage = useCallback(
    (registrationIds: string[], newStage: string, note?: string) => {
      if (isSupabase) {
        sbBulkMoveStage.mutate({ registrationIds, newStage: newStage as PipelineStage, note });
      } else {
        appContext.bulkMoveStage(registrationIds, newStage as AppPipelineStage, note);
      }
    },
    [isSupabase, sbBulkMoveStage, appContext]
  );

  const handleUpdateOpsNotes = useCallback(
    (registrationId: string, notes: string) => {
      if (isSupabase) {
        updateRegistration.mutate({ id: registrationId, ops_notes: notes } as any);
      } else {
        appContext.updateOpsNotes(registrationId, notes);
      }
    },
    [isSupabase, updateRegistration, appContext]
  );

  const handleUpdateAccommodation = useCallback(
    (regId: string, choice: string, priceAdj?: number, notes?: string) => {
      if (isSupabase) {
        updateRegistration.mutate({
          id: regId,
          accommodation_choice: choice,
          accommodation_price_adjustment: priceAdj,
          accommodation_notes: notes,
        } as any);
      } else {
        appContext.updateAccommodation(regId, choice, priceAdj, notes);
      }
    },
    [isSupabase, updateRegistration, appContext]
  );

  const handleUpdatePaymentInfo = useCallback(
    (regId: string, paymentStatus: string, amountDue?: number, amountPaid?: number) => {
      if (isSupabase) {
        updateRegistration.mutate({
          id: regId,
          payment_status: paymentStatus,
          amount_due: amountDue,
          amount_paid: amountPaid,
        } as any);
      } else {
        appContext.updatePaymentInfo(regId, paymentStatus as AppPaymentStatus, amountDue, amountPaid);
      }
    },
    [isSupabase, updateRegistration, appContext]
  );

  const handleUpdateRiskCare = useCallback(
    (regId: string, riskLevel: string, careFlags: string[], careNotes: string, careFlagOtherText: string) => {
      if (isSupabase) {
        updateRegistration.mutate({
          id: regId,
          risk_level: riskLevel,
          care_flags: careFlags,
          care_notes: careNotes,
          care_flag_other_text: careFlagOtherText,
        } as any);
      } else {
        appContext.updateRiskCare(regId, riskLevel as AppRiskLevel, careFlags as CareFlag[], careNotes, careFlagOtherText);
      }
    },
    [isSupabase, updateRegistration, appContext]
  );

  const handleAddActivity = useCallback(
    (registrationId: string, action: string, notes?: string) => {
      if (isSupabase) {
        // For Supabase, we need to fetch current activities and append
        // This is handled in the updateRegistration mutation
        // For now, just update via AppContext pattern
        // TODO: implement proper activity append in Supabase
      }
      appContext.addActivity(registrationId, action, notes);
    },
    [appContext]
  );

  const handleAddQuickLead = useCallback(
    (retreatId: string, fullName: string, email: string, signalHandle: string) => {
      if (isSupabase) {
        // Create participant then registration
        // This is async, so we use the mutations
        createParticipant.mutate(
          {
            full_name: fullName,
            email,
            signal_handle: signalHandle,
            allergies: '',
            special_requests: '',
            phone: '',
            user_id: null,
            application_id: null,
          },
          {
            onSuccess: (participant) => {
              createRegistration.mutate({
                training_id: retreatId,
                participant_id: participant.id,
                current_stage: 'Leads',
              });
            },
          }
        );
      } else {
        appContext.addQuickLead(retreatId, fullName, email, signalHandle);
      }
    },
    [isSupabase, createParticipant, createRegistration, appContext]
  );

  const handleBulkAddTag = useCallback(
    (registrationIds: string[], tag: string) => {
      if (isSupabase) {
        sbBulkAddTag.mutate({ registrationIds, tag });
      } else {
        appContext.bulkAddTag(registrationIds, tag);
      }
    },
    [isSupabase, sbBulkAddTag, appContext]
  );

  const handleBulkRemoveTag = useCallback(
    (registrationIds: string[], tag: string) => {
      if (isSupabase) {
        sbBulkRemoveTag.mutate({ registrationIds, tag });
      } else {
        appContext.bulkRemoveTag(registrationIds, tag);
      }
    },
    [isSupabase, sbBulkRemoveTag, appContext]
  );

  // Appointments (Supabase only for now)
  const appointments = isSupabase ? sbAppointments : appContext.appointments;
  const getAppointmentsForRetreat = useCallback(
    (retreatId: string) => appointments.filter((a: any) => (isSupabase ? a.training_id : a.retreatId) === retreatId),
    [appointments, isSupabase]
  );
  const getAppointmentsForRegistration = useCallback(
    (registrationId: string) => appointments.filter((a: any) => (isSupabase ? a.registration_id : a.registrationId) === registrationId),
    [appointments, isSupabase]
  );
  const handleCreateAppointment = useCallback(
    (apt: any) => {
      if (isSupabase) {
        createAppointment.mutate(apt);
      } else {
        appContext.createAppointment(apt);
      }
    },
    [isSupabase, createAppointment, appContext]
  );
  const handleUpdateAppointment = useCallback(
    (id: string, updates: any) => {
      if (isSupabase) {
        updateAppointment.mutate({ id, ...updates });
      } else {
        appContext.updateAppointment(id, updates);
      }
    },
    [isSupabase, updateAppointment, appContext]
  );

  // Tasks (Supabase only for now)
  const tasks = isSupabase ? sbTasks : appContext.tasks;
  const getTasksForRetreat = useCallback(
    (retreatId: string) => tasks.filter((t: any) => (isSupabase ? t.training_id : t.retreatId) === retreatId),
    [tasks, isSupabase]
  );
  const getTasksForRegistration = useCallback(
    (registrationId: string) => tasks.filter((t: any) => (isSupabase ? t.registration_id : t.registrationId) === registrationId),
    [tasks, isSupabase]
  );
  const handleCreateTask = useCallback(
    (task: any) => {
      if (isSupabase) {
        createTask.mutate(task);
      } else {
        appContext.createTask(task);
      }
    },
    [isSupabase, createTask, appContext]
  );
  const handleUpdateTask = useCallback(
    (id: string, updates: any) => {
      if (isSupabase) {
        updateTask.mutate({ id, ...updates });
      } else {
        appContext.updateTask(id, updates);
      }
    },
    [isSupabase, updateTask, appContext]
  );

  // Templates (AppContext only for now)
  const templates = appContext.templates;
  const handleUpdateTemplate = useCallback(
    (templateId: string, subject: string, body: string) => {
      appContext.updateTemplate(templateId, subject, body);
    },
    [appContext]
  );

  const value: AdminContextType = {
    isSupabase,
    isLoading,
    retreats,
    getRetreat,
    createRetreat: handleCreateRetreat,
    updateRetreat: handleUpdateRetreat,
    participants,
    getParticipant,
    addParticipant: handleAddParticipant,
    registrations,
    getRegistrationsForRetreat,
    getRegistrationsForParticipant,
    addRegistration: handleAddRegistration,
    moveStage: handleMoveStage,
    bulkMoveStage: handleBulkMoveStage,
    updateOpsNotes: handleUpdateOpsNotes,
    updateAccommodation: handleUpdateAccommodation,
    updatePaymentInfo: handleUpdatePaymentInfo,
    updateRiskCare: handleUpdateRiskCare,
    addActivity: handleAddActivity,
    addQuickLead: handleAddQuickLead,
    bulkAddTag: handleBulkAddTag,
    bulkRemoveTag: handleBulkRemoveTag,
    appointments,
    getAppointmentsForRetreat,
    getAppointmentsForRegistration,
    createAppointment: handleCreateAppointment,
    updateAppointment: handleUpdateAppointment,
    tasks,
    getTasksForRetreat,
    getTasksForRegistration,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    templates,
    updateTemplate: handleUpdateTemplate,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
