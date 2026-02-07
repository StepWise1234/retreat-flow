import { useState } from 'react';
import { CheckCircle2, Clock, Plus, MoreHorizontal, CalendarDays } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Task, TASK_PRIORITY_STYLES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  registrationId: string;
  retreatId: string;
}

export default function TaskPanel({ registrationId, retreatId }: Props) {
  const { getTasksForRegistration, createTask, updateTask } = useApp();
  const tasks = getTasksForRegistration(registrationId);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const handleCreate = () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    createTask({
      retreatId,
      registrationId,
      title: title.trim(),
      description,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Open',
      priority,
    });
    toast.success('Task created');
    setTitle('');
    setDescription('');
    setDueDate('');
    setShowCreate(false);
  };

  const handleSnooze = (taskId: string, days: number) => {
    const newDue = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    updateTask(taskId, { status: 'Snoozed', dueDate: newDue });
    toast.success(`Snoozed for ${days} day${days > 1 ? 's' : ''}`);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'Done' && b.status !== 'Done') return 1;
    if (a.status !== 'Done' && b.status === 'Done') return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tasks
        </h4>
        <Button
          variant="ghost" size="sm" className="h-7 gap-1 text-xs"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>

      {showCreate && (
        <div className="rounded-md border p-3 space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="text-sm"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description..."
            className="h-12 resize-none text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-sm" />
            </div>
            <div>
              <Label className="text-[10px]">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} className="flex-1">Create</Button>
            <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {sortedTasks.length === 0 && !showCreate && (
        <p className="text-xs text-muted-foreground py-2">No tasks yet.</p>
      )}

      {sortedTasks.map((task) => {
        const overdue = task.status !== 'Done' && isPast(parseISO(task.dueDate));
        return (
          <div
            key={task.id}
            className={cn(
              'flex items-start gap-2 rounded-md border p-2 text-xs',
              task.status === 'Done' && 'opacity-50',
              overdue && 'border-destructive/30'
            )}
          >
            <button
              className={cn(
                'mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 transition-colors',
                task.status === 'Done'
                  ? 'bg-stage-approval border-stage-approval'
                  : 'border-border hover:border-primary'
              )}
              onClick={() => updateTask(task.id, { status: task.status === 'Done' ? 'Open' : 'Done' })}
            />
            <div className="flex-1 min-w-0">
              <p className={cn('font-medium text-foreground', task.status === 'Done' && 'line-through')}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-muted-foreground truncate">{task.description}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <span className={cn('flex items-center gap-0.5', overdue ? 'text-destructive' : 'text-muted-foreground')}>
                  <CalendarDays className="h-3 w-3" />
                  {format(parseISO(task.dueDate), 'MMM d')}
                </span>
                <Badge className={cn('text-[9px] px-1 py-0', TASK_PRIORITY_STYLES[task.priority])}>
                  {task.priority}
                </Badge>
              </div>
            </div>
            {task.status !== 'Done' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleSnooze(task.id, 1)}>
                    <Clock className="mr-2 h-3 w-3" /> Snooze +1 day
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSnooze(task.id, 3)}>
                    <Clock className="mr-2 h-3 w-3" /> Snooze +3 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSnooze(task.id, 7)}>
                    <Clock className="mr-2 h-3 w-3" /> Snooze +1 week
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}
    </div>
  );
}
