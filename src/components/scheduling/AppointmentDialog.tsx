import { useState } from 'react';
import { CalendarDays, Clock, Video, Plus, Check, X, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Appointment, AppointmentType, AppointmentStatus, Registration, Participant, Retreat } from '@/lib/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Props {
  retreatId: string;
  registrationId?: string;
  type?: AppointmentType;
  existingAppointment?: Appointment;
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

export default function AppointmentDialog({ retreatId, registrationId, type, existingAppointment, trigger, onCreated }: Props) {
  const { createAppointment, updateAppointment, getRegistrationsForRetreat, getParticipant } = useApp();
  const [open, setOpen] = useState(false);

  const isEdit = !!existingAppointment;

  const [selectedRegId, setSelectedRegId] = useState(registrationId || existingAppointment?.registrationId || '');
  const [aptType, setAptType] = useState<AppointmentType>(type || existingAppointment?.type || 'ChemistryCall');
  const [date, setDate] = useState(existingAppointment ? existingAppointment.startDateTime.split('T')[0] : '');
  const [startTime, setStartTime] = useState(existingAppointment ? existingAppointment.startDateTime.split('T')[1]?.slice(0, 5) : '');
  const [duration, setDuration] = useState('30');
  const [locationOrLink, setLocationOrLink] = useState(existingAppointment?.locationOrLink || '');
  const [notes, setNotes] = useState(existingAppointment?.notes || '');
  const [status, setStatus] = useState<AppointmentStatus>(existingAppointment?.status || 'Scheduled');

  const regs = getRegistrationsForRetreat(retreatId);

  const handleSubmit = () => {
    if (!selectedRegId) { toast.error('Select a participant'); return; }
    if (!date || !startTime) { toast.error('Date and time are required'); return; }

    const startDateTime = `${date}T${startTime}:00Z`;
    const durationMs = parseInt(duration) * 60 * 1000;
    const endDateTime = new Date(new Date(startDateTime).getTime() + durationMs).toISOString();

    if (isEdit && existingAppointment) {
      updateAppointment(existingAppointment.id, {
        startDateTime,
        endDateTime,
        locationOrLink,
        notes,
        status,
      });
      toast.success('Appointment updated');
    } else {
      createAppointment({
        retreatId,
        registrationId: selectedRegId,
        type: aptType,
        startDateTime,
        endDateTime,
        timezone: 'America/Los_Angeles',
        status,
        locationOrLink,
        notes,
      });
      toast.success(`${aptType === 'ChemistryCall' ? 'Chemistry Call' : 'Interview'} scheduled`);
    }

    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!registrationId && (
            <div>
              <Label>Participant</Label>
              <Select value={selectedRegId} onValueChange={setSelectedRegId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select participant" /></SelectTrigger>
                <SelectContent>
                  {regs.map((reg) => {
                    const p = getParticipant(reg.participantId);
                    return (
                      <SelectItem key={reg.id} value={reg.id}>
                        {p?.fullName ?? 'Unknown'} — {reg.currentStage}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Type</Label>
            <Select value={aptType} onValueChange={(v) => setAptType(v as AppointmentType)} disabled={isEdit}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ChemistryCall">Chemistry Call</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="20">20 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proposed">Proposed</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="NoShow">No-Show</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Link / Location</Label>
            <Input
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="mt-1 h-16 resize-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {isEdit ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
