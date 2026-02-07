import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Retreat, getEnrolledCount, Registration } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
  retreat: Retreat;
  registrations: Registration[];
}

export default function CapacityBanner({ retreat, registrations }: Props) {
  const { updateRetreat } = useApp();
  const enrolled = getEnrolledCount(registrations);
  const isOver = enrolled > retreat.cohortSizeTarget;
  const isFull = retreat.status === 'Full';

  if (!isFull && !isOver) return null;

  return (
    <div
      className={cn(
        'mb-4 flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
        isOver
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-stage-payment/30 bg-stage-payment-light'
      )}
    >
      <div className="flex items-center gap-2">
        {isOver ? (
          <ShieldAlert className="h-5 w-5 flex-shrink-0 text-destructive" />
        ) : (
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-stage-payment" />
        )}
        <div>
          <p className={cn('text-sm font-medium', isOver ? 'text-destructive' : 'text-stage-payment')}>
            {isOver
              ? `Over capacity (${enrolled}/${retreat.cohortSizeTarget})`
              : `This retreat is Full (${enrolled}/${retreat.cohortSizeTarget})`}
          </p>
          <p className="text-xs text-muted-foreground">
            {retreat.capacityOverride
              ? 'Override enabled — new participants can be added.'
              : 'Override to add more participants.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="capacity-override"
          checked={retreat.capacityOverride}
          onCheckedChange={(checked) => updateRetreat(retreat.id, { capacityOverride: checked })}
        />
        <Label htmlFor="capacity-override" className="text-xs text-muted-foreground whitespace-nowrap">
          Override lock
        </Label>
      </div>
    </div>
  );
}
