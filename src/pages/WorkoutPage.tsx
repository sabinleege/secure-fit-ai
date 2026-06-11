import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dumbbell,
  Clock,
  Flame,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppData, type PlanDay, type PlanExercise, type WorkoutPlan } from "@/contexts/AppDataContext";
import { toast } from "sonner";

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analyze`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const fallbackPlan: WorkoutPlan = {
  summary: "Default safe template. Generate your AI plan from your profile to make it truly personal.",
  safetyNote: "This is a generic template. Tap 'Generate AI Plan' so the coach considers your injuries, profession and recovery.",
  generatedAt: new Date().toISOString(),
  basedOn: { weight: 0, injuries: "", profession: "", recoveryScore: 0 },
  days: [
    { day: "Monday", focus: "Upper Body (Modified)", duration: "40 min", calories: "~320 cal",
      exercises: [
        { name: "Wall Push-ups", sets: 3, reps: "12", rest: "60s" },
        { name: "Resistance Band Rows", sets: 3, reps: "15", rest: "60s" },
        { name: "Bicep Curls", sets: 3, reps: "12", rest: "45s" },
      ]},
    { day: "Tuesday", focus: "Core & Mobility", duration: "30 min", calories: "~200 cal",
      exercises: [
        { name: "Dead Bug", sets: 3, reps: "10 each side", rest: "45s" },
        { name: "Cat-Cow Stretch", sets: 3, reps: "10", rest: "30s", isRehab: true },
      ]},
    { day: "Wednesday", focus: "Rest & Recovery", duration: "15 min", calories: "~80 cal",
      exercises: [{ name: "Foam Rolling", sets: 1, reps: "5 min", rest: "-", isRehab: true }] },
    { day: "Thursday", focus: "Lower Body", duration: "45 min", calories: "~380 cal",
      exercises: [
        { name: "Bodyweight Squats", sets: 3, reps: "15", rest: "60s" },
        { name: "Glute Bridges", sets: 3, reps: "12", rest: "60s" },
        { name: "Calf Raises", sets: 3, reps: "20", rest: "45s" },
      ]},
    { day: "Friday", focus: "Cardio (Low Impact)", duration: "35 min", calories: "~300 cal",
      exercises: [{ name: "Brisk Walking", sets: 1, reps: "20 min", rest: "-" }] },
    { day: "Saturday", focus: "Full Body Light", duration: "40 min", calories: "~350 cal",
      exercises: [
        { name: "Band Pull-Aparts", sets: 3, reps: "15", rest: "45s" },
        { name: "Goblet Squats (Light)", sets: 3, reps: "12", rest: "60s" },
      ]},
    { day: "Sunday", focus: "Active Recovery", duration: "20 min", calories: "~100 cal",
      exercises: [{ name: "Yoga Flow", sets: 1, reps: "15 min", rest: "-", isRehab: true }] },
  ],
};

function ExerciseRow({ exercise, dayName }: { exercise: PlanExercise; dayName: string }) {
  const { data, toggleExerciseDone } = useAppData();
  const key = `${dayName}::${exercise.name}`;
  const done = data.completedExercises.includes(key);

  return (
    <div
      className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all duration-250 ${
        done ? "bg-success/5 border border-success/20" : "border border-transparent hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => toggleExerciseDone(key)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            done ? "border-success bg-success text-success-foreground" : "border-muted-foreground/40"
          }`}
        >
          {done && <CheckCircle2 className="w-4 h-4" />}
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {exercise.name}
            </span>
            {exercise.isRehab && (
              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary px-1.5 py-0">
                Rehab
              </Badge>
            )}
          </div>
          {exercise.safetyNote && (
            <p className="text-[11px] text-warning flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 shrink-0" /> {exercise.safetyNote}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span>{exercise.sets}×{exercise.reps}</span>
        <span className="hidden sm:inline">{exercise.rest}</span>
      </div>
    </div>
  );
}

