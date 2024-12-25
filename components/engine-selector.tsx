"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { EngineSelection } from "@/app/company-actions";

interface EngineSelectorProps {
  engines: EngineSelection;
  onChange: (engines: EngineSelection) => void;
  disabled?: boolean;
}

export function EngineSelector({
  engines,
  onChange,
  disabled = false
}: EngineSelectorProps) {
  function handleEngineToggle(engine: keyof EngineSelection) {
    // Prevent disabling all engines
    const wouldAllBeDisabled = Object.entries(engines).every(
      ([key, value]) => key === engine ? !value : !value
    );

    if (wouldAllBeDisabled) {
      return;
    }

    onChange({
      ...engines,
      [engine]: !engines[engine]
    });
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium mb-4">Select Engines</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="openai"
              checked={engines.openai}
              onCheckedChange={() => handleEngineToggle('openai')}
              disabled={disabled}
            />
            <Label htmlFor="openai">OpenAI</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="claude"
              checked={engines.claude}
              onCheckedChange={() => handleEngineToggle('claude')}
              disabled={disabled}
            />
            <Label htmlFor="claude">Claude</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="gemini"
              checked={engines.gemini}
              onCheckedChange={() => handleEngineToggle('gemini')}
              disabled={disabled}
            />
            <Label htmlFor="gemini">Gemini</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="perplexity"
              checked={engines.perplexity}
              onCheckedChange={() => handleEngineToggle('perplexity')}
              disabled={disabled}
            />
            <Label htmlFor="perplexity">Perplexity</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="google_search"
              checked={engines.google_search}
              onCheckedChange={() => handleEngineToggle('google_search')}
              disabled={disabled}
            />
            <Label htmlFor="google_search">Google Search</Label>
          </div>
        </div>
      </div>
    </Card>
  );
} 