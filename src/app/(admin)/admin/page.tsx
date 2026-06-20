import * as React from "react";
import { AdminRepository } from "@/features/admin/repository";
import { PlanRepository } from "@/features/plans/repository";
import { 
  Users, 
  Layers, 
  Globe, 
  DollarSign,
  Activity,
  CreditCard,
  Key,
  ShieldCheck,
  Server,
  Zap,
  Clock,
  AlertTriangle,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { AdminPendingRequestsClient } from "@/components/admin/admin-pending-requests-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RevenueChart, GrowthChart, MetricBarChart, DistributionChart } from "@/components/system/charts";
import { KpiCard, SectionCard } from "@/components/system/cards";
import { PageHeader, DashboardShell, ContentContainer } from "@/components/layout/dashboard-shell";
import { Timeline, TimelineItem } from "@/components/system/timeline";
import { Icon } from "@/components/system/icons";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.globalRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, plans] = await Promise.all([
    AdminRepository.getOverviewStats(),
    PlanRepository.getAllPlans()
  ]);

  const { kpis, charts, operations, health } = stats as any;

  const kpiCards = [
    { name: "Total Users", value: kpis.totalUsers, change: "Registered accounts", icon: <Icon icon={Users} sizeVariant="sm" />, color: "text-blue-600", bg: "bg-blue-50", trendValue: "+12%", trendDirection: "up" as const },
    { name: "Active Subscriptions", value: kpis.activeSubscriptionsCount, change: "Paying users", icon: <Icon icon={CreditCard} sizeVariant="sm" />, color: "text-emerald-600", bg: "bg-emerald-50", trendValue: "+4%", trendDirection: "up" as const },
    { name: "Monthly Revenue", value: `$${kpis.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "This month (MRR)", icon: <Icon icon={DollarSign} sizeVariant="sm" />, color: "text-purple-600", bg: "bg-purple-50", trendValue: "+18%", trendDirection: "up" as const },
    { name: "Protected Websites", value: kpis.totalDomains, change: "Domains registered", icon: <Icon icon={Globe} sizeVariant="sm" />, color: "text-primary", bg: "bg-primary/10", trendValue: "+2%", trendDirection: "up" as const },
    { name: "API Requests Today", value: kpis.apiRequestsToday.toLocaleString(), change: "Validations processed", icon: <Icon icon={Zap} sizeVariant="sm" />, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Requests This Month", value: kpis.apiRequestsThisMonth.toLocaleString(), change: "Rolling 30 days", icon: <Icon icon={Activity} sizeVariant="sm" />, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const getActivityIconProps = (type: string) => {
    switch(type) {
      case "USER_REGISTERED": return { icon: <Icon icon={Users} sizeVariant="sm" />, iconColorClass: "text-blue-600", iconBgClass: "bg-blue-50" };
      case "WEBSITE_ADDED": return { icon: <Icon icon={Globe} sizeVariant="sm" />, iconColorClass: "text-primary", iconBgClass: "bg-primary/10" };
      case "API_KEY_CREATED": return { icon: <Icon icon={Key} sizeVariant="sm" />, iconColorClass: "text-emerald-600", iconBgClass: "bg-emerald-50" };
      case "SUBSCRIPTION_PURCHASED": return { icon: <Icon icon={CreditCard} sizeVariant="sm" />, iconColorClass: "text-purple-600", iconBgClass: "bg-purple-50" };
      default: return { icon: <Icon icon={Activity} sizeVariant="sm" />, iconColorClass: "text-slate-600", iconBgClass: "bg-slate-100" };
    }
  };

  const timelineItems: TimelineItem[] = operations.activityFeed.map((activity: any) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    time: new Date(activity.createdAt).toLocaleString(),
    ...getActivityIconProps(activity.type)
  }));

  return (
    <DashboardShell>
      <PageHeader 
        title="Executive Dashboard" 
        description="Real-time metrics, revenue, and system health."
        variant="hero"
      />

      <ContentContainer overlapHero={true} className="space-y-8 pb-10">
        {/* SECTION 1 - KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((stat, idx) => (
          <KpiCard 
            key={idx}
            title={stat.name}
            value={stat.value}
            subtitle={stat.change}
            icon={stat.icon}
            iconColorClass={stat.color}
            iconBgClass={stat.bg}
            trendValue={stat.trendValue}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      {/* SECTION 2 - ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Revenue Trend (30 Days)" icon={<DollarSign className="w-4 h-4 text-emerald-500" />}>
          <RevenueChart data={charts.revenueTrend} />
        </SectionCard>
        
        <SectionCard title="User Growth (30 Days)" icon={<Users className="w-4 h-4 text-blue-500" />}>
          <GrowthChart data={charts.userGrowth} />
        </SectionCard>
      </div>

      {/* SECTION 3 - OPERATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Pending Upgrade Requests" icon={<Clock className="w-4 h-4 text-purple-500" />}>
          <AdminPendingRequestsClient pendingRequests={operations.pendingRequests} plans={plans} />
        </SectionCard>

        <SectionCard title="Recent Activity Feed" icon={<Icon icon={Activity} sizeVariant="sm" className="text-primary" />}>
          <Timeline items={timelineItems} />
        </SectionCard>
      </div>

      {/* SECTION 4 - BUSINESS INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Top Plans" icon={<Layers className="w-4 h-4 text-purple-500" />}>
          <MetricBarChart data={charts.topPlans} dataKey="value" fill="#8b5cf6" valueLabel="Subscribers" />
        </SectionCard>
        <SectionCard title="Revenue By Plan" icon={<DollarSign className="w-4 h-4 text-[#FF7A00]" />}>
          <MetricBarChart data={charts.revenueByPlan} dataKey="revenue" fill="#FF7A00" valueLabel="Revenue" isCurrency={true} />
        </SectionCard>
        <SectionCard title="Subscription Distribution" icon={<CreditCard className="w-4 h-4 text-indigo-500" />}>
          <DistributionChart data={charts.topPlans} />
        </SectionCard>
      </div>

      {/* SECTION 5 - SYSTEM HEALTH */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl text-white">
        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" /> System Health & API Metrics
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase">API Status</span>
            </div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              {health.apiStatus}
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase">Avg Response</span>
            </div>
            <div className="text-xl font-bold text-slate-500 text-sm">N/A</div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <AlertTriangle className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase">Failed Requests</span>
            </div>
            <div className="text-xl font-bold text-slate-500 text-sm">N/A</div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase">Rate Limited</span>
            </div>
            <div className="text-xl font-bold text-slate-500 text-sm">N/A</div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase">Success Rate</span>
            </div>
            <div className="text-xl font-bold text-white">{health.validationSuccessRate.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      </ContentContainer>
    </DashboardShell>
  );
}
export const dynamic = "force-dynamic";
