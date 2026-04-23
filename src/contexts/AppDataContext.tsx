import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

interface WeightEntry {
  week: string;
  weight: number;
}

interface ActivityEntry {
  day: string;
  calories: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "alert" | "tip" | "reminder" | "success";
}

export interface PlanExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  safetyNote?: string;
  isRehab?: boolean;
}

export interface PlanDay {
  day: string;
  focus: string;
  duration: string;
  calories: string;
  exercises: PlanExercise[];
}

export interface WorkoutPlan {
  summary: string;
  safetyNote: string;
  days: PlanDay[];
  generatedAt: string;
  basedOn: { weight: number; injuries: string; profession: string; recoveryScore: number };
}

export interface Injury {
  area: string;
  severity: "Mild" | "Moderate" | "Severe";
  notes: string;
}

export interface UserProfile {
  fullName: string;
  age: number;
  height: number;
  weight: number;
  profession: string;
  activityLevel: string;
  chronicDiseases: string;
  pastSurgeries: string;
  medications: string;
  painAreas: string;
  injuries: Injury[];
  targetWeight: number;
  timeline: string;
  goalDescription: string;
}

export type MealSlot = "Breakfast" | "Lunch" | "Snack" | "Dinner";

export interface MealItem {
  id: string;
  slot: MealSlot;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  source: "manual" | "ai";
  loggedAt: string;
}

interface AppData {
  weight: number;
  height: number;
  age: number;
  bodyFat: number;
  fitnessScore: number;
  recoveryScore: number;
  consistencyScore: number;
  heartRate: number;
  dailyCaloriesTarget: number;
  weeklyCaloriesBurned: number;

  waterGlasses: number;
  waterTarget: number;

  weightHistory: WeightEntry[];
  activityData: ActivityEntry[];

  notifications: Notification[];

  currentDay: string;
  currentDate: string;

  profile: UserProfile;

  workoutPlan: WorkoutPlan | null;
  completedExercises: string[];

  // Per-day meals: key = ISO date (YYYY-MM-DD)
  loggedMeals: Record<string, MealItem[]>;
}

interface AppDataContextType {
  data: AppData;
  updateWeight: (w: number) => void;
  updateBodyFat: (bf: number) => void;
  updateFitnessScore: (fs: number) => void;
  updateRecoveryScore: (rs: number) => void;
  addWaterGlass: () => void;
  removeWaterGlass: () => void;
  setWaterGlasses: (n: number) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (n: Omit<Notification, "id" | "time" | "read">) => void;
  unreadCount: number;
  updateProfile: (patch: Partial<UserProfile>) => void;
  addInjury: (i: Injury) => void;
  removeInjury: (idx: number) => void;
  setWorkoutPlan: (p: WorkoutPlan | null) => void;
  toggleExerciseDone: (key: string) => void;
  addMealEntry: (m: Omit<MealItem, "id" | "loggedAt">) => void;
  removeMealEntry: (id: string) => void;
  todayKey: string;
}

const now = new Date();
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDay = dayNames[now.getDay()];
const currentDate = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
const todayKey = now.toISOString().slice(0, 10);

const defaultNotifications: Notification[] = [
  { id: "1", title: "Recovery Alert", message: "Your recovery score dropped 8%. Consider reducing intensity today.", time: "2 min ago", read: false, type: "alert" },
  { id: "2", title: "Workout Reminder", message: "Today's session is ready. Don't forget to warm up!", time: "1 hour ago", read: false, type: "reminder" },
  { id: "3", title: "AI Coach Tip", message: "Add 5 min of mobility work before sessions to improve performance.", time: "3 hours ago", read: false, type: "tip" },
  { id: "4", title: "Goal Progress", message: "You're 60% toward your weekly calorie burn goal. Keep it up!", time: "5 hours ago", read: false, type: "success" },
  { id: "5", title: "Hydration Reminder", message: "You've only had 3 glasses of water today. Try to reach 8.", time: "6 hours ago", read: false, type: "reminder" },
];

const defaultProfile: UserProfile = {
  fullName: "Ahmed Hassan",
  age: 28,
  height: 178,
  weight: 81.8,
  profession: "office",
  activityLevel: "moderate",
  chronicDiseases: "",
  pastSurgeries: "",
  medications: "",
  painAreas: "",
  injuries: [
    { area: "Right Shoulder", severity: "Moderate", notes: "Rotator cuff strain — avoid overhead press" },
    { area: "Lower Back", severity: "Mild", notes: "Occasional discomfort after prolonged sitting" },
  ],
  targetWeight: 75,
  timeline: "6months",
  goalDescription: "Lose body fat, improve posture from desk work, and build lean muscle safely around my shoulder injury.",
};

const seedMeals: MealItem[] = [
  { id: "s1", slot: "Breakfast", name: "Oatmeal with Berries", calories: 320, protein: 12, source: "manual", loggedAt: new Date().toISOString() },
  { id: "s2", slot: "Breakfast", name: "Greek Yogurt", calories: 150, protein: 15, source: "manual", loggedAt: new Date().toISOString() },
  { id: "s3", slot: "Lunch", name: "Grilled Chicken Salad", calories: 420, protein: 35, source: "manual", loggedAt: new Date().toISOString() },
  { id: "s4", slot: "Lunch", name: "Whole Wheat Bread", calories: 130, protein: 5, source: "manual", loggedAt: new Date().toISOString() },
  { id: "s5", slot: "Snack", name: "Almonds (30g)", calories: 170, protein: 6, source: "manual", loggedAt: new Date().toISOString() },
  { id: "s6", slot: "Snack", name: "Banana", calories: 105, protein: 1, source: "manual", loggedAt: new Date().toISOString() },
];

