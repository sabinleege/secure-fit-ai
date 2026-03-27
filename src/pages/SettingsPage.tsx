import { motion } from "framer-motion";
import { Settings, Sun, Moon, Bell, Shield, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your app experience</p>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          {theme === "dark" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
          Appearance
        </h3>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-muted-foreground" />
            <div>
              <Label className="text-foreground text-sm">Light Mode</Label>
              <p className="text-xs text-muted-foreground">Switch to light theme</p>
            </div>
          </div>
          <Switch
            checked={theme === "light"}
            onCheckedChange={toggleTheme}
          />
        </div>
        <div className="flex items-center justify-between py-3 border-t border-border/30">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <div>
              <Label className="text-foreground text-sm">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Switch to dark theme</p>
            </div>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
          />
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Notifications
        </h3>
        <div className="space-y-3">
          {[
            { label: "Workout Reminders", desc: "Get reminded about daily workouts" },
            { label: "Health Alerts", desc: "Receive AI health risk warnings" },
            { label: "Progress Updates", desc: "Weekly progress summaries" },
            { label: "Hydration Reminders", desc: "Water intake reminders" },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <Label className="text-foreground text-sm">{setting.label}</Label>
                <p className="text-xs text-muted-foreground">{setting.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Privacy & Data
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <div>
              <Label className="text-foreground text-sm">Share Anonymous Analytics</Label>
              <p className="text-xs text-muted-foreground">Help improve the AI models</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-foreground text-sm">Store Medical Data Locally</Label>
              <p className="text-xs text-muted-foreground">Keep sensitive data on device</p>
            </div>
            <Switch />
          </div>
        </div>
      </motion.div>

      {/* Language */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> Language
        </h3>
        <p className="text-sm text-muted-foreground">English (US)</p>
      </motion.div>
    </motion.div>
  );
}
