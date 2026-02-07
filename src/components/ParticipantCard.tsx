import { AlertTriangle, MessageCircle } from 'lucide-react';
import { Registration, Participant } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  registration: Registration;
  participant: Participant;
  onClick: () => void;
  isDragging?: boolean;
}

export default function ParticipantCard({ registration, participant, onClick, isDragging }: Props) {
  const hasAllergies = participant.allergies.trim().length > 0;
  const hasSpecial = participant.specialRequests.trim().length > 0;

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
