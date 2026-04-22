import { motion } from "framer-motion";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ClipboardCheck,
  Video,
  Image,
  MessageSquare,
  CheckCircle2,
  Circle,
  Sparkles,
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
import { FileUploadButton } from "@/components/FileUploadButton";
import { useAppData } from "@/contexts/AppDataContext";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

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
  const [tasks, setTasks] = useState([
    { id: 1, title: "Complete Upper Body Workout", type: "workout", done: true },
    { id: 2, title: "Submit pain feedback", type: "feedback", done: false },
    { id: 3, title: "Upload posture photo", type: "photo", done: false },
    { id: 4, title: "Log today's meals", type: "nutrition", done: true },
  ]);
  const { data } = useAppData();

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const completedCount = tasks.filter((t) => t.done).length;

  const [aiResponse, setAiResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please add some feedback before submitting");
      return;
    }
    setSubmitting(true);
    setAiResponse("");
    try {
      const { data: res, error } = await supabase.functions.invoke("ai-analyze", {
        body: {
          kind: "followup",
          payload: { pain: painLevel[0], fatigue: fatigueLevel[0], feedback },
          context: { weight: data.weight, recoveryScore: data.recoveryScore, fitnessScore: data.fitnessScore },
        },
      });
      if (error) throw error;
      if ((res as any)?.error) { toast.error((res as any).error); return; }
      setAiResponse((res as any)?.text || "");
      toast.success("Follow-up analyzed by AI Coach");
      setFeedback("");
      setPainLevel([3]);
      setFatigueLevel([5]);
    } catch (e) {
      toast.error("AI analysis failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" /> Follow-Up
        </h1>
        <p className="text-muted-foreground text-xs mt-1">{data.currentDate} — Submit reports for AI coaching</p>
      </motion.div>

      {/* Today's Tasks */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground text-xs">Today's Tasks</h3>
          <span className="text-[10px] text-muted-foreground">{completedCount} / {tasks.length}</span>
        </div>
        <Progress value={(completedCount / tasks.length) * 100} className="h-1.5 mb-3" />
        <div className="space-y-1">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-2 py-2 border-b border-border/20 last:border-0 text-left"
            >
              {task.done ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              )}
              <span className={`text-xs flex-1 ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {task.title}
              </span>
              {!task.done && (
                <Badge variant="outline" className="text-[9px] border-warning/40 text-warning px-1">
                  Pending
                </Badge>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Submit Follow-Up */}
      <motion.div variants={item}>
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="glass-card w-full grid grid-cols-2 mb-3">
            <TabsTrigger value="report" className="rounded-xl text-xs">Submit Report</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl text-xs">History</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-3">
            <div className="glass-card p-4">
              <h3 className="font-display font-semibold text-foreground text-xs mb-3">How did your workout go?</h3>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-foreground">Pain Level</label>
                  <span className="text-[10px] font-medium text-primary">{painLevel[0]}/10</span>
                </div>
                <Slider value={painLevel} onValueChange={setPainLevel} max={10} step={1} className="w-full" />
                <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                  <span>No Pain</span><span>Severe</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-foreground">Fatigue Level</label>
                  <span className="text-[10px] font-medium text-secondary">{fatigueLevel[0]}/10</span>
                </div>
                <Slider value={fatigueLevel} onValueChange={setFatigueLevel} max={10} step={1} className="w-full" />
                <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                  <span>Fresh</span><span>Exhausted</span>
                </div>
              </div>

              <Textarea
                placeholder="Describe how you felt, any discomfort..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground text-xs"
                rows={3}
              />

              <div className="flex gap-2 mt-3">
                <FileUploadButton icon={Image} label="Photo" accept="image/*" className="flex-1 text-xs" />
                <FileUploadButton icon={Video} label="Video" accept="video/*" className="flex-1 text-xs" />
              </div>

              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Video upload is enabled when AI requests form check.
              </p>

              <Button
                onClick={handleSubmit}
                className="w-full mt-3 gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-xs"
              >
                <Send className="w-3 h-3 mr-1" /> Submit Follow-Up
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-2">
            {pastReports.map((report) => (
              <div key={report.date} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{report.date}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 ${
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
                <p className="text-xs text-muted-foreground">{report.summary}</p>
                <div className="mt-2 p-2 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">AI Response</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{report.aiResponse}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
