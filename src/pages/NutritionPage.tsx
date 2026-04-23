import { motion } from "framer-motion";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Apple,
  Camera,
  Plus,
  Minus,
  Droplets,
  Flame,
  Beef,
  Wheat,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Utensils,
  Coffee,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/contexts/AppDataContext";
import { FileUploadButton } from "@/components/FileUploadButton";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const aiSuggestions = [
  { text: "Add a lean protein source to dinner to meet your daily goal of 130g.", type: "improve" as const },
  { text: "Great job hitting your fiber target today! Keep including whole grains.", type: "positive" as const },
  { text: "Consider reducing sodium intake — your blood pressure profile suggests caution.", type: "caution" as const },
];

interface MacroData {
  current: number;
  target: number;
  label: string;
  icon: React.ElementType;
  color: string;
}

function MacroRing({ macro }: { macro: MacroData }) {
  const pct = Math.min(100, Math.round((macro.current / macro.target) * 100));
  const Icon = macro.icon;
  return (
    <div className="text-center">
      <div className="relative w-14 h-14 mx-auto mb-1">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${pct} ${100 - pct}`}
            className={macro.color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-3.5 h-3.5 ${macro.color}`} />
        </div>
      </div>
      <p className="text-xs font-bold text-foreground font-display">{macro.current}</p>
      <p className="text-[9px] text-muted-foreground">/ {macro.target} {macro.label === "Calories" ? "kcal" : "g"}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{macro.label}</p>
    </div>
  );
}

