import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";
import { NotificationPanel } from "@/components/NotificationPanel";
import { AICoachChat } from "@/components/AICoachChat";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <header className="h-14 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <NotificationPanel />
          </header>
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
        <AICoachChat />
      </div>
    </SidebarProvider>
  );
}
