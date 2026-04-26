import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

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
