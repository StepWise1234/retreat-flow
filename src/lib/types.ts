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

export type RetreatStatus = 'Draft' | 'Open' | 'Full' | 'Closed' | 'Archived';

export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';

export type AppointmentType = 'ChemistryCall' | 'Interview';

export type AppointmentStatus = 'Proposed' | 'Scheduled' | 'Completed' | 'NoShow' | 'Canceled';

export type SchedulingStatus = 'NotScheduled' | 'Proposed' | 'Scheduled' | 'Completed' | 'NoShow';

export type RiskLevel = 'None' | 'Low' | 'Medium' | 'High';

export const CARE_FLAGS = [
  'Allergies',
  'Dietary restrictions',
  'Accessibility needs',
  'Medical considerations',
  'Trauma-informed considerations',
  'Mobility concerns',
  'Hearing/vision support',
  'Rooming sensitivity',
  'Interpersonal boundary needs',
  'Other',
] as const;

export type CareFlag = (typeof CARE_FLAGS)[number];

export type TaskStatus = 'Open' | 'Done' | 'Snoozed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface AccommodationOption {
  label: string;
  description: string;
  priceAdjustment?: number;
}

export interface Retreat {
  id: string;
  retreatName: string;
  startDate: string;
  endDate: string;
  location: string;
  cohortSizeTarget: number;
  status: RetreatStatus;
  notes: string;
  capacityOverride: boolean;
  autoMarkFull: boolean;
  autoReopenWhenBelowCapacity: boolean;
  chemistryCallLink: string;
  applicationLink: string;
  paymentLink: string;
  accommodationSelectionLink: string;
  onlineCourseLink: string;
  accommodationOptions: AccommodationOption[];
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
  accommodationChoice: string;
  accommodationPriceAdjustment?: number;
  accommodationNotes: string;
  amountDue?: number;
  amountPaid?: number;
  paymentStatus: PaymentStatus;
  // Scheduling
  chemistryCallStatus: SchedulingStatus;
  interviewStatus: SchedulingStatus;
  chemistryCallAppointmentId?: string;
  interviewAppointmentId?: string;
  // Risk & Care
  riskLevel: RiskLevel;
  careFlags: CareFlag[];
  careNotes: string;
  careFlagOtherText: string;
  flaggedAt?: string;
  flaggedBy?: string;
}

export interface Appointment {
  id: string;
  retreatId: string;
  registrationId: string;
  type: AppointmentType;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  status: AppointmentStatus;
  locationOrLink: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  retreatId: string;
  registrationId: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
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

export function isEnrolledStage(stage: PipelineStage): boolean {
  return getStageIndex(stage) >= getStageIndex('Payment');
}

export function getEnrolledCount(registrations: Registration[]): number {
  return registrations.filter((r) => isEnrolledStage(r.currentStage)).length;
}

export const ENROLLED_STAGES: PipelineStage[] = ['Payment', 'Accommodation Selection', 'Online Course Link'];

export const STATUS_STYLES: Record<RetreatStatus, string> = {
  Draft: 'bg-secondary text-muted-foreground',
  Open: 'bg-stage-approval-light text-stage-approval',
  Full: 'bg-stage-payment-light text-stage-payment',
  Closed: 'bg-stage-leads-light text-stage-leads',
  Archived: 'bg-secondary text-muted-foreground',
};

export const RISK_LEVEL_STYLES: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  None: { bg: '', text: '', border: '' },
  Low: { bg: 'bg-stage-chemistry-light', text: 'text-stage-chemistry', border: 'border-stage-chemistry' },
  Medium: { bg: 'bg-stage-payment-light', text: 'text-stage-payment', border: 'border-stage-payment' },
  High: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive' },
};

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  Low: 'bg-secondary text-muted-foreground',
  Medium: 'bg-stage-payment-light text-stage-payment',
  High: 'bg-destructive/10 text-destructive',
};
