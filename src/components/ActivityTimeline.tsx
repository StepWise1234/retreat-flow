import { ActivityEntry } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';

interface Props {
  activities: ActivityEntry[];
}

export default function ActivityTimeline({ activities }: Props) {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map((entry) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
            <div className="w-0.5 flex-1 bg-border" />
          </div>
          <div className="pb-3">
            <p className="text-sm font-medium text-foreground">{entry.action}</p>
            {entry.notes && (
              <p className="mt-0.5 text-xs text-muted-foreground">{entry.notes}</p>
            )}
            <p className="mt-1 text-[10px] text-muted-foreground">
              {format(new Date(entry.date), 'MMM d, yyyy h:mm a')} ·{' '}
              {formatDistanceToNow(new Date(entry.date), { addSuffix: true })} · {entry.performedBy}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
