import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, UtensilsCrossed, StickyNote, Star, Check, Loader2, Calendar, MapPin, Clock, ShoppingCart, Car, X, ChefHat, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useApplication } from '@/hooks/useApplication';
import { useAccommodation } from '@/hooks/useAccommodation';
import { useTrainerAssignment } from '@/hooks/useTrainerAssignment';
import { WAITLIST_ID } from '@/hooks/useApplicationRetreats';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Import room images from assets
import roomMaster from '@/assets/rooms/room-master.avif';
import room1 from '@/assets/rooms/room-1.avif';
import room2 from '@/assets/rooms/room-2.avif';
import room3 from '@/assets/rooms/room-3.avif';
import room4 from '@/assets/rooms/room-4.avif';
import room5 from '@/assets/rooms/room-5.avif';

// Default 6-bedroom house room images (March 30 - April 2 training)
const ROOM_IMAGES: Record<string, string> = {
  'Master Suite': roomMaster,
  'Bedroom 1': room1,
  'Bedroom 2': room2,
  'Bedroom 3': room3,
  'Bedroom 4': room4,
  'Bedroom 5': room5,
};

// March 13-16 training ID (8-bedroom Somerville house with commute option)
const MARCH_TRAINING_ID = 'c626109f-11a4-4549-991e-022727300feb';

// March 30 - April 2 training ID (meal selection enabled)
const APRIL_TRAINING_ID = '1952aca4-ef44-4294-bd63-a467cd800497';

// Meal categories with protein/style options
const MEAL_CATEGORIES = [
  {
    id: 'burrito',
    name: 'Burrito',
    description: 'Wrapped burrito with your choice of protein',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
    options: ['Beef', 'Chicken', 'Tofu', 'Shrimp', 'Fish'],
  },
  {
    id: 'asian-bowl',
    name: 'Asian Bowl',
    description: 'Asian-style rice bowl with your choice of protein',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    options: ['Chicken', 'Beef', 'Tofu', 'Shrimp', 'Fish'],
  },
  {
    id: 'pasta',
    name: 'Pasta',
    description: 'Italian pasta dish with your choice of protein',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    options: ['Beef', 'Italian Sausage', 'Seafood'],
  },
  {
    id: 'mexican-bowl',
    name: 'Mexican Bowl',
    description: 'Mexican-style bowl with rice, beans, and toppings',
    image: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=300&fit=crop',
    options: ['Chicken', 'Steak', 'Shrimp', 'Fish', 'Tofu'],
  },
  {
    id: 'egg-noodle',
    name: 'Organic Egg Noodle',
    description: 'Organic egg noodles with your choice of protein',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    options: ['Chicken', 'Shrimp', 'Beef', 'Fish', 'Tofu'],
  },
  {
    id: 'hawaiian-poke',
    name: 'Hawaiian Poke Bowl',
    description: 'Hawaiian poke bowl with soy poke sauce',
    image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400&h=300&fit=crop',
    options: ['Tuna', 'Salmon', 'Shrimp', 'Tofu'],
  },
  {
    id: 'chicken-adobo',
    name: 'Organic Chicken Adobo w/Rice',
    description: 'Filipino-style chicken adobo served with rice',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
    options: [], // No protein choice - chicken only
  },
  {
    id: 'filipino-sisig',
    name: 'Organic Filipino Sisig w/Rice',
    description: 'Sizzling Filipino sisig served with rice',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    options: ['Pork', 'Chicken', 'Tofu'],
  },
  {
    id: 'ponzu-dish',
    name: 'Organic Ponzu Dish',
    description: 'Ponzu-glazed protein with rice and pickled vegetables',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
    options: ['Chicken', 'Beef', 'Shrimp', 'Tofu', 'Fish'],
  },
  {
    id: 'scampi-pasta',
    name: 'Organic Scampi Pasta',
    description: 'Garlic butter scampi pasta with lemon and herbs',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop',
    options: ['Shrimp', 'Chicken', 'Fish', 'Beef'],
  },
  {
    id: 'spicy-pepperfin',
    name: 'Organic Spicy Pepperfin Sushi Sauce',
    description: 'Spicy pepperfin sushi-style dish with savory sauce',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
    options: ['Chicken', 'Beef', 'Organic Tofu', 'Shrimp', 'Salmon'],
  },
  {
    id: 'taiwanese-dry-rub',
    name: 'Organic Taiwanese Dry Rub',
    description: 'Taiwanese-style dry rub skewers',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
    options: ['Chicken', 'Steak', 'Shrimp', 'Tofu'],
  },
  {
    id: 'filipino-beef-steak',
    name: 'Organic Filipino Beef Steak',
    description: 'Filipino bistek with caramelized onions',
    image: 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=400&h=300&fit=crop',
    options: [], // No protein choice - beef only
  },
  {
    id: 'steak-eggs',
    name: 'Organic Steak and Eggs Bowl',
    description: 'Steak with scrambled eggs, guacamole, roasted potatoes, and caramelized onions',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    options: [], // No protein choice - steak only
  },
  {
    id: 'hawaiian-sauce',
    name: 'Organic Hawaiian Sauce Protein',
    description: 'Grilled protein with caramelized pineapple in Hawaiian sauce',
    image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop',
    options: ['Chicken', 'Steak', 'Fish', 'Tofu', 'Shrimp'],
  },
];

