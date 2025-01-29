'use client'

import { ExternalLink } from "lucide-react"
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface RelevantLink {
  url: string;
  title?: string;
  snippet?: string;
  source?: string;
}

interface RelevantLinksProps {
  links?: RelevantLink[];
}

export function RelevantLinks({ links }: RelevantLinksProps) {
  if (!links?.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Relevant Links ({links.length})</h4>
      <div className="space-y-2">
        {links.map((link, index) => (
          <HoverCard key={index}>
            <HoverCardTrigger asChild>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {link.title || link.url}
              </a>
            </HoverCardTrigger>
            {link.snippet && (
              <HoverCardContent className="w-80">
                <p className="text-sm">{link.snippet}</p>
                {link.source && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Source: {link.source}
                  </p>
                )}
              </HoverCardContent>
            )}
          </HoverCard>
        ))}
      </div>
    </div>
  );
} 