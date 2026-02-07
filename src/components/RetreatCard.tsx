import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { Retreat, Registration, PIPELINE_STAGES, STAGE_STYLE_MAP, PipelineStage } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  retreat: Retreat;
  registrations: Registration[];
}

const statusStyles: Record<string, string> = {
  Open: 'bg-stage-approval-light text-stage-approval',
  Draft: 'bg-secondary text-muted-foreground',
  Closed: 'bg-stage-leads-light text-stage-leads',
};

export default function RetreatCard({ retreat, registrations }: Props) {
  const enrolled = registrations.filter(
    (r) => PIPELINE_STAGES.indexOf(r.currentStage) >= PIPELINE_STAGES.indexOf('Payment')
  ).length;

  const stageCounts = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = registrations.filter((r) => r.currentStage === stage).length;
      return acc;
    },
    {} as Record<PipelineStage, number>
  );

  const capacityPct = Math.min(100, Math.round((enrolled / retreat.cohortSizeTarget) * 100));

  return (
    <Link
      to={`/retreat/${retreat.id}`}
      className="group block animate-fade-in rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
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
        <Badge className={cn('text-xs', statusStyles[retreat.status])}>
          {retreat.status}
        </Badge>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Enrolled
          </span>
          <span className="font-medium text-card-foreground">
            {enrolled}/{retreat.cohortSizeTarget}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
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
