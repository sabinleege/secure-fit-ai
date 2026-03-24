import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export default function WorkoutPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
        <Dumbbell className="w-6 h-6 text-primary" /> Workout Plan
      </h1>
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Complete your health profile to generate a personalized, injury-safe workout plan.</p>
      </div>
    </motion.div>
  );
}
