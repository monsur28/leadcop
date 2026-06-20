import { Card } from "@/components/ui/card";
import { CopyIcon, ExternalLink } from "lucide-react";

interface HeroSectionProps {
  userName: string;
  planName: string;
  validationsUsed: number;
  quotaLimit: number;
  blockedCount: number;
}

export function DashboardHero({ userName, planName, validationsUsed, quotaLimit, blockedCount }: HeroSectionProps) {
  const percentage = Math.min(100, Math.round((validationsUsed / quotaLimit) * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#081225] text-white shadow-xl border border-[#1E293B]">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#FF7A00] opacity-20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-500 opacity-10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative p-8 md:p-10 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Welcome back, {userName}
          </h1>
          <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
            Your workspace is active on the <span className="text-primary font-medium">{planName}</span> plan. 
            LeadCop has protected your forms from <strong className="text-white font-medium">{blockedCount.toLocaleString()}</strong> bad leads so far.
          </p>
        </div>

        {/* Mini KPI Cards overlapping the hero */}
        <div className="flex gap-4 self-stretch lg:self-auto w-full lg:w-auto">
           <div className="flex-1 lg:w-56 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md shadow-2xl">
             <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Quota Used</div>
             <div className="flex items-baseline gap-2 mb-3">
               <span className="text-3xl font-semibold text-white tracking-tight">{validationsUsed.toLocaleString()}</span>
               <span className="text-sm text-slate-500 font-medium">/ {quotaLimit.toLocaleString()}</span>
             </div>
             <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary rounded-full transition-all duration-1000" 
                 style={{ width: `${percentage}%` }}
               />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
