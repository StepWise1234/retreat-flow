import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, ExternalLink, BedDouble, UtensilsCrossed, Accessibility } from 'lucide-react';
import { toast } from 'sonner';
import { useApplication } from '@/hooks/useApplication';

export default function PortalAccommodation() {
  const { application, isLoading, updateApplication } = useApplication();
  const [bedroomChoice, setBedroomChoice] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [specialAccommodations, setSpecialAccommodations] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setBedroomChoice(application.bedroom_choice || '');
      setDietaryNotes(application.dietary_notes || '');
      setSpecialAccommodations(application.special_accommodations || '');
    }
  }, [application]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApplication.mutateAsync({
        bedroom_choice: bedroomChoice,
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

        {/* Dietary */}
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
              <h2 className="text-lg font-semibold tracking-tight text-foreground/80">Dietary Considerations</h2>
              <p className="text-sm text-foreground/40">Allergies, restrictions, or preferences we should know about.</p>
            </div>
          </div>
          <textarea
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            rows={4}
            placeholder="e.g. Vegetarian, no tree nuts, lactose intolerant…"
            className="w-full rounded-lg border border-foreground/10 bg-background/80 px-4 py-3 text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/25 focus:border-[#FFA500]/40 transition-all text-sm"
          />
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
