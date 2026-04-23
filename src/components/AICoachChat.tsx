import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, Plus, Mic, ImageIcon, Paperclip, Camera } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppData, type WorkoutPlan, type MealSlot } from "@/contexts/AppDataContext";
import { toast } from "sonner";

type Attachment = {
  id: string;
  name: string;
  mime: string;
  dataUrl: string; // base64 data URL
  size: number;
  kind: "image" | "file";
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const SUGGESTIONS = [
  "How should I train today?",
  "Rate my recovery",
  "Suggest a high-protein meal",
  "My knee hurts after squats",
];

const MAX_FILE_MB = 8;
const MAX_ATTACHMENTS = 4;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export function AICoachChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your **Fit Buddy AI Coach**. Ask me about workouts, recovery, nutrition, or how you're feeling today. You can also attach a photo of a meal, posture, or injury for me to analyze." },
  ]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, setWorkoutPlan, addMealEntry, addWaterGlass, addNotification } = useAppData();

  // Apply structured actions returned by the AI (workout plan, meal log, water, notifications)
  const applyActions = (actions: Array<{ name: string; args: any }>) => {
    if (!actions?.length) return;
    const summaries: string[] = [];
    for (const a of actions) {
      try {
        if (a.name === "generate_workout_plan" && a.args?.days?.length) {
          const plan: WorkoutPlan = {
            summary: a.args.summary ?? "AI-generated plan",
            safetyNote: a.args.safetyNote ?? "",
            days: a.args.days,
            generatedAt: new Date().toISOString(),
            basedOn: {
              weight: data.profile.weight,
              injuries: data.profile.injuries.map((i) => i.area).join(", ") || "none",
              profession: data.profile.profession,
              recoveryScore: data.recoveryScore,
            },
          };
          setWorkoutPlan(plan);
          summaries.push("📋 Workout plan saved → Workout page");
        } else if (a.name === "log_meals" && Array.isArray(a.args?.items)) {
          for (const it of a.args.items) {
            addMealEntry({
              slot: it.slot as MealSlot,
              name: it.name,
              calories: Number(it.calories) || 0,
              protein: Number(it.protein) || 0,
              carbs: it.carbs != null ? Number(it.carbs) : undefined,
              fat: it.fat != null ? Number(it.fat) : undefined,
              source: "ai",
            });
          }
          summaries.push(`🍽 ${a.args.items.length} meal item(s) → Nutrition page`);
        } else if (a.name === "log_water" && Number(a.args?.glasses) > 0) {
          const n = Math.min(8, Math.floor(Number(a.args.glasses)));
          for (let i = 0; i < n; i++) addWaterGlass();
          summaries.push(`💧 ${n} water glass(es) → Nutrition page`);
        } else if (a.name === "add_notification" && a.args?.title) {
          addNotification({
            title: a.args.title,
            message: a.args.message ?? "",
            type: (a.args.type as any) ?? "tip",
          });
          summaries.push("🔔 Notification posted");
        }
      } catch (err) {
        console.error("apply action failed", a.name, err);
      }
    }
    if (summaries.length) toast.success(summaries.join(" · "));
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, attachments.length]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      toast.error(`Max ${MAX_ATTACHMENTS} attachments per message.`);
      return;
    }
    const picked = Array.from(files).slice(0, remaining);
    const next: Attachment[] = [];
    for (const f of picked) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${f.name} is over ${MAX_FILE_MB}MB.`);
        continue;
      }
      try {
        const dataUrl = await readAsDataUrl(f);
        next.push({
          id: crypto.randomUUID(),
          name: f.name || "attachment",
          mime: f.type || "application/octet-stream",
          dataUrl,
          size: f.size,
          kind: f.type.startsWith("image/") ? "image" : "file",
        });
      } catch {
        toast.error(`Could not read ${f.name}`);
      }
    }
    if (next.length) setAttachments((a) => [...a, ...next]);
  };

  const removeAttachment = (id: string) =>
    setAttachments((a) => a.filter((x) => x.id !== id));

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if ((!text && attachments.length === 0) || loading) return;

    const localAttachments = attachments;
    setInput("");
    setAttachments([]);

    const userMsg: Msg = { role: "user", content: text, attachments: localAttachments };
    const next: Msg[] = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setLoading(true);

    // Build multimodal content for the API
    const buildApiMessages = () =>
      next.map((m) => {
        const atts = m.attachments ?? [];
        const imgs = atts.filter((a) => a.kind === "image");
        const otherFiles = atts.filter((a) => a.kind !== "image");
        const fileNote =
          otherFiles.length > 0
            ? `\n\n[Attached files: ${otherFiles.map((f) => `${f.name} (${f.mime})`).join(", ")}]`
            : "";
        const textPart = (m.content || "") + fileNote;

        if (imgs.length === 0) {
          return { role: m.role, content: textPart };
        }
        return {
          role: m.role,
          content: [
            ...(textPart ? [{ type: "text", text: textPart }] : []),
            ...imgs.map((im) => ({
              type: "image_url",
              image_url: { url: im.dataUrl },
            })),
          ],
        };
      });

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({
          messages: buildApiMessages(),
          context: {
            weight: data.weight, height: data.height, age: data.age,
            bodyFat: data.bodyFat, fitnessScore: data.fitnessScore,
            recoveryScore: data.recoveryScore, day: data.currentDay,
          },
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limit reached. Try again shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add funds to your workspace.");
        else toast.error("AI failed to respond.");
        setMessages((m) => m.slice(0, -1));
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      let acc = "";

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              setMessages((m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: acc } : msg));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error talking to AI.");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 1;
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !loading;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Open AI Coach"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
          >
            {/* Hidden file inputs */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
            />

            {/* Header */}
            <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border/40 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground font-display leading-tight">AI Coach</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Online · Safety-first</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-muted/60 active:bg-muted flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </header>

            {/* Messages or empty state */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {isEmpty ? (
                <div className="min-h-full flex flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-xl shadow-primary/30">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                    How can I help you today?
                  </h1>
                  <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                    Ask anything about your training, recovery, pain, or nutrition. Attach a photo for visual analysis.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-xs px-4 py-3 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/40 text-foreground transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/50 text-foreground rounded-bl-md"
                      }`}>
                        {/* Attachment previews */}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {m.attachments.map((a) =>
                              a.kind === "image" ? (
                                <img
                                  key={a.id}
                                  src={a.dataUrl}
                                  alt={a.name}
                                  className="w-28 h-28 rounded-xl object-cover border border-border/40"
                                />
                              ) : (
                                <div
                                  key={a.id}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/30 border border-border/40 text-xs"
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                  <span className="truncate max-w-[140px]">{a.name}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {m.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 [&_*]:text-foreground prose-strong:text-foreground prose-code:text-foreground">
                            {m.content ? (
                              <ReactMarkdown>{m.content}</ReactMarkdown>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span className="text-xs">Thinking…</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          m.content && <span className="whitespace-pre-wrap">{m.content}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-xl px-3 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
              <div className="max-w-2xl mx-auto">
                {/* Pending attachment chips */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 px-1">
                    {attachments.map((a) => (
                      <div
                        key={a.id}
                        className="relative group rounded-xl overflow-hidden border border-border/50 bg-muted/40"
                      >
                        {a.kind === "image" ? (
                          <img src={a.dataUrl} alt={a.name} className="w-16 h-16 object-cover" />
                        ) : (
                          <div className="w-16 h-16 flex flex-col items-center justify-center text-muted-foreground p-1">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-[9px] truncate w-full text-center mt-0.5">{a.name}</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeAttachment(a.id)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-background/90 border border-border flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          aria-label="Remove attachment"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2 bg-muted/40 border border-border/50 rounded-3xl px-3 py-2 focus-within:border-primary/50 focus-within:bg-muted/60 transition-colors">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-9 h-9 shrink-0 rounded-full hover:bg-muted/70 flex items-center justify-center text-muted-foreground"
                        aria-label="Attach"
                        disabled={loading}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" className="w-52">
                      <DropdownMenuItem onClick={() => cameraInputRef.current?.click()}>
                        <Camera className="w-4 h-4 mr-2" /> Take photo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => photoInputRef.current?.click()}>
                        <ImageIcon className="w-4 h-4 mr-2" /> Photo from library
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="w-4 h-4 mr-2" /> Attach file
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Textarea
                    ref={taRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Message AI Coach…"
                    rows={1}
                    className="flex-1 min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground text-sm py-2 px-1 shadow-none"
                    disabled={loading}
                  />
                  {canSend ? (
                    <Button
                      onClick={() => send()}
                      disabled={loading}
                      size="icon"
                      className="w-9 h-9 shrink-0 gradient-primary text-primary-foreground rounded-full"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  ) : (
                    <button
                      type="button"
                      className="w-9 h-9 shrink-0 rounded-full hover:bg-muted/70 flex items-center justify-center text-muted-foreground"
                      aria-label="Voice"
                      onClick={() => toast.info("Voice input coming soon")}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  AI Coach can make mistakes. Always consult a doctor for medical concerns.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
