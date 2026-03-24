import { motion } from "framer-motion";
import { useState } from "react";
import {
  Apple,
  Camera,
  Plus,
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const macros = {
  calories: { current: 1650, target: 2150, label: "Calories", icon: Flame, color: "text-warning" },
  protein: { current: 95, target: 130, label: "Protein", icon: Beef, color: "text-primary" },
  carbs: { current: 180, target: 250, label: "Carbs", icon: Wheat, color: "text-secondary" },
  fat: { current: 52, target: 70, label: "Fat", icon: Droplets, color: "text-success" },
};

const meals = [
  {
    time: "Breakfast",
    icon: Coffee,
    items: [
      { name: "Oatmeal with Berries", calories: 320, protein: 12, carbs: 52, fat: 8 },
      { name: "Greek Yogurt", calories: 150, protein: 15, carbs: 12, fat: 5 },
    ],
  },
  {
    time: "Lunch",
    icon: Sun,
    items: [
      { name: "Grilled Chicken Salad", calories: 420, protein: 35, carbs: 25, fat: 18 },
      { name: "Whole Wheat Bread", calories: 130, protein: 5, carbs: 24, fat: 2 },
    ],
  },
  {
    time: "Snack",
    icon: Apple,
    items: [
      { name: "Almonds (30g)", calories: 170, protein: 6, carbs: 6, fat: 15 },
      { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0 },
    ],
  },
  {
    time: "Dinner",
    icon: Moon,
    items: [],
  },
];

const aiSuggestions = [
  { text: "Add a lean protein source to dinner to meet your daily goal of 130g.", type: "improve" as const },
  { text: "Great job hitting your fiber target today! Keep including whole grains.", type: "positive" as const },
  { text: "Consider reducing sodium intake — your blood pressure profile suggests caution.", type: "caution" as const },
];

function MacroRing({ macro }: { macro: typeof macros.calories }) {
  const pct = Math.min(100, Math.round((macro.current / macro.target) * 100));
  const Icon = macro.icon;
  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsla(var(--glass-border))" strokeWidth="2" />
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
          <Icon className={`w-4 h-4 ${macro.color}`} />
        </div>
      </div>
      <p className="text-sm font-bold text-foreground font-display">{macro.current}</p>
      <p className="text-[10px] text-muted-foreground">/ {macro.target} {macro.label === "Calories" ? "kcal" : "g"}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{macro.label}</p>
    </div>
  );
}

export default function NutritionPage() {
  const [mealNote, setMealNote] = useState("");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <Apple className="w-6 h-6 text-primary" /> Nutrition
        </h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered meal tracking & diet guidance</p>
      </motion.div>

      {/* Macros Overview */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground text-sm mb-4">Today's Macros</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.values(macros).map((m) => (
            <MacroRing key={m.label} macro={m} />
          ))}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Daily Progress</span>
            <span>77%</span>
          </div>
          <Progress value={77} className="h-2" />
        </div>
      </motion.div>

      {/* Water Intake */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" /> Water Intake
          </h3>
          <span className="text-xs text-muted-foreground">5 / 8 glasses</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-8 rounded-lg transition-colors ${
                i < 5 ? "bg-primary/30 border border-primary/40" : "bg-muted/30 border border-border/30"
              }`}
            />
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3 rounded-xl border-border text-foreground">
          <Plus className="w-3 h-3 mr-1" /> Add Glass
        </Button>
      </motion.div>

      {/* Meals */}
      <motion.div variants={item}>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="glass-card w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="today" className="rounded-xl">Today</TabsTrigger>
            <TabsTrigger value="log" className="rounded-xl">Log Meal</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-3">
            {meals.map((meal) => {
              const Icon = meal.icon;
              const totalCal = meal.items.reduce((sum, i) => sum + i.calories, 0);
              return (
                <div key={meal.time} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <h4 className="font-display font-semibold text-foreground text-sm">{meal.time}</h4>
                    </div>
                    <span className="text-xs text-muted-foreground">{totalCal > 0 ? `${totalCal} kcal` : "Not logged"}</span>
                  </div>
                  {meal.items.length > 0 ? (
                    <div className="space-y-2">
                      {meal.items.map((food) => (
                        <div key={food.name} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                          <span className="text-sm text-foreground">{food.name}</span>
                          <div className="flex gap-3 text-[11px] text-muted-foreground">
                            <span>{food.calories} cal</span>
                            <span className="hidden sm:inline">{food.protein}g P</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed border-border text-muted-foreground">
                      <Plus className="w-3 h-3 mr-1" /> Add {meal.time}
                    </Button>
                  )}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="log" className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-foreground text-sm mb-3">Log a Meal</h3>
              <Textarea
                placeholder="Describe what you ate (e.g., 'grilled salmon with rice and vegetables')..."
                value={mealNote}
                onChange={(e) => setMealNote(e.target.value)}
                className="bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground"
                rows={3}
              />
              <div className="flex gap-3 mt-4">
                <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity flex-1">
                  <Sparkles className="w-4 h-4 mr-2" /> Analyze with AI
                </Button>
                <Button variant="outline" className="rounded-xl border-border text-foreground">
                  <Camera className="w-4 h-4 mr-2" /> Photo
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* AI Suggestions */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-secondary" /> AI Nutrition Tips
        </h3>
        <div className="space-y-3">
          {aiSuggestions.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                tip.type === "positive" ? "bg-success/10" : tip.type === "caution" ? "bg-warning/10" : "bg-primary/10"
              }`}>
                {tip.type === "positive" ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : tip.type === "caution" ? (
                  <TrendingDown className="w-3 h-3 text-warning" />
                ) : (
                  <Utensils className="w-3 h-3 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