const initialData: AppData = {
  weight: 81.8,
  height: 178,
  age: 28,
  bodyFat: 18,
  fitnessScore: 72,
  recoveryScore: 85,
  consistencyScore: 87,
  heartRate: 68,
  dailyCaloriesTarget: 2150,
  weeklyCaloriesBurned: 2840,
  waterGlasses: 5,
  waterTarget: 8,
  weightHistory: [
    { week: "W1", weight: 85 },
    { week: "W2", weight: 84.2 },
    { week: "W3", weight: 83.5 },
    { week: "W4", weight: 83.1 },
    { week: "W5", weight: 82.4 },
    { week: "W6", weight: 81.8 },
  ],
  activityData: [
    { day: "Mon", calories: 320 },
    { day: "Tue", calories: 450 },
    { day: "Wed", calories: 280 },
    { day: "Thu", calories: 520 },
    { day: "Fri", calories: 390 },
    { day: "Sat", calories: 610 },
    { day: "Sun", calories: 200 },
  ],
  notifications: defaultNotifications,
  currentDay,
  currentDate,
  profile: defaultProfile,
  workoutPlan: null,
  completedExercises: [],
  loggedMeals: { [todayKey]: seedMeals },
};

const STORAGE_KEY = "fitbuddy_app_data_v3";

const AppDataContext = createContext<AppDataContextType | null>(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        return { ...initialData, ...saved, currentDay, currentDate };
      }
    } catch {}
    return initialData;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  const updateWeight = useCallback((w: number) => {
    setData((prev) => ({
      ...prev,
      weight: w,
      profile: { ...prev.profile, weight: w },
      weightHistory: [...prev.weightHistory.slice(-5), { week: `W${prev.weightHistory.length + 1}`, weight: w }],
    }));
  }, []);

  const updateBodyFat = useCallback((bf: number) => setData((p) => ({ ...p, bodyFat: bf })), []);
  const updateFitnessScore = useCallback((fs: number) => setData((p) => ({ ...p, fitnessScore: fs })), []);
  const updateRecoveryScore = useCallback((rs: number) => setData((p) => ({ ...p, recoveryScore: rs })), []);

  const addWaterGlass = useCallback(() => {
    setData((p) => ({ ...p, waterGlasses: Math.min(p.waterGlasses + 1, 12) }));
  }, []);

  const removeWaterGlass = useCallback(() => {
    setData((p) => ({ ...p, waterGlasses: Math.max(p.waterGlasses - 1, 0) }));
  }, []);

  const setWaterGlasses = useCallback((n: number) => {
    setData((p) => ({ ...p, waterGlasses: Math.max(0, Math.min(12, Math.round(n))) }));
  }, []);

  const addWeightEntry = useCallback((entry: WeightEntry) => {
    setData((p) => ({
      ...p,
      weight: entry.weight,
      profile: { ...p.profile, weight: entry.weight },
      weightHistory: [...p.weightHistory, entry],
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setData((p) => ({
      ...p,
      notifications: p.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setData((p) => ({ ...p, notifications: p.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "time" | "read">) => {
    setData((p) => ({
      ...p,
      notifications: [
        { id: crypto.randomUUID(), time: "just now", read: false, ...n },
        ...p.notifications,
      ],
    }));
  }, []);

  const unreadCount = useMemo(() => data.notifications.filter((n) => !n.read).length, [data.notifications]);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setData((p) => {
      const profile = { ...p.profile, ...patch };
      return {
        ...p,
        profile,
        weight: patch.weight ?? p.weight,
        height: patch.height ?? p.height,
        age: patch.age ?? p.age,
      };
    });
  }, []);

  const addInjury = useCallback((injury: Injury) => {
    setData((p) => ({ ...p, profile: { ...p.profile, injuries: [...p.profile.injuries, injury] } }));
  }, []);

  const removeInjury = useCallback((idx: number) => {
    setData((p) => ({ ...p, profile: { ...p.profile, injuries: p.profile.injuries.filter((_, i) => i !== idx) } }));
  }, []);

  const setWorkoutPlan = useCallback((plan: WorkoutPlan | null) => {
    setData((p) => ({ ...p, workoutPlan: plan, completedExercises: [] }));
  }, []);

  const toggleExerciseDone = useCallback((key: string) => {
    setData((p) => ({
      ...p,
      completedExercises: p.completedExercises.includes(key)
        ? p.completedExercises.filter((k) => k !== key)
        : [...p.completedExercises, key],
    }));
  }, []);

  const addMealEntry = useCallback((m: Omit<MealItem, "id" | "loggedAt">) => {
    setData((p) => {
      const key = todayKey;
      const day = p.loggedMeals[key] ?? [];
      const entry: MealItem = {
        ...m,
        id: crypto.randomUUID(),
        loggedAt: new Date().toISOString(),
      };
      return { ...p, loggedMeals: { ...p.loggedMeals, [key]: [...day, entry] } };
    });
  }, []);

  const removeMealEntry = useCallback((id: string) => {
    setData((p) => {
      const key = todayKey;
      const day = (p.loggedMeals[key] ?? []).filter((m) => m.id !== id);
      return { ...p, loggedMeals: { ...p.loggedMeals, [key]: day } };
    });
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        data,
        updateWeight,
        updateBodyFat,
        updateFitnessScore,
        updateRecoveryScore,
        addWaterGlass,
        removeWaterGlass,
        setWaterGlasses,
        addWeightEntry,
        markNotificationRead,
        clearNotifications,
        addNotification,
        unreadCount,
        updateProfile,
        addInjury,
        removeInjury,
        setWorkoutPlan,
        toggleExerciseDone,
        addMealEntry,
        removeMealEntry,
        todayKey,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
