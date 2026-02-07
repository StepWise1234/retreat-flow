export const PIPELINE_STAGES = [
  'Leads',
  'Chemistry Call',
  'Application',
  'Interview',
  'Approval',
  'Payment',
  'Accommodation Selection',
  'Online Course Link',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type RetreatStatus = 'Draft' | 'Open' | 'Closed';

export interface Retreat {
  id: string;
  retreatName: string;
  startDate: string;
  endDate: string;
  location: string;
  cohortSizeTarget: number;
  status: RetreatStatus;
  notes: string;
}

export interface Participant {
  id: string;
  fullName: string;
  email: string;
  signalHandle: string;
  allergies: string;
  specialRequests: string;
  createdAt: string;
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
  retreatId: string;
  participantId: string;
  currentStage: PipelineStage;
  stageHistory: StageHistoryEntry[];
  lastTouchedAt: string;
  opsNotes: string;
  tags: string[];
  activities: ActivityEntry[];
}

export interface MessageTemplate {
  id: string;
  stage: PipelineStage;
  subject: string;
  body: string;
}

// Stage styling map — all classes reference design system tokens
export const STAGE_STYLE_MAP: Record<
  PipelineStage,
  { dot: string; bg: string; text: string; border: string; key: string }
> = {
  'Leads': {
    key: 'leads',
    dot: 'bg-stage-leads',
    bg: 'bg-stage-leads-light',
    text: 'text-stage-leads',
    border: 'border-stage-leads',
  },
  'Chemistry Call': {
    key: 'chemistry',
    dot: 'bg-stage-chemistry',
    bg: 'bg-stage-chemistry-light',
    text: 'text-stage-chemistry',
    border: 'border-stage-chemistry',
  },
  'Application': {
    key: 'application',
    dot: 'bg-stage-application',
    bg: 'bg-stage-application-light',
    text: 'text-stage-application',
    border: 'border-stage-application',
  },
  'Interview': {
    key: 'interview',
    dot: 'bg-stage-interview',
    bg: 'bg-stage-interview-light',
    text: 'text-stage-interview',
    border: 'border-stage-interview',
  },
  'Approval': {
    key: 'approval',
    dot: 'bg-stage-approval',
    bg: 'bg-stage-approval-light',
    text: 'text-stage-approval',
    border: 'border-stage-approval',
  },
  'Payment': {
    key: 'payment',
    dot: 'bg-stage-payment',
    bg: 'bg-stage-payment-light',
    text: 'text-stage-payment',
    border: 'border-stage-payment',
  },
  'Accommodation Selection': {
    key: 'accommodation',
    dot: 'bg-stage-accommodation',
    bg: 'bg-stage-accommodation-light',
    text: 'text-stage-accommodation',
    border: 'border-stage-accommodation',
  },
  'Online Course Link': {
    key: 'course',
    dot: 'bg-stage-course',
    bg: 'bg-stage-course-light',
    text: 'text-stage-course',
    border: 'border-stage-course',
  },
};

export function getStageIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

export function getNextStage(stage: PipelineStage): PipelineStage | null {
  const idx = getStageIndex(stage);
  if (idx < PIPELINE_STAGES.length - 1) return PIPELINE_STAGES[idx + 1];
  return null;
}

export function getPrevStage(stage: PipelineStage): PipelineStage | null {
  const idx = getStageIndex(stage);
  if (idx > 0) return PIPELINE_STAGES[idx - 1];
  return null;
}
