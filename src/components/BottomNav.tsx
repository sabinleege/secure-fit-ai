import { LayoutDashboard, Dumbbell, Apple, TrendingUp, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/nutrition", label: "Meals", icon: Apple },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1">
      <div className="glass-card flex items-center justify-around py-2 px-2">
        {items.map((it) => {
          const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/"}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{it.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
