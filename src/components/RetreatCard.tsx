import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Retreat, Registration, PIPELINE_STAGES, STAGE_STYLE_MAP, PipelineStage, STATUS_STYLES, getEnrolledCount, getRetreatColor, getEffectiveCapacity, getAvailableSpots } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Props {
  retreat: Retreat;
  registrations: Registration[];
  colorIndex?: number;
  showOnApplication?: boolean | null;
  onToggleVisibility?: () => void;
  isToggling?: boolean;
}

export default function RetreatCard({ retreat, registrations, colorIndex = 0, showOnApplication, onToggleVisibility, isToggling }: Props) {
  const enrolled = getEnrolledCount(registrations);
  const capacity = getEffectiveCapacity(retreat);
  const spotsLeft = getAvailableSpots(retreat, registrations);
  const retreatColor = getRetreatColor(colorIndex);

  const stageCounts = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = registrations.filter((r) => r.currentStage === stage).length;
      return acc;
    },
    {} as Record<PipelineStage, number>
  );

  const capacityPct = Math.min(100, Math.round((enrolled / capacity) * 100));
  const isOver = enrolled > capacity;

  return (
    <Link
      to={`/retreat/${retreat.id}`}
      className="group relative block animate-fade-in rounded-lg border bg-card p-5 pt-6 shadow-sm hover-lift overflow-hidden"
      style={{ '--retreat-accent-from': retreatColor.from, '--retreat-accent-to': retreatColor.to } as React.CSSProperties}
    >
      {/* Gradient accent bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-80"
        style={{ background: `linear-gradient(90deg, ${retreatColor.from}, ${retreatColor.to})` }}
      />
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {retreat.retreatName}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {retreat.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(retreat.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showOnApplication !== null && showOnApplication !== undefined && onToggleVisibility && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility(); }}
                  disabled={isToggling}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
                    showOnApplication
                      ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                      : 'border-border bg-secondary text-muted-foreground hover:bg-secondary/80',
                    isToggling && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {showOnApplication ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {showOnApplication ? 'Visible on application' : 'Hidden from application'}
              </TooltipContent>
            </Tooltip>
          )}
          <Badge className={cn('text-xs', STATUS_STYLES[retreat.status])}>
            {retreat.status}
          </Badge>
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Enrolled
          </span>
          <span className={cn('font-medium', isOver ? 'text-destructive' : spotsLeft <= 2 ? 'text-stage-chemistry' : 'text-card-foreground')}>
            {enrolled}/{capacity}{retreat.capacityOverride && <span className="ml-0.5 text-[10px] text-muted-foreground">(+3)</span>}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isOver ? 'bg-destructive' : retreat.status === 'Full' ? 'bg-stage-payment' : 'bg-primary'
            )}
            style={{ width: `${capacityPct}%` }}
          />
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="flex flex-wrap gap-1.5">
        {PIPELINE_STAGES.map((stage) => {
          const count = stageCounts[stage];
          if (count === 0) return null;
          const style = STAGE_STYLE_MAP[stage];
          return (
            <span
              key={stage}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                style.bg,
                style.text
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
              {count}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open board <ArrowRight className="ml-1 h-3 w-3" />
      </div>
    </Link>
  );
}
