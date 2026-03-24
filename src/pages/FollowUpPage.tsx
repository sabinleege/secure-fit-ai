import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";

export default function FollowUpPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
        <ClipboardCheck className="w-6 h-6 text-primary" /> Follow-Up & Analysis
      </h1>
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Submit follow-up reports after workouts for AI analysis and adaptive coaching.</p>
      </div>
    </motion.div>
  );
}
