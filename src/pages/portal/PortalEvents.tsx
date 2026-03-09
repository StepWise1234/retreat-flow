import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Check, X, ChevronRight, Sparkles, UserPlus, DollarSign, Trash2, CreditCard, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useEvents, useMyEventRegistrations, useRegisterForEvent, useCancelRegistration, sendGuestPaymentEmail, Event, GuestInput, PaymentOption } from '@/hooks/useEvents';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { useCreatePayPalOrder, useCapturePayPalOrder, useCreatePayPalSubscription, useActivatePayPalSubscription } from '@/hooks/usePayPal';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

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

// Registration modal for events with guest support
function RegistrationModal({
  event,
  onClose,
  onRegister,
  isPending
}: {
  event: Event;
  onClose: () => void;
  onRegister: (guests: GuestInput[], paymentOption: PaymentOption) => void;
  isPending: boolean;
}) {
  const maxGuests = event.max_guests || 0;
  const [guests, setGuests] = useState<GuestInput[]>([]);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('self_only');
  const color = getEventColor(event);
  const pricePerPerson = event.price_cents ? event.price_cents / 100 : 0;
  const validGuests = guests.filter(g => g.name.trim() && g.email.trim());

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
                  : '1st Tuesday of month @ 3pm PST'
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
          {/* Price info */}
          {pricePerPerson > 0 && (
            <div className="p-4 rounded-xl bg-foreground/[0.03] space-y-3">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground/70">${pricePerPerson} per person</p>
                  <p className="text-xs text-foreground/40 mt-0.5">Pay securely with PayPal or Venmo</p>
                </div>
              </div>

              {/* Payment options - only show if there are guests */}
              {validGuests.length > 0 && (
                <div className="pt-3 border-t border-foreground/[0.06] space-y-2">
                  <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">Payment Option</p>

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
                      <p className="text-sm font-medium text-foreground/70">I'll pay for all guests</p>
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
                      <p className="text-xs text-foreground/40">Payment links sent to each guest via email</p>
                    </div>
                  </label>
                </div>
              )}

              {/* Total summary */}
              {validGuests.length > 0 && paymentOption === 'all_including_self' && (
                <div className="pt-3 border-t border-foreground/[0.06]">
                  <p className="text-sm font-medium text-foreground/70">
                    Your total: <span style={{ color }}>${pricePerPerson * (1 + validGuests.length)}</span>
                  </p>
                </div>
              )}
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
          {(event.spots_filled || 0) >= (event.max_capacity || 999) && (
            <p className="text-xs text-foreground/50 text-center mb-3">
              This event is full. You'll be added to the waitlist and notified if a spot opens up.
            </p>
          )}
          <button
            onClick={() => onRegister(guests, paymentOption)}
            disabled={isPending}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: color }}
          >
            {isPending
              ? 'Registering...'
              : (event.spots_filled || 0) >= (event.max_capacity || 999)
                ? 'Join Waitlist'
                : 'Confirm Registration'
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Payment Modal Component
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
  const createOrder = useCreatePayPalOrder();
  const createSubscription = useCreatePayPalSubscription();
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success' | 'error'>('select');
  const [errorMessage, setErrorMessage] = useState('');

  const amount = event.price_cents ? event.price_cents / 100 : 0;
  const color = getEventColor(event);
  const isSubscription = event.name === 'StepWise Group Case Consult';

  const handlePayPalPayment = async () => {
    setPaymentStep('processing');
    setErrorMessage('');

    try {
      if (isSubscription) {
        // Create subscription for Case Consult (monthly)
        const result = await createSubscription.mutateAsync({
          enrollmentId: enrollment.id,
          priceInCents: event.price_cents || 7500,
          eventName: event.name,
        });

        if (result.approvalUrl) {
          window.location.href = result.approvalUrl;
        } else {
          throw new Error('No approval URL received');
        }
      } else {
        // One-time payment for other events
        const result = await createOrder.mutateAsync({
          enrollmentId: enrollment.id,
          amount,
          eventName: event.name,
        });

        if (result.approvalUrl) {
          window.location.href = result.approvalUrl;
        } else {
          throw new Error('No approval URL received');
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setPaymentStep('error');
    }
  };

  const handleVenmoPayment = async () => {
    // Venmo uses the same PayPal checkout flow - PayPal will show Venmo option
    // if user is on mobile and has Venmo app
    handlePayPalPayment();
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
              <div className="p-4 rounded-xl bg-foreground/[0.03] text-center">
                <p className="text-2xl font-semibold text-foreground/80">${amount.toFixed(2)}</p>
                <p className="text-sm text-foreground/50 mt-1">
                  {isSubscription ? 'per month' : 'Total due'}
                </p>
                {isSubscription && (
                  <p className="text-xs text-foreground/40 mt-2">
                    Monthly subscription - cancel anytime
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayPalPayment}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#0070ba] text-white font-medium transition-all hover:bg-[#005ea6]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.63h6.538c2.18 0 3.903.538 4.972 1.523.968.892 1.478 2.177 1.478 3.72 0 2.758-1.132 4.857-3.182 5.922-1.023.532-2.268.8-3.703.8H9.268l-1.09 5.283a.641.641 0 0 1-.627.52H7.5l-.424.48zm4.69-9.218h1.504c1.145 0 2.05-.234 2.691-.697.675-.488 1.077-1.246 1.194-2.254.084-.723.015-1.3-.206-1.716-.26-.493-.78-.87-1.503-.996a8.18 8.18 0 0 0-1.158-.069h-1.23l-.798 3.863-.494 1.869z"/>
                  </svg>
                  Pay with PayPal
                </button>

                <button
                  onClick={handleVenmoPayment}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#008CFF] text-white font-medium transition-all hover:bg-[#0070cc]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 3.5c.7 1.1 1 2.3 1 3.7 0 4.2-3.6 9.6-6.5 13.3H6.4L3.5 3.8h6.2l1.7 11.3c1.5-2.5 3.4-6.4 3.4-8.9 0-1.3-.2-2.2-.6-3l5.3.3z"/>
                  </svg>
                  Pay with Venmo
                </button>
              </div>

              <p className="text-xs text-foreground/40 text-center mt-4">
                Secure payment processed by PayPal
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

export default function PortalEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = usePortalAuth();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: myRegistrations, isLoading: registrationsLoading } = useMyEventRegistrations();
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();
  const captureOrder = useCapturePayPalOrder();
  const activateSubscription = useActivatePayPalSubscription();

  const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [paymentEnrollment, setPaymentEnrollment] = useState<{ id: string; event: Event } | null>(null);

  const isLoading = eventsLoading || registrationsLoading;

  // Handle PayPal return (one-time payments)
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const enrollmentId = searchParams.get('enrollment');
    const token = searchParams.get('token'); // PayPal order ID

    if (paymentStatus === 'success' && token && enrollmentId) {
      // Capture the payment
      captureOrder.mutate(
        { orderId: token, enrollmentId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-event-enrollments'] });
            // Clear URL params
            setSearchParams({});
          },
          onError: (error) => {
            console.error('Payment capture failed:', error);
            setSearchParams({});
          }
        }
      );
    } else if (paymentStatus === 'cancelled') {
      setSearchParams({});
    }
  }, [searchParams]);

  // Handle subscription return
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    const enrollmentId = searchParams.get('enrollment');
    const subscriptionId = searchParams.get('subscription_id');

    if (subscriptionStatus === 'success' && enrollmentId) {
      // Activate the subscription
      activateSubscription.mutate(
        { subscriptionId: subscriptionId || '', enrollmentId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-event-enrollments'] });
            setSearchParams({});
          },
          onError: (error) => {
            console.error('Subscription activation failed:', error);
            setSearchParams({});
          }
        }
      );
    } else if (subscriptionStatus === 'cancelled') {
      setSearchParams({});
    }
  }, [searchParams]);

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
                          </h3>
                          {reg.current_stage === 'waitlist' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/15 text-orange-500">
                              Waitlist
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/50">
                          {event?.start_date ? format(parseISO(event.start_date), 'MMM d, yyyy') : ''}
                          {event?.location ? ` - ${event.location}` : ''}
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
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0070ba] text-white hover:bg-[#005ea6] transition-colors"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pay Now
                        </button>
                      ) : isPaid ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-600">
                          Paid
                        </span>
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
                            ) : (
                              '1st Tuesday of month @ 3pm PST'
                            )}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.max_capacity && (
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
                        {event.price_cents && event.price_cents > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 shrink-0" />
                            {/* Show discount for Case Consult (was $125, now $75 = 40% off, monthly subscription) */}
                            {event.name === 'StepWise Group Case Consult' ? (
                              <span className="flex items-center gap-2 flex-wrap">
                                <span className="line-through text-foreground/30">$125</span>
                                <span className="font-medium" style={{ color }}>${event.price_cents / 100}/mo</span>
                                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-600">40% off</span>
                              </span>
                            ) : (
                              <span>${event.price_cents / 100} per person</span>
                            )}
                          </div>
                        )}
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

      {/* Registration Modal */}
      <AnimatePresence>
        {registeringEvent && (
          <RegistrationModal
            event={registeringEvent}
            onClose={() => setRegisteringEvent(null)}
            onRegister={(guests, paymentOption) => handleRegister(registeringEvent.id, guests, paymentOption)}
            isPending={registerMutation.isPending}
          />
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
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
