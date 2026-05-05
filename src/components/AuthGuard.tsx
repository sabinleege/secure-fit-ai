import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

// Auto sign-out after this many ms of inactivity (15 min)
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Inactivity-based auto sign-out
  useEffect(() => {
    if (!authed) return;

    const resetTimer = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        supabase.auth.signOut();
      }, IDLE_TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [authed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
          <Activity className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    );
  }

  if (!authed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
