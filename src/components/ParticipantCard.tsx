import { AlertTriangle, MessageCircle, CreditCard } from 'lucide-react';
import { Registration, Participant, PaymentStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  registration: Registration;
  participant: Participant;
  onClick: () => void;
  isDragging?: boolean;
}

const paymentBadgeStyles: Record<PaymentStatus, string> = {
  Unpaid: 'bg-stage-payment-light text-stage-payment',
  Partial: 'bg-stage-interview-light text-stage-interview',
  Paid: 'bg-stage-approval-light text-stage-approval',
  Refunded: 'bg-destructive/10 text-destructive',
};

export default function ParticipantCard({ registration, participant, onClick, isDragging }: Props) {
  const hasAllergies = participant.allergies.trim().length > 0;
  const hasSpecial = participant.specialRequests.trim().length > 0;
  const showPayment = registration.paymentStatus !== 'Unpaid' || registration.amountDue;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-md border bg-card p-3 text-left transition-shadow hover:shadow-sm',
        isDragging && 'shadow-lg ring-2 ring-primary'
      )}
    >
      <p className="text-sm font-medium text-card-foreground truncate">{participant.fullName}</p>
      <p className="mt-0.5 text-xs text-muted-foreground truncate">{participant.email}</p>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            {participant.signalHandle}
          </span>
        </div>
        <div className="flex items-center gap-1">
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
    </button>
  );
}
