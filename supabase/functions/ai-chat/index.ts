const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool schemas — the model emits structured "actions" that the client applies
// to the global app state so chat results show up in Workout / Nutrition / etc.
const TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_workout_plan",
      description: "Generate a personalized 7-day workout plan when the user asks for training, a workout, a routine, or a plan. The plan will be saved to the user's Workout page.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          safetyNote: { type: "string" },
          days: {
            type: "array",
            minItems: 7,
            maxItems: 7,
            items: {
              type: "object",
              properties: {
                day: { type: "string", enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
                focus: { type: "string" },
                duration: { type: "string" },
                calories: { type: "string" },
                exercises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      sets: { type: "number" },
                      reps: { type: "string" },
                      rest: { type: "string" },
                      safetyNote: { type: "string" },
                      isRehab: { type: "boolean" },
                    },
                    required: ["name","sets","reps","rest"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["day","focus","duration","calories","exercises"],
              additionalProperties: false,
            },
          },
        },
        required: ["summary","safetyNote","days"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_meals",
      description: "Log one or more meal items to the user's nutrition diary when the user describes food eaten or asks to log a meal. Each item appears on the Nutrition page under its slot.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              properties: {
                slot: { type: "string", enum: ["Breakfast","Lunch","Snack","Dinner"] },
                name: { type: "string" },
                calories: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fat: { type: "number" },
              },
              required: ["slot","name","calories","protein"],
              additionalProperties: false,
            },
          },
        },
        required: ["items"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_water",
      description: "Increment or set today's water glasses on the Nutrition page when the user mentions drinking water.",
      parameters: {
        type: "object",
        properties: {
          glasses: { type: "number", description: "Number of glasses to ADD (positive integer)." },
        },
        required: ["glasses"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_notification",
      description: "Push an important alert/reminder/tip to the user's notifications panel.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          type: { type: "string", enum: ["alert","tip","reminder","success"] },
        },
        required: ["title","message","type"],
        additionalProperties: false,
      },
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = `You are Fit Buddy AI — a premium AI Health & Fitness Coach for users with injuries, medical conditions, and recovery needs. Always prioritize SAFETY first, then recovery, then performance. Be calm, professional, and concise. Use markdown.

User context:
${context ? JSON.stringify(context) : "No profile data yet."}

Rules:
- Never recommend exercises that may aggravate listed injuries.
- Suggest safer alternatives when relevant.
- Flag any concerning symptoms and recommend consulting a medical professional when appropriate.

ACTIONS:
You have tools that write directly to the user's app:
- generate_workout_plan → creates a 7-day plan that appears on the Workout page.
- log_meals → adds food entries to the Nutrition page (Breakfast/Lunch/Snack/Dinner).
- log_water → adds water glasses to the Nutrition page.
- add_notification → posts a reminder/alert/tip to the notification panel.

When the user asks for a workout, training plan, meal log, or hydration update, ALWAYS call the appropriate tool so the change appears in the relevant page — not just in chat. After calling a tool, also briefly confirm in plain text what was added and where to find it.`;

    // Mode "actions": non-streaming JSON pass to extract structured actions
    if (mode === "actions") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: system }, ...messages],
          tools: TOOLS,
          tool_choice: "auto",
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("Actions gateway error:", response.status, t);
        return new Response(JSON.stringify({ actions: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await response.json();
      const calls = data?.choices?.[0]?.message?.tool_calls ?? [];
      const actions = calls.map((c: any) => {
        let args: any = {};
        try { args = JSON.parse(c?.function?.arguments ?? "{}"); } catch {}
        return { name: c?.function?.name, args };
      });
      return new Response(JSON.stringify({ actions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: streaming chat reply (no tools — pure text for fast token streaming)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
