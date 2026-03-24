import { motion } from "framer-motion";
import { Apple } from "lucide-react";

export default function NutritionPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
        <Apple className="w-6 h-6 text-primary" /> Nutrition
      </h1>
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Upload meals or log food to get AI-powered nutrition advice tailored to your goals.</p>
      </div>
    </motion.div>
  );
}
