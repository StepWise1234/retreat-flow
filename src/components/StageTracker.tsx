import { Check } from 'lucide-react';
import { PIPELINE_STAGES, PipelineStage, STAGE_STYLE_MAP, getStageIndex } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  currentStage: PipelineStage;
}

export default function StageTracker({ currentStage }: Props) {
  const currentIdx = getStageIndex(currentStage);

  return (
    <div className="space-y-0">
      {PIPELINE_STAGES.map((stage, idx) => {
        const style = STAGE_STYLE_MAP[stage];
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <div key={stage} className="flex items-start gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  isComplete && `${style.dot} border-transparent text-card`,
                  isCurrent && `border-primary bg-primary text-primary-foreground`,
                  isFuture && 'border-border bg-card text-muted-foreground'
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 h-6',
                    idx < currentIdx ? style.dot : 'bg-border'
                  )}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium leading-tight',
                  isCurrent && 'text-primary',
                  isComplete && 'text-foreground',
                  isFuture && 'text-muted-foreground'
                )}
              >
                {stage}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
