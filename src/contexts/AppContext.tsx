import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Retreat, Participant, Registration, MessageTemplate,
  PipelineStage, PIPELINE_STAGES, RetreatStatus, PaymentStatus,
  isEnrolledStage, getEnrolledCount, getStageIndex,
} from '@/lib/types';
import { seedRetreats, seedParticipants, seedRegistrations } from '@/lib/seed-data';
import { defaultTemplates } from '@/lib/templates';
import { toast } from 'sonner';

interface AppContextType {
  retreats: Retreat[];
  participants: Participant[];
  registrations: Registration[];
  templates: MessageTemplate[];
  moveStage: (registrationId: string, newStage: PipelineStage, note?: string) => void;
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
}

const AppContext = createContext<AppContextType | null>(null);

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

  // Capacity check helper (uses latest registrations from state setter)
  const checkCapacityAfterMove = useCallback(
    (retreatId: string, updatedRegistrations: Registration[]) => {
      const retreatRegs = updatedRegistrations.filter((r) => r.retreatId === retreatId);
      const enrolled = getEnrolledCount(retreatRegs);

      setRetreats((prevRetreats) => {
        const retreat = prevRetreats.find((r) => r.id === retreatId);
        if (!retreat) return prevRetreats;

        // Auto-mark Full
        if (enrolled >= retreat.cohortSizeTarget && retreat.status === 'Open' && retreat.autoMarkFull) {
          toast.success('🎉 Retreat is now Full!');
          return prevRetreats.map((r) =>
            r.id === retreatId ? { ...r, status: 'Full' as RetreatStatus } : r
          );
        }

        // Auto-reopen
        if (enrolled < retreat.cohortSizeTarget && retreat.status === 'Full' && retreat.autoReopenWhenBelowCapacity) {
          toast.info('Retreat reopened: enrolled below capacity.');
          return prevRetreats.map((r) =>
            r.id === retreatId ? { ...r, status: 'Open' as RetreatStatus, capacityOverride: false } : r
          );
        }

        return prevRetreats;
      });
    },
    []
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

        // Run capacity check after state update
        if (retreatId) {
          setTimeout(() => checkCapacityAfterMove(retreatId, updated), 0);
        }

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

        // Check capacity after payment status changes
        const reg = updated.find((r) => r.id === regId);
        if (reg) {
          setTimeout(() => checkCapacityAfterMove(reg.retreatId, updated), 0);
        }

        return updated;
      });
    },
    [checkCapacityAfterMove]
  );

  return (
    <AppContext.Provider
      value={{
        retreats, participants, registrations, templates,
        moveStage, addParticipant, addRegistration, addActivity,
        updateTemplate, addQuickLead, updateOpsNotes,
        getParticipant, getRetreat, getRegistrationsForRetreat,
        updateRetreat, createRetreat, updateAccommodation,
        updatePaymentInfo, getRegistrationsForParticipant,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
