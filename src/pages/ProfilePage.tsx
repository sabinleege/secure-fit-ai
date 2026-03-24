import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
        <User className="w-6 h-6 text-primary" /> Profile
      </h1>
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Set up your health profile, medical data, and fitness goals here.</p>
      </div>
    </motion.div>
  );
}
