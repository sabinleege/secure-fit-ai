import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";
import { AICoachChat } from "@/components/AICoachChat";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0 relative">
          {/* Floating menu trigger — stays in same top-left spot on every page */}
          <SidebarTrigger
            className="fixed top-4 left-4 z-40 h-11 w-11 rounded-full glass-card text-foreground hover:text-primary shadow-lg backdrop-blur-xl flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </SidebarTrigger>

          <main className="flex-1 overflow-auto p-4 pt-20">
            {children}
          </main>
        </div>
        <AICoachChat />
      </div>
    </SidebarProvider>
  );
}
