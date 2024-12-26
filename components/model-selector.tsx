import { AIModelType } from "@/lib/services/ai/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModelSelectorProps {
  value: AIModelType;
  onChange: (value: AIModelType) => void;
  label: string;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, label, disabled = false }: ModelSelectorProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="chatgpt-4o-latest">GPT-4 Latest</SelectItem>
          <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 