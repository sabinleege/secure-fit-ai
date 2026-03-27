import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadButtonProps {
  icon: LucideIcon;
  label: string;
  accept: string;
  onFileSelected?: (file: File, preview: string) => void;
  variant?: "outline" | "default";
  className?: string;
}

export function FileUploadButton({
  icon: Icon,
  label,
  accept,
  onFileSelected,
  variant = "outline",
  className = "",
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = accept.includes("video") ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${accept.includes("video") ? "100MB" : "10MB"}`);
      return;
    }

    const preview = URL.createObjectURL(file);
    setSelected(true);
    toast.success(`${file.name} selected`);
    onFileSelected?.(file, preview);

    // Reset after 3s visual feedback
    setTimeout(() => setSelected(false), 3000);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <Button
        variant={variant}
        className={`rounded-xl border-border text-foreground ${selected ? "border-success/40 text-success" : ""} ${className}`}
        onClick={handleClick}
      >
        {selected ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Icon className="w-4 h-4 mr-2" />}
        {selected ? "Selected" : label}
      </Button>
    </>
  );
}
