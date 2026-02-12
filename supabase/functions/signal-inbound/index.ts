import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * signal-inbound
 *
 * Webhook receiver for Signal Bridge.
 * The Signal Bridge POSTs inbound messages to this endpoint.
 *
 * Expected payload:
 * {
 *   from: string,           // sender phone/handle
 *   to: string,             // receiver (our number)
 *   messageText: string,
 *   timestamp: string,      // ISO 8601
 *   providerMessageId: string,
 *   groupId?: string,       // optional group/thread
 *   attachments?: Array<{ filename: string, contentType: string, size: number }>
 * }
 *
 * Also handles delivery/read receipt updates:
 * POST with { type: "status", providerMessageId, status: "Delivered"|"Read" }
 */

interface InboundSignalMessage {
  from: string;
  to: string;
  messageText: string;
  timestamp?: string;
  providerMessageId?: string;
  groupId?: string;
  attachments?: Array<{ filename: string; contentType: string; size: number }>;
}

interface StatusUpdate {
  type: "status";
  providerMessageId: string;
  status: "Delivered" | "Read";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const correlationId = crypto.randomUUID();

  try {
    const payload = await req.json();

    // Validate Signal Bridge API token if configured
    const { data: settings } = await supabase
      .from("signal_settings")
      .select("signal_api_token")
      .limit(1)
      .maybeSingle();

    if (!settings?.signal_api_token) {
      console.warn("[signal-inbound] Webhook authentication not configured");
      return jsonResponse({ error: "Webhook authentication not configured" }, 503);
    }

    const authHeader = req.headers.get("Authorization");
    const expectedToken = `Bearer ${settings.signal_api_token}`;
    if (authHeader !== expectedToken) {
      console.warn("[signal-inbound] Invalid auth token");
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Route: delivery/read status update
    if (payload.type === "status") {
      return await handleStatusUpdate(supabase, payload as StatusUpdate, correlationId);
    }

    // Route: inbound message
    return await handleInboundMessage(supabase, payload as InboundSignalMessage, correlationId);
  } catch (err: any) {
    const errMsg = err.message || "Unknown error";
    console.error(`[signal-inbound] Unhandled error:`, err);
    await logIntegration(supabase, "SignalBridge", "receive_inbound", "error", errMsg, correlationId);
    return jsonResponse({ error: errMsg }, 500);
  }
});

// ─── Inbound Message Handler ───

async function handleInboundMessage(
  supabase: any,
  msg: InboundSignalMessage,
  correlationId: string
): Promise<Response> {
  if (!msg.from || !msg.messageText) {
    return jsonResponse({ error: "Missing required fields: from, messageText" }, 400);
  }

  // Input validation: enforce length limits
  if (typeof msg.from !== "string" || msg.from.length > 50) {
    return jsonResponse({ error: "Invalid 'from' field: must be a string of 50 characters or less" }, 400);
  }
  if (typeof msg.messageText !== "string" || msg.messageText.length > 100000) {
    return jsonResponse({ error: "Invalid 'messageText': must be 100,000 characters or less" }, 400);
  }
  if (msg.to && (typeof msg.to !== "string" || msg.to.length > 50)) {
    return jsonResponse({ error: "Invalid 'to' field: must be a string of 50 characters or less" }, 400);
  }
  if (msg.providerMessageId && (typeof msg.providerMessageId !== "string" || msg.providerMessageId.length > 255)) {
    return jsonResponse({ error: "Invalid 'providerMessageId': must be 255 characters or less" }, 400);
  }

  const senderHandle = msg.from;
  const providerMsgId = msg.providerMessageId || crypto.randomUUID();

  console.log(`[signal-inbound] Inbound from ${senderHandle}, msgId: ${providerMsgId}, correlation: ${correlationId}`);

  // Idempotency check
  const { data: existing } = await supabase
    .from("messages")
    .select("id")
    .eq("provider_message_id", providerMsgId)
    .eq("direction", "Inbound")
    .eq("channel", "Signal")
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`[signal-inbound] Duplicate message ${providerMsgId}, skipping`);
    return jsonResponse({ status: "duplicate", messageId: existing[0].id });
  }

  // Match sender to participant
  // Look for outbound Signal messages sent to this handle
  const { data: matchedMessages } = await supabase
    .from("messages")
    .select("participant_id, retreat_id, registration_id, conversation_id")
    .eq("to_address", senderHandle)
    .eq("channel", "Signal")
    .eq("direction", "Outbound")
    .order("created_at", { ascending: false })
    .limit(1);

  let participantId: string;
  let retreatId: string | null = null;
  let registrationId: string | null = null;
  let conversationId: string | null = null;

  if (matchedMessages && matchedMessages.length > 0) {
    const match = matchedMessages[0];
    participantId = match.participant_id;
    retreatId = match.retreat_id;
    registrationId = match.registration_id;
    conversationId = match.conversation_id;
    console.log(`[signal-inbound] Matched sender ${senderHandle} to participant ${participantId}`);
  } else {
    participantId = `unmatched-${crypto.randomUUID().substring(0, 8)}`;
    console.log(`[signal-inbound] Unmatched sender ${senderHandle}, placeholder: ${participantId}`);
  }

  // Find or create conversation
  if (!conversationId) {
    const { data: existingConvs } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_id", participantId)
      .eq("is_archived", false)
      .limit(1);

    if (existingConvs && existingConvs.length > 0) {
      conversationId = existingConvs[0].id;
    } else {
      const { data: newConv, error: convErr } = await supabase
        .from("conversations")
        .insert({
          participant_id: participantId,
          retreat_id: retreatId,
          registration_id: registrationId,
          channels_enabled: ["Signal"],
        })
        .select()
        .single();

      if (convErr) throw convErr;
      conversationId = newConv.id;
      console.log(`[signal-inbound] Created conversation ${conversationId} for ${senderHandle}`);
    }
  }

  // Insert inbound message
  const messageTimestamp = msg.timestamp || new Date().toISOString();

  const { data: inserted, error: insertErr } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    participant_id: participantId,
    retreat_id: retreatId || "unknown",
    registration_id: registrationId || "unknown",
    channel: "Signal",
    direction: "Inbound",
    from_address: senderHandle,
    to_address: msg.to || "self",
    subject: null,
    body: msg.messageText,
    status: "Delivered",
    read_status: "Unread",
    provider: "SignalBridge",
    provider_message_id: providerMsgId,
    external_thread_id: msg.groupId || null,
    idempotency_key: providerMsgId,
    raw_payload: {
      attachments: msg.attachments || [],
      groupId: msg.groupId,
    },
    sent_at: messageTimestamp,
    delivered_at: new Date().toISOString(),
  }).select().single();

  if (insertErr) throw insertErr;

  // Update conversation metadata
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: msg.messageText.substring(0, 120),
    })
    .eq("id", conversationId);

  // Increment unread count
  const { data: conv } = await supabase
    .from("conversations")
    .select("unread_count, channels_enabled")
    .eq("id", conversationId)
    .single();

  if (conv) {
    const updates: Record<string, any> = {
      unread_count: (conv.unread_count || 0) + 1,
    };
    if (!conv.channels_enabled.includes("Signal")) {
      updates.channels_enabled = [...conv.channels_enabled, "Signal"];
    }
    await supabase.from("conversations").update(updates).eq("id", conversationId);
  }

  // Log success
  await logIntegration(supabase, "SignalBridge", "receive_inbound", "success", null, correlationId, {
    from: senderHandle,
    providerMessageId: providerMsgId,
    conversationId,
  });

  // Update signal_settings health
  await supabase.from("signal_settings").update({
    is_healthy: true,
    last_tested_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
    last_error: null,
  }).limit(1);

  console.log(`[signal-inbound] Stored inbound Signal message from ${senderHandle}`);

  return jsonResponse({
    status: "ok",
    messageId: inserted.id,
    conversationId,
  });
}

