import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, List, Video, Phone } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import AppointmentDialog from './AppointmentDialog';

interface Props {
  retreatId: string;
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Proposed: 'bg-stage-leads-light text-stage-leads border-stage-leads',
  Scheduled: 'bg-stage-chemistry-light text-stage-chemistry border-stage-chemistry',
  Completed: 'bg-stage-approval-light text-stage-approval border-stage-approval',
  NoShow: 'bg-destructive/10 text-destructive border-destructive',
  Canceled: 'bg-secondary text-muted-foreground border-border',
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

export default function RetreatCalendar({ retreatId }: Props) {
  const { getAppointmentsForRetreat, getParticipant, registrations } = useApp();
  const [view, setView] = useState<'week' | 'agenda'>('week');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filterType, setFilterType] = useState<'all' | 'ChemistryCall' | 'Interview'>('all');

  const appointments = useMemo(() => {
    let apts = getAppointmentsForRetreat(retreatId);
    if (filterType !== 'all') {
      apts = apts.filter((a) => a.type === filterType);
    }
    return apts.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [getAppointmentsForRetreat, retreatId, filterType]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const getParticipantName = (apt: Appointment) => {
    const reg = registrations.find((r) => r.id === apt.registrationId);
    if (!reg) return 'Unknown';
    const p = getParticipant(reg.participantId);
    return p?.fullName ?? 'Unknown';
  };

  const getAptForDayHour = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.startDateTime);
      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
            className="gap-1"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Week
          </Button>
          <Button
            variant={view === 'agenda' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('agenda')}
            className="gap-1"
          >
            <List className="h-3.5 w-3.5" /> Agenda
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border p-0.5">
            {(['all', 'ChemistryCall', 'Interview'] as const).map((f) => (
              <Button
                key={f}
                variant={filterType === f ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilterType(f)}
              >
                {f === 'all' ? 'All' : f === 'ChemistryCall' ? 'Chem Calls' : 'Interviews'}
              </Button>
            ))}
          </div>

          <AppointmentDialog retreatId={retreatId} />
        </div>
      </div>

      {/* Week navigation */}
      {view === 'week' && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setWeekStart((prev) => addDays(prev, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart((prev) => addDays(prev, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="overflow-x-auto rounded-lg border">
          <div className="min-w-[700px]">
            {/* Day headers */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-secondary/50">
              <div className="p-2" />
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="border-l p-2 text-center">
                  <p className="text-xs font-medium text-muted-foreground">{format(day, 'EEE')}</p>
                  <p className={cn(
                    'text-sm font-semibold',
                    isSameDay(day, new Date()) ? 'text-primary' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Time grid */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0">
                <div className="flex items-start justify-end p-1 pr-2 text-[10px] text-muted-foreground">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
                {weekDays.map((day) => {
                  const dayApts = getAptForDayHour(day, hour);
                  return (
                    <div key={day.toISOString()} className="min-h-[48px] border-l p-0.5">
                      {dayApts.map((apt) => (
                        <AppointmentDialog
                          key={apt.id}
                          retreatId={retreatId}
                          registrationId={apt.registrationId}
                          existingAppointment={apt}
                          trigger={
                            <button
                              className={cn(
                                'w-full rounded border-l-2 px-1.5 py-1 text-left text-[10px] transition-colors hover:opacity-80',
                                STATUS_COLORS[apt.status]
                              )}
                            >
                              <p className="font-medium truncate">{getParticipantName(apt)}</p>
                              <p className="text-[9px] opacity-70">
                                {apt.type === 'ChemistryCall' ? 'Chem Call' : 'Interview'} · {format(parseISO(apt.startDateTime), 'h:mm a')}
                              </p>
                            </button>
                          }
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda view */}
      {view === 'agenda' && (
        <div className="space-y-2">
          {appointments.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No appointments scheduled.
            </div>
          )}
          {appointments.map((apt) => (
            <AppointmentDialog
              key={apt.id}
              retreatId={retreatId}
              registrationId={apt.registrationId}
              existingAppointment={apt}
              trigger={
                <button className="w-full rounded-lg border bg-card p-3 text-left transition-shadow hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {apt.type === 'ChemistryCall' ? (
                        <Phone className="h-4 w-4 text-stage-chemistry" />
                      ) : (
                        <Video className="h-4 w-4 text-stage-interview" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{getParticipantName(apt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {apt.type === 'ChemistryCall' ? 'Chemistry Call' : 'Interview'}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn('text-[10px]', STATUS_COLORS[apt.status])}>
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {format(parseISO(apt.startDateTime), 'MMM d, yyyy')}
                    </span>
                    <span>
                      {format(parseISO(apt.startDateTime), 'h:mm a')} – {format(parseISO(apt.endDateTime), 'h:mm a')}
                    </span>
                  </div>
                  {apt.notes && (
                    <p className="mt-1 text-xs text-muted-foreground truncate">{apt.notes}</p>
                  )}
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
