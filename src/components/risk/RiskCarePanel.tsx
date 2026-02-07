import { useState } from 'react';
import { Shield, AlertTriangle, Heart, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Registration, RiskLevel, CareFlag, CARE_FLAGS, RISK_LEVEL_STYLES, Task } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  registration: Registration;
  retreatId: string;
}

export default function RiskCarePanel({ registration, retreatId }: Props) {
  const { updateRiskCare, createTask } = useApp();
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(registration.riskLevel);
  const [careFlags, setCareFlags] = useState<CareFlag[]>(registration.careFlags);
  const [careNotes, setCareNotes] = useState(registration.careNotes);
  const [otherText, setOtherText] = useState(registration.careFlagOtherText);
  const [dirty, setDirty] = useState(false);

  const toggleFlag = (flag: CareFlag) => {
    setCareFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
    setDirty(true);
  };

  const handleSave = () => {
    updateRiskCare(registration.id, riskLevel, careFlags, careNotes, otherText);
    setDirty(false);
    toast.success('Risk & Care updated');

    if (riskLevel === 'High') {
      toast.info('Consider creating a follow-up task for this high-risk participant.');
    }
  };

  const handleCreateDefaultTask = () => {
    createTask({
      retreatId,
      registrationId: registration.id,
      title: 'Risk & Care review call / plan',
      description: 'Review care plan and coordinate accommodations for flagged participant.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Open',
      priority: 'High',
    });
    toast.success('Follow-up task created');
  };

  const riskStyle = RISK_LEVEL_STYLES[riskLevel];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5" /> Risk & Care
        </h4>
        {registration.riskLevel !== 'None' && (
          <Badge className={cn('text-[10px]', riskStyle.bg, riskStyle.text)}>
            {registration.riskLevel} Risk
          </Badge>
        )}
      </div>

      <div>
        <Label className="text-xs">Risk Level</Label>
        <Select
          value={riskLevel}
          onValueChange={(v) => { setRiskLevel(v as RiskLevel); setDirty(true); }}
        >
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['None', 'Low', 'Medium', 'High'] as RiskLevel[]).map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Care Flags</Label>
        <div className="grid grid-cols-1 gap-1.5">
          {CARE_FLAGS.map((flag) => (
            <label key={flag} className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={careFlags.includes(flag)}
                onCheckedChange={() => toggleFlag(flag)}
              />
              {flag}
            </label>
          ))}
        </div>
        {careFlags.includes('Other') && (
          <Input
            value={otherText}
            onChange={(e) => { setOtherText(e.target.value); setDirty(true); }}
            placeholder="Specify other care needs..."
            className="mt-2 text-sm"
          />
        )}
      </div>

      <div>
        <Label className="text-xs">Care Notes</Label>
        <Textarea
          value={careNotes}
          onChange={(e) => { setCareNotes(e.target.value); setDirty(true); }}
          placeholder="Detailed care considerations..."
          className="mt-1 h-20 resize-none text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={!dirty} className="flex-1">
          Save Changes
        </Button>
        {riskLevel === 'High' && (
          <Button variant="outline" size="sm" onClick={handleCreateDefaultTask} className="gap-1">
            <Plus className="h-3 w-3" /> Create Task
          </Button>
        )}
      </div>
    </div>
  );
}
