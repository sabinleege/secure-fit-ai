import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  progress?: number; // 0-100, draws ring
  accent?: "primary" | "accent";
}

export function StatCard({
  label,
  value,
  suffix = "",
  decimals = 0,
  icon: Icon,
  trend,
  trendUp,
  progress,
  accent = "primary",
}: StatCardProps) {
  const numeric = typeof value === "number" ? value : Number(value);
  const animated = useAnimatedCounter(Number.isFinite(numeric) ? numeric : 0);
  const display = typeof value === "number"
    ? animated.toFixed(decimals)
    : value;

  const ringColor = accent === "accent" ? "hsl(var(--accent))" : "hsl(var(--primary))";
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, progress ?? 0));
  const dash = (pct / 100) * c;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="glass-card p-4 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3">
        {progress !== undefined ? (
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 56 56" className="w-12 h-12 -rotate-90">
              <circle cx="28" cy="28" r={r} stroke="hsl(var(--muted))" strokeWidth="4" fill="none" />
              <motion.circle
                cx="28" cy="28" r={r}
                stroke={ringColor}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={c}
                initial={{ strokeDashoffset: c }}
                animate={{ strokeDashoffset: c - dash }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <Icon className="absolute inset-0 m-auto w-4 h-4 text-foreground" />
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${accent === "accent" ? "bg-accent/15" : "bg-primary/15"}`}>
            <Icon className={`w-5 h-5 ${accent === "accent" ? "text-accent" : "text-primary"}`} />
          </div>
        )}
        {trend && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${trendUp ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-foreground tracking-tight">
        {display}
        {suffix && <span className="text-sm text-muted-foreground ml-1 font-medium">{suffix}</span>}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}
