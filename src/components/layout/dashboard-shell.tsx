import React from "react";
import { cn } from "@/lib/utils";

export function DashboardShell({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex flex-col relative", className)}>
      {children}
    </div>
  );
}

export function Topbar({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <header className={cn("sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8", className)}>
      {children}
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "hero";
  className?: string;
}

export function PageHeader({ title, description, action, variant = "default", className }: PageHeaderProps) {
  if (variant === "hero") {
    return (
      <div className={cn("relative bg-[#081225] text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 border-b border-white/10", className)}>
        {/* Subtle orange glow gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="heading-xl tracking-tight font-black">{title}</h1>
            {description && <p className="body-sm mt-2 text-slate-300 font-medium max-w-2xl">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8", className)}>
      <div>
        <h1 className="heading-xl tracking-tight font-black">{title}</h1>
        {description && <p className="body-sm mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function ContentContainer({ children, className, overlapHero = false }: { children: React.ReactNode, className?: string, overlapHero?: boolean }) {
  return (
    <main className={cn("flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full", overlapHero && "-mt-16 relative z-10", className)}>
      {children}
    </main>
  );
}
