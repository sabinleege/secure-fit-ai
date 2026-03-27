import { motion } from "framer-motion";
import {
  Activity,
  Scale,
  Flame,
  Heart,
  TrendingUp,
  Zap,
  Shield,
  Target,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Dumbbell,
  ClipboardCheck,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
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
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  color: "hsl(var(--foreground))",
};

export default function DashboardPage() {
  const { data } = useAppData();
  const navigate = useNavigate();

  const bmi = useMemo(() => {
    const h = data.height / 100;
    return (data.weight / (h * h)).toFixed(1);
  }, [data.weight, data.height]);

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="font-display text-xl font-bold text-foreground">
          Welcome back 👋
        </h1>
        <p className="text-muted-foreground text-xs mt-1">
          {data.currentDate} — Complete your profile for personalized coaching.
        </p>
      </motion.div>

      {/* Onboarding Prompt */}
      <motion.div variants={item} className="glass-card p-4 glow-primary">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground text-sm">Complete Your Health Profile</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Fill in your medical history and goals for a safe, personalized plan.
            </p>
            <Button
              onClick={() => navigate("/profile")}
              size="sm"
              className="mt-3 gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-xs"
            >
              Start Setup <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <StatCard label="BMI" value={bmi} icon={Scale} trend="-0.5" trendUp />
        <StatCard label="Body Fat" value={`${data.bodyFat}%`} icon={Activity} trend="-1.2%" trendUp />
        <StatCard label="Fitness" value={String(data.fitnessScore)} icon={Zap} trend="+5" trendUp />
        <StatCard label="Recovery" value={`${data.recoveryScore}%`} icon={Shield} trend="+3%" trendUp glowColor="secondary" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <StatCard label="Daily Cal" value={data.dailyCaloriesTarget.toLocaleString()} icon={Flame} />
        <StatCard label="Burned" value={data.weeklyCaloriesBurned.toLocaleString()} icon={TrendingUp} trend="+12%" trendUp />
        <StatCard label="Consistency" value={`${data.consistencyScore}%`} icon={Target} trend="+4%" trendUp />
        <StatCard label="Heart Rate" value={`${data.heartRate} bpm`} icon={Heart} />
      </motion.div>

      {/* AI Alerts + Coach Tip */}
      <motion.div variants={item} className="space-y-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="font-display font-semibold text-foreground text-sm">AI Health Alert</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Your recovery score dropped 8% this week. Consider reducing intensity and prioritizing sleep.
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">AI Coach Tip</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Great consistency this week! Add 5 min of mobility work before sessions.
          </p>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="space-y-3">
        <div className="glass-card p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Weight Progress</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.weightHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Activity Trends</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="calories" stroke="hsl(var(--secondary))" strokeWidth={2} fill="url(#colorCal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Today's Workout */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground text-sm">Today's Workout</h3>
          <span className="text-[11px] text-muted-foreground">{dayName} • 45 min</span>
        </div>
        <div className="space-y-2">
          {[
            { name: "Push-ups (Modified)", sets: "3×12" },
            { name: "Resistance Band Rows", sets: "3×15" },
            { name: "Shoulder Press (Light)", sets: "3×10" },
            { name: "Plank Hold", sets: "3×30s" },
          ].map((ex) => (
            <div key={ex.name} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-3 h-3 text-primary" />
                <span className="text-xs text-foreground">{ex.name}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">{ex.sets}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={() => navigate("/workout")} size="sm" className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity flex-1 text-xs">
            Start Workout
          </Button>
          <Button onClick={() => navigate("/followup")} variant="outline" size="sm" className="rounded-xl border-border text-foreground hover:bg-muted flex-1 text-xs">
            <ClipboardCheck className="w-3 h-3 mr-1" /> Follow-Up
          </Button>
        </div>
      </motion.div>

      {/* Payment History */}
      <motion.div variants={item} className="glass-card p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-3">Payment History</h3>
        <div className="space-y-2">
          {[
            { date: "Mar 1, 2026", amount: "$5.00", status: "Paid" },
            { date: "Feb 1, 2026", amount: "$5.00", status: "Paid" },
            { date: "Jan 1, 2026", amount: "$5.00", status: "Paid" },
          ].map((p) => (
            <div key={p.date} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
              <span className="text-xs text-foreground">{p.date}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground">{p.amount}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-success/10 text-success">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
