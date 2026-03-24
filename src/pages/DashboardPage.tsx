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

const weightData = [
  { week: "W1", weight: 85 },
  { week: "W2", weight: 84.2 },
  { week: "W3", weight: 83.5 },
  { week: "W4", weight: 83.1 },
  { week: "W5", weight: 82.4 },
  { week: "W6", weight: 81.8 },
];

const activityData = [
  { day: "Mon", calories: 320 },
  { day: "Tue", calories: 450 },
  { day: "Wed", calories: 280 },
  { day: "Thu", calories: 520 },
  { day: "Fri", calories: 390 },
  { day: "Sat", calories: 610 },
  { day: "Sun", calories: 200 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function DashboardPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete your profile to unlock personalized AI coaching.
        </p>
      </motion.div>

      {/* Onboarding Prompt */}
      <motion.div variants={item} className="glass-card p-6 glow-primary">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground">Complete Your Health Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in your medical history, injuries, and fitness goals so our AI can create a safe, personalized plan.
            </p>
            <Button className="mt-4 gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
              Start Profile Setup <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="BMI" value="24.3" icon={Scale} trend="-0.5" trendUp />
        <StatCard label="Body Fat" value="18%" icon={Activity} trend="-1.2%" trendUp />
        <StatCard label="Fitness Score" value="72" icon={Zap} trend="+5" trendUp />
        <StatCard label="Recovery" value="85%" icon={Shield} trend="+3%" trendUp glowColor="secondary" />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Daily Calories" value="2,150" icon={Flame} />
        <StatCard label="Burned This Week" value="2,840" icon={TrendingUp} trend="+12%" trendUp />
        <StatCard label="Consistency" value="87%" icon={Target} trend="+4%" trendUp />
        <StatCard label="Heart Rate" value="68 bpm" icon={Heart} />
      </motion.div>

      {/* AI Alerts + Coach Tip */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-display font-semibold text-foreground">AI Health Alert</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your recovery score dropped 8% this week. Consider reducing workout intensity and prioritizing sleep.
          </p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">AI Coach Tip</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Great consistency this week! Try adding 5 min of mobility work before your sessions to improve performance.
          </p>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Weight Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,20%,18%,0.5)" />
              <XAxis dataKey="week" stroke="#9AA4B2" fontSize={12} />
              <YAxis stroke="#9AA4B2" fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 40% 10%)",
                  border: "1px solid hsla(0,0%,100%,0.1)",
                  borderRadius: "12px",
                  color: "#F9FAFB",
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#60A5FA" strokeWidth={2} dot={{ fill: "#60A5FA", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Activity Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,20%,18%,0.5)" />
              <XAxis dataKey="day" stroke="#9AA4B2" fontSize={12} />
              <YAxis stroke="#9AA4B2" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 40% 10%)",
                  border: "1px solid hsla(0,0%,100%,0.1)",
                  borderRadius: "12px",
                  color: "#F9FAFB",
                }}
              />
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="calories" stroke="#8B5CF6" strokeWidth={2} fill="url(#colorCal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Today's Workout Preview */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Today's Workout</h3>
          <span className="text-xs text-muted-foreground">Upper Body • 45 min</span>
        </div>
        <div className="space-y-3">
          {[
            { name: "Push-ups (Modified)", sets: "3×12", safe: true },
            { name: "Resistance Band Rows", sets: "3×15", safe: true },
            { name: "Shoulder Press (Light)", sets: "3×10", safe: true },
            { name: "Plank Hold", sets: "3×30s", safe: true },
          ].map((ex) => (
            <div key={ex.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{ex.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{ex.sets}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity flex-1">
            Start Workout
          </Button>
          <Button variant="outline" className="rounded-xl border-border text-foreground hover:bg-muted flex-1">
            <ClipboardCheck className="w-4 h-4 mr-2" /> Submit Follow-Up
          </Button>
        </div>
      </motion.div>

      {/* Payment History */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Payment History</h3>
        <div className="space-y-3">
          {[
            { date: "Mar 1, 2026", amount: "$5.00", status: "Paid" },
            { date: "Feb 1, 2026", amount: "$5.00", status: "Paid" },
            { date: "Jan 1, 2026", amount: "$5.00", status: "Paid" },
          ].map((p) => (
            <div key={p.date} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <span className="text-sm text-foreground">{p.date}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">{p.amount}</span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-success/10 text-success">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
