import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface WelcomeBannerProps {
  userName: string;
  planName: string;
  quotaLimit: number;
  validationsUsed: number;
  isUnlimited: boolean;
}

export function WelcomeBanner({ userName, planName, quotaLimit, validationsUsed, isUnlimited }: WelcomeBannerProps) {
  const isNearLimit = !isUnlimited && validationsUsed / quotaLimit > 0.8;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FF7A00]/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-sm text-slate-500 font-medium">
          Here is what's happening with your forms today. You are currently on the <span className="font-bold text-slate-700">{planName}</span> plan.
        </p>
      </div>

      {isNearLimit && (
        <div className="relative z-10 shrink-0 bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-4">
          <div className="p-2 bg-orange-100 text-[#FF7A00] rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Approaching Limit</p>
            <p className="text-[11px] text-slate-600 mb-1">You have used {Math.round((validationsUsed/quotaLimit)*100)}% of your quota.</p>
            <Link href="/dashboard/settings/billing" className="text-[11px] font-bold text-[#FF7A00] hover:underline flex items-center gap-1">
              Upgrade Plan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
