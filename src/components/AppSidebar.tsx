import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  ClipboardCheck,
  TrendingUp,
  User,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  Bell,
  AlertTriangle,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/contexts/AppDataContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Workout Plan", url: "/workout", icon: Dumbbell },
  { title: "Nutrition", url: "/nutrition", icon: Apple },
  { title: "Follow-Up & Analysis", url: "/followup", icon: ClipboardCheck },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Subscription", url: "/subscription", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

const typeIcons = {
  alert: AlertTriangle,
  tip: Sparkles,
  reminder: Clock,
  success: CheckCircle2,
};

const typeColors = {
  alert: "text-warning bg-warning/10",
  tip: "text-primary bg-primary/10",
  reminder: "text-secondary bg-secondary/10",
  success: "text-success bg-success/10",
};

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { data, markNotificationRead, clearNotifications, unreadCount } = useAppData();

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar pt-6">
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-foreground tracking-tight">
              Fit Buddy AI
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {navItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        onClick={handleNavClick}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-250 ${
                          isActive
                            ? "glass-card text-primary glow-primary"
                            : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Notifications */}
              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-250 relative">
                      <Bell className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>Notifications</span>}
                      {unreadCount > 0 && (
                        <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <SheetContent className="bg-background border-border w-[340px] sm:w-[400px]">
                    <SheetHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <SheetTitle className="font-display text-foreground">Notifications</SheetTitle>
                        {unreadCount > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearNotifications} className="text-xs text-muted-foreground">
                            Mark all read
                          </Button>
                        )}
                      </div>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-120px)]">
                      <div className="space-y-2 pr-2">
                        {data.notifications.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
                        ) : (
                          data.notifications.map((n) => {
                            const Icon = typeIcons[n.type];
                            const colorClass = typeColors[n.type];
                            return (
                              <button
                                key={n.id}
                                onClick={() => markNotificationRead(n.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all duration-250 ${
                                  n.read ? "opacity-60" : "glass-card"
                                } hover:bg-muted/30`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto px-2 pb-4">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!collapsed && <span>Log out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
