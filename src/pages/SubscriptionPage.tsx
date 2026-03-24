import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  Shield,
  Sparkles,
  Zap,
  Star,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const features = [
  "Full AI health & fitness coaching",
  "Personalized injury-safe workouts",
  "AI nutrition analysis & meal planning",
  "Video movement analysis",
  "Weekly adaptive plan adjustments",
  "Medical data-driven recommendations",
  "Unlimited follow-up reports",
  "Body progress tracking",
];

const paymentHistory = [
  { date: "Mar 1, 2026", amount: "$5.00", status: "Paid", method: "MTN MoMo" },
  { date: "Feb 1, 2026", amount: "$5.00", status: "Paid", method: "MTN MoMo" },
  { date: "Jan 1, 2026", amount: "$5.00", status: "Paid", method: "MTN MoMo" },
  { date: "Dec 1, 2025", amount: "$5.00", status: "Paid", method: "MTN MoMo" },
  { date: "Nov 1, 2025", amount: "$5.00", status: "Paid", method: "MTN MoMo" },
];

export default function SubscriptionPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary" /> Subscription
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your premium plan and payments</p>
      </motion.div>

      {/* Current Plan */}
      <motion.div variants={item} className="glass-card p-6 glow-primary">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-lg font-bold text-foreground">Premium Plan</h3>
              <Badge className="gradient-primary text-primary-foreground text-[10px]">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Full access to all AI coaching features</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-bold text-foreground">$5</p>
            <p className="text-xs text-muted-foreground">/month</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 py-1">
              <Check className="w-4 h-4 text-success shrink-0" />
              <span className="text-sm text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Next billing: April 1, 2026</span>
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground text-sm mb-4">Payment Method</h3>
        <div className="p-4 rounded-xl bg-muted/20 border border-border/30 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">MTN Mobile Money</p>
              <p className="text-xs text-muted-foreground">+237 ••• ••• 456</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] border-success/40 text-success">Default</Badge>
        </div>

        <div className="space-y-3">
          <Label className="text-sm text-foreground">Submit Transaction ID</Label>
          <div className="flex gap-3">
            <Input
              placeholder="Enter MoMo transaction ID..."
              className="bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground flex-1"
            />
            <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
              Verify
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Pay $5 to MTN MoMo number: <span className="text-foreground font-medium">+237 6XX XXX XXX</span>, then paste the transaction ID above.
          </p>
        </div>
      </motion.div>

      {/* Payment History */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground text-sm mb-4">Payment History</h3>
        <div className="space-y-2">
          {paymentHistory.map((p) => (
            <div key={p.date} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
              <div>
                <p className="text-sm text-foreground">{p.date}</p>
                <p className="text-xs text-muted-foreground">{p.method}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{p.amount}</span>
                <Badge variant="outline" className="text-[10px] border-success/40 text-success">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> {p.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cancel */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground">Cancel Subscription</p>
            <p className="text-xs text-muted-foreground mt-1">
              You can cancel anytime. Your access will continue until the end of the current billing period.
            </p>
            <Button variant="outline" size="sm" className="mt-3 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10">
              Cancel Plan
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
