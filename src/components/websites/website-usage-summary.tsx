"use client";

import { Activity, Target } from "lucide-react";

interface WebsiteUsageSummaryProps {
  validationsThisMonth: number;
  totalQuota: number;
  isUnlimited: boolean;
}

export function WebsiteUsageSummary({ validationsThisMonth, totalQuota, isUnlimited }: WebsiteUsageSummaryProps) {
  const usagePercentage = isUnlimited ? 0 : Math.min(100, Math.round((validationsThisMonth / totalQuota) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Usage</h3>
          <p className="text-[11px] text-slate-500 font-medium">Validations performed by this website this month.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Month Usage</span>
          <span className="text-sm font-black text-slate-900">{validationsThisMonth.toLocaleString()}</span>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500 flex items-center gap-1.5"><Target className="w-3 h-3" /> Account Quota</span>
            <span className="text-slate-900">{usagePercentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-medium text-right mt-1">
            Account Total: {isUnlimited ? "∞" : totalQuota.toLocaleString()} limit
          </div>
        </div>
      </div>
    </div>
  );
}
