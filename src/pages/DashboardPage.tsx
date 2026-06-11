import { motion } from "framer-motion";
import {
  Scale,
  Flame,
  Heart,
  TrendingUp,
  Shield,
  Target,
  ArrowRight,
  Sparkles,
  Dumbbell,
  ClipboardCheck,
  Activity,
  Droplets,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppData } from "@/contexts/AppDataContext";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useMemo } from "react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  color: "hsl(var(--foreground))",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function motivation(goalDescription: string, current: number, target: number) {
  if (target && current && target < current) return "Lighter, stronger, every day. Let's keep the streak alive.";
  if (target && current && target > current) return "Build the strength that lasts. One rep closer today.";
  if (goalDescription) return goalDescription;
  return "Train with intention. Recover with discipline.";
}

export default function DashboardPage() {
  const { data, isSyncing } = useAppData();
  const navigate = useNavigate();

  const bmi = useMemo(() => {
    const h = (data.height || 0) / 100;
    if (!h || !data.weight) return 0;
    return Number((data.weight / (h * h)).toFixed(1));
  }, [data.weight, data.height]);

  const todayMeals = data.loggedMeals[new Date().toISOString().slice(0, 10)] ?? [];
  const todayCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const calorieProgress = data.dailyCaloriesTarget ? Math.min(100, (todayCalories / data.dailyCaloriesTarget) * 100) : 0;

  const targetWeight = data.profile.targetWeight || data.weight;
  const startWeight = data.weightHistory[0]?.weight ?? data.weight;
  const totalToLose = Math.abs(startWeight - targetWeight) || 1;
  const traveled = Math.abs(startWeight - data.weight);
  const goalProgress = Math.min(100, (traveled / totalToLose) * 100);

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const todayWorkout = data.workoutPlan?.days.find((d) => d.day === dayName);

  const firstName = (data.profile.fullName || "").split(" ")[0] || "Athlete";
  const profileIncomplete = !data.profile.fullName || !data.profile.targetWeight;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5 max-w-7xl mx-auto"
    >
      {/* HERO */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-3xl p-6 md:p-10 dark:gradient-hero-dark bg-[image:var(--hero-bg)]"
        style={{ ['--hero-bg' as any]: 'linear-gradient(180deg, hsl(0 0% 100%), hsl(0 0% 96%))' }}
      >
        <div className="absolute inset-0 dark:hidden gradient-hero-light" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            {greeting()},{" "}
            <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl">
            {motivation(data.profile.goalDescription, data.weight, data.profile.targetWeight)}
          </p>
          {profileIncomplete && (
            <Button
              onClick={() => navigate("/profile")}
              size="sm"
              className="mt-5 gradient-primary text-primary-foreground rounded-full hover:opacity-90"
            >
              Complete your profile <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
        {/* glow accents */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
      </motion.section>

      {/* METRICS */}
      {isSyncing ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="BMI" value={bmi} decimals={1} icon={Scale} progress={Math.min(100, (bmi / 30) * 100)} />
          <StatCard label="Recovery" value={data.recoveryScore} suffix="%" icon={Shield} progress={data.recoveryScore} />
          <StatCard label="Today's Calories" value={todayCalories} icon={Flame} progress={calorieProgress} accent="accent" />
          <StatCard label="Consistency" value={data.consistencyScore} suffix="%" icon={Target} progress={data.consistencyScore} />
        </motion.div>
      )}

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Weight" value={data.weight} suffix="kg" decimals={1} icon={Activity} />
        <StatCard label="Goal Progress" value={Math.round(goalProgress)} suffix="%" icon={TrendingUp} progress={goalProgress} accent="accent" />
        <StatCard label="Heart Rate" value={data.heartRate} suffix="bpm" icon={Heart} />
        <StatCard label="Water" value={data.waterGlasses} suffix={`/${data.waterTarget}`} icon={Droplets} progress={(data.waterGlasses / Math.max(1, data.waterTarget)) * 100} />
      </motion.div>

      {/* CHARTS */}
      <motion.div variants={item} className="grid md:grid-cols-2 gap-3">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-foreground text-sm">Weight Progress</h3>
            <span className="text-[11px] text-muted-foreground">target {targetWeight}kg</span>
          </div>
          {data.weightHistory.length === 0 ? (
            <EmptyState icon={Scale} text="Log your first weigh-in to see progress." />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.weightHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Activity (7d)</h3>
          {data.activityData.length === 0 ? (
            <EmptyState icon={Flame} text="Complete a workout to start tracking activity." />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#colorCal)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* TODAY'S WORKOUT */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-foreground text-base">Today's Workout</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {dayName} {todayWorkout ? `• ${todayWorkout.duration}` : ""}
            </p>
          </div>
          {todayWorkout && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-primary/15 text-primary font-semibold">
              {todayWorkout.focus}
            </span>
          )}
        </div>

        {!todayWorkout ? (
          <EmptyState
            icon={Dumbbell}
            text="No plan yet. Generate your AI weekly plan to get today's session."
            cta={<Button size="sm" onClick={() => navigate("/workout")} className="rounded-full gradient-primary text-primary-foreground">Generate plan</Button>}
          />
        ) : (
          <>
            <div className="space-y-2">
              {(todayWorkout.exercises ?? []).slice(0, 5).map((ex) => (
                <div key={ex.name} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground truncate">{ex.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium shrink-0 ml-2">
                    {ex.sets}×{ex.reps}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate("/workout")} size="sm" className="gradient-primary text-primary-foreground rounded-full hover:opacity-90 flex-1">
                Start workout
              </Button>
              <Button onClick={() => navigate("/followup")} variant="outline" size="sm" className="rounded-full flex-1">
                <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" /> Follow-up
              </Button>
            </div>
          </>
        )}
      </motion.div>

      {/* AI COACH TIP */}
      {data.notifications[0] && (
        <motion.div variants={item} className="glass-card p-5 glow-primary">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-foreground text-sm">{data.notifications[0].title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{data.notifications[0].message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function EmptyState({ icon: Icon, text, cta }: { icon: any; text: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground max-w-xs">{text}</p>
      {cta && <div className="mt-3">{cta}</div>}
    </div>
  );
}
