"use client";

import * as React from "react";
import { getUsageAnalyticsAction } from "@/features/usage/actions";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  RotateCw, 
  TrendingUp, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Mail,
  AlertOctagon,
  UserCheck,
  Ban
} from "lucide-react";

interface TrendData {
  date: string;
  total: number;
  blocked: number;
}

interface BreakdownData {
  status: string;
  count: number;
}

interface UsageSummary {
  subscription: {
    plan: {
      name: string;
      quotaLimit: number;
    };
    extraCredits: number;
    isUnlimited: boolean;
  } | null;
  counter: {
    usedValidations: number;
  } | null;
  domainsCount: number;
  activeKeysCount: number;
}

export default function UsagePage() {
  const [days, setDays] = React.useState<number>(30);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{
    breakdown: BreakdownData[];
    trends: TrendData[];
    summary: UsageSummary;
  } | null>(null);

  const loadUsageData = async (filterDays: number) => {
    setLoading(true);
    const res = await getUsageAnalyticsAction(filterDays);
    if (res.success && res.data) {
      setData(res.data as unknown as {
        breakdown: BreakdownData[];
        trends: TrendData[];
        summary: UsageSummary;
      });
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadUsageData(days);
  }, [days]);

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-24 text-center text-slate-400">
        <RotateCw className="w-8 h-8 mx-auto animate-spin mb-4 text-[#FF7A00]" />
        <p className="text-xs font-semibold">Generating analytics report...</p>
      </div>
    );
  }

  // Fallbacks if data fails
  const trends = data?.trends || [];
  const breakdown = data?.breakdown || [];
  const summary = data?.summary || {
    subscription: null,
    counter: null,
    domainsCount: 0,
    activeKeysCount: 0
  };

  const used = summary.counter?.usedValidations ?? 0;
  const limit = summary.subscription 
    ? (summary.subscription.plan.quotaLimit + summary.subscription.extraCredits) 
    : 1000;
  const isUnlimited = summary.subscription?.isUnlimited || false;
  const percentage = isUnlimited ? 0 : Math.min(Math.round((used / limit) * 100), 100);

  // Status mappings
  const statusLabels: Record<string, { label: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string; border: string; bg: string }> = {
    VALID: { 
      label: "Valid Emails", 
      desc: "Passed all syntax, domain, and mailbox checks.",
      icon: UserCheck, 
      color: "text-emerald-700",
      border: "border-emerald-100",
      bg: "bg-emerald-50"
    },
    INVALID: { 
      label: "Invalid Syntax / TLD", 
      desc: "Rejected due to structural syntax errors or inactive top-level domains.",
      icon: AlertOctagon, 
      color: "text-rose-700",
      border: "border-rose-100",
      bg: "bg-rose-50"
    },
    DISPOSABLE: { 
      label: "Disposable / Temp Mail", 
      desc: "Blocked temporary/throwaway email providers.",
      icon: Ban, 
      color: "text-amber-700",
      border: "border-amber-100",
      bg: "bg-amber-50"
    },
    ROLE: { 
      label: "Role Accounts", 
      desc: "Group-based emails like info@, support@, admin@.",
      icon: Mail, 
      color: "text-blue-700",
      border: "border-blue-100",
      bg: "bg-blue-50"
    },
    FREE_PROVIDER: { 
      label: "Free Mailboxes", 
      desc: "Personal/free mailboxes like gmail.com, yahoo.com.",
      icon: Sparkles, 
      color: "text-indigo-700",
      border: "border-indigo-100",
      bg: "bg-indigo-50"
    },
    BLOCKLISTED: { 
      label: "Blocklisted Entries", 
      desc: "Emails/domains matching your custom workspace blocklists.",
      icon: ShieldAlert, 
      color: "text-slate-700",
      border: "border-slate-150",
      bg: "bg-slate-50"
    }
  };

  // Compute breakdown list with fallback
  const allStatuses = ["VALID", "INVALID", "DISPOSABLE", "ROLE", "FREE_PROVIDER", "BLOCKLISTED"];
  const breakdownList = allStatuses.map(status => {
    const found = breakdown.find(b => b.status === status);
    return {
      status,
      count: found ? found.count : 0,
      ...(statusLabels[status] || {
        label: status,
        desc: "Unknown classification type.",
        icon: AlertOctagon,
        color: "text-slate-700",
        border: "border-slate-100",
        bg: "bg-slate-50"
      })
    };
  }).sort((a, b) => b.count - a.count);

  const totalValidations = breakdown.reduce((sum, item) => sum + item.count, 0);
  const totalBlocked = breakdown.reduce((sum, item) => item.status !== "VALID" ? sum + item.count : sum, 0);

  // SVG Chart Dimensions & Computations
  const chartWidth = 720;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const maxVal = Math.max(...trends.map(t => t.total), 10);
  const pointsTotal = trends.map((t, idx) => {
    const x = paddingX + (idx / Math.max(trends.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (t.total / maxVal) * (chartHeight - paddingY * 2);
    return `${x},${y}`;
  }).join(" ");

  const pointsBlocked = trends.map((t, idx) => {
    const x = paddingX + (idx / Math.max(trends.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (t.blocked / maxVal) * (chartHeight - paddingY * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Usage Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Analyze validation quality trends and track your active subscription quotas.</p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                days === d
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Overview Quota Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Monthly Validation Quota</span>
              <span className="font-bold text-slate-900">{percentage}% Consumed</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF7A00] rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-lg font-black text-slate-900">
                {used.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ {isUnlimited ? "Unlimited" : limit.toLocaleString()}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Resets on first day of next month
              </span>
            </div>
          </div>
          
          <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Current Plan: <strong className="text-slate-800 font-bold">{summary.subscription?.plan.name || "Free Sandbox"}</strong></span>
            </div>
            {summary.subscription?.extraCredits ? (
              <span className="text-[10px] bg-orange-50 text-[#FF7A00] font-bold px-2 py-0.5 rounded-full border border-orange-100">
                +{summary.subscription.extraCredits.toLocaleString()} Extra Credits
              </span>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Validation Success Rate</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">
                {totalValidations > 0 ? Math.round(((totalValidations - totalBlocked) / totalValidations) * 100) : 100}%
              </span>
              <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> High Quality
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Checked</span>
              <span className="text-sm font-bold text-slate-800">{totalValidations.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Blocked Threats</span>
              <span className="text-sm font-bold text-red-600">{totalBlocked.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Validation Traffic ({days} Days)</h3>
            <p className="text-[10px] text-slate-500 font-medium">Daily trends visualizing total checks vs blocked threats.</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]" /> Total Validations
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-500" /> Blocked Threats
            </span>
          </div>
        </div>

        {trends.length > 1 ? (
          <div className="w-full overflow-x-auto pt-2">
            <div className="min-w-[720px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingY + ratio * (chartHeight - paddingY * 2);
                  const valLabel = Math.round(maxVal - ratio * maxVal);
                  return (
                    <g key={idx} className="opacity-40">
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={chartWidth - paddingX} 
                        y2={y} 
                        stroke="#E2E8F0" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={paddingX - 10} 
                        y={y + 3} 
                        fontSize="8" 
                        className="fill-slate-400 font-bold text-right"
                        textAnchor="end"
                      >
                        {valLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Total validations line */}
                <polyline
                  fill="none"
                  stroke="#FF7A00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsTotal}
                />
                
                {/* Blocked validation line */}
                <polyline
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsBlocked}
                />

                {/* Labels along X axis */}
                {trends.map((t, idx) => {
                  // Only display a subset of date labels to avoid crowding
                  const step = Math.ceil(trends.length / 7);
                  if (idx % step !== 0 && idx !== trends.length - 1) return null;
                  
                  const x = paddingX + (idx / Math.max(trends.length - 1, 1)) * (chartWidth - paddingX * 2);
                  const dateObj = new Date(t.date);
                  const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                  
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight - 4}
                      fontSize="8"
                      className="fill-slate-400 font-bold"
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-12 text-center text-slate-400">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-350" />
            <p className="text-[10px] font-semibold">Not enough historical traffic to generate trend chart.</p>
          </div>
        )}
      </div>

      {/* Breakdown grids */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Classification Breakdown</h3>
          <p className="text-[10px] text-slate-500 font-medium">Categorized validation results captured across all domains.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* List breakdown */}
          <div className="space-y-3">
            {breakdownList.map((item) => {
              const Icon = item.icon;
              const pct = totalValidations > 0 ? Math.round((item.count / totalValidations) * 100) : 0;
              return (
                <div key={item.status} className="flex items-center gap-3.5 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/20 transition-all">
                  <div className={cn("p-2 rounded-lg border", item.border, item.bg, item.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{item.label}</span>
                      <span className="text-slate-900">{item.count.toLocaleString()} <span className="text-[10px] text-slate-400 font-semibold">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", {
                          "bg-emerald-500": item.status === "VALID",
                          "bg-rose-500": item.status === "INVALID",
                          "bg-amber-500": item.status === "DISPOSABLE",
                          "bg-blue-500": item.status === "ROLE",
                          "bg-indigo-500": item.status === "FREE_PROVIDER",
                          "bg-slate-500": item.status === "BLOCKLISTED",
                        })}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details / Legends */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-4 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Glossary of Statuses</h4>
            <div className="space-y-3.5 divide-y divide-slate-100">
              {breakdownList.map((item, idx) => (
                <div key={item.status} className={cn("space-y-0.5", idx > 0 && "pt-3")}>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className={cn("w-1.5 h-1.5 rounded-full", {
                      "bg-emerald-500": item.status === "VALID",
                      "bg-rose-500": item.status === "INVALID",
                      "bg-amber-500": item.status === "DISPOSABLE",
                      "bg-blue-500": item.status === "ROLE",
                      "bg-indigo-500": item.status === "FREE_PROVIDER",
                      "bg-slate-500": item.status === "BLOCKLISTED",
                    })} />
                    {item.label}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
