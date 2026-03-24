import { motion } from "framer-motion";
import { useState } from "react";
import {
  ClipboardCheck,
  Upload,
  Video,
  Image,
  MessageSquare,
  CheckCircle2,
  Circle,
  Sparkles,
  AlertTriangle,
  Activity,
  Shield,
  Send,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const pendingTasks = [
  { id: 1, title: "Complete Upper Body Workout", type: "workout", done: true },
  { id: 2, title: "Submit pain feedback", type: "feedback", done: false },
  { id: 3, title: "Upload posture photo", type: "photo", done: false },
  { id: 4, title: "Log today's meals", type: "nutrition", done: true },
];

const pastReports = [
  {
    date: "Mar 22, 2026",
    summary: "Completed leg day. Mild knee discomfort during squats (3/10 pain).",
    aiResponse: "Reduced squat depth recommended. Added knee-strengthening exercises to Thursday's plan.",
    score: 82,
  },
  {
    date: "Mar 20, 2026",
    summary: "Upper body workout completed. No issues reported.",
    aiResponse: "Great progress! Slight weight increase suggested for bicep curls next session.",
    score: 91,
  },
  {
    date: "Mar 18, 2026",
    summary: "Skipped workout due to fatigue. Slept only 4 hours.",
    aiResponse: "Rest day approved. Sleep quality is critical — consider limiting screen time before bed.",
    score: 45,
  },
];

export default function FollowUpPage() {
  const [feedback, setFeedback] = useState("");
  const [painLevel, setPainLevel] = useState([3]);
  const [fatigueLevel, setFatigueLevel] = useState([5]);

  const completedCount = pendingTasks.filter((t) => t.done).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6 text-primary" /> Follow-Up & Analysis
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Submit reports and get AI-driven coaching feedback</p>
      </motion.div>

      {/* Today's Tasks */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground text-sm">Today's Tasks</h3>
          <span className="text-xs text-muted-foreground">{completedCount} / {pendingTasks.length} completed</span>
        </div>
        <Progress value={(completedCount / pendingTasks.length) * 100} className="h-2 mb-4" />
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
              {task.done ? (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              )}
              <span className={`text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {task.title}
              </span>
              {!task.done && (
                <Badge variant="outline" className="ml-auto text-[10px] border-warning/40 text-warning px-1.5">
                  Pending
                </Badge>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Submit Follow-Up */}
      <motion.div variants={item}>
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="glass-card w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="report" className="rounded-xl">Submit Report</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl">History</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-foreground text-sm mb-4">How did your workout go?</h3>

              {/* Pain Level */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-foreground">Pain Level</label>
                  <span className="text-xs font-medium text-primary">{painLevel[0]}/10</span>
                </div>
                <Slider
                  value={painLevel}
                  onValueChange={setPainLevel}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>No Pain</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Fatigue Level */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-foreground">Fatigue Level</label>
                  <span className="text-xs font-medium text-secondary">{fatigueLevel[0]}/10</span>
                </div>
                <Slider
                  value={fatigueLevel}
                  onValueChange={setFatigueLevel}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Fresh</span>
                  <span>Exhausted</span>
                </div>
              </div>

              {/* Text Feedback */}
              <Textarea
                placeholder="Describe how you felt, any discomfort, difficulty with exercises..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground"
                rows={3}
              />

              {/* Uploads */}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="rounded-xl border-border text-foreground flex-1">
                  <Image className="w-4 h-4 mr-2" /> Upload Photo
                </Button>
                <Button variant="outline" className="rounded-xl border-border text-foreground flex-1">
                  <Video className="w-4 h-4 mr-2" /> Upload Video
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Video upload is only enabled when AI requests a form check.
              </p>

              <Button className="w-full mt-4 gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4 mr-2" /> Submit Follow-Up
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {pastReports.map((report) => (
              <div key={report.date} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{report.date}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 ${
                      report.score >= 80
                        ? "border-success/40 text-success"
                        : report.score >= 60
                        ? "border-warning/40 text-warning"
                        : "border-destructive/40 text-destructive"
                    }`}
                  >
                    Score: {report.score}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{report.summary}</p>
                <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Response</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{report.aiResponse}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
