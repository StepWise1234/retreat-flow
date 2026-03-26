import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { sessionId, enrollmentId } = await req.json()

    if (!sessionId || !enrollmentId) {
      throw new Error('Missing sessionId or enrollmentId')
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'payment_intent'],
    })

    // Verify the session matches the enrollment
    if (session.metadata?.enrollmentId !== enrollmentId) {
      throw new Error('Session does not match enrollment')
    }

    let paymentStatus = 'unpaid'
    let amountPaid: number | undefined
    let subscriptionId: string | undefined

    if (session.mode === 'subscription') {
      const subscription = session.subscription as Stripe.Subscription
      if (subscription && subscription.status === 'active') {
        paymentStatus = 'paid'
        subscriptionId = subscription.id
        amountPaid = subscription.items.data[0]?.price?.unit_amount || undefined
      }
    } else {
      const paymentIntent = session.payment_intent as Stripe.PaymentIntent
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        paymentStatus = 'paid'
        amountPaid = paymentIntent.amount_received
      }
    }

    // Update enrollment with payment status
    const updateData: Record<string, unknown> = {
      payment_status: paymentStatus,
    }

    if (subscriptionId) {
      updateData.stripe_subscription_id = subscriptionId
    }

    if (amountPaid) {
      updateData.amount_paid_cents = amountPaid
    }

    await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)

    return new Response(
      JSON.stringify({
        success: paymentStatus === 'paid',
        paymentStatus,
        amountPaid: amountPaid ? amountPaid / 100 : undefined,
        subscriptionId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
