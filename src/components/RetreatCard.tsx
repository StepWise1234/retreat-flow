import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { Retreat, Registration, PIPELINE_STAGES, STAGE_STYLE_MAP, PipelineStage, STATUS_STYLES, getEnrolledCount, getRetreatColor, getEffectiveCapacity, getAvailableSpots } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  retreat: Retreat;
  registrations: Registration[];
  colorIndex?: number;
}

export default function RetreatCard({ retreat, registrations, colorIndex = 0 }: Props) {
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
      className="group relative block animate-fade-in rounded-lg border p-5 pt-6 shadow-sm hover-lift hover-border-glow hover-shimmer hover-rainbow-bar overflow-hidden"
      style={{
        '--retreat-accent-from': retreatColor.from,
        '--retreat-accent-to': retreatColor.to,
        background: `linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card)) 40%, ${retreatColor.from}08 70%, ${retreatColor.to}12 100%)`,
      } as React.CSSProperties}
    >
      {/* Gradient accent bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${retreatColor.from}, ${retreatColor.to})` }}
      />
      {/* Subtle radial glow in corner */}
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full opacity-[0.07] blur-2xl"
        style={{ background: `radial-gradient(circle, ${retreatColor.to}, transparent 70%)` }}
      />
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground hover-rainbow-text transition-colors">
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
        <Badge className={cn('text-xs', STATUS_STYLES[retreat.status])}>
          {retreat.status}
        </Badge>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Enrolled
          </span>
          <span className={cn('font-medium', isOver ? 'text-destructive' : spotsLeft <= 2 ? 'text-stage-chemistry' : 'text-card-foreground')}>
            {enrolled}/{capacity}{retreat.capacityOverride && <span className="ml-0.5 text-[10px] text-muted-foreground">(+3)</span>}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${capacityPct}%`,
              background: isOver
                ? 'hsl(var(--destructive))'
                : `linear-gradient(90deg, ${retreatColor.from}, ${retreatColor.to})`,
              boxShadow: isOver
                ? '0 0 8px hsl(var(--destructive) / 0.4)'
                : `0 0 10px ${retreatColor.from}40, 0 0 4px ${retreatColor.to}30`,
            }}
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
