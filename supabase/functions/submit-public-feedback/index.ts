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

function textValue(input: Record<string, unknown>, key: string) {
  const value = input[key]
  return typeof value === 'string' ? value.trim() : ''
}

function nullableText(input: Record<string, unknown>, key: string) {
  const value = textValue(input, key)
  return value || null
}

function ratingValue(input: Record<string, unknown>, key: string) {
  const value = input[key]
  if (value === null || value === undefined) return null
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) return null
  return value
}

function booleanOrNull(input: Record<string, unknown>, key: string) {
  const value = input[key]
  return typeof value === 'boolean' ? value : null
}

function uuidOrNull(input: Record<string, unknown>, key: string) {
  const value = textValue(input, key)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null
}

function cleanPayload(input: Record<string, unknown>) {
  const trainingId = uuidOrNull(input, 'training_id')
  const trainingAttended = nullableText(input, 'training_attended')
  const additionalComments = nullableText(input, 'additional_comments')
  const testimonialApproved = 'testimonial_approved' in input
    ? booleanOrNull(input, 'testimonial_approved')
    : Boolean(input.can_use_testimonial && input.testimonial)

  return {
    training_id: trainingId,
    training_attended: trainingAttended,
    email: textValue(input, 'email').toLowerCase(),
    first_name: textValue(input, 'first_name'),
    last_name: textValue(input, 'last_name'),
    would_recommend: booleanOrNull(input, 'would_recommend'),
    overall_rating: ratingValue(input, 'overall_rating'),
    preparedness_rating: ratingValue(input, 'preparedness_rating'),
    most_valuable: nullableText(input, 'most_valuable'),
    improvements: nullableText(input, 'improvements'),
    registration_rating: ratingValue(input, 'registration_rating'),
    registration_comments: nullableText(input, 'registration_comments'),
    online_course_rating: ratingValue(input, 'online_course_rating'),
    online_course_comments: nullableText(input, 'online_course_comments'),
    had_technical_issues: booleanOrNull(input, 'had_technical_issues'),
    technical_issues_details: nullableText(input, 'technical_issues_details'),
    teaching_sessions_rating: ratingValue(input, 'teaching_sessions_rating') ?? ratingValue(input, 'content_rating'),
    teaching_sessions_comments: nullableText(input, 'teaching_sessions_comments'),
    experiential_rating: ratingValue(input, 'experiential_rating') ?? ratingValue(input, 'facilitator_rating'),
    experiential_comments: nullableText(input, 'experiential_comments'),
    laela_speech_clarity: ratingValue(input, 'laela_speech_clarity'),
    laela_material_organization: ratingValue(input, 'laela_material_organization'),
    laela_pace: ratingValue(input, 'laela_pace'),
    laela_engagement: ratingValue(input, 'laela_engagement'),
    laela_question_answering: ratingValue(input, 'laela_question_answering'),
    laela_fostering_participation: ratingValue(input, 'laela_fostering_participation'),
    laela_improvement_suggestions: nullableText(input, 'laela_improvement_suggestions'),
    john_speech_clarity: ratingValue(input, 'john_speech_clarity'),
    john_material_organization: ratingValue(input, 'john_material_organization'),
    john_pace: ratingValue(input, 'john_pace'),
    john_engagement: ratingValue(input, 'john_engagement'),
    john_question_answering: ratingValue(input, 'john_question_answering'),
    john_fostering_participation: ratingValue(input, 'john_fostering_participation'),
    john_improvement_suggestions: nullableText(input, 'john_improvement_suggestions'),
    accommodations_rating: ratingValue(input, 'accommodations_rating') ?? ratingValue(input, 'venue_rating'),
    accommodations_comments: nullableText(input, 'accommodations_comments'),
    meals_rating: ratingValue(input, 'meals_rating'),
    additional_comments: [
      trainingAttended ? `Training attended: ${trainingAttended}` : null,
      additionalComments,
    ].filter(Boolean).join('\n\n') || null,
    excellence_feedback: nullableText(input, 'excellence_feedback'),
    testimonial: nullableText(input, 'testimonial'),
    testimonial_approved: testimonialApproved,
    testimonial_display_name: nullableText(input, 'testimonial_display_name') || textValue(input, 'first_name') || null,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return jsonResponse({ error: 'Invalid feedback payload' }, 400)
    }

    const payload = cleanPayload(body as Record<string, unknown>)

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.email.includes('@')) {
      return jsonResponse({ error: 'Name and valid email are required' }, 400)
    }

    if (!payload.training_attended && !payload.training_id) {
      return jsonResponse({ error: 'Training is required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await supabase
      .from('public_feedback')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('[submit-public-feedback] insert failed', error)
      return jsonResponse({ error: 'Failed to submit feedback' }, 500)
    }

    return jsonResponse({ ok: true, id: data.id })
  } catch (error) {
    console.error('[submit-public-feedback] unhandled error', error)
    return jsonResponse({ error: 'Failed to submit feedback' }, 500)
  }
})