export default function NutritionPage() {
  const [mealNote, setMealNote] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const { data, addWaterGlass, removeWaterGlass, addMealEntry, removeMealEntry, todayKey } = useAppData();

  const todayMeals = data.loggedMeals[todayKey] ?? [];

  const analyzeMeal = async () => {
    if (!mealNote.trim()) { toast.error("Describe the meal first"); return; }
    setAnalyzing(true);
    setAnalysis("");
    try {
      const { data: res, error } = await supabase.functions.invoke("ai-analyze", {
        body: {
          kind: "nutrition",
          payload: { meal: mealNote },
          context: { weight: data.weight, height: data.height, bodyFat: data.bodyFat, dailyCaloriesTarget: data.dailyCaloriesTarget },
        },
      });
      if (error) throw error;
      if ((res as any)?.error) { toast.error((res as any).error); return; }
      setAnalysis((res as any)?.text || "No response");
    } catch (e) {
      toast.error("AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const totalCals = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = todayMeals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs = todayMeals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFat = todayMeals.reduce((s, m) => s + (m.fat || 0), 0);

  const macros: MacroData[] = [
    { current: totalCals, target: data.dailyCaloriesTarget, label: "Calories", icon: Flame, color: "text-warning" },
    { current: totalProtein, target: 130, label: "Protein", icon: Beef, color: "text-primary" },
    { current: totalCarbs, target: 250, label: "Carbs", icon: Wheat, color: "text-secondary" },
    { current: totalFat, target: 70, label: "Fat", icon: Droplets, color: "text-success" },
  ];

  const totalCurrent = macros[0].current;
  const totalTarget = macros[0].target;
  const dailyPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  const slotConfig: Array<{ time: "Breakfast" | "Lunch" | "Snack" | "Dinner"; icon: React.ElementType }> = [
    { time: "Breakfast", icon: Coffee },
    { time: "Lunch", icon: Sun },
    { time: "Snack", icon: Apple },
    { time: "Dinner", icon: Moon },
  ];
  const meals = slotConfig.map((s) => ({
    time: s.time,
    icon: s.icon,
    items: todayMeals.filter((m) => m.slot === s.time),
  }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Apple className="w-5 h-5 text-primary" /> Nutrition
        </h1>
        <p className="text-muted-foreground text-xs mt-1">{dayName}, {dateStr} — AI-powered meal tracking</p>
      </motion.div>

      {/* Macros */}
      <motion.div variants={item} className="glass-card p-4">
        <h3 className="font-display font-semibold text-foreground text-xs mb-3">Today's Macros</h3>
        <div className="grid grid-cols-4 gap-1">
          {macros.map((m) => (
            <MacroRing key={m.label} macro={m} />
          ))}
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Daily Progress</span>
            <span>{dailyPct}%</span>
          </div>
          <Progress value={dailyPct} className="h-1.5" />
        </div>
      </motion.div>

      {/* Water Intake - FUNCTIONAL */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground text-xs flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" /> Water Intake
          </h3>
          <span className="text-[11px] text-muted-foreground">{data.waterGlasses} / {data.waterTarget} glasses</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: data.waterTarget }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-7 rounded-lg transition-all duration-250 cursor-pointer ${
                i < data.waterGlasses
                  ? "bg-primary/30 border border-primary/40"
                  : "bg-muted/30 border border-border/30 hover:border-primary/20"
              }`}
              onClick={() => {
                if (i >= data.waterGlasses) addWaterGlass();
              }}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="rounded-xl border-border text-foreground text-xs" onClick={addWaterGlass}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-border text-foreground text-xs" onClick={removeWaterGlass} disabled={data.waterGlasses === 0}>
            <Minus className="w-3 h-3 mr-1" /> Remove
          </Button>
        </div>
      </motion.div>

      {/* Meals */}
      <motion.div variants={item}>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="glass-card w-full grid grid-cols-2 mb-3">
            <TabsTrigger value="today" className="rounded-xl text-xs">Today</TabsTrigger>
            <TabsTrigger value="log" className="rounded-xl text-xs">Log Meal</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-2">
            {meals.map((meal) => {
              const Icon = meal.icon;
              const totalCal = meal.items.reduce((sum, i) => sum + i.calories, 0);
              return (
                <div key={meal.time} className="glass-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <h4 className="font-display font-semibold text-foreground text-xs">{meal.time}</h4>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{totalCal > 0 ? `${totalCal} kcal` : "Not logged"}</span>
                  </div>
                  {meal.items.length > 0 ? (
                    <div className="space-y-1">
                      {meal.items.map((food) => (
                        <div key={food.name} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                          <span className="text-xs text-foreground">{food.name}</span>
                          <span className="text-[10px] text-muted-foreground">{food.calories} cal</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed border-border text-muted-foreground text-xs">
                      <Plus className="w-3 h-3 mr-1" /> Add {meal.time}
                    </Button>
                  )}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="log" className="space-y-3">
            <div className="glass-card p-4">
              <h3 className="font-display font-semibold text-foreground text-xs mb-3">Log a Meal</h3>
              <Textarea
                placeholder="Describe what you ate..."
                value={mealNote}
                onChange={(e) => setMealNote(e.target.value)}
                className="bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground text-xs"
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={analyzeMeal} disabled={analyzing} className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity flex-1 text-xs">
                  {analyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  {analyzing ? "Analyzing…" : "Analyze"}
                </Button>
                <FileUploadButton icon={Camera} label="Photo" accept="image/*" className="text-xs" />
              </div>
              {analysis && (
                <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary">AI Analysis</span>
                  </div>
                  <div className="prose prose-xs max-w-none text-xs [&_*]:text-foreground prose-p:my-1 prose-ul:my-1">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* AI Tips */}
      <motion.div variants={item} className="glass-card p-4">
        <h3 className="font-display font-semibold text-foreground text-xs flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-secondary" /> AI Nutrition Tips
        </h3>
        <div className="space-y-2">
          {aiSuggestions.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/20 last:border-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                tip.type === "positive" ? "bg-success/10" : tip.type === "caution" ? "bg-warning/10" : "bg-primary/10"
              }`}>
                {tip.type === "positive" ? (
                  <TrendingUp className="w-2.5 h-2.5 text-success" />
                ) : tip.type === "caution" ? (
                  <TrendingDown className="w-2.5 h-2.5 text-warning" />
                ) : (
                  <Utensils className="w-2.5 h-2.5 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
