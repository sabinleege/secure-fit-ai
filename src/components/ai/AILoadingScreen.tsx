import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const MESSAGES = [
  "Analyzing your injuries…",
  "Building safe progressions…",
  "Matching exercises to your equipment…",
  "Calibrating intensity for your level…",
  "Personalizing nutrition guidance…",
  "Finalizing your weekly plan…",
];

export function AILoadingScreen({ label = "Generating your personalized plan" }: { label?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-5"
      >
        <Activity className="w-7 h-7 text-primary-foreground" />
      </motion.div>
      <h3 className="font-display text-xl font-semibold">{label}</h3>
      <div className="h-6 mt-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            {MESSAGES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5 mt-5">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
