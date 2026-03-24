import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
        <CreditCard className="w-6 h-6 text-primary" /> Subscription
      </h1>
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Premium plan: $5/month. Manage your subscription and payment method.</p>
      </div>
    </motion.div>
  );
}
