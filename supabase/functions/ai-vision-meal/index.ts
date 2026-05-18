import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NUTRITION_TOOL = {
  type: "function",
  function: {
    name: "analyze_meal",
    description: "Analyze a meal photo and return calorie/macro estimates.",
    parameters: {
      type: "object",
      properties: {
        estimated_calories: { type: "number" },
        macros: {
          type: "object",
          properties: {
            protein_g: { type: "number" },
            carbs_g: { type: "number" },
            fats_g: { type: "number" },
          },
          required: ["protein_g", "carbs_g", "fats_g"],
          additionalProperties: false,
        },
        confidence_score: { type: "number", description: "0-1 confidence in the estimate." },
        food_items: { type: "array", items: { type: "string" } },
        suggestions: { type: "array", items: { type: "string" } },
        disclaimer: { type: "string" },
      },
      required: ["estimated_calories", "macros", "confidence_score", "food_items", "suggestions", "disclaimer"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const t0 = Date.now();

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

  if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ error: "AI not configured" }), {
    status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

  let body: any = {};
  try { body = await req.json(); } catch {}
  const imageUrl: string | undefined = body.image_url;
  const note: string = (body.note || "").toString().slice(0, 300);
  if (!imageUrl) {
    return new Response(JSON.stringify({ error: "image_url required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // load profile briefly for personalized suggestions
  const { data: profile } = await supabase
    .from("profiles")
    .select("dietary_style, allergies, daily_calories_target, goals")
    .eq("id", user.id).maybeSingle();

  const sys = "You are a registered dietitian estimating meal calories/macros from a photo. Be conservative and give a confidence score. Respect the user's dietary style and allergies. Output ONLY via the analyze_meal tool.";
  const usr = [
    `User diet: ${(profile?.dietary_style || []).join(", ") || "no restriction"}.`,
    `Allergies: ${(profile?.allergies || []).join(", ") || "none"}.`,
    `Daily target: ${profile?.daily_calories_target ?? "unknown"} kcal.`,
    `Goals: ${(profile?.goals || []).join(", ") || "general"}.`,
    note ? `User note: ${note}` : "",
    "Analyze the attached meal photo.",
  ].filter(Boolean).join("\n");

  let planJson: any = null;
  let lastErr: any = null;
  let tokensIn = 0, tokensOut = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: sys },
            {
              role: "user",
              content: [
                { type: "text", text: usr },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          tools: [NUTRITION_TOOL],
          tool_choice: { type: "function", function: { name: "analyze_meal" } },
        }),
      });
      if (res.status === 429) { lastErr = { code: 429, msg: "Rate limit" }; }
      else if (res.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      else if (!res.ok) { lastErr = { code: res.status, msg: await res.text() }; }
      else {
        const j = await res.json();
        tokensIn = j.usage?.prompt_tokens ?? 0;
        tokensOut = j.usage?.completion_tokens ?? 0;
        const call = j.choices?.[0]?.message?.tool_calls?.[0];
        if (!call?.function?.arguments) throw new Error("No tool call");
        planJson = JSON.parse(call.function.arguments);
        lastErr = null;
        break;
      }
    } catch (e) { lastErr = { code: 500, msg: String(e) }; }
    await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
  }

  await supabase.from("ai_usage").insert({
    user_id: user.id,
    function_name: "ai-vision-meal",
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    status: lastErr ? "error" : "success",
    error_message: lastErr ? String(lastErr.msg).slice(0, 500) : null,
    duration_ms: Date.now() - t0,
  });

  if (lastErr || !planJson) {
    return new Response(JSON.stringify({ error: lastErr?.msg || "AI failed" }), {
      status: lastErr?.code || 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ analysis: planJson }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
