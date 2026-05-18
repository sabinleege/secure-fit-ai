import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_TOOL = {
  type: "function",
  function: {
    name: "build_workout_plan",
    description:
      "Build a safe, personalized 7-day workout plan following ACSM, NSCA and ISSN guidelines. Injuries are FIRST priority: never include contraindicated movements; always provide a modification.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "1-2 sentence overview of the week and rationale." },
        safetyNote: { type: "string", description: "Top-line safety guidance referencing the user's injuries." },
        weeks: { type: "number", description: "Always 1." },
        days: {
          type: "array",
          minItems: 7,
          maxItems: 7,
          items: {
            type: "object",
            properties: {
              day_name: { type: "string", description: "Monday..Sunday" },
              focus: { type: "string", description: "e.g. Upper Push, Lower, Active Recovery, Rest" },
              duration_min: { type: "number" },
              exercises: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    sets: { type: "number" },
                    reps_or_time: { type: "string" },
                    rest_seconds: { type: "number" },
                    rpe: { type: "number", description: "Target RPE 1-10." },
                    notes: { type: "string", description: "Form cues." },
                    muscles_targeted: { type: "array", items: { type: "string" } },
                    injury_modification: {
                      type: "string",
                      description: "Required. Safer alternative tied to user's injuries, or 'None needed'.",
                    },
                  },
                  required: ["name", "sets", "reps_or_time", "rest_seconds", "rpe", "notes", "muscles_targeted", "injury_modification"],
                  additionalProperties: false,
                },
              },
            },
            required: ["day_name", "focus", "duration_min", "exercises"],
            additionalProperties: false,
          },
        },
        disclaimer: { type: "string" },
      },
      required: ["summary", "safetyNote", "weeks", "days", "disclaimer"],
      additionalProperties: false,
    },
  },
};

function buildSystemPrompt() {
  return [
    "You are an elite strength & conditioning coach (CSCS, NSCA-CPT) building safe, evidence-based programs.",
    "Strictly follow ACSM exercise prescription, NSCA programming, and ISSN nutrition principles.",
    "INJURIES ARE THE TOP PRIORITY: never include any exercise contraindicated for the user's reported injuries. For every exercise provide an injury_modification field — a safer regression if the user feels pain, or 'None needed' if benign.",
    "Scale weekly volume and intensity to the user's age, activity level, equipment, training days/week, and session duration.",
    "Include warm-up specifics in day notes, cooldown/mobility on hard days, and 1-2 explicit rest or active-recovery days per week.",
    "Use real exercise names. Output ONLY via the build_workout_plan tool — no prose.",
    "Always include the disclaimer: this is general guidance, not medical advice.",
  ].join(" ");
}

function buildUserPrompt(p: any) {
  const injuries = (p.injuries_detailed || [])
    .map((i: any) => `${i.area} (${i.severity}${i.duration ? `, ${i.duration}` : ""}${i.doctor_notes ? `, doctor: ${i.doctor_notes}` : ""})`)
    .join("; ") || "None reported";
  return [
    `Profile:`,
    `- ${p.gender || ""} age ${p.age}, ${p.height}cm, ${p.weight}kg${p.goal_weight ? ` → goal ${p.goal_weight}kg` : ""}`,
    `- Activity level: ${p.activity_level}`,
    `- Goals: ${(p.goals || []).join(", ") || "general fitness"}${p.goals_notes ? ` (notes: ${p.goals_notes})` : ""}`,
    `- Training: ${p.training_days_per_week} days/wk, ${p.session_duration_min} min/session at ${(p.preferred_times || []).join(", ") || "any time"}`,
    `- Equipment: ${(p.equipment || []).join(", ") || "bodyweight only"} (${p.training_location})`,
    `- Injuries / limitations: ${injuries}${p.other_limitations ? `; other: ${p.other_limitations}` : ""}`,
    `- Diet: ${(p.dietary_style || []).join(", ") || "no restrictions"}${(p.allergies || []).length ? `; allergies: ${(p.allergies || []).join(", ")}` : ""}`,
    ``,
    `Build a 7-day plan. Distribute ${p.training_days_per_week} training days plus rest/active-recovery to reach 7.`,
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const t0 = Date.now();
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const force: boolean = !!body.force;
  const regen_reason: string | undefined = body.regen_reason;

  // load profile
  const { data: profile, error: profErr } = await supabase
    .from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profErr || !profile) {
    return new Response(JSON.stringify({ error: "Profile not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const profile_hash: string | null = profile.profile_hash;

  // cache hit?
  if (!force && profile_hash) {
    const { data: existing } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .eq("profile_hash", profile_hash)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ plan: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "AI not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // call AI with retry/backoff
  let lastErr: any = null;
  let planJson: any = null;
  let tokensIn = 0, tokensOut = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: buildSystemPrompt() },
            { role: "user", content: buildUserPrompt(profile) },
          ],
          tools: [PLAN_TOOL],
          tool_choice: { type: "function", function: { name: "build_workout_plan" } },
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
        if (!call?.function?.arguments) throw new Error("AI returned no tool call");
        planJson = JSON.parse(call.function.arguments);
        lastErr = null;
        break;
      }
    } catch (e) {
      lastErr = { code: 500, msg: String(e) };
    }
    await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
  }

  if (lastErr || !planJson) {
    await supabase.from("ai_usage").insert({
      user_id: user.id,
      function_name: "generate-workout-plan",
      status: "error",
      error_message: String(lastErr?.msg || "unknown").slice(0, 500),
      duration_ms: Date.now() - t0,
    });
    return new Response(JSON.stringify({ error: lastErr?.msg || "AI failed" }), {
      status: lastErr?.code || 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // deactivate older plans and store the new one
  await supabase.from("workout_plans")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const weekStart = new Date();
  const day = weekStart.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  weekStart.setDate(weekStart.getDate() + diff);
  const weekStartIso = weekStart.toISOString().slice(0, 10);

  const { data: inserted, error: insErr } = await supabase
    .from("workout_plans")
    .insert({
      user_id: user.id,
      plan_data: planJson,
      week_start: weekStartIso,
      is_active: true,
      profile_hash,
      generated_at: new Date().toISOString(),
      version: 1,
      regen_reason: regen_reason ?? null,
    })
    .select()
    .single();

  await supabase.from("ai_usage").insert({
    user_id: user.id,
    function_name: "generate-workout-plan",
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    status: "success",
    duration_ms: Date.now() - t0,
  });

  if (insErr) {
    return new Response(JSON.stringify({ error: insErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ plan: inserted, cached: false }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
