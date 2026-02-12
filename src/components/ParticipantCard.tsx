import { AlertTriangle, MessageCircle, CreditCard, Shield, CalendarDays, Phone, Video, Send } from 'lucide-react';
import { Registration, Participant, PaymentStatus, RISK_LEVEL_STYLES } from '@/lib/types';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { GridPattern } from '@/components/ui/grid-pattern';
import IntegrationStatusBadge from './messaging/IntegrationStatusBadge';

interface Props {
  registration: Registration;
  participant: Participant;
  onClick: () => void;
  isDragging?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

const paymentBadgeStyles: Record<PaymentStatus, string> = {
  Unpaid: 'bg-stage-payment-light text-stage-payment',
  Partial: 'bg-stage-interview-light text-stage-interview',
  Paid: 'bg-stage-approval-light text-stage-approval',
  Refunded: 'bg-destructive/10 text-destructive',
};

export default function ParticipantCard({ registration, participant, onClick, isDragging, selectable, selected, onToggleSelect }: Props) {
  const { appointments } = useApp();
  const hasAllergies = participant.allergies.trim().length > 0;
  const hasSpecial = participant.specialRequests.trim().length > 0;
  const showPayment = registration.paymentStatus !== 'Unpaid' || registration.amountDue;
  const hasRisk = registration.riskLevel !== 'None';
  const riskStyle = RISK_LEVEL_STYLES[registration.riskLevel];

  // Find scheduled appointments
  const chemApt = registration.chemistryCallAppointmentId
    ? appointments.find((a) => a.id === registration.chemistryCallAppointmentId && a.status === 'Scheduled')
    : null;
  const intApt = registration.interviewAppointmentId
    ? appointments.find((a) => a.id === registration.interviewAppointmentId && a.status === 'Scheduled')
    : null;

  return (
    <div className="relative">
      {selectable && (
        <div className="absolute left-1.5 top-1.5 z-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selected} onCheckedChange={onToggleSelect} />
        </div>
      )}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full rounded-md border bg-card p-3 text-left hover-lift transition-shadow relative overflow-hidden',
          isDragging && 'shadow-lg ring-2 ring-primary',
          selected && 'ring-2 ring-primary/50',
          selectable && 'pl-8'
        )}
      >
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]">
          <GridPattern width={24} height={24} className="fill-primary/[0.015] stroke-primary/[0.03]" />
        </div>
        <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-card-foreground truncate">{participant.fullName}</p>
          {hasRisk && (
            <Badge className={cn('text-[9px] px-1 py-0 ml-1', riskStyle.bg, riskStyle.text)}>
              <Shield className="h-2.5 w-2.5 mr-0.5" />
              {registration.riskLevel}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{participant.email}</p>

        {/* Scheduling badges */}
        {(chemApt || intApt) && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {chemApt && (
              <span className="inline-flex items-center gap-0.5 rounded bg-stage-chemistry-light px-1 py-0.5 text-[9px] text-stage-chemistry">
                <Phone className="h-2.5 w-2.5" />
                {format(parseISO(chemApt.startDateTime), 'MMM d')}
              </span>
            )}
            {intApt && (
              <span className="inline-flex items-center gap-0.5 rounded bg-stage-interview-light px-1 py-0.5 text-[9px] text-stage-interview">
                <Video className="h-2.5 w-2.5" />
                {format(parseISO(intApt.startDateTime), 'MMM d')}
              </span>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              {participant.signalHandle}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <IntegrationStatusBadge type="email" compact />
            <IntegrationStatusBadge type="signal" compact />
            {showPayment && (
              <span className={cn('rounded px-1 py-0.5 text-[10px] font-medium', paymentBadgeStyles[registration.paymentStatus])}>
                {registration.paymentStatus}
              </span>
            )}
            {hasAllergies && (
              <span title={`Allergies: ${participant.allergies}`}>
                <AlertTriangle className="h-3.5 w-3.5 text-stage-payment" />
              </span>
            )}
            {hasSpecial && (
              <span title={`Special: ${participant.specialRequests}`}>
                <AlertTriangle className="h-3.5 w-3.5 text-stage-interview" />
              </span>
            )}
          </div>
        </div>

        <p className="mt-2 text-[10px] text-muted-foreground">
          Touched {formatDistanceToNow(new Date(registration.lastTouchedAt), { addSuffix: true })}
        </p>

        {registration.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {registration.tags.map((tag) => (
              <span key={tag} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
        </div>
      </button>
    </div>
  );
}
