import { useState } from 'react';
import { CalendarDays, Phone, Video, Check, X, Clock, Copy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Registration, Retreat, Participant, AppointmentStatus } from '@/lib/types';
import { schedulingTemplates, fillTemplate } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import AppointmentDialog from './AppointmentDialog';
import { toast } from 'sonner';

interface Props {
  registration: Registration;
  retreat: Retreat;
  participant: Participant;
}

const STATUS_BADGE: Record<string, string> = {
  NotScheduled: 'bg-secondary text-muted-foreground',
  Proposed: 'bg-stage-leads-light text-stage-leads',
  Scheduled: 'bg-stage-chemistry-light text-stage-chemistry',
  Completed: 'bg-stage-approval-light text-stage-approval',
  NoShow: 'bg-destructive/10 text-destructive',
};

export default function SchedulingPanel({ registration, retreat, participant }: Props) {
  const { getAppointmentsForRegistration, updateAppointment, moveStage } = useApp();
  const [moveAfterComplete, setMoveAfterComplete] = useState(true);

  const appointments = getAppointmentsForRegistration(registration.id);
  const chemCallApt = appointments.find((a) => a.type === 'ChemistryCall' && a.status !== 'Canceled');
  const interviewApt = appointments.find((a) => a.type === 'Interview' && a.status !== 'Canceled');

  const handleMarkStatus = (aptId: string, status: AppointmentStatus, type: 'ChemistryCall' | 'Interview') => {
    updateAppointment(aptId, { status });
    toast.success(`Marked as ${status}`);

    if (status === 'Completed' && moveAfterComplete) {
      if (type === 'ChemistryCall' && registration.currentStage === 'Chemistry Call') {
        moveStage(registration.id, 'Application', 'Chemistry call completed');
        toast.success('Moved to Application');
      } else if (type === 'Interview' && registration.currentStage === 'Interview') {
        moveStage(registration.id, 'Approval', 'Interview completed');
        toast.success('Moved to Approval');
      }
    }
  };

  const handleCopyMessage = async (templateType: 'chemistry-invite' | 'interview-invite' | 'reminder', apt?: typeof chemCallApt) => {
    const tpl = schedulingTemplates.find((t) => t.type === templateType);
    if (!tpl) return;

    const extraVars: Record<string, string> = {
      '{{proposedTimes}}': '[Please add available times]',
      '{{appointmentDateTime}}': apt ? format(parseISO(apt.startDateTime), 'EEEE, MMMM d, yyyy \'at\' h:mm a') : '[TBD]',
      '{{appointmentLink}}': apt?.locationOrLink || '[Add link]',
      '{{appointmentType}}': templateType === 'chemistry-invite' ? 'Chemistry Call' : 'Interview',
    };

    const filled = fillTemplate(tpl, participant, retreat, extraVars);
    await navigator.clipboard.writeText(`Subject: ${filled.subject}\n\n${filled.body}`);
    toast.success('Message copied to clipboard');
  };

  const renderSection = (
    label: string,
    icon: React.ReactNode,
    status: string,
    apt: typeof chemCallApt,
    type: 'ChemistryCall' | 'Interview',
    inviteTemplate: 'chemistry-invite' | 'interview-invite'
  ) => (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <Badge className={cn('text-[10px]', STATUS_BADGE[status])}>
          {status === 'NotScheduled' ? 'Not Scheduled' : status}
        </Badge>
      </div>

      {apt && apt.status === 'Scheduled' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {format(parseISO(apt.startDateTime), 'MMM d, yyyy · h:mm a')}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {(!apt || apt.status === 'Canceled' || apt.status === 'NoShow') && (
          <AppointmentDialog
            retreatId={retreat.id}
            registrationId={registration.id}
            type={type}
            trigger={
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <CalendarDays className="h-3 w-3" /> Schedule
              </Button>
            }
          />
        )}

        {apt && apt.status === 'Scheduled' && (
          <>
            <Button
              variant="outline" size="sm" className="h-7 gap-1 text-xs"
              onClick={() => handleMarkStatus(apt.id, 'Completed', type)}
            >
              <Check className="h-3 w-3" /> Completed
            </Button>
            <Button
              variant="outline" size="sm" className="h-7 gap-1 text-xs"
              onClick={() => handleMarkStatus(apt.id, 'NoShow', type)}
            >
              <X className="h-3 w-3" /> No-Show
            </Button>
            <Button
              variant="outline" size="sm" className="h-7 gap-1 text-xs"
              onClick={() => handleMarkStatus(apt.id, 'Canceled', type)}
            >
              Cancel
            </Button>
          </>
        )}

        <Button
          variant="ghost" size="sm" className="h-7 gap-1 text-xs"
          onClick={() => handleCopyMessage(inviteTemplate, apt)}
        >
          <Copy className="h-3 w-3" /> Copy invite
        </Button>
        {apt && apt.status === 'Scheduled' && (
          <Button
            variant="ghost" size="sm" className="h-7 gap-1 text-xs"
            onClick={() => handleCopyMessage('reminder', apt)}
          >
            <Copy className="h-3 w-3" /> Copy reminder
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Scheduling
        </h4>
        <div className="flex items-center gap-2">
          <Switch
            id="move-after-complete"
            checked={moveAfterComplete}
            onCheckedChange={setMoveAfterComplete}
          />
          <Label htmlFor="move-after-complete" className="text-[10px] text-muted-foreground">
            Auto-advance on complete
          </Label>
        </div>
      </div>

      {renderSection(
        'Chemistry Call',
        <Phone className="h-4 w-4 text-stage-chemistry" />,
        registration.chemistryCallStatus,
        chemCallApt,
        'ChemistryCall',
        'chemistry-invite'
      )}

      {renderSection(
        'Interview',
        <Video className="h-4 w-4 text-stage-interview" />,
        registration.interviewStatus,
        interviewApt,
        'Interview',
        'interview-invite'
      )}
    </div>
  );
}
