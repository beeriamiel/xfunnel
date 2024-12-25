"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
            <Link
              href={item.href}
              className={`inline-flex items-center text-sm ${
                index === items.length - 1
                  ? "text-muted-foreground"
                  : "text-foreground hover:text-muted-foreground"
              }`}
            >
              {item.icon && (
                <item.icon className="mr-2 h-4 w-4" />
              )}
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
} 