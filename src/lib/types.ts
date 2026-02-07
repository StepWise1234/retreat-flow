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

// Stage styling map — all classes reference design system tokens (rainbow progression)
export const STAGE_STYLE_MAP: Record<
  PipelineStage,
  { dot: string; bg: string; text: string; border: string; key: string; gradient: string }
> = {
  'Leads': {
    key: 'leads',
    dot: 'bg-stage-leads',
    bg: 'bg-stage-leads-light',
    text: 'text-stage-leads',
    border: 'border-stage-leads',
    gradient: 'from-stage-leads-light to-transparent',
  },
  'Chemistry Call': {
    key: 'chemistry',
    dot: 'bg-stage-chemistry',
    bg: 'bg-stage-chemistry-light',
    text: 'text-stage-chemistry',
    border: 'border-stage-chemistry',
    gradient: 'from-stage-chemistry-light to-transparent',
  },
  'Application': {
    key: 'application',
    dot: 'bg-stage-application',
    bg: 'bg-stage-application-light',
    text: 'text-stage-application',
    border: 'border-stage-application',
    gradient: 'from-stage-application-light to-transparent',
  },
  'Interview': {
    key: 'interview',
    dot: 'bg-stage-interview',
    bg: 'bg-stage-interview-light',
    text: 'text-stage-interview',
    border: 'border-stage-interview',
    gradient: 'from-stage-interview-light to-transparent',
  },
  'Approval': {
    key: 'approval',
    dot: 'bg-stage-approval',
    bg: 'bg-stage-approval-light',
    text: 'text-stage-approval',
    border: 'border-stage-approval',
    gradient: 'from-stage-approval-light to-transparent',
  },
  'Payment': {
    key: 'payment',
    dot: 'bg-stage-payment',
    bg: 'bg-stage-payment-light',
    text: 'text-stage-payment',
    border: 'border-stage-payment',
    gradient: 'from-stage-payment-light to-transparent',
  },
  'Accommodation Selection': {
    key: 'accommodation',
    dot: 'bg-stage-accommodation',
    bg: 'bg-stage-accommodation-light',
    text: 'text-stage-accommodation',
    border: 'border-stage-accommodation',
    gradient: 'from-stage-accommodation-light to-transparent',
  },
  'Online Course Link': {
    key: 'course',
    dot: 'bg-stage-course',
    bg: 'bg-stage-course-light',
    text: 'text-stage-course',
    border: 'border-stage-course',
    gradient: 'from-stage-course-light to-transparent',
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

export const DEFAULT_CAPACITY = 6;
export const OVERRIDE_CAPACITY = 9;

export function getEffectiveCapacity(retreat: Retreat): number {
  return retreat.capacityOverride ? OVERRIDE_CAPACITY : DEFAULT_CAPACITY;
}

export function isEnrolledStage(stage: PipelineStage): boolean {
  return getStageIndex(stage) >= getStageIndex('Payment');
}

export function getEnrolledCount(registrations: Registration[]): number {
  return registrations.filter((r) => isEnrolledStage(r.currentStage)).length;
}

export function getInProgressRegistrations(registrations: Registration[]): Registration[] {
  return registrations.filter((r) => !isEnrolledStage(r.currentStage));
}

export function getAvailableSpots(retreat: Retreat, registrations: Registration[]): number {
  const capacity = getEffectiveCapacity(retreat);
  const enrolled = getEnrolledCount(registrations);
  return Math.max(0, capacity - enrolled);
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

// ── Retreat color system ──
// 8 contrasting gradient palettes that cycle for unlimited retreats
export const RETREAT_COLORS = [
  { key: '1', from: 'hsl(var(--retreat-1-from))', to: 'hsl(var(--retreat-1-to))', text: 'text-white', label: 'Ocean' },
  { key: '2', from: 'hsl(var(--retreat-2-from))', to: 'hsl(var(--retreat-2-to))', text: 'text-white', label: 'Sunset' },
  { key: '3', from: 'hsl(var(--retreat-3-from))', to: 'hsl(var(--retreat-3-to))', text: 'text-white', label: 'Forest' },
  { key: '4', from: 'hsl(var(--retreat-4-from))', to: 'hsl(var(--retreat-4-to))', text: 'text-white', label: 'Amethyst' },
  { key: '5', from: 'hsl(var(--retreat-5-from))', to: 'hsl(var(--retreat-5-to))', text: 'text-white', label: 'Amber' },
  { key: '6', from: 'hsl(var(--retreat-6-from))', to: 'hsl(var(--retreat-6-to))', text: 'text-white', label: 'Rose' },
  { key: '7', from: 'hsl(var(--retreat-7-from))', to: 'hsl(var(--retreat-7-to))', text: 'text-white', label: 'Teal' },
  { key: '8', from: 'hsl(var(--retreat-8-from))', to: 'hsl(var(--retreat-8-to))', text: 'text-white', label: 'Nebula' },
] as const;

export type RetreatColorKey = (typeof RETREAT_COLORS)[number]['key'];

/** Get a deterministic color palette for a retreat based on its index */
export function getRetreatColor(retreatIndex: number) {
  return RETREAT_COLORS[retreatIndex % RETREAT_COLORS.length];
}

/** Get retreat color by retreat ID from a list of retreats */
export function getRetreatColorById(retreatId: string, retreats: { id: string }[]) {
  const idx = retreats.findIndex((r) => r.id === retreatId);
  return getRetreatColor(idx >= 0 ? idx : 0);
}
