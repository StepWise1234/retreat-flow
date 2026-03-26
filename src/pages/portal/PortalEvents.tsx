import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Check, X, ChevronRight, Sparkles, UserPlus, DollarSign, Trash2, CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useEvents, useMyEventRegistrations, useRegisterForEvent, useCancelRegistration, useCaseConsultTierCounts, sendGuestPaymentEmail, Event, GuestInput, PaymentOption } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { useCreateStripeCheckout, useVerifyStripePayment } from '@/hooks/useStripe';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Calendly URLs for Group Case Consult scheduling
const CALENDLY_CASE_CONSULT_MONDAY = 'https://calendly.com/laela-coaching/group-case-consult-monthly';
const CALENDLY_CASE_CONSULT_TUESDAY = 'https://calendly.com/laela-coaching/group-case-consult';

// Case Consult tier pricing
const CASE_CONSULT_TIERS = {
  monday: {
    price: 7500, // $75
    label: 'Mondays',
    description: '1st Monday of each month',
    schedule: '1st Monday',
  },
  tuesday: {
    price: 12500, // $125
    label: 'Tuesdays',
    description: '1st & 3rd Tuesday of each month',
    schedule: '1st & 3rd Tuesday',
  },
} as const;

type CaseConsultTier = keyof typeof CASE_CONSULT_TIERS;

// Training level colors (yellow for beginning, red for intermediate, purple for advanced)
const LEVEL_COLORS: Record<string, string> = {
  'Beginning': '#F5A623',
  'Intermediate': '#E53935',
  'Advanced': '#9D067A',
};

// Workshop color is StepWise purple
const WORKSHOP_COLOR = '#9D067A';
// Online color is StepWise red
const ONLINE_COLOR = '#E53935';

function getEventColor(event: { training_type: string | null; training_level: string | null }): string {
  // Online events get red
  if (event.training_type === 'Online') return ONLINE_COLOR;
  // Workshops always get purple
  if (event.training_type === 'Workshop') return WORKSHOP_COLOR;
  // Trainings get level-based color
  if (!event.training_level) return '#6B7280';
  return LEVEL_COLORS[event.training_level] || '#6B7280';
}

// Case Consult Registration Modal - tier selection with Stripe subscription
function CaseConsultRegistrationModal({
  event,
  onClose,
  onRegisterWithTier,
  isPending,
  mondayRemaining,
  tuesdayRemaining
}: {
  event: Event;
  onClose: () => void;
  onRegisterWithTier: (tier: CaseConsultTier) => void;
  isPending: boolean;
  mondayRemaining: number;
  tuesdayRemaining: number;
}) {
  const [selectedTier, setSelectedTier] = useState<CaseConsultTier>('monday');
  const color = getEventColor(event);

  const tierInfo = CASE_CONSULT_TIERS[selectedTier];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5" style={{ backgroundColor: color }} />
        <div className="p-6 border-b border-foreground/[0.06]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground/85">{event.name}</h2>
              <p className="text-sm text-foreground/50 mt-1">5 month commitment (May - September)</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">Choose your group</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Monday tier */}
              <button
                onClick={() => setSelectedTier('monday')}
                disabled={mondayRemaining <= 0}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all relative",
                  mondayRemaining <= 0 ? "opacity-50 cursor-not-allowed" : "",
                  selectedTier === 'monday'
                    ? "border-current bg-current/5"
                    : "border-foreground/10 hover:border-foreground/20"
                )}
                style={selectedTier === 'monday' ? { borderColor: color, backgroundColor: `${color}10` } : {}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-foreground/50" />
                  <span className="font-semibold text-foreground/80">Monday</span>
                </div>
                <p className="text-xl font-bold text-foreground/80">$75<span className="text-sm font-normal text-foreground/50">/mo</span></p>
                <p className="text-xs text-foreground/50 mt-1">1st Monday each month</p>
                <p className="text-xs text-foreground/40">3-5pm PT / 6-8pm ET</p>
                <p className="text-xs mt-2" style={{ color: mondayRemaining <= 2 ? '#E53935' : color }}>
                  {mondayRemaining <= 0 ? 'Full' : `${mondayRemaining} spots left`}
                </p>
              </button>

              {/* Tuesday tier */}
              <button
                onClick={() => setSelectedTier('tuesday')}
                disabled={tuesdayRemaining <= 0}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all relative",
                  tuesdayRemaining <= 0 ? "opacity-50 cursor-not-allowed" : "",
                  selectedTier === 'tuesday'
                    ? "border-current bg-current/5"
                    : "border-foreground/10 hover:border-foreground/20"
                )}
                style={selectedTier === 'tuesday' ? { borderColor: color, backgroundColor: `${color}10` } : {}}
              >
                <span className="absolute -top-2.5 right-2 px-2 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-sm">2 Sessions/Mo</span>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-foreground/50" />
                  <span className="font-semibold text-foreground/80">Tuesday</span>
                </div>
                <p className="text-xl font-bold text-foreground/80">$125<span className="text-sm font-normal text-foreground/50">/mo</span></p>
                <p className="text-xs text-foreground/50 mt-1">1st & 3rd Tuesday</p>
                <p className="text-xs text-foreground/40">3-5pm PT / 6-8pm ET</p>
                <p className="text-xs mt-2" style={{ color: tuesdayRemaining <= 2 ? '#E53935' : color }}>
                  {tuesdayRemaining <= 0 ? 'Full' : `${tuesdayRemaining} spots left`}
                </p>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-foreground/[0.03] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">Monthly subscription</span>
              <span className="font-semibold text-foreground/80">${tierInfo.price / 100}/mo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">Commitment</span>
              <span className="text-foreground/70">5 months (ends September)</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-foreground/[0.06]">
              <span className="text-foreground/60">Total value</span>
              <span className="font-semibold text-foreground/80">${(tierInfo.price / 100) * 5}</span>
            </div>
          </div>

          <p className="text-xs text-foreground/40 text-center">
            Secure payment via Stripe. You'll be charged monthly through September.
          </p>
        </div>

        <div className="p-6 border-t border-foreground/[0.06] bg-foreground/[0.02]">
          <button
            onClick={() => onRegisterWithTier(selectedTier)}
            disabled={isPending || (selectedTier === 'monday' && mondayRemaining <= 0) || (selectedTier === 'tuesday' && tuesdayRemaining <= 0)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: '#635BFF' }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Subscribe - ${tierInfo.price / 100}/month
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Payment method type
type PaymentMethod = 'stripe' | 'paypal' | 'venmo';

