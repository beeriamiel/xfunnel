import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function AnimatedProgress({ progress }: { progress: number }) {
  const [width, setWidth] = useState(0);

  const barWidth = 2;
  const gap = 2;

  const bars = Math.floor(width / (barWidth + gap));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWidth(containerRef.current?.offsetWidth ?? 0);
  }, []);

  const [shouldUseValue, setShouldUseValue] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShouldUseValue(true);
    }, 250);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[12px] w-full min-w-4 flex-wrap gap-[2px] overflow-hidden"
    >
      {Array.from(Array(bars)).map((_, index) => {
        const highlight = shouldUseValue ? index / bars < progress / 100 : 0;
        return (
          <div
            className={cn("h-full w-[2px] rounded-[1px] transition-all", {
              "bg-gradient-to-r from-blue-300 via-blue-500 to-purple-500 duration-75": highlight,
              "bg-zinc-900/10 duration-300 group-hover:scale-75 group-hover:bg-zinc-900/5 group-active:scale-75 group-active:bg-zinc-900/5":
                !highlight,
            })}
            style={{
              transitionDelay: highlight ? `${index * 24}ms` : "0ms",
            }}
            key={`bar_${index}`}
          />
        );
      })}
    </div>
  );
}
