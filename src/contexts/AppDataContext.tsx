import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  workoutPlanId: string | null;
  completedExercises: string[];

  loggedMeals: Record<string, MealItem[]>;
}

interface AppDataContextType {
  data: AppData;
  isSyncing: boolean;
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

const defaultProfile: UserProfile = {
  fullName: "",
  age: 28,
  height: 178,
  weight: 80,
  profession: "office",
  activityLevel: "moderate",
  chronicDiseases: "",
  pastSurgeries: "",
  medications: "",
  painAreas: "",
  injuries: [],
  targetWeight: 75,
  timeline: "6months",
  goalDescription: "",
};

const initialData: AppData = {
  weight: 80,
  height: 178,
  age: 28,
  bodyFat: 18,
  fitnessScore: 72,
  recoveryScore: 85,
  consistencyScore: 87,
  heartRate: 68,
  dailyCaloriesTarget: 2150,
  weeklyCaloriesBurned: 0,
  waterGlasses: 0,
  waterTarget: 8,
  weightHistory: [],
  activityData: [],
  notifications: [],
  currentDay,
  currentDate,
  profile: defaultProfile,
  workoutPlan: null,
  workoutPlanId: null,
  completedExercises: [],
  loggedMeals: { [todayKey]: [] },
};

const AppDataContext = createContext<AppDataContextType | null>(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

// ===== mappers =====
function profileFromRow(row: any): UserProfile {
  return {
    fullName: row.full_name ?? "",
    age: row.age ?? 28,
    height: Number(row.height ?? 178),
    weight: Number(row.weight ?? 80),
    profession: row.profession ?? "office",
    activityLevel: row.activity_level ?? "moderate",
    chronicDiseases: row.chronic_diseases ?? "",
    pastSurgeries: row.past_surgeries ?? "",
    medications: row.medications ?? "",
    painAreas: row.pain_areas ?? "",
    injuries: Array.isArray(row.injuries) ? row.injuries : [],
    targetWeight: Number(row.target_weight ?? 75),
    timeline: row.timeline ?? "6months",
    goalDescription: row.goal_description ?? "",
  };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const loadedRef = useRef(false);

  // Track auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      if (!session) {
        loadedRef.current = false;
        setData(initialData);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load all user data on sign-in
  useEffect(() => {
    if (!userId || loadedRef.current) return;
    loadedRef.current = true;
    setIsSyncing(true);

    (async () => {
      try {
        const [profileRes, planRes, mealsRes, weightRes, activityRes, notifRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase.from("workout_plans").select("*").eq("user_id", userId).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("meal_logs").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(14),
          supabase.from("weight_history").select("*").eq("user_id", userId).order("recorded_at", { ascending: true }).limit(20),
          supabase.from("activity_data").select("*").eq("user_id", userId).order("date", { ascending: true }).limit(7),
          supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        ]);

        const profileRow = profileRes.data;
        const planRow = planRes.data as any;
        const mealRows = (mealsRes.data ?? []) as any[];
        const weightRows = (weightRes.data ?? []) as any[];
        const activityRows = (activityRes.data ?? []) as any[];
        const notifRows = (notifRes.data ?? []) as any[];

        const loggedMeals: Record<string, MealItem[]> = {};
        for (const row of mealRows) {
          loggedMeals[row.date] = Array.isArray(row.meals) ? row.meals : [];
        }
        if (!loggedMeals[todayKey]) loggedMeals[todayKey] = [];

        setData((prev) => ({
          ...prev,
          profile: profileRow ? profileFromRow(profileRow) : prev.profile,
          weight: profileRow ? Number(profileRow.weight) : prev.weight,
          height: profileRow ? Number(profileRow.height) : prev.height,
          age: profileRow?.age ?? prev.age,
          bodyFat: Number(profileRow?.body_fat ?? prev.bodyFat),
          fitnessScore: profileRow?.fitness_score ?? prev.fitnessScore,
          recoveryScore: profileRow?.recovery_score ?? prev.recoveryScore,
          consistencyScore: profileRow?.consistency_score ?? prev.consistencyScore,
          heartRate: profileRow?.heart_rate ?? prev.heartRate,
          dailyCaloriesTarget: profileRow?.daily_calories_target ?? prev.dailyCaloriesTarget,
          waterGlasses: profileRow?.water_glasses ?? 0,
          waterTarget: profileRow?.water_target ?? 8,
          workoutPlan: planRow?.plan_data ?? null,
          workoutPlanId: planRow?.id ?? null,
          completedExercises: Array.isArray(planRow?.completed_exercises) ? planRow.completed_exercises : [],
          loggedMeals,
          weightHistory: weightRows.map((r) => ({ week: r.week_label, weight: Number(r.weight) })),
          activityData: activityRows.map((r) => ({ day: r.day, calories: r.calories })),
          weeklyCaloriesBurned: activityRows.reduce((s, r) => s + (r.calories || 0), 0),
          notifications: notifRows.map((r) => ({
            id: r.id,
            title: r.title,
            message: r.message,
            type: r.type as Notification["type"],
            read: r.read,
            time: timeAgo(r.created_at),
          })),
        }));
      } catch (e) {
        console.error("Sync error:", e);
      } finally {
        setIsSyncing(false);
      }
    })();
  }, [userId]);

  // ===== Goal-aware AI: run once per day on login =====
  const adjustRanRef = useRef<string | null>(null);
  useEffect(() => {
    if (!userId || isSyncing) return;
    if (adjustRanRef.current === todayKey) return;
    adjustRanRef.current = todayKey;

    (async () => {
      try {
        // Check goal_progress.last_calculated to skip if already done today
        const { data: gp } = await supabase
          .from("goal_progress")
          .select("last_calculated")
          .eq("user_id", userId)
          .maybeSingle();
        const last = gp?.last_calculated ? new Date(gp.last_calculated).toISOString().slice(0, 10) : null;
        if (last === todayKey) {
          adjustRanRef.current = todayKey;
          return;
        }

        // Build payload from current data
        const recentMeals = Object.entries(data.loggedMeals)
          .slice(0, 7)
          .map(([date, meals]) => ({
            date,
            totalCalories: meals.reduce((s, m) => s + (m.calories || 0), 0),
            totalProtein: meals.reduce((s, m) => s + (m.protein || 0), 0),
            items: meals.map((m) => ({ slot: m.slot, name: m.name })),
          }));

        const payload = {
          profile: data.profile,
          currentWeight: data.weight,
          targetWeight: data.profile.targetWeight,
          timeline: data.profile.timeline,
          weightHistory: data.weightHistory,
          recoveryScore: data.recoveryScore,
          consistencyScore: data.consistencyScore,
          dailyCaloriesTarget: data.dailyCaloriesTarget,
          recentMeals,
        };
        const ctx = {
          today: todayKey,
          dayOfWeek: currentDay,
          activePlan: data.workoutPlan
            ? { summary: data.workoutPlan.summary, todayDay: data.workoutPlan.days.find((d) => d.day === currentDay) }
            : null,
        };

        const { data: res, error } = await supabase.functions.invoke("ai-analyze", {
          body: { kind: "daily-adjust", payload, context: ctx },
        });
        if (error || !res?.adjust) {
          console.warn("daily-adjust skipped:", error || res);
          return;
        }
        adjustRanRef.current = todayKey;
        const adj = res.adjust;

        // Persist computed scores + projection
        await Promise.all([
          supabase.from("profiles").update({
            recovery_score: Math.round(adj.recoveryScore),
            consistency_score: Math.round(adj.consistencyScore),
          }).eq("id", userId),
          supabase.from("goal_progress").upsert({
            user_id: userId,
            current_weight: data.weight,
            projected_outcome: adj.projectedOutcome,
            last_calculated: new Date().toISOString(),
          }, { onConflict: "user_id" }),
        ]);

        // Insert notifications
        const notifs = (adj.notifications ?? []).slice(0, 3).map((n: any) => ({
          id: crypto.randomUUID(),
          user_id: userId,
          title: n.title,
          message: n.message,
          type: n.type,
        }));
        if (notifs.length) {
          await supabase.from("notifications").insert(notifs);
        }

        // Always add coaching tip as a notification
        const tipId = crypto.randomUUID();
        await supabase.from("notifications").insert({
          id: tipId,
          user_id: userId,
          title: adj.onTrack ? "On track 🎯" : "Goal check-in",
          message: `${adj.focusToday} — ${adj.coachingTip}`,
          type: adj.onTrack ? "success" : "tip",
        });

        // Reflect in local state
        setData((p) => ({
          ...p,
          recoveryScore: Math.round(adj.recoveryScore),
          consistencyScore: Math.round(adj.consistencyScore),
          notifications: [
            {
              id: tipId,
              title: adj.onTrack ? "On track 🎯" : "Goal check-in",
              message: `${adj.focusToday} — ${adj.coachingTip}`,
              type: (adj.onTrack ? "success" : "tip") as Notification["type"],
              read: false,
              time: "just now",
            },
            ...notifs.map((n) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type as Notification["type"],
              read: false,
              time: "just now",
            })),
            ...p.notifications,
          ],
        }));
      } catch (e) {
        console.error("daily-adjust error:", e);
      }
    })();
  }, [userId, isSyncing, data.profile, data.weight, data.workoutPlan, data.recoveryScore, data.consistencyScore, data.weightHistory, data.loggedMeals, data.dailyCaloriesTarget]);

  // ===== persistence helpers (fire-and-forget) =====
  const persistProfile = useCallback(
    (patch: Record<string, any>) => {
      if (!userId) return;
      supabase.from("profiles").update(patch as any).eq("id", userId).then(({ error }) => {
        if (error) console.error("profile update", error);
      });
    },
    [userId]
  );

  const persistMealsForDate = useCallback(
    (dateKey: string, meals: MealItem[]) => {
      if (!userId) return;
      const totals = meals.reduce(
        (a, m) => ({ cals: a.cals + (m.calories || 0), prot: a.prot + (m.protein || 0) }),
        { cals: 0, prot: 0 }
      );
      supabase
        .from("meal_logs")
        .upsert(
          {
            user_id: userId,
            date: dateKey,
            meals: meals as any,
            total_calories: totals.cals,
            total_protein: totals.prot,
          },
          { onConflict: "user_id,date" }
        )
        .then(({ error }) => error && console.error("meal upsert", error));
    },
    [userId]
  );

  // ===== mutations =====
  const updateWeight = useCallback(
    (w: number) => {
      const weekLabel = `W${(data.weightHistory.length || 0) + 1}`;
      setData((prev) => ({
        ...prev,
        weight: w,
        profile: { ...prev.profile, weight: w },
        weightHistory: [...prev.weightHistory.slice(-19), { week: weekLabel, weight: w }],
      }));
      persistProfile({ weight: w });
      if (userId) {
        supabase.from("weight_history").insert({ user_id: userId, week_label: weekLabel, weight: w }).then(({ error }) => error && console.error("weight insert", error));
      }
    },
    [data.weightHistory.length, persistProfile, userId]
  );

  const updateBodyFat = useCallback(
    (bf: number) => {
      setData((p) => ({ ...p, bodyFat: bf }));
      persistProfile({ body_fat: bf });
    },
    [persistProfile]
  );
  const updateFitnessScore = useCallback(
    (fs: number) => {
      setData((p) => ({ ...p, fitnessScore: fs }));
      persistProfile({ fitness_score: fs });
    },
    [persistProfile]
  );
  const updateRecoveryScore = useCallback(
    (rs: number) => {
      setData((p) => ({ ...p, recoveryScore: rs }));
      persistProfile({ recovery_score: rs });
    },
    [persistProfile]
  );

  const addWaterGlass = useCallback(() => {
    setData((p) => {
      const next = Math.min(p.waterGlasses + 1, 12);
      persistProfile({ water_glasses: next });
      return { ...p, waterGlasses: next };
    });
  }, [persistProfile]);

  const removeWaterGlass = useCallback(() => {
    setData((p) => {
      const next = Math.max(p.waterGlasses - 1, 0);
      persistProfile({ water_glasses: next });
      return { ...p, waterGlasses: next };
    });
  }, [persistProfile]);

  const setWaterGlasses = useCallback(
    (n: number) => {
      const v = Math.max(0, Math.min(12, Math.round(n)));
      setData((p) => ({ ...p, waterGlasses: v }));
      persistProfile({ water_glasses: v });
    },
    [persistProfile]
  );

  const addWeightEntry = useCallback(
    (entry: WeightEntry) => {
      setData((p) => ({
        ...p,
        weight: entry.weight,
        profile: { ...p.profile, weight: entry.weight },
        weightHistory: [...p.weightHistory, entry],
      }));
      persistProfile({ weight: entry.weight });
      if (userId) {
        supabase.from("weight_history").insert({ user_id: userId, week_label: entry.week, weight: entry.weight });
      }
    },
    [persistProfile, userId]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      setData((p) => ({
        ...p,
        notifications: p.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
      if (userId) supabase.from("notifications").update({ read: true }).eq("id", id);
    },
    [userId]
  );

  const clearNotifications = useCallback(() => {
    setData((p) => ({ ...p, notifications: p.notifications.map((n) => ({ ...n, read: true })) }));
    if (userId) supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  }, [userId]);

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "time" | "read">) => {
      const id = crypto.randomUUID();
      setData((p) => ({
        ...p,
        notifications: [{ id, time: "just now", read: false, ...n }, ...p.notifications],
      }));
      if (userId) {
        supabase.from("notifications").insert({ id, user_id: userId, title: n.title, message: n.message, type: n.type });
      }
    },
    [userId]
  );

  const unreadCount = useMemo(() => data.notifications.filter((n) => !n.read).length, [data.notifications]);

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
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
      const dbPatch: Record<string, any> = {};
      if (patch.fullName !== undefined) dbPatch.full_name = patch.fullName;
      if (patch.age !== undefined) dbPatch.age = patch.age;
      if (patch.height !== undefined) dbPatch.height = patch.height;
      if (patch.weight !== undefined) dbPatch.weight = patch.weight;
      if (patch.profession !== undefined) dbPatch.profession = patch.profession;
      if (patch.activityLevel !== undefined) dbPatch.activity_level = patch.activityLevel;
      if (patch.chronicDiseases !== undefined) dbPatch.chronic_diseases = patch.chronicDiseases;
      if (patch.pastSurgeries !== undefined) dbPatch.past_surgeries = patch.pastSurgeries;
      if (patch.medications !== undefined) dbPatch.medications = patch.medications;
      if (patch.painAreas !== undefined) dbPatch.pain_areas = patch.painAreas;
      if (patch.injuries !== undefined) dbPatch.injuries = patch.injuries;
      if (patch.targetWeight !== undefined) dbPatch.target_weight = patch.targetWeight;
      if (patch.timeline !== undefined) dbPatch.timeline = patch.timeline;
      if (patch.goalDescription !== undefined) dbPatch.goal_description = patch.goalDescription;
      if (Object.keys(dbPatch).length) persistProfile(dbPatch);
    },
    [persistProfile]
  );

  const addInjury = useCallback(
    (injury: Injury) => {
      setData((p) => {
        const injuries = [...p.profile.injuries, injury];
        persistProfile({ injuries });
        return { ...p, profile: { ...p.profile, injuries } };
      });
    },
    [persistProfile]
  );

  const removeInjury = useCallback(
    (idx: number) => {
      setData((p) => {
        const injuries = p.profile.injuries.filter((_, i) => i !== idx);
        persistProfile({ injuries });
        return { ...p, profile: { ...p.profile, injuries } };
      });
    },
    [persistProfile]
  );

  const setWorkoutPlan = useCallback(
    (plan: WorkoutPlan | null) => {
      setData((p) => ({ ...p, workoutPlan: plan, completedExercises: [] }));
      if (!userId) return;
      if (plan) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        // Deactivate prior plans, then insert new active
        supabase
          .from("workout_plans")
          .update({ is_active: false })
          .eq("user_id", userId)
          .eq("is_active", true)
          .then(() => {
            supabase
              .from("workout_plans")
              .insert({
                user_id: userId,
                week_start: weekStart.toISOString().slice(0, 10),
                plan_data: plan as any,
                completed_exercises: [],
                is_active: true,
              })
              .select("id")
              .single()
              .then(({ data: row }) => {
                if (row) setData((p) => ({ ...p, workoutPlanId: row.id }));
              });
          });
      } else {
        supabase.from("workout_plans").update({ is_active: false }).eq("user_id", userId).eq("is_active", true);
        setData((p) => ({ ...p, workoutPlanId: null }));
      }
    },
    [userId]
  );

  const toggleExerciseDone = useCallback(
    (key: string) => {
      setData((p) => {
        const next = p.completedExercises.includes(key)
          ? p.completedExercises.filter((k) => k !== key)
          : [...p.completedExercises, key];
        if (userId && p.workoutPlanId) {
          supabase.from("workout_plans").update({ completed_exercises: next }).eq("id", p.workoutPlanId);
        }
        return { ...p, completedExercises: next };
      });
    },
    [userId]
  );

  const addMealEntry = useCallback(
    (m: Omit<MealItem, "id" | "loggedAt">) => {
      setData((p) => {
        const key = todayKey;
        const day = p.loggedMeals[key] ?? [];
        const entry: MealItem = { ...m, id: crypto.randomUUID(), loggedAt: new Date().toISOString() };
        const meals = [...day, entry];
        persistMealsForDate(key, meals);
        return { ...p, loggedMeals: { ...p.loggedMeals, [key]: meals } };
      });
    },
    [persistMealsForDate]
  );

  const removeMealEntry = useCallback(
    (id: string) => {
      setData((p) => {
        const key = todayKey;
        const meals = (p.loggedMeals[key] ?? []).filter((m) => m.id !== id);
        persistMealsForDate(key, meals);
        return { ...p, loggedMeals: { ...p.loggedMeals, [key]: meals } };
      });
    },
    [persistMealsForDate]
  );

  return (
    <AppDataContext.Provider
      value={{
        data,
        isSyncing,
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
