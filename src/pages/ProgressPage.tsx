import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-primary" /> Progress
      </h1>
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Track your weight, performance, and body progress over time.</p>
      </div>
    </motion.div>
  );
}
