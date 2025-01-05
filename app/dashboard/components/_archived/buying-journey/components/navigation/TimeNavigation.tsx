'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { TimeSegment } from "../../types";
import { cn } from "@/lib/utils";

interface TimeNavigationProps {
  viewType: 'batch' | 'week' | 'month';
  currentSegment: TimeSegment;
  segments: TimeSegment[];
  onViewTypeChange: (type: string) => void;
  onSegmentChange: (segment: TimeSegment) => void;
}

export function TimeNavigation({ 
  viewType,
  currentSegment,
  segments,
  onViewTypeChange,
  onSegmentChange 
}: TimeNavigationProps) {
  // Find current segment index
  const currentIndex = segments.findIndex(s => s.id === currentSegment.id);
  const hasPrevious = currentIndex < segments.length - 1;
  const hasNext = currentIndex > 0;

  const handlePrevious = () => {
    if (hasPrevious) {
      onSegmentChange(segments[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSegmentChange(segments[currentIndex - 1]);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-accent/5 p-1 rounded-lg">
          {(['batch', 'week', 'month'] as const).map((type) => (
            <Button
              key={type}
              variant={viewType === type ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewTypeChange(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentSegment.displayName}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className={cn(!hasPrevious && "opacity-50")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={!hasNext}
          className={cn(!hasNext && "opacity-50")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 