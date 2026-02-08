import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendSignalRequest {
  messageId: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Authenticate the caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await authClient.auth.getClaims(token);
  if (claimsErr || !claims?.claims) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use service role client for database operations
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const correlationId = crypto.randomUUID();

  try {
    const { messageId } = (await req.json()) as SendSignalRequest;

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: "messageId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-signal] Processing message ${messageId}, correlation: ${correlationId}`);

    // Fetch the message
    const { data: message, error: msgErr } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (msgErr || !message) {
      console.error(`[send-signal] Message not found: ${messageId}`, msgErr);
      return new Response(
        JSON.stringify({ error: "Message not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.channel !== "Signal") {
      return new Response(
        JSON.stringify({ error: "Message is not a Signal message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Idempotency check
    if (message.status === "Sent" || message.status === "Delivered") {
      console.log(`[send-signal] Message ${messageId} already ${message.status}, skipping`);
      return new Response(
        JSON.stringify({ status: message.status, message: "Already sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch signal settings
    const { data: settings, error: settErr } = await supabase
      .from("signal_settings")
      .select("*")
      .limit(1)
      .single();

    if (settErr || !settings) {
      const errMsg = "Signal settings not configured";
      console.error(`[send-signal] ${errMsg}`, settErr);
      await updateMessageStatus(supabase, messageId, "Failed", errMsg);
      await logIntegration(supabase, "SignalBridge", "send_message", "error", errMsg, correlationId);
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.signal_api_base_url || !settings.signal_sender_id) {
      const errMsg = "Signal Bridge URL or sender ID not configured";
      console.error(`[send-signal] ${errMsg}`);
      await updateMessageStatus(supabase, messageId, "Failed", errMsg);
      await logIntegration(supabase, "SignalBridge", "send_message", "error", errMsg, correlationId);
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiBaseUrl = settings.signal_api_base_url.replace(/\/+$/, "");
    const apiToken = settings.signal_api_token || "";

    console.log(`[send-signal] Sending via Signal Bridge at ${apiBaseUrl}`);

    // Call the Signal Bridge API
    const idempotencyKey = message.idempotency_key || crypto.randomUUID();
    const bridgePayload = {
      to: message.to_address,
      messageText: message.body,
      idempotencyKey,
      senderId: settings.signal_sender_id,
    };

    const bridgeHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiToken) {
      bridgeHeaders["Authorization"] = `Bearer ${apiToken}`;
    }

    let bridgeResponse: Response;
    try {
      bridgeResponse = await fetch(`${apiBaseUrl}/signal/send`, {
        method: "POST",
        headers: bridgeHeaders,
        body: JSON.stringify(bridgePayload),
        signal: AbortSignal.timeout(30000), // 30s timeout
      });
    } catch (fetchErr: any) {
      const errMsg = `Signal Bridge unreachable: ${fetchErr.message}`;
      console.error(`[send-signal] ${errMsg}`);
      await updateMessageStatus(supabase, messageId, "Failed", errMsg);
      await logIntegration(supabase, "SignalBridge", "send_message", "error", errMsg, correlationId, {
        to: message.to_address,
      });

      // Update health
      await supabase.from("signal_settings").update({
        is_healthy: false,
        last_tested_at: new Date().toISOString(),
        last_error: errMsg,
      }).eq("id", settings.id);

      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bridgeBody = await bridgeResponse.text();
    console.log(`[send-signal] Bridge response: ${bridgeResponse.status} ${bridgeBody}`);

    if (bridgeResponse.ok) {
      let providerMessageId: string | undefined;
      try {
        const parsed = JSON.parse(bridgeBody);
        providerMessageId = parsed.providerMessageId || parsed.messageId || parsed.id;
      } catch {
        // not JSON, that's fine
      }

      const finalStatus = "Sent";
      console.log(`[send-signal] Signal message sent to ${message.to_address}`);

      await updateMessageStatus(supabase, messageId, finalStatus, null, providerMessageId);
      await logIntegration(supabase, "SignalBridge", "send_message", "success", null, correlationId, {
        to: message.to_address,
        providerMessageId,
      });

      // Update health
      await supabase.from("signal_settings").update({
        is_healthy: true,
        last_success_at: new Date().toISOString(),
        last_tested_at: new Date().toISOString(),
        last_error: null,
      }).eq("id", settings.id);

      return new Response(
        JSON.stringify({ status: finalStatus, providerMessageId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      let errMsg = `Signal Bridge error (${bridgeResponse.status})`;
      try {
        const parsed = JSON.parse(bridgeBody);
        errMsg = parsed.error || parsed.message || errMsg;
      } catch {
        errMsg += `: ${bridgeBody.slice(0, 200)}`;
      }

      console.error(`[send-signal] ${errMsg}`);
      await updateMessageStatus(supabase, messageId, "Failed", errMsg);
      await logIntegration(supabase, "SignalBridge", "send_message", "error", errMsg, correlationId, {
        to: message.to_address,
        httpStatus: bridgeResponse.status,
      });

      // Update health
      await supabase.from("signal_settings").update({
        is_healthy: false,
        last_tested_at: new Date().toISOString(),
        last_error: errMsg,
      }).eq("id", settings.id);

      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    const errMsg = err.message || "Unknown error";
    console.error(`[send-signal] Unhandled error:`, err);
    await logIntegration(supabase, "SignalBridge", "send_message", "error", errMsg, correlationId);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Helpers ───

async function updateMessageStatus(
  supabase: any,
  messageId: string,
  status: string,
  errorMessage: string | null,
  providerMessageId?: string
) {
  const updates: Record<string, any> = { status };
  if (errorMessage !== null) updates.error_message = errorMessage;
  if (providerMessageId) updates.provider_message_id = providerMessageId;
  if (status === "Sent") updates.sent_at = new Date().toISOString();
  if (status === "Delivered") updates.delivered_at = new Date().toISOString();

  await supabase.from("messages").update(updates).eq("id", messageId);
}

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
