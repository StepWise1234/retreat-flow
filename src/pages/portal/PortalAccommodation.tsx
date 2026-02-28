import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, UtensilsCrossed, StickyNote, Star, Check, Loader2, Calendar, MapPin, Clock, ShoppingCart, Car } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useApplication } from '@/hooks/useApplication';
import { useAccommodation } from '@/hooks/useAccommodation';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import roomMasterImg from '@/assets/rooms/room-master.avif';
import room1Img from '@/assets/rooms/room-1.avif';
import room2Img from '@/assets/rooms/room-2.avif';
import room3Img from '@/assets/rooms/room-3.avif';
import room4Img from '@/assets/rooms/room-4.avif';
import room5Img from '@/assets/rooms/room-5.avif';

// Default 6-bedroom house room images (fallback when image_url not in database)
const ROOM_IMAGES: Record<string, string> = {
  'Master Suite': roomMasterImg,
  'Bedroom 1': room1Img,
  'Bedroom 2': room2Img,
  'Bedroom 3': room3Img,
  'Bedroom 4': room4Img,
  'Bedroom 5': room5Img,
};

// March 13-16 training ID (8-bedroom Somerville house with commute option)
const MARCH_TRAINING_ID = 'c626109f-11a4-4549-991e-022727300feb';

// March training room images from Airbnb
const MARCH_ROOM_IMAGES: Record<string, string> = {
  'Bedroom 1': 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/ac000837-767e-4275-9b16-d3180368dc11.png',
  'Bedroom 2': 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/cbca7e83-d672-4782-b98a-e2d28c3f5ece.jpeg',
  'Bedroom 3': 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/45ce98fd-ec05-4a47-a6a7-3ce5a0166f5a.jpeg',
  'Bedroom 4': 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/f082876c-dbff-4a87-bca5-5106561ec8aa.png',
  'Bedroom 5': 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/a4af48f7-5990-4e9c-9f62-0bf163f81b29.jpeg',
  'Bedroom 6': 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/830a96ee-a45b-4d19-802e-ead87e2bdaa0.jpeg',
  'Bedroom 7': 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/bb96cb7a-f048-4951-8f83-9ddacdb0c2fc.png',
  'Bedroom 8': 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/1f0bb61f-b55a-4855-81e3-29c331901ca9.jpeg',
};

const DIETARY_OPTIONS = ['Gluten Free', 'Dairy Free', 'Vegetarian', 'Vegan', 'Other Allergy'];

interface Training {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  training_level: string;
  max_capacity: number;
  spots_filled: number;
  stripe_price_id: string | null;
  price_cents: number;
  show_on_apply: boolean;
}

