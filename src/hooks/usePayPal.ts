import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateOrderParams {
  enrollmentId: string;
  amount: number;
  eventName: string;
}

interface CaptureOrderParams {
  orderId: string;
  enrollmentId: string;
}

export function useCreatePayPalOrder() {
  return useMutation({
    mutationFn: async ({ enrollmentId, amount, eventName }: CreateOrderParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('paypal-create-order', {
        body: { enrollmentId, amount, eventName },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create PayPal order');
      }

      return response.data as { orderId: string; approvalUrl: string; status: string };
    },
  });
}

export function useCapturePayPalOrder() {
  return useMutation({
    mutationFn: async ({ orderId, enrollmentId }: CaptureOrderParams) => {
      const response = await supabase.functions.invoke('paypal-capture-order', {
        body: { orderId, enrollmentId },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to capture payment');
      }

      return response.data as { success: boolean; transactionId: string; amountPaid: string };
    },
  });
}

// Subscription functions for recurring payments (Case Consult)
interface CreateSubscriptionParams {
  enrollmentId: string;
  priceInCents: number;
  eventName: string;
}

interface ActivateSubscriptionParams {
  subscriptionId: string;
  enrollmentId: string;
}

export function useCreatePayPalSubscription() {
  return useMutation({
    mutationFn: async ({ enrollmentId, priceInCents, eventName }: CreateSubscriptionParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('paypal-create-subscription', {
        body: { enrollmentId, priceInCents, eventName },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create subscription');
      }

      return response.data as { subscriptionId: string; approvalUrl: string; status: string };
    },
  });
}

export function useActivatePayPalSubscription() {
  return useMutation({
    mutationFn: async ({ subscriptionId, enrollmentId }: ActivateSubscriptionParams) => {
      const response = await supabase.functions.invoke('paypal-activate-subscription', {
        body: { subscriptionId, enrollmentId },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to activate subscription');
      }

      return response.data as { success: boolean; status: string; nextBillingDate?: string };
    },
  });
}
