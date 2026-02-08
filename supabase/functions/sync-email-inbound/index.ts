import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * sync-email-inbound
 *
 * Polls Proton Mail Bridge IMAP for new emails, parses them,
 * matches senders to participants, and stores as inbound messages
 * in the correct conversation.
 *
 * Can be called manually or on a cron schedule.
 */
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
  console.log(`[sync-email-inbound] Starting sync, correlation: ${correlationId}`);

  try {
    // 1. Fetch email settings
    const { data: settings, error: settErr } = await supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (settErr || !settings) {
      const errMsg = "Email settings not configured";
      console.error(`[sync-email-inbound] ${errMsg}`, settErr);
      await logIntegration(supabase, "ProtonBridgeIMAP", "sync_inbound", "error", errMsg, correlationId);
      return jsonResponse({ error: errMsg }, 500);
    }

    if (!settings.smtp_host) {
      const errMsg = "IMAP/SMTP host not configured";
      console.error(`[sync-email-inbound] ${errMsg}`);
      await logIntegration(supabase, "ProtonBridgeIMAP", "sync_inbound", "error", errMsg, correlationId);
      return jsonResponse({ error: errMsg }, 500);
    }

    if (!settings.enable_inbound_sync) {
      console.log("[sync-email-inbound] Inbound sync disabled in settings, skipping");
      return jsonResponse({ status: "skipped", reason: "inbound_sync_disabled" });
    }

    // 2. Connect to IMAP
    // Proton Bridge typically exposes IMAP on port 1143 (STARTTLS) on the same host as SMTP
    const imapHost = settings.smtp_host;
    const imapPort = 1143; // Proton Bridge default IMAP port
    const imapUsername = settings.smtp_username || "";
    const imapPassword = settings.smtp_password || "";

    console.log(`[sync-email-inbound] Connecting to IMAP at ${imapHost}:${imapPort}`);

    let emails: ParsedEmail[];
    try {
      emails = await fetchNewEmails({
        host: imapHost,
        port: imapPort,
        username: imapUsername,
        password: imapPassword,
      });
    } catch (imapErr: any) {
      const errMsg = `IMAP connection failed: ${imapErr.message}`;
      console.error(`[sync-email-inbound] ${errMsg}`);
      await logIntegration(supabase, "ProtonBridgeIMAP", "sync_inbound", "error", errMsg, correlationId);

      await supabase.from("email_settings").update({
        is_healthy: false,
        last_tested_at: new Date().toISOString(),
        last_error: errMsg,
      }).eq("id", settings.id);

      return jsonResponse({ error: errMsg }, 502);
    }

    console.log(`[sync-email-inbound] Fetched ${emails.length} new email(s)`);

    if (emails.length === 0) {
      await logIntegration(supabase, "ProtonBridgeIMAP", "sync_inbound", "success", null, correlationId, {
        count: 0,
      });
      await supabase.from("email_settings").update({
        is_healthy: true,
        last_tested_at: new Date().toISOString(),
        last_success_at: new Date().toISOString(),
        last_error: null,
      }).eq("id", settings.id);
      return jsonResponse({ status: "ok", synced: 0 });
    }

    // 3. Process each email
    let synced = 0;
    let errors = 0;

    for (const email of emails) {
      try {
        await processInboundEmail(supabase, email, correlationId);
        synced++;
      } catch (procErr: any) {
        console.error(`[sync-email-inbound] Error processing email from ${email.from}:`, procErr.message);
        errors++;
      }
    }

    console.log(`[sync-email-inbound] Sync complete: ${synced} synced, ${errors} errors`);

    await logIntegration(supabase, "ProtonBridgeIMAP", "sync_inbound", errors > 0 ? "partial" : "success", null, correlationId, {
      total: emails.length,
      synced,
      errors,
    });

    await supabase.from("email_settings").update({
      is_healthy: true,
      last_tested_at: new Date().toISOString(),
      last_success_at: new Date().toISOString(),
      last_error: errors > 0 ? `${errors} emails failed to process` : null,
    }).eq("id", settings.id);

    return jsonResponse({ status: "ok", synced, errors });
  } catch (err: any) {
    const errMsg = err.message || "Unknown error";
    console.error(`[sync-email-inbound] Unhandled error:`, err);
    await logIntegration(supabase, "ProtonBridgeIMAP", "sync_inbound", "error", errMsg, correlationId);
    return jsonResponse({ error: errMsg }, 500);
  }
});

// ─── Types ───

interface IMAPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface ParsedEmail {
  messageId: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  inReplyTo: string | null;
  references: string | null;
  rawHeaders: Record<string, string>;
}

// ─── IMAP Fetch ───

