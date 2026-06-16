import { getDashboardOverviewAction } from "@/features/usage/actions";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { 
  Globe, 
  Key, 
  AlertTriangle, 
  Layers, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const res = await getDashboardOverviewAction();
  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold bg-red-50 border border-red-200 rounded-2xl">
        Failed to load dashboard overview. Please check your credentials and try again.
      </div>
    );
  }

  const {
    subscription,
    counter,
    domainsCount,
    verifiedDomainsCount,
    activeKeysCount,
    blockedCount,
    recentLogs
  } = res.data;

  const planName = subscription?.plan?.name || "Free Sandbox";
  const quotaLimit = subscription ? (subscription.plan.quotaLimit + subscription.extraCredits) : 1000;
  const validationsUsed = counter?.usedValidations || 0;

  // 7. Calculate Onboarding steps state
  const onboardingState = {
    domainAdded: domainsCount > 0,
    domainVerified: verifiedDomainsCount > 0,
    keyGenerated: activeKeysCount > 0,
    scriptInstalled: recentLogs.length > 0 || blockedCount > 0
  };

  // Mock past 7 days validation stats for dynamic chart visualization
  const chartData = [
    { day: "Mon", total: 120, blocked: 18 },
    { day: "Tue", total: 150, blocked: 22 },
    { day: "Wed", total: 190, blocked: 35 },
    { day: "Thu", total: 160, blocked: 14 },
    { day: "Fri", total: 210, blocked: 42 },
    { day: "Sat", total: 95, blocked: 8 },
    { day: "Sun", total: 110, blocked: 15 },
  ];

  const statCards = [
    {
      title: "Current Plan",
      value: planName,
      sub: `Quota resets on ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}`,
      icon: Layers,
      color: "text-blue-600 bg-blue-50"
    },
    {
      title: "Validations Used",
      value: `${validationsUsed.toLocaleString()} / ${subscription?.isUnlimited ? "Unlimited" : quotaLimit.toLocaleString()}`,
      sub: `${Math.round((validationsUsed / quotaLimit) * 100)}% of monthly quota consumed`,
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-50"
    },
    {
      title: "Protected Domains",
      value: `${domainsCount} Registered`,
      sub: `${verifiedDomainsCount} active & verified hostnames`,
      icon: Globe,
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "Active API Keys",
      value: `${activeKeysCount} Keys`,
      sub: "API tokens restricted by domain origins",
      icon: Key,
      color: "text-indigo-600 bg-indigo-50"
    },
    {
      title: "Blocked Leads",
      value: blockedCount.toLocaleString(),
      sub: "Fake or invalid leads prevented from CRM",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Onboarding checklist */}
      <OnboardingChecklist stepsState={onboardingState} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color} shrink-0`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">{card.value}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trend Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Validation Trends</h3>
              <p className="text-xs text-slate-500 font-medium">Daily request metrics over the past week.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" /> Total Validations</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Blocked Junk</span>
            </div>
          </div>

          {/* Simple Inline SVG Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between px-2 pt-4">
            {chartData.map((data, index) => {
              const maxVal = 250;
              const totalHeight = `${(data.total / maxVal) * 100}%`;
              const blockedHeight = `${(data.blocked / maxVal) * 100}%`;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="relative w-8 h-full flex flex-col justify-end gap-1">
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-2 whitespace-nowrap z-10 shadow">
                      Total: {data.total} | Blocked: {data.blocked}
                    </div>
                    {/* Total Bar */}
                    <div 
                      className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 w-full rounded-t-md relative flex flex-col justify-end overflow-hidden hover:bg-[#FF7A00]/20 transition-colors cursor-pointer"
                      style={{ height: totalHeight }}
                    >
                      {/* Blocked Inner Bar */}
                      <div 
                        className="bg-[#FF7A00] w-full rounded-t-sm"
                        style={{ height: blockedHeight }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Validations</h3>
              <Link href="/dashboard/usage" className="text-xs font-semibold text-[#FF7A00] hover:underline flex items-center gap-0.5">
                View logs <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="overflow-hidden leading-snug">
                      <p className="font-mono text-slate-900 truncate font-semibold">{log.validatedDomain}</p>
                      <p className="text-[10px] text-slate-400 font-medium">via {log.domain.hostname}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase shrink-0 ${
                      log.status === "VALID"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-500" />
                  <p className="text-xs font-semibold">No activity logs recorded yet.</p>
                  <p className="text-[10px] leading-relaxed text-slate-500 max-w-[200px] mx-auto mt-1">Install the verification script on your website to begin scanning.</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link href="/dashboard/domains" className="p-2 border border-slate-200 hover:border-[#FF7A00]/40 rounded-xl flex items-center gap-1.5 transition-all text-slate-700 bg-white">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Add Domain
              </Link>
              <Link href="/dashboard/api-keys" className="p-2 border border-slate-200 hover:border-[#FF7A00]/40 rounded-xl flex items-center gap-1.5 transition-all text-slate-700 bg-white">
                <Key className="w-3.5 h-3.5 text-slate-400" /> Generate Key
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
