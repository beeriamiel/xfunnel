"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuestionPromptSelectorProps {
  selectedSystemPrompt: string | undefined;
  selectedUserPrompt: string | undefined;
  onSystemPromptSelect: (promptName: string) => void;
  onUserPromptSelect: (promptName: string) => void;
  prompts: Array<{ id: number; name: string; }>;
  disabled?: boolean;
}

export function QuestionPromptSelector({
  selectedSystemPrompt,
  selectedUserPrompt,
  onSystemPromptSelect,
  onUserPromptSelect,
  prompts,
  disabled
}: QuestionPromptSelectorProps) {
  const systemPrompts = prompts.filter(p => p.name.toLowerCase().includes('system'));
  const userPrompts = prompts.filter(p => p.name.toLowerCase().includes('user'));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">System Prompt</label>
        <Select
          value={selectedSystemPrompt}
          onValueChange={onSystemPromptSelect}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select system prompt" />
          </SelectTrigger>
          <SelectContent>
            {systemPrompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.name}>
                {prompt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">User Prompt</label>
        <Select
          value={selectedUserPrompt}
          onValueChange={onUserPromptSelect}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user prompt" />
          </SelectTrigger>
          <SelectContent>
            {userPrompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.name}>
                {prompt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 