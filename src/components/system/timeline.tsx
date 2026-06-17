import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time: string | React.ReactNode;
  icon?: React.ReactNode;
  iconBgClass?: string;
  iconColorClass?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No activity found.</p>;
  }

  return (
    <div className={cn("relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent", className)}>
      {items.map((item, idx) => (
        <div key={item.id} className="relative flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className={cn("relative z-10 w-10 h-10 flex items-center justify-center rounded-full border border-background shadow-sm", item.iconBgClass || "bg-muted", item.iconColorClass || "text-foreground")}>
              {item.icon}
            </div>
          </div>
          <div className="flex-1 pt-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <h4 className="text-sm font-bold text-foreground truncate">{item.title}</h4>
              <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{item.time}</span>
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
