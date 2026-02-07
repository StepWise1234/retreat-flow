import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Registration, Participant, STAGE_STYLE_MAP, RISK_LEVEL_STYLES } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Props {
  registrations: Registration[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onOpenDetail: (regId: string) => void;
}

const paymentBadgeStyles: Record<string, string> = {
  Unpaid: 'bg-stage-payment-light text-stage-payment',
  Partial: 'bg-stage-interview-light text-stage-interview',
  Paid: 'bg-stage-approval-light text-stage-approval',
  Refunded: 'bg-destructive/10 text-destructive',
};

const schedBadge: Record<string, string> = {
  NotScheduled: '',
  Proposed: 'bg-stage-leads-light text-stage-leads',
  Scheduled: 'bg-stage-chemistry-light text-stage-chemistry',
  Completed: 'bg-stage-approval-light text-stage-approval',
  NoShow: 'bg-destructive/10 text-destructive',
};

export default function ListView({ registrations, selectedIds, onToggleSelect, onSelectAll, onOpenDetail }: Props) {
  const { getParticipant, appointments } = useApp();

  const allSelected = registrations.length > 0 && selectedIds.length === registrations.length;

  const getScheduledDate = (reg: Registration, type: 'ChemistryCall' | 'Interview') => {
    const aptId = type === 'ChemistryCall' ? reg.chemistryCallAppointmentId : reg.interviewAppointmentId;
    if (!aptId) return null;
    const apt = appointments.find((a) => a.id === aptId);
    if (!apt || apt.status === 'Canceled') return null;
    return apt;
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Last Touched</TableHead>
            <TableHead>Chem Call</TableHead>
            <TableHead>Interview</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg) => {
            const p = getParticipant(reg.participantId);
            if (!p) return null;
            const stageStyle = STAGE_STYLE_MAP[reg.currentStage];
            const riskStyle = RISK_LEVEL_STYLES[reg.riskLevel];
            const chemApt = getScheduledDate(reg, 'ChemistryCall');
            const intApt = getScheduledDate(reg, 'Interview');

            return (
              <TableRow key={reg.id} className="cursor-pointer hover:bg-secondary/50">
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(reg.id)}
                    onCheckedChange={() => onToggleSelect(reg.id)}
                  />
                </TableCell>
                <TableCell className="font-medium" onClick={() => onOpenDetail(reg.id)}>
                  {p.fullName}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground" onClick={() => onOpenDetail(reg.id)}>
                  {p.email}
                </TableCell>
                <TableCell onClick={() => onOpenDetail(reg.id)}>
                  <Badge className={cn('text-[10px]', stageStyle.bg, stageStyle.text)}>
                    {reg.currentStage}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground" onClick={() => onOpenDetail(reg.id)}>
                  {format(parseISO(reg.lastTouchedAt), 'MMM d')}
                </TableCell>
                <TableCell onClick={() => onOpenDetail(reg.id)}>
                  {reg.chemistryCallStatus !== 'NotScheduled' && (
                    <div>
                      <Badge className={cn('text-[9px]', schedBadge[reg.chemistryCallStatus])}>
                        {reg.chemistryCallStatus}
                      </Badge>
                      {chemApt && chemApt.status === 'Scheduled' && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {format(parseISO(chemApt.startDateTime), 'MMM d')}
                        </p>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell onClick={() => onOpenDetail(reg.id)}>
                  {reg.interviewStatus !== 'NotScheduled' && (
                    <div>
                      <Badge className={cn('text-[9px]', schedBadge[reg.interviewStatus])}>
                        {reg.interviewStatus}
                      </Badge>
                      {intApt && intApt.status === 'Scheduled' && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {format(parseISO(intApt.startDateTime), 'MMM d')}
                        </p>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell onClick={() => onOpenDetail(reg.id)}>
                  {reg.riskLevel !== 'None' && (
                    <Badge className={cn('text-[9px]', riskStyle.bg, riskStyle.text)}>
                      {reg.riskLevel}
                    </Badge>
                  )}
                </TableCell>
                <TableCell onClick={() => onOpenDetail(reg.id)}>
                  {(reg.paymentStatus !== 'Unpaid' || reg.amountDue) && (
                    <Badge className={cn('text-[9px]', paymentBadgeStyles[reg.paymentStatus])}>
                      {reg.paymentStatus}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
