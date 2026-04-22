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
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAppData, type Injury } from "@/contexts/AppDataContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const { data, updateProfile, addInjury, removeInjury, setWorkoutPlan } = useAppData();
  const navigate = useNavigate();
  const p = data.profile;

  const [newInjury, setNewInjury] = useState<Injury>({ area: "", severity: "Mild", notes: "" });

  const handleSaveBasic = () => {
    toast.success("Basic info saved. AI will use this in your next plan.");
    setWorkoutPlan(null); // invalidate stale plan
  };
  const handleSaveMedical = () => {
    toast.success("Medical data saved. Plans and meal feedback will adapt.");
    setWorkoutPlan(null);
  };
  const handleAddInjury = () => {
    if (!newInjury.area.trim()) { toast.error("Add an injury area"); return; }
    addInjury(newInjury);
    setNewInjury({ area: "", severity: "Mild", notes: "" });
    setWorkoutPlan(null);
    toast.success("Injury added. Workout plan will be regenerated.");
  };
  const handleSaveGoals = () => {
    toast.success("Goals saved.");
    setWorkoutPlan(null);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item} className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
            <User className="w-6 h-6 text-primary" /> Health Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your data drives every AI decision</p>
        </div>
        <Button
          onClick={() => navigate("/workout")}
          variant="outline"
          className="rounded-xl border-primary/40 text-primary"
        >
          <Sparkles className="w-4 h-4 mr-2" /> Generate Plan
        </Button>
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
                  <Input className={inputClass} value={p.fullName}
                    onChange={(e) => updateProfile({ fullName: e.target.value })} />
                </FormField>
                <FormField label="Age" icon={Calendar}>
                  <Input type="number" className={inputClass} value={p.age}
                    onChange={(e) => updateProfile({ age: Number(e.target.value) })} />
                </FormField>
                <FormField label="Height (cm)" icon={Ruler}>
                  <Input type="number" className={inputClass} value={p.height}
                    onChange={(e) => updateProfile({ height: Number(e.target.value) })} />
                </FormField>
                <FormField label="Weight (kg)" icon={Scale}>
                  <Input type="number" step="0.1" className={inputClass} value={p.weight}
                    onChange={(e) => updateProfile({ weight: Number(e.target.value) })} />
                </FormField>
                <FormField label="Profession" icon={Briefcase}>
                  <Select value={p.profession} onValueChange={(v) => updateProfile({ profession: v })}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
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
                  <Select value={p.activityLevel} onValueChange={(v) => updateProfile({ activityLevel: v })}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
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
              <Button onClick={handleSaveBasic} className="gradient-primary text-primary-foreground rounded-xl mt-2">
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
                <Textarea placeholder="e.g., Diabetes Type 2, Hypertension, Asthma..." className={inputClass} rows={2}
                  value={p.chronicDiseases} onChange={(e) => updateProfile({ chronicDiseases: e.target.value })} />
              </FormField>
              <FormField label="Past Surgeries" icon={Bone}>
                <Textarea placeholder="e.g., ACL reconstruction (2023)..." className={inputClass} rows={2}
                  value={p.pastSurgeries} onChange={(e) => updateProfile({ pastSurgeries: e.target.value })} />
              </FormField>
              <FormField label="Current Medications" icon={Pill}>
                <Textarea placeholder="List current medications (optional)..." className={inputClass} rows={2}
                  value={p.medications} onChange={(e) => updateProfile({ medications: e.target.value })} />
              </FormField>
              <FormField label="Pain Areas" icon={AlertTriangle}>
                <Textarea placeholder="Describe areas of recurring pain..." className={inputClass} rows={2}
                  value={p.painAreas} onChange={(e) => updateProfile({ painAreas: e.target.value })} />
              </FormField>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Medical Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["X-Ray / CT Scans", "MRI Reports", "Medical Reports"].map((label) => (
                    <div key={label} className="border border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/20 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveMedical} className="gradient-primary text-primary-foreground rounded-xl mt-2">
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
                  {p.injuries.length} recorded
                </Badge>
              </div>

              {p.injuries.map((injury, i) => (
                <div key={i} className="p-4 rounded-xl bg-warning/5 border border-warning/15 space-y-2 relative">
                  <button
                    onClick={() => { removeInjury(i); setWorkoutPlan(null); toast.success("Injury removed"); }}
                    className="absolute top-2 right-2 p-1 rounded-lg hover:bg-muted/50"
                    aria-label="Remove"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <div className="flex items-center justify-between pr-6">
                    <span className="text-sm font-medium text-foreground">{injury.area}</span>
                    <Badge variant="outline" className={`text-[10px] ${
                      injury.severity === "Severe" ? "border-destructive/40 text-destructive"
                      : injury.severity === "Moderate" ? "border-warning/40 text-warning"
                      : "border-primary/40 text-primary"
                    }`}>{injury.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{injury.notes}</p>
                </div>
              ))}

              <div className="space-y-3 pt-2">
                <h4 className="text-sm text-foreground">Add New Injury</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Injury area (e.g., Left Knee)" className={inputClass}
                    value={newInjury.area}
                    onChange={(e) => setNewInjury({ ...newInjury, area: e.target.value })} />
                  <Select value={newInjury.severity} onValueChange={(v) => setNewInjury({ ...newInjury, severity: v as any })}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mild">Mild</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Describe the injury, how it happened, current limitations..." className={inputClass} rows={2}
                  value={newInjury.notes}
                  onChange={(e) => setNewInjury({ ...newInjury, notes: e.target.value })} />
                <div className="flex gap-3 flex-wrap">
                  <Button variant="outline" className="rounded-xl border-border text-foreground"
                    onClick={() => toast.info("Image uploads coming soon")}>
                    <Image className="w-4 h-4 mr-2" /> Upload Injury Photo
                  </Button>
                  <Button onClick={handleAddInjury} className="gradient-primary text-primary-foreground rounded-xl">
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
                <Input type="number" className={inputClass} value={p.targetWeight}
                  onChange={(e) => updateProfile({ targetWeight: Number(e.target.value) })} />
              </FormField>
              <FormField label="Timeline" icon={Calendar}>
                <Select value={p.timeline} onValueChange={(v) => updateProfile({ timeline: v })}>
                  <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="12months">12 Months</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Describe Your Goal" icon={Target}>
                <Textarea className={inputClass} rows={3}
                  value={p.goalDescription}
                  onChange={(e) => updateProfile({ goalDescription: e.target.value })} />
              </FormField>

              <Button onClick={handleSaveGoals} className="gradient-primary text-primary-foreground rounded-xl mt-2">
                <Save className="w-4 h-4 mr-2" /> Save Goals
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
