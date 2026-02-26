import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VIMEO_TOKEN = Deno.env.get("VIMEO_ACCESS_TOKEN");
    if (!VIMEO_TOKEN) {
      return new Response(
        JSON.stringify({ error: "VIMEO_ACCESS_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: videos, error: fetchErr } = await adminClient
      .from("course_videos")
      .select("id, vimeo_id, title, description")
      .order("sort_order");

    if (fetchErr) throw fetchErr;

    const results: any[] = [];

    for (const video of videos || []) {
      try {
        const vRes = await fetch(`https://api.vimeo.com/videos/${video.vimeo_id}`, {
          headers: { Authorization: `Bearer ${VIMEO_TOKEN}` },
        });

        if (!vRes.ok) {
          const errText = await vRes.text();
          results.push({ id: video.id, vimeo_id: video.vimeo_id, title: video.title, status: `vimeo_${vRes.status}` });
          console.error(`Vimeo error ${video.vimeo_id}: ${vRes.status} ${errText}`);
          continue;
        }

        const vData = await vRes.json();
        const newTitle = vData.name || video.title;
        const newDescription = vData.description || "";

        const { error: updateErr } = await adminClient
          .from("course_videos")
          .update({ title: newTitle, description: newDescription })
          .eq("id", video.id);

        results.push({
          id: video.id,
          vimeo_id: video.vimeo_id,
          title: newTitle,
          description: newDescription.slice(0, 100),
          status: updateErr ? `db_error: ${updateErr.message}` : "synced",
        });
      } catch (e) {
        results.push({
          id: video.id,
          vimeo_id: video.vimeo_id,
          title: video.title,
          status: `error: ${e instanceof Error ? e.message : "unknown"}`,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, synced: results.filter((r) => r.status === "synced").length, total: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("sync-vimeo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
