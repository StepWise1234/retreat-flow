import { useState } from 'react';
import { Copy, ArrowRight, Check, FileText, Phone, Mail, CreditCard, Home, BookOpen, ClipboardCheck } from 'lucide-react';
import { PipelineStage, getNextStage, Registration, Participant, Retreat, isEnrolledStage, getStageIndex } from '@/lib/types';
import { MessageTemplate } from '@/lib/types';
import { fillTemplate } from '@/lib/templates';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  registration: Registration;
  participant: Participant;
  retreat: Retreat;
}

interface StageAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activityLog: string;
  movesForward: boolean;
  isPaymentAction?: boolean;
  isRefundAction?: boolean;
}

const STAGE_ACTIONS: Record<PipelineStage, StageAction[]> = {
  'Leads': [
    { label: 'Send Chemistry Call link', icon: Phone, activityLog: 'Chemistry call link sent', movesForward: true },
  ],
  'Chemistry Call': [
    { label: 'Send Application link', icon: FileText, activityLog: 'Application link sent', movesForward: true },
  ],
  'Application': [
    { label: 'Mark Application received', icon: ClipboardCheck, activityLog: 'Application received', movesForward: false },
    { label: 'Schedule Interview', icon: Phone, activityLog: 'Interview scheduled', movesForward: true },
  ],
  'Interview': [
    { label: 'Record Interview notes', icon: FileText, activityLog: 'Interview notes recorded', movesForward: false },
    { label: 'Approve & Send Payment link', icon: Check, activityLog: 'Approved and payment link sent', movesForward: true },
  ],
  'Payment': [
    { label: 'Mark Paid', icon: Check, activityLog: 'Payment confirmed', movesForward: false, isPaymentAction: true },
    { label: 'Send Accommodation link', icon: Home, activityLog: 'Accommodation selection link sent', movesForward: true },
    { label: 'Mark Refunded', icon: CreditCard, activityLog: 'Payment refunded', movesForward: false, isRefundAction: true },
  ],
  'Accommodation Selection': [
    { label: 'Record selection', icon: ClipboardCheck, activityLog: 'Accommodation selection recorded', movesForward: false },
    { label: 'Send Online Course link', icon: BookOpen, activityLog: 'Online course link sent', movesForward: true },
  ],
  'Online Course Link': [
    { label: 'Mark course link sent', icon: Mail, activityLog: 'Course link confirmed sent', movesForward: false },
    { label: 'Complete onboarding', icon: Check, activityLog: 'Onboarding checklist completed', movesForward: false },
  ],
};

export default function AutomationPanel({ registration, participant, retreat }: Props) {
  const { moveStage, addActivity, templates, updatePaymentInfo } = useApp();
  const [moveToNext, setMoveToNext] = useState(true);
  const [actionNote, setActionNote] = useState('');

  const currentStage = registration.currentStage;
  const nextStage = getNextStage(currentStage);
  const actions = STAGE_ACTIONS[currentStage];

  const template = templates.find((t) => t.stage === currentStage);
  const filledTemplate = template ? fillTemplate(template, participant, retreat) : null;

  const handleAction = (action: StageAction) => {
    // Handle payment-specific actions
    if (action.isPaymentAction) {
      updatePaymentInfo(
        registration.id,
        'Paid',
        registration.amountDue,
        registration.amountDue ?? registration.amountPaid
      );
      toast.success('Payment marked as paid');
    } else if (action.isRefundAction) {
      if (!actionNote.trim()) {
        toast.error('A note is required when refunding');
        return;
      }
      updatePaymentInfo(registration.id, 'Refunded', registration.amountDue, 0);
      toast.success('Payment marked as refunded');
    } else {
      addActivity(registration.id, action.activityLog, actionNote);
    }

    if (action.movesForward && moveToNext && nextStage) {
      moveStage(registration.id, nextStage, actionNote || action.activityLog);
      toast.success(`Moved to ${nextStage}`);
    } else if (!action.isPaymentAction && !action.isRefundAction) {
      toast.success(action.activityLog);
    }

    setActionNote('');
  };

  const handleCopyMessage = async () => {
    if (!filledTemplate) return;
    const text = `Subject: ${filledTemplate.subject}\n\n${filledTemplate.body}`;
    await navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard');
  };

  // Show retreat-specific links
  const retreatLinks: { label: string; url: string }[] = [];
  if (currentStage === 'Leads' && retreat.chemistryCallLink) {
    retreatLinks.push({ label: 'Chemistry Call Link', url: retreat.chemistryCallLink });
  }
  if (currentStage === 'Chemistry Call' && retreat.applicationLink) {
    retreatLinks.push({ label: 'Application Link', url: retreat.applicationLink });
  }
  if (currentStage === 'Interview' && retreat.paymentLink) {
    retreatLinks.push({ label: 'Payment Link', url: retreat.paymentLink });
  }
  if (currentStage === 'Payment' && retreat.accommodationSelectionLink) {
    retreatLinks.push({ label: 'Accommodation Link', url: retreat.accommodationSelectionLink });
  }
  if (currentStage === 'Accommodation Selection' && retreat.onlineCourseLink) {
    retreatLinks.push({ label: 'Course Link', url: retreat.onlineCourseLink });
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Next Steps</h4>

      {/* Retreat-specific links */}
      {retreatLinks.length > 0 && (
        <div className="space-y-1">
          {retreatLinks.map((link) => (
            <div key={link.label} className="rounded-md bg-secondary p-2">
              <p className="text-[10px] font-medium text-muted-foreground">{link.label}</p>
              <p className="text-xs text-primary truncate">{link.url}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => handleAction(action)}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
            {action.movesForward && nextStage && (
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        ))}
      </div>

      {/* Move toggle */}
      {nextStage && (
        <div className="flex items-center gap-2 rounded-md bg-secondary p-2">
          <Switch
            id="move-next"
            checked={moveToNext}
            onCheckedChange={setMoveToNext}
          />
          <Label htmlFor="move-next" className="text-xs text-muted-foreground">
            Also move to <span className="font-medium text-foreground">{nextStage}</span>
          </Label>
        </div>
      )}

      {/* Note input */}
      <Textarea
        placeholder="Add a note for this action..."
        value={actionNote}
        onChange={(e) => setActionNote(e.target.value)}
        className="h-16 resize-none text-sm"
      />

      {/* Copy message */}
      {filledTemplate && (
        <div className="rounded-md border p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Message Template</p>
            <Button variant="ghost" size="sm" onClick={handleCopyMessage} className="h-7 gap-1 text-xs">
              <Copy className="h-3 w-3" /> Copy
            </Button>
          </div>
          <p className="text-xs font-medium text-foreground">{filledTemplate.subject}</p>
          <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground line-clamp-4">
            {filledTemplate.body}
          </p>
        </div>
      )}
    </div>
  );
}
