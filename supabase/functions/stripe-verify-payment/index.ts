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

    if (!enrollmentId) {
      throw new Error('Missing enrollmentId')
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, user_id, stripe_checkout_session_id')
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError || !enrollment) {
      throw new Error('Enrollment not found')
    }

    const resolveSession = async () => {
      if (sessionId) {
        return stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['subscription', 'payment_intent'],
        })
      }

      if (enrollment.stripe_checkout_session_id) {
        return stripe.checkout.sessions.retrieve(enrollment.stripe_checkout_session_id, {
          expand: ['subscription', 'payment_intent'],
        })
      }

      let startingAfter: string | undefined
      for (let i = 0; i < 20; i++) {
        const page = await stripe.checkout.sessions.list({
          limit: 100,
          starting_after: startingAfter,
        })
        const match = page.data.find((candidate) => candidate.metadata?.enrollmentId === enrollmentId)
        if (match) {
          return stripe.checkout.sessions.retrieve(match.id, {
            expand: ['subscription', 'payment_intent'],
          })
        }
        if (!page.has_more || page.data.length === 0) break
        startingAfter = page.data[page.data.length - 1].id
      }
      throw new Error('Stripe checkout session not found for enrollment')
    }

    // Retrieve the checkout session from Stripe
    const session = await resolveSession()

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
      stripe_checkout_session_id: session.id,
    }

    if (subscriptionId) {
      updateData.stripe_subscription_id = subscriptionId
    }

    if (amountPaid) {
      updateData.payment_amount_cents = amountPaid
      updateData.payment_date = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
    if (updateError) {
      throw new Error(`Failed to update enrollment payment status: ${updateError.message}`)
    }

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
