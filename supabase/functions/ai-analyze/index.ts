const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Non-streaming structured analyzer for nutrition meals, follow-up reports, and workout plans.
// Body: { kind: "nutrition" | "followup" | "workout", payload: {...}, context?: {...} }

const DAILY_ADJUST_TOOL = {
  type: "function",
  function: {
    name: "daily_adjust",
    description: "Analyze the user's goal trajectory and produce today's coaching guidance, recovery score, and notifications.",
    parameters: {
      type: "object",
      properties: {
        recoveryScore: { type: "number", description: "0-100 today's recovery score considering recent fatigue/pain/sleep proxy and consistency." },
        consistencyScore: { type: "number", description: "0-100 based on how well user kept up with plan & meals last 7 days." },
        onTrack: { type: "boolean", description: "Is the user on pace to hit their target weight by their timeline?" },
        projectedOutcome: { type: "string", description: "Short plain-English projection like 'On track for 75kg by Aug 2026' or '1.2kg behind target'." },
        focusToday: { type: "string", description: "1 sentence: what the user should focus on today (intensity / rest / nutrition gap)." },
        coachingTip: { type: "string", description: "One concrete actionable tip under 25 words." },
        adjustTodayWorkout: {
          type: "object",
          description: "Optional adjustment to today's planned workout.",
          properties: {
            intensity: { type: "string", enum: ["lighter", "same", "harder", "rest"] },
            note: { type: "string" },
          },
          required: ["intensity", "note"],
          additionalProperties: false,
        },
        notifications: {
          type: "array",
          description: "0-3 notifications to surface to the user. Use type 'alert' for safety/off-track, 'tip' for advice, 'reminder' for missed logs, 'success' for positive milestones.",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              message: { type: "string" },
              type: { type: "string", enum: ["alert", "tip", "reminder", "success"] },
            },
            required: ["title", "message", "type"],
            additionalProperties: false,
          },
        },
      },
      required: ["recoveryScore", "consistencyScore", "onTrack", "projectedOutcome", "focusToday", "coachingTip", "notifications"],
      additionalProperties: false,
    },
  },
};

const WORKOUT_TOOL = {
  type: "function",
  function: {
    name: "build_weekly_plan",
    description: "Return a fully personalized 7-day workout plan tailored to the user's profile, injuries, goals and recovery.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "1-2 sentence overview of the plan rationale, referencing the user's profile/injuries." },
        safetyNote: { type: "string", description: "Critical safety adjustment based on injuries or medical conditions." },
        days: {
          type: "array",
          minItems: 7,
          maxItems: 7,
          items: {
            type: "object",
            properties: {
              day: { type: "string", enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
              focus: { type: "string" },
              duration: { type: "string", description: "e.g. '40 min'" },
              calories: { type: "string", description: "e.g. '~320 cal'" },
              exercises: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    sets: { type: "number" },
                    reps: { type: "string", description: "e.g. '12' or '30s hold'" },
                    rest: { type: "string", description: "e.g. '60s' or '-'" },
                    safetyNote: { type: "string" },
                    isRehab: { type: "boolean" },
                  },
                  required: ["name", "sets", "reps", "rest"],
                  additionalProperties: false,
                },
              },
            },
            required: ["day", "focus", "duration", "calories", "exercises"],
            additionalProperties: false,
          },
        },
      },
      required: ["summary", "safetyNote", "days"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind, payload, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let body: any;

    if (kind === "nutrition") {
      body = {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are Fit Buddy AI's nutrition analyst. Give brief, actionable feedback on a user's meal based on their profile and goals. Always consider medical conditions. Keep it under 120 words. Use markdown.` },
          { role: "user", content: `User context: ${JSON.stringify(context || {})}
Meal description: ${payload?.meal || "(none)"}
Provide: 1) Quality rating (Poor/Fair/Good/Excellent), 2) Estimated macros, 3) One improvement tip.` },
        ],
      };
    } else if (kind === "followup") {
      body = {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are Fit Buddy AI's recovery coach. Analyze a workout follow-up report. Be safety-first: if pain >= 6, advise rest and medical check.` },
          { role: "user", content: `User context: ${JSON.stringify(context || {})}
Report: pain ${payload?.pain}/10, fatigue ${payload?.fatigue}/10. Notes: ${payload?.feedback}
Return: 1) Recovery score 0–100, 2) Adjustment for next session, 3) Any safety alert.` },
        ],
      };
    } else if (kind === "daily-adjust") {
      body = {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are Fit Buddy AI's daily goal-aware coach. Analyze the user's full profile, goal, recent meals, weight trend, recovery, and active workout plan to decide today's guidance. Be safety-first (injuries, chronic conditions). Be honest about off-track progress without being harsh. Always call the daily_adjust tool. Never reply in plain text.`,
          },
          {
            role: "user",
            content: `Profile, goal & history:\n${JSON.stringify(payload || {}, null, 2)}\nContext (today, day-of-week, active plan):\n${JSON.stringify(context || {}, null, 2)}`,
          },
        ],
        tools: [DAILY_ADJUST_TOOL],
        tool_choice: { type: "function", function: { name: "daily_adjust" } },
      };
    } else if (kind === "workout") {
      body = {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are Fit Buddy AI's elite personal trainer & physiotherapist. Build a SAFE, personalized 7-day plan.
RULES:
- Strictly avoid movements that aggravate listed injuries (suggest rehab/alternatives instead).
- Match intensity to recoveryScore (low <60 = mostly recovery; 60-80 = moderate; >80 = full intensity).
- Consider profession (e.g., office worker → more posture/mobility; soldier/athlete → higher volume).
- Include at least 1 active recovery / rest day.
- Each day must have 3-6 exercises (rest days can have 1-2 mobility items).
- Use realistic kcal estimates and durations.
- Always call the build_weekly_plan tool. Never reply with plain text.`,
          },
          {
            role: "user",
            content: `Build my weekly plan. Full profile:\n${JSON.stringify(payload || {}, null, 2)}\nCurrent metrics:\n${JSON.stringify(context || {}, null, 2)}`,
          },
        ],
        tools: [WORKOUT_TOOL],
        tool_choice: { type: "function", function: { name: "build_weekly_plan" } },
      };
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
      body: JSON.stringify(body),
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

    if (kind === "workout") {
      const call = data?.choices?.[0]?.message?.tool_calls?.[0];
      const argsStr = call?.function?.arguments;
      if (!argsStr) {
        console.error("No tool call returned", JSON.stringify(data).slice(0, 500));
        return new Response(JSON.stringify({ error: "AI did not return a structured plan" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      let plan: any;
      try { plan = JSON.parse(argsStr); } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to parse plan" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ plan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
