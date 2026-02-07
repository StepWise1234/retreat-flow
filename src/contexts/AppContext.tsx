import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Retreat, Participant, Registration, MessageTemplate,
  PipelineStage, PIPELINE_STAGES, ActivityEntry,
} from '@/lib/types';
import { seedRetreats, seedParticipants, seedRegistrations } from '@/lib/seed-data';
import { defaultTemplates } from '@/lib/templates';

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
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [retreats] = useState<Retreat[]>(seedRetreats);
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

  const moveStage = useCallback(
    (registrationId: string, newStage: PipelineStage, note = '') => {
      const now = new Date().toISOString();
      setRegistrations((prev) =>
        prev.map((r) => {
          if (r.id !== registrationId) return r;
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
                action: `Moved to ${newStage}`,
                notes: note,
                performedBy: 'Admin',
              },
            ],
          };
        })
      );
    },
    []
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
              {
                id: crypto.randomUUID(),
                date: now,
                action,
                notes,
                performedBy: 'Admin',
              },
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
      const p = addParticipant({
        fullName,
        email,
        signalHandle,
        allergies: '',
        specialRequests: '',
      });
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

  return (
    <AppContext.Provider
      value={{
        retreats,
        participants,
        registrations,
        templates,
        moveStage,
        addParticipant,
        addRegistration,
        addActivity,
        updateTemplate,
        addQuickLead,
        updateOpsNotes,
        getParticipant,
        getRetreat,
        getRegistrationsForRetreat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
