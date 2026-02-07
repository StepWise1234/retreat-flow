import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Retreat, Participant, Registration, MessageTemplate, Appointment, Task,
  PipelineStage, PIPELINE_STAGES, RetreatStatus, PaymentStatus, SchedulingStatus,
  AppointmentType, AppointmentStatus, RiskLevel, CareFlag, TaskStatus, TaskPriority,
  isEnrolledStage, getEnrolledCount, getStageIndex, getEffectiveCapacity, getInProgressRegistrations,
} from '@/lib/types';
import { seedRetreats, seedParticipants, seedRegistrations, seedAppointments, seedTasks } from '@/lib/seed-data';
import { defaultTemplates } from '@/lib/templates';
import { toast } from 'sonner';

interface AppContextType {
  retreats: Retreat[];
  participants: Participant[];
  registrations: Registration[];
  templates: MessageTemplate[];
  appointments: Appointment[];
  tasks: Task[];
  moveStage: (registrationId: string, newStage: PipelineStage, note?: string) => void;
  bulkMoveStage: (registrationIds: string[], newStage: PipelineStage, note?: string) => void;
  addParticipant: (p: Omit<Participant, 'id' | 'createdAt'>) => Participant;
  addRegistration: (retreatId: string, participantId: string, initialStage?: PipelineStage) => Registration;
  addActivity: (registrationId: string, action: string, notes?: string) => void;
  updateTemplate: (templateId: string, subject: string, body: string) => void;
  addQuickLead: (retreatId: string, fullName: string, email: string, signalHandle: string) => void;
  updateOpsNotes: (registrationId: string, notes: string) => void;
  getParticipant: (id: string) => Participant | undefined;
  getRetreat: (id: string) => Retreat | undefined;
  getRegistrationsForRetreat: (retreatId: string) => Registration[];
  updateRetreat: (id: string, updates: Partial<Retreat>) => void;
  createRetreat: (retreat: Omit<Retreat, 'id'>) => Retreat;
  updateAccommodation: (regId: string, choice: string, priceAdj?: number, notes?: string) => void;
  updatePaymentInfo: (regId: string, paymentStatus: PaymentStatus, amountDue?: number, amountPaid?: number) => void;
  getRegistrationsForParticipant: (participantId: string) => Registration[];
  // Scheduling
  createAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  getAppointmentsForRetreat: (retreatId: string) => Appointment[];
  getAppointmentsForRegistration: (registrationId: string) => Appointment[];
  // Risk & Care
  updateRiskCare: (regId: string, riskLevel: RiskLevel, careFlags: CareFlag[], careNotes: string, careFlagOtherText: string) => void;
  // Tasks
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  getTasksForRetreat: (retreatId: string) => Task[];
  getTasksForRegistration: (registrationId: string) => Task[];
  // Bulk
  bulkAddTag: (registrationIds: string[], tag: string) => void;
  bulkRemoveTag: (registrationIds: string[], tag: string) => void;
}

