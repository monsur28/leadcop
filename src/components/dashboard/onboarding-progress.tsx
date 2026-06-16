import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OnboardingProgressProps {
  domainAdded: boolean;
  keyGenerated: boolean;
  scriptInstalled: boolean;
}

export function OnboardingProgress({ domainAdded, keyGenerated, scriptInstalled }: OnboardingProgressProps) {
  if (scriptInstalled) return null;

  const steps = [
    { label: "Add your domain", isComplete: domainAdded, href: "/dashboard/domains" },
    { label: "Generate API key", isComplete: keyGenerated, href: "/dashboard/api-keys" },
    { label: "Install Tracking Script", isComplete: false, href: "/dashboard/settings/installation" },
    { label: "First Validation", isComplete: false, href: "/dashboard/usage" }
  ];

  const currentStepIndex = steps.findIndex(s => !s.isComplete);
  const progress = Math.round((steps.filter(s => s.isComplete).length / steps.length) * 100);

  return (
    <div className="bg-[#0F172A] rounded-2xl p-6 shadow-md text-white flex flex-col h-full relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF7A00]/20 to-transparent rounded-bl-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-base font-bold text-white mb-2">Complete Setup</h3>
        <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
          Follow these steps to fully activate your LeadCop protection.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mb-6 overflow-hidden">
          <div className="bg-[#FF7A00] h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Steps */}
        <div className="space-y-4 mt-auto">
          {steps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={idx} className={`flex items-center gap-3 ${step.isComplete ? "opacity-50" : "opacity-100"}`}>
                {step.isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#FF7A00] flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 bg-[#FF7A00] rounded-full" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                
                <div className="flex-1">
                  <span className={`text-[13px] font-semibold ${step.isComplete ? "line-through text-slate-500" : isCurrent ? "text-white" : "text-slate-300"}`}>
                    {step.label}
                  </span>
                </div>
                
                {isCurrent && (
                  <Link href={step.href} className="px-2 py-1 bg-white/10 hover:bg-[#FF7A00] hover:text-white text-slate-300 text-[10px] font-bold uppercase rounded transition-colors flex items-center gap-1 shrink-0">
                    Go <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