// Generate meal dates from training start/end dates
function generateMealDates(startDate: string, endDate: string): { date: string; label: string }[] {
  const dates: { date: string; label: string }[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const label = current.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    dates.push({ date: dateStr, label });
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

interface MealSelections {
  [date: string]: {
    lunch?: string;
    dinner?: string;
  };
}

// March training room data from Airbnb listing 1468171904038651220 (8-bedroom Somerville)
const MARCH_ROOM_DATA: Record<string, { image: string; bed_type: string }> = {
  'Bedroom 1': {
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/ac000837-767e-4275-9b16-d3180368dc11.png',
    bed_type: '1 queen bed'
  },
  'Bedroom 2': {
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/cbca7e83-d672-4782-b98a-e2d28c3f5ece.jpeg',
    bed_type: '2 double beds'
  },
  'Bedroom 3': {
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/45ce98fd-ec05-4a47-a6a7-3ce5a0166f5a.jpeg',
    bed_type: '2 double beds'
  },
  'Bedroom 4': {
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/f082876c-dbff-4a87-bca5-5106561ec8aa.png',
    bed_type: '2 double beds'
  },
  'Bedroom 5': {
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/a4af48f7-5990-4e9c-9f62-0bf163f81b29.jpeg',
    bed_type: '1 queen bed'
  },
  'Bedroom 6': {
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/830a96ee-a45b-4d19-802e-ead87e2bdaa0.jpeg',
    bed_type: '1 double bed + couch'
  },
  'Bedroom 7': {
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/bb96cb7a-f048-4951-8f83-9ddacdb0c2fc.png',
    bed_type: '1 queen bed'
  },
  'Bedroom 8': {
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTQ2ODE3MTkwNDAzODY1MTIyMA==/original/1f0bb61f-b55a-4855-81e3-29c331901ca9.jpeg',
    bed_type: '2 queen beds'
  },
  // Note: March training has no Master Suite - just 8 bedrooms
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
  meal_selection_enabled?: boolean;
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

  // Check if user is a trainer
  const isTrainer = application?.role === 'trainer';

  // Trainer-specific state: selected training for trainers who can pick from multiple
  const [selectedTrainerTraining, setSelectedTrainerTraining] = useState<string | null>(null);

  // State for training selection (non-enrolled users)
  const [selectingTrainingId, setSelectingTrainingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // For trainers, use selected training; for participants, use their application's training
  const trainingId = isTrainer ? selectedTrainerTraining : (application?.training_id || null);

  // Trainer assignment hook (only used for trainers)
  const {
    assignment: trainerAssignment,
    upsertAssignment,
    assignedTrainings,
  } = useTrainerAssignment(trainingId);

  // Set default training for trainers (first assigned training)
  useEffect(() => {
    if (isTrainer && assignedTrainings.length > 0 && !selectedTrainerTraining) {
      setSelectedTrainerTraining(assignedTrainings[0]?.id || null);
    }
  }, [isTrainer, assignedTrainings, selectedTrainerTraining]);

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

  // Fetch available trainings for non-enrolled users (only future trainings)
  const { data: availableTrainings = [] } = useQuery({
    queryKey: ['available-trainings'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('show_on_apply', true)
        .gte('start_date', today)
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

  // Check if this is the March training (uses different room images)
  const isMarchTraining = trainingId === MARCH_TRAINING_ID;
  const [commuteSelected, setCommuteSelected] = useState(false);

  // Meal selection - show for all trainings by default (same as April training)
  const showMealSelection = !!trainingId;

  // Generate meal dates dynamically from training dates
  const MEAL_DATES = training?.start_date && training?.end_date
    ? generateMealDates(training.start_date, training.end_date)
    : [];

  const [mealSelections, setMealSelections] = useState<MealSelections>({});
  const [activeMealSlot, setActiveMealSlot] = useState<{ date: string; mealType: 'lunch' | 'dinner' } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initialize commute selection from application or trainer assignment
  useEffect(() => {
    if (isTrainer && trainerAssignment) {
      setCommuteSelected(trainerAssignment.accommodation_choice === 'commute');
    } else if (application?.accommodation_choice === 'commute') {
      setCommuteSelected(true);
    }
  }, [application, isTrainer, trainerAssignment]);

  // Initialize meal selections from application or trainer assignment
  useEffect(() => {
    if (isTrainer && trainerAssignment?.meal_selections) {
      setMealSelections(trainerAssignment.meal_selections as MealSelections);
    } else if (application?.meal_selections) {
      setMealSelections(application.meal_selections as MealSelections);
    }
  }, [application, isTrainer, trainerAssignment]);

  const handleCommuteSelect = async () => {
    // If currently selected, deselect
    if (commuteSelected) {
      setCommuteSelected(false);
      if (isTrainer) {
        await upsertAssignment.mutateAsync({ accommodation_choice: null });
      } else {
        await updateApplication.mutateAsync({ accommodation_choice: null });
      }
      toast.success('Commute option removed');
      return;
    }

    // If user has a room reservation, remove it first
    if (myReservation) {
      unreserveRoom.mutate();
    }

    setCommuteSelected(true);
    if (isTrainer) {
      await upsertAssignment.mutateAsync({ accommodation_choice: 'commute' });
    } else {
      await updateApplication.mutateAsync({ accommodation_choice: 'commute' });
    }
    toast.success('Commute option selected');
  };

  const handleRoomSelectWrapper = (roomId: string) => {
    // Clear commute selection if selecting a room
    if (commuteSelected) {
      setCommuteSelected(false);
      if (isTrainer) {
        upsertAssignment.mutateAsync({ accommodation_choice: null });
      } else {
        updateApplication.mutateAsync({ accommodation_choice: null });
      }
    }
    handleRoomSelect(roomId);
  };

  // Meal selection handler
  const handleMealSelect = async (mealName: string) => {
    if (!activeMealSlot) return;

    const { date, mealType } = activeMealSlot;
    const updated = {
      ...mealSelections,
      [date]: {
        ...mealSelections[date],
        [mealType]: mealName,
      },
    };

    setMealSelections(updated);
    setActiveMealSlot(null);

    // Auto-save to database (trainer_assignments for trainers, applications for participants)
    setAutoSaveStatus('saving');
    try {
      if (isTrainer) {
        await upsertAssignment.mutateAsync({ meal_selections: updated });
      } else {
        await updateApplication.mutateAsync({ meal_selections: updated });
      }
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
      toast.success(`${mealType === 'lunch' ? 'Lunch' : 'Dinner'} selected for ${MEAL_DATES.find(d => d.date === date)?.label}`);
    } catch {
      toast.error('Failed to save meal selection');
      setAutoSaveStatus('idle');
    }
  };

  const clearMealSelection = async (date: string, mealType: 'lunch' | 'dinner') => {
    const updated = { ...mealSelections };
    if (updated[date]) {
      delete updated[date][mealType];
      if (Object.keys(updated[date]).length === 0) {
        delete updated[date];
      }
    }

    setMealSelections(updated);

    setAutoSaveStatus('saving');
    try {
      if (isTrainer) {
        await upsertAssignment.mutateAsync({ meal_selections: updated });
      } else {
        await updateApplication.mutateAsync({ meal_selections: updated });
      }
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch {
      toast.error('Failed to clear meal selection');
      setAutoSaveStatus('idle');
    }
  };

  // Get image for a room (training-specific > database URL > default fallback)
  const getRoomImage = (room: typeof rooms[0]) => {
    // For March training, prioritize the correct Airbnb data
    if (isMarchTraining && MARCH_ROOM_DATA[room.name]) return MARCH_ROOM_DATA[room.name].image;
    // Then check database image_url
    if (room.image_url) return room.image_url;
    // Default fallback
    return ROOM_IMAGES[room.name] || null;
  };

  // Get bed type for a room (training-specific > database)
  const getRoomBedType = (room: typeof rooms[0]) => {
    // For March training, use correct Airbnb data
    if (isMarchTraining && MARCH_ROOM_DATA[room.name]) return MARCH_ROOM_DATA[room.name].bed_type;
    // Database value
    return room.bed_type;
  };

  const isLoading = appLoading || trainingLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Handle training selection - update user's application with training and move to interview stage
  const handleSelectTraining = async (selectedTrainingId: string) => {
    if (!userId) {
      toast.error('Please log in to select a training');
      return;
    }

    setSelectingTrainingId(selectedTrainingId);
    setIsSubmitting(true);

    try {
      // Get user email for applicant lookup
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData?.user?.email;

      if (!userEmail) {
        toast.error('Unable to find your account information');
        return;
      }

      // Check if user has an applicant record, if so update it
      const { data: existingApplicant } = await supabase
        .from('applicants')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      if (existingApplicant) {
        // Update existing applicant
        const { error: updateError } = await supabase
          .from('applicants')
          .update({
            training_id: selectedTrainingId,
            pipeline_stage: 'interview',
            app_status: 'Interview Scheduled',
            notes: `Selected training on ${new Date().toLocaleDateString()}`,
          })
          .eq('id', existingApplicant.id);

        if (updateError) throw updateError;
      } else {
        // Create new applicant record
        const userName = userData?.user?.user_metadata?.first_name
          ? `${userData.user.user_metadata.first_name} ${userData.user.user_metadata.last_name || ''}`
          : userEmail.split('@')[0];

        const { error: insertError } = await supabase
          .from('applicants')
          .insert({
            name: userName,
            email: userEmail,
            phone: userData?.user?.phone || null,
            training_id: selectedTrainingId,
            pipeline_stage: 'interview',
            app_status: 'Interview Scheduled',
            application_date: new Date().toISOString(),
            notes: `Selected training from portal on ${new Date().toLocaleDateString()}`,
          });

        if (insertError) throw insertError;
      }

      // Also update the applications table if they have one
      if (application?.id) {
        await supabase
          .from('applications')
          .update({
            training_id: selectedTrainingId,
            status: 'interview',
          })
          .eq('id', application.id);
      }

      toast.success('Training selected! Our team will reach out to schedule your interview.');

      // Refresh the page to show accommodation options
      window.location.reload();
    } catch (error) {
      console.error('Error selecting training:', error);
      toast.error('Failed to select training. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSelectingTrainingId(null);
    }
  };

  // Non-enrolled user view OR waitlist user: show available trainings (but not for trainers)
  // Waitlist users have training_id set to WAITLIST_ID - they should also see training selection
  // Only show Beginning level trainings with openings
  const isWaitlistUser = application?.training_id === WAITLIST_ID;
  if ((!trainingId || isWaitlistUser) && !isTrainer) {
    const beginningTrainings = availableTrainings.filter(
      t => t.training_level === 'Beginning' && (t.max_capacity - t.spots_filled) > 0
    );

    return (
      <>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Training</h1>
        <p className="text-gray-500 mb-8">
          Choose a Beginning Level training to get started on your StepWise journey.
        </p>

        <div className="space-y-4">
          {beginningTrainings.map(t => {
            const spotsLeft = t.max_capacity - t.spots_filled;
            const isFilling = spotsLeft <= 3;
            const isSelecting = selectingTrainingId === t.id;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden border border-foreground/[0.08] bg-background hover:border-amber-300 transition-all duration-300 hover:shadow-lg"
              >
                {/* Top color bar */}
                <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />

                <div className="p-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                          Beginning Level
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground/90">{t.name}</h3>
                    </div>

                    {isFilling && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-600">
                        {spotsLeft === 1 ? '1 spot left!' : `${spotsLeft} spots left`}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-foreground/50 mb-5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(t.start_date)} - {formatDate(t.end_date)}</span>
                    </div>
                    {t.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{t.location}</span>
                      </div>
                    )}
                    {!isFilling && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{spotsLeft} spots available</span>
                      </div>
                    )}
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-foreground/[0.06]">
                    <div>
                      {t.price_cents > 0 ? (
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                          <span className="text-xl font-bold text-foreground/90">${(t.price_cents / 100).toLocaleString()} <span className="text-sm font-normal text-foreground/50">Private Room</span></span>
                          <span className="text-lg font-semibold text-foreground/70">${((t.price_cents / 100) * 0.79).toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-sm font-normal text-foreground/50">Commuter</span></span>
                        </div>
                      ) : (
                        <span className="text-foreground/50">Contact for pricing</span>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectTraining(t.id)}
                      disabled={isSubmitting}
                      className={cn(
                        'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200',
                        'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
                        'shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30',
                        isSubmitting && 'opacity-70 cursor-not-allowed'
                      )}
                    >
                      {isSelecting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Selecting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Select This Training
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {beginningTrainings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/70 mb-2">No Available Trainings</h3>
            <p className="text-foreground/50 mb-6">All Beginning Level trainings are currently full.</p>
            <a
              href="/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Join the Waitlist
            </a>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isTrainer ? 'Trainer Accommodation' : 'Accommodation'}
        </h1>
        <p className="text-gray-500 mb-4">
          {isTrainer
            ? 'Select a training, then choose your room and meal preferences.'
            : 'Select your room, set dietary preferences, and note any special needs.'}
        </p>

        {/* Trainer training selector */}
        {isTrainer && assignedTrainings.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wide">Trainer Mode</span>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Training</label>
            <select
              value={selectedTrainerTraining || ''}
              onChange={(e) => setSelectedTrainerTraining(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {assignedTrainings.map((t: Training) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({formatDate(t.start_date)} - {formatDate(t.end_date)})
                </option>
              ))}
            </select>
          </div>
        )}

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
            {rooms
              // For March training, filter out Master Suite (it only has 8 bedrooms, no premier room)
              .filter(room => !(isMarchTraining && room.name === 'Master Suite'))
              .map(room => {
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
                      {getRoomBedType(room)} · {room.bath_type}
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

            {/* Commute Option - available for all trainings */}
            {trainingId && (
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

        {/* Master suite info - only show if there's a premier room AND it's not March training */}
        {!isMarchTraining && rooms.some(r => r.is_premier) && (
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

      {/* Meal Selection */}
      {console.log('[Meals] showMealSelection:', showMealSelection, 'trainingId:', trainingId, 'MEAL_DATES:', MEAL_DATES.length)}
      {showMealSelection && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Choose Your Meals</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Select lunch and dinner for each day. Meals provided by Aspire Meal Preps.
          </p>

          {/* Meal calendar grid */}
          <div className="space-y-4">
            {MEAL_DATES.map(({ date, label }) => (
              <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  {label}
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Lunch slot */}
                  <div
                    className={cn(
                      'relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden',
                      mealSelections[date]?.lunch
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-dashed border-gray-200 hover:border-amber-200 bg-gray-50'
                    )}
                    onClick={() => setActiveMealSlot({ date, mealType: 'lunch' })}
                  >
                    {mealSelections[date]?.lunch ? (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                            <Sun className="w-3.5 h-3.5" /> LUNCH
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearMealSelection(date, 'lunch');
                            }}
                            className="p-1 rounded-full hover:bg-amber-100 text-amber-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-medium text-gray-900 text-sm">{mealSelections[date]?.lunch}</p>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <Sun className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-500">Select Lunch</p>
                      </div>
                    )}
                  </div>

                  {/* Dinner slot */}
                  <div
                    className={cn(
                      'relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden',
                      mealSelections[date]?.dinner
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-dashed border-gray-200 hover:border-indigo-200 bg-gray-50'
                    )}
                    onClick={() => setActiveMealSlot({ date, mealType: 'dinner' })}
                  >
                    {mealSelections[date]?.dinner ? (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                            <Moon className="w-3.5 h-3.5" /> DINNER
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearMealSelection(date, 'dinner');
                            }}
                            className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-medium text-gray-900 text-sm">{mealSelections[date]?.dinner}</p>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <Moon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-500">Select Dinner</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Meal selection modal */}
          <AnimatePresence>
            {activeMealSlot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
                onClick={() => setActiveMealSlot(null)}
              >
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                      {selectedCategory && (
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedCategory
                            ? `Choose your ${selectedCategory} option`
                            : `Choose ${activeMealSlot.mealType === 'lunch' ? 'Lunch' : 'Dinner'}`
                          }
                        </h3>
                        <p className="text-sm text-gray-500">
                          {MEAL_DATES.find(d => d.date === activeMealSlot.date)?.label}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveMealSlot(null); setSelectedCategory(null); }}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Step 1: Choose category */}
                  {!selectedCategory && (
                    <div className="p-5 overflow-y-auto max-h-[60vh] grid gap-3 sm:grid-cols-2">
                      {MEAL_CATEGORIES.map((cat) => (
                        <motion.button
                          key={cat.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (cat.options.length === 0) {
                              // No options - select directly
                              handleMealSelect(cat.name);
                            } else {
                              setSelectedCategory(cat.id);
                            }
                          }}
                          className="relative rounded-xl overflow-hidden border-2 border-gray-100 hover:border-purple-300 transition-all text-left group"
                        >
                          <div className="h-32 bg-gray-100 overflow-hidden">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4 bg-white">
                            <p className="font-semibold text-gray-900">{cat.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                            {cat.options.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {cat.options.map(opt => (
                                  <span key={opt} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-2 inline-block">
                                Tap to select
                              </span>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Step 2: Choose option within category */}
                  {selectedCategory && (
                    <div className="p-5 overflow-y-auto max-h-[60vh]">
                      <div className="grid gap-2">
                        {MEAL_CATEGORIES.find(c => c.id === selectedCategory)?.options.map((option) => (
                          <motion.button
                            key={option}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              const categoryName = MEAL_CATEGORIES.find(c => c.id === selectedCategory)?.name;
                              handleMealSelect(`${categoryName} - ${option}`);
                              setSelectedCategory(null);
                            }}
                            className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all text-left flex items-center justify-between"
                          >
                            <span className="font-medium text-gray-900">{option}</span>
                            <span className="text-purple-500">Select</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

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
// cache bust 1772346110
// force rebuild 1772346701
