import { useState } from 'react';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getEnrolledCount } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  retreatId: string;
}

export default function QuickAddLeadDialog({ retreatId }: Props) {
  const { addQuickLead, getRetreat, getRegistrationsForRetreat, addActivity } = useApp();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [signalHandle, setSignalHandle] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const retreat = getRetreat(retreatId);
  const regs = getRegistrationsForRetreat(retreatId);
  const enrolled = getEnrolledCount(regs);

  const isFull = retreat?.status === 'Full';
  const isOverCapacity = retreat ? enrolled > retreat.cohortSizeTarget : false;
  const canAdd = !isFull || retreat?.capacityOverride;
  const isClosed = retreat?.status === 'Closed' || retreat?.status === 'Archived';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (isFull && retreat?.capacityOverride && !overrideReason.trim()) {
      toast.error('A reason is required when adding to a full retreat');
      return;
    }
    if (isOverCapacity && !overrideReason.trim()) {
      toast.error('A reason is required when over capacity');
      return;
    }

    addQuickLead(retreatId, fullName.trim(), email.trim(), signalHandle.trim());
    toast.success(`${fullName} added as a lead`);
    setFullName('');
    setEmail('');
    setSignalHandle('');
    setOverrideReason('');
    setOpen(false);
  };

  if (isClosed) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5" disabled={!canAdd}>
          <UserPlus className="h-4 w-4" /> Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Lead</DialogTitle>
        </DialogHeader>

        {(isFull || isOverCapacity) && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {isOverCapacity
                  ? `Over capacity (${enrolled}/${retreat?.cohortSizeTarget})`
                  : `Retreat is Full (${enrolled}/${retreat?.cohortSizeTarget})`}
              </p>
              <p className="text-xs mt-0.5">A reason note is required to add participants.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="lead-name">Full Name *</Label>
            <Input
              id="lead-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <Label htmlFor="lead-email">Email *</Label>
            <Input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <Label htmlFor="lead-signal">Signal Handle</Label>
            <Input
              id="lead-signal"
              value={signalHandle}
              onChange={(e) => setSignalHandle(e.target.value)}
              placeholder="@jane_doe"
            />
          </div>

          {(isFull || isOverCapacity) && (
            <div>
              <Label htmlFor="override-reason">Reason for Override *</Label>
              <Textarea
                id="override-reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Why are you adding a participant to this full retreat?"
                className="h-16 resize-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
