import { X, MessageCircle, Mail, AlertTriangle } from 'lucide-react';
import { Registration, Participant, Retreat, isEnrolledStage } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import StageTracker from './StageTracker';
import AutomationPanel from './AutomationPanel';
import ActivityTimeline from './ActivityTimeline';
import AccommodationSelector from './AccommodationSelector';
import FinancialSummary from './FinancialSummary';
import { useState, useEffect } from 'react';

interface Props {
  registrationId: string | null;
  onClose: () => void;
}

export default function ParticipantDetailSheet({ registrationId, onClose }: Props) {
  const { registrations, getParticipant, getRetreat, updateOpsNotes } = useApp();

  const registration = registrations.find((r) => r.id === registrationId);
  const participant = registration ? getParticipant(registration.participantId) : undefined;
  const retreat = registration ? getRetreat(registration.retreatId) : undefined;

  const [localNotes, setLocalNotes] = useState('');

  useEffect(() => {
    if (registration) setLocalNotes(registration.opsNotes);
  }, [registration]);

  if (!registration || !participant || !retreat) {
    return (
      <Sheet open={!!registrationId} onOpenChange={() => onClose()}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader><SheetTitle>Participant not found</SheetTitle></SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const showAccommodation = isEnrolledStage(registration.currentStage);
  const showFinancial = isEnrolledStage(registration.currentStage) || registration.amountDue;

  return (
    <Sheet open={!!registrationId} onOpenChange={() => onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {/* Header */}
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">{participant.fullName}</SheetTitle>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {participant.email}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" /> {participant.signalHandle}
            </span>
          </div>

          {(participant.allergies || participant.specialRequests) && (
            <div className="mt-2 space-y-1">
              {participant.allergies && (
                <div className="flex items-start gap-1.5 rounded-md bg-stage-payment-light p-2 text-xs">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-stage-payment" />
                  <span><strong>Allergies:</strong> {participant.allergies}</span>
                </div>
              )}
              {participant.specialRequests && (
                <div className="flex items-start gap-1.5 rounded-md bg-stage-interview-light p-2 text-xs">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-stage-interview" />
                  <span><strong>Special Requests:</strong> {participant.specialRequests}</span>
                </div>
              )}
            </div>
          )}
        </SheetHeader>

        <Separator />

        {/* Body — two sections */}
        <div className="grid gap-6 py-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pipeline Progress
            </h4>
            <StageTracker currentStage={registration.currentStage} />
          </div>

          <div>
            <AutomationPanel
              registration={registration}
              participant={participant}
              retreat={retreat}
            />
          </div>
        </div>

        <Separator />

        {/* Financial Summary */}
        {showFinancial && (
          <>
            <div className="py-4">
              <FinancialSummary registration={registration} />
            </div>
            <Separator />
          </>
        )}

        {/* Accommodation */}
        {showAccommodation && (
          <>
            <div className="py-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Accommodation
              </h4>
              <AccommodationSelector registration={registration} retreat={retreat} />
            </div>
            <Separator />
          </>
        )}

        {/* Ops Notes */}
        <div className="py-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ops Notes
          </h4>
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={() => updateOpsNotes(registration.id, localNotes)}
            placeholder="Add internal notes..."
            className="h-20 resize-none text-sm"
          />
        </div>

        <Separator />

        {/* Activity Timeline */}
        <div className="py-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Activity Log
          </h4>
          <ActivityTimeline activities={registration.activities} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
