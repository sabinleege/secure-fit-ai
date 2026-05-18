import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Check, Upload, Loader2, Activity, Heart, Dumbbell, Apple, Wrench, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeProfileHash } from "@/lib/profileHash";

// ---------- schema & types ----------

const InjurySchema = z.object({
  area: z.string(),
  severity: z.enum(["Mild", "Moderate", "Severe"]),
  duration: z.string().default(""),
  doctor_notes: z.string().default(""),
});

const FormSchema = z.object({
  full_name: z.string().trim().min(1, "Required").max(80),
  age: z.coerce.number().int().min(16).max(80),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say"]),
  height: z.coerce.number().min(120).max(230),
  weight: z.coerce.number().min(30).max(300),
  goal_weight: z.coerce.number().min(30).max(300).optional().or(z.literal("").transform(() => undefined)),
  date_of_birth: z.string().optional(),
  avatar_url: z.string().optional(),

  goals: z.array(z.string()).min(1, "Pick at least one goal"),
  goals_notes: z.string().max(500).default(""),

  activity_level: z.enum(["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Extremely Active"]),
  training_days_per_week: z.number().int().min(1).max(7),
  session_duration_min: z.number().int().min(30).max(90),
  preferred_times: z.array(z.string()).default([]),

  injuries_detailed: z.array(InjurySchema).default([]),
  other_limitations: z.string().max(500).default(""),
  medical_disclaimer_accepted: z.literal(true, { errorMap: () => ({ message: "You must accept the disclaimer" }) }),

  dietary_style: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  meals_per_day: z.number().int().min(2).max(6),
  cultural_restrictions: z.string().max(300).default(""),

  equipment: z.array(z.string()).min(1, "Pick at least one option"),
  training_location: z.enum(["Home", "Gym", "Outdoor", "Mixed"]),
  environment_notes: z.string().max(300).default(""),

  tos_accepted: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  data_consent: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

type FormData = z.infer<typeof FormSchema>;

const STEPS = [
  { key: "personal", title: "About you", icon: Activity },
  { key: "goals", title: "Goals", icon: Heart },
  { key: "schedule", title: "Schedule", icon: Dumbbell },
  { key: "medical", title: "Health & injuries", icon: Shield },
  { key: "nutrition", title: "Nutrition", icon: Apple },
  { key: "equipment", title: "Equipment", icon: Wrench },
  { key: "review", title: "Review", icon: Check },
];

const GOAL_OPTIONS = [
  "Build Muscle", "Lose Body Fat", "Increase Strength", "Improve Endurance",
  "Cardiovascular Health", "Sport Performance", "Injury Rehabilitation",
  "General Wellness", "Mobility & Flexibility",
];
const ACTIVITY_OPTIONS = [
  { v: "Sedentary", d: "Little or no exercise" },
  { v: "Lightly Active", d: "1–3 days/week light activity" },
  { v: "Moderately Active", d: "3–5 days/week moderate" },
  { v: "Very Active", d: "6–7 days/week hard exercise" },
  { v: "Extremely Active", d: "Physical job + daily training" },
];
const TIME_OPTIONS = ["Morning", "Afternoon", "Evening", "Night"];
const INJURY_AREAS = [
  "Lower Back", "Knee", "Shoulder", "Wrist", "Ankle", "Neck", "Hip", "Elbow",
];
const DIET_OPTIONS = [
  "Omnivore", "Vegetarian", "Vegan", "Pescatarian", "Keto", "Low-Carb",
  "Mediterranean", "Halal", "Kosher",
];
const ALLERGY_OPTIONS = ["Dairy", "Gluten", "Nuts", "Soy", "Eggs", "Shellfish", "Fish"];
const EQUIPMENT_OPTIONS = [
  "Full Gym", "Home Gym", "Dumbbells", "Barbells", "Resistance Bands",
  "Pull-up Bar", "Bodyweight Only", "Kettlebells",
];

const DRAFT_KEY = "onboarding_draft_v1";

const initialData: Partial<FormData> = {
  full_name: "",
  age: 28,
  gender: "Prefer not to say",
  height: 175,
  weight: 75,
  goals: [],
  goals_notes: "",
  activity_level: "Moderately Active",
  training_days_per_week: 3,
  session_duration_min: 45,
  preferred_times: [],
  injuries_detailed: [],
  other_limitations: "",
  medical_disclaimer_accepted: false as unknown as true,
  dietary_style: [],
  allergies: [],
  meals_per_day: 3,
  cultural_restrictions: "",
  equipment: [],
  training_location: "Gym",
  environment_notes: "",
  tos_accepted: false as unknown as true,
  data_consent: false as unknown as true,
};

// ---------- helpers ----------

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// ---------- main ----------

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<FormData>>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) return { ...initialData, ...JSON.parse(raw) };
    } catch {}
    return initialData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // hydrate from existing profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth", { replace: true }); return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (profile?.onboarding_completed) {
        navigate("/", { replace: true });
        return;
      }
      if (profile) {
        setData((prev) => ({
          ...prev,
          full_name: profile.full_name || prev.full_name,
          age: profile.age ?? prev.age,
          height: profile.height != null ? Number(profile.height) : prev.height,
          weight: profile.weight != null ? Number(profile.weight) : prev.weight,
          goal_weight: profile.goal_weight != null ? Number(profile.goal_weight) : prev.goal_weight,
          avatar_url: profile.avatar_url ?? prev.avatar_url,
        }));
      }
    })();
  }, [navigate]);

  // persist draft
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggle = (k: keyof FormData, v: string) => {
    const arr = ((data[k] as unknown as string[]) ?? []).slice();
    const i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else arr.push(v);
    setData((d) => ({ ...d, [k]: arr as unknown as FormData[typeof k] }));
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  // per-step validation
  function validateStep(i: number): boolean {
    const e: Record<string, string> = {};
    const d = data as FormData;
    if (i === 0) {
      if (!d.full_name?.trim()) e.full_name = "Required";
      if (!d.age || d.age < 16 || d.age > 80) e.age = "16–80";
      if (!d.height || d.height < 120 || d.height > 230) e.height = "120–230 cm";
      if (!d.weight || d.weight < 30 || d.weight > 300) e.weight = "30–300 kg";
    }
    if (i === 1) {
      if (!d.goals || d.goals.length === 0) e.goals = "Pick at least one";
    }
    if (i === 3) {
      if (!d.medical_disclaimer_accepted) e.medical_disclaimer_accepted = "Required";
    }
    if (i === 5) {
      if (!d.equipment || d.equipment.length === 0) e.equipment = "Pick at least one";
    }
    if (i === 6) {
      if (!d.tos_accepted) e.tos_accepted = "Required";
      if (!d.data_consent) e.data_consent = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const next = () => {
    if (!validateStep(step)) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  async function handleAvatar(file: File) {
    setUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      set("avatar_url", pub.publicUrl as FormData["avatar_url"]);
      toast.success("Photo uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function finish() {
    // validate every step
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) { setStep(i); toast.error("Some fields need attention"); return; }
    }
    const parsed = FormSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const v = parsed.data;
      const profile_hash = await computeProfileHash({
        goals: v.goals,
        injuries_detailed: v.injuries_detailed,
        equipment: v.equipment,
        training_days_per_week: v.training_days_per_week,
        session_duration_min: v.session_duration_min,
        activity_level: v.activity_level,
        dietary_style: v.dietary_style,
        allergies: v.allergies,
      });
      const now = new Date().toISOString();
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: v.full_name,
        age: v.age,
        gender: v.gender,
        height: v.height,
        weight: v.weight,
        goal_weight: v.goal_weight ?? null,
        date_of_birth: v.date_of_birth || null,
        avatar_url: v.avatar_url ?? null,
        goals: v.goals,
        goals_notes: v.goals_notes,
        activity_level: v.activity_level,
        training_days_per_week: v.training_days_per_week,
        session_duration_min: v.session_duration_min,
        preferred_times: v.preferred_times,
        injuries_detailed: v.injuries_detailed,
        other_limitations: v.other_limitations,
        medical_disclaimer_accepted: true,
        medical_disclaimer_accepted_at: now,
        dietary_style: v.dietary_style,
        allergies: v.allergies,
        meals_per_day: v.meals_per_day,
        cultural_restrictions: v.cultural_restrictions,
        equipment: v.equipment,
        training_location: v.training_location,
        environment_notes: v.environment_notes,
        tos_accepted: true,
        tos_accepted_at: now,
        data_consent: true,
        data_consent_at: now,
        profile_hash,
        onboarding_completed: true,
      });
      if (error) throw error;

      // fire-and-forget initial plan generation
      supabase.functions.invoke("generate-workout-plan", { body: { profile_hash } }).catch(() => {});

      localStorage.removeItem(DRAFT_KEY);
      toast.success("Profile complete — building your plan!");
      navigate("/", { replace: true });
    } catch (e: any) {
      toast.error(e?.message || "Could not save profile");
    } finally {
      setSubmitting(false);
    }
  }

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <StepIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-medium">Step {step + 1} of {STEPS.length} · {STEPS[step].title}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 md:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <StepShell title="Let's get to know you" subtitle="This personalizes everything — workouts, calories, recovery.">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border">
                    {data.avatar_url ? (
                      <img src={data.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Activity className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatar(f); }}
                    />
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}>
                      {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Profile photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Optional</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full name</Label>
                    <Input value={data.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} placeholder="Jane Doe" />
                    {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <RadioGroup
                      value={data.gender}
                      onValueChange={(v) => set("gender", v as FormData["gender"])}
                      className="grid grid-cols-2 gap-2 mt-2"
                    >
                      {(["Male", "Female", "Non-binary", "Prefer not to say"] as const).map((g) => (
                        <Label key={g} className="flex items-center gap-2 border border-border rounded-md p-2 cursor-pointer">
                          <RadioGroupItem value={g} /> <span className="text-sm">{g}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input type="number" value={data.age ?? ""} onChange={(e) => set("age", Number(e.target.value) as FormData["age"])} />
                    {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <Label>Date of birth (optional)</Label>
                    <Input type="date" value={data.date_of_birth ?? ""} onChange={(e) => set("date_of_birth", e.target.value as FormData["date_of_birth"])} />
                  </div>
                  <div>
                    <Label>Height (cm)</Label>
                    <Input type="number" value={data.height ?? ""} onChange={(e) => set("height", Number(e.target.value) as FormData["height"])} />
                    {errors.height && <p className="text-xs text-destructive mt-1">{errors.height}</p>}
                  </div>
                  <div>
                    <Label>Current weight (kg)</Label>
                    <Input type="number" value={data.weight ?? ""} onChange={(e) => set("weight", Number(e.target.value) as FormData["weight"])} />
                    {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight}</p>}
                  </div>
                  <div>
                    <Label>Goal weight (kg) — optional</Label>
                    <Input type="number" value={data.goal_weight ?? ""} onChange={(e) => set("goal_weight", (e.target.value === "" ? undefined : Number(e.target.value)) as FormData["goal_weight"])} />
                  </div>
                </div>
              </StepShell>
            )}

            {step === 1 && (
              <StepShell title="What are your fitness goals?" subtitle="Pick everything that matters to you.">
                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map((g) => (
                    <Chip key={g} active={(data.goals ?? []).includes(g)} onClick={() => toggle("goals", g)}>{g}</Chip>
                  ))}
                </div>
                {errors.goals && <p className="text-xs text-destructive">{errors.goals}</p>}
                <div>
                  <Label>Specific targets (optional)</Label>
                  <Textarea
                    value={data.goals_notes ?? ""}
                    onChange={(e) => set("goals_notes", e.target.value)}
                    placeholder="e.g. Run 5km under 25min, deadlift 100kg"
                    rows={3}
                  />
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell title="How active are you?" subtitle="We'll match volume and intensity to your lifestyle.">
                <div>
                  <Label>Activity level</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {ACTIVITY_OPTIONS.map((a) => (
                      <button
                        key={a.v}
                        type="button"
                        onClick={() => set("activity_level", a.v as FormData["activity_level"])}
                        className={`text-left border rounded-lg p-3 transition ${
                          data.activity_level === a.v
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium text-sm">{a.v}</div>
                        <div className="text-xs text-muted-foreground">{a.d}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Training days per week</Label>
                    <span className="text-sm font-medium">{data.training_days_per_week}</span>
                  </div>
                  <Slider
                    value={[data.training_days_per_week ?? 3]}
                    onValueChange={([v]) => set("training_days_per_week", v as FormData["training_days_per_week"])}
                    min={1} max={7} step={1} className="mt-3"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Session duration (minutes)</Label>
                    <span className="text-sm font-medium">{data.session_duration_min}</span>
                  </div>
                  <Slider
                    value={[data.session_duration_min ?? 45]}
                    onValueChange={([v]) => set("session_duration_min", v as FormData["session_duration_min"])}
                    min={30} max={90} step={5} className="mt-3"
                  />
                </div>
                <div>
                  <Label>Preferred training times</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TIME_OPTIONS.map((t) => (
                      <Chip key={t} active={(data.preferred_times ?? []).includes(t)} onClick={() => toggle("preferred_times", t)}>{t}</Chip>
                    ))}
                  </div>
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell title="Injuries & medical history" subtitle="Safety first. We tailor every exercise to your body.">
                <div>
                  <Label>Any current pain or injuries?</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INJURY_AREAS.map((area) => {
                      const active = (data.injuries_detailed ?? []).some((i) => i.area === area);
                      return (
                        <Chip
                          key={area}
                          active={active}
                          onClick={() => {
                            const list = (data.injuries_detailed ?? []).slice();
                            const idx = list.findIndex((i) => i.area === area);
                            if (idx >= 0) list.splice(idx, 1);
                            else list.push({ area, severity: "Mild", duration: "", doctor_notes: "" });
                            set("injuries_detailed", list as FormData["injuries_detailed"]);
                          }}
                        >
                          {area}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
                {(data.injuries_detailed ?? []).length > 0 && (
                  <div className="space-y-3">
                    {(data.injuries_detailed ?? []).map((inj, idx) => (
                      <Card key={inj.area} className="p-4 space-y-3">
                        <div className="font-medium">{inj.area}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Severity</Label>
                            <RadioGroup
                              value={inj.severity}
                              onValueChange={(v) => {
                                const list = (data.injuries_detailed ?? []).slice();
                                list[idx] = { ...list[idx], severity: v as any };
                                set("injuries_detailed", list as FormData["injuries_detailed"]);
                              }}
                              className="flex gap-2 mt-1"
                            >
                              {(["Mild", "Moderate", "Severe"] as const).map((s) => (
                                <Label key={s} className="flex items-center gap-1 border border-border rounded-md px-2 py-1 text-xs cursor-pointer">
                                  <RadioGroupItem value={s} /> {s}
                                </Label>
                              ))}
                            </RadioGroup>
                          </div>
                          <div>
                            <Label className="text-xs">How long?</Label>
                            <Input
                              value={inj.duration}
                              onChange={(e) => {
                                const list = (data.injuries_detailed ?? []).slice();
                                list[idx] = { ...list[idx], duration: e.target.value };
                                set("injuries_detailed", list as FormData["injuries_detailed"]);
                              }}
                              placeholder="e.g. 6 weeks"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Doctor recommendations (optional)</Label>
                          <Textarea
                            value={inj.doctor_notes}
                            rows={2}
                            onChange={(e) => {
                              const list = (data.injuries_detailed ?? []).slice();
                              list[idx] = { ...list[idx], doctor_notes: e.target.value };
                              set("injuries_detailed", list as FormData["injuries_detailed"]);
                            }}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                <div>
                  <Label>Other limitations (optional)</Label>
                  <Textarea value={data.other_limitations ?? ""} onChange={(e) => set("other_limitations", e.target.value)} rows={2} />
                </div>
                <Card className="p-4 border-amber-500/30 bg-amber-500/5">
                  <p className="text-sm text-foreground/90">
                    <strong>Medical disclaimer:</strong> This app is not a substitute for professional medical advice.
                    Consult a doctor before starting any program — especially with existing conditions or injuries.
                  </p>
                  <Label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <Checkbox
                      checked={data.medical_disclaimer_accepted === true}
                      onCheckedChange={(c) => set("medical_disclaimer_accepted", (c === true) as FormData["medical_disclaimer_accepted"])}
                    />
                    <span className="text-sm">I understand and take responsibility for my health.</span>
                  </Label>
                  {errors.medical_disclaimer_accepted && <p className="text-xs text-destructive mt-1">{errors.medical_disclaimer_accepted}</p>}
                </Card>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell title="Nutrition profile" subtitle="So meal suggestions actually fit your life.">
                <div>
                  <Label>Dietary style</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DIET_OPTIONS.map((d) => (
                      <Chip key={d} active={(data.dietary_style ?? []).includes(d)} onClick={() => toggle("dietary_style", d)}>{d}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Allergies & intolerances</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ALLERGY_OPTIONS.map((a) => (
                      <Chip key={a} active={(data.allergies ?? []).includes(a)} onClick={() => toggle("allergies", a)}>{a}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Meals per day</Label>
                    <span className="text-sm font-medium">{data.meals_per_day}</span>
                  </div>
                  <Slider
                    value={[data.meals_per_day ?? 3]}
                    onValueChange={([v]) => set("meals_per_day", v as FormData["meals_per_day"])}
                    min={2} max={6} step={1} className="mt-3"
                  />
                </div>
                <div>
                  <Label>Cultural / religious restrictions (optional)</Label>
                  <Textarea value={data.cultural_restrictions ?? ""} onChange={(e) => set("cultural_restrictions", e.target.value)} rows={2} />
                </div>
              </StepShell>
            )}

            {step === 5 && (
              <StepShell title="Equipment & environment" subtitle="We only program what you can actually do.">
                <div>
                  <Label>Equipment access</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EQUIPMENT_OPTIONS.map((e) => (
                      <Chip key={e} active={(data.equipment ?? []).includes(e)} onClick={() => toggle("equipment", e)}>{e}</Chip>
                    ))}
                  </div>
                  {errors.equipment && <p className="text-xs text-destructive mt-1">{errors.equipment}</p>}
                </div>
                <div>
                  <Label>Where do you usually train?</Label>
                  <RadioGroup
                    value={data.training_location}
                    onValueChange={(v) => set("training_location", v as FormData["training_location"])}
                    className="grid grid-cols-2 gap-2 mt-2"
                  >
                    {(["Home", "Gym", "Outdoor", "Mixed"] as const).map((l) => (
                      <Label key={l} className="flex items-center gap-2 border border-border rounded-md p-2 cursor-pointer">
                        <RadioGroupItem value={l} /> <span className="text-sm">{l}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label>Notes about your space (optional)</Label>
                  <Textarea value={data.environment_notes ?? ""} onChange={(e) => set("environment_notes", e.target.value)} rows={2} />
                </div>
              </StepShell>
            )}

            {step === 6 && (
              <StepShell title="Review & confirm" subtitle="Make sure everything looks right.">
                <ReviewBlock title="About you" onEdit={() => setStep(0)}>
                  {data.full_name} · {data.age}y · {data.gender} · {data.height}cm · {data.weight}kg
                  {data.goal_weight ? ` → ${data.goal_weight}kg` : ""}
                </ReviewBlock>
                <ReviewBlock title="Goals" onEdit={() => setStep(1)}>
                  <div className="flex flex-wrap gap-1">
                    {(data.goals ?? []).map((g) => <Badge key={g} variant="secondary">{g}</Badge>)}
                  </div>
                  {data.goals_notes && <p className="text-xs text-muted-foreground mt-2">{data.goals_notes}</p>}
                </ReviewBlock>
                <ReviewBlock title="Schedule" onEdit={() => setStep(2)}>
                  {data.activity_level} · {data.training_days_per_week} days/wk · {data.session_duration_min} min
                  {(data.preferred_times ?? []).length > 0 && ` · ${(data.preferred_times ?? []).join(", ")}`}
                </ReviewBlock>
                <ReviewBlock title="Health" onEdit={() => setStep(3)}>
                  {(data.injuries_detailed ?? []).length === 0
                    ? "No reported injuries"
                    : (data.injuries_detailed ?? []).map((i) => `${i.area} (${i.severity})`).join(", ")}
                </ReviewBlock>
                <ReviewBlock title="Nutrition" onEdit={() => setStep(4)}>
                  {(data.dietary_style ?? []).join(", ") || "No restrictions"} · {data.meals_per_day} meals/day
                  {(data.allergies ?? []).length > 0 && ` · avoiding ${(data.allergies ?? []).join(", ")}`}
                </ReviewBlock>
                <ReviewBlock title="Equipment" onEdit={() => setStep(5)}>
                  {(data.equipment ?? []).join(", ")} · {data.training_location}
                </ReviewBlock>
                <Card className="p-4 space-y-2">
                  <Label className="flex items-start gap-2 cursor-pointer">
                    <Checkbox
                      checked={data.data_consent === true}
                      onCheckedChange={(c) => set("data_consent", (c === true) as FormData["data_consent"])}
                    />
                    <span className="text-sm">I consent to storing and processing my health & fitness data to personalize my plan.</span>
                  </Label>
                  {errors.data_consent && <p className="text-xs text-destructive">{errors.data_consent}</p>}
                  <Label className="flex items-start gap-2 cursor-pointer">
                    <Checkbox
                      checked={data.tos_accepted === true}
                      onCheckedChange={(c) => set("tos_accepted", (c === true) as FormData["tos_accepted"])}
                    />
                    <span className="text-sm">I accept the Terms of Service and Privacy Policy.</span>
                  </Label>
                  {errors.tos_accepted && <p className="text-xs text-destructive">{errors.tos_accepted}</p>}
                </Card>
              </StepShell>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 0 || submitting}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={submitting} className="min-w-[220px]">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <>Complete & Generate Plan <Check className="w-4 h-4" /></>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
      </div>
      <div className="text-sm">{children}</div>
    </Card>
  );
}
