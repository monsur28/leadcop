import { redirect } from "next/navigation";
import { getDashboardOverviewAction } from "@/features/usage/actions";
import { DashboardHero } from "@/components/dashboard/hero-section";
import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { ValidationChart } from "@/components/dashboard/validation-chart";
import { RecentValidations } from "@/components/dashboard/recent-validations";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const res = await getDashboardOverviewAction();
  if (!res.success || !res.data) {
    return (
      <div className="p-6 text-center text-danger text-sm font-semibold bg-dangerGhost border border-danger/20 rounded-2xl">
        Failed to load dashboard overview. Please check your credentials and try again.
      </div>
    );
  }

  const {
    subscription,
    counter,
    domainsCount,
    activeKeysCount,
    blockedCount,
    recentLogs,
    trends,
    totalValidationsCount,
    recentDomains,
    recentKeys
  } = res.data as any; // Type casting as we added it recently

  // Progressive Onboarding Logic
  const onboardingCompleted = domainsCount > 0 && activeKeysCount > 0;

  if (!onboardingCompleted) {
    redirect("/onboarding");
  }

  const planName = subscription?.plan?.name || "Free Sandbox";
  const quotaLimit = subscription ? (subscription.plan.quotaLimit + subscription.extraCredits) : 1000;
  const validationsUsed = counter?.usedValidations ?? 0;

  const activeDomainHostname = recentDomains?.[0]?.hostname || "Not configured";
  const activeApiKey = recentKeys?.[0]?.prefix ? `${recentKeys[0].prefix}****************` : "Not configured";

  return (
    <div className="space-y-6 pb-12 w-full">
      <DashboardHero 
        userName={session.user.name?.split(' ')[0] || "User"}
        planName={planName}
        validationsUsed={validationsUsed}
        quotaLimit={quotaLimit}
        blockedCount={blockedCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Data Column (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <ValidationChart data={trends} />
          <RecentValidations logs={recentLogs} />
        </div>
        
        {/* Right Actions Column (Span 4) */}
        <div className="lg:col-span-4 sticky top-6">
          <QuickActionsPanel activeDomain={activeDomainHostname} apiKey={activeApiKey} />
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
