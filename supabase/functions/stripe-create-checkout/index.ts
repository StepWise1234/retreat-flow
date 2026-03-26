import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
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

    const { enrollmentId, priceInCents, eventName, isSubscription, successUrl, cancelUrl } = await req.json()

    if (!enrollmentId || !priceInCents || !eventName) {
      throw new Error('Missing required parameters')
    }

    // Get enrollment and user info
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('*, training:trainings(*)')
      .eq('id', enrollmentId)
      .single()

    if (enrollmentError || !enrollment) {
      throw new Error('Enrollment not found')
    }

    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(enrollment.user_id)
    if (userError || !user) {
      throw new Error('User not found')
    }

    let session: Stripe.Checkout.Session

    if (isSubscription) {
      // Create a subscription checkout (for monthly recurring like Case Consult)
      // First, ensure we have a product and price
      const productName = `${eventName} - Monthly Subscription`

      // Check if price already exists or create one
      const prices = await stripe.prices.list({
        lookup_keys: [`${eventName.toLowerCase().replace(/\s+/g, '_')}_monthly`],
        limit: 1,
      })

      let priceId: string

      if (prices.data.length > 0) {
        priceId = prices.data[0].id
      } else {
        // Create a new recurring price
        const product = await stripe.products.create({
          name: productName,
          description: `Monthly subscription to ${eventName}`,
        })

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceInCents,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          lookup_key: `${eventName.toLowerCase().replace(/\s+/g, '_')}_monthly`,
        })

        priceId = price.id
      }

      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          enrollmentId,
          eventName,
          type: 'subscription',
        },
        subscription_data: {
          metadata: {
            enrollmentId,
            eventName,
          },
        },
      })
    } else {
      // One-time payment
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: eventName,
                description: enrollment.training?.location
                  ? `${eventName} at ${enrollment.training.location}`
                  : eventName,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          enrollmentId,
          eventName,
          type: 'one_time',
        },
      })
    }

    // Store checkout session ID on enrollment for verification later
    await supabase
      .from('enrollments')
      .update({
        stripe_checkout_session_id: session.id,
        payment_status: 'pending'
      })
      .eq('id', enrollmentId)

    return new Response(
      JSON.stringify({
        checkoutUrl: session.url,
        sessionId: session.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating checkout:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
