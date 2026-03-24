import { motion } from "framer-motion";
import {
  TrendingUp,
  Scale,
  Flame,
  Target,
  Zap,
  Activity,
  Camera,
  ArrowUp,
  ArrowDown,
  Minus,
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
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const weightHistory = [
  { week: "W1", weight: 85 },
  { week: "W2", weight: 84.2 },
  { week: "W3", weight: 83.5 },
  { week: "W4", weight: 83.1 },
  { week: "W5", weight: 82.4 },
  { week: "W6", weight: 81.8 },
  { week: "W7", weight: 81.3 },
  { week: "W8", weight: 80.9 },
];

const caloriesBurned = [
  { week: "W1", calories: 1800 },
  { week: "W2", calories: 2100 },
  { week: "W3", calories: 1950 },
  { week: "W4", calories: 2400 },
  { week: "W5", calories: 2200 },
  { week: "W6", calories: 2600 },
  { week: "W7", calories: 2550 },
  { week: "W8", calories: 2840 },
];

const performanceData = [
  { exercise: "Push-ups", week1: 10, week4: 18, week8: 25 },
  { exercise: "Squats", week1: 12, week4: 20, week8: 30 },
  { exercise: "Plank (sec)", week1: 20, week4: 35, week8: 55 },
  { exercise: "Band Rows", week1: 8, week4: 15, week8: 20 },
];

const consistencyData = [
  { week: "W1", pct: 60 },
  { week: "W2", pct: 72 },
  { week: "W3", pct: 65 },
  { week: "W4", pct: 80 },
  { week: "W5", pct: 78 },
  { week: "W6", pct: 85 },
  { week: "W7", pct: 88 },
  { week: "W8", pct: 87 },
];

const chartTooltipStyle = {
  background: "hsl(222 40% 10%)",
  border: "1px solid hsla(0,0%,100%,0.1)",
  borderRadius: "12px",
  color: "#F9FAFB",
};

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <ArrowUp className="w-3 h-3 text-success" />;
  if (value < 0) return <ArrowDown className="w-3 h-3 text-destructive" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

export default function ProgressPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" /> Progress
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Track your transformation over time</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Weight Lost" value="4.1 kg" icon={Scale} trend="-0.4 this week" trendUp />
        <StatCard label="Total Burned" value="18,440" icon={Flame} trend="+12%" trendUp />
        <StatCard label="Avg Consistency" value="87%" icon={Target} trend="+4%" trendUp />
        <StatCard label="Fitness Score" value="72 → 85" icon={Zap} trend="+13" trendUp glowColor="secondary" />
      </motion.div>

      {/* Weight Chart */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Weight Progress</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weightHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,20%,18%,0.5)" />
            <XAxis dataKey="week" stroke="#9AA4B2" fontSize={12} />
            <YAxis stroke="#9AA4B2" fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="weight" stroke="hsl(213 94% 68%)" strokeWidth={2} dot={{ fill: "hsl(213 94% 68%)", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Calories Burned & Consistency */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Calories Burned Weekly</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={caloriesBurned}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,20%,18%,0.5)" />
              <XAxis dataKey="week" stroke="#9AA4B2" fontSize={12} />
              <YAxis stroke="#9AA4B2" fontSize={12} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="calories" fill="hsl(258 90% 66%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Workout Consistency</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={consistencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,20%,18%,0.5)" />
              <XAxis dataKey="week" stroke="#9AA4B2" fontSize={12} />
              <YAxis stroke="#9AA4B2" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <defs>
                <linearGradient id="gradConsistency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="pct" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="url(#gradConsistency)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Performance Improvements */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Performance Improvements</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 text-muted-foreground font-medium">Exercise</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Week 1</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Week 4</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Week 8</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((row) => {
                const change = row.week8 - row.week1;
                const pctChange = Math.round((change / row.week1) * 100);
                return (
                  <tr key={row.exercise} className="border-b border-border/20 last:border-0">
                    <td className="py-3 text-foreground font-medium">{row.exercise}</td>
                    <td className="py-3 text-center text-muted-foreground">{row.week1}</td>
                    <td className="py-3 text-center text-muted-foreground">{row.week4}</td>
                    <td className="py-3 text-center text-foreground font-semibold">{row.week8}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                        <TrendIcon value={change} /> +{pctChange}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Body Progress */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Body Progress Photos</h3>
          <Button variant="outline" size="sm" className="rounded-xl border-border text-foreground">
            <Camera className="w-4 h-4 mr-2" /> Upload Photo
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Week 1", "Week 4", "Week 8"].map((label) => (
            <div key={label} className="aspect-[3/4] rounded-xl bg-muted/30 border border-border/30 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
