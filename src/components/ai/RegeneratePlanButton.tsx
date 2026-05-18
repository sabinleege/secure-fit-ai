import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const REASONS = [
  "Injury improved",
  "New goal",
  "Plan is too easy",
  "Plan is too hard",
  "Schedule changed",
  "Other",
];

export function RegeneratePlanButton({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout-plan", {
        body: { force: true, regen_reason: reason },
      });
      if (error) throw error;
      toast.success("Your new plan is ready!");
      setOpen(false);
      onDone?.();
    } catch (e: any) {
      toast.error(e?.message || "Could not regenerate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" /> Regenerate plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate workout plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Why are you regenerating?</Label>
          <RadioGroup value={reason} onValueChange={setReason} className="grid gap-2">
            {REASONS.map((r) => (
              <Label key={r} className="flex items-center gap-2 border border-border rounded-md p-2 cursor-pointer">
                <RadioGroupItem value={r} /> <span className="text-sm">{r}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button onClick={run} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : "Generate new plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
