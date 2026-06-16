"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentStep: number;
  steps: { id: string; title: string }[];
}

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0">
          <div 
            className="h-full bg-[#FF7A00] transition-all duration-500 rounded-full"
            style={{ width: `${(Math.max(0, currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                  isCompleted 
                    ? "bg-[#FF7A00] border-[#FF7A00] text-white" 
                    : isCurrent
                      ? "bg-white border-[#FF7A00] text-[#FF7A00] ring-4 ring-[#FF7A00]/10"
                      : "bg-white border-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              {/* Desktop: Show all labels */}
              <span className={cn(
                "absolute top-10 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:block",
                isCurrent ? "text-slate-900" : "text-slate-400"
              )}>
                {step.title}
              </span>
              
              {/* Mobile: Show only current label */}
              <span className={cn(
                "absolute top-10 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap sm:hidden",
                isCurrent ? "text-slate-900 block" : "hidden"
              )}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
