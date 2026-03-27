import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  glowColor?: "primary" | "secondary";
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, glowColor = "primary" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`glass-card-hover p-3 ${glowColor === "secondary" ? "glow-secondary" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-primary">
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
        {trend && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${trendUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="font-display text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}
