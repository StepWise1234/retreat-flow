import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function stringOrNull(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getDisplayName(user: { email?: string; phone?: string; user_metadata?: Record<string, unknown> }) {
  const firstName = stringOrNull(user.user_metadata?.first_name)
  const lastName = stringOrNull(user.user_metadata?.last_name)
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  return user.email?.split('@')[0] || 'Portal User'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Authentication required' }, 401)
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return jsonResponse({ error: 'Invalid training selection payload' }, 400)
    }

    const trainingId = stringOrNull((body as Record<string, unknown>).training_id)
    const applicationId = stringOrNull((body as Record<string, unknown>).application_id)
    if (!trainingId) {
      return jsonResponse({ error: 'training_id is required' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: authData, error: authError } = await userClient.auth.getUser()
    if (authError || !authData.user?.email) {
      return jsonResponse({ error: 'Authentication required' }, 401)
    }

    const user = authData.user
    const email = user.email.toLowerCase()
    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: training, error: trainingError } = await admin
      .from('trainings')
      .select('id, name, training_level, show_on_apply, max_capacity, spots_filled, start_date, price_cents')
      .eq('id', trainingId)
      .single()

    if (trainingError || !training) {
      return jsonResponse({ error: 'Training not found' }, 404)
    }

    const spotsLeft = Number(training.max_capacity || 0) - Number(training.spots_filled || 0)
    if (training.training_level !== 'Beginning' || !training.show_on_apply || spotsLeft <= 0) {
      return jsonResponse({ error: 'Training is no longer available' }, 400)
    }

    const { data: existingApplicants, error: applicantFetchError } = await admin
      .from('applicants')
      .select('id')
      .ilike('email', email)
      .order('created_at', { ascending: false })
      .limit(1)

    if (applicantFetchError) {
      console.error('[select-training] applicant lookup failed', applicantFetchError)
      return jsonResponse({ error: 'Failed to select training' }, 500)
    }

    const applicantId = existingApplicants?.[0]?.id ?? null
    if (applicantId) {
      const { error: updateApplicantError } = await admin
        .from('applicants')
        .update({
          training_id: trainingId,
          pipeline_stage: 'interview',
          app_status: 'Interview Scheduled',
          notes: `Selected training from portal on ${new Date().toISOString().split('T')[0]}`,
        })
        .eq('id', applicantId)

      if (updateApplicantError) {
        console.error('[select-training] applicant update failed', updateApplicantError)
        return jsonResponse({ error: 'Failed to select training' }, 500)
      }
    } else {
      const { error: insertApplicantError } = await admin
        .from('applicants')
        .insert({
          name: getDisplayName(user),
          email,
          phone: user.phone || null,
          training_id: trainingId,
          pipeline_stage: 'interview',
          app_status: 'Interview Scheduled',
          application_date: new Date().toISOString(),
          notes: `Selected training from portal on ${new Date().toISOString().split('T')[0]}`,
        })

      if (insertApplicantError) {
        console.error('[select-training] applicant insert failed', insertApplicantError)
        return jsonResponse({ error: 'Failed to select training' }, 500)
      }
    }

    let selectedApplicationId = applicationId
    if (selectedApplicationId) {
      const { error: updateApplicationError } = await admin
        .from('applications')
        .update({ training_id: trainingId, status: 'interview' })
        .eq('id', selectedApplicationId)
        .eq('user_id', user.id)

      if (updateApplicationError) {
        console.error('[select-training] application update failed', updateApplicationError)
        return jsonResponse({ error: 'Failed to select training' }, 500)
      }
    } else {
      const { data: existingApplication, error: existingApplicationError } = await admin
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingApplicationError) {
        console.error('[select-training] application lookup failed', existingApplicationError)
        return jsonResponse({ error: 'Failed to select training' }, 500)
      }

      if (existingApplication?.id) {
        selectedApplicationId = existingApplication.id
        const { error: updateExistingApplicationError } = await admin
          .from('applications')
          .update({ training_id: trainingId, status: 'interview' })
          .eq('id', selectedApplicationId)
          .eq('user_id', user.id)

        if (updateExistingApplicationError) {
          console.error('[select-training] existing application update failed', updateExistingApplicationError)
          return jsonResponse({ error: 'Failed to select training' }, 500)
        }
      } else {
        const firstName = stringOrNull(user.user_metadata?.first_name) || getDisplayName(user)
        const lastName = stringOrNull(user.user_metadata?.last_name) || ''
        const { data: newApplication, error: insertApplicationError } = await admin
          .from('applications')
          .insert({
            user_id: user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            training_id: trainingId,
            status: 'interview',
          })
          .select('id')
          .single()

        if (insertApplicationError) {
          console.error('[select-training] application insert failed', insertApplicationError)
          return jsonResponse({ error: 'Failed to select training' }, 500)
        }
        selectedApplicationId = newApplication.id
      }
    }

    const { data: existingEnrollments, error: existingEnrollmentError } = await admin
      .from('enrollments')
      .select('id, payment_status')
      .eq('user_id', user.id)
      .eq('training_id', trainingId)
      .neq('status', 'cancelled')
      .limit(1)

    if (existingEnrollmentError) {
      console.error('[select-training] enrollment lookup failed', existingEnrollmentError)
      return jsonResponse({ error: 'Failed to select training' }, 500)
    }

    let enrollmentId = existingEnrollments?.[0]?.id ?? null
    let paymentStatus = existingEnrollments?.[0]?.payment_status ?? null
    const alreadyRegistered = Boolean(enrollmentId)

    if (!enrollmentId) {
      const { data: newEnrollment, error: insertEnrollmentError } = await admin
        .from('enrollments')
        .insert({
          training_id: trainingId,
          user_id: user.id,
          status: 'registered',
          payment_status: Number(training.price_cents || 0) > 0 ? 'unpaid' : 'paid',
          notes: 'Registered from portal accommodation training selection',
        })
        .select('id, payment_status')
        .single()

      if (insertEnrollmentError) {
        console.error('[select-training] enrollment insert failed', insertEnrollmentError)
        return jsonResponse({ error: 'Failed to select training' }, 500)
      }

      enrollmentId = newEnrollment.id
      paymentStatus = newEnrollment.payment_status

      const { error: incrementError } = await admin.rpc('increment_spots_filled', { p_training_id: trainingId })
      if (incrementError) {
        console.error('[select-training] spots_filled increment failed', incrementError)
      }
    }

    return jsonResponse({
      ok: true,
      application_id: selectedApplicationId,
      enrollment_id: enrollmentId,
      training_name: training.name,
      price_cents: training.price_cents ?? 0,
      payment_status: paymentStatus,
      already_registered: alreadyRegistered,
    })
  } catch (error) {
    console.error('[select-training] unhandled error', error)
    return jsonResponse({ error: 'Failed to select training' }, 500)
  }
})
