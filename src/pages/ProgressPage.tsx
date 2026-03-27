import { motion } from "framer-motion";
import { useState, useRef } from "react";
import {
  TrendingUp,
  Scale,
  Flame,
  Target,
  Zap,
  Camera,
  ArrowUp,
  ArrowDown,
  Minus,
  X,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/contexts/AppDataContext";
import { toast } from "sonner";
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

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  color: "hsl(var(--foreground))",
};

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <ArrowUp className="w-3 h-3 text-success" />;
  if (value < 0) return <ArrowDown className="w-3 h-3 text-destructive" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

export default function ProgressPage() {
  const { data } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<{ label: string; url: string | null }[]>([
    { label: "Week 1", url: null },
    { label: "Week 4", url: null },
    { label: "Week 8", url: null },
  ]);

  const handlePhotoUpload = (index: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, url } : p)));
        toast.success(`Photo uploaded for ${photos[index].label}`);
      }
    };
    input.click();
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-7xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Progress
        </h1>
        <p className="text-muted-foreground text-xs mt-1">Track your transformation over time</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <StatCard label="Weight Lost" value="4.1 kg" icon={Scale} trend="-0.4" trendUp />
        <StatCard label="Total Burned" value="18,440" icon={Flame} trend="+12%" trendUp />
        <StatCard label="Consistency" value={`${data.consistencyScore}%`} icon={Target} trend="+4%" trendUp />
        <StatCard label="Fitness" value={`${data.fitnessScore}`} icon={Zap} trend="+13" trendUp glowColor="secondary" />
      </motion.div>

      {/* Weight Chart - reactive */}
      <motion.div variants={item} className="glass-card p-4">
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
      </motion.div>

      {/* Calories + Consistency */}
      <motion.div variants={item} className="space-y-3">
        <div className="glass-card p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Calories Burned Weekly</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={caloriesBurned}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="calories" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Consistency</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={consistencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="gradConsistency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="pct" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#gradConsistency)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Performance */}
      <motion.div variants={item} className="glass-card p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-3">Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 text-muted-foreground font-medium">Exercise</th>
                <th className="text-center py-2 text-muted-foreground font-medium">W1</th>
                <th className="text-center py-2 text-muted-foreground font-medium">W4</th>
                <th className="text-center py-2 text-muted-foreground font-medium">W8</th>
                <th className="text-center py-2 text-muted-foreground font-medium">+%</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((row) => {
                const change = row.week8 - row.week1;
                const pct = Math.round((change / row.week1) * 100);
                return (
                  <tr key={row.exercise} className="border-b border-border/20 last:border-0">
                    <td className="py-2 text-foreground font-medium">{row.exercise}</td>
                    <td className="py-2 text-center text-muted-foreground">{row.week1}</td>
                    <td className="py-2 text-center text-muted-foreground">{row.week4}</td>
                    <td className="py-2 text-center text-foreground font-semibold">{row.week8}</td>
                    <td className="py-2 text-center">
                      <span className="inline-flex items-center gap-0.5 text-success text-[11px] font-medium">
                        <TrendIcon value={change} /> +{pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Body Progress Photos - with upload */}
      <motion.div variants={item} className="glass-card p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-3">Body Progress Photos</h3>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.label}
              onClick={() => handlePhotoUpload(i)}
              className="aspect-[3/4] rounded-xl bg-muted/30 border border-border/30 flex items-center justify-center overflow-hidden hover:border-primary/30 transition-colors relative"
            >
              {photo.url ? (
                <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">{photo.label}</p>
                </div>
              )}
              {photo.url && (
                <span className="absolute bottom-1 left-1 right-1 text-center text-[9px] bg-background/80 rounded-md py-0.5 text-foreground">{photo.label}</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
