import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu, Activity } from "lucide-react";
import { NotificationPanel } from "@/components/NotificationPanel";
import { AICoachChat } from "@/components/AICoachChat";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { useAppData } from "@/contexts/AppDataContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

function UserChip() {
  const { data } = useAppData();
  const name = data.profile.fullName?.trim() || "Athlete";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full glass-card">
      <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
        {initials || "A"}
      </div>
      <span className="text-xs font-medium text-foreground max-w-[120px] truncate">{name}</span>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 border-b border-border/50 backdrop-blur-xl bg-background/70">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground rounded-full">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-2 md:hidden">
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-sm">Secure Fit</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <UserChip />
              <ThemeToggle />
              <NotificationPanel />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 pb-24 md:pb-4">
            {children}
          </main>
          <BottomNav />
        </div>
        <AICoachChat />
      </div>
    </SidebarProvider>
  );
}
