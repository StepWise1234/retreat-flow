import { AlertTriangle, ShieldCheck, ShieldAlert, Clock, Users } from 'lucide-react';
import { Retreat, Registration, getEnrolledCount, getEffectiveCapacity, getAvailableSpots, getInProgressRegistrations, DEFAULT_CAPACITY, OVERRIDE_CAPACITY } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  retreat: Retreat;
  registrations: Registration[];
}

export default function CapacityBanner({ retreat, registrations }: Props) {
  const { updateRetreat, getParticipant } = useApp();
  const enrolled = getEnrolledCount(registrations);
  const capacity = getEffectiveCapacity(retreat);
  const spotsLeft = getAvailableSpots(retreat, registrations);
  const isOver = enrolled > capacity;
  const isFull = retreat.status === 'Full';
  const inProgress = getInProgressRegistrations(registrations);
  const showLowSpots = spotsLeft <= 2 && spotsLeft > 0 && inProgress.length > 0;
  const showFull = isFull || isOver;

  return (
    <div className="space-y-3 mb-4">
      {/* Capacity override toggle — always visible */}
      <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-card">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {enrolled}/{capacity} enrolled
              {retreat.capacityOverride && (
                <span className="ml-1.5 text-xs text-muted-foreground">(override: {OVERRIDE_CAPACITY} max)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Default max: {DEFAULT_CAPACITY} · Override allows up to {OVERRIDE_CAPACITY}
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
            Extend to {OVERRIDE_CAPACITY}
          </Label>
        </div>
      </div>

      {/* Full/Over capacity alert */}
      {showFull && (
        <div
          className={cn(
            'flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
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
            <p className={cn('text-sm font-medium', isOver ? 'text-destructive' : 'text-stage-payment')}>
              {isOver
                ? `Over capacity (${enrolled}/${capacity})`
                : `This retreat is Full (${enrolled}/${capacity})`}
            </p>
          </div>
        </div>
      )}

      {/* Low-spots urgency alert */}
      {showLowSpots && !showFull && (
        <div className="rounded-lg border border-stage-chemistry/30 bg-stage-chemistry-light p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 flex-shrink-0 text-stage-chemistry" />
            <p className="text-sm font-medium text-stage-chemistry">
              Only {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} remaining — {inProgress.length} participant{inProgress.length === 1 ? '' : 's'} still in progress
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {inProgress.map((reg) => {
              const p = getParticipant(reg.participantId);
              if (!p) return null;
              return (
                <Badge
                  key={reg.id}
                  variant="outline"
                  className="text-xs border-stage-chemistry/40 text-stage-chemistry bg-card/50"
                >
                  {p.fullName} · {reg.currentStage}
                </Badge>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Consider reaching out to move these participants forward before spots fill up.
          </p>
        </div>
      )}
    </div>
  );
}
