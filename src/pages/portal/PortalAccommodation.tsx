import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, ExternalLink, BedDouble, UtensilsCrossed, Accessibility } from 'lucide-react';
import { toast } from 'sonner';
import { useApplication } from '@/hooks/useApplication';
import { cn } from '@/lib/utils';

const DIETARY_OPTIONS = ['Gluten Free', 'Dairy Free', 'Vegetarian', 'Vegan', 'Other Allergy'];

const DIETARY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  'Gluten Free':   { bg: '#FFA500', border: '#FFA500', text: '#FFA500', glow: 'rgba(255,165,0,0.15)' },
  'Dairy Free':    { bg: '#FF4500', border: '#FF4500', text: '#FF4500', glow: 'rgba(255,69,0,0.15)' },
  'Vegetarian':    { bg: '#22C55E', border: '#22C55E', text: '#22C55E', glow: 'rgba(34,197,94,0.15)' },
  'Vegan':         { bg: '#800080', border: '#800080', text: '#800080', glow: 'rgba(128,0,128,0.15)' },
  'Other Allergy': { bg: '#3B82F6', border: '#3B82F6', text: '#3B82F6', glow: 'rgba(59,130,246,0.15)' },
};

function DietaryPill({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  const colors = DIETARY_COLORS[label] || DIETARY_COLORS['Other Allergy'];
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium cursor-pointer transition-all duration-300 border',
        checked
          ? 'text-foreground'
          : 'border-foreground/10 bg-foreground/[0.02] text-foreground/50 hover:border-foreground/20',
      )}
      style={checked ? {
        borderColor: colors.border,
        backgroundColor: colors.glow,
        boxShadow: `0 0 16px ${colors.glow}`,
      } : undefined}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
        )}
        style={{
          borderColor: checked ? colors.border : 'hsl(var(--foreground) / 0.2)',
          backgroundColor: checked ? colors.bg : 'transparent',
        }}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      {label}
    </motion.button>
  );
}

export default function PortalAccommodation() {
  const { application, isLoading, updateApplication } = useApplication();
  const [bedroomChoice, setBedroomChoice] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [dietaryOther, setDietaryOther] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [specialAccommodations, setSpecialAccommodations] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setBedroomChoice(application.bedroom_choice || '');
      setDietaryPreferences(Array.isArray(application.dietary_preferences) ? application.dietary_preferences as string[] : []);
      setDietaryOther(application.dietary_other || '');
      setDietaryNotes(application.dietary_notes || '');
      setSpecialAccommodations(application.special_accommodations || '');
    }
  }, [application]);

  const toggleDietary = (item: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApplication.mutateAsync({
        bedroom_choice: bedroomChoice,
        dietary_preferences: dietaryPreferences,
        dietary_other: dietaryOther,
        dietary_notes: dietaryNotes,
        special_accommodations: specialAccommodations,
      });
      toast.success('Accommodation preferences saved');
    } catch {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  if (isLoading) {
    return <div className="text-center py-20 text-foreground/40">Loading…</div>;
  }

  if (!application) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-xl text-foreground/60">No application found</p>
        <p className="text-foreground/40">Your accommodation options will appear here once your application is linked.</p>
      </div>
    );
  }

  const vrboUrl = application.vrbo_listing_url;

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/85">
            Accommodation
          </h1>
          <p className="mt-1 text-foreground/45">
            Choose your bedroom, set dietary preferences, and note any special needs.
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white text-sm transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #FFA500, #FF4500)',
            boxShadow: '0 4px 14px rgba(255, 69, 0, 0.2)',
          }}
        >
          {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save'}
        </motion.button>
      </div>

      <div className="space-y-8">
        {/* VRBO Listing */}
        <motion.div
          className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FF4500]/10">
                <BedDouble className="h-5 w-5 text-[#FF4500]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground/80">Choose Your Bedroom</h2>
                <p className="text-sm text-foreground/40">Browse the listing below and tell us which room you'd like.</p>
              </div>
            </div>

            {vrboUrl ? (
              <a
                href={vrboUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[#FF4500] border border-[#FF4500]/20 bg-[#FF4500]/5 hover:bg-[#FF4500]/10 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                View VRBO Listing
              </a>
            ) : (
              <p className="text-sm text-foreground/35 italic">
                The VRBO listing link will be added by your coordinator soon.
              </p>
            )}

            <div>
              <label className="block text-xs font-medium text-foreground/45 mb-1.5 uppercase tracking-wider">
                Your Bedroom Choice
              </label>
              <input
                value={bedroomChoice}
                onChange={(e) => setBedroomChoice(e.target.value)}
                placeholder="e.g. Master bedroom, Room 2, etc."
                className="w-full rounded-lg border border-foreground/10 bg-background/80 px-4 py-3 text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/25 focus:border-[#FF4500]/40 transition-all text-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Dietary Preferences */}
        <motion.div
          className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-6 sm:p-8 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FFA500]/10">
              <UtensilsCrossed className="h-5 w-5 text-[#FFA500]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground/80">Dietary Preferences</h2>
              <p className="text-sm text-foreground/40">Select all that apply so we can plan meals accordingly.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {DIETARY_OPTIONS.map((opt) => (
              <DietaryPill
                key={opt}
                checked={dietaryPreferences.includes(opt)}
                label={opt}
                onToggle={() => toggleDietary(opt)}
              />
            ))}
          </div>

          {dietaryPreferences.includes('Other Allergy') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-medium text-foreground/45 mb-1.5 uppercase tracking-wider">
                Please Specify
              </label>
              <input
                value={dietaryOther}
                onChange={(e) => setDietaryOther(e.target.value)}
                placeholder="e.g. Tree nut allergy, shellfish…"
                className="w-full rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/5 px-4 py-3 text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]/40 transition-all text-sm"
              />
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground/45 mb-1.5 uppercase tracking-wider">
              Additional Notes
            </label>
            <textarea
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              rows={3}
              placeholder="Allergies, restrictions, or preferences we should know about…"
              className="w-full rounded-lg border border-foreground/10 bg-background/80 px-4 py-3 text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/25 focus:border-[#FFA500]/40 transition-all text-sm"
            />
          </div>
        </motion.div>

        {/* Special Accommodations */}
        <motion.div
          className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-6 sm:p-8 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#800080]/10">
              <Accessibility className="h-5 w-5 text-[#800080]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground/80">Special Accommodations</h2>
              <p className="text-sm text-foreground/40">Anything else we can do to make your stay comfortable.</p>
            </div>
          </div>
          <textarea
            value={specialAccommodations}
            onChange={(e) => setSpecialAccommodations(e.target.value)}
            rows={4}
            placeholder="e.g. Mobility needs, early/late arrival, rooming preferences…"
            className="w-full rounded-lg border border-foreground/10 bg-background/80 px-4 py-3 text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#800080]/25 focus:border-[#800080]/40 transition-all text-sm"
          />
        </motion.div>
      </div>
    </div>
  );
}
