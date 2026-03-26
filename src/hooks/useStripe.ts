import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateCheckoutParams {
  enrollmentId: string;
  priceInCents: number;
  eventName: string;
  isSubscription?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

export function useCreateStripeCheckout() {
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      priceInCents,
      eventName,
      isSubscription = false,
      successUrl,
      cancelUrl
    }: CreateCheckoutParams): Promise<CheckoutResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const baseUrl = window.location.origin;

      const response = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          enrollmentId,
          priceInCents,
          eventName,
          isSubscription,
          successUrl: successUrl || `${baseUrl}/portal/events?payment=success&enrollment=${enrollmentId}`,
          cancelUrl: cancelUrl || `${baseUrl}/portal/events?payment=cancelled`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      return response.data as CheckoutResult;
    },
  });
}

interface VerifyPaymentParams {
  sessionId: string;
  enrollmentId: string;
}

export function useVerifyStripePayment() {
  return useMutation({
    mutationFn: async ({ sessionId, enrollmentId }: VerifyPaymentParams) => {
      const response = await supabase.functions.invoke('stripe-verify-payment', {
        body: { sessionId, enrollmentId },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to verify payment');
      }

      return response.data as {
        success: boolean;
        paymentStatus: string;
        amountPaid?: number;
        subscriptionId?: string;
      };
    },
  });
}

// Helper to load Stripe.js
let stripePromise: Promise<typeof import('@stripe/stripe-js').Stripe | null> | null = null;

export function getStripe() {
  if (!stripePromise) {
    // Stripe publishable key will be loaded from env or fetched from server
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) =>
        loadStripe(publishableKey)
      );
    }
  }
  return stripePromise;
}
