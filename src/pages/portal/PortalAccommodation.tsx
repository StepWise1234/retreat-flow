import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, ExternalLink, BedDouble, UtensilsCrossed, Accessibility, Crown, Lock, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useApplication } from '@/hooks/useApplication';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

import roomMaster from '@/assets/rooms/room-master.avif';
import room1 from '@/assets/rooms/room-1.avif';
import room2 from '@/assets/rooms/room-2.avif';
import room3 from '@/assets/rooms/room-3.avif';
import room4 from '@/assets/rooms/room-4.avif';
import room5 from '@/assets/rooms/room-5.avif';

const ROOMS = [
  { id: 'master', name: 'Master Suite', image: roomMaster, bed: 'King bed', bath: 'En-suite bath & tub', price: 500, badge: 'Premier' },
  { id: 'bedroom-1', name: 'Bedroom 1', image: room1, bed: 'Queen bed', bath: 'Shared bath' },
  { id: 'bedroom-2', name: 'Bedroom 2', image: room2, bed: 'Queen bed', bath: 'Shared bath' },
  { id: 'bedroom-3', name: 'Bedroom 3', image: room3, bed: 'Queen bed', bath: 'Shared bath' },
  { id: 'bedroom-4', name: 'Bedroom 4', image: room4, bed: 'Queen bed', bath: 'Shared bath' },
  { id: 'bedroom-5', name: 'Bedroom 5', image: room5, bed: 'Double bed', bath: 'Shared bath' },
];

const DIETARY_OPTIONS = ['Gluten Free', 'Dairy Free', 'Vegetarian', 'Vegan', 'Other Allergy'];

const DIETARY_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  'Gluten Free':   { bg: '#FFA500', border: '#FFA500', glow: 'rgba(255,165,0,0.15)' },
  'Dairy Free':    { bg: '#FF4500', border: '#FF4500', glow: 'rgba(255,69,0,0.15)' },
  'Vegetarian':    { bg: '#22C55E', border: '#22C55E', glow: 'rgba(34,197,94,0.15)' },
  'Vegan':         { bg: '#800080', border: '#800080', glow: 'rgba(128,0,128,0.15)' },
  'Other Allergy': { bg: '#3B82F6', border: '#3B82F6', glow: 'rgba(59,130,246,0.15)' },
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
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200"
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

function RoomCard({ room, selected, soldOut, onSelect }: {
  room: typeof ROOMS[0];
  selected: boolean;
  soldOut: boolean;
  onSelect: () => void;
}) {
  const disabled = soldOut && !selected;
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onSelect}
      whileHover={disabled ? undefined : { y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={cn(
        'group relative rounded-2xl overflow-hidden text-left transition-all duration-400 border-2',
        disabled && 'cursor-not-allowed opacity-60',
        selected
          ? 'border-[#FFA500] shadow-[0_8px_30px_rgba(255,165,0,0.2)]'
          : disabled
            ? 'border-transparent'
            : 'border-transparent hover:border-foreground/10 shadow-md hover:shadow-xl',
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className={cn(
            'h-full w-full object-cover transition-transform duration-700',
            disabled ? 'grayscale' : 'group-hover:scale-110',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Sold out overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-sm px-4 py-2">
              <Lock className="h-4 w-4 text-white/80" />
              <span className="text-sm font-bold text-white/90 uppercase tracking-wider">Reserved</span>
            </div>
          </div>
        )}

        {/* Badge */}
        {room.badge && !disabled && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#FFA500]/90 backdrop-blur-sm px-3 py-1">
            <Crown className="h-3 w-3 text-white" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">{room.badge}</span>
          </div>
        )}

        {/* Price badge for master */}
        {room.price && !disabled && (
          <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1">
            <span className="text-[11px] font-bold text-[#FFA500]">+${room.price}</span>
          </div>
        )}

        {/* Selected indicator */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, #FFA500, #FF4500)',
                boxShadow: '0 4px 12px rgba(255,69,0,0.4)',
              }}
            >
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Room info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white tracking-tight">{room.name}</h3>
          <p className="text-xs text-white/70 mt-0.5">{room.bed} · {room.bath}</p>
        </div>
      </div>

      {/* Selection bar */}
      <div
        className={cn(
          'px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-widest transition-all duration-300',
          selected
            ? 'bg-gradient-to-r from-[#FFA500] to-[#FF4500] text-white'
            : disabled
              ? 'bg-foreground/[0.05] text-foreground/25'
              : 'bg-foreground/[0.03] text-foreground/40 group-hover:text-foreground/60',
        )}
      >
        {selected ? 'Selected' : disabled ? 'Reserved' : 'Select Room'}
      </div>
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

  // Fetch reserved rooms for this retreat
  const retreatId = application?.retreat_id;
  const { data: reservedRooms = [] } = useQuery({
    queryKey: ['reserved-rooms', retreatId],
    queryFn: async () => {
      if (!retreatId) return [];
      const { data, error } = await supabase.rpc('get_reserved_rooms', { p_retreat_id: retreatId });
      if (error) throw error;
      return (data as string[]) || [];
    },
    enabled: !!retreatId,
  });

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

  // A room is sold out if someone else reserved it (not the current user)
  const isRoomSoldOut = (roomId: string) => {
    return reservedRooms.includes(roomId) && bedroomChoice !== roomId && application?.bedroom_choice !== roomId;
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/85">
            Accommodation
          </h1>
          <p className="mt-1 text-foreground/45">
            Select your room, set dietary preferences, and note any special needs.
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white text-sm transition-all disabled:opacity-50 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #FFA500, #FF4500)',
            boxShadow: '0 4px 14px rgba(255, 69, 0, 0.2)',
          }}
        >
          {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save'}
        </motion.button>
      </div>

      {/* Room Selection */}
      <motion.div
        className="space-y-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FF4500]/10">
              <BedDouble className="h-5 w-5 text-[#FF4500]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground/80">Choose Your Room</h2>
              <p className="text-sm text-foreground/40">Tap a room to reserve it for your stay.</p>
            </div>
          </div>
          {vrboUrl && (
            <a
              href={vrboUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-[#FF4500] border border-[#FF4500]/20 bg-[#FF4500]/5 hover:bg-[#FF4500]/10 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Full Listing
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROOMS.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <RoomCard
                room={room}
                selected={bedroomChoice === room.id}
                soldOut={isRoomSoldOut(room.id)}
                onSelect={() => setBedroomChoice(bedroomChoice === room.id ? '' : room.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Master Suite upsell note */}
        <motion.div
          className="rounded-xl border border-[#FFA500]/15 bg-gradient-to-br from-[#FFA500]/5 to-[#FF4500]/5 p-5 flex items-start gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-9 h-9 rounded-full bg-[#FFA500]/15 flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="h-4 w-4 text-[#FFA500]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground/70">About the Master Suite upgrade</p>
            <p className="text-sm text-foreground/45 mt-1 leading-relaxed">
              The +$500 Master Suite fee goes directly toward funding scholarship spots for participants
              who otherwise couldn't attend. By investing in your own comfort, you're making this
              experience accessible to someone else. Taking better care of yourself truly allows us
              to take better care of those in need.
            </p>
          </div>
        </motion.div>
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

        <AnimatePresence>
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
        </AnimatePresence>

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
  );
}
