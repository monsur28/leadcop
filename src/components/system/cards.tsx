import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Base panel that inherits global radius, border, and background tokens.
 */
export function SystemCard({ children, className, ...props }: BaseCardProps) {
  return (
    <div 
      className={cn("bg-card rounded-2xl border border-border/80 shadow-sm transition-shadow hover:shadow-md", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * For Dashboard KPIs
 */
interface KpiCardProps extends BaseCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgClass?: string;
  iconColorClass?: string;
  trendValue?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export function KpiCard({ title, value, subtitle, icon, iconBgClass, iconColorClass, trendValue, trendDirection, className, ...props }: KpiCardProps) {
  return (
    <SystemCard className={cn("p-5 flex flex-col justify-between", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <span className="caption text-muted-foreground">{title}</span>
        {icon && (
          <div className={cn("p-1.5 rounded-lg shrink-0", iconBgClass, iconColorClass)}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="heading-lg font-black tracking-tight mb-1 text-slate-900">{value}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground font-medium">{subtitle}</p>}
        </div>
        {trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md",
            trendDirection === 'up' && "text-[#10B981] bg-[#10B981]/10",
            trendDirection === 'down' && "text-[#EF4444] bg-[#EF4444]/10",
            trendDirection === 'neutral' && "text-slate-500 bg-slate-100"
          )}>
            {trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
            {trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
            {trendDirection === 'neutral' && <Minus className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </SystemCard>
  );
}

/**
 * For general dashboard sections with a distinct header
 */
interface SectionCardProps extends BaseCardProps {
  title: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function SectionCard({ title, icon, headerAction, children, className, ...props }: SectionCardProps) {
  return (
    <SystemCard className={cn("p-6 flex flex-col", className)} {...props}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="body-sm font-bold text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </SystemCard>
  );
}
