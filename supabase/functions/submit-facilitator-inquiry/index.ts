import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const allowedColumns = new Set([
  'first_name',
  'last_name',
  'email',
  'phone',
  'location',
  'previous_experience',
  'current_support',
  'goals',
  'how_heard',
  'additional_info',
])

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function cleanPayload(input: Record<string, unknown>) {
  const payload: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (allowedColumns.has(key)) {
      payload[key] = typeof value === 'string' ? value.trim() : value
    }
  }

  payload.first_name = typeof payload.first_name === 'string' ? payload.first_name.trim() : ''
  payload.email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
  payload.status = 'new'

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
      return jsonResponse({ error: 'Invalid inquiry payload' }, 400)
    }

    const payload = cleanPayload(body as Record<string, unknown>)
    const firstName = String(payload.first_name || '')
    const email = String(payload.email || '')

    if (!firstName || !email || !email.includes('@')) {
      return jsonResponse({ error: 'First name and valid email are required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await supabase
      .from('facilitator_inquiries')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('[submit-facilitator-inquiry] insert failed', error)
      return jsonResponse({ error: 'Failed to submit inquiry' }, 500)
    }

    return jsonResponse({ ok: true, id: data.id })
  } catch (error) {
    console.error('[submit-facilitator-inquiry] unhandled error', error)
    return jsonResponse({ error: 'Failed to submit inquiry' }, 500)
  }
})
