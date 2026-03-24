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
      className={`glass-card-hover p-5 ${glowColor === "secondary" ? "glow-secondary" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-primary">
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${trendUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-label mt-1">{label}</p>
    </motion.div>
  );
}
