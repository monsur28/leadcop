"use client";

import { TrendingUp, Globe, Key, ShieldAlert } from "lucide-react";

interface KPICardsProps {
  validationsUsed: number;
  quotaLimit: number;
  isUnlimited: boolean;
  domainsCount: number;
  activeKeysCount: number;
  blockedCount: number;
}

export function KPICards({ validationsUsed, quotaLimit, isUnlimited, domainsCount, activeKeysCount, blockedCount }: KPICardsProps) {
  const usagePercentage = isUnlimited ? 0 : Math.round((validationsUsed / quotaLimit) * 100);

  const cards = [
    {
      title: "Validations Used",
      value: validationsUsed.toLocaleString(),
      sub: isUnlimited ? "Unlimited Quota" : `${usagePercentage}% of monthly limit`,
      icon: TrendingUp,
      accent: "text-[#FF7A00]",
      bg: "bg-[#FFF4E8]",
      trend: "+12% this week" // Simulated trend
    },
    {
      title: "Protected Domains",
      value: domainsCount.toLocaleString(),
      sub: "Active hostnames",
      icon: Globe,
      accent: "text-blue-600",
      bg: "bg-blue-50",
      trend: "All systems active"
    },
    {
      title: "Active API Keys",
      value: activeKeysCount.toLocaleString(),
      sub: "Tokens in use",
      icon: Key,
      accent: "text-indigo-600",
      bg: "bg-indigo-50",
      trend: "Secure & rotated"
    },
    {
      title: "Blocked Leads",
      value: blockedCount.toLocaleString(),
      sub: "Junk prevented",
      icon: ShieldAlert,
      accent: "text-rose-600",
      bg: "bg-rose-50",
      trend: "Saving your CRM"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group flex flex-col justify-between h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
            <div className={`p-2 rounded-lg ${card.bg} ${card.accent} shrink-0 group-hover:scale-110 transition-transform duration-200`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">{card.sub}</span>
              <span className="text-slate-400 font-semibold">{card.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
