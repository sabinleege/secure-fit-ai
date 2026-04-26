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

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar pt-6">
        {/* Logo */}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto px-2 pb-4">
          <SidebarMenu>
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