async function fetchNewEmails(config: IMAPConfig): Promise<ParsedEmail[]> {
  /**
   * Lightweight IMAP client using raw TCP.
   * Connects to Proton Bridge, authenticates, fetches UNSEEN messages
   * from INBOX, marks them as SEEN, and returns parsed results.
   *
   * For production, consider a full IMAP library, but Proton Bridge's
   * limited IMAP feature set makes raw commands viable.
   */
  const conn = await Deno.connect({
    hostname: config.host,
    port: config.port,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let tagCounter = 1;

  function nextTag(): string {
    return `A${String(tagCounter++).padStart(4, "0")}`;
  }

  async function readUntilTagged(tag: string): Promise<string> {
    let buffer = "";
    const buf = new Uint8Array(65536);
    const maxIterations = 50;
    let iterations = 0;

    while (iterations++ < maxIterations) {
      const n = await conn.read(buf);
      if (n === null) break;
      buffer += decoder.decode(buf.subarray(0, n));
      // Check if we have the tagged response line
      if (buffer.includes(`${tag} OK`) || buffer.includes(`${tag} NO`) || buffer.includes(`${tag} BAD`)) {
        break;
      }
    }
    return buffer;
  }

  async function sendCommand(command: string): Promise<string> {
    const tag = nextTag();
    const line = `${tag} ${command}\r\n`;
    await conn.write(encoder.encode(line));
    console.log(`[IMAP] > ${tag} ${command.startsWith("LOGIN") ? "LOGIN ***" : command}`);
    const response = await readUntilTagged(tag);
    return response;
  }

  const emails: ParsedEmail[] = [];

  try {
    // Read greeting
    const greetBuf = new Uint8Array(4096);
    const greetN = await conn.read(greetBuf);
    if (greetN) {
      const greeting = decoder.decode(greetBuf.subarray(0, greetN));
      console.log(`[IMAP] < ${greeting.trim().substring(0, 200)}`);
    }

    // LOGIN
    const loginResp = await sendCommand(`LOGIN "${config.username}" "${config.password}"`);
    if (loginResp.includes("NO") || loginResp.includes("BAD")) {
      throw new Error(`IMAP login failed: ${loginResp.trim().substring(0, 200)}`);
    }

    // SELECT INBOX
    const selectResp = await sendCommand("SELECT INBOX");
    if (selectResp.includes("NO") || selectResp.includes("BAD")) {
      throw new Error(`SELECT INBOX failed: ${selectResp.trim().substring(0, 200)}`);
    }

    // SEARCH for UNSEEN messages
    const searchResp = await sendCommand("SEARCH UNSEEN");
    console.log(`[IMAP] Search response: ${searchResp.trim().substring(0, 500)}`);

    // Parse SEARCH response — extract UIDs/sequence numbers
    const searchLine = searchResp.split("\r\n").find((l) => l.includes("* SEARCH"));
    if (!searchLine || searchLine.trim() === "* SEARCH") {
      console.log("[IMAP] No unseen messages");
      await sendCommand("LOGOUT");
      conn.close();
      return [];
    }

    const messageNums = searchLine
      .replace("* SEARCH", "")
      .trim()
      .split(/\s+/)
      .filter((n) => n.match(/^\d+$/));

    console.log(`[IMAP] Found ${messageNums.length} unseen message(s): ${messageNums.join(", ")}`);

    // Limit to 50 messages per sync to avoid timeout
    const toFetch = messageNums.slice(0, 50);

    for (const num of toFetch) {
      try {
        // FETCH the message headers + body
        const fetchResp = await sendCommand(
          `FETCH ${num} (FLAGS BODY[HEADER] BODY[TEXT])`
        );

        const parsed = parseRawEmail(fetchResp);
        if (parsed) {
          emails.push(parsed);
          // Mark as SEEN
          await sendCommand(`STORE ${num} +FLAGS (\\Seen)`);
        }
      } catch (fetchErr: any) {
        console.error(`[IMAP] Error fetching message ${num}:`, fetchErr.message);
      }
    }

    // LOGOUT
    await sendCommand("LOGOUT");
  } finally {
    try { conn.close(); } catch { /* ignore */ }
  }

  return emails;
}

function parseRawEmail(rawFetchResponse: string): ParsedEmail | null {
  try {
    const headers: Record<string, string> = {};

    // Extract headers section
    const headerMatch = rawFetchResponse.match(/BODY\[HEADER\]\s*\{(\d+)\}\r\n([\s\S]*?)(?=\r\n\r\n|\)\r\n)/);
    const headerBlock = headerMatch ? headerMatch[2] : "";

    // Parse individual headers (handle multi-line folding)
    const unfolded = headerBlock.replace(/\r\n\s+/g, " ");
    for (const line of unfolded.split("\r\n")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim().toLowerCase();
        const value = line.substring(colonIdx + 1).trim();
        headers[key] = value;
      }
    }

    // Extract body text
    const bodyMatch = rawFetchResponse.match(/BODY\[TEXT\]\s*\{(\d+)\}\r\n([\s\S]*?)(?=\)\r\n|$)/);
    const body = bodyMatch ? bodyMatch[2].trim() : "";

    const messageId = headers["message-id"] || `<unknown-${crypto.randomUUID()}>`;
    const fromRaw = headers["from"] || "unknown@unknown";
    const fromName = extractName(fromRaw);
    const fromEmail = extractEmailAddress(fromRaw);
    const to = extractEmailAddress(headers["to"] || "");
    const subject = decodeHeaderValue(headers["subject"] || "(no subject)");
    const date = headers["date"] || new Date().toISOString();
    const inReplyTo = headers["in-reply-to"] || null;
    const references = headers["references"] || null;

    return {
      messageId,
      from: fromEmail,
      fromName,
      to,
      subject,
      body: body.substring(0, 50000), // cap body size
      date,
      inReplyTo,
      references,
      rawHeaders: headers,
    };
  } catch {
    return null;
  }
}