export default function PortalAccommodation() {
  const { application, isLoading: appLoading, updateApplication } = useApplication();
  const [userId, setUserId] = useState<string | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [dietaryOther, setDietaryOther] = useState('');
  const [accommodationNotes, setAccommodationNotes] = useState('');
  const [specialAccommodations, setSpecialAccommodations] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // Get training info for the user's application
  const trainingId = application?.training_id || null;

  const { data: training, isLoading: trainingLoading } = useQuery({
    queryKey: ['training', trainingId],
    queryFn: async () => {
      if (!trainingId) return null;
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('id', trainingId)
        .single();
      if (error) throw error;
      return data as Training;
    },
    enabled: !!trainingId,
  });

  // Accommodation hook with real-time
  const {
    rooms,
    isLoading: roomsLoading,
    myReservation,
    reserveRoom,
    unreserveRoom,
  } = useAccommodation(trainingId, userId, application?.id || null);

  // Fetch available trainings for non-enrolled users
  const { data: availableTrainings = [] } = useQuery({
    queryKey: ['available-trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('show_on_apply', true)
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data as Training[];
    },
    enabled: !trainingId && !appLoading,
  });

  // Initialize form from application data
  useEffect(() => {
    if (application) {
      setDietaryPreferences(application.dietary_preferences || []);
      setDietaryOther(application.dietary_other || '');
      setAccommodationNotes(application.accommodation_notes || '');
      setSpecialAccommodations(application.special_accommodations || '');
    }
  }, [application]);

  // Auto-save with debounce for text fields
  const autoSave = useCallback(
    (data: Record<string, unknown>) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setAutoSaveStatus('saving');
      debounceTimer.current = setTimeout(async () => {
        try {
          await updateApplication.mutateAsync(data);
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } catch {
          toast.error('Failed to save changes');
          setAutoSaveStatus('idle');
        }
      }, 1000);
    },
    [updateApplication]
  );

  // Immediate save for checkbox selections
  const immediateSave = useCallback(
    async (data: Record<string, unknown>) => {
      setAutoSaveStatus('saving');
      try {
        await updateApplication.mutateAsync(data);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch {
        toast.error('Failed to save changes');
        setAutoSaveStatus('idle');
      }
    },
    [updateApplication]
  );

  const handleDietaryToggle = (option: string) => {
    const updated = dietaryPreferences.includes(option)
      ? dietaryPreferences.filter(p => p !== option)
      : [...dietaryPreferences, option];
    setDietaryPreferences(updated);
    immediateSave({ dietary_preferences: updated });
  };

  const handleDietaryOtherChange = (value: string) => {
    setDietaryOther(value);
    autoSave({ dietary_other: value });
  };

  const handleAccommodationNotesChange = (value: string) => {
    setAccommodationNotes(value);
    autoSave({ accommodation_notes: value });
  };

  const handleSpecialAccommodationsChange = (value: string) => {
    setSpecialAccommodations(value);
    autoSave({ special_accommodations: value });
  };

  const handleRoomSelect = (roomId: string) => {
    if (myReservation?.room_id === roomId) {
      unreserveRoom.mutate();
    } else {
      reserveRoom.mutate(roomId);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if this is the March training with commute option
  const isMarchTraining = trainingId === MARCH_TRAINING_ID;
  const [commuteSelected, setCommuteSelected] = useState(false);

  // Initialize commute selection from application data
  useEffect(() => {
    if (application?.accommodation_choice === 'commute') {
      setCommuteSelected(true);
    }
  }, [application]);

  const handleCommuteSelect = async () => {
    // If currently selected, deselect
    if (commuteSelected) {
      setCommuteSelected(false);
      await updateApplication.mutateAsync({ accommodation_choice: null });
      toast.success('Commute option removed');
      return;
    }

    // If user has a room reservation, remove it first
    if (myReservation) {
      unreserveRoom.mutate();
    }

    setCommuteSelected(true);
    await updateApplication.mutateAsync({ accommodation_choice: 'commute' });
    toast.success('Commute option selected');
  };

  const handleRoomSelectWrapper = (roomId: string) => {
    // Clear commute selection if selecting a room
    if (commuteSelected) {
      setCommuteSelected(false);
      updateApplication.mutateAsync({ accommodation_choice: null });
    }
    handleRoomSelect(roomId);
  };

  // Get image for a room (database URL > training-specific > default fallback)
  const getRoomImage = (room: typeof rooms[0]) => {
    // First check database image_url
    if (room.image_url) return room.image_url;
    // For March training, use Airbnb images
    if (isMarchTraining && MARCH_ROOM_IMAGES[room.name]) return MARCH_ROOM_IMAGES[room.name];
    // Default fallback
    return ROOM_IMAGES[room.name] || null;
  };

  const isLoading = appLoading || trainingLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Non-enrolled user view: show available trainings
  if (!trainingId) {
    return (
      <>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accommodation</h1>
        <p className="text-gray-500 mb-8">
          You're not currently enrolled in a training. Explore available trainings below to get started.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {availableTrainings.map(t => (
            <motion.div
              key={t.id}
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  'w-3 h-3 rounded-full',
                  t.training_level === 'Beginning' && 'bg-orange-400',
                  t.training_level === 'Intermediate' && 'bg-red-500',
                  t.training_level === 'Advanced' && 'bg-purple-700',
                )} />
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {t.training_level}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.name}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(t.start_date)} - {formatDate(t.end_date)}</span>
                </div>
                {t.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{t.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{t.max_capacity - t.spots_filled} spots remaining</span>
                </div>
              </div>
              {t.price_cents > 0 && (
                <p className="text-lg font-bold text-gray-900 mb-3">
                  ${(t.price_cents / 100).toLocaleString()}
                </p>
              )}
              {t.stripe_price_id ? (
                <a
                  href={`https://buy.stripe.com/${t.stripe_price_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 text-white px-6 py-3 font-medium hover:bg-purple-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Purchase Training
                </a>
              ) : (
                <a
                  href="/apply"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
                >
                  Apply Now
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {availableTrainings.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No trainings are currently available. Check back soon!</p>
          </div>
        )}
      </>
    );
  }

  // Enrolled user view: full accommodation page
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accommodation</h1>
        <p className="text-gray-500 mb-4">
          Select your room, set dietary preferences, and note any special needs.
        </p>

        {/* Training info banner */}
        {training && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              training.training_level === 'Beginning' && 'bg-orange-100',
              training.training_level === 'Intermediate' && 'bg-red-100',
              training.training_level === 'Advanced' && 'bg-purple-100',
            )}>
              <span className={cn(
                'w-4 h-4 rounded-full',
                training.training_level === 'Beginning' && 'bg-orange-400',
                training.training_level === 'Intermediate' && 'bg-red-500',
                training.training_level === 'Advanced' && 'bg-purple-700',
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{training.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(training.start_date)} - {formatDate(training.end_date)}
                </span>
                {training.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {training.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-save indicator */}
      <AnimatePresence>
        {autoSaveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white rounded-full shadow-lg border border-gray-100 px-4 py-2 text-sm"
          >
            {autoSaveStatus === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-gray-500">Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-500">Saved</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Selection */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Bed className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Choose Your Room</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">Tap a room to reserve it for your stay.</p>

        {roomsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map(room => {
              const img = getRoomImage(room);
              const isMine = room.status === 'mine' && !commuteSelected;
              const isReserved = room.status === 'reserved';
              const isAvailable = room.status === 'available' || (room.status === 'mine' && commuteSelected);

              return (
                <motion.button
                  key={room.id}
                  whileHover={isAvailable || isMine ? { scale: 1.01 } : {}}
                  whileTap={isAvailable || isMine ? { scale: 0.99 } : {}}
                  onClick={() => !isReserved && handleRoomSelectWrapper(room.id)}
                  disabled={isReserved || reserveRoom.isPending}
                  className={cn(
                    'relative rounded-2xl overflow-hidden text-left transition-all border-2',
                    isMine && 'border-purple-500 shadow-lg shadow-purple-100',
                    isAvailable && 'border-gray-100 hover:border-purple-200 hover:shadow-md',
                    isReserved && 'border-gray-100 opacity-50 cursor-not-allowed',
                  )}
                >
                  {/* Room image */}
                  {img && (
                    <div className="h-36 bg-gray-100 overflow-hidden">
                      <img src={img} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <div className="flex items-center gap-2">
                        {room.is_premier && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3" /> PREMIER
                          </span>
                        )}
                        {room.price_adjustment_cents > 0 && (
                          <span className="text-sm font-semibold text-purple-600">
                            +${room.price_adjustment_cents / 100}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {room.bed_type} · {room.bath_type}
                    </p>

                    {/* Status badge */}
                    <div className="mt-3">
                      {isMine && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                          <Check className="w-3 h-3" /> YOUR SELECTION
                        </span>
                      )}
                      {isReserved && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          RESERVED
                        </span>
                      )}
                      {isAvailable && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                          AVAILABLE
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {/* Commute Option - only for March training */}
            {isMarchTraining && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCommuteSelect}
                className={cn(
                  'relative rounded-2xl overflow-hidden text-left transition-all border-2',
                  commuteSelected && 'border-amber-500 shadow-lg shadow-amber-100',
                  !commuteSelected && 'border-dashed border-amber-200 hover:border-amber-300 hover:shadow-md bg-amber-50/50',
                )}
              >
                {/* Commute icon */}
                <div className="h-36 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                  <Car className="w-12 h-12 text-amber-500" />
                </div>

                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Commute</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Daily Travel · Sleep at home
                  </p>

                  {/* Status badge */}
                  <div className="mt-3">
                    {commuteSelected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                        <Check className="w-3 h-3" /> YOUR SELECTION
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                        AVAILABLE
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            )}
          </div>
        )}

        {/* Master suite info */}
        {rooms.some(r => r.is_premier) && (
          <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
            <h4 className="text-sm font-semibold text-amber-800 mb-1">About the Master Suite upgrade</h4>
            <p className="text-sm text-amber-700">
              The +$500 Master Suite fee goes directly toward funding scholarship spots for
              participants who otherwise couldn't attend. By investing in your own comfort,
              you're making this experience accessible to someone else.
            </p>
          </div>
        )}
      </section>

      {/* Dietary Preferences */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <UtensilsCrossed className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Dietary Preferences</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Select all that apply so we can plan meals accordingly.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {DIETARY_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => handleDietaryToggle(option)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                dietaryPreferences.includes(option)
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
              )}
            >
              {dietaryPreferences.includes(option) && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
              {option}
            </button>
          ))}
        </div>

        {dietaryPreferences.includes('Other Allergy') && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <input
              type="text"
              placeholder="Please describe your allergy..."
              value={dietaryOther}
              onChange={e => handleDietaryOtherChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
            />
          </motion.div>
        )}
      </section>

      {/* Additional Notes */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Additional Notes</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Any food preferences, snack requests, or meal timing needs?</p>
        <textarea
          value={accommodationNotes}
          onChange={e => handleAccommodationNotesChange(e.target.value)}
          placeholder="E.g., I prefer to eat dinner early, I love dark chocolate..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 resize-none"
        />
      </section>

      {/* Special Accommodations */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Bed className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Special Accommodations</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Let us know about any accessibility needs, mobility requirements, or other accommodations.
        </p>
        <textarea
          value={specialAccommodations}
          onChange={e => handleSpecialAccommodationsChange(e.target.value)}
          placeholder="E.g., I need a ground-floor room, I use a wheelchair..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 resize-none"
        />
      </section>
    </>
  );
}
