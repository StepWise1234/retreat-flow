import { useState } from 'react';
import { Home } from 'lucide-react';
import { Registration, Retreat, AccommodationOption } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Props {
  registration: Registration;
  retreat: Retreat;
}

export default function AccommodationSelector({ registration, retreat }: Props) {
  const { updateAccommodation } = useApp();
  const [choice, setChoice] = useState(registration.accommodationChoice || '');
  const [notes, setNotes] = useState(registration.accommodationNotes || '');

  const options = retreat.accommodationOptions;
  const selectedOption = options.find((o) => o.label === choice);

  if (options.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-3 text-center">
        <Home className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="mt-1 text-xs text-muted-foreground">No accommodation options configured for this retreat.</p>
      </div>
    );
  }

  const handleSave = () => {
    updateAccommodation(registration.id, choice, selectedOption?.priceAdjustment, notes);
    toast.success('Accommodation saved');
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Accommodation Choice</Label>
        <Select value={choice} onValueChange={setChoice}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select accommodation" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.label} value={opt.label}>
                <div>
                  <span className="font-medium">{opt.label}</span>
                  {opt.priceAdjustment != null && opt.priceAdjustment > 0 && (
                    <span className="ml-2 text-muted-foreground">(+${opt.priceAdjustment})</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedOption && (
          <p className="mt-1 text-xs text-muted-foreground">{selectedOption.description}</p>
        )}
      </div>

      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Room preferences, special needs..."
          className="mt-1 h-16 resize-none text-sm"
        />
      </div>

      <Button size="sm" onClick={handleSave} disabled={!choice} className="w-full">
        Save Accommodation
      </Button>
    </div>
  );
}
