import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

/**
 * Wrap protected routes. If the user has not completed onboarding,
 * force them to /onboarding. The /onboarding route itself should NOT
 * use this gate (it would loop).
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "needs-onboarding">("loading");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setState("ok"); return; } // AuthGuard will redirect
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setState(data?.onboarding_completed ? "ok" : "needs-onboarding");
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
          <Activity className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    );
  }

  if (state === "needs-onboarding") return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
