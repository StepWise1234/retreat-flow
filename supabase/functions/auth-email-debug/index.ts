const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const AUTH_EMAIL_DEBUG_TOKEN = Deno.env.get("AUTH_EMAIL_DEBUG_TOKEN") ?? "";
const FROM_EMAIL = Deno.env.get("AUTH_EMAIL_FROM") ?? "StepWise <hello@stepwise.education>";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!AUTH_EMAIL_DEBUG_TOKEN || req.headers.get("x-auth-email-debug-token") !== AUTH_EMAIL_DEBUG_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized debug token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const mode = typeof body?.mode === "string" ? body.mode : "send";
  const to = typeof body?.to === "string" ? body.to : "";

  if (mode === "status") {
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing 'id' for status mode" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const statusResp = await fetch(`https://api.resend.com/emails/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const statusText = await statusResp.text();
    return new Response(
      JSON.stringify({
        resend_status: statusResp.status,
        resend_ok: statusResp.ok,
        resend_body: statusText,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (mode === "list") {
    const listResp = await fetch("https://api.resend.com/emails?limit=10", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const listText = await listResp.text();
    return new Response(
      JSON.stringify({
        resend_status: listResp.status,
        resend_ok: listResp.ok,
        resend_body: listText,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (mode === "recent_for") {
    const email = typeof body?.email === "string" ? body.email.toLowerCase() : "";
    const subject = typeof body?.subject === "string" ? body.subject : "Your Magic Link";
    if (!email) {
      return new Response(JSON.stringify({ error: "Missing 'email' for recent_for mode" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const listResp = await fetch("https://api.resend.com/emails?limit=100", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const listText = await listResp.text();
    if (!listResp.ok) {
      return new Response(
        JSON.stringify({
          resend_status: listResp.status,
          resend_ok: false,
          resend_body: listText,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const parsed = JSON.parse(listText) as { data?: Array<Record<string, unknown>> };
    const events = (parsed.data ?? []).filter((item) => {
      const to = Array.isArray(item.to) ? item.to.map((v) => String(v).toLowerCase()) : [];
      return to.includes(email) && String(item.subject ?? "") === subject;
    });
    return new Response(
      JSON.stringify({
        resend_status: 200,
        resend_ok: true,
        resend_body: JSON.stringify({ data: events.slice(0, 10) }),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!to) {
    return new Response(JSON.stringify({ error: "Missing 'to' email in request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resendResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: "StepWise Auth Debug",
      html: "<p>This is a direct debug send from Supabase Edge Function.</p>",
    }),
  });

  const text = await resendResp.text();

  return new Response(
    JSON.stringify({
      resend_status: resendResp.status,
      resend_ok: resendResp.ok,
      resend_body: text,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
