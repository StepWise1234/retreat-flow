import { useState, useMemo } from 'react';
import { Copy, ChevronDown, Tag, ArrowRight, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Registration, PipelineStage, PIPELINE_STAGES, Retreat } from '@/lib/types';
import { fillTemplate } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  selectedIds: string[];
  retreatId: string;
  onClear: () => void;
}

export default function BulkActionBar({ selectedIds, retreatId, onClear }: Props) {
  const {
    bulkMoveStage, bulkAddTag, bulkRemoveTag, templates,
    getParticipant, registrations, getRetreat, createTask,
  } = useApp();

  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  // Stage move
  const [targetStage, setTargetStage] = useState<PipelineStage>('Leads');
  const [stageNote, setStageNote] = useState('');

  // Tag
  const [tagAction, setTagAction] = useState<'add' | 'remove'>('add');
  const [tagValue, setTagValue] = useState('');

  // Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const retreat = getRetreat(retreatId);
  const selectedRegs = registrations.filter((r) => selectedIds.includes(r.id));

  const handleBulkMove = () => {
    if (!stageNote.trim() && selectedRegs.some((r) => r.currentStage === 'Payment' || r.currentStage === 'Accommodation Selection' || r.currentStage === 'Online Course Link')) {
      toast.error('A note is required when moving participants from Payment or beyond');
      return;
    }
    bulkMoveStage(selectedIds, targetStage, stageNote || `Bulk moved to ${targetStage}`);
    toast.success(`${selectedIds.length} participant(s) moved to ${targetStage}`);
    setShowStageDialog(false);
    setStageNote('');
    onClear();
  };

  const handleBulkTag = () => {
    if (!tagValue.trim()) { toast.error('Tag is required'); return; }
    if (tagAction === 'add') {
      bulkAddTag(selectedIds, tagValue.trim());
      toast.success(`Tag "${tagValue}" added to ${selectedIds.length} participant(s)`);
    } else {
      bulkRemoveTag(selectedIds, tagValue.trim());
      toast.success(`Tag "${tagValue}" removed from ${selectedIds.length} participant(s)`);
    }
    setShowTagDialog(false);
    setTagValue('');
  };

  const handleBulkTask = () => {
    if (!taskTitle.trim()) { toast.error('Title is required'); return; }
    selectedIds.forEach((regId) => {
      createTask({
        retreatId,
        registrationId: regId,
        title: taskTitle.trim(),
        description: '',
        dueDate: taskDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'Open',
        priority: 'Medium',
      });
    });
    toast.success(`Task created for ${selectedIds.length} participant(s)`);
    setShowTaskDialog(false);
    setTaskTitle('');
  };

  // Generate messages for copy
  const generateMessages = () => {
    if (!retreat) return [];
    return selectedRegs.map((reg) => {
      const participant = getParticipant(reg.participantId);
      if (!participant) return null;
      const template = templates.find((t) => t.stage === reg.currentStage);
      if (!template) return { name: participant.fullName, text: `No template for stage ${reg.currentStage}` };
      const filled = fillTemplate(template, participant, retreat);
      return { name: participant.fullName, text: `Subject: ${filled.subject}\n\n${filled.body}` };
    }).filter(Boolean) as { name: string; text: string }[];
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="sticky bottom-4 z-20 mx-auto w-fit animate-fade-in rounded-lg border bg-card p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            {selectedIds.length} selected
          </Badge>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowMessageDialog(true)}>
            <Copy className="h-3 w-3" /> Messages
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowStageDialog(true)}>
            <ArrowRight className="h-3 w-3" /> Move Stage
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowTagDialog(true)}>
            <Tag className="h-3 w-3" /> Tags
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowTaskDialog(true)}>
            Follow-ups
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClear}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Stage Move Dialog */}
      <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Bulk Move Stage</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Moving {selectedIds.length} participant(s)</p>
            <div>
              <Label>Target Stage</Label>
              <Select value={targetStage} onValueChange={(v) => setTargetStage(v as PipelineStage)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder="Reason for bulk move..."
                className="mt-1 h-16 resize-none text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStageDialog(false)}>Cancel</Button>
              <Button onClick={handleBulkMove}>Move All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Bulk Messages</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline" size="sm" className="w-full gap-1"
              onClick={async () => {
                const msgs = generateMessages();
                const allText = msgs.map((m) => `=== ${m.name} ===\n${m.text}`).join('\n\n---\n\n');
                await navigator.clipboard.writeText(allText);
                toast.success('All messages copied');
              }}
            >
              <Copy className="h-3 w-3" /> Copy All Messages
            </Button>
            {generateMessages().map((msg, i) => (
              <div key={i} className="rounded-md border p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{msg.name}</p>
                  <Button
                    variant="ghost" size="sm" className="h-7 gap-1 text-xs"
                    onClick={async () => {
                      await navigator.clipboard.writeText(msg.text);
                      toast.success(`Message for ${msg.name} copied`);
                    }}
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{msg.text}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Bulk Tag</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={tagAction === 'add' ? 'default' : 'outline'} size="sm"
                onClick={() => setTagAction('add')}
              >Add Tag</Button>
              <Button
                variant={tagAction === 'remove' ? 'default' : 'outline'} size="sm"
                onClick={() => setTagAction('remove')}
              >Remove Tag</Button>
            </div>
            <Input
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              placeholder="Tag name..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTagDialog(false)}>Cancel</Button>
              <Button onClick={handleBulkTag}>{tagAction === 'add' ? 'Add' : 'Remove'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Bulk Follow-up Tasks</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Create a task for {selectedIds.length} participant(s)</p>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title..."
            />
            <Input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
              <Button onClick={handleBulkTask}>Create Tasks</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
