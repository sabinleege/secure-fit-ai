const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Non-streaming structured analyzer for nutrition meals & follow-up reports.
// Body: { kind: "nutrition" | "followup", payload: {...}, context?: {...} }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind, payload, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let system = "";
    let userPrompt = "";

    if (kind === "nutrition") {
      system = `You are Fit Buddy AI's nutrition analyst. Give brief, actionable feedback on a user's meal based on their profile and goals. Always consider medical conditions. Keep it under 120 words. Use markdown.`;
      userPrompt = `User context: ${JSON.stringify(context || {})}
Meal description: ${payload?.meal || "(none)"}
Provide: 1) Quality rating (Poor/Fair/Good/Excellent), 2) Estimated macros, 3) One improvement tip.`;
    } else if (kind === "followup") {
      system = `You are Fit Buddy AI's recovery coach. Analyze a workout follow-up report. Be safety-first: if pain >= 6, advise rest and medical check.`;
      userPrompt = `User context: ${JSON.stringify(context || {})}
Report: pain ${payload?.pain}/10, fatigue ${payload?.fatigue}/10. Notes: ${payload?.feedback}
Return: 1) Recovery score 0–100, 2) Adjustment for next session, 3) Any safety alert.`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown kind" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
