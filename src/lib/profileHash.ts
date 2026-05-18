// Stable hash of the profile fields that materially change the AI plan.
// Used to cache workout plans and only regenerate when relevant inputs change.

export interface HashableProfile {
  goals?: string[] | null;
  injuries_detailed?: unknown;
  equipment?: string[] | null;
  training_days_per_week?: number | null;
  session_duration_min?: number | null;
  activity_level?: string | null;
  dietary_style?: string[] | null;
  allergies?: string[] | null;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys
      .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export async function computeProfileHash(p: HashableProfile): Promise<string> {
  const payload = stableStringify({
    goals: [...(p.goals ?? [])].sort(),
    injuries_detailed: p.injuries_detailed ?? [],
    equipment: [...(p.equipment ?? [])].sort(),
    training_days_per_week: p.training_days_per_week ?? 0,
    session_duration_min: p.session_duration_min ?? 0,
    activity_level: p.activity_level ?? "",
    dietary_style: [...(p.dietary_style ?? [])].sort(),
    allergies: [...(p.allergies ?? [])].sort(),
  });
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