function WorkoutDayCard({ workout, isToday }: { workout: PlanDay; isToday: boolean }) {
  const [expanded, setExpanded] = useState(isToday);

  return (
    <motion.div
      variants={item}
      className={`glass-card overflow-hidden ${isToday ? "glow-primary border-primary/30" : ""}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isToday ? "gradient-primary" : "bg-muted"
          }`}>
            <Dumbbell className={`w-5 h-5 ${isToday ? "text-primary-foreground" : "text-muted-foreground"}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-foreground text-sm">{workout.day}</h3>
              {isToday && (
                <Badge className="gradient-primary text-primary-foreground text-[10px] px-2">Today</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{workout.focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.duration}</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {workout.calories}</span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="px-5 pb-5"
        >
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 sm:hidden">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.duration}</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {workout.calories}</span>
          </div>
          <div className="space-y-1">
            {(workout.exercises ?? []).map((ex) => (
              <ExerciseRow key={ex.name} exercise={ex} dayName={workout.day} />
            ))}
          </div>
          {isToday && (
            <div className="flex gap-3 mt-4">
              <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity flex-1">
                <Play className="w-4 h-4 mr-2" /> Start Workout
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function WorkoutPage() {
  const { data, setWorkoutPlan } = useAppData();
  const [generating, setGenerating] = useState(false);
  const plan = data.workoutPlan ?? fallbackPlan;
  const isAIGenerated = !!data.workoutPlan;
  const today = data.currentDay;

  const totalExercises = plan.days.reduce((sum, d) => sum + d.exercises.length, 0);
  const completedCount = data.completedExercises.length;
  const progressPct = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const totalDuration = plan.days.reduce((sum, d) => {
    const m = parseInt(String(d.duration ?? ""));
    return sum + (isNaN(m) ? 0 : m);
  }, 0);
  const totalCals = plan.days.reduce((sum, d) => {
    const m = parseInt(String(d.calories ?? "").replace(/\D/g, ""));
    return sum + (isNaN(m) ? 0 : m);
  }, 0);

  const generate = async () => {
    if (generating) return;
    setGenerating(true);
    toast.info("AI is building your personalized plan...");
    try {
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({
          kind: "workout",
          payload: data.profile,
          context: {
            bodyFat: data.bodyFat,
            fitnessScore: data.fitnessScore,
            recoveryScore: data.recoveryScore,
            consistencyScore: data.consistencyScore,
            heartRate: data.heartRate,
            currentDay: data.currentDay,
            recentWeight: data.weightHistory.slice(-4),
          },
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) toast.error("Rate limit reached. Try again shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("Failed to generate plan.");
        return;
      }

      const json = await resp.json();
      if (!json.plan?.days?.length) {
        toast.error("AI response was incomplete. Please try again.");
        return;
      }

      const newPlan: WorkoutPlan = {
        ...json.plan,
        generatedAt: new Date().toISOString(),
        basedOn: {
          weight: data.profile.weight,
          injuries: data.profile.injuries.map((i) => i.area).join(", ") || "none",
          profession: data.profile.profession,
          recoveryScore: data.recoveryScore,
        },
      };
      setWorkoutPlan(newPlan);
      toast.success("Personalized plan ready!");
    } catch (e) {
      console.error(e);
      toast.error("Network error generating plan.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item} className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-primary" /> Workout Plan
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAIGenerated ? "AI-personalized for your profile" : "Generate a plan tailored to you"}
          </p>
        </div>
        <Button
          onClick={generate}
          disabled={generating}
          className="gradient-primary text-primary-foreground rounded-xl"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
          ) : isAIGenerated ? (
            <><RefreshCw className="w-4 h-4 mr-2" /> Regenerate Plan</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate AI Plan</>
          )}
        </Button>
      </motion.div>

      {/* AI summary card */}
      {isAIGenerated && (
        <motion.div variants={item} className="glass-card p-5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">AI Plan Summary</p>
              <p className="text-xs text-muted-foreground mt-1">{plan.summary}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="text-[10px] border-border">
                  Recovery {plan.basedOn.recoveryScore}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-border">
                  {plan.basedOn.profession}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-border">
                  Injuries: {plan.basedOn.injuries}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Weekly Overview */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground text-sm">Weekly Progress</h3>
          <span className="text-xs text-muted-foreground">{completedCount} of {totalExercises} exercises</span>
        </div>
        <Progress value={progressPct} className="h-2" />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-display">{totalCals.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Est. Calories</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-display">{totalDuration} min</p>
            <p className="text-xs text-muted-foreground">Total Duration</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary font-display">{progressPct}%</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </motion.div>

      {/* Safety Notice */}
      <motion.div variants={item} className="glass-card p-4 border-warning/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">AI Safety Adjustment</p>
            <p className="text-xs text-muted-foreground mt-1">{plan.safetyNote}</p>
          </div>
        </div>
      </motion.div>

      {/* Daily Plans */}
      <div className="space-y-3">
        {plan.days.map((workout) => (
          <WorkoutDayCard key={workout.day} workout={workout} isToday={workout.day === today} />
        ))}
      </div>
    </motion.div>
  );
}