// Registration modal for events with guest support and integrated payment
function RegistrationModal({
  event,
  onClose,
  onRegister,
  isPending
}: {
  event: Event;
  onClose: () => void;
  onRegister: (guests: GuestInput[], paymentOption: PaymentOption, paymentMethod?: PaymentMethod) => void;
  isPending: boolean;
}) {
  const maxGuests = event.max_guests || 0;
  const [guests, setGuests] = useState<GuestInput[]>([]);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('self_only');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const color = getEventColor(event);
  const pricePerPerson = event.price_cents ? event.price_cents / 100 : 0;
  const validGuests = guests.filter(g => g.name.trim() && g.email.trim());
  const createCheckout = useCreateStripeCheckout();
  const registerForEvent = useRegisterForEvent();
  const queryClient = useQueryClient();

  // Calculate total based on payment option
  const getTotal = () => {
    if (validGuests.length === 0) return pricePerPerson;
    switch (paymentOption) {
      case 'self_only': return pricePerPerson;
      case 'all_including_self': return pricePerPerson * (1 + validGuests.length);
      case 'guests_only': return pricePerPerson * validGuests.length;
      default: return pricePerPerson;
    }
  };
  const totalPrice = getTotal();

  const addGuest = () => {
    if (guests.length < maxGuests) {
      setGuests([...guests, { name: '', email: '' }]);
    }
  };

  const removeGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...guests];
    updated[index] = { ...updated[index], [field]: value };
    setGuests(updated);
  };

  // Handle registration with payment
  const handleRegisterAndPay = async () => {
    setIsProcessing(true);
    try {
      // First register the user
      const enrollment = await registerForEvent.mutateAsync({
        eventId: event.id,
        guests: validGuests,
        paymentOption,
      });

      if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const result = await createCheckout.mutateAsync({
          enrollmentId: enrollment.id,
          priceInCents: totalPrice * 100,
          eventName: event.name,
          isSubscription: false,
        });

        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
        }
      } else {
        // For PayPal/Venmo, mark as registered and let them pay externally
        // Update enrollment with payment method choice
        await supabase
          .from('enrollments')
          .update({
            payment_status: `pending_${paymentMethod}`,
          })
          .eq('id', enrollment.id);

        queryClient.invalidateQueries({ queryKey: ['my-event-enrollments'] });

        // Show payment instructions
        const paymentLinks = {
          paypal: 'https://paypal.me/laelaleonard',
          venmo: 'https://venmo.com/laelaleonard',
        };

        // Open payment link in new tab
        window.open(paymentLinks[paymentMethod], '_blank');

        // Close modal - registration is confirmed
        onClose();
        alert(`Registration confirmed! Please complete your $${totalPrice} payment via ${paymentMethod === 'paypal' ? 'PayPal' : 'Venmo'}. A payment link has been opened in a new tab.`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error instanceof Error ? error.message : 'Registration failed');
      setIsProcessing(false);
    }
  };

  const isWaitlist = (event.spots_filled || 0) >= (event.max_capacity || 999);
  const hasPaidEvent = pricePerPerson > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-1.5" style={{ backgroundColor: color }} />
        <div className="p-6 border-b border-foreground/[0.06]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground/85">{event.name}</h2>
              <p className="text-sm text-foreground/50 mt-1">
                {event.start_date
                  ? format(parseISO(event.start_date), 'MMMM d, yyyy')
                  : 'Schedule TBD'
                }
                {event.location && ` - ${event.location}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Price display */}
          {hasPaidEvent && (
            <div className="p-4 rounded-xl bg-foreground/[0.03] text-center">
              <p className="text-3xl font-semibold text-foreground/80">${totalPrice}</p>
              <p className="text-sm text-foreground/50 mt-1">
                {validGuests.length > 0 && paymentOption === 'all_including_self'
                  ? `${1 + validGuests.length} people × $${pricePerPerson}`
                  : 'Total due'
                }
              </p>
            </div>
          )}

          {/* Guest payment options - only show if there are guests */}
          {hasPaidEvent && validGuests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">Who's paying?</p>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-background border border-foreground/[0.06] cursor-pointer hover:border-foreground/[0.12] transition-colors">
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'all_including_self'}
                  onChange={() => setPaymentOption('all_including_self')}
                  className="w-4 h-4 accent-current"
                  style={{ accentColor: color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground/70">I'll pay for everyone</p>
                  <p className="text-xs text-foreground/40">${pricePerPerson * (1 + validGuests.length)} total</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-background border border-foreground/[0.06] cursor-pointer hover:border-foreground/[0.12] transition-colors">
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'self_only'}
                  onChange={() => setPaymentOption('self_only')}
                  className="w-4 h-4 accent-current"
                  style={{ accentColor: color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground/70">Guests pay separately</p>
                  <p className="text-xs text-foreground/40">Payment links sent via email</p>
                </div>
              </label>
            </div>
          )}

          {/* Payment method selection */}
          {hasPaidEvent && !isWaitlist && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">Payment Method</p>

              {/* Stripe / Credit Card */}
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  paymentMethod === 'stripe'
                    ? "border-[#635BFF] bg-[#635BFF]/5"
                    : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-[#635BFF] flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground/80">Credit / Debit Card</p>
                  <p className="text-xs text-foreground/50">Secure payment via Stripe</p>
                </div>
                {paymentMethod === 'stripe' && (
                  <Check className="h-5 w-5 text-[#635BFF]" />
                )}
              </button>

              {/* PayPal */}
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  paymentMethod === 'paypal'
                    ? "border-[#003087] bg-[#003087]/5"
                    : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-[#003087] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">PP</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground/80">PayPal</p>
                  <p className="text-xs text-foreground/50">Pay with your PayPal account</p>
                </div>
                {paymentMethod === 'paypal' && (
                  <Check className="h-5 w-5 text-[#003087]" />
                )}
              </button>

              {/* Venmo */}
              <button
                onClick={() => setPaymentMethod('venmo')}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  paymentMethod === 'venmo'
                    ? "border-[#008CFF] bg-[#008CFF]/5"
                    : "border-foreground/[0.08] hover:border-foreground/[0.15]"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-[#008CFF] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground/80">Venmo</p>
                  <p className="text-xs text-foreground/50">Pay with Venmo</p>
                </div>
                {paymentMethod === 'venmo' && (
                  <Check className="h-5 w-5 text-[#008CFF]" />
                )}
              </button>
            </div>
          )}

          {/* Guest section */}
          {maxGuests > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground/70">
                  Bringing guests? <span className="text-foreground/40">(up to {maxGuests})</span>
                </h3>
                {guests.length < maxGuests && (
                  <button
                    onClick={addGuest}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add Guest
                  </button>
                )}
              </div>

              <AnimatePresence mode="popLayout">
                {guests.map((guest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground/50">Guest {index + 1}</span>
                      <button
                        onClick={() => removeGuest(index)}
                        className="p-1 rounded text-foreground/30 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Guest name"
                      value={guest.name}
                      onChange={e => updateGuest(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-foreground/[0.08] text-sm text-foreground/80 placeholder:text-foreground/30 focus:outline-none focus:border-foreground/20"
                    />
                    <input
                      type="email"
                      placeholder="Guest email"
                      value={guest.email}
                      onChange={e => updateGuest(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-foreground/[0.08] text-sm text-foreground/80 placeholder:text-foreground/30 focus:outline-none focus:border-foreground/20"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-foreground/[0.06] bg-foreground/[0.02]">
          {/* Waitlist notice */}
          {isWaitlist && (
            <p className="text-xs text-foreground/50 text-center mb-3">
              This event is full. You'll be added to the waitlist and notified if a spot opens up.
            </p>
          )}

          {/* Register button */}
          {isWaitlist ? (
            <button
              onClick={() => onRegister(guests, paymentOption)}
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {isPending ? 'Joining...' : 'Join Waitlist'}
            </button>
          ) : hasPaidEvent ? (
            <button
              onClick={handleRegisterAndPay}
              disabled={isProcessing || isPending}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50",
                paymentMethod === 'stripe' && "bg-[#635BFF] hover:bg-[#5147e5]",
                paymentMethod === 'paypal' && "bg-[#003087] hover:bg-[#002060]",
                paymentMethod === 'venmo' && "bg-[#008CFF] hover:bg-[#0070d6]"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === 'stripe' && <CreditCard className="h-4 w-4" />}
                  {paymentMethod === 'paypal' && <span className="font-bold">PP</span>}
                  {paymentMethod === 'venmo' && <span className="font-bold">V</span>}
                  Register & Pay ${totalPrice}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => onRegister(guests, paymentOption)}
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {isPending ? 'Registering...' : 'Confirm Registration'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Payment Modal Component - Uses Stripe for payments
function PaymentModal({
  enrollment,
  event,
  onClose,
  onPaymentComplete
}: {
  enrollment: { id: string; payment_status: string | null };
  event: Event;
  onClose: () => void;
  onPaymentComplete: () => void;
}) {
  const createCheckout = useCreateStripeCheckout();
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success' | 'error'>('select');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedTier, setSelectedTier] = useState<CaseConsultTier>('monday');

  const color = getEventColor(event);
  const isCaseConsult = event.name === 'StepWise Group Case Consult';

  // For Case Consult, use tier pricing; otherwise use event price
  const amount = isCaseConsult
    ? CASE_CONSULT_TIERS[selectedTier].price / 100
    : (event.price_cents ? event.price_cents / 100 : 0);

  const handleStripePayment = async () => {
    setPaymentStep('processing');
    setErrorMessage('');

    try {
      // Save selected tier to enrollment for Case Consult
      if (isCaseConsult) {
        await supabase
          .from('enrollments')
          .update({ selected_tier: selectedTier })
          .eq('id', enrollment.id);
      }

      const priceInCents = isCaseConsult
        ? CASE_CONSULT_TIERS[selectedTier].price
        : (event.price_cents || 7500);

      const eventNameWithTier = isCaseConsult
        ? `${event.name} - ${CASE_CONSULT_TIERS[selectedTier].label} (${CASE_CONSULT_TIERS[selectedTier].schedule})`
        : event.name;

      const result = await createCheckout.mutateAsync({
        enrollmentId: enrollment.id,
        priceInCents,
        eventName: eventNameWithTier,
        isSubscription: isCaseConsult,
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setPaymentStep('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5" style={{ backgroundColor: color }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground/85">Complete Payment</h2>
              <p className="text-sm text-foreground/50 mt-1">{event.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {paymentStep === 'select' && (
            <div className="space-y-4">
              {/* Tier selection for Case Consult */}
              {isCaseConsult && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">Choose your plan</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedTier('monday')}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all",
                        selectedTier === 'monday'
                          ? "border-current bg-current/5"
                          : "border-foreground/10 hover:border-foreground/20"
                      )}
                      style={selectedTier === 'monday' ? { borderColor: color, backgroundColor: `${color}10` } : {}}
                    >
                      <Calendar className="h-5 w-5 mx-auto mb-2 text-foreground/50" />
                      <p className="font-semibold text-foreground/80">$75/mo</p>
                      <p className="font-medium text-foreground/70 mt-1">Mondays</p>
                      <p className="text-xs text-foreground/40 mt-1">1st Monday each month</p>
                    </button>
                    <button
                      onClick={() => setSelectedTier('tuesday')}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all relative",
                        selectedTier === 'tuesday'
                          ? "border-current bg-current/5"
                          : "border-foreground/10 hover:border-foreground/20"
                      )}
                      style={selectedTier === 'tuesday' ? { borderColor: color, backgroundColor: `${color}10` } : {}}
                    >
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-600">
                        2x sessions
                      </span>
                      <Calendar className="h-5 w-5 mx-auto mb-2 text-foreground/50" />
                      <p className="font-semibold text-foreground/80">$125/mo</p>
                      <p className="font-medium text-foreground/70 mt-1">Tuesdays</p>
                      <p className="text-xs text-foreground/40 mt-1">1st & 3rd Tuesday</p>
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-foreground/[0.03] text-center">
                <p className="text-2xl font-semibold text-foreground/80">${amount.toFixed(2)}</p>
                <p className="text-sm text-foreground/50 mt-1">
                  {isCaseConsult ? 'per month' : 'Total due'}
                </p>
                {isCaseConsult && (
                  <p className="text-xs text-foreground/40 mt-2">
                    Monthly subscription - cancel anytime
                  </p>
                )}
              </div>

              <button
                onClick={handleStripePayment}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#635BFF] text-white font-medium transition-all hover:bg-[#5147e5]"
              >
                <CreditCard className="h-5 w-5" />
                Pay with Card
              </button>

              <p className="text-xs text-foreground/40 text-center mt-4">
                Secure payment processed by Stripe
              </p>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-foreground/40" />
              <p className="text-sm text-foreground/50 mt-4">Connecting to payment...</p>
            </div>
          )}

          {paymentStep === 'error' && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-foreground/70 font-medium">Payment Error</p>
              <p className="text-sm text-foreground/50 mt-2">{errorMessage}</p>
              <button
                onClick={() => setPaymentStep('select')}
                className="mt-6 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: `${color}15`, color }}
              >
                Try Again
              </button>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-foreground/70 font-medium">Payment Complete!</p>
              <p className="text-sm text-foreground/50 mt-2">Thank you for your payment.</p>
              <button
                onClick={onPaymentComplete}
                className="mt-6 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: color }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Calendly Modal for scheduling after payment
function CalendlyModal({
  event,
  onClose
}: {
  event: Event;
  onClose: () => void;
}) {
  const color = getEventColor(event);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-background rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5" style={{ backgroundColor: color }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground/85">Schedule Your Session</h2>
              <p className="text-sm text-foreground/50 mt-1">{event.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/40 hover:text-foreground/60 hover:bg-foreground/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-foreground/60 text-sm">
              Choose your preferred day for the Group Case Consult session:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={CALENDLY_CASE_CONSULT_MONDAY}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                <Calendar className="h-5 w-5" />
                <span>Mondays</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>

              <a
                href={CALENDLY_CASE_CONSULT_TUESDAY}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                <Calendar className="h-5 w-5" />
                <span>Tuesdays</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>

            <p className="text-xs text-foreground/40 text-center">
              Opens Calendly in a new tab
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PortalEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = usePortalAuth();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: myRegistrations, isLoading: registrationsLoading } = useMyEventRegistrations();
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();
  const verifyPayment = useVerifyStripePayment();

  // Get Case Consult event ID for tier counts
  const caseConsultEvent = events?.find(e => e.name === 'StepWise Group Case Consult');
  const { data: tierCounts } = useCaseConsultTierCounts(caseConsultEvent?.id);
  const TIER_CAPACITY = 8;
  const mondayRemaining = TIER_CAPACITY - (tierCounts?.monday || 0);
  const tuesdayRemaining = TIER_CAPACITY - (tierCounts?.tuesday || 0);

  const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [paymentEnrollment, setPaymentEnrollment] = useState<{ id: string; event: Event } | null>(null);
  const [calendlyEvent, setCalendlyEvent] = useState<Event | null>(null);

  const isLoading = eventsLoading || registrationsLoading;

  // Handle Stripe return - verify payment after redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const enrollmentId = searchParams.get('enrollment');
    const sessionId = searchParams.get('session_id');

    if (paymentStatus === 'success' && enrollmentId) {
      // Verify the Stripe payment
      if (sessionId) {
        verifyPayment.mutate(
          { sessionId, enrollmentId },
          {
            onSuccess: (result) => {
              queryClient.invalidateQueries({ queryKey: ['my-event-enrollments'] });
              // If this is a Case Consult, show Calendly modal
              const event = events?.find(e =>
                myRegistrations?.some(r => r.id === enrollmentId && r.training_id === e.id)
              );
              if (event?.name === 'StepWise Group Case Consult' && result.success) {
                setCalendlyEvent(event);
              }
              setSearchParams({});
            },
            onError: (error) => {
              console.error('Payment verification failed:', error);
              setSearchParams({});
            }
          }
        );
      } else {
        // No session ID but marked success - just refresh
        queryClient.invalidateQueries({ queryKey: ['my-event-enrollments'] });
        setSearchParams({});
      }
    } else if (paymentStatus === 'cancelled') {
      setSearchParams({});
    }
  }, [searchParams, events, myRegistrations]);

  // Check if user is registered for an event
  const getRegistration = (eventId: string) => {
    return myRegistrations?.find(r => r.training_id === eventId);
  };

  const handleRegister = async (eventId: string, guests: GuestInput[], paymentOption: PaymentOption) => {
    try {
      const result = await registerMutation.mutateAsync({ eventId, guests, paymentOption });
      setRegisteringEvent(null);

      const event = events?.find(e => e.id === eventId);

      // Send payment emails to guests if "guests pay separately" was selected
      if (paymentOption === 'self_only' && guests && guests.length > 0 && event) {
        const registrantName = user?.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
          : user?.email || 'Someone';

        // Send emails to all guests (fire and forget, don't block)
        for (const guest of guests.filter(g => g.name.trim() && g.email.trim())) {
          sendGuestPaymentEmail(
            result.id,
            guest.email.trim(),
            guest.name.trim(),
            eventId,
            registrantName.trim()
          ).catch(err => console.error('Failed to send guest email:', err));
        }
      }

      // If event has a price and user is not on waitlist, show payment modal
      if (event && event.price_cents && event.price_cents > 0 && result.status !== 'waitlist') {
        setPaymentEnrollment({ id: result.id, event });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to register';
      alert(message);
    }
  };

  const handleCancel = async (registrationId: string, eventId: string) => {
    try {
      await cancelMutation.mutateAsync({ registrationId, eventId });
      setCancellingId(null);
    } catch {
      alert('Failed to cancel registration');
    }
  };

  // Handle Case Consult registration with tier - goes directly to Stripe subscription
  const createCheckout = useCreateStripeCheckout();
  const [caseConsultPending, setCaseConsultPending] = useState(false);

  const handleCaseConsultRegister = async (tier: CaseConsultTier) => {
    if (!registeringEvent) return;

    setCaseConsultPending(true);
    try {
      // First create the enrollment with the selected tier
      const result = await registerMutation.mutateAsync({
        eventId: registeringEvent.id,
        guests: [],
        paymentOption: 'self_only',
        selectedTier: tier
      });

      // Then create Stripe subscription checkout
      const tierInfo = CASE_CONSULT_TIERS[tier];
      const checkoutResult = await createCheckout.mutateAsync({
        enrollmentId: result.id,
        priceInCents: tierInfo.price,
        eventName: `${registeringEvent.name} - ${tierInfo.label} (${tierInfo.schedule})`,
        isSubscription: true,
      });

      if (checkoutResult.checkoutUrl) {
        window.location.href = checkoutResult.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Case Consult registration failed:', error);
      alert(error instanceof Error ? error.message : 'Registration failed');
      setCaseConsultPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground/85"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Upcoming Events
        </motion.h1>
        <motion.p
          className="mt-2 text-lg text-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Browse and register for StepWise trainings and workshops.
        </motion.p>
      </div>

      {/* My Registrations */}
      {myRegistrations && myRegistrations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-4">
            Your Registrations
          </h2>
          <div className="space-y-3">
            {myRegistrations.map((reg) => {
              const event = reg.training as unknown as { id: string; name: string; start_date: string; location: string; training_level: string; training_type: string; price_cents: number | null } | undefined;
              const color = getEventColor({ training_type: event?.training_type || null, training_level: event?.training_level || null });
              const isPaid = reg.payment_status === 'paid';
              const needsPayment = event?.price_cents && event.price_cents > 0 && !isPaid && reg.current_stage !== 'waitlist';

              return (
                <motion.div
                  key={reg.id}
                  className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-4"
                  style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          reg.current_stage === 'waitlist' ? "bg-orange-500/15 text-orange-500" : ""
                        )}
                        style={reg.current_stage !== 'waitlist' ? { backgroundColor: `${color}15`, color } : {}}
                      >
                        {reg.current_stage === 'waitlist' ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <Check className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground/80">
                            {event?.name || 'Event'}
                            {/* Show tier for Case Consult */}
                            {event?.name === 'StepWise Group Case Consult' && reg.selected_tier && (
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                reg.selected_tier === 'monday'
                                  ? 'bg-blue-500/15 text-blue-600'
                                  : 'bg-purple-500/15 text-purple-600'
                              }`}>
                                {reg.selected_tier === 'monday' ? 'Monday Tier' : 'Tuesday Tier'}
                              </span>
                            )}
                          </h3>
                          {reg.current_stage === 'waitlist' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/15 text-orange-500">
                              Waitlist
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/50">
                          {event?.name === 'StepWise Group Case Consult' ? (
                            reg.selected_tier === 'monday'
                              ? '1st Monday each month - 3-5pm PT / 6-8pm ET'
                              : '1st & 3rd Tuesday each month - 3-5pm PT / 6-8pm ET'
                          ) : (
                            <>
                              {event?.start_date ? format(parseISO(event.start_date), 'MMM d, yyyy') : ''}
                              {event?.location ? ` - ${event.location}` : ''}
                            </>
                          )}
                        </p>
                        {reg.guests && reg.guests.length > 0 && (
                          <p className="text-xs text-foreground/40 mt-1">
                            +{reg.guests.length} guest{reg.guests.length > 1 ? 's' : ''}: {reg.guests.map(g => g.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Payment status / Pay Now button */}
                      {needsPayment ? (
                        <button
                          onClick={() => event && setPaymentEnrollment({ id: reg.id, event: event as unknown as Event })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#635BFF] text-white hover:bg-[#5147e5] transition-colors"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pay Now
                        </button>
                      ) : isPaid ? (
                        <>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-600">
                            Paid
                          </span>
                          {/* Show Schedule button for Case Consult - only their tier's Calendly */}
                          {event?.name === 'StepWise Group Case Consult' && reg.selected_tier && (
                            <a
                              href={reg.selected_tier === 'monday' ? CALENDLY_CASE_CONSULT_MONDAY : CALENDLY_CASE_CONSULT_TUESDAY}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                reg.selected_tier === 'monday'
                                  ? 'bg-blue-500/15 text-blue-600 hover:bg-blue-500/25'
                                  : 'bg-purple-500/15 text-purple-600 hover:bg-purple-500/25'
                              }`}
                            >
                              <Calendar className="h-3 w-3" />
                              Schedule Session
                            </a>
                          )}
                        </>
                      ) : null}

                      {cancellingId === reg.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCancel(reg.id, reg.training_id)}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            disabled={cancelMutation.isPending}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setCancellingId(null)}
                            className="p-1 rounded-lg text-foreground/40 hover:text-foreground/60 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCancellingId(reg.id)}
                          className="text-xs text-foreground/40 hover:text-red-500 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Available Events */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-4">
          Available Events
        </h2>

        {events && events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => {
              const registration = getRegistration(event.id);
              const isRegistered = !!registration;
              const isFull = (event.spots_filled || 0) >= (event.max_capacity || 999);
              const spotsLeft = (event.max_capacity || 0) - (event.spots_filled || 0);
              const color = getEventColor(event);
              const isWorkshop = event.training_type === 'Workshop';

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className={cn(
                    'rounded-xl border bg-background/60 backdrop-blur-sm overflow-hidden transition-all duration-300',
                    isRegistered
                      ? 'border-green-500/30'
                      : 'border-foreground/[0.06] hover:border-foreground/[0.12] hover:shadow-lg hover:-translate-y-1'
                  )}
                >
                  {/* Header bar with level color */}
                  <div className="h-1.5" style={{ backgroundColor: color }} />

                  <div className="p-5 space-y-4">
                    {/* Event info */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-foreground/85 leading-tight">
                          {event.name}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium shrink-0"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          {event.training_type === 'Online' ? 'Online' : isWorkshop ? 'In Person' : event.training_level || 'Training'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-sm text-foreground/50">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>
                            {event.start_date ? (
                              `${format(parseISO(event.start_date), 'MMM d')} - ${format(parseISO(event.end_date), 'MMM d, yyyy')}`
                            ) : event.name === 'StepWise Group Case Consult' ? (
                              '1st Monday or 1st & 3rd Tuesday each month'
                            ) : (
                              'Schedule TBD'
                            )}
                          </span>
                        </div>
                        {(event.location || event.name === 'StepWise Group Case Consult') && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>
                              {event.name === 'StepWise Group Case Consult'
                                ? 'Online, Zoom - 3 PM PT / 6 PM ET'
                                : event.location}
                            </span>
                          </div>
                        )}
                        {event.name === 'StepWise Group Case Consult' ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 shrink-0" />
                              <span>Closed group. 5 month commitment.</span>
                            </div>
                            <div className="flex items-center gap-2 ml-6 text-sm">
                              <span>{mondayRemaining} left Monday</span>
                              <span className="text-foreground/30">|</span>
                              <span>{tuesdayRemaining} left Tuesday</span>
                            </div>
                          </div>
                        ) : event.max_capacity && (
                          <div className="flex items-center gap-2">
                            <Users className={cn(
                              "h-4 w-4 shrink-0",
                              isFull ? "text-red-500" : spotsLeft <= 3 ? "text-orange-500" : ""
                            )} />
                            <span className={cn(
                              isFull ? "text-red-500 font-medium" : spotsLeft <= 3 ? "text-orange-500 font-medium" : ""
                            )}>
                              {isFull ? (
                                "Full - Waitlist available"
                              ) : spotsLeft <= 3 ? (
                                `Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left!`
                              ) : (
                                `${spotsLeft} spots remaining`
                              )}
                            </span>
                          </div>
                        )}
                        {/* Pricing display */}
                        {event.name === 'StepWise Group Case Consult' ? (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 shrink-0" />
                            <span className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium" style={{ color }}>$75/mo</span>
                              <span className="text-foreground/40">Mon</span>
                              <span className="text-foreground/30">|</span>
                              <span className="font-medium" style={{ color }}>$125/mo</span>
                              <span className="text-foreground/40">Tue (2x)</span>
                            </span>
                          </div>
                        ) : event.price_cents && event.price_cents > 0 ? (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 shrink-0" />
                            <span>${event.price_cents / 100} per person</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Show description OR notes, not both (prefer description) */}
                      {event.description ? (
                        <p className="mt-3 text-sm text-foreground/40 line-clamp-2">
                          {event.description}
                        </p>
                      ) : event.notes ? (
                        <p className="mt-3 text-sm text-foreground/40 line-clamp-2">
                          {event.notes}
                        </p>
                      ) : null}
                    </div>

                    {/* Action */}
                    <div>
                      {isRegistered ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Registered</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRegisteringEvent(event)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          <Sparkles className="h-4 w-4" />
                          {isFull ? 'Join Waitlist' : 'Register'}
                          {event.max_guests != null && event.max_guests > 0 && (
                            <span className="text-xs opacity-70">+guests</span>
                          )}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-12 text-center">
            <Calendar className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground/60 mb-2">No upcoming events</h3>
            <p className="text-foreground/40">Check back soon for new trainings and workshops.</p>
          </div>
        )}
      </motion.div>

      {/* Registration Modal - different modal for Case Consult vs other events */}
      <AnimatePresence>
        {registeringEvent && (
          registeringEvent.name === 'StepWise Group Case Consult' ? (
            <CaseConsultRegistrationModal
              event={registeringEvent}
              onClose={() => { setRegisteringEvent(null); setCaseConsultPending(false); }}
              onRegisterWithTier={handleCaseConsultRegister}
              isPending={caseConsultPending}
              mondayRemaining={mondayRemaining}
              tuesdayRemaining={tuesdayRemaining}
            />
          ) : (
            <RegistrationModal
              event={registeringEvent}
              onClose={() => setRegisteringEvent(null)}
              onRegister={(guests, paymentOption) => handleRegister(registeringEvent.id, guests, paymentOption)}
              isPending={registerMutation.isPending}
            />
          )
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentEnrollment && (
          <PaymentModal
            enrollment={{ id: paymentEnrollment.id, payment_status: 'unpaid' }}
            event={paymentEnrollment.event}
            onClose={() => setPaymentEnrollment(null)}
            onPaymentComplete={() => {
              setPaymentEnrollment(null);
              queryClient.invalidateQueries({ queryKey: ['my-event-enrollments'] });
              // Show Calendly for Case Consult
              if (paymentEnrollment.event.name === 'StepWise Group Case Consult') {
                setCalendlyEvent(paymentEnrollment.event);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Calendly Modal for scheduling */}
      <AnimatePresence>
        {calendlyEvent && (
          <CalendlyModal
            event={calendlyEvent}
            onClose={() => setCalendlyEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
