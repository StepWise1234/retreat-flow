import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type EmailActionType =
  | "signup"
  | "magiclink"
  | "recovery"
  | "invite"
  | "email_change"
  | "reauthentication";

interface HookPayload {
  user: {
    email: string;
    new_email?: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    token?: string;
    token_hash?: string;
    token_new?: string;
    token_hash_new?: string;
    redirect_to?: string;
    site_url?: string;
    email_action_type: EmailActionType;
  };
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SEND_EMAIL_HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
const FROM_EMAIL = Deno.env.get("AUTH_EMAIL_FROM") ?? "StepWise <hello@stepwise.education>";

function buildConfirmationUrl(emailData: HookPayload["email_data"]): string {
  const tokenHash = emailData.token_hash ?? "";
  const actionType = emailData.email_action_type;
  const redirectTo = emailData.redirect_to ?? "https://stepwise.education/portal";
  const url = new URL(`${SUPABASE_URL}/auth/v1/verify`);
  url.searchParams.set("token", tokenHash);
  url.searchParams.set("type", actionType);
  url.searchParams.set("redirect_to", redirectTo);
  return url.toString();
}

function subjectFor(action: EmailActionType): string {
  switch (action) {
    case "magiclink":
      return "Your Magic Link";
    case "recovery":
      return "Reset your password";
    case "signup":
      return "Confirm your signup";
    case "invite":
      return "You have been invited";
    case "reauthentication":
      return "Confirm reauthentication";
    case "email_change":
      return "Confirm your email change";
    default:
      return "Your StepWise verification email";
  }
}

function htmlFor(action: EmailActionType, confirmationUrl: string, token?: string): string {
  if (action === "magiclink") {
    return `<h2>Magic Link</h2><p>Almost there! Follow this link to login:</p><p><a href="${confirmationUrl}">Log In</a></p>`;
  }

  if (action === "recovery") {
    return `<h2>Reset Password</h2><p>Follow this link to reset your password:</p><p><a href="${confirmationUrl}">Reset Password</a></p>`;
  }

  if (action === "reauthentication" && token) {
    return `<h2>Confirm reauthentication</h2><p>Enter the code: <strong>${token}</strong></p>`;
  }

  return `<h2>StepWise</h2><p>Follow this link to continue:</p><p><a href="${confirmationUrl}">Continue</a></p>`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (!SEND_EMAIL_HOOK_SECRET) {
      return new Response(JSON.stringify({ error: "SEND_EMAIL_HOOK_SECRET missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payloadText = await req.text();
    const headers = Object.fromEntries(req.headers);
    const secretBase64 = SEND_EMAIL_HOOK_SECRET.replace("v1,whsec_", "");
    const webhook = new Webhook(secretBase64);
    const payload = webhook.verify(payloadText, headers) as HookPayload;
    const action = payload.email_data.email_action_type;
    const toEmail = payload.user.email;

    if (!toEmail) {
      return new Response(JSON.stringify({ error: "Missing user email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const confirmationUrl = buildConfirmationUrl(payload.email_data);
    const subject = subjectFor(action);
    const html = htmlFor(action, confirmationUrl, payload.email_data.token);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const body = await resendResponse.text();
      await logAuthEmailEvent({
        action,
        toEmail,
        subject,
        redirectTo: payload.email_data.redirect_to ?? null,
        status: "failed",
        providerMessageId: null,
        error: `${resendResponse.status} ${body}`,
      });
      return new Response(
        JSON.stringify({ error: `Resend send failed: ${resendResponse.status} ${body}` }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const resendBody = await resendResponse.json().catch(() => ({}));
    const providerMessageId = typeof resendBody?.id === "string" ? resendBody.id : null;
    await logAuthEmailEvent({
      action,
      toEmail,
      subject,
      redirectTo: payload.email_data.redirect_to ?? null,
      status: "queued",
      providerMessageId,
      error: null,
    });

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    await logAuthEmailEvent({
      action: "magiclink",
      toEmail: "unknown",
      subject: "unknown",
      redirectTo: null,
      status: "failed",
      providerMessageId: null,
      error: `Hook processing failed: ${(err as Error).message}`,
    });
    return new Response(
      JSON.stringify({ error: `Hook processing failed: ${(err as Error).message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

async function logAuthEmailEvent(input: {
  action: string;
  toEmail: string;
  subject: string;
  redirectTo: string | null;
  status: "queued" | "failed";
  providerMessageId: string | null;
  error: string | null;
}) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return;

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    await admin.from("auth_email_events").insert({
      action_type: input.action,
      to_email: input.toEmail,
      subject: input.subject,
      provider: "resend",
      provider_message_id: input.providerMessageId,
      status: input.status,
      redirect_to: input.redirectTo,
      error_message: input.error,
    });
  } catch (_e) {
    // Avoid failing auth flow due to observability write errors.
  }
}
