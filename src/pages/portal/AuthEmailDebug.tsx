import { useState } from "react";

type EventRow = {
  id: string;
  to?: string[];
  subject?: string;
  last_event?: string;
  created_at?: string;
};

export default function AuthEmailDebug() {
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<EventRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = import.meta.env.VITE_AUTH_EMAIL_DEBUG_TOKEN;
  const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-email-debug`;

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      if (!token) {
        throw new Error("VITE_AUTH_EMAIL_DEBUG_TOKEN is not configured for this environment.");
      }
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-email-debug-token": token,
        },
        body: JSON.stringify({
          mode: "recent_for",
          email: email.trim().toLowerCase(),
          subject: "Your Magic Link",
        }),
      });
      const payload = await resp.json();
      const body = JSON.parse(payload.resend_body || "{}");
      setRows((body.data || []) as EventRow[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Auth Email Debug</h1>
      <p className="text-sm text-foreground/60">
        Checks recent "Your Magic Link" delivery events for a specific address.
      </p>
      <form onSubmit={lookup} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded border px-3 py-2"
          placeholder="recipient@example.com"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-foreground/50">No matching events yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="rounded border p-3 text-sm">
              <p><strong>ID:</strong> {row.id}</p>
              <p><strong>To:</strong> {row.to?.join(", ")}</p>
              <p><strong>Subject:</strong> {row.subject}</p>
              <p><strong>Status:</strong> {row.last_event}</p>
              <p><strong>Created:</strong> {row.created_at}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