// Persist context across HMR reloads
const _global = globalThis as any;
if (!_global.__APP_CONTEXT__) {
  _global.__APP_CONTEXT__ = createContext<AppContextType | null>(null);
}
const AppContext = _global.__APP_CONTEXT__ as React.Context<AppContextType | null>;

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [retreats, setRetreats] = useState<Retreat[]>(seedRetreats);
  const [participants, setParticipants] = useState<Participant[]>(seedParticipants);
  const [registrations, setRegistrations] = useState<Registration[]>(seedRegistrations);
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);

  const getParticipant = useCallback(
    (id: string) => participants.find((p) => p.id === id),
    [participants]
  );

  const getRetreat = useCallback(
    (id: string) => retreats.find((r) => r.id === id),
    [retreats]
  );

  const getRegistrationsForRetreat = useCallback(
    (retreatId: string) => registrations.filter((r) => r.retreatId === retreatId),
    [registrations]
  );

  const getRegistrationsForParticipant = useCallback(
    (participantId: string) => registrations.filter((r) => r.participantId === participantId),
    [registrations]
  );

  const getAppointmentsForRetreat = useCallback(
    (retreatId: string) => appointments.filter((a) => a.retreatId === retreatId),
    [appointments]
  );

  const getAppointmentsForRegistration = useCallback(
    (registrationId: string) => appointments.filter((a) => a.registrationId === registrationId),
    [appointments]
  );

  const getTasksForRetreat = useCallback(
    (retreatId: string) => tasks.filter((t) => t.retreatId === retreatId),
    [tasks]
  );

  const getTasksForRegistration = useCallback(
    (registrationId: string) => tasks.filter((t) => t.registrationId === registrationId),
    [tasks]
  );

  const updateRetreat = useCallback(
    (id: string, updates: Partial<Retreat>) => {
      setRetreats((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    },
    []
  );

  const createRetreat = useCallback(
    (retreat: Omit<Retreat, 'id'>): Retreat => {
      const newRetreat: Retreat = {
        ...retreat,
        id: `retreat-${crypto.randomUUID().slice(0, 8)}`,
      };
      setRetreats((prev) => [...prev, newRetreat]);
      return newRetreat;
    },
    []
  );

  const checkCapacityAfterMove = useCallback(
    (retreatId: string, updatedRegistrations: Registration[]) => {
      const retreatRegs = updatedRegistrations.filter((r) => r.retreatId === retreatId);
      const enrolled = getEnrolledCount(retreatRegs);

      setRetreats((prevRetreats) => {
        const retreat = prevRetreats.find((r) => r.id === retreatId);
        if (!retreat) return prevRetreats;

        const capacity = getEffectiveCapacity(retreat);
        const spotsLeft = capacity - enrolled;
        const inProgress = getInProgressRegistrations(retreatRegs);

        // Low-spots urgency toast
        if (spotsLeft >= 0 && spotsLeft <= 2 && inProgress.length > 0) {
          const names = inProgress
            .map((reg) => participants.find((p) => p.id === reg.participantId)?.fullName)
            .filter(Boolean)
            .slice(0, 4);
          const extra = inProgress.length > 4 ? ` +${inProgress.length - 4} more` : '';
          toast.warning(
            `⚠️ Only ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left! ${inProgress.length} participant${inProgress.length === 1 ? '' : 's'} still in progress: ${names.join(', ')}${extra}`,
            { duration: 8000 }
          );
        }

        if (enrolled >= capacity && retreat.status === 'Open' && retreat.autoMarkFull) {
          toast.success('🎉 Retreat is now Full!');
          return prevRetreats.map((r) =>
            r.id === retreatId ? { ...r, status: 'Full' as RetreatStatus } : r
          );
        }

        if (enrolled < capacity && retreat.status === 'Full' && retreat.autoReopenWhenBelowCapacity) {
          toast.info('Retreat reopened: enrolled below capacity.');
          return prevRetreats.map((r) =>
            r.id === retreatId ? { ...r, status: 'Open' as RetreatStatus, capacityOverride: false } : r
          );
        }

        return prevRetreats;
      });
    },
    [participants]
  );

  const moveStage = useCallback(
    (registrationId: string, newStage: PipelineStage, note = '') => {
      const now = new Date().toISOString();
      let retreatId = '';

      setRegistrations((prev) => {
        const updated = prev.map((r) => {
          if (r.id !== registrationId) return r;
          retreatId = r.retreatId;

          const newPaymentStatus: PaymentStatus =
            newStage === 'Payment' && r.paymentStatus === 'Unpaid' ? 'Unpaid' : r.paymentStatus;

          return {
            ...r,
            currentStage: newStage,
            lastTouchedAt: now,
            paymentStatus: newPaymentStatus,
            stageHistory: [...r.stageHistory, { stage: newStage, date: now, note }],
            activities: [
              ...r.activities,
              {
                id: crypto.randomUUID(),
                date: now,
                action: `Moved to ${newStage}`,
                notes: note,
                performedBy: 'Admin',
              },
            ],
          };
        });

        if (retreatId) {
          setTimeout(() => checkCapacityAfterMove(retreatId, updated), 0);
        }

        return updated;
      });
    },
    [checkCapacityAfterMove]
  );

  const bulkMoveStage = useCallback(
    (registrationIds: string[], newStage: PipelineStage, note = '') => {
      const now = new Date().toISOString();
      const retreatIds = new Set<string>();

      setRegistrations((prev) => {
        const updated = prev.map((r) => {
          if (!registrationIds.includes(r.id)) return r;
          retreatIds.add(r.retreatId);

          return {
            ...r,
            currentStage: newStage,
            lastTouchedAt: now,
            stageHistory: [...r.stageHistory, { stage: newStage, date: now, note }],
            activities: [
              ...r.activities,
              {
                id: crypto.randomUUID(),
                date: now,
                action: `Bulk moved to ${newStage}`,
                notes: note,
                performedBy: 'Admin',
              },
            ],
          };
        });

        retreatIds.forEach((rId) => {
          setTimeout(() => checkCapacityAfterMove(rId, updated), 0);
        });

        return updated;
      });
    },
    [checkCapacityAfterMove]
  );

  const addParticipant = useCallback(
    (p: Omit<Participant, 'id' | 'createdAt'>): Participant => {
      const newP: Participant = {
        ...p,
        id: `p-${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString(),
      };
      setParticipants((prev) => [...prev, newP]);
      return newP;
    },
    []
  );

  const addRegistration = useCallback(
    (retreatId: string, participantId: string, initialStage: PipelineStage = 'Leads'): Registration => {
      const now = new Date().toISOString();
      const newReg: Registration = {
        id: `reg-${crypto.randomUUID().slice(0, 8)}`,
        retreatId,
        participantId,
        currentStage: initialStage,
        stageHistory: [{ stage: initialStage, date: now, note: 'Initial registration' }],
        lastTouchedAt: now,
        opsNotes: '',
        tags: [],
        activities: [
          {
            id: crypto.randomUUID(),
            date: now,
            action: `Registered at ${initialStage}`,
            notes: '',
            performedBy: 'Admin',
          },
        ],
        accommodationChoice: '',
        accommodationNotes: '',
        paymentStatus: 'Unpaid',
        chemistryCallStatus: 'NotScheduled',
        interviewStatus: 'NotScheduled',
        riskLevel: 'None',
        careFlags: [],
        careNotes: '',
        careFlagOtherText: '',
      };
      setRegistrations((prev) => [...prev, newReg]);
      return newReg;
    },
    []
  );

  const addActivity = useCallback(
    (registrationId: string, action: string, notes = '') => {
      const now = new Date().toISOString();
      setRegistrations((prev) =>
        prev.map((r) => {
          if (r.id !== registrationId) return r;
          return {
            ...r,
            lastTouchedAt: now,
            activities: [
              ...r.activities,
              { id: crypto.randomUUID(), date: now, action, notes, performedBy: 'Admin' },
            ],
          };
        })
      );
    },
    []
  );

  const updateTemplate = useCallback(
    (templateId: string, subject: string, body: string) => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? { ...t, subject, body } : t))
      );
    },
    []
  );

  const addQuickLead = useCallback(
    (retreatId: string, fullName: string, email: string, signalHandle: string) => {
      const p = addParticipant({ fullName, email, signalHandle, allergies: '', specialRequests: '' });
      addRegistration(retreatId, p.id, 'Leads');
    },
    [addParticipant, addRegistration]
  );

  const updateOpsNotes = useCallback(
    (registrationId: string, notes: string) => {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === registrationId ? { ...r, opsNotes: notes } : r))
      );
    },
    []
  );

  const updateAccommodation = useCallback(
    (regId: string, choice: string, priceAdj?: number, notes?: string) => {
      const now = new Date().toISOString();
      setRegistrations((prev) =>
        prev.map((r) => {
          if (r.id !== regId) return r;
          return {
            ...r,
            accommodationChoice: choice,
            accommodationPriceAdjustment: priceAdj,
            accommodationNotes: notes ?? r.accommodationNotes,
            lastTouchedAt: now,
            activities: [
              ...r.activities,
              { id: crypto.randomUUID(), date: now, action: `Accommodation selected: ${choice}`, notes: notes || '', performedBy: 'Admin' },
            ],
          };
        })
      );
    },
    []
  );

  const updatePaymentInfo = useCallback(
    (regId: string, paymentStatus: PaymentStatus, amountDue?: number, amountPaid?: number) => {
      const now = new Date().toISOString();
      setRegistrations((prev) => {
        const updated = prev.map((r) => {
          if (r.id !== regId) return r;
          return {
            ...r,
            paymentStatus,
            amountDue: amountDue ?? r.amountDue,
            amountPaid: amountPaid ?? r.amountPaid,
            lastTouchedAt: now,
            activities: [
              ...r.activities,
              { id: crypto.randomUUID(), date: now, action: `Payment status: ${paymentStatus}`, notes: amountPaid != null ? `$${amountPaid}` : '', performedBy: 'Admin' },
            ],
          };
        });

        const reg = updated.find((r) => r.id === regId);
        if (reg) {
          setTimeout(() => checkCapacityAfterMove(reg.retreatId, updated), 0);
        }

        return updated;
      });
    },
    [checkCapacityAfterMove]
  );

  // Scheduling
  const createAppointment = useCallback(
    (apt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment => {
      const now = new Date().toISOString();
      const newApt: Appointment = {
        ...apt,
        id: `apt-${crypto.randomUUID().slice(0, 8)}`,
        createdAt: now,
        updatedAt: now,
      };
      setAppointments((prev) => [...prev, newApt]);

      // Update registration scheduling status
      const statusField = apt.type === 'ChemistryCall' ? 'chemistryCallStatus' : 'interviewStatus';
      const aptIdField = apt.type === 'ChemistryCall' ? 'chemistryCallAppointmentId' : 'interviewAppointmentId';
      const statusValue: SchedulingStatus = apt.status === 'Proposed' ? 'Proposed' : 'Scheduled';

      setRegistrations((prev) =>
        prev.map((r) => {
          if (r.id !== apt.registrationId) return r;
          return {
            ...r,
            [statusField]: statusValue,
            [aptIdField]: newApt.id,
            lastTouchedAt: now,
            activities: [
              ...r.activities,
              { id: crypto.randomUUID(), date: now, action: `${apt.type === 'ChemistryCall' ? 'Chemistry Call' : 'Interview'} ${statusValue.toLowerCase()}`, notes: '', performedBy: 'Admin' },
            ],
          };
        })
      );

      return newApt;
    },
    []
  );

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Appointment>) => {
      const now = new Date().toISOString();
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: now } : a))
      );

      // If status changed, update registration
      if (updates.status) {
        const apt = appointments.find((a) => a.id === id);
        if (apt) {
          const statusField = apt.type === 'ChemistryCall' ? 'chemistryCallStatus' : 'interviewStatus';
          let regStatus: SchedulingStatus = 'Scheduled';
          if (updates.status === 'Completed') regStatus = 'Completed';
          else if (updates.status === 'NoShow') regStatus = 'NoShow';
          else if (updates.status === 'Canceled') regStatus = 'NotScheduled';
          else if (updates.status === 'Proposed') regStatus = 'Proposed';

          setRegistrations((prev) =>
            prev.map((r) => {
              if (r.id !== apt.registrationId) return r;
              return {
                ...r,
                [statusField]: regStatus,
                lastTouchedAt: now,
                activities: [
                  ...r.activities,
                  { id: crypto.randomUUID(), date: now, action: `${apt.type === 'ChemistryCall' ? 'Chemistry Call' : 'Interview'} marked ${updates.status}`, notes: '', performedBy: 'Admin' },
                ],
              };
            })
          );
        }
      }
    },
    [appointments]
  );

  // Risk & Care
  const updateRiskCare = useCallback(
    (regId: string, riskLevel: RiskLevel, careFlags: CareFlag[], careNotes: string, careFlagOtherText: string) => {
      const now = new Date().toISOString();
      setRegistrations((prev) =>
        prev.map((r) => {
          if (r.id !== regId) return r;
          const wasNone = r.riskLevel === 'None';
          return {
            ...r,
            riskLevel,
            careFlags,
            careNotes,
            careFlagOtherText,
            flaggedAt: wasNone && riskLevel !== 'None' ? now : r.flaggedAt,
            flaggedBy: wasNone && riskLevel !== 'None' ? 'Admin' : r.flaggedBy,
            lastTouchedAt: now,
            activities: [
              ...r.activities,
              { id: crypto.randomUUID(), date: now, action: `Risk level set to ${riskLevel}`, notes: careNotes ? 'Care notes updated' : '', performedBy: 'Admin' },
            ],
          };
        })
      );
    },
    []
  );

  // Tasks
  const createTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: `task-${crypto.randomUUID().slice(0, 8)}`,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    []
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            ...updates,
            updatedAt: now,
            completedAt: updates.status === 'Done' ? now : t.completedAt,
          };
        })
      );
    },
    []
  );

  // Bulk tagging
  const bulkAddTag = useCallback(
    (registrationIds: string[], tag: string) => {
      setRegistrations((prev) =>
        prev.map((r) => {
          if (!registrationIds.includes(r.id)) return r;
          if (r.tags.includes(tag)) return r;
          return { ...r, tags: [...r.tags, tag] };
        })
      );
    },
    []
  );

  const bulkRemoveTag = useCallback(
    (registrationIds: string[], tag: string) => {
      setRegistrations((prev) =>
        prev.map((r) => {
          if (!registrationIds.includes(r.id)) return r;
          return { ...r, tags: r.tags.filter((t) => t !== tag) };
        })
      );
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        retreats, participants, registrations, templates, appointments, tasks,
        moveStage, bulkMoveStage, addParticipant, addRegistration, addActivity,
        updateTemplate, addQuickLead, updateOpsNotes,
        getParticipant, getRetreat, getRegistrationsForRetreat,
        updateRetreat, createRetreat, updateAccommodation,
        updatePaymentInfo, getRegistrationsForParticipant,
        createAppointment, updateAppointment, getAppointmentsForRetreat, getAppointmentsForRegistration,
        updateRiskCare,
        createTask, updateTask, getTasksForRetreat, getTasksForRegistration,
        bulkAddTag, bulkRemoveTag,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
