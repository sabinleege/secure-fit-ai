import { motion } from "framer-motion";
import { useState } from "react";
import {
  User,
  Heart,
  AlertTriangle,
  Target,
  Upload,
  Save,
  Briefcase,
  Ruler,
  Scale,
  Calendar,
  Activity,
  Pill,
  Bone,
  FileText,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function FormField({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-foreground flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-primary" /> {label}
      </Label>
      {children}
    </div>
  );
}

const inputClass = "bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground";

export default function ProfilePage() {
  const [injuries, setInjuries] = useState([
    { area: "Right Shoulder", severity: "Moderate", notes: "Rotator cuff strain — avoid overhead press" },
    { area: "Lower Back", severity: "Mild", notes: "Occasional discomfort after prolonged sitting" },
  ]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
          <User className="w-6 h-6 text-primary" /> Health Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Your complete health data drives all AI decisions</p>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="glass-card w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="basic" className="rounded-xl text-xs">Basic</TabsTrigger>
            <TabsTrigger value="medical" className="rounded-xl text-xs">Medical</TabsTrigger>
            <TabsTrigger value="injuries" className="rounded-xl text-xs">Injuries</TabsTrigger>
            <TabsTrigger value="goals" className="rounded-xl text-xs">Goals</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground text-sm">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name" icon={User}>
                  <Input placeholder="John Doe" className={inputClass} defaultValue="Ahmed Hassan" />
                </FormField>
                <FormField label="Age" icon={Calendar}>
                  <Input type="number" placeholder="25" className={inputClass} defaultValue="28" />
                </FormField>
                <FormField label="Height (cm)" icon={Ruler}>
                  <Input type="number" placeholder="175" className={inputClass} defaultValue="178" />
                </FormField>
                <FormField label="Weight (kg)" icon={Scale}>
                  <Input type="number" placeholder="80" className={inputClass} defaultValue="81.8" />
                </FormField>
                <FormField label="Profession" icon={Briefcase}>
                  <Select defaultValue="office">
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office Worker</SelectItem>
                      <SelectItem value="athlete">Athlete</SelectItem>
                      <SelectItem value="soldier">Military / Soldier</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="labor">Physical Labor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Activity Level" icon={Activity}>
                  <Select defaultValue="moderate">
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Lightly Active</SelectItem>
                      <SelectItem value="moderate">Moderately Active</SelectItem>
                      <SelectItem value="very">Very Active</SelectItem>
                      <SelectItem value="extreme">Extremely Active</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity mt-2">
                <Save className="w-4 h-4 mr-2" /> Save Basic Info
              </Button>
            </div>
          </TabsContent>

          {/* Medical Data */}
          <TabsContent value="medical" className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" /> Medical History
              </h3>
              <FormField label="Chronic Diseases" icon={Heart}>
                <Textarea
                  placeholder="e.g., Diabetes Type 2, Hypertension, Asthma..."
                  className={inputClass}
                  rows={2}
                />
              </FormField>
              <FormField label="Past Surgeries" icon={Bone}>
                <Textarea
                  placeholder="e.g., ACL reconstruction (2023), Appendectomy (2020)..."
                  className={inputClass}
                  rows={2}
                />
              </FormField>
              <FormField label="Current Medications" icon={Pill}>
                <Textarea
                  placeholder="List any medications you're currently taking (optional)..."
                  className={inputClass}
                  rows={2}
                />
              </FormField>
              <FormField label="Pain Areas" icon={AlertTriangle}>
                <Textarea
                  placeholder="Describe any areas of recurring pain or discomfort..."
                  className={inputClass}
                  rows={2}
                />
              </FormField>

              {/* Document Uploads */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Medical Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["X-Ray / CT Scans", "MRI Reports", "Medical Reports"].map((label) => (
                    <div
                      key={label}
                      className="border border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity mt-2">
                <Save className="w-4 h-4 mr-2" /> Save Medical Data
              </Button>
            </div>
          </TabsContent>

          {/* Injuries */}
          <TabsContent value="injuries" className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> Injury Details
                </h3>
                <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                  {injuries.length} recorded
                </Badge>
              </div>

              {injuries.map((injury, i) => (
                <div key={i} className="p-4 rounded-xl bg-warning/5 border border-warning/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{injury.area}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        injury.severity === "Severe"
                          ? "border-destructive/40 text-destructive"
                          : injury.severity === "Moderate"
                          ? "border-warning/40 text-warning"
                          : "border-primary/40 text-primary"
                      }`}
                    >
                      {injury.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{injury.notes}</p>
                </div>
              ))}

              <div className="space-y-3 pt-2">
                <h4 className="text-sm text-foreground">Add New Injury</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Injury area (e.g., Left Knee)" className={inputClass} />
                  <Select>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Describe the injury, how it happened, current limitations..." className={inputClass} rows={2} />
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl border-border text-foreground">
                    <Image className="w-4 h-4 mr-2" /> Upload Injury Photo
                  </Button>
                  <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                    Add Injury
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Goals */}
          <TabsContent value="goals" className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Fitness Goals
              </h3>
              <FormField label="Target Weight (kg)" icon={Scale}>
                <Input type="number" placeholder="75" className={inputClass} defaultValue="75" />
              </FormField>
              <FormField label="Timeline" icon={Calendar}>
                <Select defaultValue="6months">
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="12months">12 Months</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Describe Your Goal" icon={Target}>
                <Textarea
                  placeholder="What does your ideal body and health look like? (e.g., 'lose belly fat, improve posture, build lean muscle without aggravating my shoulder injury')"
                  className={inputClass}
                  rows={3}
                  defaultValue="Lose body fat, improve posture from desk work, and build lean muscle safely around my shoulder injury."
                />
              </FormField>

              {/* Milestones */}
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium text-foreground">AI-Generated Milestones</h4>
                {[
                  { week: "Week 4", goal: "Reach 80 kg, establish workout consistency" },
                  { week: "Week 8", goal: "Reach 78 kg, improve fitness score to 80+" },
                  { week: "Week 12", goal: "Reach 76 kg, full shoulder mobility" },
                  { week: "Week 24", goal: "Reach 75 kg target, maintain 90%+ consistency" },
                ].map((milestone) => (
                  <div key={milestone.week} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Target className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{milestone.week}</p>
                      <p className="text-xs text-muted-foreground">{milestone.goal}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="gradient-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity mt-2">
                <Save className="w-4 h-4 mr-2" /> Save Goals
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
