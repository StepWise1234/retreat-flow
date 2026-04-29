import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const allowedColumns = new Set([
  'name',
  'email',
  'phone',
  'address',
  'birth_date',
  'emergency_contact_name',
  'emergency_contact_phone',
  'training_id',
  'pipeline_stage',
  'app_status',
  'application_date',
  'dietary_preferences',
  'allergies',
  'physical_health',
  'physical_medications',
  'mental_health_dx',
  'current_mental_health',
  'psych_medications',
  'stress_level',
  'suicide_consideration',
  'life_experiences',
  'cognitive_symptoms',
  'coping_mechanisms',
  'support_network',
  'self_care',
  'stress_sources',
  'trauma_details',
  'journey_work_experience',
  'medicine_experience',
  'serving_experience',
  'training_goals',
  'mental_health_support',
  'psychedelic_medicine_use',
  'physical_symptoms',
  'life_circumstances',
  'integration_support',
  'supplements',
  'recreational_drug_use',
  'strengths_hobbies',
  'anything_else',
  'notes',
])

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function cleanApplicationPayload(input: Record<string, unknown>) {
  const payload: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (allowedColumns.has(key)) payload[key] = value
  }

  payload.name = typeof payload.name === 'string' ? payload.name.trim() : ''
  payload.email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
  payload.pipeline_stage = payload.pipeline_stage || 'lead'
  payload.app_status = payload.app_status || 'Received'
  payload.application_date = payload.application_date || new Date().toISOString()

  return payload
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
      return jsonResponse({ error: 'Invalid application payload' }, 400)
    }

    const payload = cleanApplicationPayload(body as Record<string, unknown>)
    const email = String(payload.email || '')
    const name = String(payload.name || '')

    if (!name || !email || !email.includes('@')) {
      return jsonResponse({ error: 'Name and valid email are required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await supabase
      .from('applicants')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('[submit-application] insert failed', error)
      return jsonResponse({ error: 'Failed to submit application' }, 500)
    }

    return jsonResponse({ ok: true, id: data.id })
  } catch (error) {
    console.error('[submit-application] unhandled error', error)
    return jsonResponse({ error: 'Failed to submit application' }, 500)
  }
})
