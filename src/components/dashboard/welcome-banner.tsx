import Link from "next/link";
import { ArrowRight, Zap, Target } from "lucide-react";

interface WelcomeBannerProps {
  userName: string;
  planName: string;
  quotaLimit: number;
  validationsUsed: number;
  isUnlimited: boolean;
}

export function WelcomeBanner({ userName, planName, quotaLimit, validationsUsed, isUnlimited }: WelcomeBannerProps) {
  const usagePercentage = isUnlimited ? 0 : Math.min(100, Math.round((validationsUsed / quotaLimit) * 100));
  const remaining = isUnlimited ? "Unlimited" : Math.max(0, quotaLimit - validationsUsed);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider border border-slate-200">
            {planName} Plan
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-lg">
          Here is an overview of your real-time validation traffic. Keep your forms protected and maintain clean lead data.
        </p>
      </div>

      <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-6 lg:border-l lg:border-slate-100 lg:pl-8">
        
        {/* Usage Stats */}
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-500 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Quota</span>
            <span className="text-slate-900">{usagePercentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FF7A00] rounded-full transition-all duration-500" 
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-medium text-right mt-1">
            <strong className="text-slate-700">{validationsUsed.toLocaleString()}</strong> / {isUnlimited ? "∞" : quotaLimit.toLocaleString()} used
          </div>
        </div>

        {/* CTA */}
        <Link 
          href="/dashboard/settings/billing" 
          className="inline-flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
        >
          <Zap className="w-4 h-4 fill-current" />
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
