"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface StepSuccessProps {
  onComplete: () => void;
}

export function StepSuccess({ onComplete }: StepSuccessProps) {
  // Simple CSS-only confetti effect or just a nice bounce animation.
  useEffect(() => {
    // Optionally trigger a confetti library here if added later.
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
        <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10 drop-shadow-md" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
        You're All Set!
      </h1>
      
      <p className="text-slate-500 font-medium leading-relaxed mb-8">
        LeadCop is now actively monitoring your forms. Any invalid or fake leads will be automatically blocked, keeping your CRM clean and your sales team happy.
      </p>
      
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 w-full text-left space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Next Steps</h4>
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <span>Monitor blocked leads in your Usage dashboard.</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <span>Customize block behavior in Domain Settings.</span>
        </div>
      </div>

      <Button 
        onClick={onComplete}
        className="w-full h-14 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-base font-bold rounded-xl transition-all shadow-lg shadow-[#FF7A00]/25 hover:shadow-xl hover:-translate-y-0.5 group"
      >
        Go to Dashboard <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
