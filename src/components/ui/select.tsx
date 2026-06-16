"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, children, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 transition-all outline-none",
              "focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]/50",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {helperText && (
          <p className="text-xs text-slate-500 font-medium">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
