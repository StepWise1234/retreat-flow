import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, CalendarDays, Filter } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Task, TASK_PRIORITY_STYLES, RISK_LEVEL_STYLES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  retreatId: string;
}

type TaskFilter = 'overdue' | 'high-priority' | 'high-risk';

export default function RetreatTasksView({ retreatId }: Props) {
  const { getTasksForRetreat, getParticipant, registrations, updateTask } = useApp();
  const [filters, setFilters] = useState<TaskFilter[]>([]);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  const allTasks = getTasksForRetreat(retreatId);

  const tasks = useMemo(() => {
    let filtered = allTasks;

    if (filters.includes('overdue')) {
      filtered = filtered.filter((t) => t.status !== 'Done' && isPast(parseISO(t.dueDate)));
    }
    if (filters.includes('high-priority')) {
      filtered = filtered.filter((t) => t.priority === 'High');
    }
    if (filters.includes('high-risk')) {
      const highRiskRegIds = registrations
        .filter((r) => r.retreatId === retreatId && r.riskLevel === 'High')
        .map((r) => r.id);
      filtered = filtered.filter((t) => highRiskRegIds.includes(t.registrationId));
    }

    return [...filtered].sort((a, b) => {
      if (a.status === 'Done' && b.status !== 'Done') return 1;
      if (a.status !== 'Done' && b.status === 'Done') return -1;
      if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [allTasks, filters, sortBy, registrations, retreatId]);

  const getRegParticipantName = (registrationId: string) => {
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return 'Unknown';
    const p = getParticipant(reg.participantId);
    return p?.fullName ?? 'Unknown';
  };

  const toggleFilter = (f: TaskFilter) => {
    setFilters((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const handleSnooze = (taskId: string, days: number) => {
    const newDue = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    updateTask(taskId, { status: 'Snoozed', dueDate: newDue });
    toast.success(`Snoozed for ${days} day${days > 1 ? 's' : ''}`);
  };

  const openCount = allTasks.filter((t) => t.status !== 'Done').length;
  const overdueCount = allTasks.filter((t) => t.status !== 'Done' && isPast(parseISO(t.dueDate))).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{openCount}</span>
          <span className="text-muted-foreground">open</span>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-medium text-destructive">{overdueCount}</span>
            <span className="text-muted-foreground">overdue</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8">
                <Filter className="h-3.5 w-3.5" /> Filter
                {filters.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {filters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={filters.includes('overdue')} onCheckedChange={() => toggleFilter('overdue')}>
                Overdue
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters.includes('high-priority')} onCheckedChange={() => toggleFilter('high-priority')}>
                High Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters.includes('high-risk')} onCheckedChange={() => toggleFilter('high-risk')}>
                High Risk participants
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline" size="sm" className="h-8 text-xs"
            onClick={() => setSortBy(sortBy === 'dueDate' ? 'priority' : 'dueDate')}
          >
            Sort: {sortBy === 'dueDate' ? 'Due date' : 'Priority'}
          </Button>
        </div>
      </div>

      {/* Task list */}
      {tasks.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No tasks found.
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => {
          const overdue = task.status !== 'Done' && isPast(parseISO(task.dueDate));
          return (
            <div
              key={task.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border bg-card p-3',
                task.status === 'Done' && 'opacity-50',
                overdue && 'border-destructive/30'
              )}
            >
              <button
                className={cn(
                  'mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 transition-colors',
                  task.status === 'Done'
                    ? 'bg-stage-approval border-stage-approval'
                    : 'border-border hover:border-primary'
                )}
                onClick={() => updateTask(task.id, { status: task.status === 'Done' ? 'Open' : 'Done' })}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn('text-sm font-medium text-foreground', task.status === 'Done' && 'line-through')}>
                    {task.title}
                  </p>
                  <Badge className={cn('text-[10px] px-1.5 py-0', TASK_PRIORITY_STYLES[task.priority])}>
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium">{getRegParticipantName(task.registrationId)}</span>
                  <span className={cn('flex items-center gap-0.5', overdue && 'text-destructive')}>
                    <CalendarDays className="h-3 w-3" />
                    Due {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                  </span>
                  {task.status === 'Snoozed' && (
                    <Badge className="text-[9px] bg-stage-leads-light text-stage-leads">Snoozed</Badge>
                  )}
                </div>
              </div>
              {task.status !== 'Done' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleSnooze(task.id, 1)}>
                      Snooze +1 day
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(task.id, 3)}>
                      Snooze +3 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(task.id, 7)}>
                      Snooze +1 week
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