// ─── Status Update Handler ───

async function handleStatusUpdate(
  supabase: any,
  update: StatusUpdate,
  correlationId: string
): Promise<Response> {
  if (!update.providerMessageId || !update.status) {
    return jsonResponse({ error: "Missing providerMessageId or status" }, 400);
  }

  // Validate status is an expected value
  const allowedStatuses = ["Delivered", "Read"];
  if (!allowedStatuses.includes(update.status)) {
    return jsonResponse({ error: "Invalid status value" }, 400);
  }
  if (typeof update.providerMessageId !== "string" || update.providerMessageId.length > 255) {
    return jsonResponse({ error: "Invalid providerMessageId" }, 400);
  }

  console.log(`[signal-inbound] Status update: ${update.providerMessageId} → ${update.status}`);

  const statusMap: Record<string, string> = {
    Delivered: "Delivered",
    Read: "Delivered", // We map Read receipts to Delivered status
  };

  const newStatus = statusMap[update.status] || update.status;

  const updateData: Record<string, any> = { status: newStatus };
  if (newStatus === "Delivered") {
    updateData.delivered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("messages")
    .update(updateData)
    .eq("provider_message_id", update.providerMessageId)
    .eq("channel", "Signal")
    .select()
    .maybeSingle();

  if (error) {
    console.error(`[signal-inbound] Status update error:`, error);
    await logIntegration(supabase, "SignalBridge", "status_update", "error", error.message, correlationId);
    return jsonResponse({ error: error.message }, 500);
  }

  if (!data) {
    console.warn(`[signal-inbound] No message found for provider ID: ${update.providerMessageId}`);
    return jsonResponse({ status: "not_found" }, 404);
  }

  await logIntegration(supabase, "SignalBridge", "status_update", "success", null, correlationId, {
    providerMessageId: update.providerMessageId,
    newStatus,
  });

  return jsonResponse({ status: "ok", messageId: data.id, newStatus });
}

// ─── Helpers ───

async function logIntegration(
  supabase: any,
  provider: string,
  action: string,
  status: string,
  error: string | null,
  correlationId: string,
  metadata?: Record<string, any>
) {
  await supabase.from("integration_logs").insert({
    provider,
    action,
    status,
    error,
    correlation_id: correlationId,
    metadata: metadata || {},
  });
}

function jsonResponse(body: Record<string, any>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
      "Content-Type": "application/json",
    },
  });
}
