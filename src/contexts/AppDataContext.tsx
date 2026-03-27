import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

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

interface AppData {
  // User metrics
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

  // Water
  waterGlasses: number;
  waterTarget: number;

  // Charts
  weightHistory: WeightEntry[];
  activityData: ActivityEntry[];

  // Notifications
  notifications: Notification[];

  // Current day
  currentDay: string;
  currentDate: string;
}

interface AppDataContextType {
  data: AppData;
  updateWeight: (w: number) => void;
  updateBodyFat: (bf: number) => void;
  updateFitnessScore: (fs: number) => void;
  updateRecoveryScore: (rs: number) => void;
  addWaterGlass: () => void;
  removeWaterGlass: () => void;
  addWeightEntry: (entry: WeightEntry) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const now = new Date();
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDay = dayNames[now.getDay()];
const currentDate = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

const defaultNotifications: Notification[] = [
  { id: "1", title: "Recovery Alert", message: "Your recovery score dropped 8%. Consider reducing intensity today.", time: "2 min ago", read: false, type: "alert" },
  { id: "2", title: "Workout Reminder", message: "Today's Upper Body session is ready. Don't forget to warm up!", time: "1 hour ago", read: false, type: "reminder" },
  { id: "3", title: "AI Coach Tip", message: "Add 5 min of mobility work before sessions to improve performance.", time: "3 hours ago", read: false, type: "tip" },
  { id: "4", title: "Goal Progress", message: "You're 60% toward your weekly calorie burn goal. Keep it up!", time: "5 hours ago", read: false, type: "success" },
  { id: "5", title: "Hydration Reminder", message: "You've only had 3 glasses of water today. Try to reach 8.", time: "6 hours ago", read: false, type: "reminder" },
];

const initialData: AppData = {
  weight: 81.8,
  height: 175,
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
};

const AppDataContext = createContext<AppDataContextType | null>(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);

  const bmi = useMemo(() => {
    const h = data.height / 100;
    return (data.weight / (h * h)).toFixed(1);
  }, [data.weight, data.height]);

  const updateWeight = useCallback((w: number) => {
    setData((prev) => ({
      ...prev,
      weight: w,
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

  const addWeightEntry = useCallback((entry: WeightEntry) => {
    setData((p) => ({
      ...p,
      weight: entry.weight,
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

  const unreadCount = useMemo(() => data.notifications.filter((n) => !n.read).length, [data.notifications]);

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
        addWeightEntry,
        markNotificationRead,
        clearNotifications,
        unreadCount,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