function extractEmailAddress(str: string): string {
  const match = str.match(/<([^>]+)>/);
  return match ? match[1] : str.trim();
}

function extractName(str: string): string {
  const match = str.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : "";
}

function decodeHeaderValue(val: string): string {
  // Basic RFC 2047 decoding for UTF-8 subjects
  return val.replace(/=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g, (_match, _charset, encoding, encoded) => {
    try {
      if (encoding.toUpperCase() === "B") {
        return atob(encoded);
      }
      // Q encoding
      return encoded.replace(/=([0-9A-Fa-f]{2})/g, (_: string, hex: string) =>
        String.fromCharCode(parseInt(hex, 16))
      ).replace(/_/g, " ");
    } catch {
      return encoded;
    }
  });
}

// ─── Process Inbound Email ───

async function processInboundEmail(
  supabase: any,
  email: ParsedEmail,
  correlationId: string
) {
  const senderEmail = email.from.toLowerCase();

  // Idempotency: check if we already stored this message by provider_message_id
  const { data: existing } = await supabase
    .from("messages")
    .select("id")
    .eq("provider_message_id", email.messageId)
    .eq("direction", "Inbound")
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`[sync-email-inbound] Duplicate message ${email.messageId}, skipping`);
    return;
  }

  // Match sender to a participant — search conversations by participant email
  // Since we don't have a participants table with emails directly accessible,
  // we look for existing conversations where outbound messages were sent TO this email address
  const { data: matchedMessages } = await supabase
    .from("messages")
    .select("participant_id, retreat_id, registration_id, conversation_id")
    .eq("to_address", senderEmail)
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
    console.log(`[sync-email-inbound] Matched sender ${senderEmail} to participant ${participantId}`);
  } else {
    // Unmatched — create a placeholder participant ID
    participantId = `unmatched-${crypto.randomUUID().substring(0, 8)}`;
    console.log(`[sync-email-inbound] Unmatched sender ${senderEmail}, using placeholder: ${participantId}`);
  }

  // Threading: try to find conversation by externalThreadId
  const threadId = email.inReplyTo || email.references?.split(/\s+/)[0] || null;

  if (!conversationId && threadId) {
    const { data: threadMatch } = await supabase
      .from("messages")
      .select("conversation_id")
      .eq("external_thread_id", threadId)
      .limit(1);

    if (threadMatch && threadMatch.length > 0) {
      conversationId = threadMatch[0].conversation_id;
    }
  }

  // If still no conversation, find or create one
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
          channels_enabled: ["Email"],
        })
        .select()
        .single();

      if (convErr) throw convErr;
      conversationId = newConv.id;
      console.log(`[sync-email-inbound] Created new conversation ${conversationId} for ${senderEmail}`);
    }
  }

  // Build the external thread ID for this message
  const externalThreadId = email.messageId;

  // Insert the inbound message
  const { error: insertErr } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    participant_id: participantId,
    retreat_id: retreatId || "unknown",
    registration_id: registrationId || "unknown",
    channel: "Email",
    direction: "Inbound",
    from_address: senderEmail,
    to_address: email.to,
    subject: email.subject,
    body: email.body,
    status: "Delivered",
    read_status: "Unread",
    provider: "ProtonBridge",
    provider_message_id: email.messageId,
    external_thread_id: threadId || externalThreadId,
    idempotency_key: email.messageId,
    raw_payload: {
      fromName: email.fromName,
      inReplyTo: email.inReplyTo,
      references: email.references,
      date: email.date,
    },
    sent_at: email.date,
    delivered_at: new Date().toISOString(),
  });

  if (insertErr) throw insertErr;

  // Update conversation metadata
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: email.body.substring(0, 120),
      unread_count: supabase.rpc ? undefined : 1, // increment handled below
    })
    .eq("id", conversationId);

  // Increment unread count manually (no rpc available for atomic increment)
  const { data: conv } = await supabase
    .from("conversations")
    .select("unread_count")
    .eq("id", conversationId)
    .single();

  if (conv) {
    await supabase
      .from("conversations")
      .update({ unread_count: (conv.unread_count || 0) + 1 })
      .eq("id", conversationId);
  }

  // Ensure Email is in channels_enabled
  const { data: convData } = await supabase
    .from("conversations")
    .select("channels_enabled")
    .eq("id", conversationId)
    .single();

  if (convData && !convData.channels_enabled.includes("Email")) {
    await supabase
      .from("conversations")
      .update({
        channels_enabled: [...convData.channels_enabled, "Email"],
      })
      .eq("id", conversationId);
  }

  console.log(`[sync-email-inbound] Stored inbound email from ${senderEmail} in conversation ${conversationId}`);
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
