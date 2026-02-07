import { useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Retreat, RetreatStatus, AccommodationOption } from '@/lib/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CreateRetreatWizard() {
  const { retreats, createRetreat } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1
  const now = new Date();
  const nextMonth = now.getMonth() + 1;
  const [month, setMonth] = useState(nextMonth > 11 ? 0 : nextMonth);
  const [year, setYear] = useState(nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear());
  const [location, setLocation] = useState('');
  const [target, setTarget] = useState(9);

  // Step 2
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<RetreatStatus>('Draft');

  // Step 3
  const [copyFrom, setCopyFrom] = useState('');

  const retreatName = `${MONTHS[month]} ${year} – ${location || 'Location'}`;

  // Last 12 retreats for copy
  const recentRetreats = retreats.slice(-12);

  const handleCreate = () => {
    if (!location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Start and end dates are required');
      return;
    }

    const sourceRetreat = copyFrom ? retreats.find((r) => r.id === copyFrom) : null;

    const newRetreat: Omit<Retreat, 'id'> = {
      retreatName,
      startDate,
      endDate,
      location: location.trim(),
      cohortSizeTarget: target,
      status,
      notes: sourceRetreat?.notes || '',
      capacityOverride: false,
      autoMarkFull: true,
      autoReopenWhenBelowCapacity: true,
      chemistryCallLink: sourceRetreat?.chemistryCallLink || '',
      applicationLink: sourceRetreat?.applicationLink || '',
      paymentLink: sourceRetreat?.paymentLink || '',
      accommodationSelectionLink: sourceRetreat?.accommodationSelectionLink || '',
      onlineCourseLink: sourceRetreat?.onlineCourseLink || '',
      accommodationOptions: sourceRetreat?.accommodationOptions || [],
    };

    createRetreat(newRetreat);
    toast.success(`"${retreatName}" created!`);
    resetAndClose();
  };

  const resetAndClose = () => {
    setOpen(false);
    setStep(1);
    setLocation('');
    setTarget(9);
    setStartDate('');
    setEndDate('');
    setStatus('Draft');
    setCopyFrom('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" /> Create Retreat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Retreat – Step {step} of 4</DialogTitle>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Month</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1"
                  min={2024}
                  max={2030}
                />
              </div>
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Big Sur, California"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Cohort Target</Label>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="mt-1"
                min={1}
                max={20}
              />
              <p className="mt-1 text-xs text-muted-foreground">Recommended: 6–9 participants</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Name preview: <span className="font-medium text-foreground">{retreatName}</span>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Initial Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RetreatStatus)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft (hidden from dashboard)</SelectItem>
                  <SelectItem value="Open">Open (visible, accepting participants)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Copy Settings From</Label>
              <Select value={copyFrom} onValueChange={setCopyFrom}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="None (start fresh)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (start fresh)</SelectItem>
                  {recentRetreats.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.retreatName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Copies: templates, default links, accommodation options, and notes.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Confirm Retreat</h4>
            <div className="rounded-md border p-3 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {retreatName}</p>
              <p><span className="text-muted-foreground">Dates:</span> {startDate} → {endDate}</p>
              <p><span className="text-muted-foreground">Location:</span> {location}</p>
              <p><span className="text-muted-foreground">Target:</span> {target} participants</p>
              <p><span className="text-muted-foreground">Status:</span> {status}</p>
              {copyFrom && copyFrom !== 'none' && (
                <p><span className="text-muted-foreground">Copied from:</span> {retreats.find((r) => r.id === copyFrom)?.retreatName}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => step === 1 ? resetAndClose() : setStep(step - 1)}
            className="gap-1"
          >
            {step === 1 ? 'Cancel' : <><ChevronLeft className="h-4 w-4" /> Back</>}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate} className="gap-1">
              <Check className="h-4 w-4" /> Create Retreat
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
