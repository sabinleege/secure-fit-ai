import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dumbbell,
  Clock,
  Flame,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  RotateCcw,
  Zap,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  safetyNote?: string;
  isRehab?: boolean;
  completed?: boolean;
}

interface WorkoutDay {
  day: string;
  focus: string;
  duration: string;
  calories: string;
  exercises: Exercise[];
}

const weeklyPlan: WorkoutDay[] = [
  {
    day: "Monday",
    focus: "Upper Body (Modified)",
    duration: "40 min",
    calories: "~320 cal",
    exercises: [
      { name: "Wall Push-ups", sets: 3, reps: "12", rest: "60s", safetyNote: "Modified for shoulder safety" },
      { name: "Resistance Band Rows", sets: 3, reps: "15", rest: "60s" },
      { name: "Seated Dumbbell Press (Light)", sets: 3, reps: "10", rest: "90s", safetyNote: "Keep weight under 5kg" },
      { name: "Bicep Curls", sets: 3, reps: "12", rest: "45s" },
      { name: "Shoulder Rehab Rotations", sets: 2, reps: "15", rest: "30s", isRehab: true },
    ],
  },
  {
    day: "Tuesday",
    focus: "Core & Mobility",
    duration: "30 min",
    calories: "~200 cal",
    exercises: [
      { name: "Dead Bug", sets: 3, reps: "10 each side", rest: "45s" },
      { name: "Modified Plank (Knees)", sets: 3, reps: "30s hold", rest: "60s", safetyNote: "Avoid if lower back pain" },
      { name: "Cat-Cow Stretch", sets: 3, reps: "10", rest: "30s", isRehab: true },
      { name: "Hip Circles", sets: 2, reps: "15 each", rest: "30s", isRehab: true },
    ],
  },
  {
    day: "Wednesday",
    focus: "Rest & Recovery",
    duration: "15 min",
    calories: "~80 cal",
    exercises: [
      { name: "Foam Rolling", sets: 1, reps: "5 min", rest: "-", isRehab: true },
      { name: "Light Stretching", sets: 1, reps: "10 min", rest: "-", isRehab: true },
    ],
  },
  {
    day: "Thursday",
    focus: "Lower Body (Safe)",
    duration: "45 min",
    calories: "~380 cal",
    exercises: [
      { name: "Bodyweight Squats", sets: 3, reps: "15", rest: "60s" },
      { name: "Glute Bridges", sets: 3, reps: "12", rest: "60s" },
      { name: "Calf Raises", sets: 3, reps: "20", rest: "45s" },
      { name: "Step-Ups (Low Step)", sets: 3, reps: "10 each", rest: "60s", safetyNote: "Use handrail for balance" },
      { name: "Knee Rehab Extensions", sets: 2, reps: "15", rest: "30s", isRehab: true },
    ],
  },
  {
    day: "Friday",
    focus: "Cardio (Low Impact)",
    duration: "35 min",
    calories: "~300 cal",
    exercises: [
      { name: "Brisk Walking", sets: 1, reps: "20 min", rest: "-" },
      { name: "Cycling (Stationary)", sets: 1, reps: "10 min", rest: "-", safetyNote: "Low resistance setting" },
      { name: "Cool-Down Stretch", sets: 1, reps: "5 min", rest: "-", isRehab: true },
    ],
  },
  {
    day: "Saturday",
    focus: "Full Body Light",
    duration: "40 min",
    calories: "~350 cal",
    exercises: [
      { name: "Band Pull-Aparts", sets: 3, reps: "15", rest: "45s" },
      { name: "Goblet Squats (Light)", sets: 3, reps: "12", rest: "60s" },
      { name: "Dumbbell Rows", sets: 3, reps: "10 each", rest: "60s" },
      { name: "Plank Hold", sets: 3, reps: "20s", rest: "45s" },
    ],
  },
  {
    day: "Sunday",
    focus: "Active Recovery",
    duration: "20 min",
    calories: "~100 cal",
    exercises: [
      { name: "Yoga Flow", sets: 1, reps: "15 min", rest: "-", isRehab: true },
      { name: "Deep Breathing", sets: 1, reps: "5 min", rest: "-", isRehab: true },
    ],
  },
];

function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  const [done, setDone] = useState(false);

  return (
    <div
      className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all duration-250 ${
        done ? "bg-success/5 border border-success/20" : "border border-transparent hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => setDone(!done)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            done ? "border-success bg-success text-success-foreground" : "border-muted-foreground/40"
          }`}
        >
          {done && <CheckCircle2 className="w-4 h-4" />}
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {exercise.name}
            </span>
            {exercise.isRehab && (
              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary px-1.5 py-0">
                Rehab
              </Badge>
            )}
          </div>
          {exercise.safetyNote && (
            <p className="text-[11px] text-warning flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3" /> {exercise.safetyNote}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span>{exercise.sets}×{exercise.reps}</span>
        <span className="hidden sm:inline">{exercise.rest}</span>
      </div>
    </div>
  );
}

function WorkoutDayCard({ workout, isToday }: { workout: WorkoutDay; isToday: boolean }) {
  const [expanded, setExpanded] = useState(isToday);

  return (
    <motion.div
      variants={item}
      className={`glass-card overflow-hidden ${isToday ? "glow-primary border-primary/30" : ""}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isToday ? "gradient-primary" : "bg-muted"
          }`}>
            <Dumbbell className={`w-5 h-5 ${isToday ? "text-primary-foreground" : "text-muted-foreground"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-foreground text-sm">{workout.day}</h3>
              {isToday && (
                <Badge className="gradient-primary text-primary-foreground text-[10px] px-2">Today</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{workout.focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.duration}</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {workout.calories}</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="px-5 pb-5"
        >
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 sm:hidden">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.duration}</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {workout.calories}</span>
          </div>
          <div className="space-y-1">
            {workout.exercises.map((ex, i) => (
              <ExerciseRow key={ex.name} exercise={ex} index={i} />
            ))}
          </div>
          {isToday && (
            <div className="flex gap-3 mt-4">
              <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity flex-1">
                <Play className="w-4 h-4 mr-2" /> Start Workout
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function WorkoutPage() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <Dumbbell className="w-6 h-6 text-primary" /> Workout Plan
        </h1>
        <p className="text-muted-foreground text-sm mt-1">AI-generated, injury-safe weekly plan</p>
      </motion.div>

      {/* Weekly Overview */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground text-sm">Weekly Progress</h3>
          <span className="text-xs text-muted-foreground">3 of 6 workouts completed</span>
        </div>
        <Progress value={50} className="h-2" />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-display">1,580</p>
            <p className="text-xs text-muted-foreground">Calories Burned</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-display">155 min</p>
            <p className="text-xs text-muted-foreground">Total Duration</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary font-display">87%</p>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </div>
        </div>
      </motion.div>

      {/* Safety Notice */}
      <motion.div variants={item} className="glass-card p-4 border-warning/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">AI Safety Adjustment</p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on your shoulder injury, heavy overhead presses have been replaced with safe alternatives. Rehab exercises are included.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Daily Plans */}
      <div className="space-y-3">
        {weeklyPlan.map((workout) => (
          <WorkoutDayCard key={workout.day} workout={workout} isToday={workout.day === today} />
        ))}
      </div>
    </motion.div>
  );
}
